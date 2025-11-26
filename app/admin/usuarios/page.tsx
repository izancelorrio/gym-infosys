"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowLeft, UserCheck, Crown, Dumbbell, Filter, Loader2, AlertCircle, Mail, MailCheck } from "lucide-react"

interface Cliente {
  id: number
  dni: string
  numero_telefono: string
  plan_id: number
  plan_name: string
  fecha_nacimiento: string
  genero: string
  fecha_inscripcion: string
  estado: string
  created_at: string
  updated_at: string
}

interface Usuario {
  id: number
  name: string
  email: string
  role: string
  email_verified: boolean
  created_at?: string
  updated_at?: string
  cliente?: Cliente
}

interface Stats {
  total: number
  admin: number
  entrenador: number
  cliente: number

  usuario: number
  verified: number
  unverified: number
}

export default function UsuariosPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [filtroRol, setFiltroRol] = useState<string>("todos")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    admin: 0,
    entrenador: 0,
    cliente: 0,

    usuario: 0,
    verified: 0,
    unverified: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // campo de búsqueda por nombre
  const [searchTerm, setSearchTerm] = useState<string>("")
  // paginación
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 10

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
    }
  }, [user, router])

  // Función para cargar usuarios
  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/admin/users?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!response.ok) {
        throw new Error('Error al cargar los usuarios')
      }
      
      const data = await response.json()
      console.log('🔍 [LISTA] Datos recibidos del servidor:', data)
      console.log('👥 [LISTA] Usuarios recibidos:', data.users)
      console.log('📊 [LISTA] Usuario 8 en la lista:', data.users?.find((u: any) => u.id === 8))
      setUsuarios(data.users || [])
      setStats(data.stats || {})
    } catch (error) {
      console.error('Error fetching usuarios:', error)
      setError('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuarios desde la API
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsuarios()
    }
  }, [user])

  // Debugging: monitorear cambios en la lista de usuarios
  useEffect(() => {
    const usuario8 = usuarios.find(u => u.id === 8)
    if (usuario8) {
      console.log('📊 [LISTA] Usuario 8 en estado actual:', usuario8)
      console.log('👤 [LISTA] Nombre de usuario 8:', usuario8.name)
    }
  }, [usuarios])

  // Detectar cuando volvemos de editar un usuario
  useEffect(() => {
    const handleFocus = () => {
      const userUpdated = sessionStorage.getItem('userUpdated')
      if (userUpdated) {
        fetchUsuarios()
        sessionStorage.removeItem('userUpdated')
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const userUpdated = sessionStorage.getItem('userUpdated')
        if (userUpdated) {
          fetchUsuarios()
          sessionStorage.removeItem('userUpdated')
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (!user || user.role !== "admin") {
    return null
  }

  // aplicar filtro por rol
  const usuariosFiltrados = filtroRol === "todos" ? usuarios : usuarios.filter((usuario) => usuario.role === filtroRol)

  // aplicar búsqueda por nombre (insensible a mayúsculas)
  const usuariosBuscados = searchTerm.trim()
    ? usuariosFiltrados.filter((u) => u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : usuariosFiltrados

  // paginar resultados
  const totalPages = Math.max(1, Math.ceil(usuariosBuscados.length / pageSize))
  const paginatedUsuarios = usuariosBuscados.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
            <div className="flex gap-2">
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
        </div>

        {/* Estadísticas rápidas */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-card border-border shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-full animate-pulse">
                      <div className="h-6 w-6 bg-gray-300 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-6 w-8 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="bg-card border-border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes</p>
                    <p className="text-2xl font-bold text-green-600">{stats.cliente}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{stats.entrenador}</p>
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
                    <p className="text-2xl font-bold text-gray-600">{stats.usuario}</p>
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
                    <p className="text-2xl font-bold text-red-600">{stats.admin}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grid de usuarios */}
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                Todos los Usuarios ({usuariosBuscados.length})
              </CardTitle>

              {/* input de búsqueda por nombre */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  className="px-3 py-2 border border-border rounded-md bg-background text-sm w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex items-center justify-center py-8 text-red-600">
                <AlertCircle className="h-8 w-8" />
                <span className="ml-2">{error}</span>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Cargando usuarios...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold">ID</th>
                      <th className="text-left p-4 font-semibold">Nombre</th>
                      <th className="text-left p-4 font-semibold">Correo</th>
                      <th className="text-left p-4 font-semibold">Estado</th>
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
                              <option value="cliente">Cliente</option>
                              <option value="usuario">Usuario</option>
                            </select>
                          </div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsuarios.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/usuarios/${usuario.id}`)}
                      >
                        <td className="p-4 font-mono text-sm">{usuario.id.toString().padStart(3, "0")}</td>
                        <td className="p-4 font-medium">{usuario.name}</td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {usuario.email}
                            {usuario.email_verified ? (
                              <div title="Email verificado">
                                <MailCheck className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <div title="Email no verificado">
                                <Mail className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {usuario.email_verified ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Pendiente
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">{getRoleBadge(usuario.role)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Paginación: botones prev/next */}
                <div className="flex items-center justify-between mt-4">
                  <div>
                    {currentPage > 1 && (
                      <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} variant="outline">
                        Página anterior
                      </Button>
                    )}
                  </div>

                  <div>
                    {currentPage < totalPages && (
                      <Button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                        Página siguiente
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
