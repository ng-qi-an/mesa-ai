"use client"

import { FileText, MessageSquare, Brain, Upload, Zap, BookOpen, Sparkles, Presentation } from "lucide-react"
import { motion } from "framer-motion"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
}

const bentoRows = [
  // Row 1: Upload (2-col) | Summaries (1-col)
  [
    {
      icon: Upload,
      title: "Upload Anything",
      description:
        "Drop PDFs, lecture slides or handwritten notes. Mesa handles it all seamlessly.",
      className: "md:col-span-2",
      preview: (
        <div className="mt-5 flex flex-wrap gap-2">
          {["Biology_Ch5.pdf", "Lecture_Notes.docx", "Study_Guide.txt", "History_Essay.pdf"].map((file) => (
            <div key={file} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs">
              <FileText className="size-3 shrink-0" />
              {file}
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground">
            + Drop files here
          </div>
        </div>
      ),
    },
    {
      icon: BookOpen,
      title: "AI Notebooks",
      description:
        "Get concise, AI-generated summaries that capture the key concepts from your materials.",
      className: "md:col-span-1",
      preview: (
        <div className="mt-5 space-y-2.5">
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-muted" />
            <div className="h-2 w-[85%] rounded-full bg-muted" />
            <div className="h-2 w-[70%] rounded-full bg-muted" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-[90%] rounded-full bg-muted/60" />
            <div className="h-2 w-[75%] rounded-full bg-muted/60" />
          </div>
          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <Sparkles className="size-3" />
            <span>Key points extracted</span>
          </div>
        </div>
      ),
    },
  ],
  // Row 2: Chat (1-col) | Quizzes (1-col) | Lightning (1-col)
  [
    {
      icon: MessageSquare,
      title: "Chat With Your Notes",
      description:
        "Ask questions and get answers directly from your study materials. Like having a tutor 24/7.",
      className: "md:col-span-1",
      preview: (
        <div className="mt-5 space-y-2">
          <div className="ml-auto w-fit max-w-[80%] rounded-xl rounded-tr-sm bg-foreground px-3 py-1.5 text-xs text-background">
            What is photosynthesis?
          </div>
          <div className="w-fit max-w-[80%] rounded-xl rounded-tl-sm bg-muted px-3 py-1.5 text-xs leading-relaxed">
            Photosynthesis is the process by which plants convert sunlight into glucose...
          </div>
        </div>
      ),
    },
    {
      icon: FileText,
      title: "Smart Quizzes",
      description:
        "Auto-generated quizzes that test your understanding and identify knowledge gaps.",
      className: "md:col-span-1",
      preview: (
        <div className="mt-5 space-y-2 text-xs">
          <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">Q1: </span>What is the powerhouse of the cell?
          </div>
          <div className="flex gap-2">
            <span className="rounded-md bg-muted px-2.5 py-1 text-muted-foreground">A. Nucleus</span>
            <span className="rounded-md bg-foreground px-2.5 py-1 text-background">B. Mitochondria</span>
          </div>
        </div>
      ),
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Process dozens of pages in seconds. No more hours of manual note-taking.",
      className: "md:col-span-1",
      preview: (
        <div className="mt-5 space-y-3">
          {[
            { label: "Summarising", pct: "100%" },
            { label: "Quiz generation", pct: "78%" },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span>{item.pct}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-foreground"
                  initial={{ width: "0%" }}
                  whileInView={{ width: item.pct }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ],
  // Row 3: Organized Notebooks (3-col)
  [
    {
      icon: Presentation,
      title: "Organized Classes",
      description:
        "Keep all your courses, subjects, and materials neatly organized in one beautiful workspace.",
      className: "md:col-span-3",
      preview: (
        <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
          {[
            { name: "Biology 101", count: 12, docs: ["Ch5.pdf", "Lab Notes", "Lecture 4"] },
            { name: "Chemistry", count: 8, docs: ["Organic Rxns", "Periodic Table", "Exam Prep"] },
            { name: "Physics", count: 15, docs: ["Mechanics", "Electrostatics", "Wave Theory"] },
            { name: "History", count: 6, docs: ["WWI Sources", "Essay Draft", "Timeline"] },
          ].map((notebook) => (
            <div key={notebook.name} className="min-w-[140px] flex-1 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
              <div className="mb-2 font-medium">{notebook.name}</div>
              <div className="space-y-1">
                {notebook.docs.map((doc) => (
                  <div key={doc} className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="size-2.5 shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-muted-foreground/60">{notebook.count} sources</div>
            </div>
          ))}
        </div>
      ),
    },
  ],
]

export function BentoGrid() {
  let itemIndex = 0

  return (
    <div className="flex flex-col gap-4">
      {bentoRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 md:grid-cols-3">
          {row.map((feature) => {
            const currentIndex = itemIndex++
            return (
              <motion.div
                key={feature.title}
                custom={currentIndex}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-border ${feature.className}`}
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="size-5 text-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                {feature.preview}
                <div className="absolute -right-12 -top-12 size-24 rounded-full bg-foreground/5 transition-transform duration-500 group-hover:scale-150" />
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
