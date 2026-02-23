'use client'

import { useEffect, useId, useRef } from 'react'

interface Props {
  chart: string
}

export function MermaidDiagram({ chart }: Props) {
  const id  = useId().replace(/:/g, '')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    import('mermaid').then((m) => {
      if (cancelled || !ref.current) return
      m.default.initialize({
        theme: 'dark',
        themeVariables: {
          background:         '#0a0a0a',
          primaryColor:       '#1a1a1a',
          primaryBorderColor: '#333',
          primaryTextColor:   '#ccc',
          lineColor:          '#444',
          secondaryColor:     '#111',
          tertiaryColor:      '#0d0d0d',
          fontSize:           '12px',
        },
        fontFamily: 'monospace',
      })
      m.default
        .render(`mermaid-${id}`, chart)
        .then(({ svg }) => {
          if (!cancelled && ref.current) ref.current.innerHTML = svg
        })
        .catch(console.error)
    })
    return () => { cancelled = true }
  }, [chart, id])

  return (
    <div
      ref={ref}
      style={{
        margin:     '28px 0',
        padding:    '20px',
        background: '#0d0d0d',
        border:     '1px solid #1e1e1e',
        overflowX:  'auto',
      }}
    />
  )
}
