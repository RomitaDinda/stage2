// generated on 2019-06-12 using generator-webapp 4.0.0-5
const { src, dest, watch, series, parallel, lastRun } = require('gulp');
const gulp = require("gulp");
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const { argv } = require('yargs');
const source = require('vinyl-source-stream');
const browserify = require('browserify');
const babelify = require('babelify');
const runSequence = require('gulp4-run-sequence').use(gulp);
const wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const serverY = browserSync;

let devFlag = true;

const port = argv.port || 9000;

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const isDev = !isProd && !isTest;


// CSS
gulp.task('css', function () {
  return gulp
    .src("app/css/*.css")
    .pipe($.if(devFlag, $.sourcemaps.init()))
    .pipe(
      $.autoprefixer({ browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'] })
    )
    .pipe($.if(devFlag, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({ stream: true }));
});

// JS
gulp.task('js', () => {
  return gulp
    .src('app/js/**/*.js')
    .pipe($.plumber())
    .pipe($.if(devFlag, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(devFlag, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/js'))
    .pipe(reload({ stream: true }));
});

gulp.task('dbhelper', () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform(babelify)
    .require('app/js/dbhelper.js', { entry: true })
    .bundle()
    .pipe(source('dbhelper.js'))
    .pipe(gulp.dest('.tmp/js/'));
});

gulp.task('sw', () => {
  const bsf = browserify({
    debug: true
  });

  return bsf
    .transform(babelify)
    .require('app/sw.js', { entry: true })
    .bundle()
    .pipe(source('sw.js'))
    .pipe(gulp.dest('.tmp/'));
});


const lintBase = files => {
  return src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!serverY.active, $.eslint.failAfterError()));
}

function lint() {
  return lintBase('app/scripts/**/*.js')
    .pipe(dest('app/scripts'));
};

function lintTest() {
  return lintBase('test/spec/**/*.js')
    .pipe(dest('test/spec'));
};

gulp.task('lint', () => {
  return lint('app/js/**/*.js').pipe(gulp.dest('app/js'));
});

gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js').pipe(gulp.dest('test/spec'));
});

gulp.task('html', gulp.series('css', 'js', 'dbhelper', 'sw', () => {

  return gulp
    .src('app/*.html')
    .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
    .pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
    .pipe($.if(/\.css$/, $.cssnano({ safe: true, autoprefixer: false })))
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
    .pipe(gulp.dest('dist'));
}));

function html() {
  return src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.postcss([cssnano({safe: true, autoprefixer: false})])))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(dest('dist'));
}

gulp.task('fonts', () => {
  return gulp
    .src(
      require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function(
        err
      ) {}).concat('app/fonts/**/*')
    )
    .pipe($.if(devFlag, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

gulp.task('images', () => {
  return gulp
    .src('app/img/**/*')
    //.pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('icons', () => {
  return gulp.src('app/icons/**/*').pipe(gulp.dest('dist/icons'));
});

gulp.task('extras', () => {
  return gulp
    .src(['app/*', '!app/*.html'], {
      dot: true
    })
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', () => {
  runSequence(
    ['clean', 'wiredep'],
    ['html', 'css', 'js', 'dbhelper', 'sw', 'fonts'], () => {
      browserSync.init({
        notify: false,
        port: 8000,
        server: {
          baseDir: ['.tmp', 'app'],
          routes: {
            '/bower_components': 'bower_components'
          }
        }
      });

      gulp
        .watch([
          'app/*.html',
          'app/images/**/*',
          'app/icons/**/*',
          '.tmp/fonts/**/*'
        ])
        .on("change", reload);

      gulp.watch('app/css/**/*.css', ['html', 'css']);
      gulp.watch('app/js/**/*.js', ['html', 'js']); //"dbhelper"
      gulp.watch('app/sw.js', ['sw']);
      gulp.watch('app/fonts/**/*', ['fonts']);
      gulp.watch('bower.json', ['wiredep', 'fonts']);
    }
  );
});

gulp.task('serve:test', gulp.series('js', () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/js': '.tmp/js',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
}));

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean', 'wiredep'], 'build', resolve);
  });
});

gulp.task('serve:dist', gulp.series('default', () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
}));

// inject bower components
gulp.task('wiredep', () => {
  gulp
    .src('app/*.html')
    .pipe(
      wiredep({
        ignorePath: /^(\.\.\/)*\.\./
      })
    )
    .pipe(gulp.dest('app'));
});

gulp.task(
  'build',
  gulp.series('lint', 'html', 'images', 'icons', 'fonts', 'extras',
  () => {
    return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
  }
));

function measureSize() {
  return src('dist/**/*')
    .pipe($.size({title: 'build', gzip: true}));
}

// Clean output directory
gulp.task('clean', function () {
  del(['tmp/*', 'dist/*']);
});

