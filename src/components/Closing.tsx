import type { CSSProperties } from 'react'
import { ArrowUp, RotateCcw } from 'lucide-react'
import { scrollToTop } from '../lib/motion'
import './Closing.css'

/* ------------------------------------------------------------------
   03 — Finale. A dark, quiet close: fading silver motes, the two
   parting lines, and a small metallic K emblem that slowly breathes
   toward darkness. Both footer controls are real: one replays the
   cinematic opening, one returns to the top.
------------------------------------------------------------------ */

type ClosingProps = {
  onReplay: () => void
  reducedMotion: boolean
}

// Deterministic mote field (no hydration roulette, no JS needed to look right)
const MOTES = [
  { left: 8, delay: 0, dur: 13, size: 2.5, drift: 14 },
  { left: 16, delay: 3.2, dur: 16, size: 1.8, drift: -18 },
  { left: 24, delay: 6.5, dur: 12, size: 2.2, drift: 10 },
  { left: 31, delay: 1.8, dur: 17, size: 1.5, drift: -12 },
  { left: 39, delay: 8.1, dur: 14, size: 2.8, drift: 16 },
  { left: 47, delay: 4.4, dur: 18, size: 1.7, drift: -10 },
  { left: 55, delay: 0.9, dur: 13.5, size: 2.3, drift: 12 },
  { left: 62, delay: 7.2, dur: 16.5, size: 1.6, drift: -16 },
  { left: 70, delay: 2.6, dur: 15, size: 2.6, drift: 10 },
  { left: 78, delay: 9.0, dur: 12.5, size: 1.9, drift: -14 },
  { left: 85, delay: 5.3, dur: 17.5, size: 2.2, drift: 18 },
  { left: 92, delay: 3.9, dur: 14.5, size: 1.5, drift: -8 },
] as const

export default function Closing({ onReplay, reducedMotion }: ClosingProps) {
  return (
    <footer className="closing section" id="closing" aria-labelledby="closing-title">
      <div className="closing__motes" aria-hidden="true">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="closing__mote"
            style={
              {
                left: `${m.left}%`,
                width: `${m.size}px`,
                height: `${m.size}px`,
                '--drift': `${m.drift}px`,
                animationDelay: `${m.delay}s`,
                animationDuration: `${m.dur}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="closing__fade" aria-hidden="true" />

      <div className="shell closing__layout">
        <p className="eyebrow reveal" data-reveal>03 — Yakun</p>

        <h2
          className="closing__title reveal"
          data-reveal
          id="closing-title"
          style={{ '--reveal-delay': '100ms' } as CSSProperties}
        >
          Ba’zi syurprizlarni izohlashdan ko’ra <em>kashf etish</em> yaxshiroq.
        </h2>

        <p
          className="closing__smile reveal"
          data-reveal
          style={{ '--reveal-delay': '220ms' } as CSSProperties}
        >
          Umid qilamanki, bu kichik tajriba yuzingga tabassum olib keldi.
        </p>

        <div
          className="closing__emblem reveal"
          data-reveal
          style={{ '--reveal-delay': '320ms' } as CSSProperties}
          aria-hidden="true"
        >
          <span className="closing__emblem-ring" />
          <span className="closing__emblem-k metal-ink">K</span>
        </div>

        <hr className="hairline closing__rule reveal" data-reveal />

        <div className="closing__controls reveal" data-reveal>
          <button type="button" className="ghost-btn" onClick={onReplay}>
            <RotateCcw size={15} strokeWidth={1.5} aria-hidden="true" />
            <span>Boshlanishni qayta ko’rish</span>
          </button>

          <button
            type="button"
            className="ghost-btn"
            onClick={() => scrollToTop(reducedMotion)}
          >
            <ArrowUp size={15} strokeWidth={1.5} aria-hidden="true" />
            <span>Yuqoriga</span>
          </button>
        </div>

        <p className="closing__note reveal" data-reveal>
          KUMUSH — kumush tajriba · Kuzatuvsiz, ma’lumotsiz. Faqat kumush.
        </p>
      </div>
    </footer>
  )
}
