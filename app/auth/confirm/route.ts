import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const nextParam = url.searchParams.get("next");

  // Validate next: must be a same-origin relative path. Reject
  // protocol-relative ("//evil") and absolute URLs to prevent
  // open-redirect via the magic-link callback.
  const successPath =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/app";

  // Build the success response up front so the Supabase client's
  // cookie writes land directly on the redirect we return. Using
  // next/headers cookies().set() here would not propagate to
  // NextResponse.redirect() in a Next 16 route handler — that's why
  // we don't go through lib/supabase/server.ts here.
  const successResponse = NextResponse.redirect(
    new URL(successPath, request.url),
  );

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            successResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return successResponse;
    }
    return NextResponse.redirect(new URL("/sign-in?error=1", request.url));
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return successResponse;
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=1", request.url));
}
