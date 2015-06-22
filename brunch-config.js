'use strict';

exports.config = {
  overrides: {
    production: {
      plugins: {
        'fb-flo': {
          'enabled': false
        }
      }
    }
  },
  paths: {
    'watched': ['app/Resources'],
    'public': 'web'
  },
  modules: {
    definition: false,
    wrapper: false
  },
  conventions: {
    'assets': /^app\/Resources\/assets/
  },
  files: {
    javascripts: {
      joinTo: {
        'js/vendor.js': [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/readmore/readmore.js',
          'bower_components/ckeditor/ckeditor.js',
          'bower_components/bootstrap/assets/javascripts/bootstrap/*.js',
          'bower_components/fancybox/source/jquery.fancybox.pack.js',
          'app/Resources/js/jsapi.js',
          'bower_components/mailcheck/src/mailcheck.js',
          'app/Resources/js/cookiechoices.js',
          'app/Resources/js/googleCharts.js'
        ],
        'js/app.js': [
          'app/Resources/js/app.js'
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
          'app/Resources/scss/style.scss'
        ],
        'css/jquery.minicolors.css' : ['bower_components/jquery-minicolors/jquery.minicolors.css'],
        'css/style-admin.css' : ['app/Resources/scss/style-admin.scss'],
      }
    }
  },
  plugins: {
    sass: {
      allowCache: true,
      mode: 'native',
      options: {
        includePaths: ['bower_components/bootstrap/assets/stylesheets/bootstrap']
      }
    },
    'fb-flo': {
      'port': 8888
    },
    cleancss: {
      keepSpecialComments: 0,
      removeEmpty: true
    },
    uglify: {
      mangle: true,
      compress: false
    }
  }
};
