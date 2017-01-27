module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: [
        'app/**/*.js',
        'test/**/*.js',
        'server/**/*.js'
      ],
      options: {
        globals: {
          window: true,
          document: true,
          navigator: true,
          console: true,
          module: true,
          require: true,
          FastClick: true,
          $: true,
          Backbone: true,
          Parse: true,
          Handlebars: true,
          _: true,
          google: true,
          config: true,
          ga: true,
          test: true,
          ok: true,
          equal: true,
          deepEqual: true
        },
        undef: true,
        debug: true,
        '-W030': true
      }
    },

    simplemocha: {
      options: {
        timeout: 3000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'dot'
      },

      all: {src: 'test/unit/**/*.js'}
    },

    watch: {
      files: [
        'Gruntfile.js',
        'app/**/*',
        'server/**/*',
        'vendor/**/*',
        '!vendor/**/*.min.*',
        'test/**/*'
      ],
      tasks: ['default']
    },

    sass: {
      options: {includePaths: ['.']},
      app: {src: 'app/css/app.scss', dest: 'tmp/copenhelp.css'}
    },

    browserify: {
      options: {transform: ['hbsfy']},
      app: {src: 'app/js/app.js', dest: 'tmp/app.js',
        options: {alias: [
          './app/js/models/facility:cloud/models/facility',
          './app/js/models/service:cloud/models/service',
          './app/js/models/hours:cloud/models/hours',
          './app/js/lib/categories:cloud/lib/categories'
        ]}
      }
    },

    cssmin: {
      app: {src: 'tmp/copenhelp.css', dest: 'tmp/copenhelp.css'}
    },

    concat: {
      // Not a target, just a variable that we can interpolate in elsewhere.
      shared_js: [
        'vendor/js/jquery-2.0.3.js',
        'vendor/js/jquery.serialize-object.js',
        'vendor/js/underscore.js',
        'vendor/js/backbone-1.0.0.js',
        'vendor/js/parse-1.2.12.js'
      ],

      shared_js_minified: [
        'vendor/js/jquery-2.0.3.min.js',
        'vendor/js/jquery.serialize-object.min.js',
        'vendor/js/underscore.min.js',
        'vendor/js/backbone-1.0.0.min.js',
        'vendor/js/parse-1.2.12.min.js'
      ],

      app: {
        src: [
          '<%= concat.shared_js %>',
          'vendor/js/backbone_filters.js',
          'vendor/js/jquery.switch.js',
          'vendor/js/bootstrap-button.js',
          'vendor/js/fastclick.js',
          'tmp/app.js'
        ],
        dest: 'tmp/copenhelp.js'
      },

      app_min: {
        src: [
          '<%= concat.shared_js_minified %>',
          'vendor/js/backbone_filters.min.js',
          'vendor/js/jquery.switch.min.js',
          'vendor/js/bootstrap-button.min.js',
          'vendor/js/fastclick.min.js',
          'tmp/app.min.js'
        ],
        dest: 'tmp/copenhelp.js'
      }
    },

    uglify: {
      options: {
        mangle: false,
        preserveComments: false,
        report: 'min'
      },

      vendor: {
        files: {
          'vendor/js/jquery.serialize-object.min.js': 'vendor/js/jquery.serialize-object.js',
          'vendor/js/backbone_filters.min.js': 'vendor/js/backbone_filters.js',
          'vendor/js/bootstrap-button.min.js': 'vendor/js/bootstrap-button.js'
        }
      },
      app: {files: {'tmp/app.min.js': 'tmp/app.js'}}
    },

    clean: {
      build: {src: 'build/*', filter: function(filepath) {return filepath !== 'build/.gitkeep';}},
      tmp: {src: 'tmp/*', filter: function(filepath) {return filepath !== 'tmp/.gitkeep'; }},
      test: {src: 'test/acceptance/app.html'}
    },

    cachebuster: {
      all: {
        files: {src: [
          'tmp/copenhelp.js',
          'tmp/copenhelp.css'
        ]},
        options: {
          complete: function(hashes) {
            var keyMap = {
              'tmp/copenhelp.js':        'appJs',
              'tmp/copenhelp.css':       'appCss'
            };

            var config = {
              parseAppId: process.env.PARSE_APP_ID,
              parseJsKey: process.env.PARSE_JS_KEY,
              gaToken:    process.env.GOOGLE_ANALYTICS_TOKEN,
              gaHost:     process.env.GOOGLE_ANALYTICS_HOST
            };

            Object.keys(hashes).forEach(function(key) {
              var matches = key.match(/^tmp\/(.*)(\..*)$/); // tmp/(filename)(.js)
              var outputFile = matches[1] + '-' + hashes[key] + matches[2];

              grunt.file.copy(key, 'build/' + outputFile);
              config[keyMap[key]] = outputFile;
            });

            grunt.file.write('build/index.html',
              grunt.template.process(grunt.file.read('app/index.html'), {data: config})
            );

            grunt.file.write('test/acceptance/app.html',
              grunt.template.process(grunt.file.read('test/acceptance/app.html.template'), {data: config})
            );
          }
        }
      }
    },

    qunit: {all: ['test/acceptance/**/*.html']},

    env: {
      dev: {src: '.env.dev'},
      prod: {src: '.env.prod'}
    },

    autoprefixer: {
      options: {
        browsers: [
          'android >= 2.3',
          'last 3 versions'
        ]
      },
      all: {
        src: ['tmp/copenhelp.css']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-cachebuster');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-aws-s3');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('build:common', [
    'clean',
    'jshint',
    'simplemocha',
    'sass',
    'autoprefixer',
    'browserify'
  ]);

  grunt.registerTask('build:dev', [
    'env:dev',
    'build:common',
    'concat:app',
    'cachebuster',
    'qunit'
  ]);

  grunt.registerTask('build:prod', [
    'env:prod',
    'build:common',
    'cssmin', 'uglify',
    'concat:app_min',
    'cachebuster',
    'qunit'
  ]);
  grunt.registerTask('default', 'build:prod');

  grunt.registerTask('deploy:dev', [
    'build:dev',
    'aws_s3:dev',
    'clean'
  ]);

  grunt.registerTask('deploy:prod', [
    'build:prod',
    'aws_s3:prod',
    'clean'
  ]);
};
