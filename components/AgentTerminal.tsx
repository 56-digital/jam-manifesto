'use client'

import { useState, useEffect, useRef } from 'react'
import { useMusicStore, PRESETS } from '@/lib/music-store'

const FG      = '#273141'
const DIM     = '#7c8c96'
const BORDER  = '#273141'

const PROMPTS = [
  { text: 'start with a four on the floor kick at 128 bpm', preset: 'four_on_floor' },
  { text: 'make it sparse — give it room to breathe', preset: 'sparse' },
  { text: 'euclidean rhythms, mathematical, interlocking', preset: 'euclidean' },
  { text: 'break it — offbeat, glitchy, unstable', preset: 'broken' },
]

const RESPONSES: Record<string, string> = {
  four_on_floor: 'got it — four on the floor, kick every beat, snare on 2 and 4, 128 bpm',
  sparse:        'applying — sparse kick, open hats, 90 bpm, room to breathe',
  euclidean:     'calculating — euclidean distribution: 7-in-32 kick, 11-in-32 hats, 5-in-32 snare',
  broken:        'mutating — offbeat kick, displaced snare, fragmented hats at 140',
}

function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, done }
}

export function AgentTerminal() {
  const [inputVal, setInputVal]       = useState('')
  const [history, setHistory]         = useState<{ prompt: string; response: string }[]>([])
  const [autoIdx, setAutoIdx]         = useState(0)
  const [autoPrompt, setAutoPrompt]   = useState(PROMPTS[0].text)
  const [autoRunning, setAutoRunning] = useState(true)
  const [pending, setPending]         = useState(false)
  const bottomRef                     = useRef<HTMLDivElement>(null)
  const applyPreset = useMusicStore((s) => s.applyPreset)
  const setPlaying  = useMusicStore((s) => s.setPlaying)

  const { displayed, done } = useTypewriter(autoRunning ? autoPrompt : '', 32)

  useEffect(() => {
    if (!autoRunning || !done) return
    const current = PROMPTS[autoIdx]
    applyPreset(current.preset)
    setPlaying(true)
    setHistory((h) => [...h, { prompt: current.text, response: RESPONSES[current.preset] }])
    const next = setTimeout(() => {
      const nextIdx = (autoIdx + 1) % PROMPTS.length
      setAutoIdx(nextIdx)
      setAutoPrompt(PROMPTS[nextIdx].text)
    }, 3200)
    return () => clearTimeout(next)
  }, [done, autoRunning]) // eslint-disable-line

  const resolveInput = (raw: string): string => {
    const lower = raw.toLowerCase()
    if (lower.includes('four') || lower.includes('floor') || lower.includes('4/4'))
      return 'four_on_floor'
    if (lower.includes('sparse') || lower.includes('minimal') || lower.includes('breath'))
      return 'sparse'
    if (lower.includes('euclid') || lower.includes('math'))
      return 'euclidean'
    if (lower.includes('break') || lower.includes('glitch') || lower.includes('unstable'))
      return 'broken'
    if (lower.includes('empty') || lower.includes('clear') || lower.includes('reset'))
      return 'empty'
    return 'sparse'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim() || pending) return
    setAutoRunning(false)
    setPending(true)
    const preset = resolveInput(inputVal)
    const submitted = inputVal
    setInputVal('')
    setTimeout(() => {
      applyPreset(preset)
      setPlaying(true)
      const response = RESPONSES[preset] ?? `applied — ${PRESETS[preset]?.name ?? preset}`
      setHistory((h) => [...h, { prompt: submitted, response }])
      setPending(false)
    }, 600)
  }

  return (
    <div style={{
      background: '#fff',
      borderTop: `1px solid ${BORDER}`,
      borderBottom: `1px solid ${BORDER}`,
      fontFamily: 'ui-monospace, monospace',
      fontSize: '12px',
      margin: '40px 0',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: `1px solid ${BORDER}`,
        color: DIM,
        fontSize: '10px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>agent session</span>
        <span style={{ color: DIM }}>esc to take over</span>
      </div>

      {/* History */}
      <div style={{ padding: '14px', minHeight: '80px', maxHeight: '240px', overflowY: 'auto' }}>
        {history.map((item, i) => (
          <div key={i} style={{ marginBottom: '14px' }}>
            <div style={{ color: FG, marginBottom: '4px' }}>
              <span style={{ color: DIM, marginRight: '8px' }}>›</span>
              {item.prompt}
            </div>
            <div style={{ color: DIM, paddingLeft: '16px', fontSize: '11px' }}>
              {item.response}
            </div>
          </div>
        ))}

        {autoRunning && (
          <div style={{ color: FG }}>
            <span style={{ color: DIM, marginRight: '8px' }}>›</span>
            {displayed}
            <span style={{
              display: 'inline-block',
              width: '6px',
              height: '13px',
              background: FG,
              marginLeft: '2px',
              verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        borderTop: `1px solid ${BORDER}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: '8px',
      }}>
        <span style={{ color: DIM, fontSize: '14px' }}>›</span>
        <input
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value)
            setAutoRunning(false)
          }}
          placeholder="describe what you want to hear..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: FG,
            fontFamily: 'ui-monospace, monospace',
            fontSize: '12px',
            padding: '12px 0',
            caretColor: FG,
          }}
        />
        {pending && (
          <span style={{ color: DIM, fontSize: '10px' }}>...</span>
        )}
      </form>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
