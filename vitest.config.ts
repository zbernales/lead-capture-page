import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // We test server actions in a Node environment
    environment: 'node', 
    globals: true,
    clearMocks: true,
  },
});