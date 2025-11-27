"use client"

import { Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function Footer() {
  return (
    <footer id="contacto" className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Gym-InfoSys</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Tu gimnasio de confianza para alcanzar todos tus objetivos fitness. Más que un gimnasio, somos tu
              comunidad de apoyo.
            </p>
            {/* Social icons removed per request */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#inicio" className="text-muted-foreground hover:text-primary transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#clases" className="text-muted-foreground hover:text-primary transition-colors">
                  Clases
                </a>
              </li>
              {/* Testimonios and Membresías links removed from quick links */}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 C. de María de Luna, 3, 50018 Zaragoza (EINA - UNIZAR)</li>
              <li>📞 +34 900 123 456</li>
              <li>
                ✉️ <a href="mailto:900013@unizar.es" className="hover:text-primary transition-colors">900013@unizar.es</a>
              </li>
              <li>
                ✉️ <a href="mailto:899577@unizar.es" className="hover:text-primary transition-colors">899577@unizar.es</a>
              </li>
              <li>🕒 Lun-Vie: 08:00 - 20:00</li>
            </ul>
          </div>

          {/* Location (Google Maps) */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Ubicación</h3>
            <div className="text-sm text-muted-foreground mb-3">Escuela de Ingeniería y Arquitectura de Zaragoza (UNIZAR)</div>
            <div className="w-full h-40 md:h-48 lg:h-40 overflow-hidden rounded">
              <iframe
                title="EINA Zaragoza"
                src="https://www.google.com/maps?q=Escuela+de+Ingenier%C3%ADa+y+Arquitectura+Zaragoza&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Gym-InfoSys. Todos los derechos reservados. |
            <Dialog>
              <DialogTrigger asChild>
                <a className="hover:text-primary transition-colors ml-1 cursor-pointer">Política de Privacidad</a>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Política de Privacidad</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Trabajo de la asignatura sistemas de información realizado por Izan Celorrio y Alejo Beamonte en el curso 2025/2026.
                </DialogDescription>
              </DialogContent>
            </Dialog>
            |
            <Dialog>
              <DialogTrigger asChild>
                <a className="hover:text-primary transition-colors ml-1 cursor-pointer">Términos de Servicio</a>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Términos de Servicio</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Trabajo de la asignatura sistemas de información realizado por Izan Celorrio y Alejo Beamonte en el curso 2025/2026.
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </p>
        </div>
      </div>
    </footer>
  )
}
