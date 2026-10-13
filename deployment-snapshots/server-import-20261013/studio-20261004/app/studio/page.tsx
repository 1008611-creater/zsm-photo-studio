import Studio from "@/components/studio";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ mode?: string | string[] }> }) {
  const params = await searchParams;
  const mode = params.mode === "quick" || params.mode === "expert" ? params.mode : "quick";
  return <Studio initialMode={mode} />;
}
