// iOS Safari requires AudioContext.resume() to be called synchronously
// within a user gesture handler. Dynamic import() is async, so we pre-load
// Tone eagerly on mount. Then the actual Tone.start() call in the gesture
// handler hits an already-resolved module — no async gap.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let toneModule: any = null

export function primeAudio() {
  if (typeof window === 'undefined' || toneModule) return
  import('tone').then((m) => { toneModule = m })
}

// Call this synchronously inside a click/touchstart handler.
// Returns a promise that resolves once the context is running.
export async function unlockAudio(): Promise<void> {
  if (typeof window === 'undefined') return

  // If not yet loaded (first ever call with no priming), load now.
  // On iOS this async gap means it may not work the very first time,
  // but primeAudio() called on mount eliminates this case in practice.
  if (!toneModule) {
    toneModule = await import('tone')
  }

  const ctx = toneModule.getContext()
  if (ctx.state !== 'running') {
    await toneModule.start()
  }

  const { useMusicStore } = await import('./music-store')
  useMusicStore.getState().setAudioReady(true)
}
