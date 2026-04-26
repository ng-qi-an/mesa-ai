"use client"

import { Shield, Users, Zap } from "lucide-react"
import { motion } from "framer-motion"

const badges = [
  { icon: Shield, label: "Open-Source" },
  { icon: Users, label: "Crowd supported" },
  { icon: Zap, label: "99.9% Uptime" },
]

export function TrustBadges() {
  return (
    <motion.div
      className="mt-24 flex flex-wrap items-center justify-center gap-8 border-t border-border/40 pt-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          <span>{label}</span>
        </div>
      ))}
    </motion.div>
  )
}
