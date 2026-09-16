import { prisma } from '../../shared/database/index.js'
import { publishGrid } from '../../shared/events.js'
import { inventoryDecrements } from './stockPlan.js'

/** Commit catalog stock only after PayGate marks the order PAID. */
export async function commitPaidOrderStock(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } })
  if (!items.length) return

  await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
      select: { id: true, inventory: true },
    })
    const stock = new Map(products.map((product) => [product.id, product.inventory]))
    const plan = inventoryDecrements(
      items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      stock,
    )
    for (const row of plan) {
      if (row.decrement <= 0) continue
      await tx.product.update({
        where: { id: row.productId },
        data: { inventory: { decrement: row.decrement } },
      })
    }
  })

  publishGrid({
    type: 'inventory',
    payload: { productIds: items.map((item) => item.productId), orderId },
  })
}
