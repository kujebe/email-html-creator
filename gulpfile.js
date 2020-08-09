const gulp = require("gulp");
const sass = require("gulp-sass");
const browserSync = require("browser-sync").create();
const inlineCss = require("gulp-inline-css");
const replace = require("gulp-replace");
const rename = require("gulp-rename");
const pug = require("gulp-pug");

//function to compile scss into css
function compileStyles() {
  return (
    gulp
      //1. locate  scss files
      .src("./src/scss/**/*.scss")
      //2. Pass scss file through compiler
      .pipe(sass().on("error", sass.logError))
      //3. save compiled css files
      .pipe(gulp.dest("./src/css"))
    //4. Stream changes to all browsers
    // .pipe(browserSync.stream())
    // .pipe(browserSync.reload({ stream: true }))
    // );
  );
}

function build() {
  return (
    gulp
      // import all email template (name ending with .template.pug) files from src/emails folder
      //1 Where are the html files located
      .src("src/templates/**/*.template.pug")

      // replace `.scss` file paths from template with compiled file paths
      //2 Rename the extension of the scss files included in the htmls
      .pipe(replace(new RegExp("/scss/(.+).scss", "ig"), "/css/$1.css"))

      // compile pug files
      .pipe(pug())

      //3 inline the styles
      .pipe(inlineCss())

      // do not generate sub-folders inside dist folder
      //4 don't rename the sub-folders after compilation
      .pipe(rename({ dirname: "" }))

      // 5 compile into dist directory in the root
      .pipe(gulp.dest("dist"))
  );
}

//Watch task
function watch() {
  //1 initiate browser syncronization
  browserSync.init({
    server: { baseDir: "./dist" },
  });
  //2 watch changes in src/scss dir, then compile and rebuild again
  gulp.watch(
    ["./src/scss/*", "!src/**/*.css"],
    gulp.series(compileStyles, build)
  );
  //3 watch changes in the templates directory, then rebuild and refresh browser
  gulp
    .watch(["./src/templates/**/*.template.pug"])
    .on("change", gulp.series(build, browserSync.reload));
  //4 whatch js files changes in case you want to add js files
  //gulp.watch("./src/js/**/*.js").on("change", browserSync.reload);
}
//export styles compilation task - can be used externally in gulp-cli
exports.compileStyles = compileStyles;
// export build task - can be used externally in gulp-cli
exports.build = build;
// When you run `gulp watch, compile styles and build in order, then start to watch for changes`
exports.watch = gulp.series([compileStyles, build], watch);
