import type { Metadata } from "next";
import SubscribeDialog from "@/components/public/SubscribeDialog";

// The copy lives here rather than in a Page row so it ships with the repo,
// the way the Dances page does. The database row with slug "tuesday-practice"
// is no longer read by this page.
export const metadata: Metadata = { title: "Tuesday International SamaSangha Practice" };

export default function TuesdayPracticePage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <p className="eyebrow mb-3" style={{ color: "var(--gold-700)" }}>
        Weekly gathering
      </p>
      <h1
        className="font-serif mb-8"
        style={{
          fontSize: "clamp(1.9rem, 4.6vw, 3rem)",
          fontWeight: 400,
          color: "var(--ink-900)",
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
        }}
      >
        Tuesday International SamaSangha Practice
      </h1>

      <h2
        className="font-serif mb-5"
        style={{ fontSize: "1.4rem", fontWeight: 500, color: "var(--ink-900)", lineHeight: 1.3 }}
      >
        Weekly Tuesday Practice with Abraham, Halima and Sama Sangha
      </h2>

      <div className="space-y-5 leading-relaxed" style={{ color: "var(--fg2)" }}>
        <p>
          Join us Tuesday Mornings for Sufi Practice &amp; Meditation,{" "}
          <strong style={{ color: "var(--ink-900)" }}>9 to 10 AM EST</strong> (Boston MA, USA). We
          continue to advocate for actions and realizations that support a harmonious relationship
          between people, nature, and life itself, knowing that this realization begins inside
          ourselves. Our intentions are towards 7 generations, towards Peace on Earth.
        </p>
        <p>
          Please arrive a few minutes early so we can begin together. Our practice time is
          approximately 45 minutes long.
        </p>
        <p>
          <strong style={{ color: "var(--ink-900)" }}>Practice is free.</strong> Feel free to
          support us with a dana (donation).
        </p>
        <p>
          Sign up to receive a reminder email for upcoming classes, or email{" "}
          <a
            href="mailto:northeastsufis@gmail.com"
            className="underline underline-offset-2"
            style={{ color: "var(--link)" }}
          >
            northeastsufis@gmail.com
          </a>{" "}
          to inquire about joining our ongoing weekly practice.
        </p>
      </div>

      {/* The paragraph above asks people to sign up; this is how. */}
      <div className="mt-8">
        <SubscribeDialog
          cta="Sign up for class reminders"
          title="Class reminders"
          blurb="We'll email you before upcoming Tuesday classes, along with community news, a few times per month at most."
        />
      </div>
    </div>
  );
}
