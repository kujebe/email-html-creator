// This is INCORRECT
const { src, dest, watch, series } = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const inlineCss = require("gulp-inline-css");
const replace = require("gulp-replace");
const rename = require("gulp-rename");
const pug = require("gulp-pug");

function compileSass() {
  //1. locate  scss files
  return (
    src("./src/scss/**/*.scss")
      //2. Pass scss file through compiler
      .pipe(sass().on("error", sass.logError))
      //3. save compiled css files
      .pipe(dest("./src/css"))
  );
}

function buildTemplates() {
  //1 Where are the html template files located
  return (
    src("src/templates/**/*.template.pug")
      //2 Rename the extension of the scss files included in the pug template files (<link ...>)
      .pipe(replace(new RegExp("/scss/(.+).scss", "ig"), "/css/$1.css"))

      // compile pug files into html
      .pipe(pug())

      //3 inline the
      .pipe(inlineCss())

      //4 don't rename the sub-folders after compilation
      .pipe(rename({ dirname: "" }))

      // 5 compile into dist directory in the root
      .pipe(dest("dist"))
  );
}

// browserSync task to launch preview server
function browserSyncInit(done) {
  browserSync.init({
    reloadDelay: 2000, // for me to be able to switch to browser from editor
    server: "./dist", // Where browserSync should serv from
  });
  done();
}

function reloadBrowserSync(done) {
  browserSync.reload(); // triger browserSync reload task
  done();
}

//1 compile Saas file
//2 buld pug files
//3 initial browserSync to open server in browser
//4 start to watch changes in sass directory and trigger reload
//4 start to watch changes in templates directory and trigger reload
exports.default = series(
  compileSass,
  buildTemplates,
  browserSyncInit,
  function () {
    watch(
      "./src/scss/**/*.scss",
      series(compileSass, buildTemplates, reloadBrowserSync)
    );
    watch("./src/templates/**/*.template.pug").on(
      "change",
      series(buildTemplates, reloadBrowserSync)
    );
  }
);
