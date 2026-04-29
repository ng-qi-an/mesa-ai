"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Monitor, Smartphone, Tablet } from "lucide-react"

const platforms = [
  { icon: Monitor, label: "Web App" },
  { icon: Tablet, label: "iPad" },
  { icon: Smartphone, label: "iOS & Android" },
]

export function Multiplatform() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Desktop image floats up slightly as you scroll into view
  const desktopY = useTransform(scrollYProgress, [0, 0.5], [30, 0])
  const desktopOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  // Mobile image lags slightly behind for a parallax offset
  const mobileY = useTransform(scrollYProgress, [0.05, 0.55], [50, 0])
  const mobileOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1])

  return (
    <section ref={ref} className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-16 md:flex-row md:gap-20">

          {/* Left: images */}
          <div className="relative w-full md:flex-1">
            {/* Constrain the overlap region */}
            <div className="relative mx-auto h-[320px] w-full max-w-[480px] md:h-[380px]">

              {/* Desktop / web UI placeholder — sits behind */}
              <motion.div
                style={{ y: desktopY, opacity: desktopOpacity }}
                className="
                  absolute left-0 top-0
                  w-[90%] aspect-[5/3]
                  overflow-hidden rounded-2xl border border-border/60 bg-muted
                  shadow-xl
                  md:h-[230px]
                  lg:h-[280px]
                "
              >
                <div className="flex h-8 items-center gap-1.5 border-b border-border/40 bg-muted/80 px-3">
                  <div className="size-2.5 rounded-full bg-border" />
                  <div className="size-2.5 rounded-full bg-border" />
                  <div className="size-2.5 rounded-full bg-border" />
                </div>
                <img src="/landingDesktop.jpeg" className="flex h-full items-center justify-center text-sm text-muted-foreground/40 object-cover object-top" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/8 via-transparent to-transparent" />
              </motion.div>

              {/* Mobile UI placeholder — sits in front, offset bottom-right */}
              <motion.div
                style={{ y: mobileY, opacity: mobileOpacity }}
                className="
                  absolute bottom-0 right-0
                  h-[260px] aspect-[1/2]
                  overflow-hidden rounded-2xl border border-border/60 bg-card
                  shadow-2xl
                "
              >
                <div className="flex h-6 items-center justify-center border-b border-border/40 bg-muted/80">
                  <div className="h-1 w-8 rounded-full bg-border" />
                </div>
                <img src="/landingMobile.jpeg" className="flex w-full h-auto object-cover object-top items-center justify-center text-xs text-muted-foreground/40"/>
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/8 via-transparent to-transparent" />
              </motion.div>

              {/* Glow behind the images */}
              <div className="pointer-events-none absolute -bottom-4 left-8 right-8 h-10 rounded-full bg-foreground/10 blur-2xl" />
            </div>
          </div>

          {/* Right: text */}
          <div className="flex-1 text-left">
            <motion.p
              className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              viewport={{ once: true }}
            >
              Available everywhere
            </motion.p>

            <motion.h2
              className="mb-5 text-balance text-3xl font-bold tracking-tight md:text-4xl"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              viewport={{ once: true }}
            >
              Your notes follow you
              <br />
              <span className="text-muted-foreground">on every device</span>
            </motion.h2>

            <motion.p
              className="mb-8 max-w-md text-pretty text-base text-muted-foreground md:text-lg"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.19 }}
              viewport={{ once: true }}
            >
              Study at your desk, revise on the bus, or review flashcards before an exam. Mesa AI syncs instantly across all your devices so your workflow never skips a beat.
            </motion.p>

            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26 }}
              viewport={{ once: true }}
            >
              {platforms.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted">
                    <Icon className="size-4 text-foreground" />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
