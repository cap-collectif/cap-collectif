exports.config = {
  overrides: {
    production: {
      optimize: true,
      sourceMaps: false,
    },
  },
  npm: {
    enabled: true,
    globals: process.env.NODE_ENV === 'development' ? { axe: 'react-axe' } : {},
    styles: {
      quill: ['dist/quill.base.css', 'dist/quill.snow.css'],
      'react-select': ['dist/react-select.css'],
      'react-toggle': ['style.css'],
      'react-datetime': ['css/react-datetime.css'],
      leaflet: ['dist/leaflet.css'],
    },
  },
  paths: {
    watched: ['app/Resources/scss', 'app/Resources/assets/fonts', 'app/Resources/assets/js'],
    public: 'web',
  },
  conventions: {
    assets: /^app\/Resources\/assets/,
    ignored: [
      /^app\/Resources\/scss\/(modules|base)/,
      /^codemod/,
      'bower_components/iframe-resizer/js/iframeResizer.contentWindow.js',
      'bower_components/bootstrap-sass/assets/stylesheets/_bootstrap.scss',
      'bower_components/compass-mixins/lib/_compass.scss',
      'app/Resources/js-server/registration.js',
      /-stories.js$/,
      /-test.js$/,
      /.snap$/,
    ],
  },
  files: {
    stylesheets: {
      joinTo: {
        'css/style.css': [
          'bower_components/bootstrap/assets/stylesheets/bootstrap.scss',
          /^node_modules/,
          'app/Resources/scss/style.scss',
        ],
        'css/print.css': ['app/Resources/scss/print.scss'],
        'css/jquery.minicolors.css': ['bower_components/jquery-minicolors/jquery.minicolors.css'],
        'css/style-admin.css': ['app/Resources/scss/style-admin.scss', /^node_modules/],
      },
    },
  },
  plugins: {
    sass: {
      mode: 'native',
    },
    cleancss: {
      keepSpecialComments: 0,
      removeEmpty: true,
    },
    uglify: {
      mangle: true,
      output: {
        comments: false, // remove comments
      },
      toplevel: true,
      compress: true,
    },
  },
};
