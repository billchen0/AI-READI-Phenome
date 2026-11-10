import { CLINICAL_TABS, GROUP_LABELS, MODALITIES } from '../../data/modalities'
import { ORGANS } from '../../data/organs'
import type { ClinicalTab, ModalityId, OrganId } from '../../types'

export function IndexPicker({
  onSelectModality,
  onSelectClinical,
  onSelectOrgan,
  onSelectEnvironment,
}: {
  onSelectModality: (id: ModalityId) => void
  onSelectClinical: (tab: ClinicalTab) => void
  onSelectOrgan: (organ: OrganId) => void
  onSelectEnvironment: () => void
}) {
  return (
    <>
      <section className="picker-group" aria-labelledby="picker-measured">
        <h3 id="picker-measured">Measured modalities</h3>
        <div className="picker-list">
          {MODALITIES.map((modality) => (
            <button
              key={modality.id}
              type="button"
              className="picker-item"
              onClick={() => onSelectModality(modality.id)}
            >
              <span className="picker-text">
                <span className="picker-label">{modality.label}</span>
                <span className="picker-meta">
                  {GROUP_LABELS[modality.group]} · {modality.unit}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="picker-group" aria-labelledby="picker-environment">
        <h3 id="picker-environment">Room environment</h3>
        <div className="picker-list">
          <button type="button" className="picker-item" onClick={onSelectEnvironment}>
            <span className="picker-text">
              <span className="picker-label">Environmental sensor</span>
              <span className="picker-meta">Adjacent home unit · air, climate, light</span>
            </span>
          </button>
        </div>
      </section>

      <section className="picker-group" aria-labelledby="picker-clinical">
        <h3 id="picker-clinical">Clinical examples</h3>
        <div className="picker-list">
          {CLINICAL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="picker-item picker-item--clinical"
              onClick={() => onSelectClinical(tab.id)}
            >
              <span className="picker-text">
                <span className="picker-label">{tab.label}</span>
                {tab.id === 'retinal' ? (
                  <span className="picker-meta">Documentation images</span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="picker-group" aria-labelledby="picker-organs">
        <h3 id="picker-organs">Organ context</h3>
        <div className="picker-list">
          {ORGANS.map((organ) => (
            <button
              key={organ.id}
              type="button"
              className="picker-item picker-item--clinical"
              onClick={() => onSelectOrgan(organ.id)}
            >
              <span className="picker-text">
                <span className="picker-label">{organ.label}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <details className="source-list">
        <summary>Image sources</summary>
        <ul>
          <li>Retinal imaging · published fundus and OCT figures</li>
        </ul>
      </details>
    </>
  )
}
