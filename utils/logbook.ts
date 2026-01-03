import { Buffer } from 'buffer';
import { decompress } from 'fzstd';
import RNFetchBlob from 'react-native-blob-util';
import { toByteArray } from 'react-native-quick-base64';

export const readFile = async (fileName: string): Promise<Uint8Array> => {
  const base64String = await RNFetchBlob.fs.readFile(fileName, 'base64');
  return toByteArray(base64String);
};

export const readFileAndDecompress = async (
  fileName: string,
): Promise<Uint8Array> => {
  const base64Blob = await RNFetchBlob.fs.readFile(fileName, 'base64');
  const blob = toByteArray(base64Blob);
  const data = decompress(blob);
  return data;
};

export const getSamplesSize = async (filename: string): Promise<number> => {
  const data = await readFileAndDecompress(filename);
  return data.length;
};

export const getSamplesCount = async (filename: string): Promise<number> => {
  const data = await readFileAndDecompress(filename);
  const obj = JSON.parse(
    Buffer.from(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    ).toString('utf-8'),
  );
  if (!Array.isArray(obj)) {
    throw new Error('JSON file does not contain an array');
  }
  return obj.length;
};

export const getSamples = async (filename: string): Promise<string[]> => {
  const data = await readFileAndDecompress(filename);
  const obj = JSON.parse(
    Buffer.from(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    ).toString('utf-8'),
  );
  if (!Array.isArray(obj)) {
    throw new Error('JSON file does not contain an array');
  }
  return obj.map(item => {
    return item.data;
  });
};

export const getConcatString = async (filename: string): Promise<string> => {
  const data = await readFileAndDecompress(filename);
  const obj = JSON.parse(
    Buffer.from(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    ).toString('utf-8'),
  );
  if (!Array.isArray(obj)) {
    throw new Error('JSON file does not contain an array');
  }
  return obj.map(item => item.data).join('');
};
