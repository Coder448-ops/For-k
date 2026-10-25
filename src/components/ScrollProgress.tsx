import { useEffect, useRef } from 'react'
import './ScrollProgress.css'

/* Hairline silver scroll-progress indicator along the top edge. */

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const update = () => {
      rafRef.current = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      bar.style.transform = `scaleX(${p.toFixed(4)})`
    }

    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="scroll-progress" role="presentation" aria-hidden="true">
      <div className="scroll-progress__bar" ref={barRef} />
    </div>
  )
}
