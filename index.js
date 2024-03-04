const run = require('./app');

const rootPath = `C:\\hostology\\github\\hostology-admin-web`
const packages = 'packages';
const portals = 'portals';

const getPath = (path) => {
  return `${rootPath}\\${path}`;
};

const targets = {
  targetDir: getPath(`${portals}\\admin`),
  exclude: [/.*\\node_modules\\.*/, /.*\\public\\.*/, /.*\\\.next\\.*/]
}

const modules = [{ 
  id: '@hostology/ui',
  directory: getPath(`${packages}\\ui`),
  target: getPath(`${portals}\\admin\\ui`)
}, { 
  id: '@hostology/helpers',
  directory: getPath(`${packages}\\helpers`),
  target: getPath(`${portals}\\admin\\helpers`)
}]

const dryRun = process.argv.includes('--dry-run');

run({ targets, modules, dryRun });





/* const path = require('path');
const jscodeshift = require('jscodeshift');

const Runner = require('jscodeshift/src/Runner');



// just the paths of the files to apply the transformation
// const paths = ['C:\\hostology\\github\\hostology-admin-web\\portals\\admin\\pages\\users'];


/**
 * taken from
 * @link https://github.com/facebook/jscodeshift/blob/48f5d6d6e5e769639b958f1a955c83c68157a5fa/bin/jscodeshift.js#L18
 */
/*
const options = {
  transform: 'transforms\\list-imports.js',
  verbose: 0,
  dry: false,
  print: true,
  babel: true,
  extensions: 'js,jsx,ts,tsx',
  ignorePattern: [],
  ignoreConfig: [],
  runInBand: false,
  silent: false,
  parser: 'babel',
  stdin: false
}
*/

/**
 * taken from
 * @link https://github.com/facebook/jscodeshift/blob/48f5d6d6e5e769639b958f1a955c83c68157a5fa/bin/jscodeshift.js#L135
 */
/*
Runner.run(
  /^https?/.test(options.transform) ? options.transform : path.resolve(options.transform),
  paths,
  options
);
*/