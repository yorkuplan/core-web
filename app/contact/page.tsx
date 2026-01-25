"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageSquare, AlertCircle, Send } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "feedback",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("Failed to submit form:", res.status, errorData)
        alert(`Submission failed: ${errorData.error || "Unknown error"}`)
      } else {
        setSubmitted(true)
        setFormData({ name: "", email: "", type: "feedback", message: "" })
        setTimeout(() => setSubmitted(false), 5000)
      }
    } catch (err) {
      console.error("Error submitting form", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header subtitle="Course selection, de-cluttered." />

      <div className="container mx-auto px-4 py-10 sm:py-16 lg:py-20 flex-1 w-full">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12 text-center space-y-4">
          <Badge className="inline-flex w-auto justify-center mb-2 sm:mb-3 bg-primary/10 text-primary hover:bg-primary/20">
            Get in Touch
          </Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-balance">
            We'd Love to Hear From You
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
            Have feedback about YorkUPlan? Found an error in our course data?
            Have a feature suggestion? Let us know! We're committed to improving
            your course selection experience.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto mb-9 sm:mb-12">
          <Card className="p-4 sm:p-6 lg:p-8 text-center h-full">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Share your thoughts and help us improve
            </p>
          </Card>

          <Card className="p-4 sm:p-6 lg:p-8 text-center h-full">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Report Issues</h3>
            <p className="text-sm text-muted-foreground">
              Found incorrect course information?
            </p>
          </Card>

          <Card className="p-4 sm:p-6 lg:p-8 text-center h-full">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Have a feature idea? We'd love to hear it!
            </p>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto w-full">
          <Card className="p-5 sm:p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-6">
                  We've received your message and will get back to you soon.
                  Your feedback helps us improve YorkUPlan.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="h-11"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium mb-2"
                  >
                    Message Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="feedback">General Feedback</option>
                    <option value="bug">Report Incorrect Data</option>
                    <option value="feature">Feature Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send Message"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We typically respond within 24-48 hours during business days.
                </p>
              </form>
            )}
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
