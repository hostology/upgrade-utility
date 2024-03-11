const fs = require('fs');

const resolvers = [
  (path) => _tryResolve(path) ,
  (path) => _tryResolve(`${path}.js`),
  (path) => _tryResolve(`${path}.ts`),
  (path) => _tryResolve(`${path}.jsx`),
  (path) => _tryResolve(`${path}.tsx`),
  (path) => _tryResolve(`${path}\\index.js`),
  (path) => _tryResolve(`${path}\\index.ts`),
  (path) => _tryResolve(`${path}\\index.jsx`),
  (path) => _tryResolve(`${path}\\index.tsx`),
]

function tryResolveReference(path) {
  for (var index = 0; index < resolvers.length; index++) {
    const resolver = resolvers[index];
    const resolved = resolver(path);
    if (resolved.exists) {
      return resolved.path;
    }
  }
  console.log("COULD NOT RESOLVE", path);
  return undefined;
}

function _tryResolve(path) {
  return {
    exists: fs.existsSync(path) && !fs.lstatSync(path).isDirectory(),
    path
  }
}

module.exports = {
  tryResolveReference,
}