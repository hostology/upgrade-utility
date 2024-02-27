const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

const reverseIdentifiers = require("./transforms/reverse-identifiers");

const targetDirectory = "c:/hostology/github/host-auth-web";

const transforms = ["example1", "example2", "example3"];

// Function to recursively get all files within a folder matching a particular regex
const getAllFiles = (dirPath, filenameRegex = /.*/, files) => {
  fs.readdirSync(dirPath).forEach(file => {
    if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
      files = getAllFiles(`${dirPath}/${file}`, filenameRegex, files);
    } else if (filenameRegex.test(file)) {
      files.push(path.join(dirPath, "/", file));
    }
  });
  return files;
};

const main = async () => {
  const inquirer = (await import("inquirer")).default;
  console.log("INQUIRER", inquirer)

  const { transform } = await inquirer.prompt([
    {
      type: "list",
      name: "transform",
      message: "Select a transform:",
      choices: [...transforms],
    },
  ]);

  const transformDir = path.join(examplesDir, transform);
  const transformFile = path.join(transformDir, `${transform}.ts`);
  const transformInputFiles = getAllFiles(targetDirectory, /\.input\./).map(file => file.replace(targetDirectory, ""));

  const { inputFile } = await inquirer.prompt([
    {
      type: "list",
      name: "inputFile",
      message: "Choose a file to transform:",
      choices: [...transformInputFiles],
    },
  ]);

  // TODO Use Reflect to determine options
  const { options } = await inquirer.prompt([
    {
      type: "input",
      name: "options",
      message: "Add CLI options (optional). For example, '-key1=value1 --key2=value2':",
    },
  ]);
  return { transform, transformFile, inputFile, options };
};

main().then(({ transformFile, inputFile, options }) => {
  // Execute
  // e.g.
  // "jscodeshift:reverse-identifiers": "jscodeshift -t ./src/examples/reverse-identifiers/reverse-identifiers.ts --extensions=ts src/examples/reverse-identifiers/reverse-identifiers.input.ts --print --dry"
  // "jscodeshift:append-function-call": "jscodeshift -t ./src/examples/append-function-call/append-function-call.ts --extensions=ts src/examples/append-function-call/__testfixtures__/append-function-call.input.ts --print --dry --functionNameToCall=test --comment=abc"
  // See https://github.com/facebook/jscodeshift#usage-cli

  // eslint-disable-next-line @typescript-eslint/camelcase
  const result = child_process.spawnSync(
    path.join("node_modules", ".bin", "jscodeshift"),
    [
      "--dry",
      "--print",
      "--run-in-band",
      "-t",
      transformFile,
      "--extensions=ts",
      "--parser=ts",
      inputFile,
      ...options.split(" "),
    ],
    {
      encoding: "utf8",
    }
  );

  console.log(result.stdout);
});