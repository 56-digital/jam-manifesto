'use client'

import { useState, useEffect, useRef } from 'react'
import { definitions } from '@/lib/definitions'

interface AnnotateProps {
  term: string
  children: React.ReactNode
}

export function Annotate({ term, children }: AnnotateProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const spanRef = useRef<HTMLSpanElement>(null)
  const [topPosition, setTopPosition] = useState<number | undefined>()

  const definition = definitions[term.toLowerCase()]

  useEffect(() => {
    if (!showTooltip || !spanRef.current) return

    const isMobile = window.innerWidth < 768
    if (isMobile) {
      const rect = spanRef.current.getBoundingClientRect()
      setTopPosition(rect.top - 10)
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (spanRef.current && !spanRef.current.contains(event.target as Node)) {
        setShowTooltip(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showTooltip])

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setShowTooltip(!showTooltip)
  }

  return (
    <span
      ref={spanRef}
      className="annotate-term"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleClick}
      onTouchStart={handleClick}
      style={{
        borderBottom: '1px dotted #666',
        cursor: 'help',
        position: 'relative'
      }}
    >
      {children}
      {showTooltip && definition && (
        <>
          <span
            className="annotate-tooltip"
            style={topPosition !== undefined ? { top: `${topPosition}px`, bottom: 'auto', transform: 'translateY(-100%)' } : {}}
          >
            {definition}
          </span>
          <span className="annotate-triangle" />
        </>
      )}
    </span>
  )
}
