function defineTransforms({ modules, files }) {
  return files.map(({ file, references }) => {
    const module = modules.find(module => file.startsWith(module.directory));
    if (!module) return { file, moveFile: false, references };
    const target = file.replace(module.directory, `${module.target}`);
    return { file, target, moveFile: true, references };
  });
}

module.exports = {
  defineTransforms,
}