"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import Banner from "@/components/banner"

export function Footer() {
  return (
    <motion.footer 
      className="border-t border-border/40 px-6 py-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Banner className="w-24" />

          <p className="text-sm text-muted-foreground">
            2026 Mesa AI. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  )
}
