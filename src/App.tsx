import { useCallback, useEffect, useRef, useState } from 'react'
import Intro from './components/Intro'
import Hero from './components/Hero'
import GiftObject from './components/GiftObject'
import Gallery from './components/Gallery'
import Closing from './components/Closing'
import ParticleField from './components/ParticleField'
import CursorGlow from './components/CursorGlow'
import ScrollProgress from './components/ScrollProgress'
import SoundToggle from './components/SoundToggle'
import MonogramButton from './components/MonogramButton'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useMediaQuery } from './hooks/useMedia'
import { useRevealObserver } from './hooks/useReveal'
import './App.css'

/* ------------------------------------------------------------------
   KUMUSH — A Silver Experience.

   Phase machine: `intro` (fixed cinematic overlay, scroll locked)
   → `main` (the full experience, entrance animations fired by the
   `experience--entered` class). "Replay the opening" walks it back.
------------------------------------------------------------------ */

type Phase = 'intro' | 'main'

export default function App() {
  const reducedMotion = useReducedMotion()
  const finePointer = useMediaQuery('(pointer: fine)')

  const [phase, setPhase] = useState<Phase>('intro')
  const [introMounted, setIntroMounted] = useState(true)
  const [introLeaving, setIntroLeaving] = useState(false)
  const [particleIntensity, setParticleIntensity] = useState(0)
  const timersRef = useRef<number[]>([])
  const enteringRef = useRef(false)
  const experienceRef = useRef<HTMLDivElement | null>(null)

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t))
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  // Intro ambience: let the particles emerge from near-black.
  useEffect(() => {
    if (phase !== 'intro') return
    const t = window.setTimeout(
      () => setParticleIntensity(reducedMotion ? 0.9 : 0.55),
      reducedMotion ? 30 : 420,
    )
    timersRef.current.push(t)
  }, [phase, reducedMotion])

  // Lock scrolling while the overlay is up.
  useEffect(() => {
    document.body.classList.toggle('is-locked', phase === 'intro')
    return () => document.body.classList.remove('is-locked')
  }, [phase])

  // Keep the page behind the intro out of reach: `inert` blocks focus,
  // clicks and assistive tech; aria-hidden backs up older browsers.
  useEffect(() => {
    const el = experienceRef.current
    if (!el) return
    if (phase === 'intro') el.setAttribute('inert', '')
    else el.removeAttribute('inert')
  }, [phase, introMounted])

  // Re-scan for reveal targets whenever the phase changes.
  useRevealObserver([phase])

  const enter = useCallback(() => {
    if (enteringRef.current) return
    enteringRef.current = true
    setIntroLeaving(true)
    setParticleIntensity(1)
    const t = window.setTimeout(
      () => {
        setIntroMounted(false)
        setPhase('main')
        window.scrollTo({ top: 0, behavior: 'auto' })
      },
      reducedMotion ? 40 : 880,
    )
    timersRef.current.push(t)
  }, [reducedMotion])

  const replay = useCallback(() => {
    clearTimers()
    enteringRef.current = false
    window.scrollTo({ top: 0, behavior: 'auto' })
    setIntroLeaving(false)
    setIntroMounted(true)
    setParticleIntensity(0)
    setPhase('intro')
  }, [])

  return (
    <div className="app">
      <ParticleField intensity={particleIntensity} reducedMotion={reducedMotion} />

      {finePointer && !reducedMotion && <CursorGlow />}

      {introMounted && (
        <Intro onDiscover={enter} leaving={introLeaving} reducedMotion={reducedMotion} />
      )}

      {phase === 'main' && (
        <a className="skip-link" href="#hero">
          Skip to content
        </a>
      )}
      {phase === 'main' && <ScrollProgress />}

      <div
        ref={experienceRef}
        className={`experience ${phase === 'main' ? 'experience--entered' : ''}`}
        aria-hidden={phase === 'intro'}
      >
        <main id="hero" tabIndex={-1}>
          <Hero reducedMotion={reducedMotion} finePointer={finePointer} />
          <GiftObject reducedMotion={reducedMotion} finePointer={finePointer} />
          <Gallery reducedMotion={reducedMotion} finePointer={finePointer} />
          <Closing onReplay={replay} reducedMotion={reducedMotion} />
        </main>
      </div>

      {phase === 'main' && <MonogramButton reducedMotion={reducedMotion} />}
      {phase === 'main' && <SoundToggle />}

      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
    </div>
  )
}
