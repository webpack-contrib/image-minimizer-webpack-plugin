const { createHash } = require("crypto");
const path = require("path");
const { promisify } = require("util");
const fs = require("graceful-fs");
const { mkdirp } = require("mkdirp");
const { WritableStreamBuffer } = require("stream-buffers");

const close = promisify(fs.close);
const open = promisify(fs.open);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const utimes = promisify(fs.utimes);

const { lock } = require("proper-lockfile");

const cleanups = new Set();

// eslint-disable-next-line jest/require-hook
process.on("exit", () => {
  for (const cleanup of cleanups) {
    cleanup();
  }
});

/**
 * @template T
 * @typedef {import("webpack").LoaderContext<T>} LoaderContext<T>
 * */

/**
 * @typedef {import("stream").Writable} Writable
 * */

/**
 * @typedef {import("crypto").BinaryLike} BinaryLike
 * */

/**
 * @typedef {import("buffer").Buffer} Buffer
 * */

// let lockCount = 0;
/**
 * @template T
 * @param {string} file
 * @param {() => Promise<T>} cb
 * @returns {Promise<T | undefined>}
 */
async function lockAndExecuteOnce(file, cb) {
  let lockFile = file;

  try {
    await stat(file);
  } catch {
    lockFile = `${file}_lock`;

    try {
      const time = new Date();

      await utimes(lockFile, time, time);
    } catch {
      try {
        await close(await open(lockFile, "w"));
      } catch {
        // ignore
      }
    }
  }

  const releaseLock = await lock(lockFile, { fs, retries: 10 });

  const cleanup = async () => {
    cleanups.delete(cleanup);

    await releaseLock();

    if (lockFile !== file) {
      try {
        await unlink(lockFile);
      } catch {
        // ignore
      }
    }
  };

  cleanups.add(cleanup);

  try {
    return await cb();
  } finally {
    cleanup();
  }
}

/** @param {BinaryLike} content */
export function hashContent(content) {
  return createHash("sha1").update(content).digest("hex");
}

/**
 * @param {Buffer} content
 * @param {(resultWriteable: Writable) => Promise<void>} processContent
 * @param {string} [cacheDir] If provided, will attempt to read the corresponding cached file instead of calling
 * processContent.
 * @returns {Promise<Buffer | undefined>}
 */
export async function processAndMaybeCacheContent(
  content,
  processContent,
  cacheDir,
) {
  if (cacheDir) {
    const cacheFile = path.resolve(
      path.join(cacheDir, hashContent(/** @type {BinaryLike} */ (content))),
    );

    try {
      await stat(path.dirname(cacheFile));
    } catch {
      await mkdirp(path.dirname(cacheFile));
    }

    return /** @type {Promise<Buffer>} */ (
      lockAndExecuteOnce(cacheFile, async () => {
        try {
          await stat(cacheFile);
        } catch {
          // this cleanup is for if the writing to the cache file gets _interrupted_ (by a kill signal or the like), to
          // ensure we don't allow a partially generated file to be used as the cached file.
          const cleanup = () => {
            unlink(cacheFile);
          };

          cleanups.add(cleanup);

          await processContent(fs.createWriteStream(cacheFile));

          cleanups.delete(cleanup);
        }

        return readFile(cacheFile);
      })
    );
  }

  const outputStreamBuffer = new WritableStreamBuffer();

  await processContent(outputStreamBuffer);

  const output = outputStreamBuffer.getContents();

  if (output) {
    return output;
  }
}
