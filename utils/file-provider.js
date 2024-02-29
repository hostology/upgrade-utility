const fs = require('fs');
const path = require('path')
const { supportedJsFileTypes } = require('./constants');

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
    } else if (_fileIsOfType(file)) {
      return [...acc, filePath];
    }
    return acc;
  }, []);
}

function _fileIsExcluded({ file, exclude }) {
  if (!exclude) return false;
  return exclude.some(regex=> file.match(regex));
}

function _fileIsOfType(file) {
  return supportedJsFileTypes.some(fileType => file.endsWith(fileType));
}

module.exports = {
  getAllFilesRecursively
}