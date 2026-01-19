import { GraduationCap } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 flex-shrink-0">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <GraduationCap
              className="h-5 sm:h-6 w-5 sm:w-6"
              style={{ color: "#e31837" }}
            />
            <span
              className="text-lg sm:text-xl font-bold"
              style={{ color: "#e31837" }}
            >
              YUPlan
            </span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            {/* <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link> */}
          </nav>
        </div>
      </div>
    </footer>
  )
}
