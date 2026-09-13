export type LegalSection = { heading: string; body: string[] }

export const legalUpdated = '13 September 2026'

export const shopperTerms: LegalSection[] = [
  {
    heading: '1. Who these terms cover',
    body: [
      'These Shopper Terms apply when you create a shopper account on MMall or buy from shops on the mall. MMall is a digital shopping mall operated in South Africa. Independent merchants run their own stores. MMall provides the mall, checkout, and related services.',
      'A shopper account is only for buying. Opening a store requires a separate merchant account and a different email.',
    ],
  },
  {
    heading: '2. Your account',
    body: [
      'You must be 18 or older, or use the mall with a parent or guardian who accepts these terms for you.',
      'You are responsible for the email, passkey, password, and devices you use to sign in. Tell us if you think someone else has used your account.',
      'We may suspend or close an account that is used to commit fraud, abuse other shoppers or merchants, or break the law.',
    ],
  },
  {
    heading: '3. Shopping on the mall',
    body: [
      'You can browse as a guest. Signing in lets you check out, keep addresses, track orders, and use gift cards and vouchers.',
      'Listings, prices, stock, and delivery times are set by each shop. A listing is an invitation to order, not a guaranteed offer until the shop accepts and fulfils it.',
      'One bag can hold items from more than one shop. Each shop still fulfils its own items.',
    ],
  },
  {
    heading: '4. Payment, delivery, and orders',
    body: [
      'Checkout is processed through PayGate for South African cards and EFT. We do not store full card numbers on MMall.',
      'You authorise the charge when you place the order. Delivery quotes use the suburb you set in Deliver to, including Courier Guy rates where they apply.',
      'If a shop cannot fulfil an item, that part of the order may be cancelled and refunded. Other items in the bag can still ship.',
    ],
  },
  {
    heading: '5. Returns and problems',
    body: [
      'Returns follow the shop’s policy and South African consumer law, including the Consumer Protection Act where it applies.',
      'Start a return from Your orders or Customer service. The shop handles the item. MMall can help if the shop does not respond.',
    ],
  },
  {
    heading: '6. Gift cards and vouchers',
    body: [
      'MMall gift cards can be spent at participating shops on the mall. Keep the PIN private. A card can be locked after repeated wrong PIN attempts.',
      'Promotional vouchers have their own rules, dates, and shop limits. They have no cash value unless the law says otherwise.',
    ],
  },
  {
    heading: '7. What you may not do',
    body: [
      'Do not scrape the mall, interfere with checkout, post false reviews, or use the service to commit fraud or any other crime.',
    ],
  },
  {
    heading: '8. Privacy',
    body: [
      'We process personal information as set out in the Privacy Notice, including under the Protection of Personal Information Act (POPIA).',
    ],
  },
  {
    heading: '9. Liability',
    body: [
      'MMall is the mall, not the seller of each listing. Merchants are responsible for their products, descriptions, and fulfilment, except where the law makes MMall responsible.',
      'To the extent allowed by South African law, MMall is not liable for indirect loss. Nothing in these terms limits rights you cannot give up under the CPA or other mandatory law.',
    ],
  },
  {
    heading: '10. Changes and contact',
    body: [
      'We may update these terms. The date at the top of this page is the current version. Continued use after a change means you accept the new terms, except where the law requires us to ask again.',
      'Questions: use Customer service on the mall or email legal@mmall.local.',
    ],
  },
]

export const vendorTerms: LegalSection[] = [
  {
    heading: '1. Who these terms cover',
    body: [
      'These Vendor Terms apply when you create a merchant account or open a store on MMall. You sell as an independent shop. MMall is not your employer, partner, or joint venturer.',
      'A merchant account is only for selling. Shopping uses a separate shopper account and a different email.',
    ],
  },
  {
    heading: '2. Your store',
    body: [
      'An Explorer store is free and lets you set up a shop, add products, and learn the desk. Going fully live, buying ads, and taking payouts requires verification (KYC / KYB).',
      'You must give accurate business, identity, and bank details when asked. We may refuse, suspend, or close a store that fails verification or breaks these terms.',
    ],
  },
  {
    heading: '3. Fees',
    body: [
      'Explorer setup is free. Category commission, monthly fees, payment gateway fees, and advertising prices are shown on the Fees page and may change with notice.',
      'You authorise MMall to deduct fees from amounts collected for your orders before payout.',
    ],
  },
  {
    heading: '4. Listings and fulfilment',
    body: [
      'You are responsible for lawful listings, honest descriptions, photos you have the right to use, stock, pricing, VAT where it applies, and shipping.',
      'You must fulfil accepted orders on time or cancel and refund promptly. Shoppers pay once at mall checkout. You still own the sale of your items.',
    ],
  },
  {
    heading: '5. Prohibited goods',
    body: [
      'You may not list illegal goods, stolen goods, counterfeits, weapons, or anything South African law or MMall policy forbids. We may remove listings without notice.',
    ],
  },
  {
    heading: '6. Identity checks',
    body: [
      'When you unlock live selling, ads, or payouts, we collect identity and (for businesses) company documents. Checks may use Smile ID or a similar provider. You consent to that processing for fraud prevention and legal compliance.',
    ],
  },
  {
    heading: '7. Ads and studio',
    body: [
      'Mall ads and AI studio tools are optional. You are responsible for ad claims and for any content you generate or upload. We may reject ads that mislead shoppers or harm the mall.',
    ],
  },
  {
    heading: '8. Payouts',
    body: [
      'Payouts go to the verified bank account on file after fees, refunds, and chargebacks. We may hold funds while we investigate a dispute or a risk of fraud.',
    ],
  },
  {
    heading: '9. Privacy and shopper data',
    body: [
      'Order details you receive are only for fulfilling that order. Do not sell shopper data or use it for unrelated marketing. See the Privacy Notice.',
    ],
  },
  {
    heading: '10. Liability and indemnity',
    body: [
      'You indemnify MMall against claims that arise from your products, listings, or fulfilment, except to the extent caused by MMall’s own misconduct.',
      'To the extent allowed by law, MMall’s liability to you is limited to fees you paid us in the 3 months before the claim.',
    ],
  },
  {
    heading: '11. Changes and contact',
    body: [
      'We may update these terms and the fee schedule. The date at the top is the current version.',
      'Questions: use the vendor desk or email legal@mmall.local.',
    ],
  },
]

export const privacyNotice: LegalSection[] = [
  {
    heading: '1. Who we are',
    body: [
      'MMall is a South African digital shopping mall. This notice explains how we process personal information for shoppers and merchants under POPIA.',
    ],
  },
  {
    heading: '2. What we collect',
    body: [
      'Account data: name, email, phone, role (shopper or merchant), and sign-in methods (password, passkey, email code, magic link, or Google / Apple when enabled).',
      'Shopping data: Deliver to suburb, addresses, bag contents, orders, gift cards, and vouchers.',
      'Merchant data: store profile, listings, orders you fulfil, and KYC documents when you verify.',
      'Technical data: device, browser, and basic logs needed to run the mall and prevent abuse.',
    ],
  },
  {
    heading: '3. Why we use it',
    body: [
      'To create your account, run checkout (PayGate), quote delivery, prevent fraud, verify merchants, show ads you buy, and meet tax or legal duties.',
      'We do not sell your personal information.',
    ],
  },
  {
    heading: '4. Who we share it with',
    body: [
      'Merchants receive what they need to fulfil your order. Payment is handled by PayGate. Delivery partners receive the address you chose. Verification may use Smile ID. Hosting and email providers process data on our instructions.',
    ],
  },
  {
    heading: '5. Your rights',
    body: [
      'You may ask for access, correction, deletion, or an objection, subject to POPIA. Use Customer service or email privacy@mmall.local.',
      'You may lodge a complaint with the Information Regulator of South Africa.',
    ],
  },
  {
    heading: '6. How long we keep it',
    body: [
      'We keep account and order records for as long as the account is open and for the period South African tax and consumer law requires after that.',
    ],
  },
]
