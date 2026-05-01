import { Navbar } from "./(components)/Navbar"
import { Hero } from "./(components)/Hero"
import { Features } from "./(components)/Features"
import { CTA } from "./(components)/CTA"
import { Footer } from "./(components)/Footer"
import { Multiplatform } from "./(components)/Multiplatform"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (session && session.user) {
    return redirect('/dashboard')
  }
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Multiplatform/>
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
