-- ============================================
-- E-COMMERCE SCHEMA - SUPABASE
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  cnpj TEXT,
  company_name TEXT,
  -- Endereço principal
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  weight DECIMAL(8,3), -- em kg
  length DECIMAL(8,2), -- em cm
  width DECIMAL(8,2),  -- em cm
  height DECIMAL(8,2), -- em cm
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  images JSONB DEFAULT '[]',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COUPONS
-- ============================================
CREATE TABLE coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'payment_pending', 'payment_approved', 
    'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  -- Itens e valores
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  -- Cupom
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  -- Pagamento Mercado Pago
  payment_id TEXT,
  payment_method TEXT,
  payment_status TEXT,
  payment_url TEXT,
  -- Frete SuperFrete
  shipping_service TEXT,
  shipping_service_name TEXT,
  shipping_tracking TEXT,
  shipping_label_url TEXT,
  shipping_days INTEGER,
  -- Endereço de entrega
  shipping_address JSONB,
  -- Notas
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMER ADDRESSES (endereços adicionais)
-- ============================================
CREATE TABLE customer_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT DEFAULT 'Casa',
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STOCK MOVEMENTS
-- ============================================
CREATE TABLE stock_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Gera número do pedido
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  count_today INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_today
  FROM orders
  WHERE created_at::date = CURRENT_DATE;
  
  new_number := 'PED-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((count_today + 1)::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Atualiza estoque ao confirmar pagamento
CREATE OR REPLACE FUNCTION update_stock_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'payment_approved' AND OLD.status != 'payment_approved' THEN
    UPDATE products p
    SET stock = p.stock - oi.quantity,
        updated_at = NOW()
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
    
    INSERT INTO stock_movements (product_id, type, quantity, reason, order_id)
    SELECT product_id, 'out', quantity, 'Venda - Pedido ' || NEW.order_number, NEW.id
    FROM order_items
    WHERE order_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_stock_on_payment();

-- Auto updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Helper: verifica se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: verifica se cliente está aprovado
CREATE OR REPLACE FUNCTION is_approved_customer()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES policies
CREATE POLICY "Usuários veem próprio perfil" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Usuários atualizam próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "Sistema cria perfil" ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR is_admin());
CREATE POLICY "Admin deleta perfil" ON profiles FOR DELETE USING (is_admin());

-- CATEGORIES policies
CREATE POLICY "Todos veem categorias ativas" ON categories FOR SELECT USING (active = TRUE OR is_admin());
CREATE POLICY "Admin gerencia categorias" ON categories FOR ALL USING (is_admin());

-- PRODUCTS policies
CREATE POLICY "Clientes aprovados veem produtos" ON products FOR SELECT 
  USING (active = TRUE AND (is_approved_customer() OR is_admin()));
CREATE POLICY "Admin gerencia produtos" ON products FOR ALL USING (is_admin());

-- ORDERS policies
CREATE POLICY "Clientes veem próprios pedidos" ON orders FOR SELECT USING (customer_id = auth.uid() OR is_admin());
CREATE POLICY "Clientes criam pedidos" ON orders FOR INSERT WITH CHECK (customer_id = auth.uid() AND is_approved_customer());
CREATE POLICY "Admin gerencia pedidos" ON orders FOR ALL USING (is_admin());

-- ORDER ITEMS policies
CREATE POLICY "Clientes veem itens de seus pedidos" ON order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.customer_id = auth.uid() OR is_admin())));
CREATE POLICY "Sistema insere itens" ON order_items FOR INSERT WITH CHECK (TRUE);

-- COUPONS policies
CREATE POLICY "Clientes aprovados consultam cupons" ON coupons FOR SELECT USING (is_approved_customer() OR is_admin());
CREATE POLICY "Admin gerencia cupons" ON coupons FOR ALL USING (is_admin());

-- CUSTOMER ADDRESSES policies
CREATE POLICY "Clientes veem próprios endereços" ON customer_addresses FOR SELECT USING (customer_id = auth.uid() OR is_admin());
CREATE POLICY "Clientes gerenciam próprios endereços" ON customer_addresses FOR ALL USING (customer_id = auth.uid() OR is_admin());

-- STOCK MOVEMENTS policies
CREATE POLICY "Admin vê movimentos" ON stock_movements FOR SELECT USING (is_admin());
CREATE POLICY "Sistema registra movimentos" ON stock_movements FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- TRIGGER: Criar perfil ao registrar
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'approved'
      ELSE 'pending'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir categoria padrão
INSERT INTO categories (name, slug, description, active) VALUES
('Geral', 'geral', 'Categoria geral de produtos', TRUE),
('Eletrônicos', 'eletronicos', 'Produtos eletrônicos', TRUE),
('Roupas', 'roupas', 'Vestuário e acessórios', TRUE);
