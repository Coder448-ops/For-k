import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './GiftObject.css'

/* ------------------------------------------------------------------
   01 — The Object.

   A floating silver medallion: a sealed shell of two metallic halves
   engraved with a split "K". Activating it (click, tap, Enter/Space —
   the whole stage is a real <button>) spins the shell gently, sends a
   thin silver light across its surface, swings the halves open and
   lifts a glass message panel out of the interior. Activating again
   folds everything silently shut.
------------------------------------------------------------------ */

type GiftObjectProps = {
  reducedMotion: boolean
  finePointer: boolean
}

export default function GiftObject({ reducedMotion, finePointer }: GiftObjectProps) {
  const [open, setOpen] = useState(false)
  const [sweepKey, setSweepKey] = useState(0)
  const tiltRef = useRef<HTMLSpanElement | null>(null)
  const rafRef = useRef(0)
  const targetRef = useRef({ x: 0, y: 0 })

  const toggle = useCallback(() => {
    if (!open) setSweepKey((k) => k + 1) // one light sweep per opening
    setOpen(!open)
  }, [open])

  // Restrained 3D tilt following the pointer (desktop only).
  useEffect(() => {
    if (reducedMotion || !finePointer) return
    const tilt = tiltRef.current
    if (!tilt) return

    let cx = 0
    let cy = 0
    const apply = () => {
      cx += (targetRef.current.x - cx) * 0.08
      cy += (targetRef.current.y - cy) * 0.08
      tilt.style.setProperty('--tilt-x', (cx * 7).toFixed(3))
      tilt.style.setProperty('--tilt-y', (cy * -9).toFixed(3))
      rafRef.current = requestAnimationFrame(apply)
    }

    const onMove = (event: PointerEvent) => {
      const rect = tilt.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      targetRef.current = {
        x: Math.max(-0.6, Math.min(0.6, nx)),
        y: Math.max(-0.6, Math.min(0.6, ny)),
      }
    }

    const onLeave = () => {
      targetRef.current = { x: 0, y: 0 }
    }

    // Track across the whole scene (relic + breathing room), not just the disc
    const node = tilt.parentElement?.parentElement ?? tilt.parentElement ?? tilt
    rafRef.current = requestAnimationFrame(apply)
    node.addEventListener('pointermove', onMove, { passive: true })
    node.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      cancelAnimationFrame(rafRef.current)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
    }
  }, [reducedMotion, finePointer])

  return (
    <section className="object section" id="object" aria-labelledby="object-title">
      <div className="object__ambient" aria-hidden="true" />

      <div className="shell object__layout">
        <header className="object__header">
          <p className="eyebrow reveal" data-reveal>01 — The Object</p>
          <h2 className="reveal" data-reveal id="object-title" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
            Something waits quietly inside.
          </h2>
          <p className="lede reveal" data-reveal style={{ '--reveal-delay': '160ms' } as CSSProperties}>
            A sealed piece of silver, hovering in the dark. It is not locked —
            only closed.
          </p>
        </header>

        <div className="object__stage-wrap reveal" data-reveal style={{ '--reveal-delay': '120ms' } as CSSProperties}>
          <button
            type="button"
            className={`relic-trigger ${open ? 'relic-trigger--open' : ''}`}
            onClick={toggle}
            aria-expanded={open}
            aria-controls="relic-message"
            aria-label="The silver relic"
          >
            <span className="relic-scene">
              <span className="relic-float">
                <span className="relic" ref={tiltRef}>
                  <span className="relic__glow" aria-hidden="true" />

                  {/* Hidden message — emerges from inside the shell */}
                  <span className="relic__inner" id="relic-message" role="group" aria-label="Message inside the relic">
                    <span className="relic__inner-glass">
                      <span className="relic__message-title metal-ink">You made it here. ✨</span>
                      <span className="relic__message-text">
                        Sometimes, a small surprise is enough to make an ordinary
                        day a little more interesting.
                      </span>
                    </span>
                  </span>

                  {/* Metallic shell */}
                  <span className="relic__shell" aria-hidden="true">
                    <span className="relic__rim" />
                    <span className="relic__half relic__half--left">
                      <span className="relic__engrave">K</span>
                    </span>
                    <span className="relic__half relic__half--right">
                      <span className="relic__engrave">K</span>
                    </span>
                    <span className="relic__seam" />
                    {!reducedMotion && <span className="relic__sweep" key={sweepKey} />}
                  </span>

                  <span className="relic__orbit" aria-hidden="true">
                    <span className="relic__orbit-ring" />
                  </span>
                </span>
              </span>
              <span className="relic__reflection" aria-hidden="true" />
            </span>

            <span className="relic-hint" aria-hidden="true">
              <span className="relic-hint__text">
                {open ? 'Click or tap to close' : 'Click, tap, or press Enter to open'}
              </span>
              <span className="relic-hint__pulse" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
