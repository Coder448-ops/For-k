import { useEffect, useRef, useState } from 'react'
import './Intro.css'

/* ------------------------------------------------------------------
   Cinematic introduction.

   Sequence (CSS-timed, ~3s total, nothing blocks interaction):
   near-black → particles emerge (global canvas) → a silver light
   travels across → the metallic "K" is revealed → tagline → glass
   "Discover" button. A discreet "Skip intro" control is available
   from the start. Under prefers-reduced-motion every step resolves
   instantly to its final, fully visible state.
------------------------------------------------------------------ */

type IntroProps = {
  onDiscover: () => void
  leaving: boolean
  reducedMotion: boolean
}

export default function Intro({ onDiscover, leaving, reducedMotion }: IntroProps) {
  const [ready, setReady] = useState(false)
  // Controls only become clickable once they are actually visible —
  // no invisible buttons catching stray clicks.
  const [skipLive, setSkipLive] = useState(reducedMotion)
  const [ctaLive, setCtaLive] = useState(reducedMotion)
  const discoverRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setReady(true), 40),
      window.setTimeout(() => setSkipLive(true), reducedMotion ? 40 : 1150),
      window.setTimeout(() => setCtaLive(true), reducedMotion ? 40 : 2560),
    ]
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [reducedMotion])

  // Offer keyboard users the primary action once it exists on screen.
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(
      () => discoverRef.current?.focus({ preventScroll: true }),
      reducedMotion ? 60 : 2750,
    )
    return () => window.clearTimeout(t)
  }, [ready, reducedMotion])

  return (
    <section
      className={[
        'intro',
        ready ? 'intro--ready' : '',
        leaving ? 'intro--leaving' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Kirish"
    >
      <div className="intro__bg" aria-hidden="true">
        <div className="intro__halo" />
        <div className="intro__beam" />
      </div>

      <div className="intro__content">
        <div className="intro__monogram" aria-hidden="true">
          <span className="intro__k metal-ink">K</span>
          <span className="intro__k-glow">K</span>
        </div>

        <p className="intro__tagline">
          <span className="intro__line">
            <span className="intro__line-inner">Hamma narsani ham</span>
          </span>
          <span className="intro__line">
            <span className="intro__line-inner">tushuntirish shart emas.</span>
          </span>
        </p>

        <button
          ref={discoverRef}
          type="button"
          className={`intro__discover glass-btn ${ctaLive ? 'intro__discover--live' : ''}`}
          onClick={onDiscover}
          tabIndex={ctaLive ? 0 : -1}
        >
          <span className="glass-btn__sheen" aria-hidden="true" />
          <span className="glass-btn__label">Kashf etish</span>
        </button>
      </div>

      <button
        type="button"
        className={`intro__skip ${skipLive ? 'intro__skip--live' : ''}`}
        onClick={onDiscover}
        tabIndex={skipLive ? 0 : -1}
      >
        O’tkazib yuborish
        <span className="intro__skip-line" aria-hidden="true" />
      </button>
    </section>
  )
}
