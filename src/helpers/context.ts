// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as core from '@actions/core'

import * as helpers from '../helpers'

export interface TenantContext {
  tenantId: string
}

export interface SubscriptionContext {
  subscriptionId: string
}

export interface ManagementGroupContext {
  managementGroupId: string
}

export interface ResourceGroupContext {
  resourceGroupName: string
}

export type Context =
  | TenantContext
  | SubscriptionContext
  | ManagementGroupContext
  | ResourceGroupContext

export function getContextInput(): Context {
  const scope = core.getInput('scope')

  switch (scope) {
    case 'tenant':
      return {
        tenantId: helpers.getInput('tenantId')
      }
    case 'subscription':
      return {
        subscriptionId: helpers.getInput('subscriptionId')
      }
    case 'managementGroup':
      return {
        managementGroupId: helpers.getInput('managementGroupId')
      }
    case 'resourceGroup':
      return {
        subscriptionId: helpers.getInput('subscriptionId'),
        resourceGroupName: helpers.getInput('resourceGroupName')
      }
    default: {
      helpers.throwError(`Invalid scope: ${scope}`)
    }
  }
}

export function isTenantContext(context: Context): context is TenantContext {
  return (context as TenantContext).tenantId !== undefined
}

export function isManagementGroupContext(
  context: Context
): context is ManagementGroupContext {
  return (context as ManagementGroupContext).managementGroupId !== undefined
}

export function isSubscriptionContext(
  context: Context
): context is SubscriptionContext {
  return (context as SubscriptionContext).subscriptionId !== undefined
}

export function isResourceGroupContext(
  context: Context
): context is ResourceGroupContext {
  return (context as ResourceGroupContext).resourceGroupName !== undefined
}
