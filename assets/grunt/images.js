// Important to use `grunt` as an argument in the function
module.exports = function (grunt) {

  // Configure Clean task through config.merge as this task is used across multiple partials
  // Removes all existing images from dist directory
  grunt.config.merge({
    clean: {
      images: ['<%= opts.dist_dir %>/img/*']
    }
  });

  // Configure Imagemin task through config.merge as this task is used across multiple partials
  // Minifies all images from <build_dir>/img/ and outputs to <dist_dir>/img/
  grunt.config.merge({
    imagemin: {
      images: {
        files: [{
          expand: true,
          cwd: '<%= opts.build_dir %>/img/',
          src: ['**/*.{png,jpg,JPG,JPEG,jpeg,svg,gif}'],
          dest: '<%= opts.dist_dir %>/img/'
        }]
      }
    }
  });

  // Configure Watch task through config.merge as this task is used across multiple partials
  // Watches image files for changes and then runs tasks accordingly
  grunt.config.merge({
    watch: {
      images: {
        options: {
          event: ['changed', 'added', 'deleted']
        },
        files: ['<%= opts.build_dir %>/img/**/*.{png,jpg,JPG,JPEG,jpeg,svg,gif}'],
        tasks: ['clean:images', 'imagemin:images']
      }
    }
  });

};
