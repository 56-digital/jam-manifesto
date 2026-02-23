# Workshop Vision — Installation Notes
> Raw from voice. Do not edit yet. Timur sending short-form notes to follow.

---

## The Physical Setup

- One host machine — the master node
- Connected to a server rack (the engine)
- Ethernet bus connecting everything
- 24-port Ethernet switch (24 participants max)
- EQ → speakers → room
- Audio interface connecting computer to speaker system
- Every device (laptop, phone, tablet) plugged in as its own controller

## What Each Participant Has

- Their own connection to the shared system
- Full access to all primitives (oscillators, filters, effects, CV, gates, buses)
- Natural language / voice as their instrument
- Freedom to:
  - Spawn their own visualizer, route audio into it
  - Build a mini controller program
  - Plug in hardware devices (MIDI, sensors)
  - Create a sampler, granulator, looper, whatever they want
  - Share tools they build with other participants

## The Collective Experience

Everyone is:
- Co-creating in real time
- Building their tools
- Shaping the sound
- Hearing the result change live
- Crafting performance AND infrastructure simultaneously
- On the same network, same environment, same engine

## The Metaphor

LAN party × modular synth jam × DAW session. But with agents as the creative partner for each person.

The "instrument" is the whole system. Each person's creativity is the only constraint.

## Architecture Diagram (to build)

```
[HOST MACHINE / MASTER NODE]
        |
   [SERVER RACK]
        |
   [24-port Ethernet Switch]
        |
   ┌────┴────────────────────────┐
   |    |    |    |    |    |   ...
  [P1] [P2] [P3] [P4] [P5] [P6]  × 24
 laptop phone tablet laptop ...

Each P:
- NL/voice input
- Agent layer (Claude / local LLM)
- Can spawn: visualizer, controller, sampler, etc.
- Plugged into shared audio bus
- Shared state via MCP capability registry

Audio out:
[Engine] → [EQ] → [Speakers] → [Room]
```

## Key Framing

"Everyone's connected into this monolith as their own controller."

The monolith is the engine. The controllers are people. The instruments are programs they build in real time.

This is not a performance where someone plays for an audience. Everyone IS the performance.

---

## Waiting on: Timur's short-form workshop notes
