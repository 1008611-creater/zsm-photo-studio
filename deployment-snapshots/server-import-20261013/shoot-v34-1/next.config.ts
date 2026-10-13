import type { NextConfig } from 'next';
const nextConfig:NextConfig={
  poweredByHeader:false,
  basePath:process.env.NEXT_PUBLIC_BASE_PATH||'',
  serverExternalPackages:['sharp'],
  async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'same-origin'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},{key:'X-Frame-Options',value:'SAMEORIGIN'}]}];}
};
export default nextConfig;
