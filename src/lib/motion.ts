/** Scroll helpers that honour prefers-reduced-motion. */

export function scrollToTop(reducedMotion: boolean) {
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
}

export function scrollToId(id: string, reducedMotion: boolean) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
}
