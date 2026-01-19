import { GraduationCap } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  subtitle?: string
}

export function Header({ subtitle }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 justify-self-start shrink-0"
        >
          <GraduationCap
            className="h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7"
            style={{ color: "#e31837" }}
          />
          <span
            className="text-xl sm:text-2xl font-bold"
            style={{ color: "#e31837" }}
          >
            YUPlan
          </span>
        </Link>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground text-center justify-self-center hidden md:block">
            {subtitle}
          </p>
        )}
        <div className="flex items-center gap-2 sm:gap-4 justify-self-end shrink-0">
          <Link href="/courses" className="hidden sm:block">
            <Button
              variant="outline"
              className="shadow-md shadow-primary text-xs sm:text-sm"
            >
              View All Courses
            </Button>
          </Link>
          <Link href="/courses" className="sm:hidden">
            <Button
              variant="outline"
              className="shadow-md shadow-primary text-xs px-2 py-1 h-8"
            >
              All Courses
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
