"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search, BookOpen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  coursesApi,
  type Course,
  formatCourseCode,
  getFacultyName,
} from "@/lib/api/courses"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BlurredHero } from "@/components/blurred-hero"

export default function HomePage() {
  const [topCourses, setTopCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Course[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const heroText = "Plan your perfect semester"
  const [typedHeroText, setTypedHeroText] = useState("")

  useEffect(() => {
    async function fetchCourses() {
      try {
        const allCourses = await coursesApi.getAllCourses()
        const randomCourses = [...allCourses]
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
        setTopCourses(randomCourses)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setError("Failed to load courses. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    // Respect reduced motion preferences.
    if (typeof window === "undefined") return
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (media?.matches) {
      setTypedHeroText(heroText)
      return
    }

    setTypedHeroText("")
    let i = 0
    const interval = window.setInterval(() => {
      i += 1
      setTypedHeroText(heroText.slice(0, i))
      if (i >= heroText.length) {
        window.clearInterval(interval)
      }
    }, 45)

    return () => window.clearInterval(interval)
  }, [heroText])

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true)
        setShowResults(true)
        try {
          const results = await coursesApi.searchCourses(searchQuery)
          setSearchResults(results)
        } catch (error) {
          console.error("Search failed:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "YuPlan",
    "applicationCategory": "EducationalApplication",
    "description": "Course planner and scheduler for York University students. Search courses, compare sections, and plan your perfect semester at YorkU.",
    "url": "https://yuplan.ca",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CAD"
    },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student"
    },
    "provider": {
      "@type": "Organization",
      "name": "YuPlan",
      "url": "https://yuplan.ca"
    },
    "about": {
      "@type": "EducationalOrganization",
      "name": "York University",
      "alternateName": ["YorkU", "YU"],
      "url": "https://www.yorku.ca"
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header subtitle="Course selection, de-cluttered." />

      <div className="flex-grow flex flex-col">
        {/* Hero Section */}
        <BlurredHero
          className="pt-8 sm:pt-12 md:pt-20 pb-8 sm:pb-10 md:pb-14"
          priority
        >
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md">
                  Fall/Winter 2025-2026
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight text-white drop-shadow-sm">
                <span className="sr-only">{heroText}</span>
                <span aria-hidden className="relative inline-block">
                  {/* Reserve space to avoid layout shift */}
                  <span className="invisible">{heroText}</span>
                  <span className="absolute inset-0">
                    {typedHeroText}
                    {typedHeroText.length < heroText.length && (
                      <span
                        className="ml-1 inline-block w-[0.08em] h-[1em] bg-white/85 align-[-0.12em] animate-pulse"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/85 text-pretty max-w-2xl mx-auto px-2 sm:px-0">
                The ultimate course planner for York University students. Browse YorkU courses, compare sections, and build your ideal schedule with
                ease. No more confusion, just clarity.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto pt-2 sm:pt-4 px-2 sm:px-0">
                <InputGroup className="h-12 sm:h-14 text-sm sm:text-base bg-background/90 backdrop-blur-md border-primary/30 shadow-xl shadow-black/20">
                  <InputGroupAddon
                    align="inline-start"
                    className="text-primary"
                  >
                    <Search
                      className="h-10 w-10 sm:h-12 sm:w-12 text-primary/90"
                      strokeWidth={2.5}
                    />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="search"
                    placeholder="Search York University courses by name, code, or faculty..."
                    className="text-sm sm:text-base text-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        setIsFocused(false)
                        setShowResults(false)
                      }, 200)
                    }}
                  />
                </InputGroup>

                {/* Search Results Dropdown */}
                {showResults && isFocused && (
                  <Card className="absolute top-full mt-2 w-full max-h-[50vh] sm:max-h-[400px] overflow-y-auto z-50 shadow-xl border-border bg-card text-left">
                    {isSearching ? (
                      <div className="p-4 sm:p-6 text-muted-foreground">
                        <div className="animate-pulse">Searching...</div>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 sm:p-6 text-muted-foreground text-sm sm:text-base">
                        No courses found for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {searchResults.map((course) => (
                          <Link
                            key={course.id}
                            href={`/course/${course.code?.replace(/\s+/g, "").toLowerCase()}`}
                            className="block p-3 sm:p-4 hover:bg-muted/70 transition-colors text-left"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <div className="flex items-start justify-between gap-2 sm:gap-4">
                              <div className="flex-1 min-w-0 text-left">
                                <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base text-left">
                                  {formatCourseCode(course.code)}
                                </h4>
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 text-left">
                                  {course.name}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs sm:text-sm"
                              >
                                {course.credits} credit
                                {course.credits === 1 ? "" : "s"}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>
        </BlurredHero>

        {/* Top Courses Section */}
        <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Trending Courses
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Most popular courses this semester
                </p>
              </div>
              <Link href="/courses" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="group-hover:bg-primary group-hover:text-primary-foreground w-full sm:w-auto text-xs sm:text-sm shadow-md hover:shadow-lg border-2 sm:border-2"
                >
                  View All
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                Loading courses...
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12 text-destructive">
                {error}
              </div>
            ) : topCourses.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                No courses available.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {topCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/course/${course.code?.replace(/\s+/g, "").toLowerCase()}`}
                  >
                    <Card className="p-4 sm:p-5 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group flex flex-col h-full">
                      <div className="flex items-start justify-between mb-2 flex-shrink-0 gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-bold text-lg sm:text-xl mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
                            {formatCourseCode(course.code)}
                          </h3>
                          {/* Reserve a consistent 3-line height so long titles aren't cut too aggressively */}
                          <p
                            className="text-xs sm:text-sm text-foreground font-medium line-clamp-3 min-h-[3.75rem] sm:min-h-[4.25rem] leading-snug"
                            title={course.name}
                          >
                            {course.name}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="flex-shrink-0 text-xs"
                        >
                          {course.credits} credit
                          {course.credits === 1 ? "" : "s"}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 flex-shrink-0">
                        <div className="flex items-start gap-1 min-w-0">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
                          <span className="min-w-0 leading-snug whitespace-normal break-words">
                            {course.faculty
                              ? getFacultyName(course.faculty)
                              : "Faculty N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2.5 border-t border-border mt-auto gap-2">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1 min-w-0">
                          {course.instructor}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="group-hover:bg-primary group-hover:text-primary-foreground w-full sm:w-auto text-xs sm:text-sm shadow-md hover:shadow-lg border-2 sm:border-2"
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              Everything YU students need to plan courses
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="text-center space-y-3">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg">Smart Search</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Find courses by code, title, or department with
                  intelligent filtering
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base sm:text-lg">
                  Course Details
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Get complete information on prerequisites, descriptions, and
                  section availability
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
