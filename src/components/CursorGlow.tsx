import { useEffect, useRef } from 'react'
import './CursorGlow.css'

/* ------------------------------------------------------------------
   A faint silver aura trailing the cursor — rendered only for fine
   pointers with motion allowed. Purely atmospheric, never blocks
   interaction.
------------------------------------------------------------------ */

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef(0)
  const pos = useRef({ x: -500, y: -500 })
  const target = useRef({ x: -500, y: -500 })

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const loop = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.11
      pos.current.y += (target.current.y - pos.current.y) * 0.11
      glow.style.transform = `translate3d(${pos.current.x - 210}px, ${
        pos.current.y - 210
      }px, 0)`
      rafRef.current = requestAnimationFrame(loop)
    }

    const onMove = (event: PointerEvent) => {
      target.current = { x: event.clientX, y: event.clientY }
      glow.classList.add('cursor-glow--visible')
    }

    const onLeave = () => glow.classList.remove('cursor-glow--visible')

    rafRef.current = requestAnimationFrame(loop)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <div className="cursor-glow" ref={glowRef} aria-hidden="true" />
}
