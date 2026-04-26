"use client"

import { motion } from "framer-motion"

const testimonials = [
  {
    quote:
      "Mesa AI completely changed how I study. I went from spending hours on notes to actually understanding concepts in minutes.",
    author: "Joel G.",
    role: "Pre-Med Student, Stanford",
  },
  {
    quote:
      "The quiz feature is incredible. It finds exactly where I need to focus and helps me retain information so much better.",
    author: "Marcus T.",
    role: "Engineering Major, MIT",
  },
  {
    quote:
      "I uploaded my lecture notes and Mesa AI organized everything beautifully. It's like having a personal study assistant.",
    author: "Emily R.",
    role: "Law Student, Harvard",
  },
]

export function Testimonials() {
  return (
    <motion.div
      className="mt-32"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Loved by students everywhere
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          See what students are saying about Mesa AI.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.author}
            className="rounded-2xl border border-border/60 bg-card p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium">{testimonial.author}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
