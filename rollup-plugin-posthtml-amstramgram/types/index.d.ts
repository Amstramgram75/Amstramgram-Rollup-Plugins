import {Plugin} from 'rollup'
import PostHTML from 'posthtml'

export interface Job {
  /**
   * A string or a glob or an array of strings and/or globs defining the files to process.
   * See here for detail on glob syntax :https://github.com/mrmlnc/fast-glob
   */
  readonly from: string | string[];

  /**
   * A string or an array of strings pointing to folder(s) where to put the result.
   */
  readonly to: string | string[];

  /**
   * A string that sets the reference for the result tree (default: undefined).
   */
  readonly root?: string;

  /**
   * A string or a function that defines how the resulting file(s) should be named (default: undefined).
   */
  readonly rename?: string | ((name: string, fullPath: string) => string);

}


export interface HtmlOptions extends PostHTML.Options {
  /**
   * A Job or an array of Jobs
   * A Job is an object whose properties are :
   * - from (required): a string or a glob or an array of strings and/or globs defining the files to process.
   *      See here for detail on glob syntax :https://github.com/mrmlnc/fast-glob
   * - to (required): a string or an array of strings pointing to folder(s) where to put the result.
   * - root : a string that sets the reference for the result tree (default: undefined).
   * - rename : a string or a function that defines how the resulting file(s) should be named (default: undefined).
   * 
   */
  readonly jobs: Job | Job[];

  /**
   * Array of posthtml plugins to applied.
   * @default []
   */
  readonly plugins?: PostHTML.Plugin<PostHTML.Node>[];

  /**
   * A String or an array of strings defining accepted extensions.
   * Only files with one of the listed extension will be processed.
   * Example : ext: 'html'
   * (if omitted, the dot will automatically be added).
   * @default ['.html', '.htm'];
   */
  readonly ext?: string | string[];

  /**
   * Specifies whether folders containing files to process
   * (including their dependencies) should be watched.
   * @default false
   */
  readonly watch?: boolean;

  /**
   * Defines the hook used to process the files.
   * @default 'transform'
   */
  readonly processHook?: string;

  /**
   * Specifies whether messages and notifications should be send to terminal.
   * @default false
   */
  readonly verbose?: boolean;

  /**
   * Specifies whether warnings should be logged for process errors.
   * @default true
   */
  readonly warnOnError?: boolean;
}

/**
 * A Rollup plugin to process the files you want via posthtml
 * @param options - Plugin options.
 * 
 * options is an object with those properties : 
 * - jobs (required) : an object or an array of objects that 
 *    defines where to search for files to process and where to put the results.
 * - plugins : an array of posthtml plugins to applied.
 * - ext : a string or an array of strings. 
 *    Only files with one of the listed extension will be processed.
 *    Example : ext: 'html'
 *    (if omitted, the dot will automatically be added).
 *    (default : ['.html', '.htm']).
 * - watch : a boolean specifying whether folders containing files to process
 *    (including their dependencies) should be watched (default : false).
 * - processHook : a string that defines the hook used to process the files (default : 'transform').
 * - verbose : a boolean specifying whether messages and notifications should be send to terminal (default : false).
 * - warnOnError : a boolean specifying whether warnings should be logged on process errors (default : true).
 * 
 * @returns Plugin instance.
 * 
 */
export default function rollupPluginPosthtmlAmstramgram(options: HtmlOptions): Plugin;