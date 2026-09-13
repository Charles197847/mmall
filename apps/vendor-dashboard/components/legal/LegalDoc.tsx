import Link from 'next/link'
import { GuestChrome } from '../shop/GuestChrome'
import { CourtNav } from '../shop/CourtNav'
import { legalUpdated, type LegalSection } from '../../lib/legalDocs'

export function LegalDoc({
  kicker,
  title,
  intro,
  sections,
  other,
}: {
  kicker: string
  title: string
  intro: string
  sections: LegalSection[]
  other: { href: string; label: string }
}) {
  return (
    <GuestChrome>
      <CourtNav />
      <article className="mx-auto max-w-3xl">
        <p className="text-xs tracking-[0.2em] text-mute">{kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-mute">Last updated {legalUpdated}</p>
        <p className="mt-6 text-mute">{intro}</p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-sm leading-7 text-mute">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-mute">
          Also read the{' '}
          <Link href="/shop/legal/privacy" className="text-glow">
            Privacy Notice
          </Link>
          {' · '}
          <Link href={other.href} className="text-glow">
            {other.label}
          </Link>
        </p>
      </article>
    </GuestChrome>
  )
}
