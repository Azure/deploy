const mockDeploymentsOps: Partial<jest.MockedObjectDeep<Deployments>> = {
  beginCreateOrUpdateAtSubscriptionScopeAndWait: jest.fn(),
  beginValidateAtSubscriptionScopeAndWait: jest.fn(),
  beginWhatIfAtSubscriptionScopeAndWait: jest.fn(),
  beginCreateOrUpdateAndWait: jest.fn(),
  beginValidateAndWait: jest.fn(),
  beginWhatIfAndWait: jest.fn(),
};

const mockStacksOps: Partial<jest.MockedObjectDeep<DeploymentStacks>> = {
  beginCreateOrUpdateAtSubscriptionAndWait: jest.fn(),
  beginValidateStackAtSubscriptionAndWait: jest.fn(),
  beginDeleteAtSubscriptionAndWait: jest.fn(),
  beginCreateOrUpdateAtResourceGroupAndWait: jest.fn(),
  beginValidateStackAtResourceGroupAndWait: jest.fn(),
  beginDeleteAtResourceGroupAndWait: jest.fn(),
};

const azureMock = {
  createDeploymentClient: jest.fn().mockReturnValue({
    deployments: mockDeploymentsOps,
  }),
  createStacksClient: jest.fn().mockReturnValue({
    deploymentStacks: mockStacksOps,
  }),
};

jest.mock('../src/helpers/azure', () => azureMock);

const mockActionsCore = {
  setOutput: jest.fn(),
  setFailed: jest.fn(),
}

jest.mock('@actions/core', () => mockActionsCore);

import { DeploymentsConfig, DeploymentStackConfig, ResourceGroupScope, SubscriptionScope } from '../src/config'
import { readTestFile } from './utils';
import { execute } from '../src/handler';
import { ParsedFiles } from '../src/helpers/file';
import { Deployment, DeploymentExtended, DeploymentProperties, Deployments } from '@azure/arm-resources';
import { DeploymentStack, DeploymentStackProperties, DeploymentStacks } from '@azure/arm-resourcesdeploymentstacks';
import { setFailed, setOutput } from '@actions/core';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('deployment execution', () => {
  describe('subscription scope', () => {
    const scope: SubscriptionScope = {
      type: 'subscription',
      subscriptionId: 'mockSub',
    };

    const config: DeploymentsConfig = {
      location: 'mockLocation',
      type: 'deployment',
      scope: scope,
      name: 'mockName',
      operation: 'create',
      tags: { foo: 'bar' },
    };

    const files: ParsedFiles = {
      templateContents: JSON.parse(readTestFile('files/basic/main.json')),
      parametersContents: JSON.parse(readTestFile('files/basic/main.parameters.json')),
    };

    const expectedProperties: DeploymentProperties = {
      mode: 'Incremental',
      template: files.templateContents,
      parameters: files.parametersContents['parameters'],
      expressionEvaluationOptions: {
        scope: 'inner',
      },
    };

    const expectedPayload: Deployment = {
      location: config.location,
      properties: expectedProperties,
      tags: config.tags,
    };

    const mockReturnPayload: DeploymentExtended = {
      ...expectedPayload,
      properties: { ...expectedProperties, outputs: {mockOutput: { value: 'foo' }} },
    };
    
    it('deploys', async () => {
      mockDeploymentsOps.beginCreateOrUpdateAtSubscriptionScopeAndWait!.mockReturnValue(Promise.resolve(mockReturnPayload));

      await execute(config, files);

      expect(azureMock.createDeploymentClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockDeploymentsOps.beginCreateOrUpdateAtSubscriptionScopeAndWait).toHaveBeenCalledWith(config.name, expectedPayload);
      expect(mockActionsCore.setOutput).toHaveBeenCalledWith('mockOutput', 'foo');
    });
    
    it('validates', async () => {
      await execute({...config, operation: 'validate'}, files);

      expect(azureMock.createDeploymentClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockDeploymentsOps.beginValidateAtSubscriptionScopeAndWait).toHaveBeenCalledWith(config.name, expectedPayload);
    });
    
    it('what-ifs', async () => {
      await execute({...config, operation: 'whatIf'}, files);

      expect(azureMock.createDeploymentClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockDeploymentsOps.beginWhatIfAtSubscriptionScopeAndWait).toHaveBeenCalledWith(config.name, expectedPayload);
    });
  });

  describe('resource group scope', () => {
    const scope: ResourceGroupScope = {
      type: 'resourceGroup',
      subscriptionId: 'mockSub',
      resourceGroup: 'mockRg',
    };

    const config: DeploymentsConfig = {
      type: 'deployment',
      scope: scope,
      name: 'mockName',
      operation: 'create',
      tags: { foo: 'bar' },
    };

    const files: ParsedFiles = {
      templateContents: JSON.parse(readTestFile('files/basic/main.json')),
      parametersContents: JSON.parse(readTestFile('files/basic/main.parameters.json')),
    };

    const expectedProperties: DeploymentProperties = {
      mode: 'Incremental',
      template: files.templateContents,
      parameters: files.parametersContents['parameters'],
      expressionEvaluationOptions: {
        scope: 'inner',
      },
    };

    const expectedPayload: Deployment = {
      properties: expectedProperties,
      tags: config.tags,
    };

    const mockReturnPayload: DeploymentExtended = {
      ...expectedPayload,
      properties: { ...expectedProperties, outputs: {mockOutput: { value: 'foo' }} },
    };
    
    it('deploys', async () => {
      mockDeploymentsOps.beginCreateOrUpdateAndWait!.mockReturnValue(Promise.resolve(mockReturnPayload));

      await execute(config, files);

      expect(azureMock.createDeploymentClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockDeploymentsOps.beginCreateOrUpdateAndWait).toHaveBeenCalledWith(scope.resourceGroup, config.name, expectedPayload);
      expect(mockActionsCore.setOutput).toHaveBeenCalledWith('mockOutput', 'foo');
    });
    
    it('validates', async () => {
      await execute({...config, operation: 'validate'}, files);

      expect(azureMock.createDeploymentClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockDeploymentsOps.beginValidateAndWait).toHaveBeenCalledWith(scope.resourceGroup, config.name, expectedPayload);
    });
    
    it('what-ifs', async () => {
      await execute({...config, operation: 'whatIf'}, files);

      expect(azureMock.createDeploymentClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockDeploymentsOps.beginWhatIfAndWait).toHaveBeenCalledWith(scope.resourceGroup, config.name, expectedPayload);
    });
  });
});

describe('stack execution', () => {
  describe('subscription scope', () => {
    const scope: SubscriptionScope = {
      type: 'subscription',
      subscriptionId: 'mockSub',
    };

    const config: DeploymentStackConfig = {
      location: 'mockLocation',
      type: 'deploymentStack',
      scope: scope,
      name: 'mockName',
      operation: 'create',
      tags: { foo: 'bar' },
      denySettings: {
        mode: 'denyDelete',
        excludedActions: [],
        excludedPrincipals: [],
      },
      actionOnUnManage: {
        resources: 'delete',
      },
      bypassStackOutOfSyncError: true,
      description: 'mockDescription',
    };

    const files: ParsedFiles = {
      templateContents: JSON.parse(readTestFile('files/basic/main.json')),
      parametersContents: JSON.parse(readTestFile('files/basic/main.parameters.json')),
    };

    const expectedProperties: DeploymentStackProperties = {
      actionOnUnmanage: config.actionOnUnManage,
      bypassStackOutOfSyncError: config.bypassStackOutOfSyncError,
      denySettings: config.denySettings,
      description: config.description,
      template: files.templateContents,
      parameters: files.parametersContents['parameters'],
    };

    const expectedPayload: DeploymentStack = {
      location: config.location,
      properties: expectedProperties,
      tags: config.tags,
    };

    const mockReturnPayload: DeploymentStack = {
      ...expectedPayload,
      properties: { ...expectedProperties, outputs: {mockOutput: { value: 'foo' }} },
    };
    
    it('deploys', async () => {
      mockStacksOps.beginCreateOrUpdateAtSubscriptionAndWait!.mockReturnValue(Promise.resolve(mockReturnPayload));

      await execute(config, files);

      expect(azureMock.createStacksClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockStacksOps.beginCreateOrUpdateAtSubscriptionAndWait).toHaveBeenCalledWith(config.name, expectedPayload);
      expect(mockActionsCore.setOutput).toHaveBeenCalledWith('mockOutput', 'foo');
    });
    
    it('validates', async () => {
      await execute({...config, operation: 'validate'}, files);

      expect(azureMock.createStacksClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockStacksOps.beginValidateStackAtSubscriptionAndWait).toHaveBeenCalledWith(config.name, expectedPayload);
    });
    
    it('deletes', async () => {
      await execute({...config, operation: 'delete'}, files);

      expect(azureMock.createStacksClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockStacksOps.beginDeleteAtSubscriptionAndWait).toHaveBeenCalledWith(config.name);
    });
  });

  describe('resource group scope', () => {
    const scope: ResourceGroupScope = {
      type: 'resourceGroup',
      subscriptionId: 'mockSub',
      resourceGroup: 'mockRg',
    };

    const config: DeploymentStackConfig = {
      type: 'deploymentStack',
      scope: scope,
      name: 'mockName',
      operation: 'create',
      tags: { foo: 'bar' },
      denySettings: {
        mode: 'denyDelete',
        excludedActions: [],
        excludedPrincipals: [],
      },
      actionOnUnManage: {
        resources: 'delete',
      },
      bypassStackOutOfSyncError: true,
      description: 'mockDescription',
    };

    const files: ParsedFiles = {
      templateContents: JSON.parse(readTestFile('files/basic/main.json')),
      parametersContents: JSON.parse(readTestFile('files/basic/main.parameters.json')),
    };

    const expectedProperties: DeploymentStackProperties = {
      actionOnUnmanage: config.actionOnUnManage,
      bypassStackOutOfSyncError: config.bypassStackOutOfSyncError,
      denySettings: config.denySettings,
      description: config.description,
      template: files.templateContents,
      parameters: files.parametersContents['parameters'],
    };

    const expectedPayload: DeploymentStack = {
      properties: expectedProperties,
      tags: config.tags,
    };

    const mockReturnPayload: DeploymentStack = {
      ...expectedPayload,
      properties: { ...expectedProperties, outputs: {mockOutput: { value: 'foo' }} },
    };
    
    it('deploys', async () => {
      mockStacksOps.beginCreateOrUpdateAtResourceGroupAndWait!.mockReturnValue(Promise.resolve(mockReturnPayload));

      await execute(config, files);

      expect(azureMock.createStacksClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockStacksOps.beginCreateOrUpdateAtResourceGroupAndWait).toHaveBeenCalledWith(scope.resourceGroup, config.name, expectedPayload);
      expect(mockActionsCore.setOutput).toHaveBeenCalledWith('mockOutput', 'foo');
    });
    
    it('validates', async () => {
      await execute({...config, operation: 'validate'}, files);

      expect(azureMock.createStacksClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockStacksOps.beginValidateStackAtResourceGroupAndWait).toHaveBeenCalledWith(scope.resourceGroup, config.name, expectedPayload);
    });
    
    it('deletes', async () => {
      await execute({...config, operation: 'delete'}, files);

      expect(azureMock.createStacksClient).toHaveBeenCalledWith(scope.subscriptionId, undefined);
      expect(mockStacksOps.beginDeleteAtResourceGroupAndWait).toHaveBeenCalledWith(scope.resourceGroup, config.name);
    });
  });
});