"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BarChart3, LogOut, UserCheck, Clock, TrendingUp, UserPlus } from "lucide-react"

export default function AdminPage() {
  const { user, logout } = useAuth()
  const router = useRouter()


  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
    }
  }, [user, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (!user || user.role !== "admin") {
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
                <UserCheck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Panel de Administrador</h1>
                <p className="text-white/90">Gestión completa del gimnasio</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Estadísticas Globales Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Usuarios</p>
                  <p className="text-2xl font-bold text-primary">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clases Hoy</p>
                  <p className="text-2xl font-bold text-primary">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos Mes</p>
                  <p className="text-2xl font-bold text-primary">€8,450</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opciones de Gestión */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-3 rounded-full">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold">Opciones de Gestión</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gestión de Usuarios */}
          <Card className="bg-card border-border shadow-lg hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Administra usuarios, entrenadores y clientes del gimnasio</p>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={() => router.push("/admin/usuarios")}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ver Todos los Usuarios
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={() => router.push("/admin/asignaciones")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Asignar Entrenador
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calendario de Clases */}
          <Card className="bg-card border-border shadow-lg hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                Calendario de Clases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Programa y gestiona las clases grupales del gimnasio</p>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={() => router.push("/admin/clases")}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Calendario
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={() => router.push("/admin/programar-clase")}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Programar Clase
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas Globales */}
          <Card className="bg-card border-border shadow-lg hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                Estadísticas Globales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Analiza el rendimiento general del gimnasio</p>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  onClick={() => router.push("/admin/estadisticas")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Estadísticas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  )
}
