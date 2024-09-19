// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { setOutput, setFailed } from "@actions/core";
import { Deployment } from "@azure/arm-resources";
import { DeploymentStack } from "@azure/arm-resourcesdeploymentstacks";
import { RestError } from "@azure/core-rest-pipeline";

import {
  ActionConfig,
  DeploymentsConfig,
  DeploymentStackConfig,
  ManagementGroupScope,
  ResourceGroupScope,
  SubscriptionScope,
  TenantScope,
} from "./config";
import { ParsedFiles } from "./helpers/file";
import { createDeploymentClient, createStacksClient } from "./helpers/azure";
import { logError } from "./helpers/logging";

function getDeploymentClient(
  scope:
    | TenantScope
    | ManagementGroupScope
    | SubscriptionScope
    | ResourceGroupScope,
) {
  if (scope.type == "tenant" || scope.type == "managementGroup") {
    throw "Subscription ID is required"; // TODO how to handle this properly?
  }

  const { tenantId, subscriptionId } = scope;
  return createDeploymentClient(subscriptionId, tenantId);
}

function getStacksClient(
  scope:
    | TenantScope
    | ManagementGroupScope
    | SubscriptionScope
    | ResourceGroupScope,
) {
  if (scope.type == "tenant" || scope.type == "managementGroup") {
    throw "Subscription ID is required"; // TODO how to handle this properly?
  }

  const { tenantId, subscriptionId } = scope;
  return createStacksClient(subscriptionId, tenantId);
}

export async function execute(config: ActionConfig, files: ParsedFiles) {
  try {
    switch (config.type) {
      case "deployment": {
        await executeDeployment(config, files);
        break;
      }
      case "deploymentStack": {
        await executeStack(config, files);
        break;
      }
    }
  } catch (error) {
    if (error instanceof RestError && error.response?.bodyAsText) {
      const correlationId = error.response.headers.get(
        "x-ms-correlation-request-id",
      );
      logError(`Request failed. CorrelationId: ${correlationId}`);

      const responseBody = JSON.parse(error.response.bodyAsText);
      logError(JSON.stringify(responseBody, null, 2));
    }

    setFailed("Operation failed");
    throw error;
  }
}

async function executeDeployment(
  config: DeploymentsConfig,
  files: ParsedFiles,
) {
  const client = getDeploymentClient(config.scope);
  const { templateContents, templateSpecId, parametersContents } = files;

  const name = config.name ?? "deployment";
  const resource: Deployment = {
    location: config.location,
    properties: {
      mode: "Incremental",
      template: templateContents,
      templateLink: templateSpecId
        ? {
            id: templateSpecId,
          }
        : undefined,
      parameters: parametersContents["parameters"],
      expressionEvaluationOptions: {
        scope: "inner",
      },
    },
    tags: config.tags,
  };

  switch (config.scope.type) {
    case "tenant": {
      if (!config.location) {
        throw "Location is required";
      }
      switch (config.operation) {
        case "create": {
          const result =
            await client.deployments.beginCreateOrUpdateAtTenantScopeAndWait(
              name,
              { ...resource, location: config.location },
            );
          setDeploymentOutputs(result.properties?.outputs);
          break;
        }
        case "validate": {
          await client.deployments.beginValidateAtTenantScopeAndWait(name, {
            ...resource,
            location: config.location,
          });
          break;
        }
        case "whatIf": {
          await client.deployments.beginWhatIfAtTenantScopeAndWait(name, {
            ...resource,
            location: config.location,
          });
          break;
        }
      }
      break;
    }
    case "managementGroup": {
      if (!config.location) {
        throw "Location is required";
      }
      switch (config.operation) {
        case "create": {
          const result =
            await client.deployments.beginCreateOrUpdateAtManagementGroupScopeAndWait(
              config.scope.managementGroup,
              name,
              { ...resource, location: config.location },
            );
          setDeploymentOutputs(result.properties?.outputs);
          break;
        }
        case "validate": {
          await client.deployments.beginValidateAtManagementGroupScopeAndWait(
            config.scope.managementGroup,
            name,
            { ...resource, location: config.location },
          );
          break;
        }
        case "whatIf": {
          await client.deployments.beginWhatIfAtManagementGroupScopeAndWait(
            config.scope.managementGroup,
            name,
            { ...resource, location: config.location },
          );
          break;
        }
      }
      break;
    }
    case "subscription": {
      if (!config.location) {
        throw "Location is required";
      }
      switch (config.operation) {
        case "create": {
          const result =
            await client.deployments.beginCreateOrUpdateAtSubscriptionScopeAndWait(
              name,
              { ...resource, location: config.location },
            );
          setDeploymentOutputs(result.properties?.outputs);
          break;
        }
        case "validate": {
          await client.deployments.beginValidateAtSubscriptionScopeAndWait(
            name,
            { ...resource, location: config.location },
          );
          break;
        }
        case "whatIf": {
          await client.deployments.beginWhatIfAtSubscriptionScopeAndWait(name, {
            ...resource,
            location: config.location,
          });
          break;
        }
      }
      break;
    }
    case "resourceGroup": {
      switch (config.operation) {
        case "create": {
          const result = await client.deployments.beginCreateOrUpdateAndWait(
            config.scope.resourceGroup,
            name,
            resource,
          );
          setDeploymentOutputs(result.properties?.outputs);
          break;
        }
        case "validate": {
          await client.deployments.beginValidateAndWait(
            config.scope.resourceGroup,
            name,
            resource,
          );
          break;
        }
        case "whatIf": {
          await client.deployments.beginWhatIfAndWait(
            config.scope.resourceGroup,
            name,
            resource,
          );
          break;
        }
      }
      break;
    }
  }
}

async function executeStack(config: DeploymentStackConfig, files: ParsedFiles) {
  const client = getStacksClient(config.scope);
  const { templateContents, templateSpecId, parametersContents } = files;

  const name = config.name ?? "deployment";
  const resource: DeploymentStack = {
    properties: {
      template: templateContents,
      templateLink: templateSpecId
        ? {
            id: templateSpecId,
          }
        : undefined,
      parameters: parametersContents["parameters"],
      description: config.description,
      actionOnUnmanage: config.actionOnUnManage,
      denySettings: config.denySettings,
      bypassStackOutOfSyncError: config.bypassStackOutOfSyncError,
    },
    tags: config.tags,
  };

  switch (config.scope.type) {
    case "managementGroup": {
      if (!config.location) {
        throw "Location is required";
      }
      switch (config.operation) {
        case "create": {
          const result =
            await client.deploymentStacks.beginCreateOrUpdateAtManagementGroupAndWait(
              config.scope.managementGroup,
              name,
              { ...resource, location: config.location },
            );
          setDeploymentOutputs(result.properties?.outputs);
          break;
        }
        case "validate": {
          await client.deploymentStacks.beginValidateStackAtManagementGroupAndWait(
            config.scope.managementGroup,
            name,
            { ...resource, location: config.location },
          );
          break;
        }
        case "delete": {
          await client.deploymentStacks.beginDeleteAtManagementGroupAndWait(
            config.scope.managementGroup,
            name,
          );
          break;
        }
      }
      break;
    }
    case "subscription": {
      if (!config.location) {
        throw "Location is required";
      }
      switch (config.operation) {
        case "create": {
          const result =
            await client.deploymentStacks.beginCreateOrUpdateAtSubscriptionAndWait(
              name,
              { ...resource, location: config.location },
            );
          setDeploymentOutputs(result.properties?.outputs);
          break;
        }
        case "validate": {
          await client.deploymentStacks.beginValidateStackAtSubscriptionAndWait(
            name,
            { ...resource, location: config.location },
          );
          break;
        }
        case "delete": {
          await client.deploymentStacks.beginDeleteAtSubscriptionAndWait(name);
          break;
        }
      }
      break;
    }
    case "resourceGroup": {
      switch (config.operation) {
        case "create": {
          const result =
            await client.deploymentStacks.beginCreateOrUpdateAtResourceGroupAndWait(
              config.scope.resourceGroup,
              name,
              resource,
            );
          setDeploymentOutputs(result.properties?.outputs);
          break;
        }
        case "validate": {
          await client.deploymentStacks.beginValidateStackAtResourceGroupAndWait(
            config.scope.resourceGroup,
            name,
            resource,
          );
          break;
        }
        case "delete": {
          await client.deploymentStacks.beginDeleteAtResourceGroupAndWait(
            config.scope.resourceGroup,
            name,
          );
          break;
        }
      }
      break;
    }
  }
}

function setDeploymentOutputs(outputs?: Record<string, unknown>) {
  if (!outputs) {
    return;
  }

  for (const key of Object.keys(outputs)) {
    const output = outputs[key] as { value: string };
    setOutput(key, output.value);
  }
}
