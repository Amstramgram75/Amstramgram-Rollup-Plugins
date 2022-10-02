'use strict';

var fs = require('fs');
var path = require('path');
var fg = require('fast-glob');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fg__default = /*#__PURE__*/_interopDefaultLegacy(fg);

/**
 * @param {*} options 
 *    @key {String || Array} files 
 *        Either a String or an array of strings.
 *        Each string should be a valid glob,
 *        or pointing to an existing file or directory.
 *        See here how to : 
 *        https://github.com/mrmlnc/fast-glob 
 *        If a string points to an existing directory, 
 *        it will be converted to a glob including all this directory files.
 *        Eg : "docs_src/js" becomes "docs_src/js/*.*"
 *    @key {Boolean} verbose
 *        If set to true, output watched files to console.
 *        Default : false
 */
 var indexModule = (options = {}) => {
  let { files, verbose = false } = options;
  if (typeof files === 'string') {
    files = [files];
    //Warn if files is not an array
  } else if (!Array.isArray(files)) {
    console.log(`\x1b[31m\x1B[1m!!! Plugin watcher-amstramgram ERROR !!!: Option must be a STRING or an array of STRINGS...\x1b[0m`);
    return
  }
  //Check if files is an empty array
  if (files.length == 0) {
    console.log(`\x1b[31m\x1B[1m!!! Plugin watcher-amstramgram ERROR !!!: You haven't set anything to watch : the plugin does nothing...\x1b[0m`);
    return
  }

  const
    glob = [],//Argument passed to fast-glob
    foldersToWatch = new Set();

  files.forEach(src => {
    src = path__default["default"].resolve(src);
    //If src points to an existing directory (eg: docs_src\js or docs_src\js\)
    if (fs__default["default"].existsSync(src) && fs__default["default"].lstatSync(src).isDirectory()) {
      //If omitted, add a path separator at the end (docs_src\js becomes docs_src\js\)
      if (src.substr(src.length - 1) != path__default["default"].sep) src += path__default["default"].sep;
      //Add the folder to foldersToWatch
      foldersToWatch.add(src);
    } else {
      //Replace path separator with / (docs_src\js\*.* becomes docs_src/js/*.*)
      src = src.split(path__default["default"].sep).join('/');
      //Append to glob array
      glob.push(src);
    }
  });

  //Build the array of files to watch from the resulting glob
  const filesToWatch = _ => {
    const filesToWatch = fg__default["default"].sync(glob, { absolute: true, onlyFiles: true, dot: true, unique: true });
    if (filesToWatch.length == 0 && foldersToWatch.size == 0) {
      console.log(`\x1b[33m\x1B[1m??? Plugin watcher-amstramgram WARNING ???: Nothing to watch ! Check my files option...\x1b[0m`);
    }
    return filesToWatch
  };

  return {
    name: 'watcher-amstramgram',
    async buildStart() {
      //This way, rollup will rebuild when a file is added to the folder
      foldersToWatch.forEach(folder => {
        if (fs__default["default"].existsSync(folder)) {
          this.addWatchFile(folder);
          if (verbose === true) console.log(`\x1b[32m\x1B[1m-- Plugin watcher-amstramgram -- : Watching ${folder}...\x1b[0m`);
        }
      });
      filesToWatch().forEach(file => {
        file = path__default["default"].resolve(file);
        this.addWatchFile(file);
        if (verbose === true) console.log(`\x1b[32m\x1B[1m-- Plugin watcher-amstramgram -- : Watching ${file}...\x1b[0m`);
      });
    },
  }
};

module.exports = indexModule;
