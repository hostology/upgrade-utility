const fileProvider = require("./file-provider");
const path = require("path");

function defineTransforms({ modules, files }) {
  return files.map(({ file, references }) => {
    const module = modules.find((module) => file.startsWith(module.directory));
    if (!module) return { file, moveFile: false, references };
    const target = file.replace(module.directory, `${module.target}`);
    return { file, target, moveFile: true, references };
  });
}

function defineIncludedTransforms({ modules }) {
  return modules.flatMap((module) => {
    const files =
      module.includes?.flatMap((include) => {
        return fileProvider.getAllFilesRecursively({
          targetDir: path.join(module.directory, include),
          onlyCodeFiles: false,
        });
      }) || [];

    return files.map((file) => {
      const target = file.replace(module.directory, `${module.target}`);
      return { file, target, moveFile: true, moveOnly: true };
    });
  });
}

module.exports = {
  defineTransforms,
  defineIncludedTransforms,
};
