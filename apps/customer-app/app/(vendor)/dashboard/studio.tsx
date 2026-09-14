import { useMemo, useState } from 'react'
import { Image, Pressable, Text, TextInput, View } from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatMoney, type GenerationAssetType } from '@shopping-mall/shared-types'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { DeskShell } from '../../../components/vendor/DeskShell'
import { KycActionNotice, KycBanner } from '../../../components/vendor/KycBanner'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

export default function VendorStudioScreen() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const colors = palettes[useThemeStore((state) => state.mode)]
  const [assetType, setAssetType] = useState<GenerationAssetType>('LOGO')
  const [prompt, setPrompt] = useState('Minimal electric-blue mark for a premium marketplace shop named MMall Studio')
  const [message, setMessage] = useState('')

  const kyc = useQuery({ queryKey: ['vendor-kyc', token], queryFn: () => api.kyc.me(token!), enabled: Boolean(token) })
  const quotaData = useQuery({ queryKey: ['studio-quota', token], queryFn: () => api.studio.quota(token!), enabled: Boolean(token) })
  const jobsData = useQuery({ queryKey: ['studio-jobs', token], queryFn: () => api.studio.jobs(token!), enabled: Boolean(token) })
  const pricing = useQuery({ queryKey: ['vendor-pricing', token], queryFn: () => api.vendors.pricing(token!), enabled: Boolean(token) })

  const quota = quotaData.data?.items.find((item) => item.assetType === assetType)
  const jobs = useMemo(
    () => (jobsData.data?.items ?? []).filter((job) => job.assetType === assetType),
    [jobsData.data, assetType],
  )

  const generate = useMutation({
    mutationFn: () => api.studio.generate({ assetType, prompt }, token!),
    onSuccess: (result) => {
      setMessage(result.job.billedAs === 'FREE' ? 'Used one free generation.' : 'Charged one paid credit.')
      void queryClient.invalidateQueries({ queryKey: ['studio-quota'] })
      void queryClient.invalidateQueries({ queryKey: ['studio-jobs'] })
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Failed'),
  })
  const topup = useMutation({
    mutationFn: (quantity: number) => api.studio.topup({ assetType, quantity }, token!),
    onSuccess: (result) => {
      setMessage(`Added credits. Charged ${formatMoney(result.charged, result.currency)}.`)
      void queryClient.invalidateQueries({ queryKey: ['studio-quota'] })
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Failed'),
  })
  const apply = useMutation({
    mutationFn: (jobId: string) => api.studio.apply({ jobId }, token!),
    onSuccess: () => setMessage(assetType === 'LOGO' ? 'Applied as store logo.' : 'Applied as store banner.'),
  })

  return (
    <DeskShell title="AI Studio">
      <KycBanner kyc={kyc.data} />
      {generate.isError ? <KycActionNotice error={generate.error} /> : null}
      <View className="flex-row mb-4">
        {(['LOGO', 'BANNER'] as const).map((type) => (
          <Pressable key={type} onPress={() => setAssetType(type)} className={`mr-2 rounded-full px-4 py-2 ${assetType === type ? 'bg-brand' : 'bg-panel'}`}>
            <Text className={assetType === type ? 'text-white' : 'text-ice'}>{type === 'LOGO' ? 'Logo' : 'Banner'}</Text>
          </Pressable>
        ))}
      </View>
      <View className="flex-row mb-4">
        <View className="flex-1 bg-panel rounded-2xl p-4 mr-2">
          <Text className="text-mute text-xs">Free remaining</Text>
          <Text className="text-ice text-xl font-bold">{quota?.freeRemaining ?? 5}/{quota?.freeLimit ?? 5}</Text>
        </View>
        <View className="flex-1 bg-panel rounded-2xl p-4">
          <Text className="text-mute text-xs">Paid credits</Text>
          <Text className="text-ice text-xl font-bold">{quota?.paidCredits ?? 0}</Text>
        </View>
      </View>
      <TextInput
        className="bg-panel rounded-2xl px-4 py-3 text-ice min-h-[96px] mb-3"
        multiline
        value={prompt}
        onChangeText={setPrompt}
        placeholderTextColor={colors.mute}
      />
      <Pressable className="rounded-full bg-brand py-3 mb-2" onPress={() => generate.mutate()} disabled={generate.isPending}>
        <Text className="text-white text-center font-semibold">Generate</Text>
      </Pressable>
      <Pressable className="mb-4" onPress={() => topup.mutate(1)}>
        <Text className="text-glow">Top up 1 credit · {formatMoney(pricing.data?.logoGenerationPrice ?? 299)}</Text>
      </Pressable>
      {message ? <Text className="text-mute mb-3">{message}</Text> : null}
      {jobs.map((job) => (
        <View key={job.id} className="bg-panel rounded-2xl p-4 mb-3">
          {job.imageUrl ? <Image source={{ uri: job.imageUrl }} className="w-full h-36 rounded-xl bg-navy mb-3" /> : null}
          <Text className="text-ice">{job.prompt}</Text>
          <Pressable className="mt-2" onPress={() => apply.mutate(job.id)}>
            <Text className="text-glow">Apply to store</Text>
          </Pressable>
        </View>
      ))}
    </DeskShell>
  )
}
