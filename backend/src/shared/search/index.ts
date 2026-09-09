import { Client } from '@elastic/elasticsearch'

const node = process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200'

export const elasticsearch = new Client({ node })

export const PRODUCT_INDEX = 'products'

export async function ensureProductIndex() {
  const exists = await elasticsearch.indices.exists({ index: PRODUCT_INDEX })
  if (exists) return

  await elasticsearch.indices.create({
    index: PRODUCT_INDEX,
    mappings: {
      properties: {
        id: { type: 'keyword' },
        vendorId: { type: 'keyword' },
        name: { type: 'text' },
        description: { type: 'text' },
        category: { type: 'keyword' },
        tags: { type: 'keyword' },
        price: { type: 'float' },
        isActive: { type: 'boolean' },
      },
    },
  })
}
