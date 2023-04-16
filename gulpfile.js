const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const cssImport = require('postcss-import');
const svgSprite = require('gulp-svg-sprite');

const path = {
    src: {
        html: 'dev/*.html',
        css: 'dev/scss/partials/*.scss',
        js: 'dev/js/main.js',
        img: 'dev/img/**/*.+(jpg|png|gif|webp)',
        svg: 'dev/img/svg/*.svg',
        fonts: 'dev/fonts/*.*',
        misc: 'dev/misc/*.*'
    },
    watch: {
        html: 'dev/*.html',
        css: 'dev/scss/**/*.scss',
        js: 'dev/js/**/*.js',
        img: 'dev/img/**/*.+(jpg|png|gif|webp)',
        svg: 'dev/img/svg/*.svg',
        fonts: 'dev/fonts/*.*',
        misc: 'dev/misc/*.*'
    },
    build: {
        html: 'build/',
        css: 'build/css/',
        js: 'build/js/',
        img: 'build/img/',
        svg: 'build/',
        fonts: 'build/fonts/',
        misc: 'build/'
    }
};

const postcssOptions = [
    autoprefixer({ cascade: true }),
    // cssnano({
    //     zindex: false,
    //     discardComments: {
    //         removeAll: true
    //     }
    // }),
    cssImport()
];

const svgoOptions = {
    "plugins": [
        { "removeXMLNS": true }
    ]
}

function browsersync() {
    browserSync.init({
        server: { baseDir: 'build/' },
        notify: false,
        online: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(dest(path.build.html))
        .pipe(browserSync.stream())
}

function styles() {
    return src(path.src.css)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss(postcssOptions))
        .pipe(rename('main.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
            path.src.js
        ])
        .pipe(sourcemaps.init())
        .pipe(rename('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream())
}

function svg() {
    return src(path.src.svg)
        .pipe(svgSprite({
            shape: {
                transform: [{
                    svgo: svgoOptions
                }]
            },
            svg: {
                xmlDeclaration: false
            },
            mode: {
                symbol: {
                    sprite: '../svg-symbols.svg'
                }
            }
        }))
        .pipe(dest(path.build.svg))
        .pipe(browserSync.stream())
}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.stream())
}

function misc() {
    return src(path.src.misc)
        .pipe(dest(path.build.misc))
        .pipe(browserSync.stream())
}

function startwatch() {
    watch(path.watch.html, html);
    watch(path.watch.css, styles);
    watch(path.watch.js, scripts);
    watch(path.watch.img, images);
    watch(path.watch.svg, svg);
    watch(path.watch.fonts, fonts);
    watch(path.watch.misc, misc);
}

exports.browsersync = browsersync;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.svg = svg;
exports.fonts = fonts;
exports.misc = misc;
exports.default = series(parallel(html, styles, scripts, images, svg, fonts, misc), parallel(startwatch, browsersync));
