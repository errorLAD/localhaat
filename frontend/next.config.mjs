/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/shop',
        destination: '/marketplace',
        permanent: true,
      },
      {
        source: '/categories',
        destination: '/marketplace#categories',
        permanent: true,
      },
      {
        source: '/category/:slug',
        destination: '/marketplace?category=:slug',
        permanent: true,
      },
      {
        source: '/products/:slug',
        destination: '/marketplace/:slug',
        permanent: true,
      },
      {
        source: '/faq',
        destination: '/faqs',
        permanent: true,
      },
      {
        source: '/send-parcel',
        destination: '/parcels',
        permanent: true,
      },
      {
        source: '/track-parcel',
        destination: '/track',
        permanent: true,
      },
      {
        source: '/logistics',
        destination: '/partner',
        permanent: true,
      },
      {
        source: '/become-a-partner',
        destination: '/partner/signup',
        permanent: true,
      },
      {
        source: '/become-a-village-agent',
        destination: '/signup?role=village_agent',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const rawApiUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const backendBase = rawApiUrl.replace(/\/api\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
};

export default nextConfig;
