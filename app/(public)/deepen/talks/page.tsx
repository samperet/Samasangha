import { redirect } from "next/navigation";

// Talks are now part of the consolidated Teachings page.
// Detail pages still live at /deepen/talks/[slug].
export default function TalksPage() {
  redirect("/deepen?type=talks");
}
