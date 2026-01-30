import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Linkedin, Github, Sparkles, BookOpen, Search } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "About YuPlan - York University Course Planning Made Easy",
  description:
    "Learn about YuPlan, the modern course planning platform built for York University students. Discover how we help YorkU students find courses, compare sections, and plan their academic journey.",
  openGraph: {
    title: "About YuPlan - York University Course Planning",
    description:
      "Meet the team behind YuPlan, the course planning tool designed specifically for York University students.",
    url: "https://yuplan.ca/about",
  },
}

export default function AboutPage() {
  const team = [
    {
      name: "Svastik Sharma",
      role: "Engineer",
      initials: "SS",
      linkedin: "https://www.linkedin.com/in/svastiksharma/",
      github: "https://github.com/svastiks",
    },
    {
      name: "Nikhil N Chengat",
      role: "Engineer",
      initials: "NC",
      linkedin: "https://www.linkedin.com/in/chengat/",
      github: "https://github.com/chengat",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header subtitle="Course selection, de-cluttered." />

      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-14 md:py-18 grow">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-14 md:mb-16 text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">About YuPlan</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-balance bg-linear-to-b from-foreground to-foreground/70 bg-clip-text">
            Course planning, reimagined for YorkU students
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            YuPlan is a modern course planning platform designed to help York
            University (YorkU) students discover, explore, and plan their
            academic journey. We provide an intuitive interface for browsing
            York University courses, viewing detailed information, comparing
            sections, and making informed decisions about your education at York
            University.
          </p>
        </div>

        {/* Value Highlights */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <Card className="p-5 sm:p-6 hover:shadow-lg hover:border-primary/30 transition-all group">
            <div className="h-12 w-12 bg-linear-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Discover courses faster
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quickly find classes, sections, and schedules with a clean, modern
              interface.
            </p>
          </Card>
          <Card className="p-5 sm:p-6 hover:shadow-lg hover:border-primary/30 transition-all group">
            <div className="h-12 w-12 bg-linear-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Compare sections easily
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              See timings, instructors, and details side-by-side to make
              confident choices.
            </p>
          </Card>
        </div>

        {/* Team Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
            Meet the Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {team.map((member) => (
              <Card
                key={member.name}
                className="p-5 sm:p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg font-bold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">
                      {member.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 shadow-md hover:shadow-lg border-2"
                    asChild
                  >
                    <Link
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 shadow-md hover:shadow-lg border-2"
                    asChild
                  >
                    <Link
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
