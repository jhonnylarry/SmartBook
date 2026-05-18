/// <reference types="vitest" />
// Este archivo es usado por @angular/build:unit-test cuando runner=vitest.
// El builder de Angular inyecta automaticamente el plugin de compilacion Angular.
// No se requieren plugins adicionales.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.spec.ts',
        'src/environments/**'
      ]
    }
  }
});
