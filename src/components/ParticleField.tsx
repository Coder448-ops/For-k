import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import './ParticleField.css'

/* ------------------------------------------------------------------
   Drifting silver particles in projected 3D space.

   One lightweight 2D canvas; depth (z) drives size, brightness and
   speed so the field reads as three-dimensional without WebGL.
   The renderer:
   - caps devicePixelRatio at 2,
   - scales particle count to viewport area and device capability,
   - pauses when the tab is hidden,
   - stops drawing entirely when `active` is false,
   - draws a single static frame in reduced-motion mode,
   - adds a restrained pointer parallax on fine-pointer devices only.
------------------------------------------------------------------ */

type ParticleFieldProps = {
  /** Master intensity 0..1 — App fades this in as the intro unfolds. */
  intensity: number
  reducedMotion: boolean
  className?: string
  style?: CSSProperties
}

type Particle = {
  x: number
  y: number
  z: number // 0 (far) .. 1 (near)
  r: number
  vx: number
  vy: number
  vz: number
  twinkle: number
  twinkleSpeed: number
}

const isWebkit =
  typeof navigator !== 'undefined' &&
  /iP(hone|ad|od)|Macintosh/.test(navigator.userAgent) &&
  'ontouchend' in document

export default function ParticleField({
  intensity,
  reducedMotion,
  className,
  style,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const intensityRef = useRef(intensity)
  const reducedRef = useRef(reducedMotion)

  intensityRef.current = intensity
  reducedRef.current = reducedMotion

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let strength = 0
    let particles: Particle[] = []
    let frame = 0
    let running = false
    let staticDrawn = false
    let visible = true
    let tabVisible = true

    // Pointer parallax (fine pointers only)
    let targetPX = 0
    let targetPY = 0
    let px = 0
    let py = 0
    const finePointer =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches

    const preferredCount = () => {
      const area = width * height
      const coarse =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(pointer: coarse)').matches
      const lowPower = coarse || isWebkit || (navigator.hardwareConcurrency ?? 8) <= 4
      let count = Math.round(area / (lowPower ? 26000 : 13000))
      count = Math.max(36, Math.min(lowPower ? 90 : 190, count))
      return count
    }

    const spawn = (): Particle => {
      const z = Math.random()
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        r: 0.35 + z * 1.35,
        vx: (Math.random() - 0.5) * (0.06 + z * 0.16),
        vy: -(0.04 + Math.random() * (0.08 + z * 0.2)),
        vz: (Math.random() - 0.5) * 0.0009,
        twinkle: Math.random(),
        twinkleSpeed: 0.004 + Math.random() * 0.014,
      }
    }

    const seed = () => {
      const count = preferredCount()
      particles = Array.from({ length: count }, () => spawn())
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      staticDrawn = false
      drawStaticIfNeeded()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      // Smoothly ease toward the requested intensity
      strength += (intensityRef.current - strength) * 0.035
      if (strength <= 0.004) return

      // Ease parallax toward the target
      px += (targetPX - px) * 0.045
      py += (targetPY - py) * 0.045

      for (const p of particles) {
        if (!reducedRef.current) {
          p.x += p.vx
          p.y += p.vy
          p.z += p.vz
          p.twinkle += p.twinkleSpeed
          if (p.z < 0.03 || p.z > 1) p.vz *= -1
          if (p.x < -14) p.x = width + 10
          else if (p.x > width + 14) p.x = -10
          if (p.y < -14) {
            p.y = height + 8
            p.x = Math.random() * width
          } else if (p.y > height + 14) p.y = -8
        }

        const depthX = (p.x - width / 2) * (0.012 + p.z * 0.03)
        const depthY = (p.y - height / 2) * (0.012 + p.z * 0.03)
        const dx = p.x + px * depthX * 14
        const dy = p.y + py * depthY * 14

        const twinkle = 0.55 + 0.45 * Math.sin(p.twinkle * Math.PI * 2)
        const alpha = (0.06 + p.z * 0.4) * twinkle * strength
        if (alpha <= 0.003) continue
        const radius = Math.max(0.25, p.r * (0.6 + p.z * 0.7))

        ctx.beginPath()
        ctx.arc(dx, dy, radius, 0, Math.PI * 2)
        const bright = 200 + Math.round(p.z * 45)
        ctx.fillStyle = `rgba(${bright}, ${bright + 5}, ${Math.min(bright + 12, 255)}, ${alpha.toFixed(3)})`
        ctx.fill()

        // The nearest particles get a faint halo
        if (p.z > 0.82 && alpha > 0.12) {
          ctx.beginPath()
          ctx.arc(dx, dy, radius * 3.4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(217, 221, 227, ${(alpha * 0.06).toFixed(3)})`
          ctx.fill()
        }
      }
    }

    const drawStaticIfNeeded = () => {
      if (reducedRef.current && !staticDrawn && intensityRef.current > 0.5) {
        strength = intensityRef.current
        draw()
        staticDrawn = true
      }
    }

    const loop = () => {
      if (!running) return
      if (visible && tabVisible) {
        if (reducedRef.current) {
          drawStaticIfNeeded()
        } else {
          draw()
          staticDrawn = false
        }
      }
      frame = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running) return
      running = true
      frame = requestAnimationFrame(loop)
    }
    const halt = () => {
      running = false
      cancelAnimationFrame(frame)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer) return
      targetPX = (event.clientX / width - 0.5) * 2
      targetPY = (event.clientY / height - 0.5) * 2
    }

    const onVisibility = () => {
      tabVisible = document.visibilityState === 'visible'
    }

    let io: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true
        },
        { threshold: 0 },
      )
      io.observe(canvas)
    }

    resize()
    start()

    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      halt()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      io?.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`particle-field ${className ?? ''}`}
      style={style}
      aria-hidden="true"
    />
  )
}
