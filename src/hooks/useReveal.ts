import { useEffect, useRef } from 'react'

/**
 * Adds `.is-visible` to every `[data-reveal]` element inside the given root
 * once it scrolls into view. Uses a single IntersectionObserver, unobserves
 * after reveal (one-shot), and degrades gracefully: without IO support every
 * element is revealed immediately.
 */
export function useRevealObserver(deps: unknown[] = []) {
  const ready = useRef(false)

  useEffect(() => {
    ready.current = true
    const revealAll = () => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)')
        .forEach((el) => el.classList.add('is-visible'))
    }

    if (typeof IntersectionObserver === 'undefined') {
      revealAll()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    const scan = () => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)')
        .forEach((el) => observer.observe(el))
    }

    scan()

    // Content mounted later (e.g. after the intro is dismissed) also observes.
    const mutation = new MutationObserver(() => scan())
    mutation.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutation.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
