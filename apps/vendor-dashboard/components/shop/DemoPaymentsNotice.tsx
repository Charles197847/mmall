export function DemoPaymentsNotice() {
  if (process.env.NEXT_PUBLIC_DEMO_PAYMENTS !== 'true') return null
  return (
    <p role="status" className="bg-navy px-3 py-1.5 text-center text-xs text-mute">
      Demo — payments are simulated
    </p>
  )
}
