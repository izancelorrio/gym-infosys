"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, Dumbbell, Hash } from "lucide-react"

interface EstadisticaEntrenamiento {
  id: number
  fecha: string
  tiempoTotal: number // en minutos
  numeroEjercicios: number
  numeroSeries: number
}

interface Cliente {
  id: number
  name: string
  email: string
  avatar?: string
}

export default function EstadisticasClientePage({ params }: { params: { clienteId: string } }) {
  const { user, isTrainer, isAuthenticated } = useAuth()
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticaEntrenamiento[]>([])
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

    // Datos simulados del cliente
    const clienteSimulado: Cliente = {
      id: Number.parseInt(params.clienteId),
      name: "Ana García",
      email: "ana.garcia@email.com",
    }

    // Datos simulados de estadísticas (ordenados de más reciente a más antiguo)
    const estadisticasSimuladas: EstadisticaEntrenamiento[] = [
      {
        id: 1,
        fecha: "2024-01-15",
        tiempoTotal: 75,
        numeroEjercicios: 8,
        numeroSeries: 24,
      },
      {
        id: 2,
        fecha: "2024-01-13",
        tiempoTotal: 60,
        numeroEjercicios: 6,
        numeroSeries: 18,
      },
      {
        id: 3,
        fecha: "2024-01-11",
        tiempoTotal: 90,
        numeroEjercicios: 10,
        numeroSeries: 30,
      },
      {
        id: 4,
        fecha: "2024-01-09",
        tiempoTotal: 45,
        numeroEjercicios: 5,
        numeroSeries: 15,
      },
      {
        id: 5,
        fecha: "2024-01-07",
        tiempoTotal: 80,
        numeroEjercicios: 9,
        numeroSeries: 27,
      },
    ]

    setCliente(clienteSimulado)
    setEstadisticas(estadisticasSimuladas)
    setIsLoading(false)
  }, [isAuthenticated, isTrainer, router, params.clienteId])

  const handleVerDesglose = (estadisticaId: number, fecha: string) => {
    router.push(`/entrenador/estadisticas/${params.clienteId}/desglose/${estadisticaId}`)
  }

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
        <div className="text-lg">Cargando estadísticas...</div>
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
                <Avatar className="border-4 border-white/20">
                  <AvatarImage src={cliente?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                    {cliente?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Estadísticas de {cliente?.name}</CardTitle>
                  <p className="text-orange-100">{cliente?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.push("/entrenador")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{estadisticas.length}</p>
                  <p className="text-sm text-muted-foreground">Entrenamientos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {formatearTiempo(estadisticas.reduce((acc, est) => acc + est.tiempoTotal, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Tiempo total</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {estadisticas.reduce((acc, est) => acc + est.numeroEjercicios, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Ejercicios totales</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary rounded-full">
                  <Hash className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {estadisticas.reduce((acc, est) => acc + est.numeroSeries, 0)}
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
              <Calendar className="h-5 w-5" />
              <span>Historial de Entrenamientos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="font-semibold text-foreground">Fecha</div>
                <div className="font-semibold text-foreground text-center">Tiempo</div>
                <div className="font-semibold text-foreground text-center">Ejercicios</div>
                <div className="font-semibold text-foreground text-center">Series</div>
              </div>

              {estadisticas.map((estadistica) => (
                <div
                  key={estadistica.id}
                  className="grid grid-cols-4 gap-4 p-4 border border-border rounded-lg bg-card hover:bg-muted hover:border-primary/50 transition-all duration-200 shadow-sm cursor-pointer"
                  onClick={() => handleVerDesglose(estadistica.id, estadistica.fecha)}
                >
                  <div className="text-foreground">
                    <div className="font-medium">{formatearFecha(estadistica.fecha)}</div>
                    <div className="text-sm text-muted-foreground">{estadistica.fecha}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">{formatearTiempo(estadistica.tiempoTotal)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{estadistica.numeroEjercicios}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{estadistica.numeroSeries}</div>
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
