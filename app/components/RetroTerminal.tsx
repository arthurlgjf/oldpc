'use client'

import { useState, useEffect, useRef } from 'react'

const bootMessages = [
  "BIOS Date 01/15/1986 14:22:51 Ver: 1.0.2",
  "CPU: NEC V20, Speed: 8 MHz",
  "640K RAM System... OK",
  "  ",
  "Loading KERNEL...",
  "....................",
  "Mounting VFS...",
  "Initializing Drivers...",
  "  Video Adapter... CGA Detected",
  "  Keyboard... OK",
  "  Mouse... NOT FOUND",
  "Checking storage devices...",
  "  Drive A: ... Empty",
  "  Drive C: ... OK (20MB)",
  "Starting init process...",
  "Loading shell...",
  "  ",
  "Welcome to ARTHUROS v1.0 (tty1)",
  "Type 'help' for a list of commands.",
  "  "
]

interface RetroTerminalProps {
  isPowered: boolean
  onPowerChange?: (powered: boolean) => void
}

export default function RetroTerminal({ isPowered, onPowerChange }: RetroTerminalProps) {
  const [isBooting, setIsBooting] = useState(true)
  const [bootLines, setBootLines] = useState<string[]>([])
  const [history, setHistory] = useState<Array<{type: string, content: string, path?: string}>>([])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPath, setCurrentPath] = useState("/home/admin")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editorContent, setEditorContent] = useState("")
  const [theme, setTheme] = useState("neural")
  const [screenOpacity, setScreenOpacity] = useState(0)
  const [isPoweringOff, setIsPoweringOff] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playSound = (type: string) => {
    if (!soundEnabled && type !== "boot") return
    
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

    if (type === "key") {
      // Typing sound - quick beep
      oscillator.type = "square"
      const freq = 1500 + (Math.random() * 500 - 250)
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02)
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.02)

      // Additional click sound
      const oscillator2 = ctx.createOscillator()
      const gainNode2 = ctx.createGain()
      oscillator2.type = "sine"
      oscillator2.frequency.setValueAtTime(200, ctx.currentTime)
      oscillator2.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05)
      gainNode2.gain.setValueAtTime(0.15, ctx.currentTime)
      gainNode2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      oscillator2.connect(gainNode2)
      gainNode2.connect(ctx.destination)
      oscillator2.start()
      oscillator2.stop(ctx.currentTime + 0.05)
    } else if (type === "enter") {
      // Enter key sound
      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04)
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.04)

      // Additional tone
      const oscillator2 = ctx.createOscillator()
      const gainNode2 = ctx.createGain()
      oscillator2.type = "sine"
      oscillator2.frequency.setValueAtTime(150, ctx.currentTime)
      oscillator2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08)
      gainNode2.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      oscillator2.connect(gainNode2)
      gainNode2.connect(ctx.destination)
      oscillator2.start()
      oscillator2.stop(ctx.currentTime + 0.08)
    } else if (type === "boot") {
      // Boot sound - startup beep
      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(880, ctx.currentTime)
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.2)
    }

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
  }

  const themes: Record<string, any> = {
    neural: {
      name: "ARTHUROS",
      screenBg: "bg-linear-to-b from-[#0F4B8F] to-[#042852]",
      screenBorder: "border-[#0A3560]",
      textMain: "text-cyan-300",
      textDim: "text-cyan-400/60",
      textHighlight: "text-cyan-200",
      cursor: "bg-cyan-300",
      glow: "0 0 4px rgba(103, 232, 249, 0.5)",
      scrollbar: "scrollbar-neural"
    },
    classic: {
      name: "Macintosh",
      screenBg: "bg-[#E0E0E0]",
      screenBorder: "border-[#999]",
      textMain: "text-black",
      textDim: "text-gray-600",
      textHighlight: "text-gray-800",
      cursor: "bg-black",
      glow: "none",
      scrollbar: "scrollbar-classic"
    },
    hacker: {
      name: "Matrix",
      screenBg: "bg-black",
      screenBorder: "border-green-900",
      textMain: "text-green-500",
      textDim: "text-green-700",
      textHighlight: "text-green-400",
      cursor: "bg-green-500",
      glow: "0 0 5px rgba(34, 197, 94, 0.6)",
      scrollbar: "scrollbar-hacker"
    }
  }

  const currentTheme = themes[theme]

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [bootLines, history, isProcessing])

  useEffect(() => {
    let flickerInterval: NodeJS.Timeout | null = null
    let fadeInterval: NodeJS.Timeout | null = null
    
    if (!isPowered) {
      // Powering off - flicker then fade out
      if (screenOpacity > 0) {
        setIsPoweringOff(true)
        let flickerCount = 0
        flickerInterval = setInterval(() => {
          flickerCount++
          if (flickerCount <= 4) {
            // Quick flicker effect - visible flickering
            setScreenOpacity(prev => prev > 0.5 ? 0.2 : 0.8)
          } else {
            if (flickerInterval) clearInterval(flickerInterval)
            // Smooth fade out
            let opacity = 1
            fadeInterval = setInterval(() => {
              opacity -= 0.1
              setScreenOpacity(Math.max(0, opacity))
              if (opacity <= 0) {
                if (fadeInterval) clearInterval(fadeInterval)
                setHistory([])
                setInput("")
                setBootLines([])
                setIsBooting(true)
                setIsPoweringOff(false)
                setScreenOpacity(0)
              }
            }, 40)
          }
        }, 100)
      } else {
        // Already off
        setHistory([])
        setInput("")
        setBootLines([])
        setIsBooting(true)
        setIsPoweringOff(false)
        setScreenOpacity(0)
      }
      return () => {
        if (flickerInterval) clearInterval(flickerInterval)
        if (fadeInterval) clearInterval(fadeInterval)
      }
    }
    
    // Powering on - flicker then fade in
    let timeout: NodeJS.Timeout | null = null
    if (isPowered) {
      setIsPoweringOff(false)
      // Start from 0 opacity
      setScreenOpacity(0)
      
      let flickerCount = 0
      flickerInterval = setInterval(() => {
        flickerCount++
        if (flickerCount <= 5) {
          // Quick flicker effect - alternate between 0 and higher values
          setScreenOpacity(prev => {
            if (prev < 0.3) return 0.6
            if (prev < 0.6) return 0.1
            return 0.5
          })
        } else {
          if (flickerInterval) clearInterval(flickerInterval)
          // Smooth fade in from current flicker state
          let opacity = screenOpacity || 0.3
          fadeInterval = setInterval(() => {
            opacity += 0.15
            setScreenOpacity(Math.min(1, opacity))
            if (opacity >= 1) {
              if (fadeInterval) clearInterval(fadeInterval)
            }
          }, 40)
        }
      }, 120)
      
      if (isBooting) {
        let index = 0
        const showNext = () => {
          if (index < bootMessages.length) {
            if (index === 0) {
              playSound("boot")
            }
            setBootLines(prev => [...prev, bootMessages[index]])
            index++
            timeout = setTimeout(showNext, 50 + Math.random() * 30)
          } else {
            timeout = setTimeout(() => {
              setIsBooting(false)
              setTimeout(() => inputRef.current?.focus(), 100)
            }, 300)
          }
        }
        timeout = setTimeout(showNext, 400)
      }
    }
    
    return () => {
      if (timeout) clearTimeout(timeout)
      if (flickerInterval) clearInterval(flickerInterval)
      if (fadeInterval) clearInterval(fadeInterval)
    }
  }, [isPowered, isBooting])

  useEffect(() => {
    if (!isBooting && !isProcessing && isPowered && !isEditing) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus()
      }, 10)
      return () => clearTimeout(timeout)
    }
  }, [isBooting, isProcessing, isPowered, isEditing])


  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) {
      setHistory(prev => [...prev, { type: "input", content: "", path: currentPath }])
      return
    }

    setHistory(prev => [...prev, { type: "input", content: cmd, path: currentPath }])
    
    const parts = trimmed.split(" ")
    const command = parts[0].toLowerCase()
    const args = parts.slice(1).join(" ")

    let output = ""
    
    switch (command) {
      case "help":
        output = `Available commands:
  help       - Show this help message
  clear      - Clear terminal screen
  ls         - List directory contents
  cat [file] - Display file contents
  cp [s] [d] - Copy a file
  mv [s] [d] - Move/Rename a file
  rm [file]  - Remove a file
  mkdir      - Create a directory
  touch      - Create a file
  pwd        - Print working directory
  cd [dir]   - Change directory
  date       - Show current system date
  uptime     - Show system uptime
  whoami     - Display current user
  history    - Show command history
  reboot     - Reboot the system
  echo [txt] - Display a line of text
  ask [msg]  - Ask the AI mainframe a question
  grep [p] [f]- Search for pattern in file
  wc [file]  - Count lines, words, chars
  top        - Display system processes
  calc [exp] - Evaluate math expression
  sound [on|off] - Toggle sound effects
  write [file]- Enter writing mode (edit file)
  edit [file] - Alias for write
  run [file] - Run a JavaScript file
  uname      - Show system info
  df         - Show disk usage
  free       - Show memory usage
  quote      - Display a random quote
  rev [txt]  - Reverse text
  head [file]- Show first 5 lines
  tail [file]- Show last 5 lines
  theme [n]  - Switch theme (neural, classic, hacker)`
        break
      case "clear":
        setHistory([])
        return
      case "pwd":
        output = currentPath
        break
      case "whoami":
        output = "admin"
        break
      case "date":
        output = new Date().toString()
        break
      case "echo":
        output = args
        break
      case "reboot":
        setHistory([])
        setBootLines([])
        setIsBooting(true)
        setInput("")
        window.location.reload()
        return
      case "theme":
        if (args) {
          const newTheme = args.toLowerCase()
          if (themes[newTheme]) {
            setTheme(newTheme)
            output = `Theme switched to ${newTheme}`
          } else {
            output = `Unknown theme: ${args}. Available: neural, classic, hacker`
          }
        } else {
          output = `Current theme: ${theme}. Available themes: neural, classic, hacker`
        }
        break
      default:
        output = `Command not found: ${command}. Type 'help' for available commands.`
    }

    if (output) {
      setHistory(prev => [...prev, { type: "output", content: output }])
    }
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      playSound("enter")
      if (input.trim()) {
        handleCommand(input)
      } else {
        handleCommand("")
      }
    } else if (e.key.length === 1 || e.key === "Backspace") {
      // Play typing sound for regular keys
      playSound("key")
    }
  }

  return (
    <div
      className={`
        relative w-full h-full rounded-xl
        ${isPowered && screenOpacity > 0.15 ? `${currentTheme.screenBg} ${currentTheme.screenBorder} shadow-retro-screen` : "bg-[#050505] border-[#111]"}
        border-4 overflow-hidden cursor-text
      `}
      style={{
        transition: isPowered && screenOpacity > 0.15 ? 'background-color 0.3s ease-in, border-color 0.3s ease-in' : 'background-color 0.3s ease-out, border-color 0.3s ease-out'
      }}
    >
      {isPowered && (
        <div 
          className={`absolute inset-0 p-4 sm:p-6 font-mono ${currentTheme.textMain} text-lg sm:text-xl leading-relaxed overflow-y-auto z-10 ${isBooting ? "scrollbar-hide" : currentTheme.scrollbar}`} 
          style={{ 
            textShadow: currentTheme.glow,
            opacity: screenOpacity,
            transition: 'opacity 0.05s linear'
          }}
        >
          {isEditing ? (
            <div className="flex flex-col h-full relative">
              <textarea
                className={`flex-1 w-full bg-transparent resize-none outline-none font-mono ${currentTheme.textMain} caret-current`}
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "s") {
                    e.preventDefault()
                    // Save logic here
                  }
                  if (e.ctrlKey && e.key === "q") {
                    e.preventDefault()
                    setIsEditing(false)
                    setEditingFile(null)
                    setHistory(prev => [...prev, { type: "system", content: "Exited editor." }])
                  }
                }}
                autoFocus
                spellCheck={false}
              />
              <div className={`w-full pt-2 mt-2 border-t ${currentTheme.screenBorder} flex justify-between text-sm opacity-70`}>
                <span>EDIT: {editingFile}</span>
                <span>^S Save | ^Q Quit</span>
              </div>
            </div>
          ) : (
            <>
              {isBooting && (
                <div className="flex flex-col">
                  {bootLines.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-words">{line}</div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              )}
              {!isBooting && (
                <div className="flex flex-col min-h-full">
                  <div className={`opacity-70 mb-4 ${currentTheme.textDim} text-base sm:text-lg`}>
                    {bootMessages.slice(-2).map((msg, i) => (
                      <div key={`prev-${i}`}>{msg}</div>
                    ))}
                  </div>
                  {history.map((item, i) => (
                    <div key={i} className={`mb-1 whitespace-pre-wrap break-words ${item.type === "output" ? `${currentTheme.textMain} opacity-90` : currentTheme.textHighlight}`}>
                      {item.type === "input" && (
                        <span className={`mr-2 ${currentTheme.textMain} select-none font-normal`}>
                          admin@arthur:{(item.path || currentPath) === "/home/admin" ? "~" : item.path || currentPath}$
                        </span>
                      )}
                      {item.content}
                    </div>
                  ))}
                  <div className="flex items-center relative">
                    <span className={`mr-2 ${currentTheme.textMain} shrink-0 select-none`}>
                      admin@arthur:{currentPath === "/home/admin" ? "~" : currentPath}$
                    </span>
                    <div className="relative flex-1 flex items-center flex-wrap">
                      <span className={`whitespace-pre-wrap break-all ${currentTheme.textMain}`}>
                        {input}
                      </span>
                      {!isProcessing && (
                        <span className={`inline-block w-2 h-5 ${currentTheme.cursor} animate-cursor-blink ml-[1px] align-middle`} />
                      )}
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                        autoFocus
                        disabled={isProcessing}
                        autoComplete="off"
                        onBlur={(e) => {
                          if (!isBooting && !isProcessing) {
                            e.target.focus()
                          }
                        }}
                      />
                    </div>
                  </div>
                  {isProcessing && (
                    <div className={`mt-2 ${currentTheme.textMain} animate-pulse`}>
                      Processing...
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              )}
            </>
          )}
        </div>
      )}
      {isPowered && screenOpacity > 0.3 && (
        <>
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none z-20" style={{ opacity: screenOpacity }} />
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-30" style={{ opacity: screenOpacity * 0.15 }} />
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/40 z-20" style={{ opacity: screenOpacity }} />
        </>
      )}
    </div>
  )
}

