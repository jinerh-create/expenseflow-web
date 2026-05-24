/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

interface Runtime {
  env: {
    DB: D1Database;
  };
}

declare namespace App {
  interface Locals extends Runtime {}
}
