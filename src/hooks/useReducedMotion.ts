import { useEffect, useState } from 'react'

/**
 * Live-tracks the user's `prefers-reduced-motion` setting.
 * Falls back to `false` when matchMedia is unavailable.
 */
export function useReducedMotion(): boolean {
  const getInitial = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const [reduced, setReduced] = useState<boolean>(getInitial)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
