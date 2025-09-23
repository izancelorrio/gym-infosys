import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "María González",
    role: "Miembro desde 2022",
    content:
      "Gym-InfoSys cambió mi vida completamente. Los entrenadores son increíbles y el ambiente es muy motivador. He perdido 15 kilos y me siento más fuerte que nunca.",
    rating: 5,
    image: "/happy-woman-smiling-after-workout.jpg",
  },
  {
    name: "Carlos Rodríguez",
    role: "Atleta Amateur",
    content:
      "Las instalaciones son de primera clase y los equipos siempre están en perfecto estado. Las clases de CrossFit me han ayudado a mejorar mi rendimiento deportivo.",
    rating: 5,
    image: "/athletic-man-in-gym-clothes-smiling.jpg",
  },
  {
    name: "Ana Martínez",
    role: "Profesional Ocupada",
    content:
      "Con mi horario tan apretado, el acceso 24/7 es perfecto para mí. Puedo entrenar cuando me convenga y siempre hay personal disponible para ayudar.",
    rating: 5,
    image: "/professional-woman-in-workout-attire.jpg",
  },
  {
    name: "Luis Fernández",
    role: "Principiante",
    content:
      "Llegué sin experiencia y con miedo, pero el equipo me hizo sentir bienvenido desde el primer día. Ahora el gimnasio es mi lugar favorito.",
    rating: 5,
    image: "/young-man-smiling-confidently-in-gym.jpg",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonios" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Lo Que Dicen Nuestros <span className="text-primary">Miembros</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Historias reales de transformación y éxito de nuestra comunidad fitness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">"{testimonial.content}"</p>

                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
