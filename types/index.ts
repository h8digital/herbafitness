export type UserRole = 'admin' | 'customer'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  role: UserRole
  status: UserStatus
  full_name: string | null
  email: string | null
  phone: string | null
  cpf: string | null
  cnpj: string | null
  company_name: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  active: boolean
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  short_description: string | null
  sku: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  stock: number
  min_stock: number
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  active: boolean
  featured: boolean
  images: ProductImage[]
  tags: string[]
  created_at: string
  updated_at: string
  category?: Category
}

export interface ProductImage {
  url: string
  alt?: string
  position: number
}

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'payment_approved'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  status: OrderStatus
  subtotal: number
  discount_amount: number
  shipping_amount: number
  total: number
  coupon_id: string | null
  coupon_code: string | null
  payment_id: string | null
  payment_method: string | null
  payment_status: string | null
  payment_url: string | null
  shipping_service: string | null
  shipping_service_name: string | null
  shipping_tracking: string | null
  shipping_label_url: string | null
  shipping_days: number | null
  shipping_address: ShippingAddress | null
  customer_notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  customer?: Profile
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_sku: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export interface ShippingAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip: string
  label?: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  max_discount: number | null
  usage_limit: number | null
  usage_count: number
  active: boolean
  starts_at: string | null
  expires_at: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ShippingOption {
  id: string
  name: string
  price: number
  days: number
  company: string
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  monthRevenue: number
  totalCustomers: number
  pendingCustomers: number
  totalProducts: number
  lowStockProducts: number
}
