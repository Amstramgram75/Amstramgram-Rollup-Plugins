//noderesolve and commonjs are needed for prism.js
import noderesolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

//JS
import babel from '@rollup/plugin-babel'

//CSS
//Here we use the cjs version of the plugin
const css = require('./rollup-plugin-postcss-amstramgram/cjs/index.cjs')
import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'

//HTML
//Here we use the cjs version of the plugin
const html = require('./rollup-plugin-posthtml-amstramgram/cjs/index.cjs')
import htmlinclude from 'posthtml-include'

//ASSETS
//Watch changes in assets and plugins folders
//Here we use the cjs version of the plugin
const watcher = require('./rollup-plugin-watcher-amstramgram/cjs/index.cjs')


/**
 * Project is developed in Visual Studio Code.
 * Server with live reload is provided by the VSCode Live Server extension
 * https://github.com/ritwickdey/vscode-live-server
 * Server settings are stores in the .code-workspace file :
 * "liveServer.settings.root": "/docs_dev"
 */

const
  src = 'docs_src/',
  dev = 'docs_dev/',
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
    file: `${dev}js/index.mjs`,
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    //noderesolve and commonjs are needed for prism.js
    noderesolve(),
    commonjs(),
    html({
      jobs: { from: src, to: dev },
      watch: true,
      verbose: true,
      plugins: [
        htmlinclude({
          root: `${src}html/`
        })
      ]
    }),
    css({
      jobs: { from: `${src}css`, to: `${dev}css` },
      sourcemap: true,
      //Watch is useless since folder src is already watched by html plugin
      verbose: true,
      plugins: [
        postcssImport(),
        //Note that browserslist is set in package.json
        postcssPresetEnv({
          stage: 1,
        })
      ]
    }),
    babel(babelModule),
    watcher({
      files: [`${dev}assets`, `rollup-plugin-*`],
    })
  ],
  //Comment/Uncomment if you need
  watch: {
    clearScreen: false,
  },
}

//SECOND ROLLUP TASK : bundle js in IIFE format
const noModule = {
  input: `${src}js/index.js`,
  output: {
    file: `${dev}js/noModule/index.js`,
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    //noderesolve and commonjs are needed for prism.js
    noderesolve(),
    commonjs(),
    //Note that browserslist is set in package.json
    babel(babelNoModule)
  ]
}

//THIRD ROLLUP TASK : bundle polyfills
const polyfill = {
  input: `${src}js/polyfills/polyfills.js`,
  output: {
    file: `${dev}js/polyfills/polyfills.js`,
    format: 'iife',
    sourcemap: true,
  }
}

//Export rollup tasks
export default [module, noModule, polyfill]