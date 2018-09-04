module.exports = function(api) {
  const presets = [
    [
      '@babel/preset-env',
      {
        targets: { node: '8.10' }
      }
    ]
  ];
  const plugins = [];

  // Cache the returned value forever and don't call this function again.
  api.cache(true);

  return {
    presets,
    plugins
  };
};
