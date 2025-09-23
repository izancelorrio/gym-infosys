"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Calendar, 
  Timer, 
  TrendingUp, 
  Activity,
  DoorOpen,
  Clock,
  Dumbbell,
  Zap,
  CheckSquare,
  X,
  Flame
} from "lucide-react"

// Componente ficticio para representar gráficas
function Chart({ children, className = "" }: { children?: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-muted/40 rounded-md p-4 h-48 flex items-center justify-center border border-border ${className}`}>
      <div className="text-center text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto opacity-20" />
        <p className="mt-2 text-sm">{children || "Datos de gráfica (simulado)"}</p>
      </div>
    </div>
  )
}

// Datos ficticios para las estadísticas
const dataAfluencia = [
  { dia: "Lunes", total: 145, pico: "18:00-20:00" },
  { dia: "Martes", total: 132, pico: "19:00-21:00" },
  { dia: "Miércoles", total: 151, pico: "18:00-20:00" },
  { dia: "Jueves", total: 128, pico: "17:00-19:00" },
  { dia: "Viernes", total: 112, pico: "18:00-20:00" },
  { dia: "Sábado", total: 95, pico: "11:00-13:00" },
  { dia: "Domingo", total: 73, pico: "10:00-12:00" }
]

const clasesMasPopulares = [
  { nombre: "Crossfit", asistencia: "92%", valoracion: 4.8 },
  { nombre: "Spinning", asistencia: "87%", valoracion: 4.7 },
  { nombre: "Yoga", asistencia: "85%", valoracion: 4.9 },
  { nombre: "Pilates", asistencia: "83%", valoracion: 4.6 },
  { nombre: "Zumba", asistencia: "78%", valoracion: 4.5 }
]

const usoRecursos = [
  { recurso: "Zona pesas", uso: "85%", horas: "8:00-22:00", estado: "óptimo" },
  { recurso: "Piscina", uso: "72%", horas: "7:00-21:00", estado: "mantenimiento programado" },
  { recurso: "Sauna", uso: "45%", horas: "9:00-21:00", estado: "óptimo" },
  { recurso: "Sala yoga", uso: "68%", horas: "8:00-21:00", estado: "óptimo" },
  { recurso: "Máquinas cardio", uso: "93%", horas: "6:00-23:00", estado: "alta demanda" }
]

const usuariosActivos = [
  { hora: "6:00-8:00", cantidad: 35, tipo: "Principalmente clientePro" },
  { hora: "8:00-12:00", cantidad: 67, tipo: "Mixto" },
  { hora: "12:00-14:00", cantidad: 98, tipo: "Mixto" },
  { hora: "14:00-16:00", cantidad: 56, tipo: "Principalmente cliente" },
  { hora: "16:00-19:00", cantidad: 115, tipo: "Mixto" },
  { hora: "19:00-22:00", cantidad: 142, tipo: "Principalmente cliente" },
  { hora: "22:00-00:00", cantidad: 48, tipo: "Principalmente clientePro" }
]

const accesosRecientes = [
  { usuario: "Carlos García", hora: "08:32", tipo: "Entrada", tipoUsuario: "clientePro" },
  { usuario: "María López", hora: "08:45", tipo: "Entrada", tipoUsuario: "cliente" },
  { usuario: "Juan Martínez", hora: "09:15", tipo: "Entrada", tipoUsuario: "clientePro" },
  { usuario: "Laura Fernández", hora: "09:30", tipo: "Entrada", tipoUsuario: "clientePro" },
  { usuario: "Pedro Sánchez", hora: "09:55", tipo: "Salida", tipoUsuario: "cliente" },
  { usuario: "Carmen Ruiz", hora: "10:20", tipo: "Entrada", tipoUsuario: "cliente" }
]

export default function EstadisticasPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [seccionActiva, setSeccionActiva] = useState<string>("afluencia")

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "administrador")) {
      router.push("/")
    }
  }, [user, router])

  if (!user || (user.role !== "admin" && user.role !== "administrador")) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Estadísticas del Gimnasio</h1>
                <p className="text-white/90">Análisis de rendimiento y uso de instalaciones</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        {/* Resumen Rápido */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card 
            className={`bg-card border-border shadow-lg cursor-pointer ${seccionActiva === 'afluencia' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSeccionActiva('afluencia')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Afluencia</p>
                  <p className="text-lg font-bold text-primary">836 usuarios/semana</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`bg-card border-border shadow-lg cursor-pointer ${seccionActiva === 'clases' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSeccionActiva('clases')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Clases</p>
                  <p className="text-lg font-bold text-primary">85% ocupación</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`bg-card border-border shadow-lg cursor-pointer ${seccionActiva === 'recursos' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSeccionActiva('recursos')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uso Recursos</p>
                  <p className="text-lg font-bold text-primary">72.6% promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`bg-card border-border shadow-lg cursor-pointer ${seccionActiva === 'usuarios' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSeccionActiva('usuarios')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usuarios Activos</p>
                  <p className="text-lg font-bold text-primary">78 ahora mismo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`bg-card border-border shadow-lg cursor-pointer ${seccionActiva === 'accesos' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSeccionActiva('accesos')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <DoorOpen className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Accesos Hoy</p>
                  <p className="text-lg font-bold text-primary">237 entradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Afluencia */}
        {seccionActiva === 'afluencia' && (
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                Panel de Afluencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">Afluencia Semanal</h3>
                  <Chart className="h-72">Gráfica de barras de afluencia por día de la semana</Chart>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-4">Horas Pico</h3>
                  <Chart className="h-72">Gráfica de línea de afluencia por hora del día</Chart>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">Detalle de Afluencia por Día</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 font-medium">Día</th>
                        <th className="text-left p-2 font-medium">Total Visitas</th>
                        <th className="text-left p-2 font-medium">Hora Pico</th>
                        <th className="text-left p-2 font-medium">Tendencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataAfluencia.map((dia, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-2 font-medium">{dia.dia}</td>
                          <td className="p-2">{dia.total}</td>
                          <td className="p-2">{dia.pico}</td>
                          <td className="p-2">
                            {i % 2 === 0 ? (
                              <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +5%
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                                -3%
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reportes de Clases */}
        {seccionActiva === 'clases' && (
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-green-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                Reportes de Clases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">Asistencia por Clase</h3>
                  <Chart className="h-72">Gráfica de barras de porcentaje de asistencia por clase</Chart>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-4">Valoración de Clases</h3>
                  <Chart className="h-72">Gráfica de puntos de valoración media por clase</Chart>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">Clases Más Populares</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clasesMasPopulares.map((clase, i) => (
                    <Card key={i} className="bg-muted/30 border-border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{clase.nombre}</h4>
                          <Badge className="bg-green-100 text-green-800">
                            {clase.asistencia}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-amber-100 p-1 rounded-full">
                            <Flame className="h-3 w-3 text-amber-600" />
                          </div>
                          <span className="text-sm">{clase.valoracion}/5 valoración</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-muted/30 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Rendimiento Semanal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Total clases impartidas</span>
                        <span className="font-medium">65</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Promedio de asistencia</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Valoración promedio</span>
                        <span className="font-medium">4.7/5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Clases canceladas</span>
                        <span className="font-medium">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Comparativa Entrenadores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Chart>Gráfica de valoración por entrenador</Chart>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas de Uso de Recursos */}
        {seccionActiva === 'recursos' && (
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                Uso de Recursos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">Uso por Área</h3>
                  <Chart className="h-72">Gráfica de ocupación por área del gimnasio</Chart>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-4">Uso Horario</h3>
                  <Chart className="h-72">Mapa de calor de uso por hora y área</Chart>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">Estado de Recursos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 font-medium">Recurso</th>
                        <th className="text-left p-2 font-medium">Uso Promedio</th>
                        <th className="text-left p-2 font-medium">Horario Disponible</th>
                        <th className="text-left p-2 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usoRecursos.map((recurso, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-2 font-medium">{recurso.recurso}</td>
                          <td className="p-2">{recurso.uso}</td>
                          <td className="p-2">{recurso.horas}</td>
                          <td className="p-2">
                            {recurso.estado === "óptimo" ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckSquare className="h-3 w-3 mr-1" />
                                Óptimo
                              </Badge>
                            ) : recurso.estado === "alta demanda" ? (
                              <Badge className="bg-amber-100 text-amber-800">
                                <Zap className="h-3 w-3 mr-1" />
                                Alta Demanda
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">
                                <Timer className="h-3 w-3 mr-1" />
                                Mantenimiento
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/30 border-border">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base">Eficiencia Energética</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Consumo vs. semana anterior</span>
                      <Badge className="bg-green-100 text-green-800">-5.2%</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30 border-border">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base">Mantenimientos Pendientes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Equipos en revisión</span>
                      <Badge className="bg-amber-100 text-amber-800">3</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30 border-border">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-base">Satisfacción</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Valoración equipamiento</span>
                      <Badge className="bg-blue-100 text-blue-800">4.6/5</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usuarios Activos */}
        {seccionActiva === 'usuarios' && (
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                Usuarios Activos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">Distribución por Hora</h3>
                  <Chart className="h-72">Gráfica de usuarios activos por hora</Chart>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-4">Distribución por Tipo</h3>
                  <Chart className="h-72">Gráfica de pastel de tipos de usuario</Chart>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">Actividad por Franja Horaria</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 font-medium">Franja Horaria</th>
                        <th className="text-left p-2 font-medium">Usuarios</th>
                        <th className="text-left p-2 font-medium">Distribución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosActivos.map((franja, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-2 font-medium">{franja.hora}</td>
                          <td className="p-2">{franja.cantidad}</td>
                          <td className="p-2">{franja.tipo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2 bg-muted/30 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Actividad en Tiempo Real</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Chart className="h-48">Gráfica en tiempo real de actividad</Chart>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Ahora Mismo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Usuarios en gimnasio</span>
                          <span className="font-bold text-lg text-primary">78</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">En clases grupales</span>
                          <span className="font-medium">34</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">En zona de pesas</span>
                          <span className="font-medium">22</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">En cardio</span>
                          <span className="font-medium">15</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Otras zonas</span>
                          <span className="font-medium">7</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control de Accesos */}
        {seccionActiva === 'accesos' && (
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-red-100 p-2 rounded-full">
                  <DoorOpen className="h-5 w-5 text-red-600" />
                </div>
                Control de Accesos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-lg mb-4">Accesos por Día</h3>
                  <Chart className="h-72">Gráfica de barras de accesos diarios</Chart>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-4">Entradas/Salidas por Hora</h3>
                  <Chart className="h-72">Gráfica de línea de flujo de personas</Chart>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">Últimos Accesos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 font-medium">Usuario</th>
                        <th className="text-left p-2 font-medium">Hora</th>
                        <th className="text-left p-2 font-medium">Tipo</th>
                        <th className="text-left p-2 font-medium">Categoría</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accesosRecientes.map((acceso, i) => (
                        <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="p-2 font-medium">{acceso.usuario}</td>
                          <td className="p-2">{acceso.hora}</td>
                          <td className="p-2">
                            {acceso.tipo === "Entrada" ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckSquare className="h-3 w-3 mr-1" />
                                Entrada
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <X className="h-3 w-3 mr-1" />
                                Salida
                              </Badge>
                            )}
                          </td>
                          <td className="p-2">
                            {acceso.tipoUsuario === "clientePro" ? (
                              <Badge className="bg-purple-100 text-purple-800">Pro</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800">Básico</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-muted/30 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium">Hoy</h3>
                      <Badge className="bg-blue-100 text-blue-800">237</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Total de accesos</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium">Pico de hoy</h3>
                      <Badge className="bg-blue-100 text-blue-800">18:00-19:00</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">42 accesos</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium">Semana</h3>
                      <Badge className="bg-blue-100 text-blue-800">+12%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">vs semana anterior</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium">Incidencias</h3>
                      <Badge className="bg-green-100 text-green-800">0</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Hoy</p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tiempo Promedio en Instalaciones
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Clientes Básicos</span>
                    <p className="font-bold">1h 15min</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Clientes Pro</span>
                    <p className="font-bold">1h 45min</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Días Laborables</span>
                    <p className="font-bold">1h 30min</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Fin de Semana</span>
                    <p className="font-bold">1h 50min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}