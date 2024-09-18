import { CompileParamsRequest, CompileParamsResponse, CompileRequest, CompileResponse } from 'bicep-node';
import { FileConfig } from '../src/config'
import { getTemplateAndParameters } from '../src/helpers';
import { readTestFile } from './utils';

let readFileMock = (filePath: string): string => {
  throw 'Not implemented';
};
let compileBicepMock = (request: CompileRequest): CompileResponse => {
  throw 'Not implemented';
};
let compileBicepParamsMock = (request: CompileParamsRequest): CompileParamsResponse => {
  throw 'Not implemented';
};

jest.mock('bicep-node', () => ({
  Bicep: {
    install: jest.fn().mockResolvedValue(Promise.resolve('/path/to/bicep')),
    initialize: jest.fn().mockResolvedValue({
      compile: jest.fn().mockImplementation(p => compileBicepMock(p)),
      compileParams: jest.fn().mockImplementation(p => compileBicepParamsMock(p)),
      dispose: jest.fn(),
    }),
  }
}));

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockImplementation(path => readFileMock(path)),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('file parsing', () => {
  it('reads and parses template and parameters files', async () => {
    const config: FileConfig = {
      templateFile: '/path/to/template.json',
      parametersFile: '/path/to/parameters.json',
    };

    readFileMock = filePath => {
      if (filePath === '/path/to/template.json') return readTestFile('files/basic/main.json');
      if (filePath === '/path/to/parameters.json') return readTestFile('files/basic/main.parameters.json');
      throw `Unexpected file path: ${filePath}`;
    }

    const { templateContents, parametersContents } = await getTemplateAndParameters(config);

    expect(templateContents['$schema']).toEqual('https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#');
    expect(templateContents['parameters']['foo']).toBeDefined();

    expect(parametersContents['$schema']).toEqual('https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#');
    expect(parametersContents['parameters']['foo']).toBeDefined();
  });

  it('compiles Bicepparam files', async () => {
    const config: FileConfig = {
      parametersFile: '/path/to/main.bicepparam',
    };
    
    compileBicepParamsMock = req => {
      expect(req).toEqual({
        path: '/path/to/main.bicepparam',
        parameterOverrides: {},
      });

      return {
        success: true,
        diagnostics: [],
        template: readTestFile('files/basic/main.json'),
        parameters: readTestFile('files/basic/main.parameters.json'),
      };
    };

    const { templateContents, parametersContents } = await getTemplateAndParameters(config);

    expect(templateContents['$schema']).toEqual('https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#');
    expect(templateContents['parameters']['foo']).toBeDefined();

    expect(parametersContents['$schema']).toEqual('https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#');
    expect(parametersContents['parameters']['foo']).toBeDefined();
  });

  it('compiles Bicep files', async () => {
    const config: FileConfig = {
      parametersFile: '/path/to/parameters.json',
      templateFile: '/path/to/main.bicep',
    };

    readFileMock = filePath => {
      if (filePath === '/path/to/parameters.json') return readTestFile('files/basic/main.parameters.json');
      throw `Unexpected file path: ${filePath}`;
    }
    
    compileBicepMock = req => {
      expect(req).toEqual({
        path: '/path/to/main.bicep',
      });

      return {
        success: true,
        diagnostics: [],
        contents: readTestFile('files/basic/main.json'),
      };
    };

    const { templateContents, parametersContents } = await getTemplateAndParameters(config);

    expect(templateContents['$schema']).toEqual('https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#');
    expect(templateContents['parameters']['foo']).toBeDefined();

    expect(parametersContents['$schema']).toEqual('https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#');
    expect(parametersContents['parameters']['foo']).toBeDefined();
  });

  it('blocks unexpected parameter file extensions', async () => {
    const config: FileConfig = {
      parametersFile: '/path/to/parameters.what',
      templateFile: '/path/to/main.json',
    };

    expect(async () => await getTemplateAndParameters(config)).rejects.toThrow("Unsupported parameters file type: /path/to/parameters.what");
  });

  it('blocks unexpected template file extension', async () => {
    const config: FileConfig = {
      parametersFile: '/path/to/parameters.json',
      templateFile: '/path/to/main.what',
    };

    expect(async () => await getTemplateAndParameters(config)).rejects.toThrow("Unsupported template file type: /path/to/main.what");
  });
});