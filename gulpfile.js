// generated on 2019-06-17 using generator-webapp 4.0.0-5
var gulp = require('gulp');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var image = require('gulp-image');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const del = require('del');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');
const runSequence = require('gulp4-run-sequence').use(gulp);
const gulpLoadPlugins = require('gulp-load-plugins');

const reload = browserSync.reload;
const $ = gulpLoadPlugins();

let dev = true;

// CSS
gulp.task('css', function () {
  return gulp
    .src('app/css/*.css')
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({ stream: true }));
});

gulp.task('styles', function() {
  return gulp.src('app/sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream());
});

gulp.task('scripts-index', done => {
  browserify(['app/js/main.js', 'app/js/dbhelper.js', 'app/js/register.js', 'app/sw.js'])
    .transform(babelify.configure({
      presets: ['@babel/preset-env']
    }))
    .bundle()
    .pipe(source('index.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps')) // You need this if you want to continue using the stream with other plugins
    .pipe(gulp.dest('app/bundle_js'))
    .pipe(gulp.dest('dist/bundle_js'));
    done();
});

gulp.task('scripts-restaurant', done => {
  browserify(['app/js/restaurant_info.js', 'app/js/dbhelper.js', 'app/js/register.js', 'app/sw.js'])
    .transform(babelify.configure({
      presets: ['@babel/preset-env']
    }))
    .bundle()
    .pipe(source('restaurant.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('maps')) // You need this if you want to continue using the stream with other plugins
    .pipe(gulp.dest('app/bundle_js'))
    .pipe(gulp.dest('dist/bundle_js'));
    done();
});

gulp.task('watch', done => {
  gulp.watch(['app/sw.js', 'app/js/**/*.js'], gulp.series('scripts-index', 'scripts-restaurant'));
  done();
});

gulp.task('copy-files', () => {
  return gulp.src(['app/index.html', 'app/restaurant.html', 'manifest.json'])
    .pipe(gulp.dest('dist'));
});

gulp.task('imagemin', done => {
  gulp.src('app/img/**/*.*')
    .pipe(imagemin([
            imageminMozjpeg({
                quality: 50
            })
        ], {
      verbose: true
    }))
    .pipe(gulp.dest('dist/img'))
    .pipe(gulp.dest('app/img'));
    done();
});

gulp.task('serve', 
  gulp.series('scripts-restaurant', () => {
    browserSync.init({
      notify: false,
      port: 8000,
      server: {
        baseDir: ["app"]
      }
    });
  gulp.watch('app/sass/**/*.scss', gulp.series('styles'));
  gulp.watch('app/**/**.html').on('change', browserSync.reload);
  gulp.watch('app/bundle_js/**/*.js').on('change', browserSync.reload);
}));

gulp.task("serve:dist", () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ["dist/app"]
    }
  });
});

gulp.task("clean", del.bind(null, ["app/bundle_js", "dist"]));

gulp.task('dist', gulp.series('clean', 'copy-files', 'imagemin', 'styles', 'scripts-index', 'scripts-restaurant'));
gulp.task('default', gulp.series('clean', 'copy-files', 'css', 'imagemin', 'scripts-index', 'scripts-restaurant', 'watch', 'serve'));
//gulp.task('default', gulp.series('serve'));
