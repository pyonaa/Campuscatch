export default function ItemCardSkeleton() {
  return (
    <div className="rounded-[20px] overflow-hidden border border-white/10" style={{ background: "linear-gradient(145deg, #1E2040 0%, #16183A 100%)" }}>
      <div className="h-48 skeleton-poke" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 rounded-lg skeleton-poke w-3/4" />
        <div className="h-3.5 rounded-lg skeleton-poke w-1/2" />
        <div className="h-3.5 rounded-lg skeleton-poke w-2/5" />
      </div>
    </div>
  );
}
