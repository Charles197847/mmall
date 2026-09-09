-- Enable RLS and tenant helper functions
CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.tenant_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.user_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app.current_role()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.role', true);
END;
$$ LANGUAGE plpgsql STABLE;

ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."vendor_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;

-- Table owner (Prisma migrate / seed) bypasses RLS. In production, connect the
-- API with a non-owner role so these policies are enforced.

-- Admins see everything
CREATE POLICY "Admins full access vendors" ON vendors
  FOR ALL USING (app.current_role() = 'ADMIN');

CREATE POLICY "Admins full access products" ON products
  FOR ALL USING (app.current_role() = 'ADMIN');

CREATE POLICY "Admins full access orders" ON orders
  FOR ALL USING (app.current_role() = 'ADMIN');

CREATE POLICY "Admins full access order_items" ON order_items
  FOR ALL USING (app.current_role() = 'ADMIN');

CREATE POLICY "Admins full access vendor_orders" ON vendor_orders
  FOR ALL USING (app.current_role() = 'ADMIN');

CREATE POLICY "Admins full access reviews" ON reviews
  FOR ALL USING (app.current_role() = 'ADMIN');

-- VENDORS: owners manage their store
CREATE POLICY "Users can view their own vendor" ON vendors
  FOR SELECT USING (user_id = app.current_user_id() OR is_active = true);

CREATE POLICY "Users can update their own vendor" ON vendors
  FOR UPDATE USING (user_id = app.current_user_id());

CREATE POLICY "Users can insert their own vendor" ON vendors
  FOR INSERT WITH CHECK (user_id = app.current_user_id());

-- PRODUCTS: vendors CRUD own catalog; anyone can view active products
CREATE POLICY "Vendors can manage own products" ON products
  FOR ALL USING (vendor_id = app.current_tenant_id());

CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

-- ORDERS: customers see their own; vendors see orders containing their items
CREATE POLICY "Customers view own orders" ON orders
  FOR SELECT USING (customer_id = app.current_user_id());

CREATE POLICY "Customers insert own orders" ON orders
  FOR INSERT WITH CHECK (customer_id = app.current_user_id());

CREATE POLICY "Vendors view orders with their products" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_items
      WHERE order_items.order_id = orders.id
      AND order_items.vendor_id = app.current_tenant_id()
    )
  );

CREATE POLICY "Customers view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = app.current_user_id()
    )
  );

CREATE POLICY "Vendors view own order items" ON order_items
  FOR SELECT USING (vendor_id = app.current_tenant_id());

-- VENDOR_ORDERS
CREATE POLICY "Vendors manage own vendor orders" ON vendor_orders
  FOR ALL USING (vendor_id = app.current_tenant_id());

CREATE POLICY "Customers view vendor orders for their orders" ON vendor_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = vendor_orders.order_id
      AND orders.customer_id = app.current_user_id()
    )
  );

-- REVIEWS
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers manage own reviews" ON reviews
  FOR ALL USING (customer_id = app.current_user_id());
