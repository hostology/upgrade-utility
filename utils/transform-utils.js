const fs = require('fs');
const recast = require('recast');
const esprima = require('esprima-next');
const path = require('path');

const doTransforms = (transforms) => {
  transforms.forEach(transform => {
    if (transform.moveFile) {      
      _moveFile(transform);
      _updateReferences(transform);
    }
  })
}

const _moveFile = ({ file, target }) => {
  var targetDirectory = path.dirname(target);
  if (!fs.existsSync(targetDirectory)){
    fs.mkdirSync(targetDirectory, { recursive: true });
  }
  fs.copyFileSync(file, target)
}

const _updateReferences = ({ file, target }) => {
  const content = fs.readFileSync(target, 'utf-8');
  const ast = recast.parse(content, {
    parser: {
      parse(source) {
        return esprima.parseModule(source, { jsx: true, tokens: true, loc: true})
      }
    }
  });

  recast.types.visit(ast, {
    visitImportDeclaration(path) {
      const { node } = path;
      console.log(`Found import for components in ${file}: ${node.source.value}`);
      const { updatedImport, hasChanged } = _getUpdatedImport(node.specifiers);
      if (!hasChanged) return false;

      path.replace(updatedImport);
      return true;
    }
  });
}

const _getUpdatedImport = (specifiers) => {
  const hasChanged = false;
  const updatedImport = specifiers.map(specifier => {
    if (!specifier.imported) return specifier;
    console.log(`Found specifier: ${specifier.imported}`);
    return specifier;
  });

  return { updatedImport, hasChanged };
};

module.exports = {
  doTransforms
}