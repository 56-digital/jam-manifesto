'use client'

import { useEffect } from 'react'
import { useMusicStore } from '@/lib/music-store'
import { primeAudio } from '@/lib/audio-unlock'

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const playing    = useMusicStore((s) => s.playing)
  const audioReady = useMusicStore((s) => s.audioReady)
  const bpm        = useMusicStore((s) => s.bpm)

  useEffect(() => {
    primeAudio()
  }, [])

  useEffect(() => {
    if (!audioReady) return
    if (playing) {
      import('@/lib/tone-engine').then((e) => e.startEngine())
    } else {
      import('@/lib/tone-engine').then((e) => e.stopEngine())
    }
  }, [playing, audioReady])

  useEffect(() => {
    if (!audioReady) return
    import('@/lib/tone-engine').then((e) => e.syncBpm(bpm))
  }, [bpm, audioReady])

  return <>{children}</>
}
