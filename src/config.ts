import { DeploymentProperties } from '@azure/arm-resources'
import { DeploymentStackProperties } from '@azure/arm-resourcesdeploymentstacks'

import * as helpers from './helpers'

export interface Configuration<T> {
  name: string
  location: string
  scope: string
  context: helpers.Context
  properties: T
  tags: Record<string, string>
  await: boolean
}

export async function newResourceDeploymentConfiguration(): Promise<
  Configuration<DeploymentProperties>
> {
  return {
    name: '',
    location: '',
    scope: '',
    context: helpers.getContextInput(),
    properties: {
      template: undefined,
      templateLink: {
        contentVersion: undefined,
        id: undefined,
        queryString: undefined,
        relativePath: undefined,
        uri: undefined
      },
      parameters: undefined,
      parametersLink: {
        uri: '',
        contentVersion: undefined
      },
      mode: 'Incremental',
      debugSetting: {
        detailLevel: undefined
      },
      onErrorDeployment: {
        deploymentName: undefined,
        type: undefined
      },
      expressionEvaluationOptions: {
        scope: undefined
      }
    },
    tags: {},
    await: false
  }
}

export async function newStackDeploymentConfiguration(): Promise<
  Configuration<DeploymentStackProperties>
> {
  return {
    name: '',
    location: '',
    scope: '',
    context: helpers.getContextInput(),
    properties: {
      template: undefined,
      templateLink: {
        contentVersion: undefined,
        id: undefined,
        queryString: undefined,
        relativePath: undefined,
        uri: undefined
      },
      parameters: undefined,
      parametersLink: {
        uri: '',
        contentVersion: undefined
      },
      actionOnUnmanage: {
        resources: '',
        managementGroups: undefined,
        resourceGroups: undefined
      },
      debugSetting: {
        detailLevel: undefined
      },
      bypassStackOutOfSyncError: undefined,
      description: undefined,
      denySettings: {
        mode: '',
        applyToChildScopes: undefined,
        excludedActions: [],
        excludedPrincipals: []
      }
    },
    tags: {},
    await: false
  }
}
