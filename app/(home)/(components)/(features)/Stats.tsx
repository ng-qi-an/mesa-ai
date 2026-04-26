"use client"

import { motion } from "framer-motion"

const stats = [
  { value: "50K+", label: "Active Students" },
  { value: "2M+", label: "Notes Processed" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "4.9", label: "App Store Rating" },
]

export function Stats() {
  return (
    <motion.div
      className="mt-24 grid grid-cols-2 gap-8 md:grid-cols-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <div className="text-3xl font-bold md:text-4xl">{stat.value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}
