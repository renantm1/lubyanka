import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  // GitHub Pages publica repositórios em /nome-do-repositorio/.
  // O desenvolvimento local continua na raiz quando a variável não está definida.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Usa a API do compilador: alguns runners isolados não capturam stdout de processos destacados.
  experimental: { useTypeScriptCli: false, cpus: 2 },
};
export default config;
