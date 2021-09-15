// Important to use `grunt` as an argument in the function
module.exports = function (grunt) {

  // Configure Browsersync task
  // browserSync watches files defined in src, and on change reloads the browser
  grunt.config('browserSync', {
    bsFiles: {
      src: [
        '<%= opts.dist_dir %>/css/style.min.css',
        '<%= opts.dist_dir %>/js/project.min.js',
        '<%= opts.dist_dir %>/img/*',
        '**/*.html',
        '**/*.php'
      ]
    },
    options: {
      proxy: '<%= php.dev.options.hostname %>:<%= php.dev.options.port %>',
      watchTask: true,
      open: true,
      port: 3000
    }
  });

};
