const fileProvider = require('./utils/file-provider');
const transformUtils = require("./utils/transform-utils");
const moduleReferenceBuilder = require("./utils/module-reference-builder");
const transformBuilder = require("./utils/transform-builder");

function run({ targets, modules }) {
  const files = fileProvider.getAllFilesRecursively(targets);
  const referencedFiles = moduleReferenceBuilder.getAllReferencedFiles({ modules, files });
  const filesToMove = transformBuilder.defineTransforms({ modules, files: referencedFiles }).filter(f => f.moveFile);
  transformUtils.doTransforms(filesToMove);
  /*
  filesToMove.forEach(element => {
    console.log(`${element.file} => ${element.target}`)
  });*/
}

module.exports = run;