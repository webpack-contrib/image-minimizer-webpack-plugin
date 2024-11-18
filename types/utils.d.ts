export const IMAGE_MINIMIZER_PLUGIN_INFO_MAPPINGS: WeakMap<WeakKey, any>;
export type WorkerResult = import("./index").WorkerResult;
export type SquooshOptions = import("./index").SquooshOptions;
export type ImageminOptions = import("imagemin").Options;
export type WebpackError = import("webpack").WebpackError;
export type Task<T> = () => Promise<T>;
export type SvgoLib = typeof import("svgo");
export type SvgoOptions = {
    encodeOptions?: Omit<import("svgo").Config, "path" | "datauri"> | undefined;
};
export type SvgoEncodeOptions = Omit<import("svgo").Config, "path" | "datauri">;
export type Uint8ArrayUtf8ByteString = (array: number[] | Uint8Array, start: number, end: number) => string;
export type StringToBytes = (string: string) => number[];
export type MetaData = {
    warnings: Array<Error>;
    errors: Array<Error>;
};
export type SharpLib = typeof import("sharp");
export type Sharp = import("sharp").Sharp;
export type ResizeOptions = import("sharp").ResizeOptions & {
    enabled?: boolean;
    unit?: "px" | "percent";
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
