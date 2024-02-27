const transform = (file, api) => {
  const j = api.jscodeshift;
  return j(file.source)
    .find(j.Identifier)
    .replaceWith(p => {
      return {
        ...p.node,
        name: p.node.name.split("").reverse().join(""),
      };
    })
    .toSource();
};

module.exports =  transform;
