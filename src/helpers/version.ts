// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'

export async function logBicepVersion(): Promise<void> {
  const bicepPath = await io.which('bicep', true)

  const execOptions: exec.ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString().trim())
      },
      stderr: (data: Buffer) => {
        core.error(data.toString().trim())
      }
    },
    silent: true
  }

  await exec.exec(bicepPath, ['--version'], execOptions)
}
