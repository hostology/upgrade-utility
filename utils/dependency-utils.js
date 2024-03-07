const { exec } = require("child_process");
const fs = require("fs");
const npmCheck = require("npm-check");
const path = require("path");

function merge(dir, modules) {
  const { targetPackagePath, targetPackage, modulePackages } = _fetch(
    dir,
    modules
  );
  const merged = _merge({ targetPackage, modulePackages });
  _write(targetPackagePath, merged);
}

function installPackages(targetDir) {
  return new Promise((resolve, reject) => {
    exec("yarn", { cwd: targetDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject({ stdout, stderr, error });
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      resolve({ stdout, stderr, error: null });
    });
  });
}

function checkAndUpdate(targetDir) {
  npmCheck({
    cwd: targetDir,
  }).then((result) => {
    debugger;
    const unusedDependencies = result.get("unusedDependencies");
    console.log({ unusedDependencies });

    var target = _getPackageJson(targetDir);
    var updated = _remove(target.package, unusedDependencies);
    _write(target.path, updated);
  });
}

module.exports = {
  merge,
  installPackages,
  checkAndUpdate,
};

function _remove(package, unusedDependencies) {
  const { dependencies, devDependencies, peerDependencies } = package;
  const [updatedDependencies, updatedDevDependencies, updatedPeerDependencies] =
    [dependencies, devDependencies, peerDependencies].map((deps) =>
      _updateDependencies(deps, unusedDependencies)
    );

  const updatedPackage = Object.assign({}, package, {
    dependencies: updatedDependencies,
    devDependencies: updatedDevDependencies,
    peerDependencies: updatedPeerDependencies,
  });

  return updatedPackage;
}

function _updateDependencies(dependencies, unusedDependencies) {
  return Object.keys(dependencies).reduce((acc, key) => {
    if (!unusedDependencies.includes(key)) {
      acc[key] = dependencies[key];
    }
    return acc;
  }, {});
}

function _getPackageJson(targetDir) {
  var filePath = path.join(targetDir, "package.json");
  const targetPackage = require(filePath);
  return {
    path: filePath,
    package: targetPackage,
  };
}

function _fetch(targetDir, modules) {
  const { path: targetPackagePath, package: targetPackage } =
    _getPackageJson(targetDir);
  const modulePackages = modules.map((module) => {
    const { package: modulePackage } = _getPackageJson(module.directory);
    return modulePackage;
  });

  return {
    targetPackagePath,
    targetPackage,
    modulePackages,
  };
}

function _merge({ targetPackage, modulePackages }) {
  var result = modulePackages.reduce((acc, pack) => {
    return Object.assign({}, acc, pack);
  }, targetPackage);

  modulePackages
    .map((module) => module.name)
    .forEach((id) => {
      delete result.dependencies[id];
      delete result.devDependencies[id];
      delete result.peerDependencies[id];
    });

  const sorted = {
    dependencies: _sortDependencies(result.dependencies),
    devDependencies: _sortDependencies(result.devDependencies),
    peerDependencies: _sortDependencies(result.peerDependencies),
  };

  var merged = Object.assign({}, targetPackage, sorted);
  return merged;
}

function _write(targetPackagePath, package) {
  fs.writeFileSync(targetPackagePath, JSON.stringify(package, null, 2));
}

function _sortDependencies(dependencies) {
  return !dependencies
    ? dependencies
    : Object.keys(dependencies)
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, key) => {
          acc[key] = dependencies[key];
          return acc;
        }, {});
}
