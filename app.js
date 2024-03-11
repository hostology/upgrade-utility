const fileProvider = require("./utils/file-provider");
const transformUtils = require("./utils/transform-utils");
const moduleReferenceBuilder = require("./utils/module-reference-builder");
const transformBuilder = require("./utils/transform-builder");

function run({ targets, modules, jsonData, dryRun = false }) {
  const transforms = JSON.parse(jsonData) ?? getTransforms(targets, modules);
  if (dryRun) {
    transformUtils.printTransforms(transforms);
  } else {
    transformUtils.doTransforms(transforms);
  }
}

module.exports = run;

function getTransforms(targets, modules) {
  const files = fileProvider.getAllFilesRecursively(targets);
  const referencedFiles = moduleReferenceBuilder.getAllReferencedFiles({
    modules,
    files,
  });
  const filesToMove = transformBuilder
    .defineTransforms({ modules, files: referencedFiles })
    .filter((f) => f.moveFile);

  const includedFiles = transformBuilder.defineIncludedTransforms({ modules });

  return [...filesToMove, ...includedFiles];
}
