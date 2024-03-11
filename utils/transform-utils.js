const fs = require("fs");
const recast = require("recast");
const babelParser = require("@babel/parser");
const path = require("path");

const doTransforms = (transforms) => {
  transforms.forEach((transform) => {
    if (!transform.moveFile) return;
    _moveFile(transform);
    if (transform.moveOnly) return;
    _updateReferences(transform);
  });
};

const printTransforms = (transforms) => {
  const items = [...transforms]
    .sort((a, b) => a.file.localeCompare(b.file))
    .map(({ file, target }) => ({ file, target }));

  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const filePath = path.join(outputDir, "move-files.json");
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2));

  console.log(`Written ${filePath}`);
};

const _moveFile = ({ file, target }) => {
  console.debug(`Moving: ${file} => ${target}`);
  var targetDirectory = path.dirname(target);
  if (!fs.existsSync(targetDirectory)) {
    fs.mkdirSync(targetDirectory, { recursive: true });
  }
  fs.copyFileSync(file, target);
};

const _updateReferences = ({ file, target }) => {
  console.debug(`Updating references for: ${target}`);
  const content = fs.readFileSync(target, "utf-8");
  const ast = recast.parse(content, {
    parser: {
      parse(source) {
        return babelParser.parse(source, {
          sourceType: "module",
          plugins: ["jsx"],
          tokens: true,
          loc: true,
        });
      },
    },
  });

  recast.types.visit(ast, {
    visitImportDeclaration(path) {
      const { node } = path;
      console.log(
        `Found import for components in ${file}: ${node.source.value}`
      );
      const { updatedImport, hasChanged } = _getUpdatedImport(node.specifiers);
      if (!hasChanged) return false;

      path.replace(updatedImport);
      return true;
    },
  });
};

const _getUpdatedImport = (specifiers) => {
  const hasChanged = false;
  const updatedImport = specifiers.map((specifier) => {
    if (!specifier.imported) return specifier;
    console.log(`Found specifier: ${specifier.imported}`);
    return specifier;
  });

  return { updatedImport, hasChanged };
};

module.exports = {
  doTransforms,
  printTransforms,
};
