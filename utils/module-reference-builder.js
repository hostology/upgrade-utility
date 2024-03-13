const fs = require("fs");
const path = require("path");
const babelParser = require("@babel/parser");
const fileUtils = require("./file-utils");
const { supportedJsFileTypes } = require("./constants");

function getAllReferencedFiles({ modules, files }) {
  const references = [];
  files.forEach((file) => {
    console.log(`Building references for file ${file}...`);
    _getFileReferencesRecursively(modules, references, file);
  });
  return references.map(r => ({ file: r.path, references: r.refs.map(r => r.file) }));
}

function _getFileReferencesRecursively(modules, files, file) {
  if (files.some((f) => f.path === file)) return;
  if (!_fileIsOfType(file)) {
    files.push({ path: file, refs: [] });
    return;
  }

  const fileDef = _buildFileDef(modules, file);
  files.push(fileDef);

  fileDef.refs.reduce((acc, ref) => _getFileReferencesRecursively(modules, files, ref.file), files);
}

function _buildFileDef(modules, file) {
  const source = fs.readFileSync(file, "utf8");
  const result = babelParser.parse(source, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  const refs = result.program.body
    .filter((b) => isImportDeclaration(b) || isReExportDeclaration(b))
    .filter(b => _isMatchOrLocal(modules)(b.source.value))
    .map((b) => ({ ref: b.source.value, file: _getModulePath(modules, b.source.value, file)}));

  return {
    path: file,
    refs,
  };
}

const isImportDeclaration = (node) => node.type === "ImportDeclaration";
const isReExportDeclaration = (node) =>
  node.type === "ExportNamedDeclaration" && node.source;

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
