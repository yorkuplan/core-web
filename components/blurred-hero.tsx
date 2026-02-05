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
    <section className={cn("relative isolate", className)}>
      {/* Background is clipped, content can overflow (search dropdown) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="100vw"
          decoding="async"
          className={cn(
            // scale avoids blur edges showing transparent borders
            "pointer-events-none select-none object-cover scale-110 blur-[10px] saturate-[1.05] brightness-[0.72]",
            imageClassName,
          )}
        />
        <div
          className={cn(
            // warm/red tint overlay like the screenshots
            "absolute inset-0 bg-primary/20 mix-blend-multiply",
            tintClassName,
          )}
        />
        <div
          className={cn(
            // subtle dark wash for readability
            "absolute inset-0 bg-black/20",
            contrastOverlayClassName,
          )}
        />
        <div
          className={cn(
            // fade to the page background so it blends nicely
            "absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-background",
            fadeClassName,
          )}
        />
      </div>

      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  )
}
