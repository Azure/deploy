import * as core from '@actions/core'

import * as helpers from '../helpers'

export function getInput(
  inputName: string,
  allowedValues?: string[],
  throwOnMissing = true
): string {
  const inputValue = core.getInput(inputName)
  if (!inputValue) {
    if (throwOnMissing) {
      helpers.throwError(`Input ${inputName} is required but not provided`)
    } else {
      return ''
    }
  }

  if (allowedValues && !allowedValues.includes(inputValue)) {
    helpers.throwError(
      `Input ${inputName} must be one of the following values: ${allowedValues.join(', ')}`
    )
  }

  return inputValue
}
