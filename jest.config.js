/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',

  testEnvironment: 'node',

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@testing-library|react-clone-referenced-element)/)',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
  ],

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
    '/__tests__/',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/types/**',
  ],
};
