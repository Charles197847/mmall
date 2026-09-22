import type { Product } from '@shopping-mall/shared-types'

export function ProductTable({
  products,
  onEdit,
  onDelete,
}: {
  products?: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto">
    <table className="min-w-[40rem] w-full bg-white rounded-lg shadow">
      <thead>
        <tr className="border-b text-left">
          <th className="p-3">Product</th>
          <th className="p-3">Price</th>
          <th className="p-3">Inventory</th>
          <th className="p-3">Status</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {(products ?? []).map((product) => (
          <tr key={product.id} className="border-b">
            <td className="p-3">
              <div className="flex items-center gap-3">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover bg-slate-100" />
                ) : (
                  <div className="w-12 h-12 rounded bg-slate-100" />
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.category}</p>
                </div>
              </div>
            </td>
            <td className="p-3">R{product.price.toFixed(2)}</td>
            <td className="p-3">{product.inventory}</td>
            <td className="p-3">{product.isActive ? 'Active' : 'Hidden'}</td>
            <td className="p-3 space-x-3">
              <button type="button" className="text-blue-600" onClick={() => onEdit(product)}>
                Edit
              </button>
              <button type="button" className="text-red-600" onClick={() => onDelete(product.id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}
