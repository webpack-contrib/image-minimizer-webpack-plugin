export type Schema = import("schema-utils/declarations/validate").Schema;
export type Compilation = import("webpack").Compilation;
/**
 * <T>
 */
export type LoaderOptions<T> = {
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
