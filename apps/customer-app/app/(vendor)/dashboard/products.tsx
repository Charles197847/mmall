import { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatMoney } from '@shopping-mall/shared-types'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { mallCategories } from '../../../lib/mallCategories'
import { DeskShell } from '../../../components/vendor/DeskShell'
import { KycActionNotice, KycBanner } from '../../../components/vendor/KycBanner'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

export default function VendorProductsScreen() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const colors = palettes[useThemeStore((state) => state.mode)]
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<unknown>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '199',
    comparePrice: '',
    inventory: '24',
    category: 'Fashion',
    tags: '',
    images: '',
    isActive: true,
  })

  const kyc = useQuery({
    queryKey: ['vendor-kyc', token],
    queryFn: () => api.kyc.me(token!),
    enabled: Boolean(token),
  })
  const products = useQuery({
    queryKey: ['vendor-products', token],
    queryFn: () => api.vendors.products.list(token!),
    enabled: Boolean(token),
  })

  const create = useMutation({
    mutationFn: () =>
      api.vendors.products.create(
        {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
          inventory: Number(form.inventory),
          category: form.category,
          tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          images: form.images ? [form.images] : [],
          isActive: form.isActive,
        },
        token!,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
      setOpen(false)
      setFormError(null)
    },
    onError: (error) => setFormError(error),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.vendors.products.delete(id, token!),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['vendor-products'] }),
  })

  return (
    <DeskShell title="Products">
      <KycBanner kyc={kyc.data} />
      {formError ? <KycActionNotice error={formError} /> : null}
      <Pressable className="rounded-full bg-brand py-3 mb-5" onPress={() => setOpen((value) => !value)}>
        <Text className="text-white text-center font-semibold">{open ? 'Close form' : 'Add product'}</Text>
      </Pressable>
      {open ? (
        <View className="bg-panel rounded-2xl p-4 mb-6">
          <TextInput className="bg-navy rounded-xl px-3 py-3 text-ice mb-2" placeholder="Name" placeholderTextColor={colors.mute} value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
          <TextInput className="bg-navy rounded-xl px-3 py-3 text-ice mb-2" placeholder="Description" placeholderTextColor={colors.mute} value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
          <TextInput className="bg-navy rounded-xl px-3 py-3 text-ice mb-2" keyboardType="numeric" placeholder="Price" placeholderTextColor={colors.mute} value={form.price} onChangeText={(price) => setForm({ ...form, price })} />
          <TextInput className="bg-navy rounded-xl px-3 py-3 text-ice mb-2" keyboardType="numeric" placeholder="Compare price" placeholderTextColor={colors.mute} value={form.comparePrice} onChangeText={(comparePrice) => setForm({ ...form, comparePrice })} />
          <TextInput className="bg-navy rounded-xl px-3 py-3 text-ice mb-2" keyboardType="numeric" placeholder="Inventory" placeholderTextColor={colors.mute} value={form.inventory} onChangeText={(inventory) => setForm({ ...form, inventory })} />
          <Text className="text-mute text-xs mb-2">Category</Text>
          <View className="flex-row flex-wrap mb-2">
            {mallCategories.slice(0, 8).map((item) => (
              <Pressable key={item.name} className={`rounded-full px-3 py-1 mr-2 mb-2 ${form.category === item.name ? 'bg-brand' : 'bg-navy'}`} onPress={() => setForm({ ...form, category: item.name })}>
                <Text className={form.category === item.name ? 'text-white text-xs' : 'text-ice text-xs'}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput className="bg-navy rounded-xl px-3 py-3 text-ice mb-2" placeholder="Tags, comma separated" placeholderTextColor={colors.mute} value={form.tags} onChangeText={(tags) => setForm({ ...form, tags })} />
          <TextInput className="bg-navy rounded-xl px-3 py-3 text-ice mb-3" placeholder="Image URL" placeholderTextColor={colors.mute} value={form.images} onChangeText={(images) => setForm({ ...form, images })} />
          <Pressable className="mb-3" onPress={() => setForm({ ...form, isActive: !form.isActive })}>
            <Text className="text-glow">{form.isActive ? 'Publish live on the mall' : 'Save as draft'}</Text>
          </Pressable>
          <Pressable className="rounded-full bg-brand py-3" onPress={() => create.mutate()} disabled={create.isPending}>
            <Text className="text-white text-center font-semibold">{create.isPending ? 'Saving…' : 'Save product'}</Text>
          </Pressable>
        </View>
      ) : null}
      {(products.data?.items ?? []).map((product) => (
        <View key={product.id} className="bg-panel rounded-2xl p-4 mb-3">
          <Text className="text-ice font-semibold">{product.name}</Text>
          <Text className="text-mute text-sm mt-1">{formatMoney(product.price)} · {product.inventory} in stock</Text>
          <Pressable className="mt-2" onPress={() => Alert.alert('Delete', 'Remove this listing?', [{ text: 'Cancel' }, { text: 'Delete', onPress: () => remove.mutate(product.id) }])}>
            <Text className="text-signal">Delete</Text>
          </Pressable>
        </View>
      ))}
      {!products.data?.items?.length ? <Text className="text-mute">No products yet.</Text> : null}
    </DeskShell>
  )
}
