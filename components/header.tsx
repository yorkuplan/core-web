import { Menu } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Logo from "@/public/logo.webp"

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
          <img
            src={Logo.src}
            alt="YUPlan - York University Course Planner"
            className="w-auto h-5 md:h-7 object-contain"
          />
        </Link>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground text-center justify-self-center hidden md:block">
            {subtitle}
          </p>
        )}
        <div className="flex items-center gap-2 sm:gap-4 justify-self-end shrink-0">
          <nav className="hidden lg:flex items-center gap-4 text-sm">
            <Link
              href="/about"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
          <Link href="/courses" className="hidden lg:block">
            <Button
              variant="outline"
              className="shadow-md shadow-primary text-xs sm:text-sm"
            >
              View All Courses
            </Button>
          </Link>
          <Link href="/courses" className="lg:hidden">
            <Button
              variant="outline"
              className="shadow-md shadow-primary text-xs px-2 py-1 h-8"
            >
              All Courses
            </Button>
          </Link>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden shadow-md shadow-primary"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4">
                <Link href="/about" className="w-full">
                  <Button variant="ghost" className="w-full justify-start">
                    About
                  </Button>
                </Link>
                <Link href="/contact" className="w-full">
                  <Button variant="ghost" className="w-full justify-start">
                    Contact
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
