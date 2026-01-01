import {TurboModule, TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  readonly getSamplesSize: (input: string) => number;
  readonly getSamplesCount: (input: string) => number;
  readonly getConcatString: (input: string) => string;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NativeSampleModule',
);
