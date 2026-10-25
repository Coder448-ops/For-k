import './SilverRing.css'

/* ------------------------------------------------------------------
   The slowly rotating abstract silver ring: three conic-metal orbits
   tilted in 3D around a soft luminous core, with a travelling point
   of light. Pure CSS — cheap, crisp at any DPI, and static under
   reduced motion.
------------------------------------------------------------------ */

export default function SilverRing() {
  return (
    <div className="ring" aria-hidden="true">
      <div className="ring__core" />
      <div className="ring__glow" />
      <div className="ring__orbit ring__orbit--a" />
      {/* flare rides its own un-masked orbit, perfectly synced with orbit A */}
      <div className="ring__flare-orbit">
        <span className="ring__flare" />
      </div>
      <div className="ring__orbit ring__orbit--b" />
      <div className="ring__orbit ring__orbit--c" />
    </div>
  )
}
