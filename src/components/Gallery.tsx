import { useId, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { Plus } from 'lucide-react'
import './Gallery.css'

/* ------------------------------------------------------------------
   02 — The Gallery. Three interactive studies in silver:
   a metallic sphere, a glass prism, a particle constellation.

   Each card tilts under the pointer (fine pointers only), carries a
   travelling silver highlight, and opens on click / tap / Enter to
   reveal one neutral sentence. Nothing depends on hover.
------------------------------------------------------------------ */

type GalleryProps = {
  reducedMotion: boolean
  finePointer: boolean
}

/* ---------------- visuals ---------------- */

function MetallicSphere() {
  return (
    <span className="vis vis--sphere" aria-hidden="true">
      <span className="vis-sphere__ball">
        <span className="vis-sphere__spec" />
      </span>
      <span className="vis-sphere__shadow" />
    </span>
  )
}

function GlassPrism() {
  return (
    <svg className="vis vis--prism" viewBox="0 0 220 150" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="prismGlass" x1="70" y1="30" x2="150" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f5f6f7" stopOpacity="0.34" />
          <stop offset="0.45" stopColor="#aeb5bf" stopOpacity="0.14" />
          <stop offset="0.75" stopColor="#d9dde3" stopOpacity="0.24" />
          <stop offset="1" stopColor="#858b95" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="beamIn" x1="0" y1="0" x2="96" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d9dde3" stopOpacity="0" />
          <stop offset="1" stopColor="#f5f6f7" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="beamOut1" x1="120" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f5f6f7" stopOpacity="0.8" />
          <stop offset="1" stopColor="#f5f6f7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beamOut2" x1="120" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c8cfd9" stopOpacity="0.65" />
          <stop offset="1" stopColor="#c8cfd9" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beamOut3" x1="120" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9aa2ae" stopOpacity="0.5" />
          <stop offset="1" stopColor="#9aa2ae" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* incident beam */}
      <rect x="0" y="66.2" width="96" height="1.6" fill="url(#beamIn)" className="prism-beam-in" />

      {/* refracted beams */}
      <g className="prism-beams">
        <path d="M118 67 L220 44" stroke="url(#beamOut1)" strokeWidth="1.5" />
        <path d="M118 67 L220 67" stroke="url(#beamOut2)" strokeWidth="1.2" />
        <path d="M118 67 L220 90" stroke="url(#beamOut3)" strokeWidth="1" />
      </g>

      {/* refraction point */}
      <circle cx="118" cy="67" r="6" fill="#f5f6f7" opacity="0.14" className="prism-flare" />
      <circle cx="118" cy="67" r="1.7" fill="#f5f6f7" opacity="0.9" />

      {/* the prism */}
      <path
        d="M108 22 L152 122 L64 122 Z"
        fill="url(#prismGlass)"
        stroke="#d9dde3"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <path d="M108 22 L108 122" stroke="#f5f6f7" strokeOpacity="0.18" strokeWidth="0.8" />
      <path d="M108 22 L152 122" stroke="#f5f6f7" strokeOpacity="0.3" strokeWidth="0.8" />

      {/* floor line */}
      <rect x="34" y="122.5" width="152" height="0.8" fill="#d9dde3" opacity="0.16" />
    </svg>
  )
}

function Constellation() {
  const stars: Array<[number, number, number]> = [
    [24, 38, 1.6],
    [52, 20, 1.1],
    [74, 52, 2.1],
    [40, 76, 1.3],
    [96, 26, 1.5],
    [118, 62, 2.4],
    [140, 30, 1.2],
    [164, 54, 1.8],
    [186, 26, 1.1],
    [152, 92, 1.4],
    [100, 104, 1.9],
    [62, 112, 1.2],
    [190, 96, 1.5],
    [16, 92, 1.1],
  ]
  const links: Array<[number, number]> = [
    [0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [4, 5], [5, 2],
    [4, 6], [6, 7], [7, 5], [6, 8], [7, 9], [9, 10], [10, 5],
    [3, 11], [11, 10], [9, 12], [3, 13], [13, 0],
  ]
  return (
    <svg className="vis vis--constellation" viewBox="0 0 210 132" fill="none" aria-hidden="true">
      <g stroke="#d9dde3" strokeOpacity="0.22" strokeWidth="0.7">
        {links.map(([a, b], i) => (
          <line key={i} x1={stars[a][0]} y1={stars[a][1]} x2={stars[b][0]} y2={stars[b][1]} />
        ))}
      </g>
      {stars.map(([x, y, r], i) => (
        <g key={i} className={`cstar cstar--${i % 5}`}>
          <circle cx={x} cy={y} r={r * 3.1} fill="#aeb5bf" opacity="0.1" />
          <circle cx={x} cy={y} r={r} fill="#f0f2f5" />
        </g>
      ))}
    </svg>
  )
}

/* ---------------- card ---------------- */

type CardProps = {
  index: string
  title: string
  message: string
  visual: ReactNode
  delay: number
  reducedMotion: boolean
  finePointer: boolean
}

function GalleryCard({ index, title, message, visual, delay, reducedMotion, finePointer }: CardProps) {
  const uid = useId().replace(/:/g, '')
  const panelId = `gcard-panel-${uid}`
  const titleId = `gcard-title-${uid}`
  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion || !finePointer) return
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    card.style.setProperty('--rx', (ny * -5).toFixed(2))
    card.style.setProperty('--ry', (nx * 6.5).toFixed(2))
    card.style.setProperty('--mx', `${(nx + 0.5) * 100}%`)
    card.style.setProperty('--my', `${(ny + 0.5) * 100}%`)
  }

  const onPointerLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--rx', '0')
    card.style.setProperty('--ry', '0')
    card.style.setProperty('--mx', '50%')
    card.style.setProperty('--my', '40%')
  }

  return (
    <div className="gcard-cell reveal" data-reveal style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}>
      <div
        className={`gcard ${open ? 'gcard--open' : ''}`}
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <span className="gcard__spot" aria-hidden="true" />

        <button
          type="button"
          className="gcard__btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="gcard__visual">{visual}</span>
          <span className="gcard__head">
            <span className="gcard__index" aria-hidden="true">{index}</span>
            <span className="gcard__title" id={titleId}>{title}</span>
            <span className="gcard__toggle" aria-hidden="true">
              <Plus size={15} strokeWidth={1.4} />
            </span>
          </span>
        </button>

        <div className="gcard__panel" id={panelId} role="region" aria-labelledby={titleId}>
          <div className="gcard__panel-inner">
            <p className="gcard__panel-text">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- section ---------------- */

export default function Gallery({ reducedMotion, finePointer }: GalleryProps) {
  const cards = [
    {
      index: 'I',
      title: 'Perspective',
      message: 'Sometimes, a different view changes everything.',
      visual: <MetallicSphere />,
    },
    {
      index: 'II',
      title: 'Possibility',
      message: 'There is always something new to discover.',
      visual: <GlassPrism />,
    },
    {
      index: 'III',
      title: 'A Little Wonder',
      message: 'Small details can make an experience memorable.',
      visual: <Constellation />,
    },
  ]

  return (
    <section className="gallery section" id="gallery" aria-labelledby="gallery-title">
      <div className="gallery__ambient" aria-hidden="true" />

      <div className="shell">
        <header className="gallery__header">
          <p className="eyebrow reveal" data-reveal>02 — The Gallery</p>
          <h2 className="reveal" data-reveal id="gallery-title" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
            Three small studies in silver.
          </h2>
          <p className="lede reveal" data-reveal style={{ '--reveal-delay': '160ms' } as CSSProperties}>
            Each study keeps one quiet sentence. Open them at your own pace —
            they will wait.
          </p>
        </header>

        <div className="gallery__grid">
          {cards.map((card, i) => (
            <GalleryCard
              key={card.title}
              index={card.index}
              title={card.title}
              message={card.message}
              visual={card.visual}
              delay={i * 120}
              reducedMotion={reducedMotion}
              finePointer={finePointer}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
