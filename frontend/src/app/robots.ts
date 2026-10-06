import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhaat.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/customer/',
          '/partner/dashboard/',
          '/partner/deliveries/',
          '/partner/requests/',
          '/partner/wallet/',
          '/agent/dashboard/',
          '/business/dashboard/',
          '/account/',
          '/checkout/',
          '/login/',
          '/signup/',
          '/cart/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
