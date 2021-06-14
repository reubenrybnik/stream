import { Readable } from 'stream';

import { RollupOptions } from 'rollup';

/**
 * Options for constructing the output stream.
 */
export interface RollupStreamOptions {
  /**
   * Write output to the stream as objects to support multiple output chunks.
   */
  objectMode?: boolean

}

/**
 * Creates a Node stream.
 * @param options - Options for rollup.
 * @param streamOptions - Options for the output stream.
 * @returns A stream containing the output that Rollup produces given the specified options.
 */
export default function stream(options: RollupOptions, streamOptions?: RollupStreamOptions): Readable;
