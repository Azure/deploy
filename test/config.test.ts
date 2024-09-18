import * as core from '@actions/core';

import { DeploymentsConfig, DeploymentStackConfig, parseConfig } from '../src/config'

function configureGetInputMock(inputs: Record<string, string>) {
  jest.spyOn(core, 'getInput').mockImplementation((inputName) => {
    return inputs[inputName];
  });
}

describe('input validation', () => {
  it('requires type', async () => {
    configureGetInputMock({});
    expect(() => parseConfig()).toThrow("Action input 'type' is required but not provided");
  });

  it('requires a valid value for type', async () => {
    configureGetInputMock({type: 'foo'});
    expect(() => parseConfig()).toThrow("Action input 'type' must be one of the following values: 'deployment', 'deploymentStack'");
  });

  it('requires valid json for tags', async () => {
    configureGetInputMock({type: 'deployment', tags: 'invalid'});
    expect(() => parseConfig()).toThrow("Action input 'tags' must be a dictionary of string values");
  });

  it('requires valid json for tags', async () => {
    configureGetInputMock({type: 'deployment', tags: '{"foo": {}}'});
    expect(() => parseConfig()).toThrow("Action input 'tags' must be a dictionary of string values");
  });

  it('requires operation to be provided', async () => {
    configureGetInputMock({type: 'deployment'});
    expect(() => parseConfig()).toThrow("Action input 'operation' is required but not provided");
  });

  it('requires valid operation for deployment', async () => {
    configureGetInputMock({type: 'deployment', operation: 'delete'});
    expect(() => parseConfig()).toThrow("Action input 'operation' must be one of the following values: 'create', 'validate', 'whatIf'");
  });

  it('requires valid operation for deploymentStacks', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'whatIf'});
    expect(() => parseConfig()).toThrow("Action input 'operation' must be one of the following values: 'create', 'validate', 'delete'");
  });

  it('requires subscriptionId if scopeType is subscription', async () => {
    configureGetInputMock({type: 'deployment', operation: 'create', scopeType: 'subscription'});
    expect(() => parseConfig()).toThrow("Action input 'subscriptionId' is required but not provided");
  });

  it('requires subscriptionId if scopeType is resourceGroup', async () => {
    configureGetInputMock({type: 'deployment', operation: 'create', scopeType: 'resourceGroup'});
    expect(() => parseConfig()).toThrow("Action input 'subscriptionId' is required but not provided");
  });

  it('requires resourceGroup if scopeType is resourceGroup', async () => {
    configureGetInputMock({type: 'deployment', operation: 'create', scopeType: 'resourceGroup', subscriptionId: 'foo'});
    expect(() => parseConfig()).toThrow("Action input 'resourceGroup' is required but not provided");
  });

  it('requires managementGroup if scopeType is managementGroup', async () => {
    configureGetInputMock({type: 'deployment', operation: 'create', scopeType: 'managementGroup'});
    expect(() => parseConfig()).toThrow("Action input 'managementGroup' is required but not provided");
  });

  it('blocks tenant if type is deploymentStack', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'create', scopeType: 'tenant'});
    expect(() => parseConfig()).toThrow("Action input 'scopeType' must be one of the following values: 'managementGroup', 'subscription', 'resourceGroup'");
  });

  it('requires actionOnUnManageResources for deploymentStack', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'create', scopeType: 'resourceGroup', subscriptionId: 'foo', resourceGroup: 'mockRg'});
    expect(() => parseConfig()).toThrow("Action input 'actionOnUnManageResources' is required but not provided");
  });

  it('validates actionOnUnManageResources inputs for deploymentStack', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'create', scopeType: 'resourceGroup', subscriptionId: 'foo', resourceGroup: 'mockRg', actionOnUnManageResources: 'sadf'});
    expect(() => parseConfig()).toThrow("Action input 'actionOnUnManageResources' must be one of the following values: 'delete', 'detach'");
  });

  it('validates actionOnUnManageResourceGroups inputs for deploymentStack', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'create', scopeType: 'resourceGroup', subscriptionId: 'foo', resourceGroup: 'mockRg', actionOnUnManageResources: 'detach', actionOnUnManageResourceGroups: 'sadf'});
    expect(() => parseConfig()).toThrow("Action input 'actionOnUnManageResourceGroups' must be one of the following values: 'delete', 'detach'");
  });

  it('validates actionOnUnManageManagementGroups inputs for deploymentStack', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'create', scopeType: 'resourceGroup', subscriptionId: 'foo', resourceGroup: 'mockRg', actionOnUnManageResources: 'detach', actionOnUnManageManagementGroups: 'sadf'});
    expect(() => parseConfig()).toThrow("Action input 'actionOnUnManageManagementGroups' must be one of the following values: 'delete', 'detach'");
  });

  it('requires denySettingsMode inputs for deploymentStack', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'create', scopeType: 'resourceGroup', subscriptionId: 'foo', resourceGroup: 'mockRg', actionOnUnManageResources: 'detach'});
    expect(() => parseConfig()).toThrow("Action input 'denySettingsMode' is required but not provided");
  });

  it('validates denySettingsMode inputs for deploymentStack', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'create', scopeType: 'resourceGroup', subscriptionId: 'foo', resourceGroup: 'mockRg', actionOnUnManageResources: 'detach', denySettingsMode: 'asdfasdf'});
    expect(() => parseConfig()).toThrow("Action input 'denySettingsMode' must be one of the following values: 'denyDelete', 'denyWriteAndDelete', 'none'");
  });

  it('validates bypassStackOutOfSyncError inputs for deploymentStack', async () => {
    configureGetInputMock({type: 'deploymentStack', operation: 'create', scopeType: 'resourceGroup', subscriptionId: 'foo', resourceGroup: 'mockRg', actionOnUnManageResources: 'detach', bypassStackOutOfSyncError: 'asdfasdf'});
    expect(() => parseConfig()).toThrow("Action input 'bypassStackOutOfSyncError' must be a boolean value");
  });
});

describe('input parsing', () => {
  it('parses deployment inputs', async () => {
    configureGetInputMock({
      type: 'deployment',
      name: 'mockName',
      operation: 'create',
      scopeType: 'resourceGroup',
      subscriptionId: 'mockSub',
      resourceGroup: 'mockRg',
      location: 'mockLocation',
      templateFile: 'mockTemplateFile',
      parametersFile: 'mockParametersFile',
      description: 'mockDescription',
      tags: '{"foo": "bar"}',
    });

    const config = parseConfig();
    expect(config).toEqual<DeploymentsConfig>({
      type: 'deployment',
      name: 'mockName',
      operation: 'create',
      scope: {
        type: 'resourceGroup',
        subscriptionId: 'mockSub',
        resourceGroup: 'mockRg',
      },
      location: 'mockLocation',
      templateFile: 'mockTemplateFile',
      parametersFile: 'mockParametersFile',
      tags: {
        foo: 'bar',
      },
    });
  });

  it('parses deployment stacks inputs', async () => {
    configureGetInputMock({
      type: 'deploymentStack',
      name: 'mockName',
      operation: 'delete',
      scopeType: 'subscription',
      subscriptionId: 'mockSub',
      location: 'mockLocation',
      templateFile: 'mockTemplateFile',
      parametersFile: 'mockParametersFile',
      description: 'mockDescription',
      tags: '{"foo": "bar"}',
      actionOnUnManageResources: 'delete',
      actionOnUnManageResourceGroups: 'delete',
      actionOnUnManageManagementGroups: 'delete',
      denySettingsMode: 'none',
      denySettingsExcludedActions: JSON.stringify(['abc', 'def']),
      denySettingsExcludedPrincipals: JSON.stringify(['ghi', 'jkl']),
      bypassStackOutOfSyncError: 'true',
    });

    const config = parseConfig();
    expect(config).toEqual<DeploymentStackConfig>({
      type: 'deploymentStack',
      name: 'mockName',
      operation: 'delete',
      scope: {
        type: 'subscription',
        subscriptionId: 'mockSub',
      },
      location: 'mockLocation',
      templateFile: 'mockTemplateFile',
      parametersFile: 'mockParametersFile',
      description: 'mockDescription',
      tags: {
        foo: 'bar',
      },
      actionOnUnManage: {
        resources: 'delete',
        resourceGroups: 'delete',
        managementGroups: 'delete',
      },
      denySettings: {
        mode: 'none',
        excludedActions: [
          'abc',
          'def',
        ],
        excludedPrincipals: [
          'ghi',
          'jkl',
        ],
      },
      bypassStackOutOfSyncError: true,
    });
  });
});