import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: boolean;
}

export function FeatureCard({ icon: Icon, title, description, accent }: FeatureCardProps) {
  return (
    <article className="glass glass-hover group relative overflow-hidden rounded-2xl p-6">
      {/* soft corner glow */}
      <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-accent/20 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
          accent
            ? "border-accent/40 bg-accent/15 text-accent-light"
            : "border-white/10 bg-white/[0.05] text-zinc-300 group-hover:border-accent/40 group-hover:text-accent-light"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      <h3 className="relative mt-4 font-display text-lg font-semibold text-white">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
    </article>
  );
}
