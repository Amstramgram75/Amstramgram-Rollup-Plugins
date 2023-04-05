//noderesolve and commonjs are needed for prism.js
import noderesolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

//JS
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'

//CSS
//Here we use the es6 version of the plugin
import css from './rollup-plugin-postcss-amstramgram/esm/index.mjs'
//If the plugin has been installed from npm :
//import css from 'rollup-plugin-postcss-amstramgram'
import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'
import cssnano from 'cssnano'

//SCSS
//https://github.com/postcss/postcss-scss
import scssParser from 'postcss-scss'
//https://github.com/csstools/postcss-sass
import sass from '@csstools/postcss-sass'


//HTML
import html from './rollup-plugin-posthtml-amstramgram/esm/index.mjs'
import htmlinclude from 'posthtml-include'
import htmlnano from 'htmlnano'

//ASSETS
//Watch changes in assets and plugins folders
//Here we use the es6 version of the plugin
import watcher from './rollup-plugin-watcher-amstramgram/esm/index.mjs'
//If the plugin has been installed from npm :
//import watcher from 'rollup-plugin-watcher-amstramgram'

//PRODUCTION
import fsExtra from 'fs-extra'//To empty prod folder when building for production
import fg from "fast-glob"//Used for plugins export
import copy from 'rollup-plugin-copy'//Copy assets folder from dev to prod folder
import autoExternal from 'rollup-plugin-auto-external';


/**
 * Project is developed in Visual Studio Code.
 * Server with live reload is provided by the VSCode Live Server extension
 * https://github.com/ritwickdey/vscode-live-server
 * Server settings are stores in the .code-workspace file :
 * "liveServer.settings.root": "/docs_dev"
 * To prevent multiple reloads on some changes, we may add :
 */
//"liveServer.settings.ignoreFiles": [
// "**/*.css",
//  "**/*.html",
//]


const
  src = 'docs_src/',
  dev = 'docs_dev/',
  prod = 'docs/',
  dest = process.env.BUILD === 'development' ? dev : prod,
  //Babel basic configuration
  babelModule = {
    babelHelpers: 'bundled',
    plugins: [
      ['prismjs', {
        'languages': ['html', 'javascript', 'js-extras', 'json', 'scss', 'css'],
      }]
    ]
  },
  //Babel configuration to support old browsers
  //Note that browserslist is set in package.json
  babelNoModule = Object.assign({
    presets: [
      [
        "@babel/preset-env"
      ]
    ]
  }, babelModule)

//FIRST ROLLUP TASK :
//- bundle js in a module
//- compile html with minification if in production
//- compile css with minification if in production
//- watch assets and rollup Plugins folders if in development
//- copy assets if in production
const module = {
  input: `${src}js/index.js`,
  output: {
    file: `${dest}js/index.mjs`,
    format: 'esm',
    sourcemap: process.env.BUILD === 'development',
  },
  plugins: [
    //noderesolve and commonjs are needed for prism.js
    noderesolve(),
    commonjs(),
    html({
      jobs: { from: src, to: dest },
      watch: process.env.BUILD === 'development',
      verbose: true,
      plugins: [
        htmlinclude({
          root: `${src}html/`
        }),
        ...(process.env.BUILD === 'production' ? [htmlnano()] : [])
      ]
    }),
    css({
      jobs: { from: `${src}css/index.css`, to: `${dest}css` },
      sourcemap: process.env.BUILD === 'development',
      //Watch is useless since folder src is already watched by html plugin
      verbose: true,
      plugins: [
        postcssImport(),
        //Note that browserslist is set in package.json
        postcssPresetEnv({
          stage: 1,
        }),
        ...(process.env.BUILD === 'production' ? [cssnano()] : [])
      ]
    }),
    css({//SCSS processing
      jobs: { from: `${src}css/index.scss`, to: `${dest}css`, rename: 'index-from-scss' },
      sourcemap: process.env.BUILD === 'development',
      verbose: true,
      parser: scssParser,
      plugins: [
        sass(),
        postcssPresetEnv({
          stage: 2,
        }),
      ]
    }),
    babel(babelModule),
    ...(process.env.BUILD === 'development' ?
      //If in development
      [
        watcher({
          files: [`${dev}assets`, `rollup-plugin-*`],
        }),
      ]
      :
      [
        //If in production
        //Copy assets folder
        copy({
          targets: [
            { src: `${dev}assets`, dest: prod }
          ]
        }),
        //Minify
        terser(),
      ]
    )
  ],
  //Comment/Uncomment if you need
  watch: {
    clearScreen: process.env.BUILD === 'production',
  },
}

//SECOND ROLLUP TASK : bundle js in IIFE format
const noModule = {
  input: `${src}js/index.js`,
  output: {
    file: `${dest}js/noModule/index.js`,
    format: 'iife',
    sourcemap: process.env.BUILD === 'development',
  },
  plugins: [
    //noderesolve and commonjs are needed for prism.js
    noderesolve(),
    commonjs(),
    //Note that browserslist is set in package.json
    babel(babelNoModule),
    //Minify if in production
    ...(process.env.BUILD === 'production' ? [terser()] : [])
  ]
}

//THIRD ROLLUP TASK : bundle polyfills
const polyfill = {
  input: `${src}js/polyfills/polyfills.js`,
  output: {
    file: `${dest}js/polyfills/polyfills.js`,
    format: 'iife',
    sourcemap: process.env.BUILD === 'development',
  },
  plugins: [
    //Minify if in production
    ...(process.env.BUILD === 'production' ? [terser()] : [])
  ]
}

//Set up plugins bundles when in production
const buildPluginsExport = _ => {
  const plugins = []
  if (process.env.BUILD === 'production') {
    //Clean production directory before production build
    fsExtra.emptyDirSync(prod)
    //bundle common js versions for each plugin
    //Use fast-glob to find all the rollup-plugin folders
    fg.sync(['rollup-plugin-*'], { onlyDirectories: true }).forEach(folder => {
      plugins.push({
        input: `${folder}/esm/index.mjs`,
        //Set the dependencies from package.json as external
        external: Object.keys(fsExtra.readJsonSync(`${folder}/package.json`).dependencies),
        output: {
          file: `${folder}/cjs/index.cjs`,
          format: 'cjs',
        },
        plugins: [autoExternal()]
      })
    })
  }
  return plugins
}

//Export rollup tasks
export default [module, noModule, polyfill, ...buildPluginsExport()]