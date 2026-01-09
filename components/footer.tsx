import { GraduationCap } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 h-24 flex-shrink-0">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" style={{ color: '#e31837' }} />
            <span className="text-xl font-bold" style={{ color: '#e31837' }}>YUPlan</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
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
