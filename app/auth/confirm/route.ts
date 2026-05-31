import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  // PKCE flow (Supabase cloud magic-link default): the verify
  // endpoint redirects here with ?code=… instead of ?token_hash=….
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.redirect(
      new URL("/sign-in?error=1", request.url),
    );
  }

  // OTP flow (local Supabase + older magic-link templates).
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=1", request.url));
}
