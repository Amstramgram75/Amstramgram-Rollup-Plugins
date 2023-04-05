import test from 'ava';
import { rollup } from 'rollup'
import cssPlugin from './../rollup-plugin-postcss-amstramgram/esm/index.mjs'
import cssnano from 'cssnano'



async function build(pluginOptions) {
  await rollup({
    input: 'tests/js/test.js',
    plugins: [
      cssPlugin(pluginOptions)
    ]
  })
}

/**
 * @param {any} input : plugin options
 * @param {string} toSearch : string used to build the regexp
 *      By default, it's the first part of the title before the caret
 * @param {integer} id : id of the log to test with regexp.
 *      A particular set of options can trigger two logs.
 *      For example, if no files to process was found,
 *      there is a first notification when from property of the job is scanned
 */
const macro = test.macro(async (t, pluginOptions, toSearch = t.title.split('-')[0], id = 0) => {
  const originalConsole = console.log, logs = []
  console.log = v => logs.push(v);
  await build(pluginOptions)
  console.log = originalConsole
  const log = logs[id]
  t.log(log)
  const regexp = new RegExp(toSearch)
  t.is(regexp.test(log), true)
});

test('I need an object as parameter - []', macro, [])

test('I need an object as parameter-abc', macro, 'abc')

test('I need an object as parameter-99', macro, 99)

test('No options have been set', macro, {})

test('jobs option is not set', macro, { absurd: 'abc' }, 'jobs.+option is not set')

test('jobs option must be an object or an array of objects.', macro, {
  jobs: 1
}, 'job.+option must be an object or an array of objects')

test('plugins option must be an array', macro, {
  jobs: { from: 'src', to: 'dest' },
  plugins: 'abc'
}, 'plugins.+option must be an array')

test('plugins option is empty', macro, {
  jobs: { from: 'src', to: 'dest' },
}, 'plugins.+option is empty')

test(`jobs option can't be an empty array`, macro, { jobs: [] }, `jobs.+option.+can't be an empty array`)

test('from property of job is not set.', macro, {
  jobs: { to: 'dest' },
  plugins: [cssnano()]
}, 'from.+property of job.+is not set')

test('to property of job is not set.', macro, {
  jobs: { from: 'src' },
  plugins: [cssnano()]
}, 'to.+property of job.+is not set')

test(`from property of job can't be an empty string`, macro, {
  jobs: { from: '', to: 'dest' },
  plugins: [cssnano()]
}, `from.+property of job.+(\r\n|\r|\n).+be an empty string`)

test(`from property of job can't be an empty array`, macro, {
  jobs: { from: [], to: 'dest' },
  plugins: [cssnano()]
}, `from.+property of job.+(\r\n|\r|\n).+be an empty array`)

test(`from property of job includes at least one element that is not a string`, macro, {
  jobs: { from: ['a', 3], to: 'dest' },
  plugins: [cssnano()]
}, `from.+property of job.+(\r\n|\r|\n).+includes at least one element that is not a string`)

test(`from property of job includes at least one empty string`, macro, {
  jobs: { from: ['a', ''], to: 'dest' },
  plugins: [cssnano()]
}, `from.+property of job.+(\r\n|\r|\n).+includes at least one empty string`)

test(`to property of job can't be an empty string`, macro, {
  jobs: { from: 'src', to: '' },
  plugins: [cssnano()]
}, `to.+property of job.+(\r\n|\r|\n).+be an empty string`)

test(`to property of job can't be an empty array`, macro, {
  jobs: { from: 'src', to: [] },
  plugins: [cssnano()]
}, `to.+property of job.+(\r\n|\r|\n).+be an empty array`)

test(`to property of job includes at least one element that is not a string`, macro, {
  jobs: { from: 'src', to: ['a', 3] },
  plugins: [cssnano()]
}, `to.+property of job.+(\r\n|\r|\n).+includes at least one element that is not a string`)

test(`to property of job includes at least one empty string`, macro, {
  jobs: { from: 'src', to: ['a', ''] },
  plugins: [cssnano()]
}, `to.+property of job.+(\r\n|\r|\n).+includes at least one empty string`)

test(`rename property of job must be a string or a function`, macro, {
  jobs: { from: 'src', to: 'dest', rename: 0 },
  plugins: [cssnano()]
}, `rename.+property of job.+(\r\n|\r|\n).+must be a string or a function`)

test(`rename property of job can't be a non-empty stringn`, macro, {
  jobs: { from: 'src', to: 'dest', rename: '' },
  plugins: [cssnano()]
}, `rename.+property of job.+(\r\n|\r|\n).+can't be a non-empty string`)

test(`root property of job must be a string`, macro, {
  jobs: { from: 'src', to: 'dest', root: 0 },
  plugins: [cssnano()]
}, `root.+property of job.+(\r\n|\r|\n).+must be a string`)

test(`root property of job can't be a non-empty stringn`, macro, {
  jobs: { from: 'src', to: 'dest', root: '' },
  plugins: [cssnano()]
}, `root.+property of job.+(\r\n|\r|\n).+can't be a non-empty string`)

test(`ext option can't be an empty string`, macro, {
  jobs: { from: 'src', to: 'dest'},
  plugins: [cssnano()],
  ext: ''
}, `ext.+option can't be an empty string`)

test(`ext option can't be an empty array`, macro, {
  jobs: { from: 'src', to: 'dest'},
  plugins: [cssnano()],
  ext: []
}, `ext.+option can't be an empty array`)

test(`ext option must be a non-empty string or an array of non-empty strings`, macro, {
  jobs: { from: 'src', to: 'dest'},
  plugins: [cssnano()],
  ext: 5
}, `ext.+option must be a non-empty string or an array of non-empty strings`)

test(`none of the items found in the ext option is a valid string`, macro, {
  jobs: { from: 'src', to: 'dest'},
  plugins: [cssnano()],
  ext: [1, 2, 3]
}, `none of the items found in the.+ext.+option is a valid string`)

test.serial(`ext option has been cleaned up of invalid elements`, macro, {
  jobs: { from: 'src', to: 'dest'},
  verbose: true,
  plugins: [cssnano()],
  ext: ['css', 2, 3]
}, `ext.+option has been cleaned up of invalid elements`)

test(`processHook option is not a rollup hook`, macro, {
  jobs: { from: 'src', to: 'dest'},
  plugins: [cssnano()],
  processHook: 'not a hook'
}, `processHook.+option is not a rollup hook`)

test.serial(`watch option is set to true but will be ignored`, macro, {
  jobs: {from:[`docs_src/**/*`], to:`docs_dev/css`},
  watch: true,
  verbose: true,
  plugins: [cssnano()],
  processHook: 'buildEnd'
}, `watch.+option is set to true but will be ignored`)

test.serial(`No file to process in the from option of job`, macro, {
  jobs: [{from:[`docs_src/**/*`], to:`docs_dev/css`}, { from: 'src', to: 'dest'}],
  verbose: true,
  plugins: [cssnano()],
}, `No file to process in the.+from.+option`)

test.serial(`No file to process were found`, macro, {
  jobs: [{from:[`docs_src/**/*`], to:`docs_dev/css`}, { from: 'src', to: 'dest'}],
  verbose: true,
  plugins: ['abc'],
  ext: 'psd'
}, 
`No file to process were found`,
//Must take third logs since the first two are emitted by the 
//'No file to process in the from option of job' notification
2) 
