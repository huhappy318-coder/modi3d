function OverlayUI() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-start">
      <div className="max-w-xl px-6 pb-8 font-serif sm:px-10 sm:pb-10 lg:px-14 lg:pb-12">
        <h1 className="text-5xl font-light tracking-[0.34em] text-stone-200/82 sm:text-7xl">
          墨岚
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-stone-200/58 sm:text-[15px]">
          古画缓缓显影，靠近它，轻轻拂散。
        </p>
        <p className="mt-6 text-[11px] tracking-[0.32em] text-amber-50/26">
          触碰以拂散
        </p>
      </div>
    </div>
  )
}

export default OverlayUI
