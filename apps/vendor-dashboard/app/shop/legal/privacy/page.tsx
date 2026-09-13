import { LegalDoc } from '../../../../components/legal/LegalDoc'
import { privacyNotice } from '../../../../lib/legalDocs'

export default function PrivacyPage() {
  return (
    <LegalDoc
      kicker="LEGAL"
      title="Privacy Notice"
      intro="This notice explains how MMall uses personal information for shoppers and merchants."
      sections={privacyNotice}
      other={{ href: '/shop/legal/shopper', label: 'Shopper Terms' }}
    />
  )
}
