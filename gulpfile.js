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
gulp.task("css", function () {
  return gulp
    .src("app/css/*.css")
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({ stream: true }));
});

gulp.task("js", () => {
  return gulp
    .src(["app/js/**/*.js", "!app/js/**/dbhelper.js"])
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write(".")))
    .pipe(gulp.dest(".tmp/js"))
    .pipe(reload({ stream: true }));
});

gulp.task("sw", () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform(babelify)
    .require("app/sw.js", { entry: true })
    .bundle()
    .pipe(source("sw.js"))
    .pipe(gulp.dest(".tmp/"));
});

gulp.task("dbhelper", () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform(babelify)
    .require("app/js/dbhelper.js", { entry: true })
    .bundle()
    .pipe(source("dbhelper.js"))
    .pipe(gulp.dest(".tmp/js/"));
});

function lint(files) {
  return gulp
    .src(files)
    .pipe($.eslint({ fix: false }))
    .pipe(reload({ stream: true, once: true }))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task("lint", () => {
  return lint("app/js/**/*.js").pipe(gulp.dest("app/js"));
});
gulp.task("lint:test", () => {
  return lint("test/spec/**/*.js").pipe(gulp.dest("test/spec"));
});

gulp.task("html", gulp.series("css", done => {
  return gulp
    .src("app/*.html")
    .pipe($.useref({ searchPath: [".tmp", "app", "."] }))
    .pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
    //.pipe($.if(/\.css$/, $.cssnano({ safe: true, autoprefixer: false })))
    .pipe(
      $.if(
        /\.html$/,
        $.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: { compress: { drop_console: true } },
          processConditionalComments: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        })
      )
    )
    .pipe(gulp.dest(".tmp"))
    .pipe(gulp.dest("dist"));
    done();
})
);

gulp.task("imagemin", done => {
  gulp.src("app/img/**/*.*")
    .pipe(imagemin([
            imageminMozjpeg({
                quality: 50
            })
        ], {
      verbose: true
    }))
    .pipe(gulp.dest(".tmp/img"))
    .pipe(gulp.dest("dist/img"));
    done();
});

gulp.task("icons", () => {
  return gulp.src("app/icons/**/*")
  .pipe(gulp.dest(".tmp/icons"))
  .pipe(gulp.dest("dist/icons"));
});

gulp.task("fonts", () => {
  return gulp
    .src(
      require("main-bower-files")("**/*.{eot,svg,ttf,woff,woff2}", function(
        err
      ) {}).concat("app/fonts/**/*")
    )
    .pipe($.if(dev, gulp.dest(".tmp/fonts"), gulp.dest("dist/fonts")));
});

gulp.task("extras", () => {
  return gulp
    .src(["app/*", "!app/*.html"], {
      dot: true
    })
    .pipe(gulp.dest("dist"));
});

gulp.task("clean", del.bind(null, [".tmp", "dist"]));

gulp.task("watch", done => {
  gulp.watch("app/js/**/*.js", gulp.series("js", "dbhelper"));
  gulp.watch("app/sw.js", gulp.series("sw"));
  gulp.watch('app/*.html').on('change', browserSync.reload);
  gulp.watch("app/css/**/*.css", gulp.series("css"));
  gulp.watch("app/fonts/**/*", gulp.series("fonts"));
  done();
});

gulp.task("serve", () => {
  runSequence(
    ["clean"],
    ["imagemin"],
    ["lint", "html", "js", "dbhelper", "sw", "icons", "fonts", "extras"],
    () => {
      browserSync.init({
        notify: false,
        port: 8001,
        server: {
          baseDir: [".tmp"]
        }
      });
    gulp.watch("app/js/**/*.js", gulp.series("js", "dbhelper"));
    gulp.watch("app/sw.js", gulp.series("sw"));
    gulp.watch('app/*.html').on('change', browserSync.reload);
    gulp.watch("app/css/**/*.css", gulp.series("css"));
    gulp.watch("app/fonts/**/*", gulp.series("fonts"));
    }
  );
});

gulp.task("serve:test", gulp.series("js", done => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: "test",
      routes: {
        "/js": ".tmp/js",
        "/bower_components": "bower_components"
      }
    }
  });

  gulp.watch("app/js/**/*.js", ["js"]);
  gulp.watch(["test/spec/**/*.js", "test/index.html"]).on("change", reload);
  gulp.watch("test/spec/**/*.js", ["lint:test"]);
  done();
}));

// clear out all files and folders from build folder
gulp.task('build:cleanfolder', done => {
  del.bind(null, ["dist"]);
  done();
});


// task to create build directory for all files
gulp.task("build:copy", function() {
  return gulp.src("app/**/*/")
  .pipe(gulp.dest("dist/"));
});


gulp.task("build", gulp.series("build:cleanfolder", "build:copy"), () => {
    return gulp.src("dist/**/*").pipe($.size({ title: "build", gzip: true }));
  });

gulp.task("default", gulp.series( "build", "serve", done => {
    dev = false;
    done();
  }));

gulp.task("serve:dist", gulp.series("default", done => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ["dist"]
    }
  });
  done();
}));
