const fs = require('fs');
const path = require('path')
const esprima = require('esprima-next');

function _tryResolve(path) {
  return {
    exists: fs.existsSync(path) && !fs.lstatSync(path).isDirectory(),
    path
  }
}

const resolvers = [
  (path) => _tryResolve(path) ,
  (path) => _tryResolve(`${path}.js`),
  (path) => _tryResolve(`${path}.ts`),
  (path) => _tryResolve(`${path}.jsx`),
  (path) => _tryResolve(`${path}.tsx`),
  (path) => _tryResolve(`${path}/index.js`),
  (path) => _tryResolve(`${path}/index.ts`),
  (path) => _tryResolve(`${path}/index.jsx`),
  (path) => _tryResolve(`${path}/index.tsx`),
]

const fileTypes = ['js', 'jsx', 'ts', 'tsx'];

function getAllFilesRecursively({ targetDir, exclude }) {
  const files = fs.readdirSync(targetDir);
  
  if (_fileIsExcluded({ file: targetDir, exclude })) {
    return [];
  }

  return files.reduce((acc, file) => {
    const filePath = path.join(targetDir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) {
      return [...acc, ...getAllFilesRecursively({ targetDir: filePath, exclude })]
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

function _fileIsOfType(file) {
  return fileTypes.some(fileType => file.endsWith(fileType));
}

function _getReferencedFilesRecursively({ modules, file, ref }) {
  if (!_fileIsOfType(file, fileTypes)) return [{ file, ref }];

  const source = fs.readFileSync(file, "utf8");
  const result = esprima.parseModule(source, { jsx: true });
  const importDeclarations = result.body
    .filter(b => b.type === 'ImportDeclaration')
    .map(b => b.source.value)
    .filter(_isMatchOrLocal(modules));
  
  if (importDeclarations.length === 0) return [{ file, ref }];

  return importDeclarations.map(ref => _getReferencedFilesRecursively({
    modules,
    file: _getModulePath(modules, ref, file),
    ref
  })).flat();
};

function _getModulePath(modules, ref, file) {
  const module = modules.find(module => ref.startsWith(module.id));
    const filePath = module 
      ? `${module.directory}${ref.replace(module.id, '')}`.replaceAll('\/', '\\')
      : path.resolve(path.dirname(file), ref);
    return _resolve(filePath);
}

function _resolve(path) {
  for (var index = 0; index < resolvers.length; index++) {
    const resolver = resolvers[index];
    const resolved = resolver(path);
    if (resolved.exists) {
      return resolved.path;
    }
  }
  console.log("COULD NOT RESOLVE", ref);
  return undefined;
}

function _fileIsExcluded({ file, exclude }) {
  if (!exclude) return false;
  return exclude.some(regex=> file.match(regex));
}

function _isMatchOrLocal(modules) {
  return (importPath) => {
    return _doesMatchTargetModules(modules, importPath) || _isLocalImport(importPath);
  }
}

function _doesMatchTargetModules(targetModules, importPath) {
  return targetModules.some(module => importPath.startsWith(module.id));
}

function _isLocalImport(importPath) {
  return importPath.startsWith('.');
}

module.exports = {
  getAllFilesRecursively,
  getAllReferencedFiles,
}