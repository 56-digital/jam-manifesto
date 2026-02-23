'use client'

import { useState } from 'react'
import { definitions } from '@/lib/definitions'

interface AnnotateProps {
  term: string
  children: React.ReactNode
}

export function Annotate({ term, children }: AnnotateProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const definition = definitions[term.toLowerCase()]

  return (
    <span
      className="annotate-term"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        borderBottom: '1px dotted #666',
        cursor: 'help',
        position: 'relative'
      }}
    >
      {children}
      {showTooltip && definition && (
        <span
          style={{
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
            maxWidth: '320px',
            width: 'max-content',
            marginBottom: '8px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            pointerEvents: 'none'
          }}
        >
          {definition}
          <span
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1a1a1a'
            }}
          />
        </span>
      )}
    </span>
  )
}
