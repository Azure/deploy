// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as core from "@actions/core";

export enum Color {
  Red = "\x1b[31m",
  Green = "\x1b[32m",
  Yellow = "\x1b[33m",
  Blue = "\x1b[34m",
  Magenta = "\x1b[35m",
  Cyan = "\x1b[36m",
  White = "\x1b[37m",
  Reset = "\x1b[0m",
}

export function colorize(message: string, color: Color) {
  return message
    .split("\n")
    .map(line => `${color}${line}${Color.Reset}`)
    .join("\n");
}
export const logInfoRaw = (message: string) => core.info(message);
export const logInfo = (message: string) =>
  logInfoRaw(colorize(message, Color.Blue));
export const logWarningRaw = (message: string) => core.warning(message);
export const logWarning = (message: string) =>
  logWarningRaw(colorize(message, Color.Yellow));
export const logErrorRaw = (message: string) => core.error(message);
export const logError = (message: string) =>
  logErrorRaw(colorize(message, Color.Red));
