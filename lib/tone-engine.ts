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
  seqs = voices.map((voice) =>
    new Tone.Sequence(
      (time: number, step: number) => {
        const state = useMusicStore.getState()
        // Update playhead (schedule in Tone's draw callback for sync)
        Tone.getDraw().schedule(() => {
          useMusicStore.getState().setCurrentStep(step)
        }, time)

        if (!state.patterns[voice][step]) return
        const p = state.params[voice]

        if (voice === 'kick') {
          synths.kick.triggerAttackRelease('C1', p.decay, time)
        } else if (voice === 'snare') {
          synths.snare.triggerAttackRelease(p.decay, time)
        } else if (voice === 'hat') {
          synths.hat.triggerAttackRelease(p.decay, time)
        } else if (voice === 'perc') {
          synths.perc.triggerAttackRelease('G2', p.decay, time)
        }
      },
      Array.from({ length: 32 }, (_, i) => i),
      '16n'
    )
  )

  Tone.getTransport().bpm.value = useMusicStore.getState().bpm
  seqs.forEach((s) => s.start(0))
  Tone.getTransport().start()
}

export async function stopEngine() {
  if (typeof window === 'undefined') return
  const Tone = await import('tone')
  Tone.getTransport().stop()
  seqs.forEach((s) => s.stop())
  seqs = []
}

export async function syncBpm(bpm: number) {
  if (typeof window === 'undefined') return
  const Tone = await import('tone')
  Tone.getTransport().bpm.value = bpm
}
