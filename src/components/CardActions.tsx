interface Props {
  onOpenIndex: () => void
  onOpenLabs?: () => void
}

export function CardActions({ onOpenIndex, onOpenLabs }: Props) {
  return (
    <div className="detail-actions">
      {onOpenLabs ? (
        <button className="quiet-button" onClick={onOpenLabs}>
          All labs
        </button>
      ) : null}
      <button className="quiet-button" onClick={onOpenIndex}>
        All modalities
      </button>
    </div>
  )
}
