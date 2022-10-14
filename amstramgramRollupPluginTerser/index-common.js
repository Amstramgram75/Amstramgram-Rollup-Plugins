'use strict';

var codeFrameColumns = require('@babel/code-frame');
var jestWorker = require('jest-worker');
var serialize = require('serialize-javascript');
var module$1 = require('module');

var indexModule = (userOptions = {})  => {
  console.log(userOptions);
  return {
    name: "terser",

    async renderChunk(code, chunk, outputOptions) {
      if (!this.worker) {
        const require$1 = module$1.createRequire((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('index-common.js', document.baseURI).href)));
        this.worker = new jestWorker.Worker(require$1.resolve('./transform.cjs') , {
          numWorkers: userOptions.numWorkers,
        });
        this.numOfBundles = 0;
      }

      this.numOfBundles++;

      const defaultOptions = {
        sourceMap:
          outputOptions.sourcemap === true ||
          typeof outputOptions.sourcemap === "string",
      };
      if (outputOptions.format === "es" || outputOptions.format === "esm") {
        defaultOptions.module = true;
      }
      if (outputOptions.format === "cjs") {
        defaultOptions.toplevel = true;
      }

      const normalizedOptions = { ...defaultOptions, ...userOptions };

      if (normalizedOptions.hasOwnProperty('numWorkers')) delete normalizedOptions['numWorkers'];

      const serializedOptions = serialize(normalizedOptions);

      try {
        const result = await this.worker.transform(code, serializedOptions);

        if (result.nameCache) {
          let { vars, props } = userOptions.nameCache;

          // only assign nameCache.vars if it was provided, and if terser produced values:
          if (vars) {
            const newVars =
              result.nameCache.vars && result.nameCache.vars.props;
            if (newVars) {
              vars.props = vars.props || {};
              Object.assign(vars.props, newVars);
            }
          }

          // support populating an empty nameCache object:
          if (!props) {
            props = userOptions.nameCache.props = {};
          }

          // merge updated props into original nameCache object:
          const newProps =
            result.nameCache.props && result.nameCache.props.props;
          if (newProps) {
            props.props = props.props || {};
            Object.assign(props.props, newProps);
          }
        }

        return result.result;
      } catch (error) {
        const { message, line, col: column } = error;
        console.error(
          codeFrameColumns(code, { start: { line, column } }, { message })
        );
        throw error;
      } finally {
        this.numOfBundles--;

        if (this.numOfBundles === 0) {
          this.worker.end();
          this.worker = 0;
        }
      }
    },
  }
};

module.exports = indexModule;
