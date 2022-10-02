import { Plugin } from 'rollup'


interface Options {
  /**
   * Either a string or an array of strings.
   * Each string should be a valid glob,
   * or pointing to an existing file or directory.
   * See here how to : 
   * https://github.com/mrmlnc/fast-glob 
   * If a string points to an existing directory, 
   * the whole directory will be watched.
   */
  readonly files: string | string[];

  /**
   * If set to true, output watched files to console.
   * @default false
   */
  readonly verbose?: boolean;
}

export default function (options?: Options): Plugin