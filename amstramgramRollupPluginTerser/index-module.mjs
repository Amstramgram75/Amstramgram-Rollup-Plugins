import { codeFrameColumns } from "@babel/code-frame"
import { Worker as JestWorker } from 'jest-worker';
import serialize from "serialize-javascript"
import { createRequire } from 'module';


export default (userOptions = {}) => {
  if (userOptions.sourceMap != null) {
    throw Error(
      "sourceMap option is removed. Now it is inferred from rollup options."
    );
  }
  return {
    name: "terser",

    async renderChunk(code, chunk, outputOptions) {
      if (!this.worker) {
        const require = createRequire(import.meta.url);
        this.worker = new JestWorker(require.resolve('./transform.cjs'), {
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
}