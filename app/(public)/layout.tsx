import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import PlayerProvider from "@/components/public/player/PlayerContext";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </PlayerProvider>
  );
}
