import { create } from 'zustand'

export const STEPS = 32
export type VoiceName = 'kick' | 'snare' | 'hat' | 'perc'

export interface VoiceParams {
  kick: { decay: number; tune: number; drive: number }
  snare: { decay: number; tune: number; snappy: number }
  hat: { decay: number; tune: number; open: number }
  perc: { decay: number; tune: number; drive: number }
}

export interface DrumPreset {
  name: string
  description: string
  bpm: number
  patterns: Record<VoiceName, boolean[]>
  params: VoiceParams
}

function empty(): boolean[] { return Array(STEPS).fill(false) }

function euclidean(steps: number, hits: number): boolean[] {
  const pattern = Array(steps).fill(false)
  let bucket = 0
  for (let i = 0; i < steps; i++) {
    bucket += hits
    if (bucket >= steps) { bucket -= steps; pattern[i] = true }
  }
  return pattern
}

export const PRESETS: Record<string, DrumPreset> = {
  four_on_floor: {
    name: 'Four on the Floor',
    description: 'Classic 4/4 house pattern',
    bpm: 128,
    patterns: {
      kick:  Array.from({ length: 32 }, (_, i) => i % 8 === 0),
      snare: Array.from({ length: 32 }, (_, i) => i === 8 || i === 24),
      hat:   Array.from({ length: 32 }, (_, i) => i % 4 === 0),
      perc:  empty(),
    },
    params: {
      kick:  { decay: 0.5, tune: 60,  drive: 0.2 },
      snare: { decay: 0.3, tune: 220, snappy: 0.5 },
      hat:   { decay: 0.1, tune: 800, open: 0.1 },
      perc:  { decay: 0.3, tune: 400, drive: 0.1 },
    },
  },
  sparse: {
    name: 'Sparse',
    description: 'Minimal, breathing space',
    bpm: 90,
    patterns: {
      kick:  Array.from({ length: 32 }, (_, i) => i === 0 || i === 18),
      snare: Array.from({ length: 32 }, (_, i) => i === 12 || i === 28),
      hat:   Array.from({ length: 32 }, (_, i) => i % 12 === 0),
      perc:  empty(),
    },
    params: {
      kick:  { decay: 0.8, tune: 55,  drive: 0.1 },
      snare: { decay: 0.5, tune: 200, snappy: 0.3 },
      hat:   { decay: 0.2, tune: 600, open: 0.4 },
      perc:  { decay: 0.4, tune: 300, drive: 0.0 },
    },
  },
  euclidean: {
    name: 'Euclidean',
    description: 'Mathematical hit distribution',
    bpm: 120,
    patterns: {
      kick:  euclidean(32, 7),
      snare: euclidean(32, 5),
      hat:   euclidean(32, 11),
      perc:  euclidean(32, 3),
    },
    params: {
      kick:  { decay: 0.4, tune: 60,   drive: 0.3 },
      snare: { decay: 0.25, tune: 250, snappy: 0.7 },
      hat:   { decay: 0.08, tune: 1000, open: 0.0 },
      perc:  { decay: 0.2,  tune: 500,  drive: 0.2 },
    },
  },
  broken: {
    name: 'Broken',
    description: 'Offbeat, irregular, glitchy',
    bpm: 140,
    patterns: {
      kick:  Array.from({ length: 32 }, (_, i) => [1, 5, 13, 17, 22, 27].includes(i)),
      snare: Array.from({ length: 32 }, (_, i) => [7, 14, 20, 29].includes(i)),
      hat:   Array.from({ length: 32 }, (_, i) => [0, 3, 6, 11, 16, 19, 24, 28].includes(i)),
      perc:  Array.from({ length: 32 }, (_, i) => [4, 9, 21, 31].includes(i)),
    },
    params: {
      kick:  { decay: 0.3, tune: 50,  drive: 0.6 },
      snare: { decay: 0.2, tune: 300, snappy: 0.9 },
      hat:   { decay: 0.05, tune: 1200, open: 0.0 },
      perc:  { decay: 0.15, tune: 600, drive: 0.5 },
    },
  },
  empty: {
    name: 'Empty',
    description: 'Clean slate',
    bpm: 120,
    patterns: { kick: empty(), snare: empty(), hat: empty(), perc: empty() },
    params: {
      kick:  { decay: 0.5, tune: 60,  drive: 0.2 },
      snare: { decay: 0.3, tune: 220, snappy: 0.5 },
      hat:   { decay: 0.1, tune: 800, open: 0.1 },
      perc:  { decay: 0.3, tune: 400, drive: 0.1 },
    },
  },
}

interface MusicState {
  playing: boolean
  bpm: number
  currentStep: number
  patterns: Record<VoiceName, boolean[]>
  params: VoiceParams
  setPlaying: (v: boolean) => void
  setBpm: (v: number) => void
  setCurrentStep: (v: number) => void
  setStep: (voice: VoiceName, step: number, value: boolean) => void
  setParam: <V extends VoiceName>(voice: V, param: keyof VoiceParams[V], value: number) => void
  applyPreset: (key: string) => void
}

export const useMusicStore = create<MusicState>((set) => ({
  playing: false,
  bpm: 128,
  currentStep: -1,
  patterns: PRESETS.four_on_floor.patterns,
  params: PRESETS.four_on_floor.params,

  setPlaying: (v) => set({ playing: v }),
  setBpm: (v) => set({ bpm: v }),
  setCurrentStep: (v) => set({ currentStep: v }),

  setStep: (voice, step, value) =>
    set((s) => ({
      patterns: {
        ...s.patterns,
        [voice]: s.patterns[voice].map((b, i) => (i === step ? value : b)),
      },
    })),

  setParam: (voice, param, value) =>
    set((s) => ({
      params: {
        ...s.params,
        [voice]: { ...s.params[voice], [param]: value },
      },
    })),

  applyPreset: (key) => {
    const p = PRESETS[key]
    if (p) set({ patterns: p.patterns, params: p.params, bpm: p.bpm })
  },
}))
