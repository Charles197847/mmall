import { LegalDoc } from '../../../../components/legal/LegalDoc'
import { shopperTerms } from '../../../../lib/legalDocs'

export default function ShopperTermsPage() {
  return (
    <LegalDoc
      kicker="LEGAL"
      title="Shopper Terms"
      intro="These terms apply when you create a shopper account or buy on MMall. Creating an account means you accept this version."
      sections={shopperTerms}
      other={{ href: '/shop/legal/vendor', label: 'Vendor Terms' }}
    />
  )
}
