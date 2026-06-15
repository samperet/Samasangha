import { redirect } from "next/navigation";

// Talks are now part of the consolidated Teachings page.
// Detail pages still live at /teachings/talks/[slug].
export default function TalksPage() {
  redirect("/teachings?type=talks");
}
