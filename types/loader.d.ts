export type FilterFn = import("./index").FilterFn;
export type Rules = import("./index").Rules;
export type MinifyFunctions = import("./index").MinifyFunctions;
export type MinimizerOptions = import("./index").MinimizerOptions;
export type Generator = import("./index").Generator;
export type InternalWorkerOptions = import("./index").InternalWorkerOptions;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type LoaderContext = import("webpack").LoaderContext<LoaderOptions>;
export type Compilation = import("webpack").Compilation;
export type LoaderOptions = {
  /**
   * Allows filtering of images for optimization.
   */
  filter?: import("./index").FilterFn | undefined;
  /**
   * Allows to choose how errors are displayed.
   */
  severityError?: string | undefined;
  /**
   * Allows to set the filename for the generated asset. Useful for converting to a `webp`.
   */
  filename?: string | undefined;
  /**
   * Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
   */
  deleteOriginalAssets?: boolean | undefined;
  minify?: import("./index").MinifyFunctions | undefined;
  /**
   * Options for minify.
   */
  minimizerOptions?: import("./index").MinimizerOptions | undefined;
  generator?:
    | import("./index").Generator
    | import("./index").Generator[]
    | undefined;
};
