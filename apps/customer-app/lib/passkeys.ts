import { Platform } from 'react-native'

export function passkeysAvailable() {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential === 'function'
  )
}

function b64urlToBuf(value: string) {
  const pad = '='.repeat((4 - (value.length % 4)) % 4)
  const bin = atob((value + pad).replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

function bufToB64url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let bin = ''
  bytes.forEach((byte) => {
    bin += String.fromCharCode(byte)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function toPublicKey(options: Record<string, unknown>): PublicKeyCredentialCreationOptions | PublicKeyCredentialRequestOptions {
  const challenge = b64urlToBuf(String(options.challenge))
  const allow = (options.allowCredentials ?? options.excludeCredentials) as Array<{ id: string; type?: string; transports?: string[] }> | undefined
  const mapped = allow?.map((item) => ({
    type: (item.type as PublicKeyCredentialType) ?? 'public-key',
    id: b64urlToBuf(item.id),
    transports: item.transports as AuthenticatorTransport[] | undefined,
  }))
  const user = options.user as { id: string; name: string; displayName: string } | undefined
  if (user) {
    return {
      ...options,
      challenge,
      user: { ...user, id: b64urlToBuf(user.id) },
      excludeCredentials: mapped,
    } as PublicKeyCredentialCreationOptions
  }
  return {
    ...options,
    challenge,
    allowCredentials: mapped,
  } as PublicKeyCredentialRequestOptions
}

function serializeAssertion(cred: PublicKeyCredential) {
  const response = cred.response as AuthenticatorAttestationResponse & AuthenticatorAssertionResponse
  return {
    id: cred.id,
    rawId: bufToB64url(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: bufToB64url(response.clientDataJSON),
      attestationObject: response.attestationObject ? bufToB64url(response.attestationObject) : undefined,
      authenticatorData: response.authenticatorData ? bufToB64url(response.authenticatorData) : undefined,
      signature: response.signature ? bufToB64url(response.signature) : undefined,
      userHandle: response.userHandle ? bufToB64url(response.userHandle) : undefined,
    },
    clientExtensionResults: cred.getClientExtensionResults(),
  }
}

export async function createPasskey(options: Record<string, unknown>) {
  const cred = (await navigator.credentials.create({
    publicKey: toPublicKey(options) as PublicKeyCredentialCreationOptions,
  })) as PublicKeyCredential | null
  if (!cred) throw new Error('Passkey creation was cancelled')
  return serializeAssertion(cred)
}

export async function getPasskey(options: Record<string, unknown>) {
  const cred = (await navigator.credentials.get({
    publicKey: toPublicKey(options) as PublicKeyCredentialRequestOptions,
  })) as PublicKeyCredential | null
  if (!cred) throw new Error('Passkey sign-in was cancelled')
  return serializeAssertion(cred)
}
