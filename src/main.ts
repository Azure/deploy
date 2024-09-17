import * as core from '@actions/core'

import { ResourceManagementClient } from '@azure/arm-resources'
import { DeploymentStacksClient } from '@azure/arm-resourcesdeploymentstacks'
import { DefaultAzureCredential } from '@azure/identity'

import * as helpers from './helpers'
import {
  newResourceDeploymentConfiguration,
  newStackDeploymentConfiguration
} from './config'
import { ResourceDeploymentHandler, StackDeploymentHandler } from './handler'

type Type = 'deployment' | 'deploymentStack'
type DeploymentHandler = ResourceDeploymentHandler | StackDeploymentHandler

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug(`Starting action ...`)

    const type = helpers.getInput('type', [
      'deployment',
      'deploymentStack'
    ]) as Type

    const operation = helpers.getInput('operation', [
      'create',
      'delete',
      'validate',
      'whatIf'
    ])

    // Handlers
    const handlers: Record<Type, () => Promise<DeploymentHandler>> = {
      deployment: async () => {
        const config = await newResourceDeploymentConfiguration()
        const subscriptionId = helpers.isSubscriptionContext(config.context)
          ? config.context.subscriptionId
          : helpers.throwError('Invalid context')

        const client = new ResourceManagementClient(
          new DefaultAzureCredential(),
          subscriptionId
        )

        return new ResourceDeploymentHandler(config, client)
      },
      deploymentStack: async () => {
        const config = await newStackDeploymentConfiguration()
        const subscriptionId = helpers.isSubscriptionContext(config.context)
          ? config.context.subscriptionId
          : helpers.throwError('Invalid context')

        const client = new DeploymentStacksClient(
          new DefaultAzureCredential(),
          subscriptionId
        )

        return new StackDeploymentHandler(config, client)
      }
    }

    // Modes
    const modeHandlers: Record<
      Type,
      Record<string, (handler: DeploymentHandler) => Promise<void>>
    > = {
      deployment: {
        create: async handler =>
          await (handler as ResourceDeploymentHandler).create(),
        validate: async handler =>
          await (handler as ResourceDeploymentHandler).validate()
      },
      deploymentStack: {
        create: async handler =>
          await (handler as StackDeploymentHandler).create(),
        delete: async handler =>
          await (handler as StackDeploymentHandler).delete(),
        validate: async handler =>
          await (handler as StackDeploymentHandler).validate()
      }
    }

    // Invocation
    const handler = handlers[type]
    if (!handler) helpers.throwError(`Invalid type: ${type}`)

    core.debug(`Invoking ${type} handler ... `)
    handler()

    const modeHandler = modeHandlers[type][operation]
    if (!modeHandler) helpers.throwError(`Invalid mode: ${type}`)

    core.debug(`Completed action ...`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
