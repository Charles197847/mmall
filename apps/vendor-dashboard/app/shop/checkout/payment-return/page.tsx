'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GuestChrome, money } from '../../../../components/shop/GuestChrome'
import { writeGuestBag } from '../../../../lib/guestBag'
import { api } from '../../../../lib/api'
import { useAuthStore } from '../../../../stores/authStore'
import { clearPendingCheckout, readPendingCheckout } from '../../../../lib/pendingCheckout'
import type { Order } from '@shopping-mall/shared-types'

function PaymentReturnBody() {
  const params = useSearchParams()
  const token = useAuthStore((state) => state.token)
  const status = params.get('TRANSACTION_STATUS') ?? ''
  const payRequestId = params.get('PAY_REQUEST_ID') ?? ''
  const approved = status === '1'
  const [order, setOrder] = useState<Order | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!status) return
    const pending = readPendingCheckout()
    if (pending?.orderId) setPendingOrderId(pending.orderId)
    if (!approved) {
      clearPendingCheckout()
      return
    }
    writeGuestBag([])
    clearPendingCheckout()
  }, [approved, status])

  useEffect(() => {
    if (!token) return
    const load = pendingOrderId
      ? api.orders.get(pendingOrderId)
      : payRequestId
        ? api.orders.list().then((orders) => orders.find((row) => row.payRequestId === payRequestId) ?? null)
        : Promise.resolve(null)
    void load
      .then((row) => {
        if (row) setOrder(row)
      })
      .catch(() => undefined)
  }, [token, payRequestId, pendingOrderId])

  return (
    <>
      <p className="text-xs tracking-[0.2em] text-mute">PAYGATE PAYWEB 3 · DEMO PAYMENT</p>
      <h1 className="mt-2 text-3xl font-semibold">{approved ? 'Mock payment approved' : 'Mock payment not completed'}</h1>
      <p className="mt-3 max-w-2xl text-mute">
        {approved
          ? 'The local PayGate stand-in authorised this order. No live card was charged. The vendor can book The Courier Guy once stock has been committed.'
          : 'The mock PayGate session was declined or cancelled. Your basket is still here — retry checkout when you are ready.'}
      </p>
      {payRequestId ? <p className="mt-4 text-xs text-mute">PAY_REQUEST_ID {payRequestId}</p> : null}
      {order ? (
        <p className="mt-4 text-sm text-ice">
          Order {order.id.slice(0, 10)} · {order.paymentStatus} · {money(order.totalAmount)}
        </p>
      ) : approved && token ? (
        <p className="mt-4 text-sm text-mute">Loading the order created for this mock payment…</p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-4">
        <Link href={approved ? '/shop/help#orders' : '/shop/checkout'} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">
          {approved ? 'View orders' : 'Back to checkout'}
        </Link>
        <Link href="/shop" className="text-sm font-semibold text-glow">
          Continue shopping
        </Link>
      </div>
    </>
  )
}

export default function ShopPaymentReturnPage() {
  return (
    <GuestChrome>
      <Suspense fallback={<p className="text-mute">Returning from PayGate…</p>}>
        <PaymentReturnBody />
      </Suspense>
    </GuestChrome>
  )
}
