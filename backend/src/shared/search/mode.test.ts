import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { searchProvider } from './mode.js'

describe('search provider', () => {
  it('defaults to elasticsearch so local docker keeps the current index', () => {
    assert.equal(searchProvider({}), 'elasticsearch')
    assert.equal(searchProvider({ ELASTICSEARCH_URL: 'http://localhost:9200' }), 'elasticsearch')
  })

  it('uses postgres when SEARCH_PROVIDER asks for it', () => {
    assert.equal(searchProvider({ SEARCH_PROVIDER: 'postgres' }), 'postgres')
    assert.equal(searchProvider({ SEARCH_PROVIDER: 'PostgreSQL' }), 'postgres')
    assert.equal(searchProvider({ SEARCH_PROVIDER: 'elasticsearch' }), 'elasticsearch')
  })
})
