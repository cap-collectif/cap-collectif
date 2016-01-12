exports.config = {
  overrides: {
    production: {
      plugins: {
        off: ['eslint-brunch'],
      }
    }
  },
  npm: {
    enabled: true,
    globals: {
      React: 'react', // For ReactIntl only
    }
  },
  paths: {
    watched: ['app/Resources'],
    public: 'web',
  },
  conventions: {
    assets: /^app\/Resources\/assets/,
  },
  files: {
    javascripts: {
      joinTo: {
        'js/vendor.js': [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/Readmore.js/readmore.min.js',
          'bower_components/ckeditor/ckeditor.js',
          'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',

          // safari polyfills
          'bower_components/es6-promise/promise.js',
          'bower_components/intl/Intl.js',
          'bower_components/intl/locale-data/jsonp/fr.js',
          // end

          /^node_modules/,

          'bower_components/fetch/fetch.js',
          // 'bower_components/react-intl/dist/locale-data/fr.js',

          'app/Resources/js/jsapi.js',
          'app/Resources/js/cookiechoices.js',
          'app/Resources/js/googleCharts.js',
          'app/Resources/js/browserUpdate.js',
          'app/Resources/js/modernizr.js',
        ],
        'js/app.js': [
          'app/Resources/js/synthesis.js',
          'app/Resources/js/app.js',
          'app/Resources/js/**/**/*.js'
        ],
        'js/ckeditor/ckeditor.js': [
          'bower_components/ckeditor/ckeditor.js'
        ],
        'js/jquery.minicolors.js': [
          'bower_components/jquery-minicolors/jquery.minicolors.js'
        ]
      }
    },
    stylesheets: {
      joinTo: {
        'css/style.css' : [
          'bower_components/bootstrap/assets/stylesheets/bootstrap.scss',
          'bower_components/css-spinners/css/spinners.css',
          'node_modules/quill/dist/quill.base.css',
          'node_modules/quill/dist/quill.snow.css',
          'app/Resources/scss/style.scss'
        ],
        'css/jquery.minicolors.css' : ['bower_components/jquery-minicolors/jquery.minicolors.css'],
        'css/style-admin.css' : ['app/Resources/scss/style-admin.scss'],
      }
    }
  },
  plugins: {
    babel: {
      stage: 0,
    },
    sass: {
      mode: 'native',
    },
    'fb-flo': {
      port: 8888,
    },
    cleancss: {
      keepSpecialComments: 0,
      removeEmpty: true,
    },
    uglify: {
      mangle: true,
      compress: false,
    },
  }
};
