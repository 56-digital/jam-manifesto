'use client'

import { useEffect } from 'react'
import { useMusicStore } from '@/lib/music-store'

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const playing = useMusicStore((s) => s.playing)
  const bpm     = useMusicStore((s) => s.bpm)

  useEffect(() => {
    if (playing) {
      import('@/lib/tone-engine').then((e) => e.startEngine())
    } else {
      import('@/lib/tone-engine').then((e) => e.stopEngine())
    }
  }, [playing])

  useEffect(() => {
    import('@/lib/tone-engine').then((e) => e.syncBpm(bpm))
  }, [bpm])

  return <>{children}</>
}
