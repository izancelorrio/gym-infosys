"use client"

import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [membersCount, setMembersCount] = useState<number>(500)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
        console.log("[v0] Fetching members count")
        const response = await fetch("/api/count-members")
        const data = await response.json()

        if (data.count) {
          setMembersCount(data.count)
          console.log("[v0] Members count updated:", data.count)
        }
      } catch (error) {
        console.error("[v0] Error fetching members count:", error)
        // Mantener el valor por defecto de 500
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembersCount()
  }, [])

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/modern-gym-interior-with-people-working-out--energ.jpg"
          alt="Gimnasio moderno con personas entrenando"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
          Transforma Tu Cuerpo, <span className="text-primary">Transforma Tu Vida</span>
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-gray-200 text-pretty max-w-2xl mx-auto">
          Únete a la comunidad fitness más motivadora de la ciudad. Entrenamientos personalizados, equipos de última
          generación y resultados garantizados.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-3">
            Comienza Hoy
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-3 bg-transparent"
          >
            <Play className="mr-2 h-5 w-5" />
            <span className="sm:inline hidden">Ver Video</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/20">
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-primary">{isLoading ? "..." : `${membersCount}+`}</div>
            <div className="text-sm sm:text-base text-gray-300">Miembros Activos</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-primary">15+</div>
            <div className="text-sm sm:text-base text-gray-300">Entrenadores Expertos</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-primary">24/7</div>
            <div className="text-sm sm:text-base text-gray-300">Acceso al Gimnasio</div>
          </div>
        </div>
      </div>
    </section>
  )
}
