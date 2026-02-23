// Tone.js engine — browser only, never imported on server
// All top-level state lives in module scope

let initialized = false
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let seqs: any[] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let synths: any = {}

export async function startEngine() {
  if (typeof window === 'undefined') return
  const Tone = await import('tone')
  const { useMusicStore } = await import('./music-store')

  if (!initialized) {
    await Tone.start()

    // Kick: MembraneSynth → Distortion → Filter → Destination
    const kickFilter = new Tone.Filter(200, 'lowpass').toDestination()
    const kickDist   = new Tone.Distortion(0.2).connect(kickFilter)
    synths.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 8,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
    }).connect(kickDist)

    // Snare: NoiseSynth → HPFilter → Destination
    const snareFilter = new Tone.Filter(800, 'highpass').toDestination()
    synths.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 },
    }).connect(snareFilter)

    // Hat: MetalSynth → Destination
    synths.hat = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination()
    synths.hat.frequency.value = 400

    // Perc: MembraneSynth (higher range) → Distortion → Destination
    const percDist = new Tone.Distortion(0.1).toDestination()
    synths.perc = new Tone.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 4,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 },
    }).connect(percDist)

    initialized = true
  }

  const voices = ['kick', 'snare', 'hat', 'perc'] as const

  // Single sequence advances the playhead — only one needs to do this
  const stepSeq = new Tone.Sequence(
    (time: number, step: number) => {
      // Schedule UI update near the audio event using Draw if available, else rAF
      const updateStep = () => useMusicStore.getState().setCurrentStep(step)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Draw = (Tone as any).getDraw?.() ?? (Tone as any).Draw
        if (Draw?.schedule) {
          Draw.schedule(updateStep, time)
        } else {
          requestAnimationFrame(updateStep)
        }
      } catch {
        requestAnimationFrame(updateStep)
      }
    },
    Array.from({ length: 32 }, (_, i) => i),
    '16n'
  )

  seqs = [
    stepSeq,
    ...voices.map((voice) =>
      new Tone.Sequence(
        (time: number, step: number) => {
          if (!synths[voice]) return
          const state = useMusicStore.getState()
          if (!state.patterns[voice][step]) return
          const p = state.params[voice]
          const dur = Math.max(0.05, p.decay)

          if (voice === 'kick') {
            synths.kick.triggerAttackRelease('C1', dur, time)
          } else if (voice === 'snare') {
            synths.snare.triggerAttackRelease(dur, time)
          } else if (voice === 'hat') {
            synths.hat.triggerAttackRelease(dur, time)
          } else if (voice === 'perc') {
            synths.perc.triggerAttackRelease('G2', dur, time)
          }
        },
        Array.from({ length: 32 }, (_, i) => i),
        '16n'
      )
    ),
  ]

  Tone.getTransport().bpm.value = useMusicStore.getState().bpm
  seqs.forEach((s) => s.start(0))
  Tone.getTransport().start()
}

export async function stopEngine() {
  if (typeof window === 'undefined') return
  const Tone = await import('tone')
  Tone.getTransport().stop()
  seqs.forEach((s) => { try { s.stop(); s.dispose() } catch { /* ignore */ } })
  seqs = []
  // Reset so next startEngine call re-creates synths cleanly
  initialized = false
  synths = {}
}

export async function syncBpm(bpm: number) {
  if (typeof window === 'undefined') return
  const Tone = await import('tone')
  Tone.getTransport().bpm.value = bpm
}
