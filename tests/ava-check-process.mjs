import test from 'ava'
import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { rollup } from 'rollup'
import cssPlugin from './../rollup-plugin-postcss-amstramgram/esm/index.mjs'
import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'
import cssnano from 'cssnano'
import scssParser from 'postcss-scss'
import sass from '@csstools/postcss-sass'

const
  root = 'tests/'



test.beforeEach(async () =>
  //Ensures that a directory is empty.
  //Deletes directory contents if the directory is not empty.
  //If the directory does not exist, it is created.
  //The directory itself is not deleted.
  await fs.emptyDir(`${root}output-01`),
  await fs.emptyDir(`${root}output-02`)
)

test.after("Cleanup test environment", t => {
  fs.rmSync(`${root}output-01`, { recursive: true, force: true });
  fs.rmSync(`${root}output-02`, { recursive: true, force: true });
});

test.serial('01 - Import, variables, nested, root, sourcemap and watch', async t => {
  const pluginOptions = {
    jobs: { from: `${root}css/**/*`, to: [`${root}output-01/`, `${root}output-02`], root: root },
    plugins: [postcssImport(), postcssPresetEnv({ stage: 1 })],
    sourcemap: true,
    watch: true
  }
  const bundle = await rollup({
    input: `${root}js/index.js`,
    plugins: [
      cssPlugin(pluginOptions)
    ]
  })
  await bundle.write({
    format: 'es',
    file: `${root}output-01/index.js`,
  })
  const
    data01 = (await fs.readFile(`${root}output-01/css/main-01.css`)).toString().replace(/\s\s+/g, ' '),
    data02 = (await fs.readFile(`${root}output-02/css/main-01.css`)).toString().replace(/\s\s+/g, ' '),
    dataRef = (await fs.readFile(`${root}ref/01/main-01.css`)).toString().replace(/\s\s+/g, ' '),
    map01 = (await fs.readFile(`${root}output-01/css/main-01.css.map`)).toString().replace(/\s\s+/g, ' '),
    map02 = (await fs.readFile(`${root}output-02/css/main-01.css.map`)).toString().replace(/\s\s+/g, ' '),
    mapRef = (await fs.readFile(`${root}ref/01/main-01.css.map`)).toString().replace(/\s\s+/g, ' '),
    dataSub01 = (await fs.readFile(`${root}output-01/css/sub/sub-01.css`)).toString().replace(/\s\s+/g, ' '),
    dataSub02 = (await fs.readFile(`${root}output-02/css/sub/sub-01.css`)).toString().replace(/\s\s+/g, ' '),
    dataSubRef = (await fs.readFile(`${root}ref/01/sub/sub-01.css`)).toString().replace(/\s\s+/g, ' '),
    mapSub01 = (await fs.readFile(`${root}output-01/css/sub/sub-01.css.map`)).toString().replace(/\s\s+/g, ' '),
    mapSub02 = (await fs.readFile(`${root}output-02/css/sub/sub-01.css.map`)).toString().replace(/\s\s+/g, ' '),
    mapSubRef = (await fs.readFile(`${root}ref/01/sub/sub-01.css.map`)).toString().replace(/\s\s+/g, ' '),
    bundleWatchFiles = bundle.watchFiles.slice(1),
    cssWatchFiles = [path.resolve(`${root}css`), path.resolve(`${root}cssImports`)]
  t.is(
    data01 == dataRef &&
    data02 == dataRef &&
    map01 == mapRef &&
    map02 == mapRef &&
    dataSub01 == dataSubRef &&
    dataSub02 == dataSubRef &&
    mapSub01 == mapSubRef &&
    mapSub02 == mapSubRef &&
    bundleWatchFiles.every(f => cssWatchFiles.includes(f)) &&
    cssWatchFiles.every(f => bundleWatchFiles.includes(f)),
    true
  )
})

test.serial('02 - Import, variables, nested, sourcemap, watch, rename and minification', async t => {
  const pluginOptions = {
    jobs: { from: `${root}css/**/*`, to: [`${root}output-01/`, `${root}output-02`], rename: (name) => name + '.min' },
    plugins: [postcssImport(), postcssPresetEnv({ stage: 1 }), cssnano()],
    sourcemap: true,
    watch: true
  }
  const bundle = await rollup({
    input: `${root}js/index.js`,
    plugins: [
      cssPlugin(pluginOptions)
    ]
  })
  await bundle.write({
    format: 'es',
    file: `${root}output-01/index.js`,
  })
  const
    data01 = (await fs.readFile(`${root}output-01/main-01.min.css`)).toString().replace(/\s\s+/g, ' '),
    data02 = (await fs.readFile(`${root}output-02/main-01.min.css`)).toString().replace(/\s\s+/g, ' '),
    dataRef = (await fs.readFile(`${root}ref/02/main-01.min.css`)).toString().replace(/\s\s+/g, ' '),
    map01 = (await fs.readFile(`${root}output-01/main-01.min.css.map`)).toString().replace(/\s\s+/g, ' '),
    map02 = (await fs.readFile(`${root}output-02/main-01.min.css.map`)).toString().replace(/\s\s+/g, ' '),
    mapRef = (await fs.readFile(`${root}ref/02/main-01.min.css.map`)).toString().replace(/\s\s+/g, ' '),
    dataSub01 = (await fs.readFile(`${root}output-01/sub-01.min.css`)).toString().replace(/\s\s+/g, ' '),
    dataSub02 = (await fs.readFile(`${root}output-02/sub-01.min.css`)).toString().replace(/\s\s+/g, ' '),
    dataSubRef = (await fs.readFile(`${root}ref/02/sub/sub-01.min.css`)).toString().replace(/\s\s+/g, ' '),
    mapSub01 = (await fs.readFile(`${root}output-01/sub-01.min.css.map`)).toString().replace(/\s\s+/g, ' '),
    mapSub02 = (await fs.readFile(`${root}output-02/sub-01.min.css.map`)).toString().replace(/\s\s+/g, ' '),
    mapSubRef = (await fs.readFile(`${root}ref/02/sub/sub-01.min.css.map`)).toString().replace(/\s\s+/g, ' '),
    bundleWatchFiles = bundle.watchFiles.slice(1),
    cssWatchFiles = [path.resolve(`${root}css`), path.resolve(`${root}cssImports`)]
  t.is(
    data01 == dataRef &&
    data02 == dataRef &&
    map01 == mapRef &&
    map02 == mapRef &&
    dataSub01 == dataSubRef &&
    dataSub02 == dataSubRef &&
    mapSub01 == mapSubRef &&
    mapSub02 == mapSubRef &&
    bundleWatchFiles.every(f => cssWatchFiles.includes(f)) &&
    cssWatchFiles.every(f => bundleWatchFiles.includes(f)),
    true
  )
})


test.serial('03 - SCSS', async t => {
  const pluginOptions = {
    jobs: { from: `${root}scss/**/*`, to: [`${root}output-01/`, `${root}output-02`], root: root },
    plugins: [sass()],
    parser: scssParser,
    sourcemap: true,
    watch: true
  }
  const bundle = await rollup({
    input: `${root}js/index.js`,
    plugins: [
      cssPlugin(pluginOptions)
    ]
  })
  await bundle.write({
    format: 'es',
    file: `${root}output-01/index.js`,
  })

  const
    data01 = (await fs.readFile(`${root}output-01/scss/main-01.css`)).toString().replace(/\s\s+/g, ' '),
    data02 = (await fs.readFile(`${root}output-02/scss/main-01.css`)).toString().replace(/\s\s+/g, ' '),
    dataRef = (await fs.readFile(`${root}ref/03/main-01.css`)).toString().replace(/\s\s+/g, ' '),
    dataSub01 = (await fs.readFile(`${root}output-01/scss/sub/sub-01.css`)).toString().replace(/\s\s+/g, ' '),
    dataSub02 = (await fs.readFile(`${root}output-02/scss/sub/sub-01.css`)).toString().replace(/\s\s+/g, ' '),
    dataSubRef = (await fs.readFile(`${root}ref/03/sub/sub-01.css`)).toString().replace(/\s\s+/g, ' '),
    bundleWatchFiles = bundle.watchFiles.slice(1),
    cssWatchFiles = [path.resolve(`${root}scss`), path.resolve(`${root}scssImports`)]

  t.is(
    data01 == dataRef &&
    data02 == dataRef &&
    dataSub01 == dataSubRef &&
    dataSub02 == dataSubRef &&
    bundleWatchFiles.every(f => cssWatchFiles.includes(f)) &&
    cssWatchFiles.every(f => bundleWatchFiles.includes(f)),
    true
  )
})
