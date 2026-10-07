import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Integration tests need Redis + storage + worker; skip unless opted in.
    // Run with: RUN_INTEGRATION=1 pnpm --filter @alldocs/api test
  },
});
