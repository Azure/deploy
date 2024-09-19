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

function colorize(message: string, color: Color) {
  return message
    .split("\n")
    .map((line) => `${color}${line}${Color.Reset}`)
    .join("\n");
}

export const logInfo = (message: string) =>
  core.info(colorize(message, Color.Blue));
export const logWarning = (message: string) =>
  core.warning(colorize(message, Color.Yellow));
export const logError = (message: string) =>
  core.error(colorize(message, Color.Red));
