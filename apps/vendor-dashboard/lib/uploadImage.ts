export async function uploadImage(file: File): Promise<string> {
  const key = process.env.NEXT_PUBLIC_IMGBB_API_KEY
  if (!key) {
    throw new Error('Add NEXT_PUBLIC_IMGBB_API_KEY to upload files, or paste an image URL instead.')
  }

  const formData = new FormData()
  formData.append('image', file)
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
    method: 'POST',
    body: formData,
  })
  const data = (await response.json()) as { success?: boolean; data?: { url?: string }; error?: { message?: string } }
  if (!data.success || !data.data?.url) {
    throw new Error(data.error?.message ?? 'Upload failed')
  }
  return data.data.url
}
