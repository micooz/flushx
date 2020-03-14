/**
 * split array into chunks
 * @param arr
 * @param chunkSize
 */
export function splitChunks<T>(arr: T[], chunkSize: number): T[][] {
  if (arr.length < 1) {
    return [];
  }

  if (arr.length <= chunkSize) {
    return [ arr ];
  }

  const chunks: T[][] = [];
  const num = Math.ceil(arr.length / chunkSize);

  for (let i = 0; i < num; i++) {
    chunks.push(arr.slice(i * chunkSize, i * chunkSize + chunkSize));
  }

  return chunks;
}
