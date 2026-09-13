-- AlterTable
ALTER TABLE "vendors" ADD COLUMN "paygate_beneficiary_id" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "pay_request_id" TEXT;
ALTER TABLE "orders" ADD COLUMN "paygate_transaction_id" TEXT;
ALTER TABLE "orders" ADD COLUMN "payment_method" TEXT;

CREATE UNIQUE INDEX "orders_pay_request_id_key" ON "orders"("pay_request_id");

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('BOOKED', 'COLLECTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "vendor_order_id" TEXT NOT NULL,
    "carrier" TEXT NOT NULL DEFAULT 'THE_COURIER_GUY',
    "service_level_code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "status" "ShipmentStatus" NOT NULL DEFAULT 'BOOKED',
    "collection_address" JSONB NOT NULL,
    "delivery_address" JSONB NOT NULL,
    "estimated_days" INTEGER NOT NULL,
    "events" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipments_tracking_number_key" ON "shipments"("tracking_number");
CREATE INDEX "shipments_vendor_order_id_idx" ON "shipments"("vendor_order_id");

ALTER TABLE "shipments" ADD CONSTRAINT "shipments_vendor_order_id_fkey" FOREIGN KEY ("vendor_order_id") REFERENCES "vendor_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
