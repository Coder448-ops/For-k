import { scrollToTop } from '../lib/motion'
import './MonogramButton.css'

/* Small fixed K monogram — returns the visitor to the opening. */

type MonogramButtonProps = {
  reducedMotion: boolean
}

export default function MonogramButton({ reducedMotion }: MonogramButtonProps) {
  return (
    <button
      type="button"
      className="monogram-btn"
      onClick={() => scrollToTop(reducedMotion)}
      aria-label="Boshiga qaytish"
      title="Boshiga qaytish"
    >
      <span className="monogram-btn__ring" aria-hidden="true" />
      <span className="monogram-btn__k metal-ink" aria-hidden="true">
        K
      </span>
    </button>
  )
}
