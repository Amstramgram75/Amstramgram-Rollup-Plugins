'use strict';

var fs = require('fs');
var path = require('path');
var fg = require('fast-glob');
var postcss = require('postcss');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fg__default = /*#__PURE__*/_interopDefaultLegacy(fg);
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

/**
 * 
 * @param {Object} options 
 *    @key {String || Array} from 
 *        Either a String or an array of strings.
 *        Each string should be a valid glob,
 *        or pointing to an existing file or directory.
 *        See here how to : 
 *        https://github.com/mrmlnc/fast-glob 
 *        If a string points to an existing directory, 
 *        it will be converted to a glob including all this directory files.
 *        Eg : "docs_src/css" becomes "docs_src/css/*.*"
 *        However, only files with a '.css' extension will be processed.
 *    @key {String} to: a String pointing to the destination directory.
 *    @key {Boolean} sourceMap: wether or not generate a sourcemap.
 *         If undefined, it follows the rollup watchMode.
 *    @key {Array} plugins: postcss plugins to applied.
 *    @key {Boolean} watch: if true, watch the processed files and their dependencies
 *         If undefined, it follows the rollup watchMode.
*/
var indexModule = (options = {}) => {
  let { from, to, plugins = [], sourceMap, watch } = options;

  //If necessary, convert from option to Array
  if (typeof from === 'string') {
    from = [from];
    //Warn if from is not an array
  } else if (!Array.isArray(from)) {
    console.log(`\x1b[31m\x1B[1m!!! Plugin postcss-amstramgram ERROR !!!: Option from must be a STRING or an array of STRINGS...\x1b[0m`);
    return
  }

  //Check if to is string
  if (typeof to !== 'string') {
    console.log(`\x1b[31m\x1B[1m!!! Plugin postcss-amstramgram ERROR !!!: Option to must be a STRING...\x1b[0m`);
    return
  }
  to = path__default["default"].resolve(to);

  if (plugins.length === 0) {
    console.log(`\x1b[31m\x1B[1m!!! Plugin postcss-amstramgram ERROR !!!: You did not set any plugins : PostCSS does nothing...\x1b[0m`);
    return
  }

  const
    glob = [],//Argument passed to fast-glob
    foldersToWatch = new Set();

  from.forEach(src => {
    src = path__default["default"].resolve(src);
    //If src points to an existing directory (eg: docs_src\js or docs_src\js\)
    if (fs__default["default"].existsSync(src) && fs__default["default"].lstatSync(src).isDirectory()) {
      //If omitted, add a path separator at the end (docs_src\js becomes docs_src\js\)
      if (src.substr(src.length - 1) != path__default["default"].sep) src += path__default["default"].sep;
      //Add the folder to foldersToWatch
      foldersToWatch.add(src);
      //Add a joker to select all files (docs_src\js\ becomes docs_src\js\*.*)
      src += '*.*';
    }
    //Replace path separator with / (docs_src\js\*.* becomes docs_src/js/*.*)
    src = src.split(path__default["default"].sep).join('/');
    //Append to glob array
    glob.push(src);
  });

  //Build the array of files to process from the resulting glob
  const filesToProcess = _ => {
    //Get the array of files given by fast-glob and filter it to keep only html files
    const filesToProcess = fg__default["default"].sync(glob, { absolute: true, onlyFiles: true, dot: true, unique: true }).filter(file => path__default["default"].extname(file).toLowerCase() == '.css');
    if (filesToProcess.length == 0) {
      console.log(`\x1b[33m\x1B[1m??? Plugin postcss-amstramgram WARNING ???: No css file to process...\x1b[0m`);
    }
    return filesToProcess
  };

  const filesToEmit = new Map();

  //Passed to true after the first transform hook. 
  //Reset to false at the end of generateBundle hook.
  let done = false;

  return {
    name: 'postcss-amstramgram',
    async buildStart() {
      if (typeof watch != "boolean") watch = this.meta.watchMode;
      if (typeof sourceMap != "boolean") sourceMap = this.meta.watchMode;
      if (watch) {
        //If there are folders to watch
        //This way, rollup will rebuild when a file is added to the folder
        foldersToWatch.forEach(folder => this.addWatchFile(folder));
      }
    },
    async transform() {
      //The hook can be triggered several times during the bundle
      //If the postcss process has already been completed, we simply return
      if (done) return null

      //Reset
      filesToEmit.clear();

      await Promise.all(filesToProcess().map(async (src) => {
        src = path__default["default"].resolve(src);
        const
          srcRelative = path__default["default"].relative(__dirname, src),
          dest = to + path__default["default"].sep + path__default["default"].basename(src);

        if (watch) this.addWatchFile(src);

        //Read file content
        const fileContent = await fs__default["default"].promises.readFile(src, "utf-8").catch(error => {
          console.log(`\x1b[31m\x1B[1m!!! Plugin postcss-amstramgram ERROR !!!: unable to read ${srcRelative} file - ${error}...\x1b[0m`);
        });

        //Processing
        const result = await postcss__default["default"](plugins)
          .process(fileContent, { from: src, to: dest, map: sourceMap ? { inline: false } : false })
          .catch((error) => {
            if (watch) this.addWatchFile(path__default["default"].resolve(error.file));
            console.log(`\x1b[31m\x1B[1m!!! CSS ERROR !!!: ${error.message}...\x1b[0m`);
          });

        if (result && result.css) {
          if (Array.isArray(result.messages) && result.messages.length > 0) {
            result.messages
              .filter(msg => msg.hasOwnProperty('type') && msg.type == 'dependency' && msg.hasOwnProperty('file'))
              .forEach(msg => {if (watch) this.addWatchFile(path__default["default"].resolve(msg.file));});
          }
          filesToEmit.set(src, result);
        } else {
          console.log(`\x1b[31m\x1B[1m!!! Plugin postcss-amstramgram ERROR !!!: Unable to process data from ${srcRelative}...\x1b[0m`);
        }
      }));
      //All work has been done : done is now true
      done = true;
    },
    async generateBundle() {
      //Create destination directory
      await fs__default["default"].promises.mkdir(to, { recursive: true }).catch(error => {
        console.log(`\x1b[31m\x1B[1m!!! Plugin postcss-amstramgram ERROR !!!: Fail to create ${to} directory - ${error}...\x1b[0m`);
      });
      //Write the result
      filesToEmit.forEach((result, src) => {
        const
          srcRelative = path__default["default"].relative(__dirname, src),
          dest = to + path__default["default"].sep + path__default["default"].basename(src),
          destRelative = path__default["default"].relative(__dirname, dest);
        fs__default["default"].writeFile(dest, result.css, error => {
          if (error) {
            console.log(`\x1b[31m\x1B[1m!!! Plugin postcss-amstramgram ERROR !!!: Unable to write ${destRelative} file...\x1b[0m`);
          } else {
            console.log(`\x1b[32m\x1B[1m-- Plugin postcss-amstramgram -- : \x1b[22mprocess \x1B[1m${srcRelative} \x1b[22mto \x1B[1m${destRelative}...\x1b[0m`);
          }
        });
        if (sourceMap) {
          fs__default["default"].writeFile(`${dest}.map`, JSON.stringify(result.map), error => {
            if (error) {
              console.log(`\x1b[31m\x1B[1m!!! Plugin postcss-amstramgram ERROR !!!: Fail to write map data for ${srcRelative} file \x1b[22min \x1B[1m${destRelative}.map...\x1b[0m`);
            } else {
              console.log(`\x1b[32m\x1B[1m-- Plugin postcss-amstramgram -- : \x1b[22mprocess mapping for \x1B[1m${srcRelative} \x1b[22min \x1B[1m${destRelative}.map...\x1b[0m`);
            }
          });
        }
      });
      //Reset done
      done = false;
    }
  }
};

module.exports = indexModule;
