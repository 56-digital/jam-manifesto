'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useMusicStore, PRESETS } from '@/lib/music-store'

interface Props {
  prompt: string
  preset: string
  description: string
}

export function AgentPrompt({ prompt, preset, description }: Props) {
  const [state, setState] = useState<'idle' | 'applied'>('idle')
  const applyPreset = useMusicStore((s) => s.applyPreset)
  const setPlaying  = useMusicStore((s) => s.setPlaying)

  const handleClick = () => {
    if (state === 'applied') return
    applyPreset(preset)
    setPlaying(true)
    setState('applied')
    setTimeout(() => setState('idle'), 3500)
  }

  const presetData = PRESETS[preset]

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ borderColor: '#444' }}
      style={{
        cursor:     state === 'applied' ? 'default' : 'pointer',
        border:     '1px solid #222',
        padding:    '14px 16px',
        margin:     '8px 0',
        background: '#0d0d0d',
        fontFamily: 'monospace',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ color: '#333', fontSize: '10px', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
        agent prompt
      </div>
      <div style={{ color: '#bbb', fontSize: '13px' }}>
        &ldquo;{prompt}&rdquo;
      </div>

      <AnimatePresence>
        {state === 'applied' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #1e1e1e' }}
          >
            <div style={{ color: '#44ff88', fontSize: '11px', marginBottom: '4px' }}>
              ✓ applied — {description}
            </div>
            {presetData && (
              <div style={{ color: '#444', fontSize: '10px' }}>
                {presetData.bpm} bpm · {presetData.name.toLowerCase()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
