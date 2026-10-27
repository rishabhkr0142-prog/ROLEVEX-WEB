export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="h-3 w-24 animate-pulse rounded-full bg-accent/40" />
      <div className="mt-4 h-9 w-72 max-w-full animate-pulse rounded-lg bg-white/[0.07]" />
      <div className="mt-4 h-4 w-[36rem] max-w-full animate-pulse rounded bg-white/[0.05]" />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.035]"
          />
        ))}
      </div>
    </div>
  );
}
