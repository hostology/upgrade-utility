const fs = require("fs");
const path = require("path");
const esprima = require("esprima-next");
const fileUtils = require("./file-utils");
const { supportedJsFileTypes } = require("./constants");

function getAllReferencedFiles({ modules, files }) {
  const allReferences = files.reduce((acc, file) => {
    return [...acc, ..._getReferencedFilesRecursively({ modules, file })];
  }, []);

  const reducedReferences = allReferences.reduce((acc, ref) => {
    const existingRef = acc.find((a) => a.file === ref.file) ?? {
      file: ref.file,
      references: [],
    };
    return [
      ...acc.filter((a) => a.file !== ref.file),
      {
        file: ref.file,
        references: [
          ...existingRef.references,
          { ref: ref.ref, from: ref.from },
        ],
      },
    ];
  }, []);

  return reducedReferences;
}

const isImportDeclaration = (node) => node.type === "ImportDeclaration";
const isReExportDeclaration = (node) =>
  node.type === "ExportNamedDeclaration" && node.source;

function _getReferencedFilesRecursively({ modules, file, ref, from }) {
  if (!_fileIsOfType(file)) return [{ file, ref, from }];

  const source = fs.readFileSync(file, "utf8");
  const result = esprima.parseModule(source, { jsx: true });

  const declarations = result.body
    .filter((b) => isImportDeclaration(b) || isReExportDeclaration(b))
    .map((b) => b.source.value)
    .filter(_isMatchOrLocal(modules));

  return [
    { file, ref, from },
    ...declarations
      .map((ref) =>
        _getReferencedFilesRecursively({
          modules,
          file: _getModulePath(modules, ref, file),
          ref,
          from: file,
        })
      )
      .flat(),
  ];
}

function _fileIsOfType(file) {
  return supportedJsFileTypes.some((fileType) => file.endsWith(fileType));
}

function _getModulePath(modules, ref, file) {
  const module = modules.find((module) => ref.startsWith(module.id));
  const filePath = module
    ? `${module.directory}${ref.replace(module.id, "")}`.replaceAll("/", "\\")
    : path.resolve(path.dirname(file), ref);
  return fileUtils.tryResolveReference(filePath);
}

function _isMatchOrLocal(modules) {
  return (importPath) => {
    return (
      _doesMatchTargetModules(modules, importPath) || _isLocalImport(importPath)
    );
  };
}

function _doesMatchTargetModules(targetModules, importPath) {
  return targetModules.some((module) => importPath.startsWith(module.id));
}

function _isLocalImport(importPath) {
  return importPath.startsWith(".");
}

module.exports = {
  getAllReferencedFiles,
};
