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
      userAgentPrefix: "gha-azure-deploy",
    },
  });
}

export function createStacksClient(
  subscriptionId: string,
  tenantId?: string,
): DeploymentStacksClient {
  const credentials = new DefaultAzureCredential({ tenantId });

  return new DeploymentStacksClient(credentials, subscriptionId, {
    userAgentOptions: {
      userAgentPrefix: "gha-azure-deploy",
    },
  });
}
