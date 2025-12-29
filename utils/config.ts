// Use environment variables for backend URL with production fallback
export const WS_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://lsbackend-production-46d9.up.railway.app";
