export function MetricCard({
  title,
  value,
  change,
}: {
  title: string
  value: string | number
  change?: string
}) {
  return (
    <div className="mm-card rounded-2xl p-5">
      <p className="text-sm text-mute">{title}</p>
      <p className="text-2xl font-bold mt-1 text-ice">{value}</p>
      {change ? <p className="text-xs text-glow mt-1">{change}</p> : null}
    </div>
  )
}
