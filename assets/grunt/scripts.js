// Important to use `grunt` as an argument in the function
module.exports = function (grunt) {

  // Configure Concat task
  // Task to concatenate js files together separated by a line break
  grunt.config('concat', {
    options: {
      sourceMap: false,
      separator: ';\r\n'
    },
    dist: {
      src: ['node_modules/jellyfish-ui/dist/js/jellyfish.min.js', '<%= opts.build_dir %>/js/vendor/**/*.js', '<%= opts.build_dir %>/js/project/**/*.js'],
      dest: '<%= opts.dist_dir %>/js/project.js',
    }
  });

  // Configure Uglify task
  // Minifies javascript file(s)
  grunt.config('uglify', {
    options: {
      mangle: false,
      banner: '<%= opts.banner %>'
    },
    dist: {
      files: {
        '<%= opts.dist_dir %>/js/project.min.js': ['<%= opts.dist_dir %>/js/project.js']
      }
    }
  });

  // Configure ESlint task through config.merge as this task is used across multiple partials
  // Validates Javascript files
  grunt.config.merge({
    eslint: {
      site: [
        '<%= opts.build_dir %>/js/project/**/*.js' // Validates javascript files in js/project only (doesn't validate vendor JS)
      ],
    }
  });

  // Configure Watch task through config.merge as this task is used across multiple partials
  // Watches javascript files for changes and then runs tasks accordingly
  grunt.config.merge({
    watch: {
      scripts: {
        options: {
          event: ['changed', 'added', 'deleted']
        },
        files: ['<%= opts.build_dir %>/js/**/*.js'],
        tasks: ['newer:eslint:site', 'concat', 'uglify']
      }
    }
  });

};
