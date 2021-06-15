export default fileTypeFromBuffer;
/**
 * @param {ArrayBuffer | ArrayLike<number>} input
 */
declare function fileTypeFromBuffer(input: ArrayBuffer | ArrayLike<number>):
  | {
      ext: string;
      mime: string;
    }
  | undefined;
