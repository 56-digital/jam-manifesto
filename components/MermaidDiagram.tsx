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
        theme: 'base',
        themeVariables: {
          background:         '#fff',
          primaryColor:       '#fff',
          primaryBorderColor: '#273141',
          primaryTextColor:   '#273141',
          lineColor:          '#273141',
          secondaryColor:     '#f0f0f0',
          tertiaryColor:      '#fff',
          edgeLabelBackground: '#fff',
          fontSize:           '12px',
        },
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
        margin:      '40px 0',
        padding:     '32px 24px',
        background: '#fff',
        border:     '4px solid #273141',
        overflowX:   'auto',
        display:     'flex',
        justifyContent: 'center',
      }}
    />
  )
}
