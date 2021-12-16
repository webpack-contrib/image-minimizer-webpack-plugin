export = loader;
/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compilation} Compilation */
/**
 * @template T
 * @typedef {Object} LoaderOptions<T>
 * @property {string} [severityError] Allows to choose how errors are displayed.
 * @property {import("./index").Minimizer<T> | import("./index").Minimizer<T>[]} [minimizer]
 * @property {import("./index").Generator<T>[]} [generator]
 */
/**
 * @template T
 * @this {import("webpack").LoaderContext<LoaderOptions<T>>}
 * @param {Buffer} content
 * @returns {Promise<Buffer | undefined>}
 */
declare function loader<T>(content: Buffer): Promise<Buffer | undefined>;
declare class loader<T> {
  /** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
  /** @typedef {import("webpack").Compilation} Compilation */
  /**
   * @template T
   * @typedef {Object} LoaderOptions<T>
   * @property {string} [severityError] Allows to choose how errors are displayed.
   * @property {import("./index").Minimizer<T> | import("./index").Minimizer<T>[]} [minimizer]
   * @property {import("./index").Generator<T>[]} [generator]
   */
  /**
   * @template T
   * @this {import("webpack").LoaderContext<LoaderOptions<T>>}
   * @param {Buffer} content
   * @returns {Promise<Buffer | undefined>}
   */
  constructor(content: Buffer);
  resourcePath: string | undefined;
  resourceQuery: string | undefined;
}
declare namespace loader {
  export { raw, Schema, Compilation, LoaderOptions };
}
declare var raw: boolean;
type Schema = import("schema-utils/declarations/validate").Schema;
type Compilation = import("webpack").Compilation;
/**
 * <T>
 */
type LoaderOptions<T> = {
  /**
   * Allows to choose how errors are displayed.
   */
  severityError?: string | undefined;
  minimizer?:
    | import("./index").Minimizer<T>
    | import("./index").Minimizer<T>[]
    | undefined;
  generator?: import("./index").Generator<T>[] | undefined;
};
