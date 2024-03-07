const dependencyUtils = require("./utils/dependency-utils");
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
    const filesToLog = [...filesToMove]
      .sort((a, b) => a.file.localeCompare(b.file))
      .map(({ file, target }) => ({ file, target }));

    console.log(JSON.stringify(filesToLog, 0, 4));
  } else {
    transformUtils.doTransforms(filesToMove);
    // dependencyUtils.merge(targets.targetDir, modules);
    // await depUtil.installPackages(targets.targetDir);
    // depUtil.checkAndUpdate(targets.targetDir);
  }

  /*
  filesToMove.forEach(element => {
    console.log(`${element.file} => ${element.target}`)
  });*/
}

module.exports = run;
