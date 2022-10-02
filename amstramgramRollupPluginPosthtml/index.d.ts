import { Plugin } from 'rollup'


interface Options {
  /**
   * Either a string or an array of strings.
   * Each string should be a valid glob,
   * or pointing to an existing file or directory.
   * See here how to : 
   * https://github.com/mrmlnc/fast-glob 
   * If a string points to an existing directory, 
   * it will be converted to a glob including all this directory files.
   * Eg : "docs_src/" becomes "docs_src/*.*"
   * However, only files with a '.htm' or '.html' extension will be processed.
   */
  readonly from: string | string[];

  /**
   * A string pointing to the destination directory.
   */
  readonly to: string;

  /**
   * Array of posthtml plugins to applied.
   */
  readonly plugins?: Plugin[];

  /**
   * If true, watch the processed files and their dependencies.
   * If undefined, it follows the rollup watchMode.
   */
  readonly watch?: boolean;
}

export default function (options?: Options): Plugin