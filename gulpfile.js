require('es6-promise').polyfill();

// Set up required modules
const { parallel, series, src, dest, watch } = require('gulp');
const rename      = require('gulp-rename');
const banner      = require('gulp-banner');
const sourcemaps  = require('gulp-sourcemaps');
const pkg         = require('./package.json');
const browsersync = require('browser-sync').create();
const php         = require('gulp-connect-php');
const fs          = require('fs');
const path        = require('path');
const glob        = require('glob');
const del         = require('del');

var eslint        = require('gulp-eslint');
var phplint       = require("gulp-phplint");
var imagemin      = require('gulp-imagemin');
var uglify        = require('gulp-uglify');
var concat        = require('gulp-concat');
var sass          = require('gulp-sass')(require('sass'));
var postcss       = require('gulp-postcss');
var pxtorem       = require('postcss-pxtorem');
var autoprefixer  = require('autoprefixer');
var cssnano       = require('cssnano');

// Sets options which are used later on in this file
const opts = {
  src_dir: './src',
  dist_dir: './dist',
  bannerText: '/**\n' +
  ' * <%= pkg.name %> v<%= pkg.version %>\n' +
  ' * <%= pkg.description %>\n' +
  ' * <%= pkg.homepage %>\n' +
  ' *\n' +
  ' * Copyright ' + new Date().getFullYear() + ', <%= pkg.author.name %> (<%= pkg.author.url %>)\n' +
  ' * Released under the <%= pkg.license %> license.\n' +
  ' */\n\n'
};

// Starts up a php server and initializes browserSync
function phpServer() {
  php.server({
    base: './',
    port: 3000,
  }, function (){
    browsersync.init({
      proxy: '127.0.0.1:3000',
      baseDir: "./"
    });
  });
}

// Task to manually reload browserSync
function browsersyncReload(done){
  browsersync.reload();
  done();
}

// Tasks which watch for changes in specified files/dirs and run tasks based on filetypes edited
function watchTask() {

  watch(opts.src_dir + '/img/**', series(imagesClean, imagesMinify));

  watch(['**/*.php', '*.php', '!node_modules/**'], phpLint);
  watch(['**/*.html', '*.html', '!node_modules/**'], browsersyncReload);

  watch(opts.src_dir + '/scss/**/!(__all).scss', series(sassAutomaticImports, sassProcess));

  watch(opts.src_dir + '/js/**/*.js', series(javascriptLint, javascriptProcess));
  watch('./gulpfile.js', series(
    gulpfileLint,
    buildScripts
  ));

}

// Tasks which run when this file is edited (when watch is running)
function gulpfileLint() {
  return src('./gulpfile.js')
    .pipe(eslint())
    .pipe(eslint.format());
};

// Tasks to process php
function phpLint(done) {

  return src(['**/*.php', '*.php', '!node_modules/**'])
  .pipe(phplint('', { skipPassedFiles:true }))
  .pipe(phplint.reporter(function(file){
    var report = file.phplintReport || {};
    if (report.error) {
      console.error(report.message + ' on line ' + report.line + ' of ' + report.filename);
    }
  }))
  .pipe(browsersync.reload({ stream: true }));

  done();
}

function imagesClean(done) {
  return del(opts.dist_dir + '/img');
  done();
}

function imagesMinify() {

  return src(opts.src_dir + '/img/**/*.{png,jpg,JPG,JPEG,jpeg,svg,gif}')
    .pipe(imagemin())
    .pipe(dest(opts.dist_dir + '/img'))
    .pipe(browsersync.reload({ stream: true }));
}

// eslint all first party JS
function javascriptLint(done) {
  return src([
    opts.src_dir + '/js/settings/**/*.js',
    opts.src_dir + '/js/project/**/*.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format());

  done();
}

// Tasks which process the core javascript files
function javascriptProcess() {

  return src([
    opts.src_dir + '/js/settings/**/*.js',
    'node_modules/jellyfish-ui/dist/js/jellyfish.min.js',
    opts.src_dir + '/js/vendor/**/*.js',
    opts.src_dir + '/js/project/**/*.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('project.min.js'))
    .pipe(uglify({ mangle: true }))
    .pipe(banner(opts.bannerText, {
      pkg: pkg
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(opts.dist_dir + '/js'))
    .pipe(browsersync.reload({ stream: true }));
}

// Recursive task which traverses a directory and it's subdirectories to compile an array of all sass partials
const getSassDirPartials = function (dirPath, arrayOfFiles, relativeDir = '') {

  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getSassDirPartials(dirPath + "/" + file, arrayOfFiles, path.join(relativeDir, file));
    }
    else if (
      // Exclude the dynamically generated file
      file !== '__all.scss' &&
      // Only include _*.scss files
      path.basename(file).substring(0, 1) === '_' &&
      path.extname(file) === '.scss'
    ) {
      arrayOfFiles.push(path.join(relativeDir, file));
    }
  });
  return arrayOfFiles;
};

/**
 * Dynamically import SASS files into partials. Modified with the two refs below
 * @see https://nateeagle.com/2014/05/22/sass-directory-imports-with-gulp/
 * @see https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
 */
function sassAutomaticImports(done) {

  // Array of directories where the __all files exist
  var srcFiles = opts.src_dir + [
    '/scss/**/__all.scss'
  ];

  glob(srcFiles, function (error, files) {

		files.forEach(function (allFile) {
			// Add a banner to warn users
      fs.writeFileSync(allFile,
       '// This file imports all other underscore-prefixed .scss files in this directory and sub-directories.\n'+
       '// It is automatically generated by gulp. Do not directly modify this file.\n\n'
       );

      var directory = path.dirname(allFile);
      try {

        let partials = getSassDirPartials(directory);

        // Append import statements for each partial
        partials.forEach(function (partial) {
          partial = partial.replace('_', '');
          partial = partial.replace('.scss', '');
          fs.appendFileSync(allFile, '@import "' + partial + '";\n');
        });

      } catch(error) {
        console.log(error);
      }
		});
	});

	done();
};

// Tasks which run on sass files
function sassProcess () {

    var processors = [
      autoprefixer(),
      pxtorem({
        rootValue: 16,
        unitPrecision: 2, // Decimal places
        propList: ['*'], // Apply to all elements
        replace: true, // False enables px fallback
        mediaQuery: false, // Do not apply within media queries (we use em instead)
        minPixelValue: 0
      }),
      cssnano()
    ];
  return src(opts.src_dir + '/scss/compile.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({includePaths: ['node_modules']}).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(rename('style.min.css'))
    .pipe(banner(opts.bannerText, {
      pkg: pkg
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(opts.dist_dir + '/css'))
    .pipe(browsersync.reload({ stream: true }));
}

// Tasks which run on $ gulp build
const buildScripts =
  parallel(
    phpLint,
    series(imagesClean,imagesMinify),
    series(sassAutomaticImports,sassProcess),
    series(javascriptLint,javascriptProcess)
  );

// Tasks which run on $ gulp
const serverScripts = parallel(
  phpServer,
  watchTask
);

exports.reload = browsersyncReload;
exports.build = buildScripts;
exports.default = serverScripts;
exports.init = series(
  buildScripts,
  serverScripts
);
