import type { Plugin } from 'rollup'

export interface WatchOptions {
  /**
   * Either a String or an array of strings.
   * Each string should be a valid glob,
   * or pointing to an existing file or directory.
   * See here for detail on glob syntax :https://github.com/mrmlnc/fast-glob
   */
  readonly files: string | string[];

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
 * A Rollup plugin to watch the folders and files you want.
 * @param options - Plugin options.
 * options is an object with those properties : 
 * - files (required) : Either a String or an array of strings.
 *        Each string should be a valid glob,
 *        or pointing to an existing file or directory.
 *        See here for detail on glob syntax : 
 *        https://github.com/mrmlnc/fast-glob
 * - verbose : a boolean specifying whether messages and notifications should be send to terminal (default : false).
 * - warnOnError : a boolean specifying whether warnings should be logged on process errors (default : true).
 * 
 * @returns Plugin instance.
 * 
 */
export default function rollupPluginWatcherAmstramgram(options: WatchOptions): Plugin;