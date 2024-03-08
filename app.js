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

  const includedFiles = transformBuilder.defineIncludedTransforms({ modules });

  if (dryRun) {
    transformUtils.printTransforms([...filesToMove, ...includedFiles]);
  } else {
    transformUtils.doTransforms([...filesToMove, ...includedFiles]);
  }
}

module.exports = run;
