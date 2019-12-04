module.exports = function(api) {
  api.cache(true);
  {
    // Fix: [BABEL] Note: The code generator has deoptimised the styling of cap-collectif/platform/bower_components/ckeditor/ckeditor.js as it exceeds the max of 500KB.
    const compact = false;
    const env = {
      test: {
        // Make sure to have { "modules": true } in test environment.
        presets: [['@babel/preset-env'], '@babel/preset-react'],
      },
    };
    const presets = [
      [
        '@babel/preset-react',
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: false,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          useBuiltIns: true,
        },
      ],
      '@babel/preset-flow',
      // Latest stable ECMAScript features
      [
        '@babel/preset-env',
        {
          // We want to be IE 11 compatible
          targets: {
            ie: 11,
          },
          // Users cannot override this behavior because this Babel
          // configuration is highly tuned for ES5 support
          ignoreBrowserslistConfig: true,
          // If users import all core-js they're probably not concerned with
          // bundle size. We shouldn't rely on magic to try and shrink it.
          useBuiltIns: false,
          // Do not transform modules to CJS
          modules: false,
          // Exclude transforms that make all code slower
          exclude: ['transform-typeof-symbol'],
        },
      ],
    ];
    const plugins = [
      '@babel/plugin-transform-arrow-functions',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-optional-chaining',
      'babel-plugin-dev-expression',
      'styled-components',
      'react-docgen',
      ['relay', { artifactDirectory: './frontend/js/__generated__/~relay' }],
      'transform-class-properties',
      'polished',
    ];
    return {
      compact,
      env,
      presets,
      plugins,
    };
  }
};
