// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as helpers from './helpers'

type CommonScope = {
  type: 'tenant' | 'managementGroup' | 'subscription' | 'resourceGroup',
  tenantId?: string,
};

export type TenantScope = CommonScope & {
  type: 'tenant',
};

export type ManagementGroupScope = CommonScope & {
  type: 'managementGroup',
  managementGroup: string,
};

export type SubscriptionScope = CommonScope & {
  type: 'subscription',
  subscriptionId: string,
};

export type ResourceGroupScope = CommonScope & {
  type: 'resourceGroup',
  subscriptionId: string,
  resourceGroup: string,
};

export type FileConfig = {
  templateFile?: string,
  parametersFile?: string,
}

type CommonConfig = {
  type: 'deployment' | 'deploymentStack',
  name?: string,
  location?: string,
  tags?: Record<string, string>,
} & FileConfig;

export type DeploymentsConfig = CommonConfig & {
  type: 'deployment',
  operation: 'create' | 'validate' | 'whatIf',
  scope: TenantScope | ManagementGroupScope | SubscriptionScope | ResourceGroupScope,
};

export type DeploymentStackConfig = CommonConfig & {
  type: 'deploymentStack',
  operation: 'create' | 'delete' | 'validate',
  scope: ManagementGroupScope | SubscriptionScope | ResourceGroupScope,
  description?: string,
  actionOnUnManage: {
    resources: 'delete' | 'detach',
    managementGroups?: 'delete' | 'detach',
    resourceGroups?: 'delete' | 'detach',
  },
  denySettings: {
    mode: 'denyDelete' | 'denyWriteAndDelete' | 'none',
    excludedActions: string[],
    excludedPrincipals: string[],
  },
  bypassStackOutOfSyncError: boolean,
};

export type ActionConfig = DeploymentsConfig | DeploymentStackConfig;

export function parseConfig(): DeploymentsConfig | DeploymentStackConfig {
  const type = helpers.getRequiredEnumInput('type', ['deployment', 'deploymentStack']);
  const name = helpers.getOptionalStringInput('name');
  const location = helpers.getOptionalStringInput('location');
  const templateFile = helpers.getOptionalStringInput('templateFile');
  const parametersFile = helpers.getOptionalStringInput('parametersFile');
  const description = helpers.getOptionalStringInput('description');
  const tags = helpers.getOptionalStringDictionaryInput('tags');

  switch (type) {
    case 'deployment': {
      return {
        type,
        name,
        location,
        templateFile,
        parametersFile,
        tags,
        operation: helpers.getRequiredEnumInput('operation', ['create', 'validate', 'whatIf']),
        scope: parseDeploymentScope(),
      };
    }
    case 'deploymentStack': {
      return {
        type,
        name,
        location,
        templateFile,
        parametersFile,
        description,
        tags,
        operation: helpers.getRequiredEnumInput('operation', ['create', 'validate', 'delete']),
        scope: parseDeploymentStackScope(),
        actionOnUnManage: {
          resources: helpers.getRequiredEnumInput('actionOnUnManageResources', ['delete', 'detach']),
          resourceGroups: helpers.getOptionalEnumInput('actionOnUnManageResourceGroups', ['delete', 'detach']),
          managementGroups: helpers.getOptionalEnumInput('actionOnUnManageManagementGroups', ['delete', 'detach']),
        },
        bypassStackOutOfSyncError: helpers.getOptionalBooleanInput('bypassStackOutOfSyncError'),
        denySettings: {
          mode: helpers.getRequiredEnumInput('denySettingsMode', ['denyDelete', 'denyWriteAndDelete', 'none']),
          excludedActions: helpers.getOptionalStringArrayInput('denySettingsExcludedActions'),
          excludedPrincipals: helpers.getOptionalStringArrayInput('denySettingsExcludedPrincipals'),
        },
      };
    }
  }
}

function parseDeploymentScope(): TenantScope | ManagementGroupScope | SubscriptionScope | ResourceGroupScope {
  const type = helpers.getRequiredEnumInput('scopeType', ['tenant', 'managementGroup', 'subscription', 'resourceGroup']);
  const tenantId = helpers.getOptionalStringInput('tenantId');

  switch (type) {
    case 'tenant': {
      return {
        type,
        tenantId,
      };
    }
    case 'managementGroup': {
      const managementGroup = helpers.getRequiredStringInput('managementGroup');
      return {
        type,
        tenantId,
        managementGroup,
      };
    }
    case 'subscription': {
      const subscriptionId = helpers.getRequiredStringInput('subscriptionId');
      return {
        type,
        tenantId,
        subscriptionId,
      };
    }
    case 'resourceGroup': {
      const subscriptionId = helpers.getRequiredStringInput('subscriptionId');
      const resourceGroup = helpers.getRequiredStringInput('resourceGroup');
      return {
        type,
        tenantId,
        subscriptionId,
        resourceGroup,
      };
    }
  }
}

function parseDeploymentStackScope(): ManagementGroupScope | SubscriptionScope | ResourceGroupScope {
  const type = helpers.getRequiredEnumInput('scopeType', ['managementGroup', 'subscription', 'resourceGroup']);
  const tenantId = helpers.getOptionalStringInput('tenantId');

  switch (type) {
    case 'managementGroup': {
      const managementGroup = helpers.getRequiredStringInput('managementGroup');
      return {
        type,
        tenantId,
        managementGroup,
      };
    }
    case 'subscription': {
      const subscriptionId = helpers.getRequiredStringInput('subscriptionId');
      return {
        type,
        tenantId,
        subscriptionId,
      };
    }
    case 'resourceGroup': {
      const subscriptionId = helpers.getRequiredStringInput('subscriptionId');
      const resourceGroup = helpers.getRequiredStringInput('resourceGroup');
      return {
        type,
        tenantId,
        subscriptionId,
        resourceGroup,
      };
    }
  }
}