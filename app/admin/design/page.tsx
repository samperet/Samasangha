import { getSiteDesign } from "@/lib/design";
import DesignForm from "./DesignForm";

export const dynamic = "force-dynamic";

export default async function AdminDesignPage() {
  const design = await getSiteDesign();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a2744]">Design</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set the colours of the homepage&apos;s gatherings (purple) and retreats (green) sections.
          Choose a solid colour or a gradient, and watch the live preview.
        </p>
      </div>
      <DesignForm initial={design} />
    </>
  );
}
