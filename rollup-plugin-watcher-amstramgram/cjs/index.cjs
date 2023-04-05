'use strict';

var fs = require('fs');
var fg = require('fast-glob');
var util = require('util');

//UTILS
const
  isObject = o => Object.prototype.toString.call(o) === '[object Object]',
  //https://nodejs.org/api/util.html#utilinspectobject-options
  stringify = v => util.inspect(v, { breakLength: Infinity }),
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
  warn = error => console.log(red(bold(`-- AMSTRAMGRAM-WATCHER-ERROR --\n|  ${error}`))),
  //DISPLAY MAGENTA NOTIFICATION
  notify = notification => console.log(magenta(bold(`-- AMSTRAMGRAM-WATCHER-NOTIFICATION --\n|  ${notification}`))),
  //DISPLAY GREEN MESSAGE
  inform = msg => console.log(green(bold(`-- AMSTRAMGRAM-WATCHER-PLUGIN --\n|  ${msg}`)));


/**
 * @param {Object} options 
 *    @property {String | Array<String>} files (required)
 *        Either a String or an array of strings.
 *        Each string should be a valid glob,
 *        or pointing to an existing file or directory.
 *        See here how to : 
 *        https://github.com/mrmlnc/fast-glob 
 *    @property {Boolean} verbose : specifies whether messages and notifications should be send to terminal (default : false).
 *    @property {Boolean} warnOnError : specifies whether warnings should be logged on process errors (default : true).
 */
var index = (options = {}) => {
  let { files, verbose = false, warnOnError = true } = options;
    //OPTIONS CHECK
  //options is not an object
  if (!isObject(options)) {
    if (warnOnError) warn(`I need an object as parameter !\n|  I received ${yellow(stringify(options))}`);
    return
  }
  if (typeof files === 'string') {
    files = [files];
    //Warn if files is not an array
  } else if (!Array.isArray(files)) {
    if (warnOnError === true) warn(`Option must be a STRING or an array of STRINGS\n|  I received ${yellow(stringify(files))}`);
    return
    //If one or more of the items is not a string
  } else if (!files.every(f => typeof f === 'string')) {
    const bad = files.filter(f => typeof f !== 'string').map(f => stringify(f));
    if (bad.length == files.length) {
      if (warnOnError === true) warn(`None of the items in the ${italic('files')} option is a string.\n|  I received ${yellow(stringify(files))}`);
      return
    } else {
      files = files.filter(f => typeof f == 'string');
      if (warnOnError === true) notify(`Invalid item${bad.length == 1 ? ' ' + yellow(bad.join()) + ' has' : 's ' + yellow(bad.join(', ')) + ' have'} been removed from ${italic('files')} option.\n|  Option ${italic('files')} is now set to\n|  ${yellow(stringify(files))}`);
    }
    //Check if files is an empty array
  } else if (files.length == 0) {
    if (warnOnError === true) notify(`You haven't set anything to watch : the plugin does nothing...`);
    return
  }

  let
    needToUpdate = false,//Will pass to true if options files includes a glob
    foldersToWatch = new Set(),
    filesToWatch = new Set();
  const
    globsToWatch = [],//Array passed to fast-glob
    isNotAlreadyInFoldersToWatch = folder => [...foldersToWatch].every(f => !folder.startsWith(f + '/')),
    cleanAndAddToFoldersToWatchIfNotAlreadyIncluded = folder => {
      if (isNotAlreadyInFoldersToWatch(folder)) {
        //If necessary, remove folders that are included in folder
        foldersToWatch.forEach(f => { if (f.startsWith(folder + '/')) foldersToWatch.delete(f); });
        foldersToWatch.add(folder);
      }
    };

  files.forEach(src => {
    if (fs.existsSync(src)) {
      if (fs.lstatSync(src).isDirectory()) {
        cleanAndAddToFoldersToWatchIfNotAlreadyIncluded(src);
      } else {
        filesToWatch.add(src);
      }
    } else {
      //If not pointing to a folder or a file, src should be a glob
      //and we need to update foldersToWatch and filesToWatch
      //on each rebuild in case files/folders have been created/deleted
      needToUpdate = true;
      globsToWatch.push(src);
    }
  });

  //If necessary, remove files that are included in already watched folders
  filesToWatch.forEach(f => { if (!isNotAlreadyInFoldersToWatch(f)) filesToWatch.delete(f); });

  //basicFoldersToWatch and basicFilesToWatch
  //store folders and files defined by a string.
  //foldersToWatch and filesToWatch are updated
  //with the glob result on each rebuild
  const
    basicFoldersToWatch = new Set(foldersToWatch),
    basicFilesToWatch = new Set(filesToWatch),
    //Recreate foldersToWatch and filesToWatch based on the resulting glob
    updateItemsToWatch = _ => {
      //Reset foldersToWatch to basicFoldersToWatch
      foldersToWatch = new Set(basicFoldersToWatch);
      //Update it with the glob result
      fg.sync(globsToWatch, { onlyDirectories: true }).forEach(f => cleanAndAddToFoldersToWatchIfNotAlreadyIncluded(f));
      //Get filesToWatch
      filesToWatch = new Set([...fg.sync(globsToWatch, { onlyFiles: true }).filter(f => isNotAlreadyInFoldersToWatch(f)), ...basicFilesToWatch]);
      if (foldersToWatch.size == 0 && filesToWatch.size == 0 && warnOnError === true)
        notify(`The supplied glob does not match anything.\n|  There is nothing to watch.`);
    };

  return {
    name: 'watcher-amstramgram',
    async buildStart() {
      if (needToUpdate) {
        try {
          updateItemsToWatch();
        } catch (e) {
          //Just in case of an error is thrown by fast-glob
          if (warnOnError) warn(e);
        }
      }
      foldersToWatch.forEach(folder => {
        this.addWatchFile(folder);
        if (verbose === true) inform(`Watching folder ${italic(folder)}`);
      });
      filesToWatch.forEach(file => {
        this.addWatchFile(file);
        if (verbose === true) inform(`Watching folder ${italic(file)}`);
      });
    }
  }
};

module.exports = index;
