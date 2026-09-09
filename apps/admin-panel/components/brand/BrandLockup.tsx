export function BrandLockup({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <img src="/icon.png" alt="MMall" className="h-11 w-11 rounded-xl object-cover shadow-glow" />
      <div>
        <p className="text-lg font-bold tracking-[0.18em]">MMall</p>
        <p className="text-xs text-mute tracking-[0.16em]">{subtitle}</p>
      </div>
    </div>
  )
}
