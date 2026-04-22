export default {
  multipass: true,
  js2svg: {
    indent: 2,
    pretty: false,
  },
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
        },
      },
    },
    {
      name: 'convertColors',
      params: {
        currentColor: true
      }
    },
    'sortAttrs',
    'removeDimensions'
  ],
};
