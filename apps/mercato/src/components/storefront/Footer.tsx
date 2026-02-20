export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="h-1 bg-primary" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-baseline gap-1 text-lg font-bold tracking-tight">
            <span className="text-primary">TSTT</span>
            <span className="text-foreground">Marketplace</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
          <p>Powered by TSTT</p>
          <p>&copy; {new Date().getFullYear()} TSTT Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
