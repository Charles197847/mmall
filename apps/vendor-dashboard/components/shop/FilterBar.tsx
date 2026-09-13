'use client'

import { useEffect, useRef, useState } from 'react'
import { subcategoryRows } from '../../lib/filterCatalog'
import { useShopFilter } from '../../lib/ShopFilterProvider'
import {
  categoryOptions,
  isDefaultShopFilter,
  priceOptions,
  reachOptions,
  shopFilterSummary,
  sortOptions,
} from '../../lib/shopFilters'

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? 'bg-brand text-white' : 'bg-black/5 text-ice hover:bg-black/10'
      }`}
    >
      {children}
    </button>
  )
}

function parseRand(value: string) {
  const amount = Number(value)
  if (!value.trim() || !Number.isFinite(amount) || amount < 0) return null
  return Math.round(amount)
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

export function FilterBar() {
  const { filter, setFilter, clear } = useShopFilter()
  const [open, setOpen] = useState(false)
  const [openShops, setOpenShops] = useState('')
  const [minText, setMinText] = useState(filter.min != null ? String(filter.min) : '')
  const [maxText, setMaxText] = useState(filter.max != null ? String(filter.max) : '')
  const closeRef = useRef<HTMLButtonElement>(null)
  const summary = shopFilterSummary(filter)
  const rows = filter.category ? subcategoryRows(filter.category) : []

  useEffect(() => {
    setMinText(filter.min != null ? String(filter.min) : '')
    setMaxText(filter.max != null ? String(filter.max) : '')
  }, [filter.min, filter.max])

  useEffect(() => {
    setOpenShops('')
  }, [filter.category])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open])

  function applyCustom() {
    let min = parseRand(minText)
    let max = parseRand(maxText)
    if (min != null && max != null && min > max) {
      const swap = min
      min = max
      max = swap
      setMinText(String(min))
      setMaxText(String(max))
    }
    setFilter({ price: 'custom', min, max })
  }

  function toggleShop(subcategory: string, shopId: string) {
    const current = filter.subcategory === subcategory ? filter.shops : []
    const shops = current.includes(shopId) ? current.filter((id) => id !== shopId) : [...current, shopId]
    setFilter({ subcategory, shops })
  }

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Filter</h2>
          <p className="text-sm text-mute">
            {summary.length ? summary.join(' · ') : 'Open the menu to filter the listings below.'}
          </p>
        </div>
        {isDefaultShopFilter(filter) ? null : (
          <button type="button" onClick={clear} className="text-sm font-semibold text-glow">
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-ice hover:bg-black/10"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Open filters"
        >
          <HamburgerIcon />
        </button>
        {categoryOptions.map((option) => (
          <Chip
            key={option.id}
            active={filter.category === option.id}
            onClick={() => setFilter({ category: filter.category === option.id ? '' : option.id })}
          >
            <span aria-hidden>{option.icon}</span> {option.label}
          </Chip>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mm-filter-title"
            className="relative z-10 flex h-[62vh] min-h-[50vh] max-h-[75vh] w-[min(68rem,92%)] flex-col rounded-2xl bg-[rgb(var(--mm-navy))] p-6 text-ice shadow-2xl ring-1 ring-[var(--mm-card-border)]"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 id="mm-filter-title" className="text-2xl font-semibold">
                  Filter
                </h3>
                <p className="mt-1 text-sm text-mute">Pick a category, then shops, then price and sort.</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-ice hover:bg-black/10"
                aria-label="Close filters"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
              <div>
                <p className="mb-3 text-sm font-semibold">Category</p>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!filter.category} onClick={() => setFilter({ category: '' })}>
                    All
                  </Chip>
                  {categoryOptions.map((option) => (
                    <Chip
                      key={option.id}
                      active={filter.category === option.id}
                      onClick={() => setFilter({ category: option.id })}
                    >
                      <span aria-hidden>{option.icon}</span> {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {rows.length ? (
                <div>
                  <p className="mb-3 text-sm font-semibold">Subcategories in {filter.category}</p>
                  <div className="overflow-hidden rounded-xl ring-1 ring-[var(--mm-card-border)]">
                    {rows.map((row) => (
                      <div key={row.name} className="border-b border-[var(--mm-card-border)] last:border-b-0">
                        <div className="flex items-center justify-between gap-4 px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setFilter({
                                subcategory: filter.subcategory === row.name ? '' : row.name,
                              })
                            }
                            className={`text-left text-sm font-medium ${
                              filter.subcategory === row.name ? 'text-glow' : 'text-ice'
                            }`}
                          >
                            {row.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenShops((current) => (current === row.name ? '' : row.name))}
                            className="shrink-0 rounded-full bg-black/5 px-3 py-1 text-sm font-semibold text-glow"
                          >
                            {row.shops.length} {row.shops.length === 1 ? 'shop' : 'shops'}
                          </button>
                        </div>
                        {openShops === row.name ? (
                          <div className="flex flex-wrap gap-3 px-4 pb-4">
                            {row.shops.map((shop) => {
                              const checked = filter.subcategory === row.name && filter.shops.includes(shop.id)
                              return (
                                <label
                                  key={shop.id}
                                  className={`flex cursor-pointer items-center gap-2 rounded-full bg-black/5 px-2 py-1.5 ${
                                    checked ? 'ring-2 ring-glow' : ''
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleShop(row.name, shop.id)}
                                    className="h-4 w-4 accent-[rgb(var(--mm-brand))]"
                                  />
                                  <span
                                    className="h-8 w-8 rounded-full bg-cover bg-center"
                                    style={{ backgroundImage: shop.logo ? `url(${shop.logo})` : undefined }}
                                  />
                                  <span className="pr-1 text-sm">{shop.storeName}</span>
                                </label>
                              )
                            })}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <p className="mb-3 text-sm font-semibold">Sort</p>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <Chip
                      key={option.id}
                      active={filter.sort === option.id}
                      onClick={() => setFilter({ sort: option.id })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold">Price</p>
                <div className="flex flex-wrap items-center gap-2">
                  {priceOptions.map((option) => (
                    <Chip
                      key={option.id}
                      active={filter.price === option.id}
                      onClick={() => setFilter({ price: option.id })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                  {filter.price === 'custom' ? (
                    <form
                      className="flex flex-wrap items-center gap-2"
                      onSubmit={(event) => {
                        event.preventDefault()
                        applyCustom()
                      }}
                    >
                      <label className="sr-only" htmlFor="mm-price-min">
                        Minimum price
                      </label>
                      <input
                        id="mm-price-min"
                        inputMode="numeric"
                        placeholder="Min"
                        value={minText}
                        onChange={(event) => setMinText(event.target.value)}
                        className="w-28 rounded-full bg-black/5 px-3 py-1.5 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
                      />
                      <span className="text-xs text-mute">to</span>
                      <label className="sr-only" htmlFor="mm-price-max">
                        Maximum price
                      </label>
                      <input
                        id="mm-price-max"
                        inputMode="numeric"
                        placeholder="Max"
                        value={maxText}
                        onChange={(event) => setMaxText(event.target.value)}
                        className="w-28 rounded-full bg-black/5 px-3 py-1.5 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
                      />
                      <button type="submit" className="text-sm font-semibold text-glow">
                        Apply
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold">From</p>
                <div className="flex flex-wrap gap-2">
                  {reachOptions.map((option) => (
                    <Chip
                      key={option.id}
                      active={filter.reach === option.id}
                      onClick={() => setFilter({ reach: option.id })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-4 border-t border-[var(--mm-card-border)] pt-4">
              {isDefaultShopFilter(filter) ? null : (
                <button type="button" onClick={clear} className="text-sm font-semibold text-mute">
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
