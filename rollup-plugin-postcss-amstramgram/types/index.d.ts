import type { Plugin } from 'rollup'
import type {Syntax, Parser, Stringifier} from 'postcss'


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


export interface CssOptions {

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
   * Array of postcss plugins to applied.
   * @default []
   */
  readonly plugins?: any[];

  /**
   * A String or an array of strings defining accepted extensions.
   * Only files with one of the listed extension will be processed.
   * Example : ext: 'css'
   * (if omitted, the dot will automatically be added).
   * @default ['.css', '.scss', '.sass'];
   */
  readonly ext?: string | string[];

  /**
   * Specifies whether source maps should be generated.
   * @default false
   */
  readonly sourcemap?: boolean;

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

  /**
   * Object with parse and stringify.
   * https://postcss.org/api/#processoptions
   */
  readonly syntax?: Syntax;

  /**
   * Function to generate AST by string.
   * https://postcss.org/api/#processoptions
   */
  readonly parser?: Parser;

  /**
   * Class to generate string by AST.
   * https://postcss.org/api/#processoptions
   */
  readonly stringifier?: Stringifier;
}

/**
 * A Rollup plugin to process the files you want via postcss
 * @param options - Plugin options.
 * 
 * options is an object with those properties : 
 * - jobs (required) : an object or an array of objects that 
 *    defines where to search for files to process and where to put the results.
 * - plugins : an array of postcss plugins to applied.
 * - ext : a string or an array of strings. 
 *    Only files with one of the listed extension will be processed.
 *    Example : ext: 'css'
 *    (if omitted, the dot will automatically be added).
 *    (default : ['.css', '.scss', '.sass']).
 * - sourcemap : a boolean specifying whether source maps should be generated (default : false).
 * - watch : a boolean specifying whether folders containing files to process
 *    (including their dependencies) should be watched (default : false).
 * - processHook : a string that defines the hook used to process the files (default : 'transform').
 * - verbose : a boolean specifying whether messages and notifications should be send to terminal (default : false).
 * - warnOnError : a boolean specifying whether warnings should be logged on process errors (default : true).
 * - syntax : Object with parse and stringify (postcss option).
 * - parser : Function to generate AST by string (postcss option).
 * - stringifier : Class to generate string by AST (postcss option).
 * 
 * @returns Plugin instance.
 * 
 */
export default function rollupPluginPostcssAmstramgram(options: CssOptions): Plugin;