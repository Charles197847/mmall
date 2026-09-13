import Link from 'next/link'
import { GuestChrome } from '../../../components/shop/GuestChrome'
import { CourtNav } from '../../../components/shop/CourtNav'

export default function JoinPage() {
  return (
    <GuestChrome>
      <CourtNav />
      <p className="text-sm">
        <Link href="/shop" className="font-semibold text-glow hover:underline">
          ← Continue shopping
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold">Join MMall</h1>
      <p className="mt-2 max-w-2xl text-mute">
        Shoppers and merchants are different accounts. Pick one path — you can add the other later with a different
        email.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <Link href="/shop/signup" className="rounded-2xl bg-black/5 p-6 hover:ring-2 hover:ring-glow">
          <p className="text-xs tracking-[0.2em] text-mute">GENERAL USER</p>
          <h2 className="mt-2 text-2xl font-semibold">I want to shop</h2>
          <p className="mt-3 text-sm text-mute">
            One basket across the mall. Orders, gift cards, vouchers, and Deliver to. No store, no KYC.
          </p>
          <p className="mt-6 text-sm font-semibold text-glow">Create a shopper account</p>
        </Link>
        <Link href="/shop/sell" className="rounded-2xl bg-black/5 p-6 hover:ring-2 hover:ring-glow">
          <p className="text-xs tracking-[0.2em] text-mute">VENDOR</p>
          <h2 className="mt-2 text-2xl font-semibold">I want to sell</h2>
          <p className="mt-3 text-sm text-mute">
            Your own shop on the mall. Phone OTP, then the vendor desk for products, orders, and ads.
          </p>
          <p className="mt-6 text-sm font-semibold text-glow">Create a store</p>
        </Link>
      </div>

      <p className="mt-8 text-sm text-mute">
        Already have an account?{' '}
        <Link href="/shop/login" className="text-glow">
          Shopper sign in
        </Link>
        {' · '}
        <Link href="/login" className="text-glow">
          Merchant sign in
        </Link>
      </p>
    </GuestChrome>
  )
}
