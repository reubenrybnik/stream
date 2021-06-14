import { Readable } from 'stream';

const read = (stream: Readable) =>
  new Promise<string>((p, f) => {
    let data = '';
    stream.on('end', () => p(data));
    stream.on('error', (err) => f(err));
    stream.on('data', (chunk) => {
      data += chunk.toString();
    });
  });

const readObjects = (stream: Readable) =>
  new Promise<unknown[]>((p, f) => {
    let data: unknown[] = [];
    stream.on('end', () => p(data));
    stream.on('error', (err) => f(err));
    stream.on('data', (chunk: unknown) => {
      data.push(chunk);
    });
  });

const wait = (event: string, stream: Readable) =>
  new Promise<unknown>((p) => {
    stream.on(event, (data) => p(data));
  });

export default { read, readObjects, wait };
