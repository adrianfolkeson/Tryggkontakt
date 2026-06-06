import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import SnabbnoteringForm from "./form";

export default async function SnabbnoteringPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { data: membership } = await supabase
    .from("circle_member")
    .select("circle_id, role")
    .eq("user_id", user.id)
    .is("valid_to", null)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/app");
  }

  const isRelative = membership.role === "relative";

  const { data: prefs } = await supabase
    .from("profile_public")
    .select("default_relatives_only")
    .eq("user_id", user.id)
    .maybeSingle();
  const defaultRelativesOnly = prefs?.default_relatives_only ?? false;

  return (
    <SnabbnoteringForm
      isRelative={isRelative}
      defaultRelativesOnly={defaultRelativesOnly}
    />
  );
}
