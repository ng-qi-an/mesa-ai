"use client"

import { motion } from "framer-motion"
import { BentoGrid } from "./(features)/BentoGrid"
import { Stats } from "./(features)/Stats"
import { HowItWorks } from "./(features)/HowItWorks"
import { Testimonials } from "./(features)/Testimonials"
import { TrustBadges } from "./(features)/TrustBadges"

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to ace your studies
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Mesa Notebooks transforms how you learn. Upload your sources and let AI do the heavy lifting.
          </p>
        </motion.div>

        <BentoGrid />
        <HowItWorks />
        <TrustBadges />
      </div>
    </section>
  )
}
