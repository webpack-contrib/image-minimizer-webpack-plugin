/** @param {BinaryLike} content */
export function hashContent(content: BinaryLike): string;
/**
 * @param {Buffer} content
 * @param {(resultWriteable: Writable) => Promise<void>} processContent
 * @param {string} [cacheDir] If provided, will attempt to read the corresponding cached file instead of calling
 * processContent.
 * @returns {Promise<Buffer | undefined>}
 */
export function processAndMaybeCacheContent(
  content: Buffer,
  processContent: (resultWriteable: Writable) => Promise<void>,
  cacheDir?: string | undefined,
): Promise<Buffer | undefined>;
/**
 * <T>
 */
export type LoaderContext<T> = import("webpack").LoaderContext<T>;
export type Writable = import("stream").Writable;
export type BinaryLike = import("crypto").BinaryLike;
export type Buffer = import("buffer").Buffer;
