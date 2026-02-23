# Vision Notes — Working Memory
> Raw voice notes, unedited. Source material for the draft.

---

## The Core Premise

A DAW rebuilt from first principles — not modified, rebuilt — with agents as the primary interface.

The question: what would a digital audio workstation look like if you designed it today, knowing agents exist?

---

## The Freedom Angle

Age of personalized software. When you have an agent that understands your context and can build tools for you — you're no longer constrained by the design decisions of existing software.

Freedom to:
- Build your own tools
- Co-play and co-produce with agents
- Participate in the system, not just use it

The expression: a workshop. Not just a manifesto. A place where you do the thing.

---

## The Primitives (stay exactly the same)

Nothing is reinvented. The mental models are intact:
- Oscillators
- Filters, EQ (parametric)
- Channels, buses, mix
- Effects chains (insert, send/return)
- Input / output
- Utility functions, math, control
- **CV as metaphor:** -1 to +1 normalized range. Clamp, interpolate, extend. Gates (on/off). Signal as a number.

The interface changes. The underlying physics doesn't.

---

## The Daphne Oram Reference

She described (in writing/lecture — find exact source) a series of frequencies — ~15 oscillators all pitched differently — to demonstrate how some cancel each other out. Psychoacoustics, beating frequencies, interference patterns.

Making this in Max/MSP:
1. Open Max
2. Place an amplitude object, mark it up
3. Create each oscillator object manually
4. Set each frequency by clicking and typing
5. Connect each one
6. Route to output

This took a long time. The creative intention — hear cancellation at 15 different frequencies — took zero time to form. The execution took 20 minutes.

**The contrast:**

With this system: "place 12 oscillators stepped from 12 Hz to 1000 Hz, increment by 100 Hz per step" → agent does it. Connects them. Routes to bus. Sound out.

Then: "add a spectrogram so I can see the frequencies in real time" → agent builds the visualizer, connects it.

Then: "add amplitude control per channel" → 12 mixers appear, each plugged in.

Then: "add a filter and sweep it with an LFO so I can hear the full frequency range" → done.

You described the sound. You never managed a single connection.

---

## The Hidden Infrastructure

Sound drivers, audio config, channel count, sample rate, buffer size, latency compensation — all invisible. You start from a fresh place and describe.

"I don't really care about sound drivers and audio quality and setup and config and how many channels do I have to work with. I can just start from a fresh place and start describing things."

---

## The LAN Party / Modular Synth / DAW Triangle

Three reference points that don't usually overlap:
- **LAN party:** collaborative, networked, everyone brings their machine, shared session
- **Modular synth:** signal-based, composable, patch cables as connections, no menus
- **DAW:** structured, tracked, timeline, mix, produce

This system lives at the intersection. Network-first. Signal-primitive. Agent-controlled.

---

## Workshop Format

Not just a manifesto — a workshop series. You participate, you build something, you leave with a working system. The documentation is alive, it plays sound, it responds.

---

## Prose TODOs
- Find exact Daphne Oram reference (oscillator series / frequency cancellation)
- Find Max/MSP screenshot or GIF of building something simple the hard way
- Articulate the "before/after" clearly
- Write the workshop invitation
