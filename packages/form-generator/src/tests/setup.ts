import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Suppress React "Can't perform a state update on an unmounted component" warnings
// caused by antd internal components (rc-select/rc-overflow) during test cleanup
const originalError = console.error;
vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (message.includes("Can't perform a React state update on an unmounted component")) {
    return;
  }
  originalError.call(console, ...args);
});

// Mock window.matchMedia for antd components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
