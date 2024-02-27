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

export default transform;
export const parser = "flow"; // babel|babylon|flow|ts|tsx (See https://github.com/facebook/jscodeshift#usage-cli)