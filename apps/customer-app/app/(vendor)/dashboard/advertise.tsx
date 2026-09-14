import { useMemo, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatMoney, type AdSlot } from '@shopping-mall/shared-types'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { DeskShell } from '../../../components/vendor/DeskShell'
import { KycActionNotice, KycBanner } from '../../../components/vendor/KycBanner'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

const slots: Array<{ id: AdSlot; label: string; hint: string }> = [
  { id: 'HOMEPAGE_BANNER', label: 'Homepage banner', hint: 'R1,500 / week' },
  { id: 'SEARCH_FEATURE', label: 'Search result feature', hint: 'R900 / week' },
  { id: 'SHOP_HIGHLIGHT', label: 'In-app shop highlight', hint: 'R600 / week' },
  { id: 'PUSH_BLAST', label: 'Targeted push blast', hint: 'R5,000–R10,000 for 200k users' },
]

function localInput(date: Date) {
  return date.toISOString().slice(0, 16)
}

export default function VendorAdvertiseScreen() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const colors = palettes[useThemeStore((state) => state.mode)]
  const start = useMemo(() => new Date(), [])
  const end = useMemo(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), [])
  const [slot, setSlot] = useState<AdSlot>('HOMEPAGE_BANNER')
  const [title, setTitle] = useState('')
  const [headline, setHeadline] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [startsAt, setStartsAt] = useState(localInput(start))
  const [endsAt, setEndsAt] = useState(localInput(end))
  const [message, setMessage] = useState('')

  const kyc = useQuery({ queryKey: ['vendor-kyc', token], queryFn: () => api.kyc.me(token!), enabled: Boolean(token) })
  const campaigns = useQuery({ queryKey: ['vendor-ads', token], queryFn: () => api.ads.mine(token!), enabled: Boolean(token) })
  const jobs = useQuery({ queryKey: ['studio-jobs', token], queryFn: () => api.studio.jobs(token!), enabled: Boolean(token) })

  const create = useMutation({
    mutationFn: () =>
      api.ads.create(
        {
          slot,
          title,
          headline: headline || undefined,
          imageUrl: imageUrl || jobs.data?.items[0]?.imageUrl,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
        },
        token!,
      ),
    onSuccess: () => {
      setMessage('Draft saved. Purchase to activate the campaign.')
      setTitle('')
      void queryClient.invalidateQueries({ queryKey: ['vendor-ads'] })
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Failed'),
  })
  const purchase = useMutation({
    mutationFn: (id: string) => api.ads.purchase(id, token!),
    onSuccess: () => {
      setMessage('Campaign purchased and scheduled.')
      void queryClient.invalidateQueries({ queryKey: ['vendor-ads'] })
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Failed'),
  })

  return (
    <DeskShell title="Advertise">
      <KycBanner kyc={kyc.data} />
      {create.isError ? <KycActionNotice error={create.error} /> : null}
      {slots.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => setSlot(item.id)}
          className={`rounded-2xl p-4 mb-3 ${slot === item.id ? 'bg-brand' : 'bg-panel'}`}
        >
          <Text className={slot === item.id ? 'text-white font-semibold' : 'text-ice font-semibold'}>{item.label}</Text>
          <Text className={slot === item.id ? 'text-white/80 text-sm mt-1' : 'text-mute text-sm mt-1'}>{item.hint}</Text>
        </Pressable>
      ))}
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Campaign title" placeholderTextColor={colors.mute} value={title} onChangeText={setTitle} />
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Headline" placeholderTextColor={colors.mute} value={headline} onChangeText={setHeadline} />
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Image URL or studio creative" placeholderTextColor={colors.mute} value={imageUrl} onChangeText={setImageUrl} />
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Starts at" placeholderTextColor={colors.mute} value={startsAt} onChangeText={setStartsAt} />
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-3" placeholder="Ends at" placeholderTextColor={colors.mute} value={endsAt} onChangeText={setEndsAt} />
      <Pressable className="rounded-full bg-brand py-3" onPress={() => create.mutate()} disabled={!title || create.isPending}>
        <Text className="text-white text-center font-semibold">Save draft</Text>
      </Pressable>
      {message ? <Text className="text-mute mt-3">{message}</Text> : null}
      {(campaigns.data?.items ?? []).map((campaign) => (
        <View key={campaign.id} className="bg-panel rounded-2xl p-4 mt-4">
          <Text className="text-ice font-semibold">{campaign.title}</Text>
          <Text className="text-mute text-sm mt-1">{campaign.slot} · {campaign.status}</Text>
          {campaign.status === 'DRAFT' ? (
            <Pressable className="mt-3" onPress={() => purchase.mutate(campaign.id)}>
              <Text className="text-glow">Purchase · {formatMoney(0)}</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
    </DeskShell>
  )
}
