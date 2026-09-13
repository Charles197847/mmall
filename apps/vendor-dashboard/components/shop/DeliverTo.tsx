'use client'

import { useMemo, useState } from 'react'
import { searchSaPlaces } from '@shopping-mall/shared-types'
import { useShopperArea } from '../../lib/useShopperArea'
import { persistShopperArea } from '../../lib/persistShopperArea'
import { areaFromQuery, requestDeviceArea, writeShopperArea } from '../../lib/shopperLocation'

export function DeliverTo() {
  const area = useShopperArea()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const matches = useMemo(() => searchSaPlaces(query), [query])

  async function useDevice() {
    setError('')
    setLocating(true)
    try {
      await persistShopperArea(await requestDeviceArea())
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read location.')
    } finally {
      setLocating(false)
    }
  }

  function choose(cityQuery: string) {
    const next = areaFromQuery(cityQuery)
    if (!next) {
      setError('Choose a South African suburb or postcode.')
      return
    }
    void persistShopperArea(next)
    setOpen(false)
    setQuery('')
    setError('')
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-left">
        <span className="block text-[10px] tracking-wide text-mute">Deliver to</span>
        <span className="block max-w-36 truncate text-sm font-semibold">
          {area ? `${area.city} ${area.postalCode}` : 'South Africa'}
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close deliver to"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-[rgb(var(--mm-navy))] p-5 shadow-xl">
            <p className="text-lg font-semibold">Where should we deliver?</p>
            <p className="mt-1 text-sm text-mute">
              We only keep a suburb or postcode so nearby shops show first. The rest of South Africa stays visible.
            </p>
            <button
              type="button"
              onClick={useDevice}
              className="mt-4 w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white"
            >
              {locating ? 'Finding you…' : 'Use my location'}
            </button>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') choose(query)
              }}
              placeholder="Suburb or postcode, e.g. Sandton or 2196"
              className="mt-3 w-full rounded-lg bg-black/5 px-3 py-2 text-sm"
            />
            <ul className="mt-3 max-h-56 space-y-1 overflow-auto">
              {matches.map((place) => (
                <li key={`${place.city}-${place.postalCode}`}>
                  <button
                    type="button"
                    onClick={() => choose(place.city)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5"
                  >
                    <span className="font-medium">{place.city}</span>
                    <span className="ml-2 text-mute">
                      {place.postalCode} · {place.province}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {error ? <p className="mt-2 text-sm text-mute">{error}</p> : null}
            {area ? (
              <button
                type="button"
                className="mt-3 text-sm text-mute"
                onClick={() => {
                  writeShopperArea(null)
                  setOpen(false)
                }}
              >
                Clear and show all of South Africa
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
