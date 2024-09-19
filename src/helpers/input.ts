// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as core from "@actions/core";

import { resolvePath } from "./file";

export function getRequiredEnumInput<TEnum extends string>(
  inputName: string,
  allowedValues: TEnum[],
): TEnum {
  return getInput(inputName, allowedValues, true) as TEnum;
}

export function getOptionalEnumInput<TEnum extends string>(
  inputName: string,
  allowedValues: TEnum[],
): TEnum | undefined {
  return getInput(inputName, allowedValues, false) as TEnum | undefined;
}

export function getRequiredStringInput(inputName: string): string {
  return getInput(inputName, undefined, true) as string;
}

export function getOptionalStringInput(inputName: string): string | undefined {
  return getInput(inputName, undefined, false);
}

export function getOptionalFilePath(inputName: string): string | undefined {
  const input = getOptionalStringInput(inputName);
  if (!input) {
    return;
  }

  return resolvePath(input);
}

export function getOptionalBooleanInput(inputName: string): boolean {
  const input = getOptionalStringInput(inputName);
  if (!input) {
    return false;
  }

  if (input.toLowerCase() === "true") {
    return true;
  } else if (input.toLowerCase() === "false") {
    return false;
  } else {
    throw new Error(`Action input '${inputName}' must be a boolean value`);
  }
}

export function getOptionalStringArrayInput(inputName: string): string[] {
  const inputString = getOptionalStringInput(inputName);
  if (!inputString) {
    return [];
  }

  const input = tryParseJson(inputString);
  if (!Array.isArray(input)) {
    throw new Error(`Action input '${inputName}' must be a JSON string array`);
  }

  input.forEach((val) => {
    if (typeof val !== "string") {
      throw new Error(
        `Action input '${inputName}' must be a JSON string array`,
      );
    }
  });

  return input;
}

export function getOptionalStringDictionaryInput(
  inputName: string,
): Record<string, string> {
  const inputString = getOptionalStringInput(inputName);
  if (!inputString) {
    return {};
  }

  const input = tryParseJson(inputString);
  if (typeof input !== "object") {
    throw new Error(
      `Action input '${inputName}' must be a dictionary of string values`,
    );
  }

  Object.keys(input).forEach((key) => {
    if (typeof input[key] !== "string") {
      throw new Error(
        `Action input '${inputName}' must be a dictionary of string values`,
      );
    }
  });

  return input;
}

function getInput(
  inputName: string,
  allowedValues?: string[],
  throwOnMissing = true,
): string | undefined {
  const inputValue = core.getInput(inputName);
  if (!inputValue) {
    if (throwOnMissing) {
      throw new Error(
        `Action input '${inputName}' is required but not provided`,
      );
    } else {
      return;
    }
  }

  if (allowedValues && !allowedValues.includes(inputValue)) {
    throw new Error(
      `Action input '${inputName}' must be one of the following values: '${allowedValues.join(`', '`)}'`,
    );
  }

  return inputValue;
}

function tryParseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
