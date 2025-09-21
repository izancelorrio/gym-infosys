"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, ArrowLeft, UserCheck, Crown, Dumbbell, Save, User } from "lucide-react"

export default function DetalleUsuarioPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [usuarioData, setUsuarioData] = useState<any>(null)
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "administrador")) {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    // Datos de ejemplo - en una app real vendría de la base de datos
    const usuarios = [
      {
        id: 1,
        nombre: "Juan Pérez",
        correo: "juan@email.com",
        role: "cliente",
        telefono: "123-456-789",
        fechaRegistro: "2024-01-15",
      },
      {
        id: 2,
        nombre: "María García",
        correo: "maria@email.com",
        role: "clientepro",
        entrenador: "Carlos López",
        telefono: "987-654-321",
        fechaRegistro: "2024-02-20",
      },
      {
        id: 3,
        nombre: "Carlos López",
        correo: "carlos@email.com",
        role: "entrenador",
        telefono: "555-123-456",
        fechaRegistro: "2023-12-01",
      },
      {
        id: 4,
        nombre: "Ana Martín",
        correo: "ana@email.com",
        role: "basico",
        telefono: "111-222-333",
        fechaRegistro: "2024-03-10",
      },
      {
        id: 5,
        nombre: "Pedro Ruiz",
        correo: "pedro@email.com",
        role: "clientepro",
        entrenador: "Elena Moreno",
        telefono: "444-555-666",
        fechaRegistro: "2024-01-25",
      },
      {
        id: 6,
        nombre: "Laura Sánchez",
        correo: "laura@email.com",
        role: "entrenador",
        telefono: "777-888-999",
        fechaRegistro: "2023-11-15",
      },
      {
        id: 7,
        nombre: "Miguel Torres",
        correo: "miguel@email.com",
        role: "admin",
        telefono: "000-111-222",
        fechaRegistro: "2023-10-01",
      },
      {
        id: 8,
        nombre: "Carmen Díaz",
        correo: "carmen@email.com",
        role: "basico",
        telefono: "333-444-555",
        fechaRegistro: "2024-02-14",
      },
      {
        id: 9,
        nombre: "Roberto Silva",
        correo: "roberto@email.com",
        role: "clientepro",
        entrenador: "Laura Sánchez",
        telefono: "666-777-888",
        fechaRegistro: "2024-01-30",
      },
      {
        id: 10,
        nombre: "Elena Moreno",
        correo: "elena@email.com",
        role: "entrenador",
        telefono: "999-000-111",
        fechaRegistro: "2023-12-20",
      },
      {
        id: 11,
        nombre: "David Herrera",
        correo: "david@email.com",
        role: "cliente",
        telefono: "222-333-444",
        fechaRegistro: "2024-03-05",
      },
      {
        id: 12,
        nombre: "Isabel Castro",
        correo: "isabel@email.com",
        role: "basico",
        telefono: "555-666-777",
        fechaRegistro: "2024-02-28",
      },
    ]

    const usuario = usuarios.find((u) => u.id === Number.parseInt(userId))
    setUsuarioData(usuario)
  }, [userId])

  if (!user || (user.role !== "admin" && user.role !== "administrador")) {
    return null
  }

  if (!usuarioData) {
    return <div>Cargando...</div>
  }

  const entrenadores = ["Carlos López", "Laura Sánchez", "Elena Moreno"]

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

  const handleGuardar = () => {
    // Aquí se guardarían los cambios en la base de datos
    console.log("[v0] Guardando cambios del usuario:", usuarioData)
    setEditando(false)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Detalle de Usuario</h1>
                <p className="text-white/90">Información y configuración del usuario</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin/usuarios")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        {/* Información del usuario */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary" />
                </div>
                {usuarioData.nombre}
                {getRoleBadge(usuarioData.role)}
              </CardTitle>
              <Button
                onClick={() => (editando ? handleGuardar() : setEditando(true))}
                className="bg-primary hover:bg-primary/90"
              >
                {editando ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                ) : (
                  "Editar"
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={usuarioData.nombre}
                  onChange={(e) => setUsuarioData({ ...usuarioData, nombre: e.target.value })}
                  disabled={!editando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  value={usuarioData.correo}
                  onChange={(e) => setUsuarioData({ ...usuarioData, correo: e.target.value })}
                  disabled={!editando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={usuarioData.telefono}
                  onChange={(e) => setUsuarioData({ ...usuarioData, telefono: e.target.value })}
                  disabled={!editando}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={usuarioData.role}
                  onValueChange={(value) => setUsuarioData({ ...usuarioData, role: value })}
                  disabled={!editando}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="clientepro">Cliente Pro</SelectItem>
                    <SelectItem value="entrenador">Entrenador</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {usuarioData.role === "clientepro" && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="entrenador">Entrenador Asignado</Label>
                  <Select
                    value={usuarioData.entrenador || ""}
                    onValueChange={(value) => setUsuarioData({ ...usuarioData, entrenador: value })}
                    disabled={!editando}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar entrenador" />
                    </SelectTrigger>
                    <SelectContent>
                      {entrenadores.map((entrenador) => (
                        <SelectItem key={entrenador} value={entrenador}>
                          {entrenador}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Fecha de Registro</Label>
                <Input value={new Date(usuarioData.fechaRegistro).toLocaleDateString()} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>ID de Usuario</Label>
                <Input value={usuarioData.id.toString().padStart(3, "0")} disabled className="bg-muted font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
