import { HybridObject } from 'react-native-nitro-modules';

export interface Logbook
  extends HybridObject<{ android: 'c++'; ios: 'swift' }> {
  getSamplesSize(input: string): number;
  getSamplesCount(input: string): number;
  getConcatString(input: string): string;
  getConcatStringZeroCopy(input: string): ArrayBuffer;
}
