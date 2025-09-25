"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Dumbbell, User, LogOut, Lock, ChevronDown } from "lucide-react"
import { LoginModal } from "./login-modal"
import { RegisterModal } from "./register-modal"
import { ChangePasswordModal } from "./change-password-modal"
import { UserInfoModal } from "./user-info-modal"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(true)
  }

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false)
    setIsLoginOpen(true)
  }

  const handleLogout = () => {
    console.log("[v0] Logout clicked")
    logout()
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  return (
    <>
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Gym-InfoSys</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-foreground hover:text-primary transition-colors">
                Inicio
              </a>
              <a href="#clases" className="text-foreground hover:text-primary transition-colors">
                Clases
              </a>
              <a href="#testimonios" className="text-foreground hover:text-primary transition-colors">
                Testimonios
              </a>
              <a href="#contacto" className="text-foreground hover:text-primary transition-colors">
                Contacto
              </a>
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 hover:bg-accent"
                    onClick={() => {
                      console.log("[v0] User menu clicked, current state:", isUserMenuOpen)
                      setIsUserMenuOpen(!isUserMenuOpen)
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>{user?.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </Button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50 py-1">
                      <button
                        onClick={() => {
                          console.log("[v0] User info clicked")
                          setIsUserInfoOpen(true)
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center transition-colors"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Info Usuario
                      </button>
                      <button
                        onClick={() => {
                          console.log("[v0] Change password clicked")
                          setIsChangePasswordOpen(true)
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center transition-colors"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Cambiar Contraseña
                      </button>
                      <button
                        onClick={() => {
                          console.log("[v0] Logout clicked from dropdown")
                          handleLogout()
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                    onClick={() => setIsLoginOpen(true)}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setIsRegisterOpen(true)}
                  >
                    Registrarse
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
                <a
                  href="#inicio"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inicio
                </a>
                <a
                  href="#clases"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Clases
                </a>
                <a
                  href="#testimonios"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Testimonios
                </a>
                <a
                  href="#contacto"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contacto
                </a>
                <div className="flex flex-col space-y-2 px-3 pt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-2 px-3 py-2 text-foreground">
                        <User className="h-4 w-4" />
                        <span>{user?.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        className="justify-start text-foreground hover:text-primary"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setIsUserInfoOpen(true)
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span className="sm:inline hidden">Info Usuario</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-foreground hover:text-primary"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setIsChangePasswordOpen(true)
                        }}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        <span className="sm:inline hidden">Cambiar Contraseña</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-foreground hover:text-primary"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span className="sm:inline hidden">Cerrar Sesión</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="justify-start text-foreground hover:text-primary"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setIsLoginOpen(true)
                        }}
                      >
                        Iniciar Sesión
                      </Button>
                      <Button
                        className="justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setIsRegisterOpen(true)
                        }}
                      >
                        Registrarse
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            console.log("[v0] Overlay clicked, closing menu")
            setIsUserMenuOpen(false)
          }}
        />
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      <UserInfoModal isOpen={isUserInfoOpen} onClose={() => setIsUserInfoOpen(false)} />
    </>
  )
}
