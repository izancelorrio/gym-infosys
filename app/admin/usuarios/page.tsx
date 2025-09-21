"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowLeft, UserCheck, Crown, Dumbbell, Filter } from "lucide-react"

export default function UsuariosPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [filtroRol, setFiltroRol] = useState<string>("todos")

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "administrador")) {
      router.push("/")
    }
  }, [user, router])

  if (!user || (user.role !== "admin" && user.role !== "administrador")) {
    return null
  }

  // Datos de ejemplo con el nuevo rol clientepro y básico
  const usuarios = [
    { id: 1, nombre: "Usuario", correo: "usuario@email.com", role: "usuario" },
    { id: 2, nombre: "Cliente", correo: "cliente@email.com", role: "cliente" },
    { id: 3, nombre: "ClientePro", correo: "clientepro@email.com", role: "clientepro", entrenador: "Carlos López" },
    { id: 4, nombre: "Admin", correo: "admin@email.com", role: "admin" },
    { id: 5, nombre: "Carlos López", correo: "carlos@email.com", role: "entrenador" },
    { id: 6, nombre: "Elena Moreno", correo: "elena@email.com", role: "entrenador" },
  ]

  const usuariosFiltrados = filtroRol === "todos" ? usuarios : usuarios.filter((usuario) => usuario.role === filtroRol)

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case "entrenador":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Dumbbell className="h-3 w-3 mr-1" />
            Entrenador
          </Badge>
        )
      case "clientepro":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <UserCheck className="h-3 w-3 mr-1" />
            Cliente Pro
          </Badge>
        )
      case "cliente":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Users className="h-3 w-3 mr-1" />
            Cliente
          </Badge>
        )
      case "usuario":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Users className="h-3 w-3 mr-1" />
            Usuario
          </Badge>
        )
      case "basico":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <Users className="h-3 w-3 mr-1" />
            Básico
          </Badge>
        )
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <p className="text-white/90">Administra todos los usuarios del gimnasio</p>
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

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {usuarios.filter((u) => u.role === "cliente").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Pro</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {usuarios.filter((u) => u.role === "clientepro").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Dumbbell className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entrenadores</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {usuarios.filter((u) => u.role === "entrenador").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Usuarios</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {usuarios.filter((u) => u.role === "usuario").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Crown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold text-red-600">{usuarios.filter((u) => u.role === "admin").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de usuarios */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Todos los Usuarios ({usuariosFiltrados.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold">ID</th>
                    <th className="text-left p-4 font-semibold">Nombre</th>
                    <th className="text-left p-4 font-semibold">Correo</th>
                    <th className="text-left p-4 font-semibold">
                      <div className="flex items-center gap-2">
                        Rol
                        <div className="flex items-center gap-1">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                          <select
                            value={filtroRol}
                            onChange={(e) => setFiltroRol(e.target.value)}
                            className="px-2 py-1 border border-border rounded-md bg-background text-xs"
                          >
                            <option value="todos">Todos</option>
                            <option value="admin">Admin</option>
                            <option value="entrenador">Entrenador</option>
                            <option value="clientepro">Cliente Pro</option>
                            <option value="cliente">Cliente</option>
                            <option value="usuario">Usuario</option>
                            <option value="basico">Básico</option>
                          </select>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/usuarios/${usuario.id}`)}
                    >
                      <td className="p-4 font-mono text-sm">{usuario.id.toString().padStart(3, "0")}</td>
                      <td className="p-4 font-medium">{usuario.nombre}</td>
                      <td className="p-4 text-muted-foreground">{usuario.correo}</td>
                      <td className="p-4">{getRoleBadge(usuario.role)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
