import { Readable } from 'stream';

import { rollup, OutputOptions, RollupOptions } from 'rollup';

/**
 * Options for constructing the output stream.
 */
export interface RollupStreamOptions {
  /**
   * Write output to the stream as objects to support multiple output chunks.
   */
  objectMode?: boolean;
}

const build = async (
  options: RollupOptions,
  streamOptions: RollupStreamOptions,
  stream: Readable
) => {
  const bundle = await rollup(options);

  stream.emit('bundle', bundle);

  const { output } = await bundle.generate(options.output as OutputOptions);

  for (const chunk of output) {
    if (streamOptions.objectMode) {
      stream.push(chunk);
    } else if (chunk.type === 'asset') {
      stream.push(chunk.source);
    } else {
      stream.push(chunk.code);

      if (chunk.map) {
        stream.push(`\n//# sourceMappingURL=${chunk.map.toUrl()}`);
      }
    }
  }

  // signal end of write
  stream.push(null);
};

/**
 * Creates a Node stream.
 * @param options - Options for rollup.
 * @param streamOptions - Options for the output stream.
 * @returns When object mode is not specified, a stream that contains data from the first chunk output by Rollup.
 * When object mode is specified, an object stream that contains the output data for each chunk output by Rollup
 * (each object in the stream will either be an OutputChunk or an OutputAsset).
 */
const stream = (options: RollupOptions, streamOptions: RollupStreamOptions = {}) => {
  const result = new Readable({
    objectMode: streamOptions.objectMode,
    // stub _read() as it's not available on Readable stream, needed by gulp et al
    read: () => {}
  });

  build(options, streamOptions, result).catch((error) => {
    result.emit('error', error);
  });

  return result;
};

export default stream;
