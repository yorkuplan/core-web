import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://yuplan.ca"),
  title: {
    default: "YuPlan - Course Planner for York University Students",
    template: "%s | YuPlan",
  },
  description:
    "YuPlan is a modern course planner and scheduler for York University (YorkU) students. Search courses, compare sections, view schedules, and plan your perfect semester at YU.",
  keywords: [
    "york university",
    "yorku",
    "yu",
    "course planner",
    "course scheduler",
    "york course selection",
    "yorku courses",
    "yu plan",
    "york university students",
    "course search",
    "timetable planner",
  ],
  authors: [{ name: "YuPlan Team" }],
  creator: "YuPlan",
  publisher: "YuPlan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://yuplan.ca",
    siteName: "YuPlan",
    title: "YuPlan - Course Planner for York University Students",
    description:
      "Plan your perfect semester at York University. Search courses, compare sections, and build your ideal schedule with ease.",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "YuPlan - York University Course Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YuPlan - Course Planner for York University Students",
    description:
      "Plan your perfect semester at York University. Search courses, compare sections, and build your ideal schedule.",
    images: ["/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" as="image" href="/background-image.webp" />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
