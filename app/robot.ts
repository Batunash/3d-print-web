import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://3d-print-web.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/auth/login', '/auth/register'],
      disallow: ['/admin/', '/dashboard/', '/api/'], // Özel sayfaları Google'dan gizle
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}