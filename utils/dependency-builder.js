const esprima = require("esprima-next");
const fs = require("fs");
const path = require("path");
const recast = require("recast");

function defineDependencies({ modules, files }) {
  const dependencies = {};
  const moduleIds = modules.map((module) => module.id);

  modules.forEach((module) => {
    const modulePackageJsonPath = path.join(module.directory, "package.json");
    const modulePackageJson = require(modulePackageJsonPath);

    Object.keys(modulePackageJson.dependencies).forEach((dep) => {
      if (moduleIds.includes(dep)) return;

      if (_isDependencyUsedInTargetFiles(dep, files)) {
        dependencies[dep] = {
          id: modulePackageJson.dependencies[dep],
          references: [],
        };
      }
    });
  });

  return dependencies;
}

function _isDependencyUsedInTargetFiles(dependency, targetFiles) {
  const parser = {
    parse(source) {
      return esprima.parseModule(source, {
        jsx: true,
        tokens: true,
        loc: true,
      });
    },
  };

  const visitor = {
    visitImportDeclaration(path) {
      if (path.node.source?.value === dependency) {
        return false; // stop visiting if we found the dependency
      }
      return true;
      this.traverse(path);
    },
    visitCallExpression(path) {
      const { callee, arguments: args } = path.node;
      if (callee.name === "require" && args[0]?.value === dependency) {
        return false; // stop visiting if we found the dependency
      }
      return true;
      this.traverse(path);
    },
  };

  return targetFiles.some(({ file }) => {
    const content = fs.readFileSync(file, "utf8");
    const ast = recast.parse(content, { parser });
    const r = recast.types.visit(ast, visitor);
    console.log({ r });
    return r;
  });
}

module.exports = {
  defineDependencies,
};
