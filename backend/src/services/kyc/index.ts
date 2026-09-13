import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../shared/database/index.js'
import { requireAuth, requireVendor, requireAdmin } from '../../shared/middleware/auth.js'
import { asyncHandler, HttpError } from '../../shared/middleware/error.js'
import { ensureVendorKyc, serializeKyc } from '../../shared/kyc.js'
import { submitToKycProvider } from './provider.js'

const router = Router()
const identitySchema = z.enum(['SA_ID_CARD', 'SA_GREEN_BOOK', 'PASSPORT'])
const tierSchema = z.enum(['ACTIVE_VENDOR', 'ENTERPRISE'])

router.get(
  '/me',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const kyc = await ensureVendorKyc(req.tenantId!)
    res.json(serializeKyc(kyc))
  }),
)

router.post(
  '/submit',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const body = z
      .object({
        requestedTier: tierSchema.default('ACTIVE_VENDOR'),
        identityType: identitySchema,
        legalName: z.string().min(3),
        idNumber: z.string().min(6),
        residentialAddress: z.string().min(8),
        idDocumentName: z.string().min(3),
        addressDocumentName: z.string().min(3),
        selfieCaptured: z.literal(true),
        cipcDocumentName: z.string().min(3).optional(),
        taxNumber: z.string().min(4).optional(),
        vatNumber: z.string().optional(),
        bankProofName: z.string().min(3).optional(),
      })
      .parse(req.body)

    if (body.requestedTier === 'ENTERPRISE') {
      if (!body.cipcDocumentName || !body.taxNumber || !body.bankProofName) {
        throw new HttpError(400, 'Enterprise verification needs CIPC documents, a tax number, and bank proof.')
      }
    }

    const provider = await submitToKycProvider({
      vendorId,
      requestedTier: body.requestedTier,
      legalName: body.legalName,
      idNumber: body.idNumber,
    })

    const now = new Date()
    const approved = provider.autoApprove
    const kyc = await prisma.vendorKyc.upsert({
      where: { vendorId },
      create: {
        vendorId,
        requestedTier: body.requestedTier,
        approvedTier: approved ? body.requestedTier : 'EXPLORER',
        status: approved ? 'APPROVED' : 'PENDING',
        identityType: body.identityType,
        legalName: body.legalName,
        idNumber: body.idNumber,
        residentialAddress: body.residentialAddress,
        idDocumentName: body.idDocumentName,
        addressDocumentName: body.addressDocumentName,
        selfieCaptured: true,
        cipcDocumentName: body.cipcDocumentName,
        taxNumber: body.taxNumber,
        vatNumber: body.vatNumber,
        bankProofName: body.bankProofName,
        provider: provider.provider,
        providerRef: provider.providerRef,
        submittedAt: now,
        reviewedAt: approved ? now : null,
        rejectionReason: null,
      },
      update: {
        requestedTier: body.requestedTier,
        approvedTier: approved ? body.requestedTier : undefined,
        status: approved ? 'APPROVED' : 'PENDING',
        identityType: body.identityType,
        legalName: body.legalName,
        idNumber: body.idNumber,
        residentialAddress: body.residentialAddress,
        idDocumentName: body.idDocumentName,
        addressDocumentName: body.addressDocumentName,
        selfieCaptured: true,
        cipcDocumentName: body.cipcDocumentName,
        taxNumber: body.taxNumber,
        vatNumber: body.vatNumber,
        bankProofName: body.bankProofName,
        provider: provider.provider,
        providerRef: provider.providerRef,
        submittedAt: now,
        reviewedAt: approved ? now : null,
        rejectionReason: null,
      },
    })

    res.json(serializeKyc(kyc))
  }),
)

router.post(
  '/:vendorId/review',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const vendorId = String(req.params.vendorId)
    const body = z
      .object({
        status: z.enum(['APPROVED', 'REJECTED']),
        rejectionReason: z.string().optional(),
      })
      .parse(req.body)

    const existing = await prisma.vendorKyc.findUnique({ where: { vendorId } })
    if (!existing) throw new HttpError(404, 'KYC record not found')

    const kyc = await prisma.vendorKyc.update({
      where: { vendorId },
      data: {
        status: body.status,
        approvedTier: body.status === 'APPROVED' ? existing.requestedTier : existing.approvedTier,
        rejectionReason: body.status === 'REJECTED' ? (body.rejectionReason ?? 'Document unreadable – please re-upload a clearer image of your SA ID') : null,
        reviewedAt: new Date(),
      },
    })
    res.json(serializeKyc(kyc))
  }),
)

export default router
