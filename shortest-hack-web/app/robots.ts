import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/protected/', '/auth/'],
        crawlDelay: 10,
      },
    ],
  }
}
