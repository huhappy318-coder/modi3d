function OverlayUI() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="flex h-full w-full flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        <header className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-cloud/40">
          <span>V3 Prototype</span>
          <span className="hidden sm:inline">Shape Cycle / Slow Morph</span>
        </header>

        <section className="mx-auto max-w-xl self-center text-center">
          <p className="mb-5 text-[11px] uppercase tracking-[0.42em] text-celadon/55">
            Stillness In Motion
          </p>
          <h1 className="text-5xl font-light tracking-[0.38em] text-cloud/92 sm:text-7xl">
            墨岚
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-mist/58 sm:text-[15px]">
            轮廓缓慢轮转，气韵轻轻散开。靠近它，像拂过一片山雾。
          </p>
        </section>

        <footer className="mx-auto text-center text-[11px] tracking-[0.3em] text-cloud/34">
          <span className="rounded-full border border-white/8 bg-white/4 px-4 py-2 shadow-veil backdrop-blur-sm">
            Move gently
          </span>
        </footer>
      </div>
    </div>
  )
}

export default OverlayUI
