import gulp from 'gulp';
import gulpFileInclude from 'gulp-file-include';
import htmlmin from 'gulp-htmlmin';
import pugs from 'gulp-pug';
import * as sass from 'sass';
import gsass from 'gulp-sass';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import ccso from 'gulp-csso';
import groupCssMediaQueries from 'gulp-group-css-media-queries';
import babel from 'gulp-babel';
import webpack from 'webpack-stream';
import uglify from 'gulp-uglify-es';
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';
import webp from 'gulp-webp';
import fonter from 'gulp-fonter';
import buildSvgSprite from 'gulp-svg-sprite';
import replace from 'gulp-replace';
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';

const srcPath = 'src/';
const distPath = 'static/';

const path = {
    build: {
        js:     distPath + "js/",
        css:    distPath + "css/",
        images: distPath + "images/",
				svg:    distPath + "images/svg/",
        fonts:  distPath + "fonts/"
    },
    src: {
        js:     srcPath + "js/*.js",
				css:    srcPath + "css/*.css",
        scss:   srcPath + "scss/**/*.{scss, sass}",
        images: srcPath + "images/**/*.{jpg,jpeg,png,gif,ico,webp}",
				svg:    srcPath + "images/svg/*.svg",
        fonts:  srcPath + "fonts/**/*.{woff,woff2,ttf,otf,eot,otc,ttc,svg}"
    },
    watch: {
        js:     srcPath + "js/**/*.js",
				css:    srcPath + "css/**/*.css",
        scss:   srcPath + "scss/**/*.{scss, sass}",
        images: srcPath + "images/**/*.{jpg,jpeg,png,gif,ico,webp}",
				svg:    srcPath + "images/svg/*.svg",
        fonts:  srcPath + "fonts/**/*.{woff,woff2,ttf,otf,eot,otc,ttc,svg}"
    },
    clean: "./" + distPath
}

const server = () => {
	browserSync.init({
		server: {
				baseDir: "./" + distPath
		},
		browser: 'chrome',
		notify: false
	});
}

export const css = () => {
	return gulp.src(path.src.css, { base: srcPath + "scss/", sourcemaps: true })
		.pipe(concat('style.css'))
		.pipe(groupCssMediaQueries())
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 2 versions"],
			cascade: true
		}))
		.pipe(gulp.dest(path.build.css, { sourcemaps: true }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(ccso())
		.pipe(gulp.dest(path.build.css, { sourcemaps: true }))
		.pipe(browserSync.reload({ stream: true }));
}

export const scss = () => {
	const sassCompiler = gsass(sass);
	return gulp.src(path.src.scss, { base: srcPath + "scss/", sourcemaps: true })
		.pipe(sassCompiler())
		.pipe(groupCssMediaQueries())
		.pipe(autoprefixer({
			grid: true,
			overrideBrowserslist: ["last 2 versions"],
			cascade: true
		}))
		.pipe(gulp.dest(path.build.css, { sourcemaps: true }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(ccso())
		.pipe(gulp.dest(path.build.css, { sourcemaps: true }))
		.pipe(browserSync.reload({ stream: true }));
}

export const js = () => {
	const uglifyFunction = uglify.default;
	return gulp.src(path.src.js, { base: srcPath + 'js/', sourcemaps: true })
		.pipe(babel())
		.pipe(webpack({
			mode: 'development',
			entry: {
				main: './src/js/main.js',
				projects: './src/js/projects.js',
				tasks: './src/js/tasks.js',
				teams: './src/js/teams.js',
				users: './src/js/users.js',
			},
			output: {
				filename: '[name].js',
			},
		}))
		.pipe(gulp.dest(path.build.js, { sourcemaps: true }))
		.pipe(uglifyFunction())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(path.build.js, { sourcemaps: true }))
		.pipe(browserSync.reload({ stream: true }));
}

export const images = () => {
	return gulp.src(path.src.images)
		.pipe(newer(path.build.images))
		.pipe(webp())
		.pipe(gulp.dest(path.build.images))
		.pipe(gulp.src(path.src.images))
		.pipe(newer(path.build.images))
		.pipe(imagemin({
			progressive: true,
			verbose: true
		}))
		.pipe(gulp.dest(path.build.images))
		.pipe(browserSync.reload({stream: true}));
}

export const svg = () => {
	return gulp.src(path.src.svg)
		.pipe(newer(path.build.svg))
		.pipe(gulp.dest(path.build.svg))
		
		.pipe(gulp.src(path.src.svg))
		.pipe(buildSvgSprite({
			mode: {
				symbol: {
					sprite: "../sprite.svg"
				}
			}
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(gulp.dest(path.build.svg))
		.pipe(browserSync.reload({ stream: true }));
}

export const fonts = () => {
	return gulp.src(path.src.fonts)
		.pipe(newer(path.build.fonts))
		.pipe(fonter({
			formats: ["ttf", "woff", "eot"]
		}))
		.pipe(gulp.dest(path.build.fonts))
		.pipe(browserSync.reload({ stream: true }));
}

export const clean = () => {
	return deleteAsync(path.clean);
}

export const watchFiles = () => {
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.scss], scss);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.images], images);
	gulp.watch([path.watch.images], svg);
	gulp.watch([path.watch.fonts], fonts);
}

export const build = gulp.series(clean, gulp.parallel(css, js, images, svg));
export const develop = gulp.parallel(build, watchFiles);
export default develop;
