export type LoaderOptions = {
  /**
   * Allows to choose how errors are displayed.
   */
  severityError?: string | undefined;
  /**
   * Options for `imagemin`.
   */
  minimizerOptions?: import("./index").MinimizerOptions | undefined;
  /**
   * Allows to set the filename for the generated asset. Useful for converting to a `webp`.
   */
  filename?: string | undefined;
  minify?: import("./index").MinifyFunctions | undefined;
};
export type Rules = import("./index").Rules;
export type MinimizerOptions = import("./index").MinimizerOptions;
export type MinifyFunctions = import("./index").MinifyFunctions;
export type InternalMinifyOptions = import("./index").InternalMinifyOptions;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type LoaderContext = import("webpack").LoaderContext<LoaderOptions>;
export type Compilation = import("webpack").Compilation;
