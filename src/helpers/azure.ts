// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ResourceManagementClient } from "@azure/arm-resources";
import { DeploymentStacksClient } from "@azure/arm-resourcesdeploymentstacks";
import { DefaultAzureCredential } from "@azure/identity";

export function createDeploymentClient(
  subscriptionId: string,
  tenantId?: string,
): ResourceManagementClient {
  const credentials = new DefaultAzureCredential({ tenantId });

  return new ResourceManagementClient(credentials, subscriptionId, {
    userAgentOptions: {
      userAgentPrefix: "gh-azure-bicep-deploy",
    },
    // Use a recent API version to take advantage of error improvements
    apiVersion: "2024-03-01",
  });
}

export function createStacksClient(
  subscriptionId: string,
  tenantId?: string,
): DeploymentStacksClient {
  const credentials = new DefaultAzureCredential({ tenantId });

  return new DeploymentStacksClient(credentials, subscriptionId, {
    userAgentOptions: {
      userAgentPrefix: "gh-azure-bicep-deploy",
    },
  });
}
