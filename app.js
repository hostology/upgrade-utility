const fileUtils = require("./utils/file-utils");

function run({ targets, modules }) {
  const files = fileUtils.getAllFilesRecursively(targets);
  const referencedFiles = fileUtils.getAllReferencedFiles({ modules, files });
  referencedFiles.forEach(element => {
    console.log(element.file, element.ref)
  });
}

module.exports = run;