module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/cypress/', '<rootDir>/node_modules/'],
  collectCoverageFrom: ['<rootDir>/pages/**/*.tsx', '<rootDir>/components/**/*.tsx'],
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 20,
      functions: 20,
      lines: 20,
    },
  },
};
