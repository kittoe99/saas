// Server-side v0 Platform API client helper
// The v0 SDK auto-reads V0_API_KEY from process.env
// Ensure you set V0_API_KEY in your .env.local (server-side only)
import { v0 as _v0 } from 'v0-sdk';

function assertEnv() {
  if (!process.env.V0_API_KEY) {
    throw new Error('Missing V0_API_KEY. Add it to your .env.local');
  }
}

export const v0 = new Proxy(_v0, {
  get(target, prop, receiver) {
    assertEnv();
    // @ts-ignore - forward to underlying SDK
    return Reflect.get(target, prop, receiver);
  },
});
