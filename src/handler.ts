// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import {
  Deployment,
  ResourceManagementClient} from '@azure/arm-resources'
import {
  DeploymentStack,
  DeploymentStacksClient
} from '@azure/arm-resourcesdeploymentstacks'

import { ActionConfig, DeploymentsConfig, DeploymentStackConfig, ManagementGroupScope, ResourceGroupScope, SubscriptionScope, TenantScope } from './config'
import { DefaultAzureCredential } from '@azure/identity'
import { ParsedFiles } from './helpers';

function createDeploymentClient(scope: TenantScope | ManagementGroupScope | SubscriptionScope | ResourceGroupScope): ResourceManagementClient {
  if (scope.type == 'tenant' || scope.type == 'managementGroup') {
    throw 'Subscription ID is required'; // TODO how to handle this properly?
  }

  const { tenantId, subscriptionId } = scope;
  const credentials = new DefaultAzureCredential({ tenantId });

  return new ResourceManagementClient(credentials, subscriptionId, {
    userAgentOptions: {
      userAgentPrefix: "gha-azure-deploy",
    },
  });
}

function createStacksClient(scope: TenantScope | ManagementGroupScope | SubscriptionScope | ResourceGroupScope): DeploymentStacksClient {
  if (scope.type == 'tenant' || scope.type == 'managementGroup') {
    throw 'Subscription ID is required'; // TODO how to handle this properly?
  }

  const { tenantId, subscriptionId } = scope;
  const credentials = new DefaultAzureCredential({ tenantId });

  return new DeploymentStacksClient(credentials, subscriptionId, {
    userAgentOptions: {
      userAgentPrefix: "gha-azure-deploy",
    },
  });
}

export async function execute(config: ActionConfig, files: ParsedFiles) {
  switch (config.type) {
    case 'deployment': {
      await executeDeployment(config, files);
      break;
    }
    case 'deploymentStack': {
      await executeStack(config, files);
      break;
    }
  }
}

async function executeDeployment(config: DeploymentsConfig, files: ParsedFiles) {
  const client = createDeploymentClient(config.scope);
  const { templateContents, templateSpecId, parametersContents } = files;

  const name = config.name ?? 'deployment';
  const resource: Deployment = {
    location: config.location,
    properties: {
      mode: 'Incremental',
      template: templateContents,
      templateLink: templateSpecId ? { 
        id: templateSpecId,
      } : undefined,
      parameters: parametersContents['parameters'],
      expressionEvaluationOptions: {
        scope: 'inner'
      },
    },
    tags: config.tags,
  };

  switch (config.scope.type) {
    case 'tenant': {
      if (!config.location) { throw 'Location is required'; }
      switch (config.operation) {
        case 'create': {
          await client.deployments.beginCreateOrUpdateAtTenantScopeAndWait(name, {...resource, location: config.location});
          break;
        }
        case 'validate': {
          await client.deployments.beginValidateAtTenantScopeAndWait(name, {...resource, location: config.location});
          break;
        }
        case 'whatIf': {
          await client.deployments.beginWhatIfAtTenantScopeAndWait(name, {...resource, location: config.location});
          break;
        }
      }
      break;
    }
    case 'managementGroup': {
      if (!config.location) { throw 'Location is required'; }
      switch (config.operation) {
        case 'create': {
          await client.deployments.beginCreateOrUpdateAtManagementGroupScopeAndWait(config.scope.managementGroup, name, {...resource, location: config.location});
          break;
        }
        case 'validate': {
          await client.deployments.beginValidateAtManagementGroupScopeAndWait(config.scope.managementGroup, name, {...resource, location: config.location});
          break;
        }
        case 'whatIf': {
          await client.deployments.beginWhatIfAtManagementGroupScopeAndWait(config.scope.managementGroup, name, {...resource, location: config.location});
          break;
        }
      }
      break;
    }
    case 'subscription': {
      if (!config.location) { throw 'Location is required'; }
      switch (config.operation) {
        case 'create': {
          await client.deployments.beginCreateOrUpdateAtSubscriptionScopeAndWait(name, {...resource, location: config.location});
          break;
        }
        case 'validate': {
          await client.deployments.beginValidateAtSubscriptionScopeAndWait(name, {...resource, location: config.location});
          break;
        }
        case 'whatIf': {
          await client.deployments.beginWhatIfAtSubscriptionScopeAndWait(name, {...resource, location: config.location});
          break;
        }
      }
      break;
    }
    case 'resourceGroup': {
      switch (config.operation) {
        case 'create': {
          await client.deployments.beginCreateOrUpdateAndWait(config.scope.resourceGroup, name, resource);
          break;
        }
        case 'validate': {
          await client.deployments.beginValidateAndWait(config.scope.resourceGroup, name, resource);
          break;
        }
        case 'whatIf': {
          await client.deployments.beginWhatIfAndWait(config.scope.resourceGroup, name, resource);
          break;
        }
      }
      break;
    }
  }
}

async function executeStack(config: DeploymentStackConfig, files: ParsedFiles) {
  const client = createStacksClient(config.scope);
  const { templateContents, templateSpecId, parametersContents } = files;

  const name = config.name ?? 'deployment';
  const resource: DeploymentStack = {
    properties: {
      template: templateContents,
      templateLink: templateSpecId ? { 
        id: templateSpecId,
      } : undefined,
      parameters: parametersContents['parameters'],
      description: config.description,
      actionOnUnmanage: config.actionOnUnManage,
      denySettings: config.denySettings,
      bypassStackOutOfSyncError: config.bypassStackOutOfSyncError,
    },
    tags: config.tags,
  };

  switch (config.scope.type) {
    case 'managementGroup': {
      if (!config.location) { throw 'Location is required'; }
      switch (config.operation) {
        case 'create': {
          await client.deploymentStacks.beginCreateOrUpdateAtManagementGroupAndWait(config.scope.managementGroup, name, {...resource, location: config.location});
          break;
        }
        case 'validate': {
          await client.deploymentStacks.beginValidateStackAtManagementGroupAndWait(config.scope.managementGroup, name, {...resource, location: config.location});
          break;
        }
        case 'delete': {
          await client.deploymentStacks.beginDeleteAtManagementGroupAndWait(config.scope.managementGroup, name);
          break;
        }
      }
      break;
    }
    case 'subscription': {
      if (!config.location) { throw 'Location is required'; }
      switch (config.operation) {
        case 'create': {
          await client.deploymentStacks.beginCreateOrUpdateAtSubscriptionAndWait(name, {...resource, location: config.location});
          break;
        }
        case 'validate': {
          await client.deploymentStacks.beginValidateStackAtSubscriptionAndWait(name, {...resource, location: config.location});
          break;
        }
        case 'delete': {
          await client.deploymentStacks.beginDeleteAtSubscriptionAndWait(name);
          break;
        }
      }
      break;
    }
    case 'resourceGroup': {
      switch (config.operation) {
        case 'create': {
          await client.deploymentStacks.beginCreateOrUpdateAtResourceGroupAndWait(config.scope.resourceGroup, name, resource);
          break;
        }
        case 'validate': {
          await client.deploymentStacks.beginValidateStackAtResourceGroupAndWait(config.scope.resourceGroup, name, resource);
          break;
        }
        case 'delete': {
          await client.deploymentStacks.beginDeleteAtResourceGroupAndWait(config.scope.resourceGroup, name);
          break;
        }
      }
      break;
    }
  }
}