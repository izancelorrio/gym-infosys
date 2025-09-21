"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Dumbbell, Hash } from "lucide-react"

interface EjercicioDetalle {
  id: number
  ejercicio: string
  series: number
  repeticiones: string
  peso: string
  tiempoDescanso: number
}

interface DetalleEntrenamiento {
  id: number
  fecha: string
  tiempoTotal: number
  ejercicios: EjercicioDetalle[]
}

export default function DesgloseEntrenamientoPage({
  params,
}: {
  params: { clienteId: string; estadisticaId: string }
}) {
  const { user, isTrainer, isAuthenticated } = useAuth()
  const router = useRouter()
  const [detalleEntrenamiento, setDetalleEntrenamiento] = useState<DetalleEntrenamiento | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!isTrainer()) {
      router.push("/")
      return
    }

    // Datos simulados del desglose del entrenamiento
    const detalleSimulado: DetalleEntrenamiento = {
      id: Number.parseInt(params.estadisticaId),
      fecha: "2024-01-15",
      tiempoTotal: 75,
      ejercicios: [
        {
          id: 1,
          ejercicio: "Press de banca",
          series: 4,
          repeticiones: "12, 10, 8, 6",
          peso: "60, 65, 70, 75 kg",
          tiempoDescanso: 90,
        },
        {
          id: 2,
          ejercicio: "Sentadillas",
          series: 3,
          repeticiones: "15, 12, 10",
          peso: "80, 85, 90 kg",
          tiempoDescanso: 120,
        },
        {
          id: 3,
          ejercicio: "Remo con barra",
          series: 3,
          repeticiones: "12, 10, 8",
          peso: "50, 55, 60 kg",
          tiempoDescanso: 90,
        },
        {
          id: 4,
          ejercicio: "Press militar",
          series: 3,
          repeticiones: "10, 8, 6",
          peso: "40, 45, 50 kg",
          tiempoDescanso: 90,
        },
        {
          id: 5,
          ejercicio: "Dominadas",
          series: 3,
          repeticiones: "8, 6, 5",
          peso: "Peso corporal",
          tiempoDescanso: 120,
        },
      ],
    }

    setDetalleEntrenamiento(detalleSimulado)
    setIsLoading(false)
  }, [isAuthenticated, isTrainer, router, params.estadisticaId])

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando desglose...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="border-border shadow-lg bg-card">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 border-4 border-white/20 rounded-full bg-secondary flex items-center justify-center">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Desglose del Entrenamiento</CardTitle>
                  <p className="text-orange-100">{formatearFecha(detalleEntrenamiento?.fecha || "")}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {formatearTiempo(detalleEntrenamiento?.tiempoTotal || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Duración total</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{detalleEntrenamiento?.ejercicios.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Ejercicios</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Hash className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {detalleEntrenamiento?.ejercicios.reduce((acc, ej) => acc + ej.series, 0) || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Series totales</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-lg bg-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Dumbbell className="h-5 w-5" />
              <span>Ejercicios Realizados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {detalleEntrenamiento?.ejercicios.map((ejercicio, index) => (
                <div key={ejercicio.id} className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-foreground text-lg">{ejercicio.ejercicio}</h3>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">{ejercicio.series} series</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Repeticiones:</span>
                      <p className="text-foreground font-medium">{ejercicio.repeticiones}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Peso:</span>
                      <p className="text-foreground font-medium">{ejercicio.peso}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Descanso:</span>
                      <p className="text-foreground font-medium">{ejercicio.tiempoDescanso}s</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
