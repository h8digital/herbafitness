import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isShopRoute  = request.nextUrl.pathname.startsWith('/shop')
  const isAuthRoute  = request.nextUrl.pathname.startsWith('/auth')

  // Redireciona para login se não autenticado em rotas protegidas
  if ((isAdminRoute || isShopRoute) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Rotas /admin — somente admins têm acesso
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/shop', request.url))
    }
    // Admin pode acessar /admin normalmente — sem redirect extra
    return supabaseResponse
  }

  // Rotas /shop — admin pode acessar livremente; clientes precisam estar aprovados
  if (isShopRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    // Admin acessa a loja sem restrição (visão de cliente)
    if (profile?.role === 'admin') {
      return supabaseResponse
    }

    // Cliente não aprovado vai para página de pendente
    if (profile?.status !== 'approved') {
      if (request.nextUrl.pathname !== '/shop/pending') {
        return NextResponse.redirect(new URL('/shop/pending', request.url))
      }
    }

    return supabaseResponse
  }

  // Rotas /auth — usuário já logado vai para loja
  // (admin não é mais forçado para /admin ao fazer login)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/shop', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/shop/:path*', '/auth/:path*'],
}
