export function MetricCard({
  title,
  value,
  change,
  subtext,
}: {
  title: string
  value: string | number
  change?: number | string
  subtext?: string
}) {
  return (
    <div className="mm-card rounded-2xl p-5">
      <p className="text-sm text-mute">{title}</p>
      <p className="text-2xl font-bold mt-2 text-ice">{value}</p>
      {typeof change === 'number' ? (
        <p className={`text-sm mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-signal'}`}>
          {change >= 0 ? '+' : ''}
          {change}% this week
        </p>
      ) : change ? (
        <p className="text-sm mt-1 text-mute">{change}</p>
      ) : null}
      {subtext ? <p className="text-xs text-glow mt-1">{subtext}</p> : null}
    </div>
  )
}
