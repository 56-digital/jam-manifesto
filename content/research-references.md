# Research References — Jam Manifesto
> Working document. Do not publish directly. Use as source material for manifesto prose.

---

## Key Finding

Your "agentic first" concept is genuinely novel — no existing system fully implements this vision, though several projects provide valuable pieces.

---

## The Natural Language Bridge: What Exists

The closest match is **MCP2OSC** (August 2025) — bridges LLMs to OSC via Model Context Protocol:

```
LLM ↔ MCP2OSC Server ↔ OSC Messages ↔ Creative Software
```

Capabilities demonstrated:
- NL OSC generation: "Generate an OSC address space for music player control" → 18 OSC address patterns
- Role-play prompts: "act as a granular synthesis expert" → contextually relevant address spaces
- Preset generation: "create a classic granular synth sound" → atomic OSC bundles
- Complex control: "Mute only the odd channels of a 100-channel system" → 50 OSC messages
- Pattern management, debugging, bidirectional testing via conversational queries
- Operates at soft real-time latency (hundreds of milliseconds)

Ableton Live has similar MCP integrations. OSC Automator (Max for Live) bridges OSC to TouchDesigner, Resolume, Unreal Engine. Synth Controller project: LLM control of JUCE synths via OSC.

---

## The Modular Ecosystem Analogy

### VCV Rack Plugin Architecture
- Standardized plugin API: shared objects exposing params/inputs/outputs/lights
- `params[...].getValue()`, `inputs[...].getVoltage()`, `outputs[...].setVoltage(voltage)`
- Cross-platform, extensible, expander modules via message passing
- **Not networked. No natural language interface.**

### Eurorack Hardware Standards
- CV: 1V/octave pitch, 5V gates, -5V to +10V general range
- Bus protocols: CV/gate on 16-pin power cable, patch cable override
- "Loose but functional" — core conventions widely adopted despite manufacturer variation
- **Reddit vision for "future Eurorack":** Ethernet hub where modules register APIs (inputs, outputs, parameters, functions) through standardized protocol, central hub manages routing. Mirrors this concept closely.

---

## What's Missing: The Gap This Concept Fills

### What Exists ✅
- Natural language → OSC parameter control (MCP2OSC)
- Single application LLM integration (Ableton, JUCE synths, SuperCollider)
- Modular plugin architectures (VCV Rack, Max/MSP externals)
- Networked music performance systems (laptop orchestras, SuperCopair, Collab-Hub)

### What's Novel ❌
- Natural language as universal bridge across **entire networked system** (not just single apps)
- Ecosystem of breakout apps/clients/interfaces all speaking the same language with modular synth-style extensibility
- **Agent-capable clients**: clients as autonomous agents, not just human UI layers
- Standardized extensibility protocol: OSC-style parameter control + NL interpretation + modular plugin architecture + network-first design
- **Documentation-driven discoverability**: clients can query the host for capabilities in natural language

---

## Why This Matters: The Architectural Innovation

Paradigm synthesis, not incremental improvement:

### 1. Natural Language as Lingua Franca
MCP2OSC translates NL to OSC. This vision positions NL as the **primary communication paradigm across the entire system**:
- Clients describe intentions in NL
- Host interprets and executes
- New clients don't need to learn OSC address spaces — query capabilities in NL
- System becomes self-documenting through conversational interaction

### 2. Modular Client Extensibility
Like VCV Rack plugins or Eurorack modules, anyone could create:
- Sequencers: "create a euclidean rhythm with 7 steps, 3 hits"
- Interfaces: touch screens, MIDI controllers, game controllers — all sending NL commands
- Wrappers: bridge existing tools (Ableton, TouchDesigner, game engines) to the system
- Agents: "when the kick hits, add more reverb"

Key difference: clients don't need hard-coded OSC addresses. They speak NL to the host, which interprets based on current synthesis engine configuration.

### 3. Agentic Participants
- AI agents that make musical decisions based on sonic analysis
- Reactive agents that respond to other agents' actions
- Learning agents that adapt to the installation's evolution
- Human-agent collaboration where both speak the same language

---

## Technical Architecture

### Host Layer
- Synthesis engine: SuperCollider / Pure Data / Max/MSP
- NL interpreter: LLM service (local or API)
- OSC server: backward compatibility
- MCP server: capability exposure via Model Context Protocol
- Capability registry: queryable via NL
- Time sync: forward-synchronous for tight ensemble coordination

### Client Protocol
- NL messages: primary interface
- OSC fallback: high-frequency CV-style data
- Query capabilities: "What synth types are available?"
- Session state: "What's currently playing?"

### Client Extensibility
- Plugin manifest: JSON/YAML describing capabilities (like VCV Rack plugin.json)
- Standardized connection protocol: LAN auto-discovery (like Ableton Link)
- Message format: human-readable, LLM-interpreted
- Reference implementations: sequencer, keyboard, controller wrapper

---

## Comparison Table

| System | NL Control | Modular Ecosystem | Networked | Agent-First |
|--------|-----------|-------------------|-----------|-------------|
| MCP2OSC | ✅ | ❌ | ❌ | ❌ |
| VCV Rack | ❌ | ✅ | ❌ | ❌ |
| Laptop Orchestras | ❌ | ❌ | ✅ | ❌ |
| Collab-Hub | ❌ | ❌ | ✅ | ❌ |
| **This concept** | **✅** | **✅** | **✅** | **✅** |

---

## Sources

1. MCP2OSC: Parametric Control by Natural Language — https://arxiv.org/pdf/2508.10414.pdf
2. Ableton Live MCP Server — https://mcps.sh/server/ableton-live-Simon-Kansara
3. Options for Controlling Ableton Live with MCP — https://www.mslinn.com/av_studio/555-ableton-mcp-options.html
4. Automating & Recording OSC with Ableton — https://www.youtube.com/watch?v=0SBs5TsHlxc
5. Synth Controller: Real-time LLM Control for JUCE Synths — https://mcpmarket.com/es/server/synth-controller
6. GPT Integration for Parameter Control in HISE — https://forum.hise.audio/topic/12999/exploring-gpt-integration-for-parameter-control-in-hise/5
7. VCV Rack Plugin Toolchain — https://github.com/VCVRack/rack-plugin-toolchain
8. VCV Rack Plugin Development Tutorial — https://vcvrack.com/manual/PluginDevelopmentTutorial
9. VCV Rack Custom Widgets — https://vcvrack.com/manual/PluginGuide
10. Eurorack CV & Gate — https://lenp.net/synth/eurorack-bus-cv-gate
11. Eurorack voltage standards — https://www.reddit.com/r/synthdiy/comments/8iex2l/eurorack_voltage_standards/
12. MPC Devices to Eurorack via CV & Gate — https://www.youtube.com/watch?v=0q6gwgKsGPc
13. Envisioning the Future of Eurorack — https://www.reddit.com/r/modular/comments/1ez79s0/envisioning_the_future_of_eurorack/
14. SuperCopair: Collaborative Live Coding on SuperCollider — https://iclc.toplap.org/2015/html/96.html
15. oscparse - Pure Data — https://pd.iem.sh/objects/oscparse/
16. Collaborative Performance with Node for Max — https://cycling74.com/articles/collaborative-performance-with-node-for-max
17. Carnegie Mellon Laptop Orchestra — http://www.cs.cmu.edu/~rbd/papers/icmc07laptop.pdf
18. Synchronizing a Networked Csound Laptop Ensemble — https://csoundjournal.com/issue21/synchronizing.html
19. Link synchronisation (TidalCycles) — https://userbase.tidalcycles.org/Link_synchronisation.html
20. Collab-Hub Max Package — https://cycling74.com/packages/collab-hub
21. Collab-Hub — https://www.collab-hub.io/max/
22. Open Sound Control (NYU) — https://itp.nyu.edu/networks/explanations/open-sound-control/
23. AbletonOSC — https://github.com/ideoforms/AbletonOSC
