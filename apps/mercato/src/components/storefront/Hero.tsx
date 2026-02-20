export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70">
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Shop Trinidad &amp; Tobago
          </h1>
          <p className="mt-4 text-base text-white/85 sm:text-lg lg:text-xl leading-relaxed">
            Discover products from local sellers. Finance your purchases with TSTT MicroLoans.
          </p>
          <div className="mt-8">
            <a
              href="#products"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg hover:bg-white/90 transition-colors"
            >
              Start Shopping
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
