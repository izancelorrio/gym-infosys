"use client"

import { useEffect, useRef } from "react"
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

  useEffect(() => {
    // Play when opened, pause + reset when closed
    if (isOpen) {
      try {
        videoRef.current?.play()
      } catch (e) {
        // Autoplay may be blocked; ignore
      }
    } else {
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
          <video
            ref={videoRef}
            src="/video.mp4"
            controls
            preload="metadata"
            playsInline
            className="w-full h-full object-cover bg-black"
            onError={(e) => console.error('Video load error', e)}
            onLoadedMetadata={() => console.debug('Video metadata loaded')}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}