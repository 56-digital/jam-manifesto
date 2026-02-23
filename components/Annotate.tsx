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
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})

  const definition = definitions[term.toLowerCase()]

  useEffect(() => {
    if (!showTooltip || !spanRef.current) return

    const rect = spanRef.current.getBoundingClientRect()
    const isMobile = window.innerWidth < 768

    if (isMobile) {
      setTooltipStyle({
        position: 'fixed',
        left: '20px',
        right: '20px',
        bottom: `${window.innerHeight - rect.top + 8}px`,
        transform: 'none',
        margin: '0 auto',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        lineHeight: '1.5',
        fontStyle: 'normal',
        fontWeight: 'normal',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        pointerEvents: 'none'
      })
    } else {
      setTooltipStyle({
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: '6px',
        fontSize: '13px',
        lineHeight: '1.5',
        fontStyle: 'normal',
        fontWeight: 'normal',
        maxWidth: 'calc(100vw - 40px)',
        width: 'max-content',
        marginBottom: '8px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        pointerEvents: 'none'
      })
    }

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
        <span style={tooltipStyle}>
          {definition}
        </span>
      )}
    </span>
  )
}
