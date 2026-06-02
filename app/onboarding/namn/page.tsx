import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import NameForm from "./form";

export default async function NamnPage() {
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
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  // Idempotent: name already set → done.
  if (profile?.display_name && profile.display_name.trim().length > 0) {
    redirect("/app");
  }

  return <NameForm />;
}
