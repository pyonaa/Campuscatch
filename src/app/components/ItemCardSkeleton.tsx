export default function ItemCardSkeleton() {
  return (
    <div className="poke-item-card animate-pulse">
      <div className="h-40 bg-[#1a1a3a]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[var(--poke-surface-2)] rounded-full w-3/4" />
        <div className="h-2.5 bg-[var(--poke-surface-2)] rounded-full w-1/2" />
        <div className="h-2.5 bg-[var(--poke-surface-2)] rounded-full w-1/3" />
      </div>
    </div>
  );
}
