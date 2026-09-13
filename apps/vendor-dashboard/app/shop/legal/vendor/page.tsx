import { LegalDoc } from '../../../../components/legal/LegalDoc'
import { vendorTerms } from '../../../../lib/legalDocs'

export default function VendorTermsPage() {
  return (
    <LegalDoc
      kicker="LEGAL"
      title="Vendor Terms"
      intro="These terms apply when you create a merchant account or open a store on MMall. Creating a store means you accept this version."
      sections={vendorTerms}
      other={{ href: '/shop/legal/shopper', label: 'Shopper Terms' }}
    />
  )
}
