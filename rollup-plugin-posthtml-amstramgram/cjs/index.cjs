'use strict';

var fs = require('fs');
var path = require('path');
var fg = require('fast-glob');
var posthtml = require('posthtml');
var util = require('util');

//TYPES
/**
 * @typedef Jobs
 * @type {Job|Array<Job>}
 */

/**
 * @typedef Job
 * @type {Object}
 * @property {String|Array<String>} from
 * @property {String|Array<String>} to
 * @property {String} [root]
 * @property {String|Function} [rename]
 */

/**
 * @typedef File
 * @type {Object}
 * @property {String} src
 * @property {Array<String>} paths : array with path.resolve(src) as first item and all the paths of the dependencies
 * @property {Array<String>} dest : array of the processed files path
 * @property {String} result : posthtml process result
 * @property {Boolean} toUpdate : pass to true if the file needs to be updated. Reset to false after the new file is written
 */

//UTILS
const
  isObject = o => Object.prototype.toString.call(o) === '[object Object]',
  //https://nodejs.org/api/util.html#utilinspectobject-options
  stringify = v => util.inspect(v, { breakLength: Infinity }),
  /**
   * @param {string} p : path
   * @return {string}
   * Replace backslash by slash for windows path
   */
  slash = p => p.replace(/\\/g, '/'),
  /**
   * @param {path} p 
   * @returns {string} The path of a folder relatively to the working project.
   * Backslash are replaced by slash for windows path
   */
  getBasePath = p => slash(path.relative(process.cwd(), p)),
  //Log utilities
  //https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
  /**
   * @param {string} t : a string to decorate for log
   * @param {integer} start : 
   * @param {integer} [39] end :
   * @example :
   * decorate(This is a test, 1, 22) 
   * returns 
   * \u001b[1mThis is a test\u001b[22m
   * ie This is a test in bold
   */
  decorate = (t, start, end = 39) => `\u001b[${start}m${t}\u001b[${end}m`,
  bold = t => decorate(t, 1, 22),
  italic = t => decorate(t, 3, 23),
  red = t => decorate(t, 31),
  green = t => decorate(t, 32),
  magenta = t => decorate(t, 35),
  yellow = t => decorate(t, 33),
  //DISPLAY RED WARNING
  warn = error => console.log(red(bold(`-- AMSTRAMGRAM-POSTHTML-ERROR --\n|  ${error}`))),
  //DISPLAY MAGENTA NOTIFICATION
  notify = notification => console.log(magenta(bold(`-- AMSTRAMGRAM-POSTHTML-NOTIFICATION --\n|  ${notification}`))),
  //DISPLAY GREEN MESSAGE
  inform = msg => console.log(green(bold(`-- AMSTRAMGRAM-POSTHTML-PLUGIN --\n|  ${msg}`)));

//If a glob is provided in from option of a job
//it will be necessary to monitor the creation/deletion 
//of files or folders to update the list of files to be processed
//even if watch option is set to false
let needToUpdate = false;

/**
 * checkFromTo()
 * @param {String|Array<String>} opt : from or to property of a job
 * @returns {String} error message
 * @description check the validity of the from or to property of a job
 * from/to can be a non-empty string or an array of non-empty strings
 */
function checkFromTo(opt) {
  if (!Array.isArray(opt) && typeof opt !== 'string') {
    return `must be a string or an array.`
    //If String
  } else if (typeof opt === 'string') {
    if (opt == '') {
      return `can't be an empty string.`
    }
    //If array
  } else if (Array.isArray(opt)) {
    if (opt.length == 0) {
      return `can't be an empty array.`
    } else {
      let error = '';
      opt.every(o => {
        if (typeof o !== 'string') {
          error = `includes at least one element that is not a string : ${yellow(stringify(o))}`;
          return false
        } else if (!o) {
          error = `includes at least one empty string.`;
          return false
        }
        return true
      });
      return error
    }
  }
  //No error has been detected
  return ''
}

/**
 * checkJob(job)
 * @param {Job} job
 * @returns {String} error message
 * @description check if job is valid
 * First of all, job must be an object
 * Each job must at least have two properties : from and to.
 *    - from must be a string (a file path or a glob).
 *    - to must be a non-empty string or an array of non-empty strings.
 * Optional root property may be a string or undefined.
 * Optional rename property may be undefined
 * or a string or a function returning a string.
 */
function checkJob(job) {
  let error = '', toString = stringify(job);
  //First of all, job must be an object
  if (!isObject(job)) {
    error = `${italic(`"jobs"`)} option must be an object or an array of objects.\n|  I received ${yellow(stringify(job))}.`;
    //job must have a from property
  } else if (!Object.keys(job).includes('from')) {
    error = `${italic(`"from"`)} property of job "${italic(toString)}" is not set.`;
    //job must have a to property
  } else if (!Object.keys(job).includes('to')) {
    error = `${italic(`"to"`)} property of job "${italic(toString)}" is not set.`;
    //Check if from property is valid
  } else if (checkFromTo(job.from)) {
    error = `${italic(`"from"`)} property of job "${italic(toString)}"\n|  ${checkFromTo(job.from)}`;
    //Check if to property is valid
  } else if (checkFromTo(job.to)) {
    error = `${italic(`"to"`)} property of job "${italic(toString)}"\n|  ${checkFromTo(job.to)}`;
    //Check if root property is valid
    //root may be undefined or a non-empty string
  } else if (job.root !== undefined && typeof job.root !== 'string') {
    error = `${italic(`"root"`)} property of job "${italic(toString)}"\n|  must be a string.\n|  I received ${yellow(stringify(job.root))}.`;
  } else if (job.root == '') {
    error = `${italic(`"root"`)} property of job "${italic(toString)}"\n|  can't be a non-empty string.`;
    //Check if rename property is valid
    //rename may be undefined or a non-empty string or a function returning a string
  } else if (job.rename !== undefined && typeof job.rename !== 'string' && typeof job.rename !== 'function') {
    error = `${italic(`"rename"`)} property of job "${italic(toString)}"\n|  must be a string or a function.`;
  } else if (job.rename == '') {
    error = `${italic(`"rename"`)} property of job "${italic(toString)}"\n|  can't be a non-empty string.`;
  }
  //Convert job.from into array
  if (typeof job.from == 'string') {
    job.from = [job.from];
  }
  //Convert job.to into array
  if (typeof job.to == 'string') {
    job.to = [job.to];
  }
  //Ensure that each destination folder ends with /
  job.to = job.to.map(dest => dest.endsWith('/') ? dest : dest + '/');
  //needToUpdate will pass to true if a glob is detected
  //in a from option
  job.from = job.from.map(f => {
    //If f points to an existing directory or file
    if (fs.existsSync(f)) {
      //If it's a directory, set the item as a glob
      //including all the files inside
      if (fs.lstatSync(f).isDirectory()) {
        needToUpdate = true;
        return f += f.endsWith('/') ? '*' : '/*'
        //If it's a file, needToUpdate is untouched
      } else {
        return f
      }
      //If f does not exist, it should be a glob
    } else {
      needToUpdate = true;
      return f
    }
  });
  //No error has been detected
  return error
}

/**
 * checkJobs(jobs)
 * @param {Job|Array<Job>} jobs : either an array of Job objects or an unique Job object
 * @returns {Boolean} true if no error is detected, false otherwise
 */
function checkJobs(jobs, warnOnError) {
  let error;
  //If array
  if (Array.isArray(jobs)) {
    if (jobs.length == 0) {
      error = `${italic(`"jobs"`)} option can't be an empty array.`;
      //Check if each element is a valid Job object
    } else {
      jobs.every(job => {
        error = checkJob(job);
        //If error, stop the every loop
        return (error) ? false : true
      });
    }
  } else {
    //Check if jobs option is a valid Job object
    error = checkJob(jobs);
  }
  if (error && warnOnError) warn(error);
  return (error) ? false : true
}

/**
 * getProcessedFilePath(name, path, rename)
 * @param {String} name : name of the original file
 * @param {String} path : path of the original file
 * @param {String|Function} rename : Job option rename
 * @returns {String} : path of the resulting processed file
 */
function getProcessedFilePath(name, path, rename) {
  return typeof rename === 'string'
    ? rename
    : rename(name, path)
}

/**
 * getProcessedFilesPaths(src, dest, root, rename)
 * @param {String} src source of the file to process
 * @param {Array<String>} dest array of folders to store the processed file
 * @param {String} root String that sets the reference for the result tree
 * @param {String | Function} rename how to rename the processed file
 * @returns {Array} an array of the processed files path
 * @description : build the dest property of a File object
 */
function getProcessedFilesPaths(src, dest, root, rename) {
  /**
   * @example :
   * src = 'src/html/index.html'
   * dest = ['dev/', 'prod/']
   * => name = 'index'
   * => ext = '.html'
   * => dir = 'src/html'
   */
  const
    { name, ext, dir } = path.parse(src),
    processedFilesPath = [];
  dest.forEach(d => {
    const destinationFolder = (!root || (!dir.startsWith(root)))
      ? d
      : dir.replace(root, d);// src/html => dev/html | prod/html
    // dev/html/index.html | prod/html/index.html
    processedFilesPath.push(path.join(destinationFolder, (rename ? getProcessedFilePath(name, src, rename) : name) + ext));
  });
  return processedFilesPath
}

/**
 * !!!!!!PLUGIN!!!!!!!
 */
/**
 * @param {object} options 
 *  @property {Job | Array<Job>} jobs
 *        @property {String | Array<String>} from (required) : A string or a glob or an array of strings and/or globs defining the files to process.
 *              https://github.com/mrmlnc/fast-glob 
 *        @property {String | Array<String>} dest (required) : one or several folders to put the processed files.
 *              If a string is provided, it will be converted to an array : 
 *              'prod/html' => ['prod/html]
 *        @property {String} root : A string that sets the reference for the result tree (default: undefined).
 *        @property {String | Function} rename : how to rename the processed file (default: undefined).
 *    @property {Array} plugins (required) : an array of posthtml plugins to applied.
 *    @property {String | Array<String>} ext: a string or an array of strings. 
 *          Only files with one of the listed extension will be processed.
 *          Example : ext: 'html'
 *          (if omitted, the dot will automatically be added).
 *          (default : ['.html', '.htm']).
 *    @property {Boolean} watch: specifies whether folders containing files to process.
 *          (including their dependencies) should be watched (default : false).
 *    @property {String} processHook: defines the hook used to process the files (default : 'transform').
 *    @property {Boolean} verbose: specifies whether messages and notifications should be send to terminal (default : false).
 *    @property {Boolean} warnOnError: specifies whether warnings should be logged on process errors (default : true).
 * 
 * @returns Plugin Instance
*/
function rollupPluginPosthtmlAmstramgram(options) {
  let {
    jobs,
    plugins = [],
    watch = false,
    ext = ['.html', '.htm'],
    processHook = 'transform',
    verbose = false,
    warnOnError = true,
    ...postHtmlOptions
  } = options;

  //Reset if rollup config changes
  needToUpdate = false;

  /***********************************************
   *                                             *
   *                OPTIONS CHECK                *
   *                                             *
   **********************************************/
  //options is not an object
  if (!isObject(options)) {
    if (warnOnError) warn(`I need an object as parameter !\n|  I received ${yellow(stringify(options))}`);
    return
  }
  //options is an empty object
  if (Object.keys(options).length == 0) {
    if (warnOnError) warn(`No options have been set!!!.`);
    return
  }
  //option jobs is not set
  if (!jobs) {
    if (warnOnError) warn(`${italic(`"jobs"`)} option is not set.`);
    return
  }
  //Check jobs option
  if (!checkJobs(jobs, warnOnError)) return
  if (!Array.isArray(jobs)) jobs = [jobs];
  //Check plugins option
  if (!Array.isArray(plugins)) {
    if (warnOnError) warn(`${italic(`"plugins"`)} option must be an array.\n|  I received ${yellow(stringify(plugins))}`);
    return
  } else if (plugins.length == 0) {
    if (verbose) notify(`${italic(`"plugins"`)} option is empty.\n|  I have nothing to do but copy !`);
  }
  //Check ext option
  //ext must be a non-empty string or an array of non-empty strings
  if (typeof ext === 'string') {
    if (ext == '') {
      if (warnOnError) warn(`${italic(`"ext"`)} option can't be an empty string.`);
      return
    }
    ext = [ext];
  } else if (Array.isArray(ext)) {
    if (ext.length == 0) {
      if (warnOnError) warn(`${italic(`"ext"`)} option can't be an empty array.`);
      return
    }
    let checkExt = ext.filter(e => typeof e !== 'string' || e == '');
    if (checkExt.length > 0) {
      //All the ext elements are invalid
      if (checkExt.length == ext.length) {
        if (warnOnError) warn(`none of the items found in the ${italic(`"ext"`)} option is a valid string.\n|  I received ${yellow(stringify(ext))}`);
        return
      } else {
        ext = ext.filter(e => typeof e === 'string');
        if (verbose) notify(`${italic(`"ext"`)} option has been cleaned up of invalid element${checkExt.length > 1 ? 's' : ''}\n|  and is now set to : ${yellow(stringify(ext))}`);
      }
    }
  } else {
    if (warnOnError) warn(`${italic(`"ext"`)} option must be a non-empty string or an array of non-empty strings.\n|  I received ${yellow(stringify(ext))}`);
    return
  }
  //Add a point before each extension if necessary
  //['html', 'htm'] => ['.html', '.htm']
  ext = ext.map(e => e.charAt(0) != '.' ? '.' + e : e);
  //Check processHook option
  let watchChangeHook = 'watchChange';
  const
    hooksAllowingWatch = ['buildStart', 'closeWatcher', 'load', 'moduleParsed', 'options', 'resolveId', 'shouldTransformCachedModule', 'transform'],
    hooksDisallowingWatch = ['resolveDynamicImport', 'buildEnd', 'augmentChunkHash', 'banner', 'closeBundle', 'footer', 'generateBundle', 'intro', 'outro', 'renderChunk', 'renderDynamicImport', 'renderError', 'renderStart', 'resolveFileUrl', 'resolveImportMeta', 'writeBundle'],
    prohibitedHooks = ['watchChange', 'outputOptions'];
  if (prohibitedHooks.includes(processHook)) {
    if (warnOnError) warn(`Sorry but you can't use ${yellow(stringify(processHook))}\n|  as ${italic(`"processHook"`)} option.`);
    return
  }
  if (!hooksAllowingWatch.includes(processHook) && !hooksDisallowingWatch.includes(processHook)) {
    if (warnOnError) warn(`${italic(`"processHook"`)} option is not a rollup hook.\n|  I received ${yellow(stringify(processHook))}`);
    return
  }
  if (hooksDisallowingWatch.includes(processHook)) {
    if (watch === true) {
      if (verbose) notify(`${italic(`"watch"`)} option is set to true but will be ignored\n|  since ${italic(`"processHook"`)} option is ${italic(processHook)}.\n|  Nothing can be watched after build has finished.`);
      watch = false;
    }
    watchChangeHook = '';
  }

  /***********************************************
   *                                             *
   *              END OPTIONS CHECK              *
   *                                             *
   **********************************************/

  //Store the paths of the folders to watch
  let foldersToWatch = [];
  /**
   * watchFolder(folder) 
   * @param {String} folder 
   * @description update the foldersToWatch array with folder 
   * if folder is not already included in it
   */
  function watchFolder(folder) {
    folder = path.resolve(folder);
    if (foldersToWatch.includes(folder)) return
    //If folder is not already include in one of the watched folders
    //ie : folder = 'src/css/import' is included 'src/css'
    if (foldersToWatch.every(f => !folder.startsWith(f + path.sep))) {
      //Remove the watched folders included in folder
      foldersToWatch = foldersToWatch.filter(f => !f.startsWith(folder + path.sep));
      //Finally add the folder
      foldersToWatch.push(folder);
    }
  }


  /**
   * getFiles()
   * @returns {Array<File>} array of File objects
   * @description build the filesToProcess array
   * Called only once if each item of from points to a file
   * Updated if one or more items of from points to a directory or is a glob
   * if a creation or deletion is detected during the watchChange hook
   */
  async function getFiles() {
    const files = [];
    for (const job of jobs) {
      //Get the files to process from the glob job.from
      let from = await fg(job.from, { onlyFiles: true, dot: true, unique: true });
      //Exclude all the files with a non valid extension
      from = from.filter(file => ext.includes(path.extname(file).toLowerCase()));
      if (from.length == 0) {
        if (verbose) notify(`No file to process in the ${yellow(italic("from"))} option\n|  of job ${yellow(stringify(job))}`);
      } else {
        from.forEach(src => {
          watchFolder(path.dirname(src));
          //Build the file object and add it to the files array
          files.push(
            {
              src: src,
              dest: getProcessedFilesPaths(src, job.to, job.root, job.rename),
              toUpdate: true
            }
          );
        });
      }
    }
    if (files.length == 0 && warnOnError) warn(`No file to process were found`);
    return files
  }

  let
    //Result of getFiles
    //Reset to undefined on watchChange hook
    //if a watched item is deleted
    //or if a file is added to a watched folder
    filesToProcess,
    //Boolean passed to true if an error is thrown during process
    processError;

  /**
   * process(rollup)
   * @param {rollup.Plugin} rollup this plugin instance 
   * process files with posthtml
   */
  async function process(rollup) {
    processError = false;
    if (!filesToProcess) filesToProcess = await getFiles();
    await Promise.all(filesToProcess.filter(file => file.toUpdate).map(async (file) => {
      //Read file content
      const fileContent = await fs.promises.readFile(file.src, "utf-8").catch(error => {
        if (warnOnError) warn(`unable to read ${italic(file.src)} file.\n|  ${error}`);
        processError = true;
      });
      //Reset file.paths
      if (file.paths) file.paths.clear();
      file.paths = new Set([path.resolve(file.src)]);

      if (!processError) {
        const result = await posthtml(plugins)
          .process(fileContent, postHtmlOptions)
          .catch((error) => {
            //If there is an error in a dependency, we have to keep on eye on it
            if (error.file) {
              watchFolder(path.dirname(error.file));
              file.paths.add(path.resolve(error.file));
            }
            if (warnOnError) warn(error.message);
            processError = true;
          });
        if (result && result.html) {
          if (Array.isArray(result.messages) && result.messages.length > 0) {
            //Watch the dependencies
            result.messages
              .filter(msg => msg.hasOwnProperty('type') && msg.type == 'dependency' && msg.hasOwnProperty('file'))
              .forEach(msg => {
                watchFolder(path.dirname(msg.file));
                file.paths.add(path.resolve(msg.file));
              });
          }
          //Store the result in file.html
          file.html = result.html;
        } else {
          if (warnOnError) warn(`Unable to process data from ${italic(file.src)}.`);
          processError = true;
        }


      }
    }));
    //If watch option is set to true
    //or 
    //if the list of files to process might change and rollup is in watch mode
    if (watch || (needToUpdate && rollup.meta.watchMode)) {
      Promise.all(foldersToWatch.map(async (folder) => {
        try {
          //If folder is not already watched by rollup
          //or not included in an already watched folder
          if (!rollup.getWatchFiles().includes(folder) && rollup.getWatchFiles().every(f => !folder.startsWith(f + path.sep))) {
            rollup.addWatchFile(folder);
            if (verbose) {
              if (watch) {
                notify(`Watching ${italic(getBasePath(folder))} folder.`);
              } else {
                notify(`Watching ${italic(getBasePath(folder))} folder\n|  in case you add or remove an item.`);
              }
            }
          }
        } catch (e) {
          // if (verbose) notify(`Cannot call "addWatchFile" after the build has finished.`)
        }
      }));
    }
  }

  //Passed to true after the first processHook. 
  //Reset to false at the end of generateBundle hook.
  let done = false;

  return {
    name: 'posthtml-amstramgram',
    async [watchChangeHook](id, change) {
      //Update the files to process if necessary
      if (needToUpdate && (change.event == 'create' || change.event == 'delete')) {
        const folder = path.dirname(id);
        if (filesToProcess && (foldersToWatch.includes(folder) || foldersToWatch.some(f => folder.startsWith(f + path.sep)))) {
          filesToProcess = undefined;
        }
      } else {
        //If id points to a file we have to process, set toUpdate as true
        filesToProcess.forEach(file => {
          if (file.paths.has(path.resolve(id))) file.toUpdate = true;
        });
      }
    },

    async [processHook]() {
      //The hook can be triggered several times during the bundle
      //If the posthtml process has already been completed, we simply return
      if (done) return
      await process(this);
      done = true;
    },

    async writeBundle() {
      if (!done) await process(this);
      if (!processError) {
        //Store the created folders
        const foldersCreated = [];
        await Promise.all(filesToProcess.filter(file => file.toUpdate).map(async (file) => {
          //Reset the toUpdate property to false
          file.toUpdate = false;
          await Promise.all(file.dest.map(async (destFile) => {
            //Create directory if necessary
            const destFolder = path.dirname(destFile);
            //If destFolder has not been yet created
            if (!foldersCreated.includes(destFolder)) {
              foldersCreated.push(destFolder);
              if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
            }
            //Write the file
            fs.writeFile(destFile, file.html, error => {
              if (error) {
                warn.log(`Unable to write ${italic(slash(destFile))} file.\n|  ${error}`);
              } else {
                if (verbose) inform(`processes ${italic(file.src)}\n|  to ${italic(slash(destFile))}`);
              }
            });
          }));
        }));
      }
      //Reset done
      done = false;
    }
  }
}

module.exports = rollupPluginPosthtmlAmstramgram;
