const gulp = require('gulp');
const fs = require('fs');
const fse = require('fs-extra');
const spawn = require('child_process').spawn;
const gp = require('gulp-load-plugins')();
const debug = require('gulp-debug');
const path = require('path');
const source = require('vinyl-source-stream');
const linkModules = require('./tasks/linkModules');
const watchify = require('watchify');
//const browserifyTask = require('tasks/browserify');


const serverSources = [
  'config/**/*.js', 'controllers/**/*.js', 'lib/**/*.js', 'renderer/**/*.js', 'routes/**/*.js',
  'setup/**/*.js', 'tasks/**/*.js', '*.js'
];

gulp.task('lint', gp.jshintCache({ src: serverSources }));

gulp.task('lint-or-die', gp.jshintCache({ src: serverSources, dieOnError: true }));

gulp.task('lint-watch', ['lint'], function(neverCalled) {
  gulp.watch(serverSources, ['lint']);
});

//gulp.task('lint', require('./tasks/lint-full-die')(serverSources));


gulp.task('watch', ['stylus'], function(neverCalled) {
  /*
   browserifyTask({
   src: 'app/js/index.js',
   dst: 'www/js'
   })();
   */

  fse.ensureDirSync('www/fonts');
  gp.dirSync('app/fonts', 'www/fonts');

  fse.ensureDirSync('www/img');
  gp.dirSync('app/img', 'www/img');

  fse.ensureDirSync('www/js');
  gp.dirSync('app/js', 'www/js');

  gulp.watch("app/**/*.sprites/**", ['sprite']);
  gulp.watch("app/**/*.styl", ['stylus']);

  gulp.watch(serverSources, ['link-modules']);
});

// Show errors if encountered
gulp.task('stylus', ['clean-compiled-css', 'sprite'], function() {
  return gulp.src('./app/stylesheets/base.styl')
    // without plumber if stylus emits PluginError, it will disappear at the next step
    // plumber propagates it down the chain
    .pipe(gp.plumber({errorHandler: gp.notify.onError("<%= error.message %>")}))
    .pipe(gp.stylus({use: [require('nib')()]}))
    .pipe(gp.autoprefixer("last 1 version"))
    .pipe(gulp.dest('./www/stylesheets'))
    .pipe(gp.livereload());
});

gulp.task('clean-compiled-css', function() {
  return gulp.src('./www/stylesheets/base.css').pipe(gp.rimraf());
});


gulp.task('import', function(callback) {
  const mongoose = require('config/mongoose');
  const taskImport = require('tutorial/tasks/import');

  taskImport({
    root:        path.join(path.dirname(__dirname), 'javascript-tutorial'),
    updateFiles: true // skip same size files
    //minify: true // takes time(!)
  })(function() {
    mongoose.disconnect();
    callback.apply(null, arguments);
  });
});

gulp.task('link-modules', linkModules(['modules/*', 'hmvc/*']));

gulp.task('sprite', gp.stylusSprite({
  spritesSearchFsRoot: 'app',
  spritesWebRoot:      '/img',
  spritesFsDir:        'www/img',
  styleFsDir:          'app/stylesheets/sprites'
}));
