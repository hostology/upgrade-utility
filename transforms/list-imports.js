const transform = (file, { jscodeshift: j }, options) => {
  const source = j(file.source);

  console.log("");
  console.log(`Analysing ${file.path}`)
  console.log("----------------------");
  const reactImportDeclaration = source.find(j.ImportDeclaration);

  const imports = reactImportDeclaration.__paths;

  imports.forEach((importDeclaration) => {
    console.log(`import from ${importDeclaration.node.source.value}`);
  });

  console.log("");
  return source.toSource();
};

module.exports =  transform;
