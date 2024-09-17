import * as core from '@actions/core'
import {
  DeploymentProperties,
  ResourceManagementClient
} from '@azure/arm-resources'
import {
  DeploymentStackProperties,
  DeploymentStacksClient
} from '@azure/arm-resourcesdeploymentstacks'

import * as helpers from './helpers'
import { Configuration } from './config'

type Properties = DeploymentProperties | DeploymentStackProperties
type Clients = ResourceManagementClient | DeploymentStacksClient

export abstract class BaseDeploymentHandler<
  T extends Properties,
  K extends Clients
> {
  protected config: Configuration<T>
  protected client: K

  constructor(config: Configuration<T>, client: K) {
    this.config = config
    this.client = client
  }
}

export class ResourceDeploymentHandler extends BaseDeploymentHandler<
  DeploymentProperties,
  ResourceManagementClient
> {
  async create(): Promise<void> {
    core.debug(`Creating resource deployment ...`)
    const deploymentParams = {
      location: this.config.location,
      properties: this.config.properties,
      tags: this.config.tags
    }

    switch (this.config.scope) {
      case 'tenant': {
        this.config.await
          ? await this.client.deployments.beginCreateOrUpdateAtTenantScopeAndWait(
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginCreateOrUpdateAtTenantScope(
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'managementGroup': {
        const managementGroupId = helpers.isManagementGroupContext(
          this.config.context
        )
          ? this.config.context.managementGroupId
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deployments.beginCreateOrUpdateAtManagementGroupScopeAndWait(
              managementGroupId,
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginCreateOrUpdateAtManagementGroupScope(
              managementGroupId,
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'subscription': {
        this.config.await
          ? await this.client.deployments.beginCreateOrUpdateAtSubscriptionScopeAndWait(
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginCreateOrUpdateAtSubscriptionScope(
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'resourceGroup': {
        const resourceGroupName = helpers.isResourceGroupContext(
          this.config.context
        )
          ? this.config.context.resourceGroupName
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deployments.beginCreateOrUpdateAndWait(
              resourceGroupName,
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginCreateOrUpdate(
              resourceGroupName,
              this.config.name,
              deploymentParams
            )
        break
      }
      default: {
        helpers.throwError(`Invalid scope: ${this.config.scope}`)
      }
    }
  }

  async validate(): Promise<void> {
    core.debug(`Validating resource deployment ...`)
    const deploymentParams = {
      location: this.config.location,
      properties: this.config.properties,
      tags: this.config.tags
    }

    switch (this.config.scope) {
      case 'tenant': {
        this.config.await
          ? await this.client.deployments.beginValidateAtTenantScopeAndWait(
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginValidateAtTenantScope(
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'managementGroup': {
        const managementGroupId = helpers.isManagementGroupContext(
          this.config.context
        )
          ? this.config.context.managementGroupId
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deployments.beginValidateAtManagementGroupScopeAndWait(
              managementGroupId,
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginValidateAtManagementGroupScope(
              managementGroupId,
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'subscription': {
        this.config.await
          ? await this.client.deployments.beginValidateAtSubscriptionScopeAndWait(
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginValidateAtSubscriptionScope(
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'resourceGroup': {
        const resourceGroupName = helpers.isResourceGroupContext(
          this.config.context
        )
          ? this.config.context.resourceGroupName
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deployments.beginValidateAndWait(
              resourceGroupName,
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginValidate(
              resourceGroupName,
              this.config.name,
              deploymentParams
            )
        break
      }
      default: {
        helpers.throwError(`Invalid scope: ${this.config.scope}`)
      }
    }
  }

  async whatif(): Promise<void> {
    core.debug(`WhatIf resource deployment ...`)
    const deploymentParams = {
      location: this.config.location,
      properties: this.config.properties,
      tags: this.config.tags
    }

    switch (this.config.scope) {
      case 'tenant': {
        this.config.await
          ? await this.client.deployments.beginWhatIfAtTenantScopeAndWait(
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginWhatIfAtTenantScope(
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'managementGroup': {
        const managementGroupId = helpers.isManagementGroupContext(
          this.config.context
        )
          ? this.config.context.managementGroupId
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deployments.beginWhatIfAtManagementGroupScopeAndWait(
              managementGroupId,
              this.config.name,
              deploymentParams
            )
          : this.client.deployments.beginWhatIfAtManagementGroupScope(
              managementGroupId,
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'subscription': {
        this.config.await
          ? this.client.deployments.beginWhatIfAtSubscriptionScopeAndWait(
              this.config.name,
              deploymentParams
            )
          : this.client.deployments.beginWhatIfAtSubscriptionScope(
              this.config.name,
              deploymentParams
            )
        break
      }
      case 'resourceGroup': {
        const resourceGroupName = helpers.isResourceGroupContext(
          this.config.context
        )
          ? this.config.context.resourceGroupName
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deployments.beginWhatIfAndWait(
              resourceGroupName,
              this.config.name,
              deploymentParams
            )
          : await this.client.deployments.beginWhatIf(
              resourceGroupName,
              this.config.name,
              deploymentParams
            )
        break
      }
    }
  }
}

export class StackDeploymentHandler extends BaseDeploymentHandler<
  DeploymentStackProperties,
  DeploymentStacksClient
> {
  async create(): Promise<void> {
    core.debug(`Creating stack deployment ...`)
    const stackParams = {
      location: this.config.location,
      properties: this.config.properties,
      tags: this.config.tags
    }

    switch (this.config.scope) {
      case 'managementGroup': {
        const managementGroupId = helpers.isManagementGroupContext(
          this.config.context
        )
          ? this.config.context.managementGroupId
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deploymentStacks.beginCreateOrUpdateAtManagementGroupAndWait(
              managementGroupId,
              this.config.name,
              stackParams
            )
          : await this.client.deploymentStacks.beginCreateOrUpdateAtManagementGroup(
              managementGroupId,
              this.config.name,
              stackParams
            )
        break
      }
      case 'subscription': {
        this.config.await
          ? await this.client.deploymentStacks.beginCreateOrUpdateAtSubscriptionAndWait(
              this.config.name,
              stackParams
            )
          : await this.client.deploymentStacks.beginCreateOrUpdateAtSubscription(
              this.config.name,
              stackParams
            )
        break
      }
      case 'resourceGroup': {
        const resourceGroupName = helpers.isResourceGroupContext(
          this.config.context
        )
          ? this.config.context.resourceGroupName
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deploymentStacks.beginCreateOrUpdateAtResourceGroupAndWait(
              resourceGroupName,
              this.config.name,
              stackParams
            )
          : await this.client.deploymentStacks.beginCreateOrUpdateAtResourceGroup(
              resourceGroupName,
              this.config.name,
              stackParams
            )
        break
      }
      default: {
        helpers.throwError(`Invalid scope: ${this.config.scope}`)
      }
    }
  }

  async validate(): Promise<void> {
    core.debug(`Validating stack deployment ...`)
    const stackParams = {
      location: this.config.location,
      properties: this.config.properties,
      tags: this.config.tags
    }

    switch (this.config.scope) {
      case 'managementGroup': {
        const managementGroupId = helpers.isManagementGroupContext(
          this.config.context
        )
          ? this.config.context.managementGroupId
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deploymentStacks.beginValidateStackAtManagementGroupAndWait(
              managementGroupId,
              this.config.name,
              stackParams
            )
          : await this.client.deploymentStacks.beginValidateStackAtManagementGroup(
              managementGroupId,
              this.config.name,
              stackParams
            )
        break
      }
      case 'subscription': {
        this.config.await
          ? await this.client.deploymentStacks.beginValidateStackAtSubscriptionAndWait(
              this.config.name,
              stackParams
            )
          : await this.client.deploymentStacks.beginValidateStackAtSubscription(
              this.config.name,
              stackParams
            )
        break
      }
      case 'resourceGroup': {
        const resourceGroupName = helpers.isResourceGroupContext(
          this.config.context
        )
          ? this.config.context.resourceGroupName
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deploymentStacks.beginValidateStackAtResourceGroupAndWait(
              resourceGroupName,
              this.config.name,
              stackParams
            )
          : await this.client.deploymentStacks.beginValidateStackAtResourceGroup(
              resourceGroupName,
              this.config.name,
              stackParams
            )
        break
      }
      default: {
        helpers.throwError(`Invalid scope: ${this.config.scope}`)
      }
    }
  }

  async delete(): Promise<void> {
    core.debug(`Deleting stack deployment ...`)
    switch (this.config.scope) {
      case 'managementGroup': {
        const managementGroupId = helpers.isManagementGroupContext(
          this.config.context
        )
          ? this.config.context.managementGroupId
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deploymentStacks.beginDeleteAtManagementGroupAndWait(
              managementGroupId,
              this.config.name
            )
          : await this.client.deploymentStacks.beginDeleteAtManagementGroup(
              managementGroupId,
              this.config.name
            )
        break
      }
      case 'subscription': {
        this.config.await
          ? await this.client.deploymentStacks.beginDeleteAtSubscriptionAndWait(
              this.config.name
            )
          : await this.client.deploymentStacks.beginDeleteAtSubscription(
              this.config.name
            )
        break
      }
      case 'resourceGroup': {
        const resourceGroupName = helpers.isResourceGroupContext(
          this.config.context
        )
          ? this.config.context.resourceGroupName
          : helpers.throwError('Invalid context')

        this.config.await
          ? await this.client.deploymentStacks.beginDeleteAtResourceGroupAndWait(
              resourceGroupName,
              this.config.name
            )
          : await this.client.deploymentStacks.beginDeleteAtResourceGroup(
              resourceGroupName,
              this.config.name
            )
        break
      }
      default: {
        helpers.throwError(`Invalid scope: ${this.config.scope}`)
      }
    }
  }
}
