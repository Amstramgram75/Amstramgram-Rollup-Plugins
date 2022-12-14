'use strict';

var fs = require('fs');
var path = require('path');
var url = require('url');
var fg = require('fast-glob');
var PostHTML = require('posthtml');

/**
 * 
 * @param {*} options 
 *    @key {String || Array} files 
 *        Either a String or an array of strings.
 *        Each string should be a valid glob,
 *        or pointing to an existing file or directory.
 *        See here how to : 
 *        https://github.com/mrmlnc/fast-glob 
 *        If a string points to an existing directory, 
 *        it will be converted to a glob including all this directory files.
 *        Eg : "docs_src" becomes "docs_src/*.*"
 *        However, only files with a '.htm' or 'html' extension will be processed.
 *    @key {String} to: a String pointing to the destination directory.
 *    @key {Array} plugins: posthtml plugins to applied.
 *    @key {Boolean} watch: if true, watch the processed files and their dependencies.
 *         If undefined, it follows the rollup watchMode.
 */
var indexModule = (options = {}) => {
  let { from, to, plugins = [], watch } = options;

  const __dirname = path.dirname(url.fileURLToPath((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('index-common.js', document.baseURI).href))));

  //If necessary, convert from option to Array
  if (typeof from === 'string') {
    from = [from];
    //Warn if from is not an array
  } else if (!Array.isArray(from)) {
    console.log(`\x1b[31m\x1B[1m!!! Plugin posthtml-amstramgram ERROR !!!: Option from must be a STRING or an array of STRINGS...\x1b[0m`);
    return
  }

  //Check if to is string
  if (typeof to !== 'string') {
    console.log(`\x1b[31m\x1B[1m!!! Plugin posthtml-amstramgram ERROR !!!: Option to must be a STRING...\x1b[0m`);
    return
  }
  to = path.resolve(to);

  if (plugins.length === 0) {
    console.log(`\x1b[31m\x1B[1m!!! Plugin posthtml-amstramgram ERROR !!!: You did not set any plugins : PostHTML does nothing...\x1b[0m`);
    return
  }

  const
    glob = [],//Argument passed to fast-glob
    foldersToWatch = new Set();

  from.forEach(src => {
    src = path.resolve(src);
    //If src points to an existing directory (eg: docs_src or docs_src\)
    if (fs.existsSync(src) && fs.lstatSync(src).isDirectory()) {
      //If omitted, add a path separator at the end (docs_src becomes docs_src\
      if (src.substr(src.length - 1) != path.sep) src += path.sep;
      //Add the folder to foldersToWatch
      foldersToWatch.add(src);
      //Add a joker to select all files (docs_src\ becomes docs_src\*.*)
      src += '*.*';
    }
    //Replace path separator with / (docs_src\*.* becomes docs_src/*.*)
    src = src.split(path.sep).join('/');
    //Append to glob array
    glob.push(src);
  });

  //Build the array of files to process from the resulting glob and filter it to keep only html files
  const filesToProcess = _ => {
    const filesToProcess = fg.sync(glob, { absolute: true, onlyFiles: true, dot: true, unique: true }).filter(file => path.extname(file).toLowerCase() == '.htm' || path.extname(file).toLowerCase() == '.html');
    if (filesToProcess.length == 0) {
      console.log(`\x1b[33m\x1B[1m??? Plugin posthtml-amstramgram WARNING ???: No html file to process...\x1b[0m`);
    }
    return filesToProcess
  };

  const filesToEmit = new Map();

  //Passed to true after the first transform hook. Reset to false at the end of generateBundle hook
  let done = false;

  return {
    name: 'posthtml-amstramgram',
    async buildStart() {
      if (typeof watch != "boolean") watch = this.meta.watchMode;
      if (watch) {
        //If there are folders to watch
        //This way, rollup will rebuild when a file is added to the folder
        foldersToWatch.forEach(folder => this.addWatchFile(folder));
      }
    },
    async transform() {
      //The hook can be triggered several times during the bundle
      //If the posthtml process has already been completed, we simply return
      if (done) return null

      //Reset
      filesToEmit.clear();

      await Promise.all(filesToProcess().map(async (src) => {
        src = path.resolve(src);
        const
          srcRelative = path.relative(__dirname, src),
          dest = to + path.sep + path.basename(src);

        if (watch) this.addWatchFile(src);

        //Read file content
        const fileContent = await fs.promises.readFile(src, "utf-8").catch(error => {
          console.log(`\x1b[31m\x1B[1m!!! Plugin posthtml-amstramgram ERROR !!!: unable to read ${srcRelative} file - ${error}\x1b[0m...`);
        });

        //Processing
        const result = await PostHTML(plugins)
          .process(fileContent, { from: src, to: dest })
          .catch((error) => {
            console.log(`\x1b[31m\x1B[1m!!! Plugin posthtml-amstramgram ERROR !!!: ${error.message}\x1b[0m...`);
          });

        if (result && result.html) {
          if (Array.isArray(result.messages) && result.messages.length > 0) {
            result.messages
              .filter(msg => msg.hasOwnProperty('type') && msg.type == 'dependency' && msg.hasOwnProperty('file'))
              .forEach(msg => { if (watch) this.addWatchFile(path.resolve(msg.file)); });
          }
          filesToEmit.set(src, result);
        } else {
          console.log(`\x1b[31m\x1B[1m!!! Plugin posthtml-amstramgram ERROR !!!: Unable to process data from ${srcRelative}\x1b[0m...`);
        }
      }));
      //All work has been done : done is now true
      done = true;
    },
    async generateBundle() {
      //Create destination directory
      await fs.promises.mkdir(to, { recursive: true }).catch(error => {
        console.log(`\x1b[31m\x1B[1m!!! Plugin posthtml-amstramgram ERROR !!!: Fail to create ${to} directory - ${error}\x1b[0m...`);
      });
      filesToEmit.forEach((result, src) => {
        const
          srcRelative = path.relative(__dirname, src),
          dest = to + path.sep + path.basename(src),
          destRelative = path.relative(__dirname, dest);
        //Write the result
        fs.writeFile(dest, result.html, error => {
          if (error) {
            console.log(`\x1b[31m\x1B[1m!!! Plugin posthtml-amstramgram ERROR !!!: Unable to write ${destRelative} file\x1b[0m...`);
          } else {
            console.log(`\x1b[32m\x1B[1m-- Plugin posthtml-amstramgram -- : \x1b[22mprocess \x1B[1m${srcRelative} \x1b[22mto \x1B[1m${destRelative}\x1b[0m...`);
          }
        });
      });
      //Reset done
      done = false;
    }
  }
};

module.exports = indexModule;
