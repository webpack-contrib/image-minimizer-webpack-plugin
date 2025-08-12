export = loader;
/**
 * @template T
 * @this {import("webpack").LoaderContext<LoaderOptions<T>>}
 * @param {Buffer} content content
 * @returns {Promise<Buffer | undefined>} processed content
 */
declare function loader<T>(
  this: import("webpack").LoaderContext<LoaderOptions<T>>,
  content: Buffer,
): Promise<Buffer | undefined>;
declare namespace loader {
  export {
    raw,
    Schema,
    Compilation,
    WorkerResult,
    Minimizer,
    Generator,
    LoaderOptions,
  };
}
declare var raw: boolean;
type Schema = import("schema-utils/declarations/validate").Schema;
type Compilation = import("webpack").Compilation;
type WorkerResult = import("./utils").WorkerResult;
/**
 * <T>
 */
type Minimizer<T> = import("./index").Minimizer<T>;
/**
 * <T>
 */
type Generator<T> = import("./index").Generator<T>;
/**
 * <T>
 */
type LoaderOptions<T> = {
  /**
   * allows to choose how errors are displayed.
   */
  severityError?: string | undefined;
  /**
   * minimizer configuration
   */
  minimizer?: (Minimizer<T> | Minimizer<T>[]) | undefined;
  /**
   * generator configuration
   */
  generator?: Generator<T>[] | undefined;
};
