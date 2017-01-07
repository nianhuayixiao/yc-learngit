var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyHtml = require('gulp-minify-html');
var minifyImage = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant'); //png图片压缩插件
var spritesmith = require('gulp.spritesmith');
// var jshint = require("gulp-jshint");
var spriter = require('gulp-css-spriter');
var paths = {
    scripts: ['js/index.js', 'js/main.js']
}

gulp.task('default', ['minify-html','css', 'minify-css'], function () {
    console.log('ok-default');
    gulp.src(paths.scripts)
        .pipe(uglify())
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest('build'));
});
gulp.task('minify-html', function () {
    console.log('ok-minify-html');
    gulp.src('index.html')
        .pipe(minifyHtml())
        .pipe(gulp.dest('www'))
});
gulp.task('minify-css', function () {
    console.log('ok-minify-css');
    gulp.src('css/*.css')
        .pipe(minifyCss())
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest('build'));
});
gulp.task('css', function() {
    return gulp.src('css/style.css')//比如recharge.css这个样式里面什么都不用改，是你想要合并的图就要引用这个样式。 很重要 注意(recharge.css)这个是我的项目。别傻到家抄我一样的。
        .pipe(spriter({
            // The path and file name of where we will save the sprite sheet
            'spriteSheet': 'build/spritesheet.png', //这是雪碧图自动合成的图。 很重要
            // Because we don't know where you will end up saving the CSS file at this point in the pipe,
            // we need a litle help identifying where it will be.
            'pathToSpriteSheetFromCSS': 'spritesheet.png' //这是在css引用的图片路径，很重要
        }))
        .pipe(gulp.dest('build')); //最后生成出来
});
gulp.watch('js/*.js', ['default']);
gulp.watch('css/base.css', ['minify-css']);
gulp.watch('index.html', ['minify-html']);
// gulp.watch('image/*.png', ['sprite-image']);
