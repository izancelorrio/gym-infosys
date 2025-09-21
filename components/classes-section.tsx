"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const classes = [
  {
    name: "CrossFit",
    description: "Entrenamiento funcional de alta intensidad para mejorar tu condición física general.",
    duration: "60 min",
    capacity: "12 personas",
    intensity: "Alta",
    image: "/crossfit-training-session-with-barbells-and-kettle.jpg",
  },
  {
    name: "Yoga",
    description: "Encuentra tu equilibrio interior mientras fortaleces tu cuerpo y mente.",
    duration: "75 min",
    capacity: "20 personas",
    intensity: "Baja",
    image: "/peaceful-yoga-class-with-people-in-meditation-pose.jpg",
  },
  {
    name: "Spinning",
    description: "Pedalea al ritmo de la música en nuestras clases de ciclismo indoor más energéticas.",
    duration: "45 min",
    capacity: "25 personas",
    intensity: "Alta",
    image: "/spinning-class-with-bikes-and-energetic-lighting.jpg",
  },
  {
    name: "Pilates",
    description: "Fortalece tu core y mejora tu postura con ejercicios controlados y precisos.",
    duration: "60 min",
    capacity: "15 personas",
    intensity: "Media",
    image: "/pilates-class-with-mats-and-reformer-equipment.jpg",
  },
  {
    name: "Boxeo",
    description: "Libera el estrés mientras aprendes técnicas de boxeo y mejoras tu cardio.",
    duration: "50 min",
    capacity: "16 personas",
    intensity: "Alta",
    image: "/boxing-training-with-punching-bags-and-gloves.jpg",
  },
  {
    name: "Zumba",
    description: "Baila, diviértete y quema calorías con los ritmos latinos más contagiosos.",
    duration: "55 min",
    capacity: "30 personas",
    intensity: "Media",
    image: "/zumba-dance-fitness-class-with-colorful-atmosphere.jpg",
  },
]

export function ClassesSection() {
  const { user, isClient, isTrainer, isAdmin } = useAuth()

  const canViewFullInfo = isClient() || isTrainer() || isAdmin()
  const canReserveClasses = isClient()

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
          {classes.map((classItem, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative overflow-hidden">
                <img
                  src={classItem.image || "/placeholder.svg"}
                  alt={classItem.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      classItem.intensity === "Alta"
                        ? "bg-red-500 text-white"
                        : classItem.intensity === "Media"
                          ? "bg-yellow-500 text-black"
                          : "bg-green-500 text-white"
                    }`}
                  >
                    {classItem.intensity}
                  </span>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {classItem.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">{classItem.description}</CardDescription>
              </CardHeader>

              <CardContent>
                {canViewFullInfo && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {classItem.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {classItem.capacity}
                    </div>
                  </div>
                )}

                {canReserveClasses ? (
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
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
          ))}
        </div>
      </div>
    </section>
  )
}
