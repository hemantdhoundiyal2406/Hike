export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="#home"
      className="group inline-flex items-center gap-3"
      aria-label="hike agency home"
    >
      <span className="relative grid size-11 place-items-center">
        <span className="absolute inset-0 rotate-45 rounded-[10px] border border-violet-400/45 bg-violet-500/10 transition group-hover:rotate-[55deg] group-hover:border-violet-300" />
        <span className="relative text-lg font-black tracking-[-0.12em] text-white">
          h<span className="text-violet-400">a</span>
        </span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-[family-name:var(--font-manrope)] text-[15px] font-semibold tracking-[0.24em] text-white">
            HIKE
          </span>
          <span className="mt-1.5 block text-[9px] tracking-[0.42em] text-white/45">
            DIGITAL AGENCY
          </span>
        </span>
      )}
    </a>
  );
}
