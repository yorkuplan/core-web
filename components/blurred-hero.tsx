"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type BlurredHeroProps = {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  imageSrc?: string
  imageAlt?: string
  imageClassName?: string
  /**
   * Overlay that tints the image red a bit.
   * Defaults are tuned to match the provided screenshots.
   */
  tintClassName?: string
  /**
   * Extra overlay to ensure text contrast on top.
   */
  contrastOverlayClassName?: string
  /**
   * Gradient fade at the bottom so the hero blends into the page background.
   */
  fadeClassName?: string
  priority?: boolean
  /**
   * Max height on mobile to prevent overly tall heroes on small screens
   */
  maxHeightMobile?: string
}

export function BlurredHero({
  children,
  className,
  contentClassName,
  imageSrc = "/background-image.webp",
  imageAlt = "Background",
  imageClassName,
  tintClassName,
  contrastOverlayClassName,
  fadeClassName,
  priority = true,
  maxHeightMobile = "max-h-[600px]",
}: BlurredHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate",
        // Responsive aspect ratios with mobile height constraint
        "aspect-4/3 sm:aspect-video lg:aspect-21/9",
        // Prevent overly tall heroes on mobile
        maxHeightMobile,
        "sm:max-h-none",
        // Better touch handling on mobile
        "touch-pan-y",
        className,
      )}
    >
      {/* Background is clipped, content can overflow (search dropdown) */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-b-lg sm:rounded-b-xl">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          decoding="async"
          // Responsive image sizes for better mobile performance
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
          quality={75}
          className={cn(
            // scale avoids blur edges showing transparent borders
            // Reduced blur on mobile for better performance
            "pointer-events-none select-none object-cover scale-110",
            // Responsive blur with reduced motion support
            "blur-xs sm:blur-sm lg:blur-[10px]",
            "motion-reduce:blur-[2px] motion-reduce:sm:blur-xs",
            // Better positioning on mobile
            "object-center sm:object-top",
            imageClassName,
          )}
        />
        <div
          className={cn(
            // Combined overlay: contrast and fade in one layer
            // Stronger overlay on mobile for better text contrast and readability
            "absolute inset-0 bg-linear-to-b",
            "from-black/30 via-black/20 to-background",
            "sm:from-black/15 sm:via-black/10",
            "lg:from-black/10 lg:via-black/10",
            contrastOverlayClassName,
            fadeClassName,
          )}
        />
      </div>

      <div
        className={cn(
          "relative z-10 h-full",
          // Add safe padding for notched devices
          "safe-area-inset-top",
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}
