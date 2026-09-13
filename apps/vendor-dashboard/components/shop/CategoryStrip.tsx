import Link from 'next/link'
import { mallDepartments } from '../../lib/mallCategories'

export function CategoryStrip() {
  return (
    <section className="mb-8">
      <div className="flex flex-wrap gap-1.5">
        {mallDepartments.map((group) => (
          <div key={group.title} className="contents">
            {group.items.map((item) => (
              <Link
                key={item.name}
                href={`/shop/browse?category=${encodeURIComponent(item.name)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mm-card-border)] bg-panel px-2.5 py-1.5 text-xs text-ice hover:border-glow/50"
                title={group.title}
              >
                <span aria-hidden>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
