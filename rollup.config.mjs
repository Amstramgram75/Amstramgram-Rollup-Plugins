//noderesolve and commonjs are needed for prism.js
import noderesolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
//Server and live reload
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
//JS
import babel from '@rollup/plugin-babel'
//Here we use the es6 version of the plugin
import terser from './amstramgramRollupPluginTerser/index-module.mjs'
//If the plugin has been installed from npm :
// import terser from 'rollup-plugin-terser-amstramgram'
//CSS
//Here we use the es6 version of the plugin
import cssPlugin from './amstramgramRollupPluginPostcss/index-module.mjs'
//If the plugin has been installed from npm :
// import cssPlugin from 'rollup-plugin-postcss-amstramgram'
import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'
import cssnano from 'cssnano'
//HTML
//Here we use the es6 version of the plugin
import htmlPlugin from './amstramgramRollupPluginPosthtml/index-module.mjs'
// If the plugin has been installed from npm :
// import htmlPlugin from 'rollup-plugin-posthtml-amstramgram'
import htmlinclude from 'posthtml-include'
import htmlnano from 'htmlnano'
//Assets
//Watch changes in assets and plugins folders
//Here we use the es6 version of the watcher plugin
import watcher from './amstramgramRollupPluginWatcher/index-module.mjs'
//If the plugin has been installed from npm :
// import watcher from 'rollup-plugin-watcher-amstramgram'
import fsExtra from 'fs-extra'//To empty prod folder when building for production
import copy from 'rollup-plugin-copy'//Copy assets folder from dev to prod folder
//To update Plugins package.json version to that defined in the main package.json
import editJSON from "edit-json-file"


const
  src = 'docs_src/',
  dev = 'docs_dev/',
  prod = 'docs/',
  dest = process.env.BUILD === 'development' ? dev : prod,
  pluginsFolders = ['Postcss', 'Posthtml', 'Watcher', 'Terser'].map(name => `amstramgramRollupPlugin${name}`),
  //Babel basic configuration
  babelModule = {
    babelHelpers: 'bundled',
    plugins: [
      ['prismjs', {
        'languages': ['html', 'javascript', 'js-extras', 'json'],
      }]
      //Adjust according to your needs...
      //For example, if you're using class properties and private methods
      //you should uncomment the next two lines
      //'@babel/plugin-proposal-class-properties',
      //'@babel/plugin-proposal-private-methods',
    ]
  },
  //Babel configuration to support old browsers
  babelNoModule = Object.assign({
    exclude: [/\/core-js\//],
    presets: [
      [
        '@babel/preset-env',
        {
          'useBuiltIns': 'usage',
          'corejs': '3.8'
        }
      ]
    ],
  }, babelModule)

if (process.env.BUILD === 'production') {
  //Set plugins version equals to that defined in main package.json
  const version = process.env.npm_package_version
  pluginsFolders.forEach(folder => {
    const file = editJSON(`${folder}/package.json`)
    file.set("version", version)
    file.save()
  })
  //Clean production directory before production build
  fsExtra.emptyDirSync(prod)
}

//FIRST ROLLUP TASK :
//- bundle js in a module
//- watch assets and rollupPlugins folders
//- compile css with minification if in production
//- compile html with minification if in production
//- launch server with livereload if in development
//- copy assets if in production
const moduleExport = {
  input: `${src}js/index.js`,
  output: {
    file: `${dest}js/index.js`,
    format: 'esm',
    sourcemap: process.env.BUILD === 'development',
  },
  plugins: [
    //noderesolve and commonjs are needed for prism.js
    noderesolve(),
    commonjs(),
    cssPlugin({
      from: `${src}css/`,
      to: `${dest}css`,
      sourceMap: process.env.BUILD === 'development',
      plugins: [
        postcssImport(),
        postcssPresetEnv({
          stage: 1,
          importFrom: [
            `${src}css/common/const.css`//Needed for css custom properties
          ]
        }),
        ...(process.env.BUILD === 'production' ? [cssnano()] : [])
      ]
    }),
    htmlPlugin({
      from: src,
      to: dest,
      plugins: [
        htmlinclude({
          root: `${src}html/`
        }),
        ...(process.env.BUILD === 'production' ? [htmlnano()] : [])
      ]
    }),
    ...(Object.keys(babelModule).length > 0 ? [babel(babelModule)] : []),
    ...(process.env.BUILD === 'development' ?
      [//Server and livereload for development
        serve({
          open: true,
          contentBase: dev,
          port: 8000
        }),
        livereload(),
        watcher({
          files: [`${dev}assets`, ...pluginsFolders],
          verbose: true
        }),
        //Minify
        terser()
      ]
      :
      [//Copy assets folder
        copy({
          targets: [
            { src: `${dev}assets`, dest: prod }
          ]
        })
      ]
    )
  ],
  //Comment/Uncomment if you need
  watch: {
    clearScreen: process.env.BUILD === 'production',
  },
}

//SECOND ROLLUP TASK : bundle js in IIFE format
const noModuleExport = {
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
    babel(babelNoModule),
    terser()
  ]
}

//THIRD ROLLUP TASK : bundle polyfills
const polyfillExport = {
  input: `${src}js/polyfills/polyfill.js`,
  output: {
    file: `${dest}js/polyfills/polyfill.js`,
    format: 'iife',
    sourcemap: process.env.BUILD === 'development',
  },
  plugins: [
    terser()
  ]
}

//FOURTH ROLLUP TASK : bundle common js versions for plugins
const pluginsExport = []
pluginsFolders.forEach(folder => {
  pluginsExport.push({
    input: `${folder}/index-module.mjs`,
    external: ['fs', 'path', 'url', 'fast-glob', 'postcss', 'posthtml', '@babel/code-frame', 'jest-worker', 'serialize-javascript', 'module'],
    output: {
      file: `${folder}/index-common.js`,
      exports: "auto",
      format: 'cjs',
    }
  })
})

//Export rollup tasks
export default [moduleExport, noModuleExport, polyfillExport, ...(process.env.BUILD === 'production' ? pluginsExport : [])]