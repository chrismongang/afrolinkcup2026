"use client"

import { useEffect } from "react"
import Image from "next/image"

export default function ArenaQRCodePage() {
  // Automatisch Vollbild beim Laden
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (error) {
        console.log("Vollbild konnte nicht aktiviert werden:", error)
      }
    }
    enterFullscreen()
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Hintergrundbild */}
      <div className="absolute inset-0">
        <img
          src="/sceen_bg.png"
          alt="Arena Hintergrund"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        {/* Text oben */}
        <div className="mb-8 md:mb-12 text-center">
          <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-white">
            Scannen um alle Infos auf dem Handy zu haben!
          </p>
        </div>

        {/* QR-Code - Pulsierend */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-full h-full bg-white rounded-2xl"></div>
          </div>
          <div className="relative animate-pulse">
            <Image
              src="/images/afrolinkcup.live_qr-code.png"
              alt="QR Code"
              width={600}
              height={600}
              className="w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] object-contain"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  )
}
