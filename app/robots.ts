import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://herbafitness.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop/', '/shop/products/'],
        disallow: ['/admin/', '/shop/cart', '/shop/checkout', '/shop/orders', '/shop/profile', '/api/'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
