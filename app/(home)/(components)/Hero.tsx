"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-28 lg:py-36">
      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-1/4 top-0 -translate-x-1/2 -translate-y-1/4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <div className="size-[500px] rounded-full bg-gradient-to-br from-foreground/6 to-transparent blur-3xl" />
        </motion.div>
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col-reverse items-center gap-10 md:flex-row md:gap-16">

          {/* Left: text content */}
          <div className="flex-1 text-left">
            <motion.div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Sparkles className="size-3.5" />
              <span>AI-powered study companion</span>
            </motion.div>

            <motion.h1
              className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.5rem] lg:leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Study smarter,{" "}
              <br className="hidden sm:block" />
              not harder with{" "}
              <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Mesa AI
              </span>
            </motion.h1>

            <motion.p
              className="mb-10 max-w-lg text-pretty text-lg text-muted-foreground md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Upload your notes, PDFs, and lectures. Get instant summaries, AI-generated quizzes, and chat with your study materials like never before.
            </motion.p>

            <motion.div
              className="flex flex-row gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Get started for free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="#how-it-works" className="self-start">
                <Button variant="outline" size="lg">
                  See how it works
                </Button>
              </Link>
            </motion.div>

            <motion.p
              className="mt-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.55 }}
            >
              Free during the beta &mdash; No credit card required
            </motion.p>
          </div>

          {/* Right: tilted image placeholder */}
          <motion.div
            className="w-full md:flex-1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          >
            {/* On mobile: no tilt. On md+: rotate slightly */}
            <div className="relative md:[perspective:1200px]">
              <motion.div
                className="
                  relative w-full overflow-hidden rounded-2xl border border-border/60 bg-muted
                  aspect-[5/3]
                  md:[transform:rotateY(-8deg)_rotateX(4deg)]
                  md:shadow-2xl
                "
                whileHover={{
                  rotateY: -4,
                  rotateX: 2,
                  scale: 1.02,
                  transition: { duration: 0.4, ease: "easeOut" },
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Placeholder content — swap with a real screenshot later */}
                <img src="/landingBanner.jpeg" alt="Product screenshot" className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 h-full" />

                {/* Subtle inner highlight to sell the 3D glass look */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              </motion.div>

              {/* Shadow blob underneath on desktop */}
              <div className="pointer-events-none absolute -bottom-6 left-4 right-4 hidden h-12 rounded-full bg-foreground/10 blur-2xl md:block" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
