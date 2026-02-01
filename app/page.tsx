"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Search,
  BookOpen,
  Sparkles,
  Calendar,
  Info,
  MessageSquareText,
  Users,
} from "lucide-react"
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
  const heroText = "Plan your perfect semester."
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
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "YuPlan",
    applicationCategory: "EducationalApplication",
    description:
      "Course information platform for York University students. Search courses, view details, compare sections, and read student reviews at YorkU.",
    url: "https://yuplan.ca",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CAD",
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    provider: {
      "@type": "Organization",
      name: "YuPlan",
      url: "https://yuplan.ca",
    },
    about: {
      "@type": "EducationalOrganization",
      name: "York University",
      alternateName: ["YorkU", "YU"],
      url: "https://www.yorku.ca",
    },
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header subtitle="Course selection, de-cluttered." />

      <div className="grow flex flex-col">
        <BlurredHero
          className="pt-10 sm:pt-14 md:pt-20 pb-12 sm:pb-16 md:pb-20"
          priority
        >
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid gap-6 sm:gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6 text-center lg:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-3 py-1 text-xs sm:text-sm font-semibold text-primary-foreground shadow-md">
                    <Sparkles className="h-4 w-4" />
                    Fall/Winter 2025-2026
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs sm:text-sm text-white/90">
                    Built for YorkU students
                  </span>
                </div>

                <h1 className="text-2xl md:text-4xl lg:text-4xl font-bold leading-tight text-white drop-shadow-sm">
                  <span className="sr-only">{heroText}</span>
                  <span aria-hidden className="relative block">
                    <span className="invisible whitespace-nowrap">
                      {heroText}
                    </span>
                    <span className="absolute inset-0 whitespace-nowrap">
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
                <p className="text-sm sm:text-base md:text-xl text-white/85 text-pretty max-w-xl mx-auto lg:mx-0">
                  Explore YorkU courses with ease. View detailed course info,
                  compare sections, read student reviews, and make informed
                  decisions.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center lg:justify-start">
                  <Link href="/courses" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto shadow-md">
                      Browse Courses
                    </Button>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20"
                    >
                      How it works
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-foreground/80 justify-center lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/85 text-slate-900 ring-1 ring-black/5 px-3 py-1 dark:bg-white/10 dark:text-white/85 dark:ring-white/10">
                    <MessageSquareText className="h-4 w-4" />
                    Student reviews inside
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/85 text-slate-900 ring-1 ring-black/5 px-3 py-1 dark:bg-white/10 dark:text-white/85 dark:ring-white/10">
                    <BookOpen className="h-4 w-4" />
                    Compare sections easily
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/85 text-slate-900 ring-1 ring-black/5 px-3 py-1 dark:bg-white/10 dark:text-white/85 dark:ring-white/10">
                    <Search className="h-4 w-4" />
                    Fast course search
                  </span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Card className="p-3 sm:p-4 md:p-5 bg-background/95 backdrop-blur border-primary/20 shadow-2xl overflow-visible">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">
                        Find your next class
                      </h3>
                    </div>
                  </div>

                  <div className="relative">
                    <InputGroup className="h-10 sm:h-11 text-sm bg-background border-primary/30">
                      <InputGroupAddon
                        align="inline-start"
                        className="text-primary"
                      >
                        <Search className="h-6 w-6 text-primary/90" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="search"
                        placeholder="Search by code, name, faculty..."
                        className="text-sm text-foreground"
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

                    {showResults && isFocused && (
                      <Card className="absolute top-full mt-2 w-full max-h-[50vh] sm:max-h-100 overflow-y-auto z-50 shadow-xl border-border bg-card text-left">
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

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="rounded-lg bg-muted/40 px-3 py-2">
                      <div className="text-sm font-semibold text-foreground">
                        5500+ courses
                      </div>
                      10 faculties
                    </div>
                    <div className="rounded-lg bg-muted/40 px-3 py-2">
                      <div className="text-sm font-semibold text-foreground">
                        Instant filters
                      </div>
                      Level, term, credits
                    </div>
                  </div>
                </Card>

                <Card className="p-3 sm:p-4 md:p-5 bg-background/90">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm sm:text-base font-semibold">
                      Trending right now
                    </h3>
                    <Link
                      href="/courses"
                      className="text-xs text-primary hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  {isLoading ? (
                    <div className="space-y-2 min-h-42 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Loading picks...
                      </p>
                    </div>
                  ) : topCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No courses available.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {topCourses.slice(0, 3).map((course) => (
                        <Link
                          key={course.id}
                          href={`/course/${course.code?.replace(/\s+/g, "").toLowerCase()}`}
                          className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 hover:bg-muted/40 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">
                              {formatCourseCode(course.code)}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {course.name}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {course.credits} credit
                            {course.credits === 1 ? "" : "s"}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </BlurredHero>

        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Trending Courses
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Discover what students are adding this week
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {topCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/course/${course.code?.replace(/\s+/g, "").toLowerCase()}`}
                  >
                    <Card className="p-4 sm:p-5 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group flex flex-col h-full">
                      <div className="flex items-start justify-between mb-2 shrink-0 gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-bold text-lg sm:text-xl mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
                            {formatCourseCode(course.code)}
                          </h3>
                          <p
                            className="text-xs sm:text-sm text-foreground font-medium line-clamp-3 min-h-15 sm:min-h-17 leading-snug"
                            title={course.name}
                          >
                            {course.name}
                          </p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {course.credits} credit
                          {course.credits === 1 ? "" : "s"}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 shrink-0">
                        <div className="flex items-start gap-1 min-w-0">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
                          <span className="min-w-0 leading-snug whitespace-normal wrap-break-word">
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

        <section
          id="how-it-works"
          className="container mx-auto px-4 sm:px-6 md:px-8 pb-8 sm:pb-12 md:pb-16"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">How it works</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  A clear, three-step flow to build your schedule.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
              {[
                {
                  title: "Search",
                  body: "Find every YorkU course by code, name, or faculty.",
                },
                {
                  title: "Compare",
                  body: "Review sections, instructors, and time slots side by side.",
                },
                {
                  title: "Plan",
                  body: "Build a conflict-free schedule and save your picks.",
                },
              ].map((step, index) => (
                <Card key={step.title} className="p-4 sm:p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.body}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 md:px-8 pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto rounded-2xl bg-linear-to-r from-primary/15 via-primary/10 to-background p-4 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-primary">
                Ready to start?
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                Build your schedule with confidence.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Explore courses and lock your plan in minutes.
              </p>
            </div>
            <Link href="/courses" className="w-full lg:w-auto">
              <Button className="w-full lg:w-auto shadow-md">
                Browse Courses
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
