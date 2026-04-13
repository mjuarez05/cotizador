import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment config
  // Next.js works out of the box on Vercel
  
  // Redirects para compatibilidad con rutas legacy (si las hubiera)
  async redirects() {
    return [
      // Ejemplo: si tenías /src/pages/Login, redirigir a /login
      // {
      //   source: "/src/pages/Login",
      //   destination: "/login",
      //   permanent: true,
      // },
      // {
      //   source: "/src/pages/AdminPanel",
      //   destination: "/admin",
      //   permanent: true,
      // },
    ];
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
