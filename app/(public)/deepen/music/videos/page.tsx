import { redirect } from "next/navigation";

// Videos now live in the consolidated Teachings list.
export default function MusicVideosPage() {
  redirect("/deepen?type=videos");
}
