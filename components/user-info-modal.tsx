"use client"
import { Button } from "@/components/ui/button"
import { X, User, Mail, Hash, Calendar, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface UserInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserInfoModal({ isOpen, onClose }: UserInfoModalProps) {
  const { user } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Información del Usuario</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">ID</p>
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

          {user?.created_at && (
            <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Fecha de Registro</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Rol</p>
              <p className="text-sm text-muted-foreground">{user?.role || "Usuario"}</p>
            </div>
          </div>
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
