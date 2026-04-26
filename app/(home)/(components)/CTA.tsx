"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function CTA() {
  return (
    <section className="px-6 py-24">
      <motion.div 
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/30 p-8 text-center md:p-12 lg:p-16">
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute -left-20 -top-20 size-64 rounded-full bg-foreground/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-foreground/5 blur-3xl" />
          </motion.div>
          
          <motion.h2 
            className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Ready to transform your studying?
          </motion.h2>
          <motion.p 
            className="mx-auto mb-8 max-w-xl text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join students who are already studying smarter with Mesa AI. Get started in seconds.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Start your journey
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
