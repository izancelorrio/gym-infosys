import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Gift } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Gift className="h-16 w-16 text-primary-foreground mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              ¡Comienza Tu Transformación Hoy!
            </h2>
            <p className="text-lg text-primary-foreground/90 text-pretty">
              Únete a Gym-InfoSys y obtén tu primera semana completamente gratis. Sin compromisos, sin letras pequeñas.
            </p>
          </div>

          <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-primary-foreground mb-4">Tu Semana Gratis Incluye:</h3>
                  <ul className="space-y-3">
                    {[
                      "Acceso completo a todas las instalaciones",
                      "Evaluación física gratuita",
                      "Plan de entrenamiento personalizado",
                      "Todas las clases grupales",
                      "Asesoría nutricional básica",
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3 text-primary-foreground/90">
                        <Check className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-primary-foreground mb-2">7 Días</div>
                    <div className="text-primary-foreground/80">Completamente Gratis</div>
                  </div>

                  <Button
                    size="lg"
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-3 w-full sm:w-auto"
                  >
                    Reclamar Semana Gratis
                  </Button>

                  <p className="text-xs text-primary-foreground/70 mt-3">No se requiere tarjeta de crédito</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
