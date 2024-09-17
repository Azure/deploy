// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'

import * as helpers from '../helpers'

export async function getTemplate(): Promise<Record<string, unknown>> {
  const template = helpers.getInput('deployment-template', [], false)

  if (fs.existsSync(template)) {
    const ext = path.extname(template)

    if (ext === '.bicep') {
      const filePath = await buildBicepFile(template)
      const fileContent = fs.readFileSync(filePath).toString()

      return JSON.parse(fileContent)
    }

    if (ext === '.json') {
      const fileContent = fs.readFileSync(template).toString()

      return JSON.parse(fileContent)
    }

    helpers.throwError('Unsupported file type.')
  }

  try {
    return JSON.parse(template)
  } catch {
    helpers.throwError('Invalid template content')
  }
}

export async function getParameters<T>(): Promise<T> {
  const parameters = helpers.getInput('deployment-parameters', [], false)

  if (fs.existsSync(parameters)) {
    const ext = path.extname(parameters)

    if (ext === '.bicepparam') {
      const filePath = await buildBicepParametersFile(parameters)
      const fileContent = fs.readFileSync(filePath)

      return JSON.parse(fileContent.toString()) as T
    }

    if (ext === '.json') {
      const fileContent = fs.readFileSync(parameters)

      return JSON.parse(fileContent.toString()) as T
    }
  }

  try {
    return JSON.parse(parameters) as T
  } catch {
    helpers.throwError('Invalid parameters content')
  }
}

async function buildBicepFile(filePath: string): Promise<string> {
  const bicepPath = await io.which('bicep', true)
  const outputPath = `${os.tmpdir()}/main.json`

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

  await exec.exec(
    bicepPath,
    ['build', filePath, '--outfile', outputPath],
    execOptions
  )

  return outputPath
}

async function buildBicepParametersFile(filePath: string): Promise<string> {
  const bicepPath = await io.which('bicep', true)
  const outputPath = `${os.tmpdir()}/main.params.json`

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

  await exec.exec(
    bicepPath,
    ['build-params', filePath, '--outfile', outputPath],
    execOptions
  )

  return outputPath
}
