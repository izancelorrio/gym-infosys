import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "next-themes"
import { Suspense } from "react"
import "./globals.css"
import ToastProvider from "@/components/ui/toast"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Gym-InfoSys App",
  description: "Sistema de información y gestión para gimnasios",
  generator: "Gym-InfoSys",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body>
        <Suspense fallback={null}>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
