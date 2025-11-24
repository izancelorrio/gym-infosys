"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { X } from "lucide-react"

type ToastType = "success" | "error" | "info"

type ToastAction = {
  label: string
  // onClick can be any function; store it directly and call when action button pressed
  onClick?: () => void
}

type ToastData = {
  id: string
  title: string
  description?: string
  type?: ToastType
  actions?: ToastAction[]
}

const ToastContext = createContext<{ toast: (t: Omit<ToastData, "id">) => void } | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const toast = useCallback((t: Omit<ToastData, "id">) => {
    const id = Date.now().toString()
    const data: ToastData = { id, ...t }
    setToasts((s) => [...s, data])
    // Auto dismiss (unless actions provided; keep auto-dismiss but slightly longer)
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id))
    }, 6000)
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((s) => s.filter((x) => x.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`w-96 max-w-full flex items-start gap-3 p-3 rounded-lg shadow-lg border select-none transition transform ` +
              (t.type === "success"
                ? "bg-green-600 text-white"
                : t.type === "error"
                ? "bg-red-600 text-white"
                : "bg-slate-800 text-white")
            }
            role="status"
          >
            <div className="flex-1">
              <div className="font-medium">{t.title}</div>
              {t.description && <div className="text-sm opacity-90 mt-1">{t.description}</div>}
              {t.actions && t.actions.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {t.actions.map((a, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        try {
                          a.onClick && a.onClick()
                        } catch (e) {
                          // swallow
                        }
                        remove(t.id)
                      }}
                      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-sm"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="opacity-80 hover:opacity-100 p-1 rounded"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider")
  return ctx.toast
}

export default ToastProvider
