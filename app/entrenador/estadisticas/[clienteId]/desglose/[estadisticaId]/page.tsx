"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Dumbbell, Hash } from "lucide-react"
import { API_CONFIG } from "@/lib/config"

interface EjercicioDetalle {
  id: number
  ejercicio: string
  series: number
  repeticiones: string
  peso: string
  tiempoDescanso: number
  valoracion?: number | null
  notas?: string | null
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

    const fetchDetalle = async () => {
      setIsLoading(true)
      try {
        // Si el parámetro es fecha (YYYY-MM-DD) pedimos las estadisticas del cliente y filtramos por fecha
        const fechaParam = params.estadisticaId
        const isFecha = /^\d{4}-\d{2}-\d{2}$/.test(fechaParam)

        if (isFecha) {
          const res = await fetch(`${API_CONFIG.BASE_URL}/cliente/${params.clienteId}/estadisticas`)
          if (res.ok) {
            const json = await res.json()
            const realizados = json.ejercicios_realizados || []
            // Filtrar por fecha (comparamos YYYY-MM-DD)
            const itemsDelDia = realizados.filter((r: any) => {
              const d = new Date(r.fecha_realizacion || r.fecha || '')
              if (isNaN(d.getTime())) return false
              return d.toISOString().slice(0, 10) === fechaParam
            })

            if (itemsDelDia.length > 0) {
              const detalle: DetalleEntrenamiento = {
                id: 0,
                fecha: fechaParam,
                tiempoTotal: 0,
                ejercicios: itemsDelDia.map((it: any, idx: number) => ({
                  id: idx + 1,
                  ejercicio: it.ejercicio_nombre || it.nombre || 'Ejercicio',
                  series: Number(it.series_realizadas ?? it.series ?? 0) || 0,
                  repeticiones: String(it.repeticiones ?? ''),
                  peso: String(it.peso_kg != null ? it.peso_kg : it.peso ?? '—'),
                  tiempoDescanso: Number(it.tiempo_descanso ?? 60),
                  valoracion: it.valoracion ?? it.rating ?? null,
                  notas: it.notas ?? it.notes ?? null,
                })),
              }
              setDetalleEntrenamiento(detalle)
              setIsLoading(false)
              return
            }
          }
        }

        // Fallback: datos simulados si no hay datos reales
        const detalleSimulado: DetalleEntrenamiento = {
          id: Number.parseInt(params.estadisticaId) || 0,
          fecha: isFecha ? params.estadisticaId : '2024-01-15',
          tiempoTotal: 75,
          ejercicios: [
            {
              id: 1,
              ejercicio: 'Press de banca',
              series: 4,
              repeticiones: '12, 10, 8, 6',
              peso: '60, 65, 70, 75 kg',
              tiempoDescanso: 90,
              valoracion: 4,
              notas: 'Buena ejecución, aumentar peso la próxima semana',
            },
            {
              id: 2,
              ejercicio: 'Sentadillas',
              series: 3,
              repeticiones: '15, 12, 10',
              peso: '80, 85, 90 kg',
              tiempoDescanso: 120,
              valoracion: null,
              notas: '',
            },
          ],
        }

        setDetalleEntrenamiento(detalleSimulado)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching desglose:', err)
        setIsLoading(false)
      }
    }

    fetchDetalle()
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
        {/* Header frame similar to other pages */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 border-4 border-white/20 rounded-full bg-secondary flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Desglose del Entrenamiento</h3>
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
        </div>

        {/* Stats card below header */}
        <Card className="border-border shadow-lg bg-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="text-2xl font-bold text-primary">{detalleEntrenamiento?.ejercicios.reduce((acc, ej) => acc + ej.series, 0) || 0}</p>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Series:</span>
                      <p className="text-foreground font-medium">{ejercicio.series}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Repeticiones:</span>
                      <p className="text-foreground font-medium">{ejercicio.repeticiones}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Peso:</span>
                      <p className="text-foreground font-medium">{ejercicio.peso}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valoración:</span>
                      <p className="text-foreground font-medium">{ejercicio.valoracion != null ? `${ejercicio.valoracion}/5` : '—'}</p>
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Nota:</span>
                    <p className="text-foreground font-medium mt-1">{ejercicio.notas && ejercicio.notas.trim().length > 0 ? ejercicio.notas : 'El cliente no ha dejado nota para este ejercicio'}</p>
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
