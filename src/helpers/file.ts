// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as fs from "fs/promises";
import * as path from "path";
import { Bicep, CompileResponseDiagnostic } from "bicep-node";
import { tmpdir } from "os";

import { FileConfig } from "../config";
import { logError, logInfo, logWarning } from "./logging";

export type ParsedFiles = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parametersContents?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  templateContents?: any;
  templateSpecId?: string;
};

async function compileBicepParams(paramFilePath: string) {
  const bicepPath = await Bicep.install(tmpdir());

  const result = await withBicep(bicepPath, (bicep) =>
    bicep.compileParams({
      path: paramFilePath,
      parameterOverrides: {},
    }),
  );

  logDiagnostics(result.diagnostics);

  if (!result.success) {
    throw `Failed to compile Bicep parameters file: ${paramFilePath}`;
  }

  return {
    parameters: result.parameters,
    template: result.template,
    templateSpecId: result.templateSpecId,
  };
}

async function compileBicep(templateFilePath: string) {
  const bicepPath = await Bicep.install(tmpdir());

  const result = await withBicep(bicepPath, (bicep) =>
    bicep.compile({
      path: templateFilePath,
    }),
  );

  logDiagnostics(result.diagnostics);

  if (!result.success) {
    throw `Failed to compile Bicep file: ${templateFilePath}`;
  }

  return { template: result.contents };
}

export async function getTemplateAndParameters(config: FileConfig) {
  const { parametersFile, templateFile } = config;

  if (
    parametersFile &&
    path.extname(parametersFile).toLowerCase() === ".bicepparam"
  ) {
    return parse(await compileBicepParams(parametersFile));
  }

  if (
    parametersFile &&
    path.extname(parametersFile).toLowerCase() !== ".json"
  ) {
    throw new Error(`Unsupported parameters file type: ${parametersFile}`);
  }

  const parameters = parametersFile
    ? await fs.readFile(parametersFile, "utf8")
    : undefined;

  if (templateFile && path.extname(templateFile).toLowerCase() === ".bicep") {
    const { template } = await compileBicep(templateFile);

    return parse({ template, parameters });
  }

  if (templateFile && path.extname(templateFile).toLowerCase() !== ".json") {
    throw new Error(`Unsupported template file type: ${templateFile}`);
  }

  if (!templateFile) {
    throw new Error("Template file is required");
  }

  const template = await fs.readFile(templateFile, "utf8");

  return parse({ template, parameters });
}

export function parse(input: {
  parameters?: string;
  template?: string;
  templateSpecId?: string;
}): ParsedFiles {
  const { parameters, template, templateSpecId } = input;
  const parametersContents = parameters ? JSON.parse(parameters) : undefined;
  const templateContents = template ? JSON.parse(template) : undefined;

  return { parametersContents, templateContents, templateSpecId };
}

async function withBicep<T>(
  bicepPath: string,
  action: (bicep: Bicep) => Promise<T>,
) {
  const bicep = await Bicep.initialize(bicepPath);

  try {
    const version = await bicep.version();
    logInfo(`Installed Bicep version ${version} to ${bicepPath}`);

    return await action(bicep);
  } finally {
    bicep.dispose();
  }
}

export function resolvePath(fileName: string) {
  return path.resolve(fileName);
}

function logDiagnostics(diagnostics: CompileResponseDiagnostic[]) {
  for (const diag of diagnostics) {
    const message = `${diag.source}(${diag.range.start.line + 1},${diag.range.start.char + 1}) : ${diag.level} ${diag.code}: ${diag.message}`;
    if (diag.level === "Error") logError(message);
    if (diag.level === "Warning") logWarning(message);
    if (diag.level === "Info") logInfo(message);
  }
}
