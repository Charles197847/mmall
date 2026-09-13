-- CreateEnum
CREATE TYPE "KycTier" AS ENUM ('EXPLORER', 'ACTIVE_VENDOR', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IdentityType" AS ENUM ('SA_ID_CARD', 'SA_GREEN_BOOK', 'PASSPORT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "phone_verified_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateTable
CREATE TABLE "phone_otps" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "phone_otps_phone_idx" ON "phone_otps"("phone");

-- CreateTable
CREATE TABLE "vendor_kyc" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "approved_tier" "KycTier" NOT NULL DEFAULT 'EXPLORER',
    "requested_tier" "KycTier" NOT NULL DEFAULT 'ACTIVE_VENDOR',
    "status" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "identity_type" "IdentityType",
    "legal_name" TEXT,
    "id_number" TEXT,
    "residential_address" TEXT,
    "id_document_name" TEXT,
    "address_document_name" TEXT,
    "selfie_captured" BOOLEAN NOT NULL DEFAULT false,
    "cipc_document_name" TEXT,
    "tax_number" TEXT,
    "vat_number" TEXT,
    "bank_proof_name" TEXT,
    "rejection_reason" TEXT,
    "review_eta_minutes" INTEGER NOT NULL DEFAULT 30,
    "provider" TEXT NOT NULL DEFAULT 'smileid',
    "provider_ref" TEXT,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_kyc_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vendor_kyc_vendor_id_key" ON "vendor_kyc"("vendor_id");

ALTER TABLE "vendor_kyc" ADD CONSTRAINT "vendor_kyc_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
