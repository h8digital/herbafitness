# 🛒 E-Commerce — Next.js + Supabase

E-commerce completo com painel admin, Mercado Pago e SuperFrete.

## 🚀 Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Pagamentos**: Mercado Pago
- **Frete**: SuperFrete
- **Estado**: Zustand (carrinho)

## ⚙️ Setup rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Variáveis de ambiente
```bash
cp .env.example .env.local
# Preencha todas as variáveis no .env.local
```

### 3. Banco de dados
Execute `supabase-schema.sql` no SQL Editor do Supabase.

### 4. Criar admin
```sql
UPDATE profiles SET role = 'admin', status = 'approved'
WHERE email = 'seu@email.com';
```

### 5. Rodar
```bash
npm run dev
```

## 🔐 Fluxo de aprovação
Cliente cadastra → Admin aprova → Cliente pode ver preços e comprar

## 💳 Fluxo de pagamento
Checkout → Preferência MP → Redirect → Webhook → Estoque atualizado
