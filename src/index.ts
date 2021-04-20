import { Readable } from 'stream';

import { rollup, OutputOptions, RollupOptions } from 'rollup';

export interface RollupStreamOptions {
  /**
   * True to output vinyl objects to the stream.
   */
  outputVinyl?: boolean;
}

const build = async (options: RollupOptions, streamOptions: RollupStreamOptions, stream: Readable) => {
  const bundle = await rollup(options);

  stream.emit('bundle', bundle);

  const { output } = await bundle.generate(options.output as OutputOptions);

  const vinylDependencies = streamOptions.outputVinyl
    ? {
      buffer: require('buffer') as typeof import('buffer'),
      util: require('util') as typeof import('util'),
      vinyl: require('vinyl') as typeof import('vinyl')
    }
    : undefined;

  for (const chunk of output) {
    if (chunk.type === 'asset') {
      if (vinylDependencies) {
        const source = typeof chunk.source === 'string'
          ? new vinylDependencies.util.TextEncoder().encode(chunk.source)
          : chunk.source;

        stream.push(new vinylDependencies.vinyl({
          path: chunk.fileName,
          contents: new vinylDependencies.buffer.Buffer(source)
        }));
      } else {
        stream.push(chunk.source);
      }
    } else {
      if (vinylDependencies) {
        const source = new vinylDependencies.util.TextEncoder().encode(chunk.code);

        stream.push(new vinylDependencies.vinyl({
          path: chunk.fileName,
          contents: new vinylDependencies.buffer.Buffer(source)
        }));
      } else {
        stream.push(chunk.code);
      }

      if (chunk.map) {
        stream.push(`\n//# sourceMappingURL=${chunk.map.toUrl()}`);
      }
    }
  }

  // signal end of write
  stream.push(null);
};

const createVinylStream = () => {
  const through = require('through2') as typeof import('through2');
  return through({
    objectMode: true
  });
};

const createStream = () => new Readable({
  // stub _read() as it's not available on Readable stream, needed by gulp et al
  read: () => { }
})

const stream = (options: RollupOptions, streamOptions: RollupStreamOptions = {}) => {
  const result: Readable = streamOptions.outputVinyl
    ? createVinylStream()
    : createStream();

  build(options, streamOptions, result).catch((error) => {
    result.emit('error', error);
  });

  return result;
};

export default stream;
