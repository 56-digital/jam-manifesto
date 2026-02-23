'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { unlockAudio } from '@/lib/audio-unlock'

const FG = '#273141'
const DIM = '#7c8c96'
const OFF = '#e8eaec'

const MAX_W = '1100px'
const FREQS = [600, 1800, 3000, 4200, 5400, 6600, 7800, 9000, 10200, 11400, 12600, 13800, 15000]

const A = 0.09
const MAX_GAIN = A

const INITIAL_GAINS = FREQS.map((_, i) => A / (2 * i + 1))

const BUILD_STEPS = [
  {
    label: 'place thirteen oscillators at fixed frequencies (600–15000 Hz) and give each one its own envelope to gate in polyrhythm',
    done:  'thirteen oscillators placed — envelopes and polyrhythmic gates running',
  },
  {
    label: 'add a spectrogram so I can see the frequencies as they interact',
    done:  'spectrogram added',
  },
  {
    label: 'give each one its own amplitude control, I want to be able to bring each frequency in and out independently',
    done:  'thirteen faders exposed — each one live',
  },
  {
    label: 'add a bass drum four on the floor',
    done:  'bass drum locked — four on the floor',
  },
  {
    label: 'now add rolling hihats!',
    done:  'rolling hihats running',
  },
  {
    label: 'add a quiet white noise lowpass sweep (not synced)',
    done:  'white noise sweep running',
  },
]

const STEP_WORK = [
  'adding oscillators + envelopes…',
  'visualizing the spectrum…',
  'wiring amplitude controls…',
  'adding a bass drum…',
  'rolling hihats…',
  'adding a quiet noise sweep…',
]

type MsgRole = 'user' | 'agent' | 'note'

type Message = {
  id: string
  role: MsgRole
  text: string
}

export function DrumMachine() {
  const [phase,   setPhase]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [gains,   setGains]   = useState<number[]>(INITIAL_GAINS)
  const [isMuted, setIsMuted] = useState(false)
  const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const [messages, setMessages] = useState<Message[]>(() => [
    { id: newId(), role: 'user',  text: "let\u2019s run a session" },
    { id: newId(), role: 'agent', text: "it\u2019s already running." },
  ])

  const chatScrollRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oscRefs       = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gainRefs      = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gateRefs      = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envRefs       = useRef<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const masterRef     = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analyserRef   = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kickRef       = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hatRef        = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noiseRef      = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noiseFilterRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noiseLfoRef    = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kickLoopRef   = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hatLoopRef    = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polyPartsRef  = useRef<any[]>([])
  const envelopesOnRef = useRef(false)
  const noiseOnRef     = useRef(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number | null>(null)

  const addMessage = (role: MsgRole, text: string) => {
    setMessages(prev => [...prev, { id: newId(), role, text }])
  }

  useEffect(() => {
    const el = chatScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  // ── spectrogram ─────────────────────────────────────────────────────────────

  const drawLoop = useCallback(() => {
    const canvas   = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const data = analyser.getValue() as Float32Array

    ctx.clearRect(0, 0, W, H)

    const sampleRate = 44100
    const fftSize    = data.length * 2
    const hzPerBin   = sampleRate / fftSize
    const maxHz      = 15000
    const binsToShow = Math.floor(maxHz / hzPerBin)

    for (let i = 1; i < Math.min(binsToShow, data.length); i++) {
      const hz         = i * hzPerBin
      const x          = (hz / maxHz) * W
      const nextX      = ((hz + hzPerBin) / maxHz) * W
      const barW       = Math.max(1, nextX - x - 0.5)
      const normalized = Math.max(0, (data[i] + 90) / 90)
      const barH       = normalized * H

      ctx.fillStyle = normalized > 0.15 ? FG : OFF
      ctx.fillRect(x, H - barH, barW, barH)
    }

    rafRef.current = requestAnimationFrame(drawLoop)
  }, [])

  // ── audio init ──────────────────────────────────────────────────────────────

  const initAudio = useCallback(async () => {
    const Tone = await import('tone')

    const master = new (Tone.Gain as any)(1)
    master.toDestination()
    masterRef.current = master

    const analyser = new Tone.Analyser('fft', 2048)
    master.connect(analyser)
    analyserRef.current = analyser

    const oscs: unknown[]   = []
    const gNodes: unknown[] = []
    const gates: unknown[]  = []
    const envs: unknown[]   = []

    for (let i = 0; i < FREQS.length; i++) {
      const baseGain = new (Tone.Gain as any)(INITIAL_GAINS[i])
      baseGain.connect(master)

      const gate = new (Tone.Gain as any)(1)
      gate.connect(baseGain)

      const env = new (Tone.Envelope as any)({
        attack: 0.005,
        decay: 0.09,
        sustain: 0.0,
        release: 0.12,
      })

      const osc = new (Tone.Oscillator as any)({ frequency: FREQS[i], type: 'sawtooth' })
      osc.connect(gate)
      osc.start()

      oscs.push(osc)
      gNodes.push(baseGain)
      gates.push(gate)
      envs.push(env)
    }

    oscRefs.current  = oscs  as any[]
    gainRefs.current = gNodes as any[]
    gateRefs.current = gates as any[]
    envRefs.current  = envs as any[]
  }, [])

  // ── cleanup ─────────────────────────────────────────────────────────────────

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    polyPartsRef.current.forEach((p) => { try { p.stop(); p.dispose() } catch { /* */ } })
    if (kickLoopRef.current) { try { kickLoopRef.current.stop(); kickLoopRef.current.dispose() } catch { /* */ } }
    if (hatLoopRef.current)  { try { hatLoopRef.current.stop();  hatLoopRef.current.dispose()  } catch { /* */ } }
    if (kickRef.current) { try { kickRef.current.dispose() } catch { /* */ } }
    if (hatRef.current) { try { hatRef.current.dispose() } catch { /* */ } }
    if (noiseRef.current) { try { noiseRef.current.dispose() } catch { /* */ } }
    if (noiseFilterRef.current) { try { noiseFilterRef.current.dispose() } catch { /* */ } }
    if (noiseLfoRef.current) { try { noiseLfoRef.current.dispose() } catch { /* */ } }
    oscRefs.current.forEach(o  => { try { o.stop(); o.dispose() } catch { /* */ } })
    envRefs.current.forEach(e => { try { e.dispose()          } catch { /* */ } })
    gateRefs.current.forEach(g => { try { g.dispose()         } catch { /* */ } })
    gainRefs.current.forEach(g => { try { g.dispose()         } catch { /* */ } })
    if (analyserRef.current) { try { analyserRef.current.dispose() } catch { /* */ } }
  }, [])

  // ── start draw loop when canvas mounts ─────────────────────────────────────

  useEffect(() => {
    if (phase < 2) return
    const id = requestAnimationFrame(drawLoop)
    rafRef.current = id
    return () => cancelAnimationFrame(id)
  }, [phase, drawLoop])

  // ── mute ────────────────────────────────────────────────────────────────────

  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    if (masterRef.current) masterRef.current.gain.value = next ? 0 : 1
  }

  // ── envelopes + polyrhythm (Tone.Transport-based) ──────────────────────────

  const enableEnvelopesAndPolyrhythm = async () => {
    if (envelopesOnRef.current) return
    envelopesOnRef.current = true

    const Tone = await import('tone')
    Tone.getTransport().bpm.value = 140

    // Full grid from 32nd notes to 2 bars — wide spread for Ikeda-style variance
    const intervals = [
      '32n', '32n', '32n',         // bias toward fast
      '16n', '16n', '16n', '16n',  // most common
      '16t', '8t', '4t',           // triplet subdivisions
      '8n', '8n.',
      '4n', '4n.',
      '2n', '2n.',
      '1m', '2m',                  // very slow — long silences
    ]

    const rand  = (a: number, b: number) => a + Math.random() * (b - a)
    const pick  = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

    const parts: any[] = []

    for (let i = 0; i < FREQS.length; i++) {
      const gate = gateRefs.current[i]
      const env  = envRefs.current[i]
      if (!gate || !env) continue

      env.connect(gate.gain)
      gate.gain.value = 0

      // Ikeda: attacks are near-zero (clinical precision), decays vary wildly
      env.attack  = rand(0.0005, 0.004)
      env.decay   = pick([0.01, 0.015, 0.02, 0.04, 0.08, 0.15, 0.3, 0.6])
      env.sustain = 0
      env.release = 0.005

      const interval = pick(intervals)

      // Probability is very skewed — most voices are mostly silent
      // A few are dense, creating sudden bursts against long gaps
      const r = Math.random()
      const probability = r < 0.3
        ? rand(0.05, 0.15)   // very sparse — long silences
        : r < 0.7
          ? rand(0.2, 0.45)  // mid — occasional hits
          : rand(0.6, 0.95)  // dense — rapid bursts

      // Stagger starts across 2 bars so onset is scattered, not a wall
      const offsetSteps = Math.floor(Math.random() * 32)
      const offset = `${offsetSteps}*32n`

      const loop = new (Tone.Loop as any)((time: number) => {
        if (Math.random() < probability) {
          env.triggerAttackRelease(env.decay, time)
        }
      }, interval)
      loop.start(offset)
      parts.push(loop)
    }

    polyPartsRef.current = parts
    Tone.getTransport().start()
  }

  // ── kick (Tone.Loop) ────────────────────────────────────────────────────────

  const startKick = async () => {
    if (kickRef.current || !masterRef.current) return
    const Tone = await import('tone')

    const kick = new (Tone.MembraneSynth as any)({
      pitchDecay: 0.05,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 },
    })
    kick.connect(masterRef.current)
    kickRef.current = kick

    const loop = new (Tone.Loop as any)((time: number) => {
      kick.triggerAttackRelease('C1', '8n', time)
    }, '4n')
    loop.start(0)
    kickLoopRef.current = loop

    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start()
    }
  }

  // ── hats (Tone.Loop) ────────────────────────────────────────────────────────

  const startHats = async () => {
    if (hatRef.current || !masterRef.current) return
    const Tone = await import('tone')

    const hat = new (Tone.MetalSynth as any)({
      envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    })
    hat.frequency.value = 400
    hat.volume.value = -14
    hat.connect(masterRef.current)
    hatRef.current = hat

    const loop = new (Tone.Loop as any)((time: number) => {
      hat.triggerAttackRelease('16n', time)
    }, '16n')
    loop.start(0)
    hatLoopRef.current = loop

    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start()
    }
  }

  // ── noise sweep ─────────────────────────────────────────────────────────────

  const startNoiseSweep = async () => {
    if (noiseOnRef.current || !masterRef.current) return
    noiseOnRef.current = true

    const Tone = await import('tone')

    const noise  = new (Tone.Noise as any)('white')
    const filter = new (Tone.Filter as any)({ type: 'lowpass', frequency: 300 })
    const gain   = new (Tone.Gain as any)(0.03)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(masterRef.current)

    const lfo = new (Tone.LFO as any)({ frequency: 0.03, min: 150, max: 2000 }).start()
    lfo.connect(filter.frequency)

    noise.start()

    noiseRef.current      = noise
    noiseFilterRef.current = filter
    noiseLfoRef.current    = lfo
  }

  // ── build ───────────────────────────────────────────────────────────────────

  const handleBuild = async () => {
    if (loading) return
    const step = phase

    // Unlock AudioContext synchronously in this gesture before any async work
    await unlockAudio()

    setLoading(true)

    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    addMessage('user', BUILD_STEPS[step].label)
    await sleep(350)
    addMessage('agent', STEP_WORK[step])

    const audioInit = step === 0
      ? initAudio().then(() => enableEnvelopesAndPolyrhythm())
      : Promise.resolve()

    await Promise.all([audioInit, sleep(1200)])

    if (step === 3) await startKick()
    if (step === 4) await startHats()
    if (step === 5) await startNoiseSweep()

    await sleep(350)
    addMessage('agent', BUILD_STEPS[step].done)

    setLoading(false)
    setPhase(step + 1)
  }

  // ── fader ───────────────────────────────────────────────────────────────────

  const handleGain = (i: number, v: number) => {
    setGains(prev => { const n = [...prev]; n[i] = v; return n })
    const g = gainRefs.current[i]
    if (g) g.gain.value = v
  }

  // ── render ──────────────────────────────────────────────────────────────────

  const nextBuild = phase < BUILD_STEPS.length ? BUILD_STEPS[phase] : null

  return (
    <>
      {phase >= 1 && (
        <button
          onClick={toggleMute}
          title={isMuted ? 'unmute' : 'mute'}
          style={{
            position:       'fixed',
            top:            '24px',
            right:          '24px',
            zIndex:         100,
            width:          '50px',
            height:         '50px',
            background:     isMuted ? FG : '#fff',
            border:         `1px solid ${FG}`,
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        0,
          }}
        >
          {isMuted
            ? <VolumeX size={22} color="#fff" strokeWidth={1.5} />
            : <Volume2 size={22} color={FG} strokeWidth={1.5} />}
        </button>
      )}

      <div style={{
        background: '#fff',
        border:     `4px solid ${FG}`,
        margin:     '40px auto',
        maxWidth:   MAX_W,
        width:      '100%',
        fontFamily: 'ui-monospace, monospace',
        userSelect: 'none',
        position:   'relative',
      }}>
        <div className="dm-disclaimer">WORKFLOW SIMULATION</div>
        <div className="dm-panel">
          <div className="dm-chat">
            <div className="dm-chat-scroll" ref={chatScrollRef}>
              {messages.map((m, i) => (
                <div key={`${m.id}-${i}`} className={`dm-msg dm-${m.role}`}>
                  <div className="dm-bubble">{m.text}</div>
                </div>
              ))}
            </div>

            {nextBuild && (
              <button
                onClick={handleBuild}
                disabled={loading}
                className="dm-prompt"
              >
                <span className="dm-prompt-arrow">{loading ? '' : '›'}</span>
                <span className="dm-prompt-text">{loading ? '' : nextBuild.label}</span>
              </button>
            )}
          </div>

          <div className="dm-visual">
            {phase >= 1 && (
              <div className="dm-block">
                <div className="dm-grid">
                  {FREQS.map((hz, i) => (
                    <div key={hz} className="dm-node">
                      <div className="dm-dot" style={{ background: phase >= 3 && gains[i] < 0.01 ? OFF : FG }} />
                      <span className="dm-label">{hz >= 1000 ? `${hz / 1000}k` : hz} Hz</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phase >= 2 && (
              <div className="dm-block">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={60}
                  style={{ width: '100%', height: '60px', display: 'block', background: OFF }}
                />
                <div className="dm-spectrum-labels">
                  <span>600 Hz</span>
                  <span>7.5 kHz</span>
                  <span>15 kHz</span>
                </div>
              </div>
            )}

            {phase >= 3 && (
              <div className="dm-block">
                <div className="dm-faders">
                  {FREQS.map((hz, i) => (
                    <div key={hz} className="dm-fader">
                      <input
                        type="range"
                        min={0} max={100}
                        value={Math.round(gains[i] * 100 / MAX_GAIN)}
                        onChange={e => handleGain(i, (Number(e.target.value) / 100) * MAX_GAIN)}
                      />
                      <span className="dm-label" style={{ color: gains[i] < 0.01 ? OFF : DIM }}>
                        {hz >= 1000 ? `${hz / 1000}k` : hz}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .dm-disclaimer { font-size: 10px; color: ${DIM}; letter-spacing: 0.12em; text-transform: uppercase; padding: 12px 24px 0; }
          .dm-panel { display: flex; align-items: stretch; }
          .dm-chat, .dm-visual { flex: 1; display: flex; flex-direction: column; min-height: 420px; max-height: 420px; }
          .dm-chat { padding: 24px; border-right: 1px solid ${OFF}; }
          .dm-visual { padding: 24px; }

          .dm-chat-scroll { flex: 1; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }

          .dm-msg { display: flex; }
          .dm-user { justify-content: flex-end; }
          .dm-agent { justify-content: flex-start; }
          .dm-note { justify-content: center; }

          .dm-bubble {
            max-width: 85%;
            font-size: 11px;
            line-height: 1.4;
            padding: 6px 10px;
            border: 1px solid ${FG};
            color: ${FG};
            background: #fff;
          }
          .dm-user .dm-bubble { background: ${FG}; color: #fff; }
          .dm-note .dm-bubble { border: none; color: ${DIM}; font-style: italic; }

          .dm-prompt {
            margin-top: 16px;
            width: 100%;
            background: transparent;
            border: 1px solid ${FG};
            color: ${FG};
            padding: 10px 12px;
            font-size: 11px;
            font-family: ui-monospace, monospace;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }
          .dm-prompt:disabled { color: ${DIM}; border-color: ${DIM}; cursor: default; }
          .dm-prompt-arrow { color: ${DIM}; }
          .dm-prompt-text { flex: 1; }

          .dm-block { margin-bottom: 14px; }
          .dm-grid { display: flex; flex-wrap: wrap; gap: 6px; }
          .dm-node { flex: 1 0 calc(7.69% - 6px); min-width: 52px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .dm-dot { width: 6px; height: 6px; border-radius: 50%; }
          .dm-label { font-size: 9px; color: ${DIM}; white-space: nowrap; }

          .dm-spectrum-labels { display: flex; justify-content: space-between; margin-top: 3px; color: ${DIM}; font-size: 9px; }

          .dm-faders { display: flex; flex-wrap: wrap; gap: 4px 6px; }
          .dm-fader { flex: 1 0 calc(7.69% - 6px); min-width: 52px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
          .dm-fader input { width: 100%; accent-color: ${FG}; }

          @media (max-width: 900px) {
            .dm-panel { flex-direction: column; }
            .dm-chat { border-right: none; border-bottom: 1px solid ${OFF}; }
          }

          @keyframes dmPulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        `}</style>
      </div>
    </>
  )
}
