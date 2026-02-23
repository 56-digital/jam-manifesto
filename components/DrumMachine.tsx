'use client'

import { useMusicStore, VoiceName } from '@/lib/music-store'

const VOICES: VoiceName[] = ['kick', 'snare', 'hat', 'perc']
const COLORS: Record<VoiceName, string> = {
  kick:  '#ff4444',
  snare: '#ff8800',
  hat:   '#44aaff',
  perc:  '#aa44ff',
}

export function DrumMachine() {
  const playing     = useMusicStore((s) => s.playing)
  const bpm         = useMusicStore((s) => s.bpm)
  const currentStep = useMusicStore((s) => s.currentStep)
  const patterns    = useMusicStore((s) => s.patterns)
  const setPlaying  = useMusicStore((s) => s.setPlaying)
  const setBpm      = useMusicStore((s) => s.setBpm)
  const setStep     = useMusicStore((s) => s.setStep)

  return (
    <div style={{
      background: '#111',
      border: '1px solid #222',
      padding: '16px',
      margin: '32px 0',
      fontFamily: 'monospace',
      userSelect: 'none',
    }}>
      {/* Transport */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <button
          onClick={() => setPlaying(!playing)}
          style={{
            background: playing ? '#222' : '#fff',
            color:      playing ? '#fff' : '#000',
            border: '1px solid #333',
            padding: '4px 16px',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {playing ? 'STOP' : 'PLAY'}
        </button>
        <span style={{ color: '#444', fontSize: '11px' }}>BPM</span>
        <input
          type="range" min={60} max={200} value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{ width: '80px', accentColor: '#888' }}
        />
        <span style={{ color: '#888', fontSize: '12px', minWidth: '28px' }}>{bpm}</span>
        <span style={{ color: '#333', fontSize: '11px', marginLeft: 'auto' }}>
          {playing ? `step ${(currentStep % 32) + 1}/32` : '—'}
        </span>
      </div>

      {/* Step grid */}
      {VOICES.map((voice) => (
        <div key={voice} style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '5px' }}>
          <span style={{
            color: COLORS[voice],
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            width: '36px',
            flexShrink: 0,
          }}>
            {voice}
          </span>
          {patterns[voice].map((on, i) => {
            const isActive = i === currentStep
            const isBeat   = i % 8 === 0
            return (
              <button
                key={i}
                onClick={() => setStep(voice, i, !on)}
                title={`step ${i + 1}`}
                style={{
                  width:        '14px',
                  height:       '14px',
                  border:       'none',
                  cursor:       'pointer',
                  flexShrink:   0,
                  background:   isActive
                    ? '#ffffff'
                    : on
                    ? COLORS[voice]
                    : isBeat ? '#1a1a1a' : '#161616',
                  opacity:      isActive ? 1 : on ? 0.9 : isBeat ? 0.6 : 0.4,
                  outline:      isActive ? `2px solid ${COLORS[voice]}` : 'none',
                  outlineOffset: '1px',
                  marginLeft:   i % 8 === 0 && i !== 0 ? '4px' : undefined,
                }}
              />
            )
          })}
        </div>
      ))}

      <div style={{ marginTop: '10px', color: '#333', fontSize: '10px' }}>
        click steps to toggle · beat groups of 8
      </div>
    </div>
  )
}
