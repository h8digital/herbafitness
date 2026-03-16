import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import AnalyticsScripts from '@/components/AnalyticsScripts'

async function getSettings() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('settings').select('*').eq('id', 'default').single()
    return data
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  const title = settings?.seo_title || settings?.store_name || 'Herbafit'
  const description = settings?.seo_description || settings?.store_description || 'Produtos naturais e suplementos de qualidade'
  const ogImage = settings?.seo_og_image || settings?.store_logo_url || ''

  return {
    title: {
      default: title,
      template: `%s | ${settings?.store_name || 'Herbafit'}`,
    },
    description,
    keywords: settings?.seo_keywords || 'herbalife, suplementos, produtos naturais, nutrição',
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
      siteName: settings?.store_name || 'Herbafit',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    ...(settings?.google_search_console && {
      verification: { google: settings.google_search_console },
    }),
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {settings?.google_search_console && (
          <meta name="google-site-verification" content={settings.google_search_console} />
        )}
      </head>
      <body className="antialiased">
        {children}
        <AnalyticsScripts
          metaPixelId={settings?.meta_pixel_id}
          googleAnalyticsId={settings?.google_analytics_id}
          googleSearchConsole={settings?.google_search_console}
        />
      </body>
    </html>
  )
}
