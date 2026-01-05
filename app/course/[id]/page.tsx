import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CoursePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        {/* Course content will go here */}
      </div>
      <Footer />
    </div>
  )
}