const fs = require('fs');
const path = require('path')
const esprima = require('esprima-next');

function getAllFilesRecursively({ targetDir, exclude, fileTypes }) {
  const files = fs.readdirSync(targetDir);
  
  if (_fileIsExcluded({ file: targetDir, exclude })) {
    return [];
  }

  return files.reduce((acc, file) => {
    const filePath = path.join(targetDir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      return [...acc, ...getAllFilesRecursively({ targetDir: filePath, exclude, fileTypes })]
    } else if (_fileIsOfType(file, fileTypes)) {
      return [...acc, filePath];
    }
    return acc;
  }, []);
}

function getAllReferencedFiles({ modules, files }) {
  return files.reduce((acc, file) => {
    return [...acc, ..._getReferencedFilesRecursively({ modules, file })]
  }, [])
};

function _fileIsOfType(file, fileTypes) {
  return fileTypes.some(fileType => file.endsWith(fileType));
}

function _getReferencedFilesRecursively({ modules, file }) {
  const source = fs.readFileSync(file, "utf8");
  const result = esprima.parseModule(source, { jsx: true });
  const importDeclarations = result.body
    .filter(b => b.type === 'ImportDeclaration')
    .map(b => b.source.value)
    .filter(_doesMatchTargetModules(modules));
  return importDeclarations.map(i => ({ file, path: i}));
};

function _fileIsExcluded({ file, exclude }) {
  if (!exclude) return false;
  return exclude.some(regex=> file.match(regex));
}

function _doesMatchTargetModules(targetModules) {
  return (importPath) => {
    return targetModules.some(module => importPath.startsWith(module.id));
  }
}

module.exports = {
  getAllFilesRecursively,
  getAllReferencedFiles,
}