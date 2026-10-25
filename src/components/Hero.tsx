import { useEffect, useRef } from 'react'
import SilverRing from './SilverRing'
import './Hero.css'

/* ------------------------------------------------------------------
   Full-screen hero. "For Kumush." rises line-by-line behind the
   rotating silver ring, with a sheen travelling across the name and
   a restrained pointer parallax (fine pointers, motion allowed).
------------------------------------------------------------------ */

type HeroProps = {
  reducedMotion: boolean
  finePointer: boolean
}

export default function Hero({ reducedMotion, finePointer }: HeroProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef(0)
  const targetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (reducedMotion || !finePointer) return
    const stage = stageRef.current
    if (!stage) return

    let currentX = 0
    let currentY = 0

    const apply = () => {
      currentX += (targetRef.current.x - currentX) * 0.06
      currentY += (targetRef.current.y - currentY) * 0.06
      stage.style.setProperty('--parallax-x', currentX.toFixed(4))
      stage.style.setProperty('--parallax-y', currentY.toFixed(4))
      rafRef.current = requestAnimationFrame(apply)
    }

    const onMove = (event: PointerEvent) => {
      targetRef.current.x = event.clientX / window.innerWidth - 0.5
      targetRef.current.y = event.clientY / window.innerHeight - 0.5
    }

    rafRef.current = requestAnimationFrame(apply)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reducedMotion, finePointer])

  return (
    <section className="hero section" id="top" aria-labelledby="hero-title">
      <div className="hero__ambient" aria-hidden="true">
        <span className="hero__light hero__light--top" />
        <span className="hero__light hero__light--bottom" />
      </div>

      <div className="hero__stage shell" ref={stageRef}>
        <div className="hero__ring" aria-hidden="true">
          <SilverRing />
        </div>

        <div className="hero__copy">
          <h1 className="hero__title" id="hero-title">
            <span className="hero__line hero__line--for">
              <span className="hero__line-inner">Faqat</span>
            </span>
            <span className="hero__line hero__line--name">
              <span className="hero__line-inner">
                <span className="hero__name metal-ink">Kumushga</span>
                <span className="hero__dot metal-ink">.</span>
              </span>
            </span>
          </h1>

          <span className="hero__rule" aria-hidden="true" />

          <p className="hero__subtitle">Sen uchun yaratilgan kichik syurpriz.</p>
        </div>
      </div>

      <a className="hero__scroll" href="#object" aria-label="Pastga — keyingi bo’limga o’tish">
        <span className="hero__scroll-label label">Pastga</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>
    </section>
  )
}
