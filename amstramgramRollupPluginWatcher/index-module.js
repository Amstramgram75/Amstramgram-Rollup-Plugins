import fs from "fs";
import path from "path";
import fg from "fast-glob";

/**
 * @param {*} options 
 *    @key {String || Array} files 
 *        Either a String or an array of strings.
 *        Each string should be a valid glob,
 *        or pointing to an existing file or directory.
 *        See here how to : 
 *        https://github.com/mrmlnc/fast-glob 
 *        If a string points to an existing directory, 
 *        the whole directory will be watched.
 *    @key {Boolean} verbose
 *        If set to true, output watched files to console.
 *        Default : false
 */
 export default (options = {}) => {
  let { files, verbose = false } = options
  if (typeof files === 'string') {
    files = [files]
    //Warn if files is not an array
  } else if (!Array.isArray(files)) {
    console.log(`\x1b[31m\x1B[1m!!! Plugin watcher-amstramgram ERROR !!!: Option must be a STRING or an array of STRINGS...\x1b[0m`)
    return
  }
  //Check if files is an empty array
  if (files.length == 0) {
    console.log(`\x1b[31m\x1B[1m!!! Plugin watcher-amstramgram ERROR !!!: You haven't set anything to watch : the plugin does nothing...\x1b[0m`)
    return
  }

  const
    glob = [],//Argument passed to fast-glob
    foldersToWatch = new Set()

  files.forEach(src => {
    src = path.resolve(src)
    //If src points to an existing directory (eg: docs_src\js or docs_src\js\)
    if (fs.existsSync(src) && fs.lstatSync(src).isDirectory()) {
      //If omitted, add a path separator at the end (docs_src\js becomes docs_src\js\)
      if (src.substr(src.length - 1) != path.sep) src += path.sep
      //Add the folder to foldersToWatch
      foldersToWatch.add(src)
    } else {
      //Replace path separator with / (docs_src\js\*.* becomes docs_src/js/*.*)
      src = src.split(path.sep).join('/')
      //Append to glob array
      glob.push(src)
    }
  })

  //Build the array of files to watch from the resulting glob
  const filesToWatch = _ => {
    const filesToWatch = fg.sync(glob, { absolute: true, onlyFiles: true, dot: true, unique: true })
    if (filesToWatch.length == 0 && foldersToWatch.size == 0) {
      console.log(`\x1b[33m\x1B[1m??? Plugin watcher-amstramgram WARNING ???: Nothing to watch ! Check my files option...\x1b[0m`)
    }
    return filesToWatch
  }

  return {
    name: 'watcher-amstramgram',
    async buildStart() {
      //This way, rollup will rebuild when a file is added to the folder
      foldersToWatch.forEach(folder => {
        if (fs.existsSync(folder)) {
          this.addWatchFile(folder)
          if (verbose === true) console.log(`\x1b[32m\x1B[1m-- Plugin watcher-amstramgram -- : Watching folder ${folder}...\x1b[0m`)
        }
      })
      filesToWatch().forEach(file => {
        file = path.resolve(file)
        this.addWatchFile(file)
        if (verbose === true) console.log(`\x1b[32m\x1B[1m-- Plugin watcher-amstramgram -- : Watching file ${file}...\x1b[0m`)
      })
    },
  }
}