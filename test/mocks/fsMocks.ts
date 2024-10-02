// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const mockFsPromises = {
  readFile: jest.fn(),
};

export function configureReadFile(mock: (filePath: string) => string) {
  mockFsPromises.readFile.mockImplementation(filePath =>
    Promise.resolve(mock(filePath)),
  );
}

// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock("fs/promises", () => mockFsPromises);
