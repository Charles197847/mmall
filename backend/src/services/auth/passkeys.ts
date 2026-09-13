import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server'
import { prisma } from '../../shared/database/index.js'
import { HttpError } from '../../shared/middleware/error.js'
import { signToken } from '../../shared/middleware/auth.js'

const challenges = new Map<string, { challenge: string; userId?: string; expires: number }>()

function rpID() {
  return process.env.WEBAUTHN_RP_ID ?? 'localhost'
}

function origins() {
  const extra = (process.env.WEBAUTHN_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  return extra.length
    ? extra
    : ['http://localhost:8081', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:8081']
}

function rememberChallenge(key: string, challenge: string, userId?: string) {
  challenges.set(key, { challenge, userId, expires: Date.now() + 5 * 60 * 1000 })
}

function takeChallenge(key: string) {
  const row = challenges.get(key)
  challenges.delete(key)
  if (!row || row.expires < Date.now()) throw new HttpError(400, 'Passkey challenge expired')
  return row
}

function publicUser(user: { id: string; email: string; firstName: string; lastName: string; role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'; phone?: string | null }) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone ?? null,
  }
}

export async function registrationOptions(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const existing = await prisma.passkeyCredential.findMany({ where: { userId } })
  const options = await generateRegistrationOptions({
    rpName: 'MMall',
    rpID: rpID(),
    userName: user.email,
    userDisplayName: `${user.firstName} ${user.lastName}`,
    userID: new TextEncoder().encode(user.id),
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform',
    },
    excludeCredentials: existing.map((item) => ({
      id: item.credentialId,
      transports: item.transports as AuthenticatorTransport[],
    })),
  })
  rememberChallenge(`reg:${userId}`, options.challenge, userId)
  return options
}

export async function verifyRegistration(userId: string, response: RegistrationResponseJSON) {
  const stored = takeChallenge(`reg:${userId}`)
  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: stored.challenge,
    expectedOrigin: origins(),
    expectedRPID: rpID(),
  })
  if (!verification.verified || !verification.registrationInfo) {
    throw new HttpError(400, 'Passkey registration failed')
  }
  const info = verification.registrationInfo
  const credential = info.credential
  await prisma.passkeyCredential.create({
    data: {
      userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: BigInt(credential.counter),
      deviceType: info.credentialDeviceType,
      backedUp: info.credentialBackedUp,
      transports: credential.transports ?? [],
    },
  })
  return { ok: true }
}

export async function authenticationOptions(email?: string) {
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null
  const allow = user
    ? await prisma.passkeyCredential.findMany({ where: { userId: user.id } })
    : []
  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    userVerification: 'preferred',
    allowCredentials: allow.map((item) => ({
      id: item.credentialId,
      transports: item.transports as AuthenticatorTransport[],
    })),
  })
  rememberChallenge(email ? `auth:${email}` : `auth:discover`, options.challenge, user?.id)
  return options
}

export async function verifyAuthentication(response: AuthenticationResponseJSON, email?: string) {
  const stored = takeChallenge(email ? `auth:${email}` : `auth:discover`)
  const credentialId = response.id
  const passkey = await prisma.passkeyCredential.findUnique({ where: { credentialId } })
  if (!passkey) throw new HttpError(401, 'Unknown passkey')
  const user = await prisma.user.findUniqueOrThrow({ where: { id: passkey.userId } })

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: stored.challenge,
    expectedOrigin: origins(),
    expectedRPID: rpID(),
    credential: {
      id: passkey.credentialId,
      publicKey: Buffer.from(passkey.publicKey, 'base64url'),
      counter: Number(passkey.counter),
      transports: passkey.transports as AuthenticatorTransport[],
    },
  })
  if (!verification.verified) throw new HttpError(401, 'Passkey verification failed')

  await prisma.passkeyCredential.update({
    where: { id: passkey.id },
    data: { counter: BigInt(verification.authenticationInfo.newCounter) },
  })

  const token = signToken({ sub: user.id, email: user.email, role: user.role }, '2h')
  return { token, user: publicUser(user) }
}

export async function listPasskeys(userId: string) {
  const items = await prisma.passkeyCredential.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, backedUp: true, deviceType: true },
  })
  return { items }
}
