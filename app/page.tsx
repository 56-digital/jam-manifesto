import { DrumMachine } from '@/components/DrumMachine'
import { AgentPrompt } from '@/components/AgentPrompt'
import { MermaidDiagram } from '@/components/MermaidDiagram'

const s = {
  page: {
    maxWidth: '760px',
    margin: '0 auto',
    padding: '80px 24px 120px',
  } as React.CSSProperties,
  eyebrow: {
    color: '#333',
    fontSize: '11px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 400,
    letterSpacing: '0.08em',
    marginBottom: '4px',
    color: '#e0e0e0',
  },
  subtitle: {
    color: '#444',
    fontSize: '12px',
    marginBottom: '72px',
  },
  section: {
    marginBottom: '0',
  },
  h2: {
    fontSize: '11px',
    color: '#555',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    margin: '64px 0 20px',
    fontWeight: 400,
  },
  p: {
    color: '#888',
    lineHeight: 1.8,
    marginBottom: '20px',
    maxWidth: '580px',
  },
  ref: {
    display: 'block',
    color: '#444',
    fontSize: '11px',
    margin: '6px 0',
    paddingLeft: '12px',
    borderLeft: '1px solid #222',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #1a1a1a',
    margin: '64px 0',
  },
}

export default function Home() {
  return (
    <main style={s.page}>
      <div style={s.eyebrow}>working document — rev 0.1</div>
      <h1 style={s.title}>JAM MANIFESTO</h1>
      <p style={s.subtitle}>natural language meets modular synthesis</p>

      {/* ── The Problem ────────────────────────────────── */}
      <h2 style={s.h2}>The Problem</h2>
      <p style={s.p}>
        Music tools are closed systems. A synthesizer speaks its own language.
        A DAW speaks another. Agents speak none of them. The result: you hire
        specialists, you build glue, you compromise. The creative layer and the
        control layer have never shared a common tongue.
      </p>
      <p style={s.p}>
        The drum machine below is live. Press play.
      </p>

      <DrumMachine />

      {/* ── The Vision ─────────────────────────────────── */}
      <h2 style={s.h2}>The Vision</h2>
      <p style={s.p}>
        Natural language as the universal control surface. Not a wrapper — a
        foundation. When you say &ldquo;sparse kick, metallic hats, breathing
        room&rdquo; the system understands not just the words but the intention,
        and translates that into a living, sounding thing.
      </p>
      <p style={s.p}>
        An agent should be able to walk into a session, ask what&apos;s
        available, and start playing — the same way a musician picks up an
        instrument. No documentation required. No SDK. Just language.
      </p>

      <AgentPrompt
        prompt="start with a four on the floor kick at 128 bpm"
        preset="four_on_floor"
        description="classic 4/4 — kick every beat, snare on 2 and 4"
      />

      {/* ── What Exists ────────────────────────────────── */}
      <h2 style={s.h2}>What Exists</h2>
      <p style={s.p}>
        The pieces exist separately. No one has connected them.
      </p>
      <p style={s.p}>
        MCP2OSC (2025) demonstrated that LLMs generate OSC address spaces
        naturally — give a model a synthesis context and it produces
        semantically correct parameter paths. VCV Rack proved a modular plugin
        ecosystem can thrive on loose standards: 1V/oct pitch, 5V gates, and
        good faith. Laptop orchestras at Carnegie Mellon and Princeton showed
        networked music performance is real and worth doing. Collab-Hub showed
        an observer-pattern broadcast model for creative tools.
      </p>

      <span style={s.ref}>MCP2OSC — arxiv.org/abs/2508.10414</span>
      <span style={s.ref}>VCV Rack — vcvrack.com/manual/PluginDevelopmentTutorial</span>
      <span style={s.ref}>CMU Laptop Orchestra — cs.cmu.edu/~rbd/papers/icmc07laptop.pdf</span>
      <span style={s.ref}>Collab-Hub — collab-hub.io</span>

      <MermaidDiagram chart={`graph LR
  NL["Natural Language"] --> LLM["LLM"]
  LLM --> OSC["OSC Commands"]
  OSC --> SC["scsynth"]
  SC --> Audio["Sound"]
  style NL fill:#1a1a1a,stroke:#333
  style LLM fill:#1a1a1a,stroke:#333
  style OSC fill:#1a1a1a,stroke:#333
  style SC fill:#1a1a1a,stroke:#333
  style Audio fill:#1a1a1a,stroke:#333`}
      />

      {/* ── The Gap ────────────────────────────────────── */}
      <h2 style={s.h2}>The Gap</h2>
      <p style={s.p}>
        No existing system positions natural language as the primary interface
        across an entire networked music architecture. No system treats clients
        as autonomous agents rather than UI layers. No system is designed from
        the start for discoverability — where any participant can ask what
        exists and receive a machine-readable answer.
      </p>

      <MermaidDiagram chart={`graph TB
  subgraph Clients
    Agent["AI Agent"]
    TUI["Terminal Client"]
    Web["Web Client"]
  end
  subgraph Server["Perkons Server"]
    Seq["Sequencer"]
    Reg["Capability Registry"]
  end
  Agent --> Server
  TUI --> Server
  Web --> Server
  Server --> SC["scsynth"]
  Server --> Link["Ableton Link"]
  SC --> Audio["Audio Output"]
  style Agent fill:#1a1a1a,stroke:#aa44ff
  style TUI fill:#1a1a1a,stroke:#44aaff
  style Web fill:#1a1a1a,stroke:#ff8800
  style SC fill:#1a1a1a,stroke:#333
  style Link fill:#1a1a1a,stroke:#333
  style Audio fill:#1a1a1a,stroke:#44ff88`}
      />

      {/* ── Hear It ────────────────────────────────────── */}
      <h2 style={s.h2}>Hear It</h2>
      <p style={s.p}>
        These are the prompts an agent would send. Each one mutates the pattern
        above in real time. This is the web demo — the same logic runs on the
        actual Perkons server via OSC.
      </p>

      <AgentPrompt
        prompt="make it sparse — give it room to breathe"
        preset="sparse"
        description="minimal kick, open hats, space between every hit"
      />
      <AgentPrompt
        prompt="euclidean rhythms — mathematical, interlocking"
        preset="euclidean"
        description="7-in-32 kick · 11-in-32 hats · 5-in-32 snare"
      />
      <AgentPrompt
        prompt="break it — offbeat, glitchy, unstable"
        preset="broken"
        description="irregular kicks, displaced snare, fragmented hats at 140"
      />

      {/* ── The Path Forward ───────────────────────────── */}
      <h2 style={s.h2}>The Path Forward</h2>
      <p style={s.p}>
        An MCP server on top of the OSC layer. Any MCP-compatible agent
        connects and immediately knows what&apos;s available — the capability
        registry is the documentation. The drum machine becomes discoverable.
        The architecture becomes composable. The session becomes a conversation.
      </p>
      <p style={s.p}>
        The OpenTUI terminal client is already running. The SuperCollider
        backend has 36 SynthDefs across 4 voices. The sequencer supports 32
        steps, parameter locks per step, probability, ratchet, euclidean
        patterns. This page is the web surface of the same system.
      </p>

      <hr style={s.divider} />
      <p style={{ ...s.p, fontSize: '11px', color: '#333' }}>
        github.com/56-digital/perkons · 56.digital
      </p>
    </main>
  )
}
