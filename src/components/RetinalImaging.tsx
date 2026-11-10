const documentation = 'https://docs.aireadi.org'

export function RetinalImaging() {
  return (
    <section className="retinal-section" aria-labelledby="retinal-images-title">
      <div className="retinal-grid">
        <figure className="retinal-figure">
          <img
            src="/assets/retinal-fundus-doc.webp"
            alt="Cropped color fundus photograph from AI-READI documentation; optic disc, macula, and retinal vessels are visible"
            loading="lazy"
            width="655"
            height="654"
          />
          <figcaption>
            <strong>Fundus photograph</strong>
            <span>
              <a
                href={`${documentation}/docs/3/dataset/retinal-photography`}
                target="_blank"
                rel="noreferrer"
              >
                View source
              </a>
            </span>
          </figcaption>
        </figure>
        <figure className="retinal-figure">
          <img
            src="/assets/retinal-oct-doc.webp"
            alt="Cropped retinal OCT B-scan from AI-READI documentation with visible layer-segmentation overlays and a reference cursor"
            loading="lazy"
            width="1120"
            height="540"
          />
          <figcaption>
            <strong>Retinal OCT B-scan</strong>
            <span>
              <a
                href={`${documentation}/docs/3/dataset/retinal-oct`}
                target="_blank"
                rel="noreferrer"
              >
                View source
              </a>
            </span>
          </figcaption>
        </figure>
      </div>
      <p className="retinal-disclaimer">Cropped documentation images · CC BY 4.0.</p>
    </section>
  )
}
