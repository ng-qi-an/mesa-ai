"use client"

import { motion } from "framer-motion"

const steps = [
  {
    step: "01",
    title: "Upload your sources",
    description:
      "Drop your PDFs, notes and slides. We support all major file formats and can even process handwritten notes.",
  },
  {
    step: "02",
    title: "Let AI work its magic",
    description:
      "Mesa AI analyzes your materials, extracts key concepts, creates connections between topics, and generates study-ready notes.",
  },
  {
    step: "03",
    title: "Study smarter",
    description:
      "Access summaries, chat with your notes, take quizzes, and track your progress. Everything you need in one place.",
  },
]

export function HowItWorks() {
  return (
    <motion.div
      className="mt-32"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      id="how-it-works"
    >
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Get started in three simple steps. No complicated setup required.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((item, index) => (
          <motion.div
            key={item.step}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 text-5xl font-bold text-muted">{item.step}</div>
            <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
            <p className="text-muted-foreground">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
