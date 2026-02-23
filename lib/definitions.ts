export const definitions: Record<string, string> = {
  'modular synthesizers': 'Electronic instruments you build yourself by connecting modules with cables, where each module does one job. Independent function blocks (oscillation, filtering, modulation) with user-defined signal routing rather than hardwired paths.',

  'attenuator': 'A volume knob for signals without changing their character. Reduces signal amplitude (voltage level) without affecting frequency content or waveform shape.',

  'karlheinz stockhausen': 'German composer who pioneered shaping electronic sound as a sculptable material in the 1950s-60s. Worked at WDR Cologne developing serialism applied to electronic sound, spatial audio composition, and algorithmic techniques.',

  'daphne oram': 'British composer who built machines to turn drawings directly into sound. Co-founded BBC Radiophonic Workshop, then created Oramics—synthesizing sound from hand-drawn waveforms on film using photoelectric cells.',

  'oscillator': 'The basic tone generator in a synthesizer—it makes a repeating wave at a specific pitch. Circuit producing periodic waveforms (sine, triangle, sawtooth, square) at controllable frequencies.',

  'audio filter': 'Lets certain frequencies through while blocking others, like adjusting treble and bass but more precise. Frequency-selective circuit with types including low-pass, high-pass, band-pass, and notch. Resonance (Q) emphasizes frequencies near cutoff.',

  'envelope': 'The shape of a sound over time—how it attacks, holds, and fades away. Time-varying control signal structured as ADSR (Attack, Decay, Sustain, Release) defining amplitude or timbre contour.',

  'envelope filter': 'A filter that opens when you play louder and closes when you play softer, following your dynamics. Voltage-controlled filter where cutoff frequency tracks the input amplitude envelope, creating touch-sensitive timbral response.',

  'control voltage': 'A signal that tells other modules what to do instead of making sound itself. Analog voltage (typically 0-10V or ±5V) used to modulate parameters. Standard is one volt per octave for pitch control.',

  'wdr': 'West German Radio—their electronic music studio in Cologne became legendary for early synthesizer experiments. Studio für Elektronische Musik (founded 1951) where Stockhausen and others pioneered tape manipulation and oscillator bank composition.',

  'spectrogram': 'A visual map showing which frequencies are present in a sound over time. Three-dimensional representation where x-axis is time, y-axis is frequency, and color/brightness indicates amplitude at each point.',

  'amplitude': 'How loud or strong a signal is—the height of the wave. Signal magnitude measured in voltage (analog) or sample value (digital). Measured in dB or linear scale as peak deviation from zero.',

  'lan': 'A way to connect computers in the same room with cables so they talk directly to each other. Local Area Network using dedicated physical connections (typically ethernet) without routing through external networks.',

  'ethernet': 'The standard cable and connection type for wired networks. IEEE 802.3 protocol family using twisted-pair or fiber cables, defining physical and data link layers for packet transmission.',

  'switch': 'A box that intelligently routes network traffic between connected devices. OSI Layer 2 device forwarding ethernet frames using MAC address tables to route traffic only to destination ports.',

  'audio interface': 'The bridge between your computer and the analog audio world of microphones and speakers. Hardware providing ADC/DAC conversion with mic preamps and line I/O, connecting via USB, Thunderbolt, or PCIe.',

  'equalizer': 'Adjusts the balance of bass, midrange, and treble to shape how something sounds. Processor adjusting amplitude of frequency bands. Parametric EQs control center frequency, gain, and Q. Graphic EQs use fixed bands with faders.',
}
