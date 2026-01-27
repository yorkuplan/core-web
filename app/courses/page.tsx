import type { Metadata } from "next"
import { Suspense } from "react"
import CoursesContent from "./courses-content"

export const metadata: Metadata = {
  title: 'Browse All Courses - York University Course Catalog',
  description: 'Browse the complete York University course catalog. Search and filter through YorkU courses by department, credits, and more. Find the perfect courses for your semester at YU.',
  openGraph: {
    title: 'Browse York University Courses - YuPlan',
    description: 'Explore the full catalog of York University courses. Search by code, title, or department to plan your perfect semester.',
    url: 'https://yuplan.ca/courses',
  },
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesContent />
    </Suspense>
  )
}

function CoursesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="h-7 w-32 bg-muted animate-pulse rounded" />
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
