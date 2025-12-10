import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock CSS imports
vi.mock('*.css', () => ({}));

// Mock environment variables for tests
global.import = {
  meta: {
    env: {
      VITE_OPENROUTER_API_KEY: 'test-api-key',
      VITE_OPENROUTER_MODEL_PROD: 'anthropic/claude-haiku-4.5',
      VITE_OPENROUTER_MODEL_DEV: 'x-ai/grok-4-fast',
      VITE_ENV: 'dev',
    },
  },
};

// Mock fetch for API tests
global.fetch = vi.fn();
