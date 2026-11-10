export function CardHeader({ title, source }: { title: string; source?: string }) {
  return (
    <header className="detail-head card-header">
      <h2 className="overlay-title" id="overlay-title" tabIndex={-1}>
        {title}
      </h2>
      {source ? <p className="card-source">{source}</p> : null}
    </header>
  )
}
