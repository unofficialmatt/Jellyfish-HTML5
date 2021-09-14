// Important to use `grunt` as an argument in the function
module.exports = function (grunt) {

  // Configure Sass task
  // Task to run sass on defined scss file(s)
  grunt.config('sass', {
    options: {
      implementation: require('node-sass'), // Use Node-sass as implementation option, rather than dart-sass
      sourceMap: true
    },
    dist: {
      files: [{
        src: '<%= opts.build_dir %>/scss/compile.scss',
        dest: '<%= opts.dist_dir %>/css/style.css'
      }
      ]
    }
  });

  // Configure Postcss task
  // Task to run postcss on files in dist/css/ and apply additional processors
  grunt.config('postcss', {
    options: {
      map: false,
      processors: [
        require('autoprefixer')(),
        require('postcss-pxtorem')({
          rootValue: 16,
          unitPrecision: 2, // Decimal places
          propList: ['*'], // Apply to all elements
          replace: true, // False enables px fallback
          mediaQuery: false, // Do not apply within media queries (we use em instead)
          minPixelValue: 0
        }),
        require('cssnano')() // minify the result
      ]
    },
    dist: {
      files: [{
        src: '<%= opts.dist_dir %>/css/style.css',
        dest: '<%= opts.dist_dir %>/css/style.min.css'
      }
      ]
    }
  });

  grunt.config('import_sass_from_dirs', {
    // This is an arbitrary name for this sub-task
    src: {
      files: {
        // Put an _all.scss file in any directory inside our scss files, and
        // this task will write @import statements for every other _*.scss
        // file in that directory. Then simply @import your _all.scss file to
        // import the contents of the directory.
        src: ['<%= opts.build_dir %>/scss/**/__all.scss']
      }
    }
  });

  // Configure Usebanner task through config.merge as this task is used across multiple partials
  // Appends a banner to the top of the outputted CSS file(s)
  grunt.config.merge({
    usebanner: {
      styles: {
        options: {
          position: 'top',
          banner: '<%= opts.banner %>',
          linebreak: true
        },
        files: {
          src: ['<%= opts.dist_dir %>/css/*.css']
        }
      }
    }
  });

  // Configure Watch task through config.merge as this task is used across multiple partials
  // Watches scss files for changes and then runs tasks accordingly
  grunt.config.merge({
    watch: {
      styles: {
        options: {
          event: ['changed', 'added', 'deleted']
        },
        files: ['<%= opts.build_dir %>/scss/**/*.scss'],
        tasks: ['import_sass_from_dirs', 'sass', 'postcss', 'usebanner:styles']
      }
    }
  });

};
