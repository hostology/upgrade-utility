const run = require("./app");
const fs = require("fs");

const config = Object.assign(
  { packages: "packages" },
  loadConfig("./config.json"),
  loadConfig("./config.local.json")
);

const { rootPath, portalPath, packages } = config;

const targets = {
  targetDir: getPath(`${portalPath}`),
  exclude: [/.*\\node_modules\\.*/, /.*\\public\\.*/, /.*\\\.next\\.*/]
};

const modules = [{ 
  id: '@hostology/ui',
  directory: getPath(`${packages}\\ui`),
  includes: ['public\\assets'],
  target: getPath(`${portalPath}\\ui`)
}, { 
  id: '@hostology/helpers',
  directory: getPath(`${packages}\\helpers`),
  target: getPath(`${portalPath}\\helpers`)
}]

const jsonFile = fs.existsSync(process.argv[2]) ? process.argv[2] : null;
const dryRun = process.argv.includes("--dry-run");

const jsonData = jsonFile ? fs.readFileSync(jsonFile, "utf8") : null;
run({ targets, modules, dryRun, jsonData });

function getPath(path) {
  return `${rootPath}/${path}`;
}

function loadConfig(path) {
  return fs.existsSync(path) ? require(path) : {};
}
