/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  preset: '@shelf/jest-mongodb',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
};

module.exports = config;
