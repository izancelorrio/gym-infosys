import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ClassesSection } from "@/components/classes-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ClassesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
