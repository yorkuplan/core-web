"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Search, BookOpen, Calendar } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  coursesApi,
  type Course,
  formatCourseCode,
  getFacultyName,
} from "@/lib/api/courses"
import { IMPORTANT_DATES } from "@/lib/important-dates"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BlurredHero } from "@/components/blurred-hero"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

function getDayDelta(date: Date, nowDate: Date): number {
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate())
  return Math.floor((dateOnly.getTime() - nowOnly.getTime()) / MS_PER_DAY)
}

function formatCountdown(deltaDays: number): string {
  if (deltaDays <= 0) return "Today"
  if (deltaDays === 1) return "Tomorrow"
  return `In ${deltaDays} days`
}

function getCountdownBadgeClass(deltaDays: number): string {
  if (deltaDays <= 2) {
    return "bg-destructive/10 text-destructive border-destructive/25"
  }
  if (deltaDays <= 7) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
  }
  return "bg-muted text-muted-foreground border-border"
}

function formatDateWithWeekday(startsOn: string, dateLabel: string): string {
  const date = new Date(`${startsOn}T00:00:00`)
  const weekday = date.toLocaleDateString("en-CA", { weekday: "short" })
  return `${weekday}, ${dateLabel}`
}

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

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const upcomingImportantDates = IMPORTANT_DATES.filter((event) => {
    const eventDate = new Date(`${event.startsOn}T00:00:00`)
    return eventDate.getTime() >= today.getTime()
  })
  const nextFourImportantDates = (
    upcomingImportantDates.length > 0 ? upcomingImportantDates : IMPORTANT_DATES
  ).slice(0, 4)

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
          className="pt-12 sm:pt-20 md:pt-24 pb-10 sm:pb-16 md:pb-20"
          imageClassName="object-[center_72%] lg:object-[center_68%]"
          contrastOverlayClassName="from-black/35 via-black/20 to-background sm:from-black/30 sm:via-black/15"
          priority
        >
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center gap-6 sm:gap-8 md:gap-9">
              {/* Hero: eyebrow → headline → subhead → single CTA row (matches reference; no duplicate buttons) */}
              <motion.div
                className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-5 text-center"
                initial="initial"
                whileInView="animate"
                viewport={{ once: false, margin: "-50px 0px -10px 0px" }}
                variants={staggerContainer}
              >
                <motion.div className="flex justify-center" variants={fadeInUp}>
                  <Badge
                    variant="default"
                    className="h-auto min-h-0 max-w-[min(100%,42rem)] flex-wrap justify-center rounded-full border-transparent px-3 py-1.5 text-center text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] shadow-md whitespace-normal"
                  >
                    <span>Fall/Winter 2026-2027</span>
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-[2rem] sm:text-3xl md:text-4xl font-bold leading-tight text-white drop-shadow-sm flex justify-center"
                  variants={fadeInUp}
                >
                  <span className="sr-only">{heroText}</span>
                  <span aria-hidden className="relative inline-block text-center sm:text-left">
                    <span className="sm:hidden">{heroText}</span>
                    <span className="hidden sm:block">
                      <span className="invisible whitespace-nowrap">
                        {heroText}
                      </span>
                      <span className="absolute left-0 top-0 whitespace-nowrap">
                        {typedHeroText}
                        {typedHeroText.length < heroText.length && (
                          <span
                            className="ml-1 inline-block w-[0.08em] h-[1em] bg-white/85 align-[-0.12em] animate-pulse"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </span>
                  </span>
                </motion.h1>
                <motion.p
                  className="text-sm sm:text-base md:text-lg text-white/80 text-pretty max-w-xl mx-auto"
                  variants={fadeInUp}
                >
                  Reviews, section comparisons, and fast search—so you can plan
                  with confidence.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-1"
                  variants={fadeInUp}
                >
                  <Link href="/courses" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto shadow-md">
                      Browse Courses
                    </Button>
                  </Link>

                </motion.div>
              </motion.div>

              {/* Search directly under hero CTAs — wide bar */}
              <motion.div
                className="w-full max-w-2xl sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto space-y-3 sm:space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <h2 className="sr-only">Search courses</h2>
                <div className="relative w-full">
                  <InputGroup className="h-12 sm:h-[3.75rem] md:h-16 text-sm sm:text-lg bg-background dark:bg-background shadow-2xl border-0 ring-2 ring-white/25 dark:ring-white/15 rounded-full pl-1 pr-1 sm:pl-2 sm:pr-2">
                    <InputGroupAddon
                      align="inline-start"
                      className="text-primary pl-3 sm:pl-6"
                    >
                      <Search className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="search"
                      placeholder="Try ECON 1000, computer science, LA&PS…"
                      className="text-xs sm:text-lg text-foreground placeholder:text-xs sm:placeholder:text-lg placeholder:text-muted-foreground py-2.5 sm:py-4"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsFocused(false)
                          setShowResults(false)
                        }, 200)
                      }}
                      autoComplete="off"
                      enterKeyHint="search"
                    />
                  </InputGroup>

                  {showResults && isFocused && (
                    <Card className="absolute top-full left-0 right-0 mt-2 max-h-[45vh] sm:max-h-100 overflow-y-auto z-50 shadow-xl border-border bg-card text-left rounded-xl">
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

              </motion.div>

              <motion.div
                className="w-full max-w-6xl mx-auto mt-8 sm:mt-14 md:mt-16"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-50px 0px -10px 0px" }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <div className="mb-6 sm:mb-8 flex flex-col gap-3 text-center sm:text-left sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold mb-2 text-white drop-shadow-sm">
                      Upcoming deadlines and closures
                    </h2>
                    <p className="text-sm sm:text-base text-white/80">
                      Key dates for this term, shown in date order
                    </p>
                  </div>
                </div>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: false, margin: "-50px 0px -10px 0px" }}
                  variants={staggerContainer}
                >
                  {nextFourImportantDates.map((event) => {
                    const eventDate = new Date(`${event.startsOn}T00:00:00`)
                    const delta = getDayDelta(eventDate, now)

                    return (
                      <motion.div
                        key={`${event.title}-${event.startsOn}`}
                        variants={cardVariant}
                      >
                        <Card className="p-3 sm:p-4 h-full flex flex-col gap-2.5 bg-card/95 backdrop-blur-sm border-border hover:shadow-lg transition-all hover:border-primary/30">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-[10px] sm:text-xs border px-2 py-0.5 ${getCountdownBadgeClass(delta)}`}
                            >
                              {formatCountdown(delta)}
                            </Badge>
                          </div>

                          <h3 className="font-semibold text-[1.05rem] sm:text-lg leading-snug text-foreground line-clamp-2">
                            {event.title}
                          </h3>

                          <div className="flex items-start gap-2 text-[11px] sm:text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-80" />
                            <span className="leading-snug line-clamp-2">
                              {formatDateWithWeekday(event.startsOn, event.dateLabel)}
                            </span>
                          </div>

                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </BlurredHero>

        <section className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px 0px -10px 0px" }}
              transition={{ duration: 0.5 }}
            >
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
            </motion.div>

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
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                initial="initial"
                whileInView="animate"
                viewport={{ once: false, margin: "-50px 0px -10px 0px" }}
                variants={staggerContainer}
              >
                {topCourses.map((course) => (
                  <motion.div key={course.id} variants={cardVariant}>
                    <Link
                      href={`/course/${course.code?.replace(/\s+/g, "").toLowerCase()}`}
                    >
                      <Card className="p-3 sm:p-5 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group flex flex-col h-full">
                        <div className="flex items-start justify-between mb-1.5 sm:mb-2 shrink-0 gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-bold text-lg sm:text-xl mb-0 group-hover:text-primary transition-colors line-clamp-1">
                              {formatCourseCode(course.code)}
                            </h3>
                            <p
                              className="text-xs sm:text-sm text-foreground font-medium line-clamp-2 sm:line-clamp-3 sm:min-h-17 leading-snug"
                              title={course.name}
                            >
                              {course.name}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs"
                          >
                            {course.credits} credit
                            {course.credits === 1 ? "" : "s"}
                          </Badge>
                        </div>

                        <div className="flex items-start gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 shrink-0">
                          <div className="flex items-start gap-1 min-w-0">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 mt-0.5" />
                            <span className="min-w-0 leading-snug whitespace-normal wrap-break-word">
                              {course.faculty
                                ? getFacultyName(course.faculty)
                                : "Faculty N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-between pt-2 border-t border-border mt-auto gap-2">
                          <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1 min-w-0 pr-2">
                            {course.instructor}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="group-hover:bg-primary group-hover:text-primary-foreground h-8 px-3 text-xs sm:text-sm shadow-md hover:shadow-lg border-2 sm:border-2 shrink-0"
                          >
                            View Details
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        <section
          id="how-it-works"
          className="container mx-auto px-4 sm:px-6 md:px-8 pb-8 sm:pb-12 md:pb-16"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-50px 0px -10px 0px" }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="text-xl sm:text-3xl font-bold">How it works</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  A clear, three-step flow to build your schedule.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="grid gap-3 sm:gap-4 lg:grid-cols-3"
              initial="initial"
              whileInView="animate"
              viewport={{ once: false, margin: "-50px 0px -10px 0px" }}
              variants={staggerContainer}
            >
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
                <motion.div key={step.title} variants={cardVariant}>
                  <Card className="p-4 sm:p-6 h-full">
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
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 md:px-8 pb-12 sm:pb-16">
          <motion.div
            className="max-w-6xl mx-auto rounded-2xl border border-border bg-card p-4 sm:p-8 md:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px 0px -10px 0px" }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-primary">
                Ready to start?
              </p>
              <h2 className="text-xl sm:text-3xl font-bold mt-2 text-foreground">
                Build your schedule with confidence.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
                Explore courses and lock your plan in minutes.
              </p>
            </div>
            <Link href="/courses" className="w-full lg:w-auto">
              <Button className="w-full lg:w-auto shadow-md">
                Browse Courses
              </Button>
            </Link>
          </motion.div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
