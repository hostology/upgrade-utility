const fs = require("fs");
const path = require("path");

function updateDependencies(dependenciesToAdd, targetDir) {
  const { targetPath, packageJson: original } = _getPackageJson(targetDir);
  const updated = _updateDependencies(original, dependenciesToAdd);

  fs.writeFileSync(targetPath, JSON.stringify(updated, null, 2));
}

function printDependencyUpdates(dependenciesToAdd, targetDir) {
  const { packageJson: original } = _getPackageJson(targetDir);
  const originals = _sortDependencies(original.dependencies);
  const updated = _updateDependencies(original, dependenciesToAdd);

  writeOutput("dependencies.original.json", originals);
  writeOutput("dependencies.updated.json", updated.dependencies);
}

function _getPackageJson(dir) {
  const targetPath = path.join(dir, "package.json");
  const packageJson = require(targetPath);
  return { targetPath, packageJson };
}

function _updateDependencies(packageJson, dependenciesToAdd) {
  var updated = Object.assign({}, packageJson.dependencies, dependenciesToAdd);
  var sorted = _sortDependencies(updated);
  return Object.assign({}, packageJson, { dependencies: sorted });
}

function _sortDependencies(dependencies) {
  return Object.keys(dependencies)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      acc[key] = dependencies[key];
      return acc;
    }, {});
}

function writeOutput(filename, content) {
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));

  console.log(`Written ${filePath}`);
}

module.exports = {
  updateDependencies,
  printDependencyUpdates,
};
