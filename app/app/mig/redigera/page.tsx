import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import RedigeraForm from "./form";

export default async function RedigeraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();
  if (!membership) {
    redirect("/app");
  }

  const { data: profile } = await supabase
    .from("profile_public")
    .select("display_name, phone_number")
    .eq("user_id", user.id)
    .maybeSingle();

  const display = profile?.display_name ?? "";
  const firstSpace = display.indexOf(" ");
  const initialFirstName =
    firstSpace === -1 ? display : display.slice(0, firstSpace);
  const initialLastName =
    firstSpace === -1 ? "" : display.slice(firstSpace + 1);

  return (
    <RedigeraForm
      initialFirstName={initialFirstName}
      initialLastName={initialLastName}
      initialPhone={profile?.phone_number ?? ""}
    />
  );
}
