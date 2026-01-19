import { GraduationCap } from "lucide-react"
import Link from "next/link"
import Logo from "@/public/logo.webp"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 flex-shrink-0">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <img
              src={Logo.src}
              alt="YUPlan Logo"
              className="w-auto h-5 md:h-7 object-contain"
            />
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
