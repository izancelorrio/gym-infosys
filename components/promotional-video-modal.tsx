"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Play } from "lucide-react"

interface PromotionalVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onStartToday: () => void
}

export function PromotionalVideoModal({ isOpen, onClose, onStartToday }: PromotionalVideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center p-6 border-b">
          <h2 className="text-2xl font-bold text-foreground">
            🏋️‍♂️ Transforma Tu Vida en Nuestro Gimnasio
          </h2>
        </div>

        {/* Video Area */}
        <div className="relative bg-gradient-to-br from-gray-900 to-black aspect-video flex items-center justify-center">
          {/* Video Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
          
          {/* Video Content - Aquí puedes reemplazar con un video real */}
          <div className="relative z-10 text-center text-white px-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-6 mx-auto w-fit">
              <Play className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">¡Únete a la Mejor Experiencia Fitness!</h3>
            <p className="text-lg text-gray-200 mb-6 max-w-2xl">
              Descubre entrenamientos personalizados, equipos de última generación, 
              clases grupales motivadoras y una comunidad que te apoyará en cada paso 
              de tu transformación.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-300">Miembros Activos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">15+</div>
                <div className="text-sm text-gray-300">Clases Semanales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-300">Acceso</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">5★</div>
                <div className="text-sm text-gray-300">Valoraciones</div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-20 h-20 border-2 border-primary/30 rounded-full" />
          <div className="absolute bottom-4 right-4 w-32 h-32 border-2 border-secondary/30 rounded-full" />
        </div>
      </DialogContent>
    </Dialog>
  )
}