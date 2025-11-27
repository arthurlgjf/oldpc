'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function TerminalScreen() {
  useEffect(() => {
    // Set boot state when component mounts
    if (typeof window !== 'undefined') {
      // The scripts will handle the terminal initialization
      // We just need to ensure they load
    }
  }, [])

  return (
    <>
      {/* Load all the required scripts */}
      <Script src="/js/b105f7a153e03756.js" strategy="afterInteractive" />
      <Script src="/js/6a8b6d0f04868e51.js" strategy="afterInteractive" />
      <Script src="/js/turbopack-1994cc3ac035e8eb.js" strategy="afterInteractive" />
      <Script src="/js/42879de7b8087bc9.js" strategy="afterInteractive" />
      <Script src="/js/60a4f84f215dd110.js" strategy="afterInteractive" />
      <Script src="/js/fd5f064b2a3f9309.js" id="_R_" strategy="afterInteractive" />
      <Script src="/js/a6dad97d9634a72d.js" noModule strategy="afterInteractive" />
      
      {/* The terminal component should render here via the scripts */}
      <div id="__terminal_mount__"></div>
    </>
  )
}


