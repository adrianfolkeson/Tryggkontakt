import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import BjudInForm from "./form";

export default async function BjudInPage() {
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
  if (membership.role !== "relative") {
    redirect("/app/krets");
  }

  return <BjudInForm />;
}
