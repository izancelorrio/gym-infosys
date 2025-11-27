"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface GymClase {
  id: number
  nombre: string
  descripcion?: string
  duracion_minutos?: number
  nivel?: string
  max_participantes?: number
}

// Helper to pick a placeholder image based on name
const placeholderFor = (name?: string) => {
  if (!name) return "/placeholder.svg"
  const key = name.toLowerCase()
  if (key.includes("aqua")) return "/aqua-aerobicos.jpg"
  if (key.includes("aerób")) return "/aerobicos.jpg"
  if (key.includes("body") && key.includes("combat")) return "/body-combat.jpg"
  if (key.includes("body") && key.includes("pump")) return "/body-pump.jpg"
  if (key.includes("func")) return "/funcional.jpg"
  if (key.includes("stretch") || key.includes("strech")) return "/stretching.jpg"
  if (key.includes("yoga")) return "/peaceful-yoga-class-with-people-in-meditation-pose.jpg"
  if (key.includes("cross") || key.includes("crossfit")) return "/crossfit-training-session-with-barbells-and-kettle.jpg"
  if (key.includes("spinn")) return "/spinning-class-with-bikes-and-energetic-lighting.jpg"
  if (key.includes("pilates")) return "/pilates-class-with-mats-and-reformer-equipment.jpg"
  if (key.includes("box")) return "/boxing-training-with-punching-bags-and-gloves.jpg"
  if (key.includes("zumba")) return "/zumba-dance-fitness-class-with-colorful-atmosphere.jpg"
  return "/placeholder.svg"
}

export function ClassesSection() {
  const { user, isClient, isTrainer, isAdmin } = useAuth()
  const router = useRouter()

  const [gymClases, setGymClases] = useState<GymClase[]>([])

  const canViewFullInfo = isClient() || isTrainer() || isAdmin()
  const canReserveClasses = isClient()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const ts = new Date().getTime()
        const res = await fetch(`/api/gym-clases?_t=${ts}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: GymClase[] = await res.json()
        if (mounted) setGymClases(data)
      } catch (err) {
        console.error("Error cargando gym-clases:", err)
        if (mounted) setGymClases([])
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <section id="clases" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Nuestras <span className="text-primary">Clases</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Descubre una amplia variedad de clases diseñadas para todos los niveles. Desde principiantes hasta atletas
            avanzados, tenemos algo para ti.
          </p>
          {!user && (
            <p className="text-sm text-muted-foreground mt-4 bg-muted/50 p-3 rounded-lg max-w-xl mx-auto">
              💡 Regístrate como cliente para ver horarios, capacidad y reservar clases
            </p>
          )}
          {user && user.role === "usuario" && (
            <p className="text-sm text-muted-foreground mt-4 bg-muted/50 p-3 rounded-lg max-w-xl mx-auto">
              💡 Contrata un plan mensual para acceder a reservas y información completa de clases
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gymClases.map((classItem) => {
            const nivel = (classItem.nivel || "todos").toLowerCase()
            const badge = nivel === "principiante" ? { text: "Principiante", classes: "bg-yellow-500 text-black" }
              : nivel === "intermedio" ? { text: "Intermedio", classes: "bg-red-500 text-white" }
              : { text: nivel === "todos" ? "Todos" : (classItem.nivel || "Todos"), classes: "bg-green-500 text-white" }

            return (
              <Card key={classItem.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={placeholderFor(classItem.nombre)}
                    alt={classItem.nombre}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.classes}`}>
                      {badge.text}
                    </span>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {classItem.nombre}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">{classItem.descripcion}</CardDescription>
                </CardHeader>

                <CardContent>
                  {canViewFullInfo && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {classItem.duracion_minutos ? `${classItem.duracion_minutos} min` : "-"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {classItem.max_participantes ? `${classItem.max_participantes} personas` : "-"}
                      </div>
                    </div>
                  )}

                  {canReserveClasses ? (
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => router.push("/cliente/reservar-clase")}
                    >
                      Reservar Clase
                    </Button>
                  ) : user && user.role === "usuario" ? (
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      Contrata un plan para reservar
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      Inicia sesión para reservar
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
