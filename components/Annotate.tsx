'use client'

import { useState, useEffect, useRef } from 'react'
import { definitions } from '@/lib/definitions'

interface AnnotateProps {
  term: string
  children: React.ReactNode
}

export function Annotate({ term, children }: AnnotateProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [termTop, setTermTop] = useState(0)
  const spanRef = useRef<HTMLSpanElement>(null)

  const definition = definitions[term.toLowerCase()]

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!showTooltip) return

    if (isMobile && spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect()
      setTermTop(rect.top)
    }

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (spanRef.current && !spanRef.current.contains(e.target as Node)) {
        setShowTooltip(false)
      }
    }

    if (isMobile) {
      document.addEventListener('touchstart', handleOutside)
      return () => document.removeEventListener('touchstart', handleOutside)
    } else {
      document.addEventListener('click', handleOutside)
      return () => document.removeEventListener('click', handleOutside)
    }
  }, [showTooltip, isMobile])

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowTooltip(prev => !prev)
  }

  return (
    <span
      ref={spanRef}
      className="annotate-term"
      onMouseEnter={() => { if (!isMobile) setShowTooltip(true) }}
      onMouseLeave={() => { if (!isMobile) setShowTooltip(false) }}
      onTouchStart={handleTouchStart}
    >
      {children}
      {showTooltip && definition && (
        <>
          <span
            className={`annotate-tooltip${isMobile ? ' mobile' : ''}`}
            style={isMobile ? { top: `${termTop - 8}px`, transform: 'translateY(-100%)' } : {}}
          >
            {definition}
          </span>
          {!isMobile && <span className="annotate-triangle" />}
        </>
      )}
    </span>
  )
}
