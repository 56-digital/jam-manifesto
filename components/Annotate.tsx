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

  const definition = definitions[term.toLowerCase()]

  useEffect(() => {
    if (!showTooltip) return

    const handleClickOutside = (event: MouseEvent) => {
      if (spanRef.current && !spanRef.current.contains(event.target as Node)) {
        setShowTooltip(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showTooltip])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowTooltip(!showTooltip)
  }

  return (
    <span
      ref={spanRef}
      className="annotate-term"
      onClick={handleClick}
      style={{
        borderBottom: '1px dotted #666',
        cursor: 'help',
        position: 'relative'
      }}
    >
      {children}
      {showTooltip && definition && (
        <span className="annotate-tooltip">
          {definition}
        </span>
      )}
    </span>
  )
}
