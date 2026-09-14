import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { DeskShell } from '../../../components/vendor/DeskShell'
import { KycBanner } from '../../../components/vendor/KycBanner'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

const steps = ['Personal details', 'ID upload', 'Bank verification']

export default function VendorVerifyScreen() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const colors = palettes[useThemeStore((state) => state.mode)]
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    requestedTier: 'ACTIVE_VENDOR' as 'ACTIVE_VENDOR' | 'ENTERPRISE',
    identityType: 'SA_ID_CARD',
    legalName: '',
    idNumber: '',
    residentialAddress: '',
    idDocumentName: '',
    addressDocumentName: '',
    selfieCaptured: true,
    cipcDocumentName: '',
    taxNumber: '',
    vatNumber: '',
    bankProofName: '',
  })
  const kyc = useQuery({ queryKey: ['vendor-kyc', token], queryFn: () => api.kyc.me(token!), enabled: Boolean(token) })
  const submit = useMutation({
    mutationFn: () =>
      api.kyc.submit(
        {
          ...form,
          cipcDocumentName: form.requestedTier === 'ENTERPRISE' ? form.cipcDocumentName : undefined,
          taxNumber: form.requestedTier === 'ENTERPRISE' ? form.taxNumber : undefined,
          vatNumber: form.vatNumber || undefined,
          bankProofName: form.requestedTier === 'ENTERPRISE' ? form.bankProofName : undefined,
        },
        token!,
      ),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['vendor-kyc'] }),
  })

  return (
    <DeskShell title="Verify account">
      <KycBanner kyc={kyc.data} />
      <View className="flex-row mb-5">
        {steps.map((label, index) => (
          <Pressable key={label} onPress={() => setStep(index)} className={`flex-1 mr-2 rounded-full py-2 ${step === index ? 'bg-brand' : 'bg-panel'}`}>
            <Text className={`text-center text-xs ${step === index ? 'text-white' : 'text-mute'}`}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {step === 0 ? (
        <View>
          <Pressable className="mb-3" onPress={() => setForm({ ...form, requestedTier: form.requestedTier === 'ENTERPRISE' ? 'ACTIVE_VENDOR' : 'ENTERPRISE' })}>
            <Text className="text-glow">Tier: {form.requestedTier === 'ENTERPRISE' ? 'Enterprise' : 'Active Vendor'}</Text>
          </Pressable>
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Legal name" placeholderTextColor={colors.mute} value={form.legalName} onChangeText={(legalName) => setForm({ ...form, legalName })} />
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="ID number" placeholderTextColor={colors.mute} value={form.idNumber} onChangeText={(idNumber) => setForm({ ...form, idNumber })} />
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Residential address" placeholderTextColor={colors.mute} value={form.residentialAddress} onChangeText={(residentialAddress) => setForm({ ...form, residentialAddress })} />
        </View>
      ) : null}
      {step === 1 ? (
        <View>
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="ID document filename" placeholderTextColor={colors.mute} value={form.idDocumentName} onChangeText={(idDocumentName) => setForm({ ...form, idDocumentName })} />
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Proof of address filename" placeholderTextColor={colors.mute} value={form.addressDocumentName} onChangeText={(addressDocumentName) => setForm({ ...form, addressDocumentName })} />
          <Text className="text-mute text-sm">Selfie is marked captured on this preview build.</Text>
        </View>
      ) : null}
      {step === 2 ? (
        <View>
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="CIPC document" placeholderTextColor={colors.mute} value={form.cipcDocumentName} onChangeText={(cipcDocumentName) => setForm({ ...form, cipcDocumentName })} />
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Tax number" placeholderTextColor={colors.mute} value={form.taxNumber} onChangeText={(taxNumber) => setForm({ ...form, taxNumber })} />
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="VAT number" placeholderTextColor={colors.mute} value={form.vatNumber} onChangeText={(vatNumber) => setForm({ ...form, vatNumber })} />
          <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Bank proof filename" placeholderTextColor={colors.mute} value={form.bankProofName} onChangeText={(bankProofName) => setForm({ ...form, bankProofName })} />
        </View>
      ) : null}
      <Pressable className="rounded-full bg-brand py-3 mt-5" onPress={() => (step < 2 ? setStep(step + 1) : submit.mutate())} disabled={submit.isPending}>
        <Text className="text-white text-center font-semibold">{step < 2 ? 'Next' : submit.isPending ? 'Submitting…' : 'Submit for review'}</Text>
      </Pressable>
    </DeskShell>
  )
}
