import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GraduationCap, Linkedin, Github } from "lucide-react"
import Link from "next/link"

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold text-primary">YorkUPlan</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* About Section */}
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">About YorkUPlan</h1>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            YUPlan is a modern course planning platform designed to help York University students discover, explore, and plan their academic journey. We provide an intuitive interface for browsing courses, viewing detailed information, and making informed decisions about your education.
          </p>
        </div>

        {/* Team Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Meet the Team</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" asChild>
                    <Link href={member.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" asChild>
                    <Link href={member.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">YorkUPlan</span>
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
    </div>
  )
}
