// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as core from '@actions/core'

import { parseConfig } from './config';
import { execute } from './handler'
import { getTemplateAndParameters } from './helpers';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug(`Starting action ...`);

    const config = parseConfig();

    const files = await getTemplateAndParameters(config);

    await execute(config, files);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
