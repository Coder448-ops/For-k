import { Pause, Play } from 'lucide-react'
import { useAmbientSound } from '../hooks/useAmbientSound'
import './SoundToggle.css'

/* ------------------------------------------------------------------
   Optional ambient sound. The pad is generated live by the Web Audio
   API (no audio file exists, so none can go missing). Nothing ever
   autoplays: the engine starts only when this button is pressed, and
   the control hides itself entirely on browsers without Web Audio.
------------------------------------------------------------------ */

export default function SoundToggle() {
  const { supported, playing, toggle } = useAmbientSound()

  if (!supported) return null

  return (
    <button
      type="button"
      className={`sound-toggle ${playing ? 'sound-toggle--on' : ''}`}
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Pause ambient sound' : 'Play ambient sound'}
      title={playing ? 'Pause ambient sound' : 'Play ambient sound'}
    >
      <span className="sound-toggle__glass" aria-hidden="true">
        <span className="sound-toggle__icon">
          {playing ? <Pause size={15} strokeWidth={1.6} /> : <Play size={15} strokeWidth={1.6} />}
        </span>
        <span className="sound-toggle__bars" aria-hidden="true">
          <i /><i /><i />
        </span>
      </span>
      <span className="sound-toggle__label label">
        {playing ? 'Sound on' : 'Sound off'}
      </span>
    </button>
  )
}
