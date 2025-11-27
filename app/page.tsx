'use client'

import { useState, useRef } from 'react'
import RetroTerminal from './components/RetroTerminal'

export default function Home() {
  const [isPowered, setIsPowered] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  
  const playSound = (type: string) => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass()
      }
    }
    
    const ctx = audioContextRef.current
    if (!ctx) return

    // Resume context if suspended (required by browsers)
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {})
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    if (type === "power") {
      // Power on/off sound - deep beep
      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(100, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.1)
    }

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
  }

  const handlePowerClick = () => {
    playSound("power")
    setIsPowered(!isPowered)
  }

  return (
    <div className="min-h-screen w-full bg-[#F2F0EB] flex flex-col items-center justify-center p-4 transition-colors duration-700 overflow-hidden">
      <main className="flex flex-col items-center z-10 w-full max-w-6xl">
        <div className="hidden relative sm:flex items-center justify-center p-4 sm:p-10 w-full h-full">
          <div 
            className="relative w-full max-w-[50rem] h-[36rem] rounded-[2.5rem] bg-gradient-to-br from-beige-200 to-beige-300 shadow-retro-case border border-white/20 flex items-center justify-center p-4 sm:p-8"
            onClick={() => {
              if (!isPowered) return
              // Focus terminal when clicking
            }}
          >
            <div className="w-full h-full rounded-[2rem] bg-beige-400 shadow-retro-bezel p-3 sm:p-6 sm:pb-20 flex items-center justify-center relative overflow-hidden">
              <RetroTerminal isPowered={isPowered} />
              <div className="absolute bottom-0 left-0 right-0 h-20 px-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-neutral-800">
                    <div className="w-4 h-4 bg-cyan-500 rounded-full opacity-90 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-neutral-600 font-bold tracking-[0.2em] text-xs uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">Neural</span>
                    <span className="font-sans text-neutral-500 font-bold tracking-[0.1em] text-[0.6rem] uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">Systems Inc.</span>
                  </div>
                </div>
                <div className="flex gap-1.5 h-8 items-center opacity-40 mx-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 h-full bg-black/30 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.2)]"></div>
                  ))}
                </div>
                <div className="flex items-center gap-5">
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-2 h-2 rounded-full border border-black/30 shadow-inner transition-all duration-500 ${isPowered ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]" : "bg-red-900/30"}`}></div>
                      <span className="text-[0.5rem] text-neutral-500 font-bold tracking-wider uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">PWR</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full border border-black/30 shadow-inner transition-all duration-100 bg-amber-900/30"></div>
                      <span className="text-[0.5rem] text-neutral-500 font-bold tracking-wider uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">HDD</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePowerClick()
                    }}
                    className="
                      w-12 h-12 rounded-full
                      cursor-pointer
                      shadow-retro-button
                      border-4 border-beige-300
                      flex items-center justify-center
                      transition-all duration-150 active:scale-95 active:shadow-retro-button-active
                      bg-neutral-200
                    "
                    title={isPowered ? "Power Off" : "Power On"}
                    aria-label="Power Button"
                  >
                    <svg className={`w-6 h-6 ${isPowered ? "text-emerald-600 drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]" : "text-neutral-400"} transition-colors duration-300`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

