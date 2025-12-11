// ====== CONFIG ======

// API (langsung ke Orkut / OrderKuota)
const API_BASE   = "https://orkut.ftvpn.me";  // ✅ endpoint resmi backend Orkut
const API_PREFIX = "/api";

// Proxy (tidak perlu karena sudah HTTPS publik)
const USE_CORS_PROXY = false;
const CORS_PROXY     = "";

// WhatsApp & Branding
const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VbAXMcn05MUkQKF5Lq0P";
const WHATSAPP_NUMBER      = "6281210701366";
const WHATSAPP_ADMIN       = "6281210701366";
const WEBHOOK_URL          = ""; // tidak dipakai, backend sudah handle sendiri

const BRANDING = {
  name: "LevPay",
  logo: "L",
  primaryColor: "#3b82f6",
  accentColor: "#10b981"
};

// Mode produksi (bukan demo)
const DEMO_MODE = false;

// expose ke global window
window.CONFIG = {
  API_BASE,
  API_PREFIX,
  USE_CORS_PROXY,
  CORS_PROXY,
  WHATSAPP_CHANNEL_URL,
  WHATSAPP_NUMBER,
  WHATSAPP_ADMIN,
  WEBHOOK_URL,
  BRANDING,
  DEMO_MODE
};
