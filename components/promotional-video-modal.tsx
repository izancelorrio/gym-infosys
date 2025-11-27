"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PromotionalVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onStartToday?: () => void
}

export function PromotionalVideoModal({ isOpen, onClose, onStartToday }: PromotionalVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videos, setVideos] = useState<string[]>([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  // When modal opens: fetch available mp4 videos and set selected to first (but do NOT autoplay)
  useEffect(() => {
    let mounted = true
    const fetchVideos = async () => {
      setLoadingVideos(true)
      try {
        const res = await fetch('/api/videos')
        if (!res.ok) throw new Error('Failed to fetch videos')
        const data = await res.json()
        if (mounted) {
          const list = Array.isArray(data.videos) ? data.videos : []
          setVideos(list)
          setSelected(list.length > 0 ? list[0] : null)
        }
      } catch (err) {
        console.error('Error loading videos list', err)
        if (mounted) {
          setVideos([])
          setSelected(null)
        }
      } finally {
        if (mounted) setLoadingVideos(false)
      }
    }

    if (isOpen) fetchVideos()

    return () => { mounted = false }
  }, [isOpen])

  // Pause + reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) {
        try {
          videoRef.current.pause()
          videoRef.current.currentTime = 0
        } catch (e) {
          // ignore
        }
      }
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[900px] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">🎬 Video Promocional</h2>
            <div className="text-sm text-muted-foreground">Mira nuestro video</div>
          </div>
          <div>
            <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {selected ? (
            <video
              ref={videoRef}
              src={selected}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-contain bg-black"
              onError={(e) => console.error('Video load error', e)}
              onLoadedMetadata={() => console.debug('Video metadata loaded')}
            />
          ) : (
            <div className="text-white text-center">No hay vídeos disponibles</div>
          )}
        </div>

        {/* Lista de vídeos */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-2">Vídeos disponibles</h3>
          {loadingVideos ? (
            <div className="text-sm text-muted-foreground">Cargando vídeos...</div>
          ) : videos.length === 0 ? (
            <div className="text-sm text-muted-foreground">No se han encontrado archivos .mp4 en la carpeta public</div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-64 md:max-h-80 overflow-auto">
              {videos.map((v) => (
                <button
                  type="button"
                  key={v}
                  className={`text-left p-2 rounded border ${v === selected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                  onClick={() => {
                    setSelected(v)
                    // play the newly selected video
                    setTimeout(() => {
                      try { videoRef.current?.play() } catch (e) { /* autoplay may be blocked */ }
                    }, 50)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-black/40 flex items-center justify-center text-xs text-white">MP4</div>
                    <div className="flex-1 truncate">{v.replace(/^\//, '')}</div>
                    <div className="text-xs text-muted-foreground">{v === selected ? 'Reproduciendo' : 'Reproducir'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}