import { useCallback, useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------
   Procedural ambient sound design — generated live with the Web Audio
   API, so there is no audio file to load, licence, or break.

   A quiet "silver pad": softly detuned sine voices in A-minor spacing
   drifting through a lowpass filter, with very slow amplitude LFOs and
   a faint filtered-noise shimmer, like light moving on metal.

   Rules honoured here:
   - never autoplays (the AudioContext is created on the first explicit
     user gesture only),
   - start/stop are fully reversible,
   - unsupported environments simply report `supported: false` so the
     control can be hidden instead of faking behaviour.
------------------------------------------------------------------ */

type Voice = {
  osc: OscillatorNode
  gain: GainNode
  lfo: OscillatorNode
  lfoGain: GainNode
  panner?: StereoPannerNode
}

type Engine = {
  ctx: AudioContext
  master: GainNode
  voices: Voice[]
  shimmerSource: AudioBufferSourceNode
  shimmerGain: GainNode
}

const VOICE_DEFS: Array<{
  freq: number
  gain: number
  lfoFreq: number
  lfoDepth: number
  pan: number
}> = [
  { freq: 110.0, gain: 0.085, lfoFreq: 0.045, lfoDepth: 0.05, pan: -0.45 },
  { freq: 164.81, gain: 0.06, lfoFreq: 0.06, lfoDepth: 0.04, pan: 0.4 },
  { freq: 220.0, gain: 0.055, lfoFreq: 0.038, lfoDepth: 0.045, pan: -0.15 },
  { freq: 329.63, gain: 0.03, lfoFreq: 0.07, lfoDepth: 0.024, pan: 0.55 },
  { freq: 440.0, gain: 0.02, lfoFreq: 0.052, lfoDepth: 0.016, pan: -0.6 },
]

export function isAudioSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
  )
}

export function useAmbientSound() {
  const [supported] = useState(isAudioSupported)
  const [playing, setPlaying] = useState(false)
  const engineRef = useRef<Engine | null>(null)

  const stop = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return
    const { ctx, master, voices, shimmerSource, shimmerGain } = engine
    const now = ctx.currentTime
    try {
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now)
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
    } catch {
      /* engine already torn down */
    }
    window.setTimeout(() => {
      voices.forEach(({ osc, lfo }) => {
        try {
          osc.stop()
          lfo.stop()
        } catch {
          /* already stopped */
        }
      })
      try {
        shimmerSource.stop()
      } catch {
        /* already stopped */
      }
      shimmerGain.disconnect()
      master.disconnect()
      void ctx.close()
      engineRef.current = null
    }, 1600)
    setPlaying(false)
  }, [])

  const start = useCallback(() => {
    if (!supported || engineRef.current) return
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    let ctx: AudioContext
    try {
      ctx = new Ctor()
    } catch {
      return
    }

    const master = ctx.createGain()
    master.gain.value = 0.0001

    // Warmth: gentle lowpass + soft knee compression, then out.
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 900
    tone.Q.value = 0.4

    let tail: AudioNode = tone
    if (typeof ctx.createDynamicsCompressor === 'function') {
      const comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -24
      comp.knee.value = 24
      comp.ratio.value = 8
      comp.attack.value = 0.4
      comp.release.value = 0.8
      tone.connect(comp)
      tail = comp
    }
    tail.connect(master)
    master.connect(ctx.destination)

    const voices: Voice[] = VOICE_DEFS.map((def) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = def.freq
      osc.detune.value = (Math.random() - 0.5) * 8

      const gain = ctx.createGain()
      gain.gain.value = def.gain

      const lfo = ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = def.lfoFreq
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = def.lfoDepth
      lfo.connect(lfoGain)
      lfoGain.connect(gain.gain)

      let node: AudioNode = gain
      let panner: StereoPannerNode | undefined
      if (typeof ctx.createStereoPanner === 'function') {
        panner = ctx.createStereoPanner()
        panner.pan.value = def.pan
        gain.connect(panner)
        node = panner
      }
      node.connect(tone)

      osc.start()
      lfo.start()
      return { osc, gain, lfo, lfoGain, panner }
    })

    // Faint "shimmer": looping filtered noise, very quiet, slowly breathing.
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.4
    }
    const shimmerSource = ctx.createBufferSource()
    shimmerSource.buffer = noiseBuffer
    shimmerSource.loop = true
    const shimmerFilter = ctx.createBiquadFilter()
    shimmerFilter.type = 'bandpass'
    shimmerFilter.frequency.value = 5200
    shimmerFilter.Q.value = 1.6
    const shimmerGain = ctx.createGain()
    shimmerGain.gain.value = 0.012
    const shimmerLfo = ctx.createOscillator()
    shimmerLfo.type = 'sine'
    shimmerLfo.frequency.value = 0.03
    const shimmerLfoGain = ctx.createGain()
    shimmerLfoGain.gain.value = 0.008
    shimmerLfo.connect(shimmerLfoGain)
    shimmerLfoGain.connect(shimmerGain.gain)
    shimmerSource.connect(shimmerFilter)
    shimmerFilter.connect(shimmerGain)
    shimmerGain.connect(tone)
    shimmerSource.start()
    shimmerLfo.start()

    const now = ctx.currentTime
    master.gain.setValueAtTime(0.0001, now)
    master.gain.exponentialRampToValueAtTime(0.75, now + 3.2)

    void ctx.resume?.()
    engineRef.current = { ctx, master, voices, shimmerSource, shimmerGain }
    setPlaying(true)
  }, [supported])

  const toggle = useCallback(() => {
    if (playing) stop()
    else start()
  }, [playing, start, stop])

  useEffect(() => {
    return () => {
      const engine = engineRef.current
      if (!engine) return
      try {
        engine.voices.forEach(({ osc, lfo }) => {
          osc.stop()
          lfo.stop()
        })
        engine.shimmerSource.stop()
        void engine.ctx.close()
      } catch {
        /* noop */
      }
      engineRef.current = null
    }
  }, [])

  return { supported, playing, toggle }
}
