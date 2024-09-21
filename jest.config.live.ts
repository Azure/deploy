// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
module.exports = {
  verbose: true,
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: [
    '**/test-live/**/*.test.(ts)'
  ],
  testEnvironment: 'node',
};