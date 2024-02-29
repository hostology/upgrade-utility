const fileUtils = require("./utils/file-utils");

function run({ targets, modules }) {
  const files = fileUtils.getAllFilesRecursively(targets);
  const referencedFiles = fileUtils.getAllReferencedFiles({ modules, files });
  const filesToMove = fileUtils.defineTransforms({ modules, files: referencedFiles }).filter(f => f.moveFile);
  filesToMove.forEach(element => {
    console.log(`${element.file} => ${element.target}`)
  });
}

module.exports = run;