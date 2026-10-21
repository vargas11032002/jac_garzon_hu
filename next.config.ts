import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.34"],
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;