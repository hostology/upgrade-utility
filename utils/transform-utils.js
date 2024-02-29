const fs = require('fs');
const recast = require('recast');
const esprima = require('esprima-next');

const doTransforms = (transforms) => {
  transforms.forEach(transform => {
    if (transform.moveFile) {
      console.log("TRANSFORM========================", transform)
      _moveFileAndUpdateReferences(transform)
    }
  })
}

const _moveFileAndUpdateReferences = (transform) => {
  _moveFile(transform);
  _updateReferences(transform);
}

const _moveFile = (transform) => {
  
}

const _updateReferences = ({ file }) => {
  const content = fs.readFileSync(file, 'utf-8');
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
      console.log(`Found import for components in ${file}: ${node.specifiers}`);
      return false;
    }
  });
}

module.exports = {
  doTransforms
}