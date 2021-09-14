// Important to use `grunt` as an argument in the function
module.exports = function (grunt) {

  // Configure ESlint task through config.merge as this task is used across multiple partials
  // Validates Javascript files
  grunt.config.merge({
    eslint: {
      gruntfiles: [
        'Gruntfile.js',
        '<%= opts.build_dir %>/grunt/**/*.js'
      ]
    }
  });

  // Configure Watch task through config.merge as this task is used across multiple partials
  // rerun $ build when the Gruntfile or partials are edited
  grunt.config.merge({
    watch: {
      gruntfile: {
        files: ['Gruntfile.js','<%= opts.build_dir %>/grunt/**/*.js'],
        tasks: ['eslint:gruntfiles', 'build'],
        options: {
          event: ['changed', 'added', 'deleted']
        }
      },
    }
  });

};
