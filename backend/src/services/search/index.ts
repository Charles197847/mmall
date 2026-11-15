import { Router } from 'express'
import { prisma } from '../../shared/database/index.js'
import { asyncHandler } from '../../shared/middleware/error.js'
import { elasticsearch, PRODUCT_INDEX, ensureProductIndex } from '../../shared/search/index.js'
import { usePostgresSearch } from '../../shared/search/mode.js'
import { registerJob } from '../../shared/queue/index.js'

const router = Router()

async function searchProductsInPostgres(q: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 20,
  })
}

async function indexProduct(productId: string) {
  if (usePostgresSearch()) return
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return
  await ensureProductIndex()
  await elasticsearch.index({
    index: PRODUCT_INDEX,
    id: product.id,
    document: {
      id: product.id,
      vendorId: product.vendorId,
      name: product.name,
      description: product.description,
      category: product.category,
      tags: product.tags,
      price: product.price,
      isActive: product.isActive,
    },
  })
}

registerJob('search:index-product', async (job) => indexProduct(job.data.productId))
registerJob('search:update-product', async (job) => indexProduct(job.data.productId))
registerJob('search:delete-product', async (job) => {
  if (usePostgresSearch()) return
  await elasticsearch.delete({ index: PRODUCT_INDEX, id: job.data.productId }, { ignore: [404] })
})

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === 'string' ? req.query.q : ''
    if (!q) {
      return res.json({ items: [] })
    }

    if (usePostgresSearch()) {
      const products = await searchProductsInPostgres(q)
      return res.json({ items: products, source: 'postgres' })
    }

    try {
      const result = await elasticsearch.search({
        index: PRODUCT_INDEX,
        query: {
          multi_match: {
            query: q,
            fields: ['name^3', 'description', 'tags', 'category'],
          },
        },
      })
      const items = result.hits.hits.map((hit) => hit._source)
      res.json({ items, source: 'elasticsearch' })
    } catch {
      const products = await searchProductsInPostgres(q)
      res.json({ items: products, source: 'postgres', fallback: true })
    }
  }),
)

export default router
