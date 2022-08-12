export type WorkerResult = import("./index.js").WorkerResult;
export type SharpLib = typeof import("sharp");
export type Sharp = import("sharp").Sharp;
export type ResizeOptions = import("sharp").ResizeOptions & {
  enabled?: boolean;
};
export type SharpEncodeOptions = {
  avif?: import("sharp").AvifOptions | undefined;
  gif?: import("sharp").GifOptions | undefined;
  heif?: import("sharp").HeifOptions | undefined;
  jpeg?: import("sharp").JpegOptions | undefined;
  jpg?: import("sharp").JpegOptions | undefined;
  png?: import("sharp").PngOptions | undefined;
  webp?: import("sharp").WebpOptions | undefined;
};
export type SharpFormat = keyof SharpEncodeOptions;
export type SharpOptions = {
  resize?: ResizeOptions | undefined;
  rotate?: number | "auto" | undefined;
  sizeSuffix?: SizeSuffix | undefined;
  encodeOptions?: SharpEncodeOptions | undefined;
};
export type SizeSuffix = (width: number, height: number) => string;
/**
 * @param {WorkerResult} original
 * @param {SharpOptions} [minimizerOptions]
 * @returns {Promise<WorkerResult>}
 */
export function sharpMinify(
  original: WorkerResult,
  minimizerOptions?: SharpOptions | undefined
): Promise<WorkerResult>;
/**
 * @param {WorkerResult} original
 * @param {SharpOptions} minimizerOptions
 * @returns {Promise<WorkerResult>}
 */
export function sharpGenerate(
  original: WorkerResult,
  minimizerOptions: SharpOptions
): Promise<WorkerResult>;
