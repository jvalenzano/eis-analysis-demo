// frontend/src/test/setup.ts

// Import helpful matchers from testing-library/jest-dom
// Ensure you have installed it: npm install -D @testing-library/jest-dom
import '@testing-library/jest-dom';

// Import vitest utilities
import { expect, afterEach } from 'vitest';

// Import testing-library utilities
import { cleanup } from '@testing-library/react';

// Optional: If you need to extend expect with custom matchers, do it here
// Example: expect.extend(yourMatchers);

// Run cleanup (unmount components) after each test case
// This prevents state leaking between tests
afterEach(() => {
  cleanup();
});

// Optional: Add any other global setup needed for your tests
// console.log("Test setup file loaded.");

