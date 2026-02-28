// src/vite-pwa.d.ts

/// <reference types="vite-plugin-pwa/react" />

declare module "virtual:pwa-register" {
  import { RegisterSWOptions } from "vite-plugin-pwa";

  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}