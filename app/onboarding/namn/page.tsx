import { redirect } from "next/navigation";

// Stub: in-flight magic links may still carry the old next=/onboarding/namn
// query. Redirect to the new canonical onboarding route.
export default function NamnRedirect() {
  redirect("/onboarding");
}
