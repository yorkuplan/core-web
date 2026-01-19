import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Linkedin, Github } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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

      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 flex-grow">
        {/* About Section */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-balance">
            About YorkUPlan
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed text-pretty">
            YUPlan is a modern course planning platform designed to help York
            University students discover, explore, and plan their academic
            journey. We provide an intuitive interface for browsing courses,
            viewing detailed information, and making informed decisions about
            your education.
          </p>
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10">
            Meet the Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {team.map((member) => (
              <Card key={member.name} className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
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
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 shadow-md hover:shadow-lg border-2 sm:border-2"
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
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 shadow-md hover:shadow-lg border-2 sm:border-2"
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
