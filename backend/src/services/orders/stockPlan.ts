export function inventoryDecrements(
  items: Array<{ productId: string; quantity: number }>,
  stock: Map<string, number>,
): Array<{ productId: string; decrement: number; remaining: number }> {
  return items.map((item) => {
    const current = stock.get(item.productId) ?? 0
    const decrement = Math.min(item.quantity, Math.max(0, current))
    const remaining = current - decrement
    stock.set(item.productId, remaining)
    return { productId: item.productId, decrement, remaining }
  })
}
