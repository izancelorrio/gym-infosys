"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, Users, Calendar, Activity, DoorOpen, Flame } from "lucide-react"
import { API_CONFIG } from "@/lib/config"

  type AdminStats = {
    success?: boolean
    totales?: Record<string, number>
    planes?: Array<{ id: number; nombre: string; clientes: number }>
    top_clases?: Array<{ nombre: string; reservas: number }>
    top_ejercicios?: Array<{ nombre: string; frecuencia: number }>
    nuevos_por_mes?: Array<{ mes: string; cantidad: number }>
  }

  function Chart({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
    return (
      <div className={`bg-muted/40 rounded-md p-4 h-48 flex items-center justify-center border border-border ${className}`}>
        <div className="text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto opacity-20" />
          <p className="mt-2 text-sm">{children || "Gráfica (simulada)"}</p>
        </div>
      </div>
    )
  }

  export default function EstadisticasPage() {
    const { user } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState<boolean>(false)
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [seccionActiva, setSeccionActiva] = useState<string>("afluencia")

    useEffect(() => {
      if (!user || user.role !== "admin") {
        router.push("/")
      }
    }, [user, router])

    useEffect(() => {
      const fetchStats = async () => {
        setLoading(true)
        try {
          const res = await fetch(`/api/admin/estadisticas`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          setStats(json)
        } catch (err) {
          console.error("Error fetching admin/estadisticas:", err)
          setStats(null)
        } finally {
          setLoading(false)
        }
      }

      fetchStats()
    }, [])

    if (!user || user.role !== "admin") return null

    const tot = stats?.totales || {}
    const planes = stats?.planes || []
    const topClases = stats?.top_clases || []
    const topEjercicios = stats?.top_ejercicios || []

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Estadísticas</h1>
                  <p className="text-white/90 text-sm">Resumen global del gimnasio</p>
                </div>
              </div>
              <Button onClick={() => router.push("/admin")} variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Usuarios</p>
                    <p className="text-lg font-bold">{tot.total_users ?? "–"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Planes</p>
                    <p className="text-lg font-bold">{tot.total_planes ?? "–"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reservas completadas</p>
                    <p className="text-lg font-bold">{tot.total_reservas_completadas ?? "–"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <DoorOpen className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reservas activas</p>
                    <p className="text-lg font-bold">{tot.total_reservas_activas ?? "–"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card md:col-span-2">
              <CardHeader>
                <CardTitle>Clases más populares</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Cargando...</p>
                ) : (
                  <div className="space-y-3">
                    {topClases.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                    ) : (
                      topClases.map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-muted/20 p-2 rounded-md">
                              <Flame className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <div className="font-medium">{c.nombre}</div>
                              <div className="text-xs text-muted-foreground">{c.reservas} reservas</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">{c.reservas}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Top ejercicios</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Cargando...</p>
                ) : (
                  <ul className="space-y-2">
                    {topEjercicios.length === 0 ? (
                      <li className="text-sm text-muted-foreground">No hay datos</li>
                    ) : (
                      topEjercicios.map((e, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span>{e.nombre}</span>
                          <Badge className="bg-blue-100 text-blue-800">{e.frecuencia}</Badge>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Clientes por plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {planes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay datos</p>
                  ) : (
                    planes.map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{p.nombre}</div>
                          <div className="text-xs text-muted-foreground">{p.clientes} clientes</div>
                        </div>
                        <Badge>{p.clientes}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Nuevas inscripciones (últimos meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.nuevos_por_mes && stats.nuevos_por_mes.length > 0 ? (
                    stats.nuevos_por_mes.map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span>{m.mes}</span>
                        <Badge>{m.cantidad}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay datos</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }