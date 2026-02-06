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
}: BlurredHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate aspect-4/3 sm:aspect-video lg:aspect-21/9",
        className,
      )}
    >
      {/* Background is clipped, content can overflow (search dropdown) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          decoding="async"
          sizes="100vw"
          className={cn(
            // scale avoids blur edges showing transparent borders
            // Reduced blur on mobile for better performance
            "pointer-events-none select-none object-cover scale-110 blur-[6px] sm:blur-sm lg:blur-[10px]",
            imageClassName,
          )}
        />
        <div
          className={cn(
            // Combined overlay: contrast and fade in one layer
            // Slightly stronger overlay on mobile for better text contrast
            "absolute inset-0 bg-linear-to-b from-black/20 via-black/15 to-background sm:from-black/10 sm:via-black/10",
            contrastOverlayClassName,
            fadeClassName,
          )}
        />
      </div>

      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  )
}
