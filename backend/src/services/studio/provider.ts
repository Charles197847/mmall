import type { GenerationAssetType } from '@shopping-mall/shared-types'

type GeneratedImage = {
  url: string
  provider: string
}

function sizeFor(assetType: GenerationAssetType) {
  return assetType === 'LOGO' ? { width: 1024, height: 1024, openai: '1024x1024' } : { width: 1792, height: 1024, openai: '1792x1024' }
}

function styledPrompt(prompt: string, assetType: GenerationAssetType) {
  if (assetType === 'LOGO') {
    return `Professional high-resolution vector logo, clean geometric mark, balanced negative space, no watermarks, no mockups. Brand brief: ${prompt}`
  }
  return `Professional high-resolution advertising banner, marketplace quality, cinematic lighting, no watermarks. Creative brief: ${prompt}`
}

async function generateWithOpenAI(prompt: string, assetType: GenerationAssetType): Promise<GeneratedImage> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY missing')
  const size = sizeFor(assetType)
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? 'dall-e-3',
      prompt,
      n: 1,
      size: size.openai,
      quality: 'hd',
    }),
  })
  const data = (await response.json()) as { error?: { message?: string }; data?: Array<{ url?: string }> }
  if (!response.ok || !data.data?.[0]?.url) {
    throw new Error(data.error?.message ?? 'OpenAI image generation failed')
  }
  return { url: data.data[0].url, provider: 'openai' }
}

async function generateWithRecraft(prompt: string, assetType: GenerationAssetType): Promise<GeneratedImage> {
  const key = process.env.RECRAFT_API_KEY
  if (!key) throw new Error('RECRAFT_API_KEY missing')
  const size = sizeFor(assetType)
  const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      style: assetType === 'LOGO' ? 'vector_illustration' : 'digital_illustration',
      size: `${size.width}x${size.height}`,
    }),
  })
  const data = (await response.json()) as { data?: Array<{ url?: string }>; message?: string }
  const url = data.data?.[0]?.url
  if (!response.ok || !url) {
    throw new Error(data.message ?? 'Recraft image generation failed')
  }
  return { url, provider: 'recraft' }
}

async function generateWithIdeogram(prompt: string, assetType: GenerationAssetType): Promise<GeneratedImage> {
  const key = process.env.IDEOGRAM_API_KEY
  if (!key) throw new Error('IDEOGRAM_API_KEY missing')
  const response = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    headers: {
      'Api-Key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_request: {
        prompt,
        aspect_ratio: assetType === 'LOGO' ? 'ASPECT_1_1' : 'ASPECT_16_9',
        model: 'V_2',
        magic_prompt_option: 'AUTO',
      },
    }),
  })
  const data = (await response.json()) as { data?: Array<{ url?: string }>; message?: string }
  const url = data.data?.[0]?.url
  if (!response.ok || !url) {
    throw new Error(data.message ?? 'Ideogram image generation failed')
  }
  return { url, provider: 'ideogram' }
}

function generateWithPollinations(prompt: string, assetType: GenerationAssetType): GeneratedImage {
  const size = sizeFor(assetType)
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${size.width}&height=${size.height}&nologo=true&model=flux&seed=${Date.now()}`
  return { url, provider: 'pollinations' }
}

export async function generateAssetImage(prompt: string, assetType: GenerationAssetType): Promise<GeneratedImage> {
  const styled = styledPrompt(prompt, assetType)
  const providers = [
    process.env.OPENAI_API_KEY ? () => generateWithOpenAI(styled, assetType) : null,
    process.env.RECRAFT_API_KEY ? () => generateWithRecraft(styled, assetType) : null,
    process.env.IDEOGRAM_API_KEY ? () => generateWithIdeogram(styled, assetType) : null,
  ].filter(Boolean) as Array<() => Promise<GeneratedImage>>

  for (const provider of providers) {
    try {
      return await provider()
    } catch (error) {
      console.warn('Image provider failed, trying next', error)
    }
  }

  return generateWithPollinations(styled, assetType)
}
