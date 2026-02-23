// iOS Safari requires AudioContext.resume() to be called in the synchronous
// portion of a user gesture — before ANY await. The pattern here:
//
// 1. primeAudio() — called on mount, pre-loads Tone and music-store modules
//    so they are cached and their imports resolve instantly (microtask, not
//    a full async gap).
// 2. unlockAudio() — resumes the native AudioContext SYNCHRONOUSLY before
//    doing anything else. Tone.start() is async internally but the underlying
//    ctx.resume() fires synchronously. We also pre-cache the music-store
//    module so the setAudioReady call has no dynamic import delay.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let toneModule: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let storeModule: any = null

export function primeAudio() {
  if (typeof window === 'undefined') return
  if (!toneModule) import('tone').then((m) => { toneModule = m })
  if (!storeModule) import('./music-store').then((m) => { storeModule = m })
}

export async function unlockAudio(): Promise<void> {
  if (typeof window === 'undefined') return

  // Ensure modules are loaded — if primeAudio() ran on mount these resolve
  // from the module cache (microtask, not a real async gap)
  if (!toneModule)  toneModule  = await import('tone')
  if (!storeModule) storeModule = await import('./music-store')

  // Resume the underlying native AudioContext synchronously.
  // Tone wraps the native ctx — calling resume() on it directly satisfies
  // iOS Safari's gesture requirement without waiting for Tone's own promises.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nativeCtx = toneModule.getContext().rawContext as AudioContext
  if (nativeCtx.state === 'suspended') {
    // fire-and-forget the native resume — this is the synchronous gesture hook
    nativeCtx.resume()
  }

  // Now do the full Tone.start() which sets up Tone's internal state
  if (toneModule.getContext().state !== 'running') {
    await toneModule.start()
  }

  storeModule.useMusicStore.getState().setAudioReady(true)
}
