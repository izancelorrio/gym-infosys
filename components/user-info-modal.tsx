"use client"
import { Button } from "@/components/ui/button"
import { X, User, Mail, Hash, Calendar, Shield, CreditCard, Phone, IdCard, Users, Heart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserInfoModal({ isOpen, onClose }: UserInfoModalProps) {
  const { user } = useAuth()

  if (!isOpen) return null

  const isCliente = user?.role === "cliente" && user?.cliente

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Información del {isCliente ? "Cliente" : "Usuario"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Información General del Usuario */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
              Información General
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">ID Usuario</p>
                  <p className="text-sm text-muted-foreground">{user?.id || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Nombre</p>
                  <p className="text-sm text-muted-foreground">{user?.name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Rol</p>
                  <p className="text-sm text-muted-foreground">{user?.role || "Usuario"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Específica del Cliente */}
          {isCliente && user.cliente && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                Información de Cliente
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">ID Cliente</p>
                    <p className="text-sm text-muted-foreground">{user.cliente.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <IdCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">DNI</p>
                    <p className="text-sm text-muted-foreground">{user.cliente.dni}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Teléfono</p>
                    <p className="text-sm text-muted-foreground">{user.cliente.numero_telefono || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Fecha de Nacimiento</p>
                    <p className="text-sm text-muted-foreground">
                      {user.cliente.fecha_nacimiento ? 
                        new Date(user.cliente.fecha_nacimiento).toLocaleDateString("es-ES") : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Género</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.cliente.genero || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Plan ID</p>
                    <p className="text-sm text-muted-foreground">{user.cliente.plan_id || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Fecha de Inscripción</p>
                    <p className="text-sm text-muted-foreground">
                      {user.cliente.fecha_inscripcion ? 
                        new Date(user.cliente.fecha_inscripcion).toLocaleDateString("es-ES") : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Estado</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.cliente.estado || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Información de Pago (sensible) */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Información de Pago (Último registro)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">Tarjeta:</p>
                    <p className="text-yellow-600 dark:text-yellow-400 font-mono">
                      {user.cliente.num_tarjeta ? `****-****-****-${user.cliente.num_tarjeta.slice(-4)}` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">Vencimiento:</p>
                    <p className="text-yellow-600 dark:text-yellow-400">{user.cliente.fecha_tarjeta || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">CVV:</p>
                    <p className="text-yellow-600 dark:text-yellow-400">***</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-border">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
