const fileProvider = require("./utils/file-provider");
const transformUtils = require("./utils/transform-utils");
const moduleReferenceBuilder = require("./utils/module-reference-builder");
const transformBuilder = require("./utils/transform-builder");

function run({ targets, modules, dryRun = false }) {
  const files = fileProvider.getAllFilesRecursively(targets);
  const referencedFiles = moduleReferenceBuilder.getAllReferencedFiles({
    modules,
    files,
  });
  const filesToMove = transformBuilder
    .defineTransforms({ modules, files: referencedFiles })
    .filter((f) => f.moveFile);

  if (dryRun) {
    transformUtils.printTransforms(filesToMove);
  } else {
    transformUtils.doTransforms(filesToMove);
  }
}

module.exports = run;
