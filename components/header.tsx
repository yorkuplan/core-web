import { GraduationCap } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  subtitle?: string
}

export function Header({ subtitle }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold text-primary">YUPlan</span>
        </Link>
        {subtitle && (
          <p className="text-sm text-muted-foreground hidden md:block">{subtitle}</p>
        )}
      </div>
    </header>
  )
}
