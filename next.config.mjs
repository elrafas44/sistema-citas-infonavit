/** @type {import('next').NextConfig} */


const securityHeaders = [
  {
    // Previene el Clickjacking (Evita que metan la página en un iframe malicioso)
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Fuerza a los navegadores a respetar los tipos de archivo (MIME types)
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Activa el filtro XSS integrado en navegadores antiguos/compatibles
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Controla cuánta información se envía cuando el usuario hace clic en un enlace hacia OTRA web
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Le dice a los navegadores que SOLO se conecten a esta web usando HTTPS (vital para producción)
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  }
];

const nextConfig = {
  reactStrictMode: true,
  // Le decimos a Next.js que aplique estas cabeceras a TODAS las rutas (/(.*))
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};


export default nextConfig;