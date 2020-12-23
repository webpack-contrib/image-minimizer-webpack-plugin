export default ImageMinimizerPlugin;
export type Filter = (source: Buffer, sourcePath: string) => boolean;
export type PluginOptions = {
  /**
   * Allows filtering of images for optimization.
   */
  filter?: Filter | undefined;
  /**
   * Test to match files against.
   */
  test?: string | RegExp | (string | RegExp)[] | undefined;
  /**
   * Files to include.
   */
  include?: string | RegExp | (string | RegExp)[] | undefined;
  /**
   * Files to exclude.
   */
  exclude?: string | RegExp | (string | RegExp)[] | undefined;
  /**
   * Allows to choose how errors are displayed.
   */
  severityError?: string | boolean | undefined;
  /**
   * Options for `imagemin`.
   */
  minimizerOptions?: Object | undefined;
  /**
   * Automatically adding `imagemin-loader`.
   */
  loader?: boolean | undefined;
  /**
   * Maximum number of concurrency optimization processes in one time.
   */
  maxConcurrency?: number | undefined;
  /**
   * Allows to set the filename for the generated asset. Useful for converting to a `webp`.
   */
  filename?: string | undefined;
  /**
   * Allows to remove original assets. Useful for converting to a `webp` and remove original assets.
   */
  deleteOriginalAssets?: boolean | undefined;
};
declare class ImageMinimizerPlugin {
  /**
   * @param {PluginOptions} [options={}] Plugin options.
   */
  constructor(options?: PluginOptions | undefined);
  options: {
    severityError: string | boolean | undefined;
    filter: Filter;
    exclude: string | RegExp | (string | RegExp)[] | undefined;
    minimizerOptions:
      | Object
      | {
          plugins: never[];
        };
    include: string | RegExp | (string | RegExp)[] | undefined;
    loader: boolean;
    maxConcurrency: number | undefined;
    test: string | RegExp | (string | RegExp)[];
    filename: string;
    deleteOriginalAssets: boolean;
  };
  optimize(
    compiler: any,
    compilation: any,
    assets: any,
    moduleAssets: any
  ): Promise<void>;
  apply(compiler: any): void;
}
declare namespace ImageMinimizerPlugin {
  const loader: string;
  const normalizeConfig: typeof import('./utils/normalize-config').default;
}
