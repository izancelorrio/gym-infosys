import { Dumbbell, Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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
            <div className="flex space-x-3">
              <Button size="sm" variant="outline" className="p-2 bg-transparent" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="p-2 bg-transparent" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="p-2 bg-transparent" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="p-2 bg-transparent" aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
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
              <li>
                <a href="#entrenadores" className="text-muted-foreground hover:text-primary transition-colors">
                  Entrenadores
                </a>
              </li>
              <li>
                <a href="#testimonios" className="text-muted-foreground hover:text-primary transition-colors">
                  Testimonios
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Membresías
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 Av. Principal 123, Ciudad</li>
              <li>📞 +34 900 123 456</li>
              <li>✉️ izan.celorrio.caballero@gmail.com</li>
              <li>🕒 Lun-Dom: 24/7</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Recibe tips de entrenamiento y ofertas exclusivas.</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Tu email" className="text-sm" />
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <span className="sm:inline hidden">✉</span>
                <span className="hidden sm:inline">Suscribir</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Gym-InfoSys. Todos los derechos reservados. |
            <a href="#" className="hover:text-primary transition-colors ml-1">
              Política de Privacidad
            </a>{" "}
            |
            <a href="#" className="hover:text-primary transition-colors ml-1">
              Términos de Servicio
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
