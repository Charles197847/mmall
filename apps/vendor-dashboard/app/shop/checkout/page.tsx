'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { quoteCourierGuy, searchSaPlaces, shopperAreaFromAddress, type ShippingQuote } from '@shopping-mall/shared-types'
import { GuestChrome, money } from '../../../components/shop/GuestChrome'
import { persistShopperArea } from '../../../lib/persistShopperArea'
import { readGuestBag, type GuestBagItem } from '../../../lib/guestBag'
import { readShopperArea } from '../../../lib/shopperLocation'
import { useShopperArea } from '../../../lib/useShopperArea'
import { useAuthStore } from '../../../stores/authStore'
import { api } from '../../../lib/api'
import { peekGiftCard, savedVoucherCodes, shopVouchers } from '../../../lib/mallWallet'
import { isDemoSku, rememberPendingCheckout } from '../../../lib/pendingCheckout'

export default function GuestCheckoutPage() {
  const area = useShopperArea()
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [items, setItems] = useState<GuestBagItem[]>([])
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [service, setService] = useState<'ECO' | 'OVN' | 'SDD'>('ECO')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [giftCode, setGiftCode] = useState('')
  const [giftCredit, setGiftCredit] = useState(0)
  const [voucherCode, setVoucherCode] = useState('')

  useEffect(() => {
    setItems(readGuestBag())
  }, [])

  useEffect(() => {
    const saved = user?.deliveryAddress
    const fromArea = area ?? shopperAreaFromAddress(saved) ?? readShopperArea()
    setStreet(saved?.line1 ?? saved?.line2 ?? '')
    setCity(fromArea?.city ?? saved?.city ?? '')
    setProvince(fromArea?.province ?? saved?.state ?? '')
    setPostalCode(fromArea?.postalCode ?? saved?.postalCode ?? '')
  }, [area, user])

  useEffect(() => {
    if (!city) {
      setQuotes([])
      return
    }
    const local = quoteCourierGuy({
      collectionCity: 'Johannesburg',
      deliveryCity: city,
      weightKg: Math.max(1, items.reduce((sum, item) => sum + item.quantity * 0.8, 0)),
    })
    setQuotes(local)
    const first = local.find((item) => item.available)
    if (first) setService(first.serviceLevelCode)

    if (!items.length || items.every((item) => isDemoSku(item.productId))) return
    void api.shipping
      .quote({
        items: items.filter((item) => !isDemoSku(item.productId)).map((item) => ({ productId: item.productId, quantity: item.quantity })),
        address: { city, postalCode, street, state: province },
      })
      .then((result) => {
        setQuotes(result.quotes)
        const available = result.quotes.find((item) => item.available)
        if (available) setService(available.serviceLevelCode)
      })
      .catch(() => undefined)
  }, [city, postalCode, items, street, province])

  const selected = quotes.find((item) => item.serviceLevelCode === service && item.available) ?? quotes.find((item) => item.available)
  const liveItems = items.filter((item) => !isDemoSku(item.productId))
  const demoItems = items.filter((item) => isDemoSku(item.productId))
  const liveSubtotal = liveItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const voucher = shopVouchers.find((item) => item.code === voucherCode)
  const voucherOff = voucher
    ? voucher.percent && liveSubtotal >= voucher.minSpend
      ? Math.round((liveSubtotal * voucher.percent) / 100)
      : voucher.amount && liveSubtotal >= voucher.minSpend
        ? voucher.amount
        : 0
    : 0
  const afterVoucher = Math.max(0, liveSubtotal - voucherOff)
  const shipping = selected?.amount ?? 0
  const giftCreditApplied = Math.min(giftCredit, afterVoucher + shipping)
  const previewTotal = Math.max(0, afterVoucher + shipping - giftCreditApplied)
  const paygateTotal = liveSubtotal + shipping
  const demoDiscount = Math.max(0, paygateTotal - previewTotal)
  const cities = useMemo(() => searchSaPlaces(city, 6), [city])

  async function saveAddress() {
    if (!city || !postalCode) {
      setMessage('Add a city and postcode so we can deliver.')
      return
    }
    const next = shopperAreaFromAddress({ city, postalCode })
    if (next) await persistShopperArea(next)
    if (token) {
      await api.auth.updateAddress({
        fullName: user ? `${user.firstName} ${user.lastName}` : undefined,
        line1: street,
        street,
        city,
        state: province,
        postalCode,
        country: 'South Africa',
      })
    }
  }

  async function placeOrder() {
    setMessage('')
    if (!street || !city || !postalCode) {
      setMessage('Add street, city, and postcode.')
      return
    }
    if (!selected) {
      setMessage('Choose a Courier Guy service.')
      return
    }
    setSaving(true)
    try {
      await saveAddress()
      if (!token) {
        window.location.href = `/shop/login?next=${encodeURIComponent('/shop/checkout')}`
        return
      }
      if (!liveItems.length) {
        setMessage('Demo listings cannot be charged through PayGate. Add a live catalog product to place a mock payment.')
        return
      }
      const shippingAddress = {
        fullName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
        line1: street,
        street,
        city,
        state: province,
        postalCode,
        country: 'South Africa',
      }
      const paymentReturnUrl = `${window.location.origin}/shop/checkout/payment-return`
      const order = await api.orders.create({
        items: liveItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress,
        billingAddress: shippingAddress,
        shippingServiceCode: selected.serviceLevelCode,
        paymentReturnUrl,
      })
      const checkoutUrl = order.paygate?.checkoutUrl
      if (!checkoutUrl) {
        setMessage('Order was created but PayGate did not return a checkout URL.')
        return
      }
      rememberPendingCheckout({
        orderId: order.id,
        payRequestId: order.payRequestId,
        giftCode: giftCreditApplied && giftCode ? giftCode : undefined,
        giftSpend: giftCreditApplied || undefined,
      })
      window.location.href = checkoutUrl
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Checkout failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <GuestChrome>
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-mute">
        Demo payment via mock PayGate. No live card is charged.{' '}
        {token ? 'This address is saved on your account.' : 'Sign in to save it to your account and pay.'}
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-mute">
          Your basket is empty.{' '}
          <Link href="/shop" className="text-glow">
            Continue shopping
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-10">
          <section>
            <h2 className="text-lg font-semibold">Deliver to</h2>
            <div className="mt-4 space-y-3">
              <input
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder="Street and suburb"
                className="w-full rounded-lg bg-black/5 px-3 py-2 text-sm"
              />
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="City"
                className="w-full rounded-lg bg-black/5 px-3 py-2 text-sm"
              />
              {cities.length ? (
                <div className="flex flex-wrap gap-2">
                  {cities.map((place) => (
                    <button
                      key={`${place.city}-${place.postalCode}`}
                      type="button"
                      className="rounded-full bg-black/5 px-3 py-1 text-xs"
                      onClick={() => {
                        setCity(place.city)
                        setProvince(place.province)
                        setPostalCode(place.postalCode)
                        void persistShopperArea({ ...place, source: 'search' })
                      }}
                    >
                      {place.city}
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                value={province}
                onChange={(event) => setProvince(event.target.value)}
                placeholder="Province"
                className="w-full rounded-lg bg-black/5 px-3 py-2 text-sm"
              />
              <input
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                placeholder="Postal code"
                className="w-full rounded-lg bg-black/5 px-3 py-2 text-sm"
              />
            </div>

            <h2 className="mt-8 text-lg font-semibold">The Courier Guy</h2>
            <div className="mt-3 space-y-2">
              {quotes.map((quote) => (
                <button
                  key={quote.serviceLevelCode}
                  type="button"
                  disabled={!quote.available}
                  onClick={() => setService(quote.serviceLevelCode)}
                  className={`block w-full rounded-xl px-3 py-3 text-left ${
                    selected?.serviceLevelCode === quote.serviceLevelCode ? 'bg-brand text-white' : 'bg-black/5'
                  } ${quote.available ? '' : 'opacity-40'}`}
                >
                  <span className="font-semibold">{quote.serviceName}</span>
                  <span className="ml-2">{quote.available ? money(quote.amount) : 'N/A'}</span>
                  <span className="mt-1 block text-xs opacity-80">{quote.note}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Order</h2>
            <p className="mt-1 rounded-xl bg-black/5 px-3 py-2 text-xs text-mute">
              Mock PayWeb checkout — Visa or Instant EFT stand-in. Inventory is held until this demo payment succeeds.
            </p>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={`${item.productId}-${JSON.stringify(item.options)}`} className="flex justify-between gap-4 text-sm">
                  <span>
                    {item.quantity}× {item.name}
                    {isDemoSku(item.productId) ? ' · demo listing' : ''}
                  </span>
                  <span>{money(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between text-sm text-mute">
              <span>Live subtotal</span>
              <span>{money(liveSubtotal)}</span>
            </p>
            {demoItems.length ? (
              <p className="flex justify-between text-sm text-mute">
                <span>Demo listings (not charged)</span>
                <span>{money(subtotal - liveSubtotal)}</span>
              </p>
            ) : null}
            <p className="flex justify-between text-sm text-mute">
              <span>Courier</span>
              <span>{selected ? money(selected.amount) : '—'}</span>
            </p>
            {voucherOff ? (
              <p className="flex justify-between text-sm text-mute">
                <span>Demo voucher {voucherCode}</span>
                <span>−{money(voucherOff)}</span>
              </p>
            ) : null}
            {giftCreditApplied ? (
              <p className="flex justify-between text-sm text-mute">
                <span>Demo gift card</span>
                <span>−{money(giftCreditApplied)}</span>
              </p>
            ) : null}
            {demoDiscount ? (
              <p className="mt-2 text-xs text-mute">
                Demo gift/voucher previews do not change the mock PayGate total. PayGate will charge {money(paygateTotal)}.
              </p>
            ) : null}
            <p className="mt-2 flex justify-between text-lg font-semibold">
              <span>Mock PayGate total</span>
              <span>{money(paygateTotal)}</span>
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold">Demo promotional voucher</p>
              <select
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value)}
                className="w-full rounded-lg bg-black/5 px-3 py-2 text-sm"
              >
                <option value="">None</option>
                {savedVoucherCodes().map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <p className="text-sm font-semibold">Demo gift card</p>
              <div className="flex gap-2">
                <input
                  value={giftCode}
                  onChange={(event) => setGiftCode(event.target.value.toUpperCase())}
                  placeholder="MM-XXXX-XXXX-XXXX-XXXX"
                  className="flex-1 rounded-lg bg-black/5 px-3 py-2 font-mono text-sm"
                />
                <button
                  type="button"
                  className="text-sm font-semibold text-glow"
                  onClick={() => {
                    void peekGiftCard(giftCode)
                      .then((card) => {
                        const used = Math.min(card.remaining, afterVoucher + shipping)
                        setGiftCredit(used)
                        setMessage(
                          `Demo preview: ${money(used)} from •••• ${card.last4}. This does not reduce the mock PayGate total.`,
                        )
                      })
                      .catch((error) => setMessage(error instanceof Error ? error.message : 'Gift card failed.'))
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={placeOrder}
              disabled={saving || (Boolean(token) && !liveItems.length)}
              className="mt-6 w-full rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? 'Working…'
                : token
                  ? liveItems.length
                    ? `Demo payment · PayGate mock · ${money(paygateTotal)}`
                    : 'Demo listings cannot be charged'
                  : 'Save address and sign in'}
            </button>
            {message ? <p className="mt-3 text-sm text-mute">{message}</p> : null}
            <Link href="/shop/bag" className="mt-4 inline-block text-sm text-glow">
              Back to basket
            </Link>
          </section>
        </div>
      )}
    </GuestChrome>
  )
}
