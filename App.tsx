import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import {NitroModules} from 'react-native-nitro-modules';
import {Logbook} from './modules/nitro/Logbook.nitro';
import SampleTurboModule from './modules/turbo/specs/NativeSampleModule';
import {
  getConcatString,
  getSamplesCount,
  getSamplesSize,
} from './utils/logbook';
import {measureAsync, Measurement, measureSync} from './utils/measure';
import {palette} from './utils/theme';

export const LogbookNitroModule =
  NitroModules.createHybridObject<Logbook>('Logbook');

const copyAssetToExternalPath = async (assetName: string): Promise<string> => {
  if (Platform.OS !== 'android') {
    throw new Error('This function is implemented only for Android.');
  }

  const destPath = `${RNFS.ExternalDirectoryPath}/${assetName}`;

  try {
    // Check if file already exists to avoid redundant copy
    const exists = await RNFS.exists(destPath);
    if (!exists) {
      console.log(`Copying ${assetName} to ${destPath}...`);
      await RNFS.copyFileAssets(assetName, destPath);
      console.log('Copy complete.');
    } else {
      console.log(`${assetName} already exists at ${destPath}`);
    }
    return destPath;
  } catch (error) {
    console.error(`Failed to copy asset: ${error}`);
    throw error;
  }
};

export default function App(): React.JSX.Element {
  const [measurementsSmall, setMeasurementsSmall] = React.useState<
    Measurement<number | ArrayBuffer | string>[][] | null
  >(null);
  const [measurementsHeavy, setMeasurementsHeavy] = React.useState<
    Measurement<number | ArrayBuffer | string>[][] | null
  >(null);
  const [status, setStatus] = React.useState<string | null>(null);

  const [isRunning, setIsRunning] = React.useState(false);
  const [progressStep, setProgressStep] = React.useState(0);
  const TOTAL_STEPS = 7;

  const [runs, setRuns] = React.useState('100');

  const flushUI = () => new Promise(resolve => setTimeout(resolve, 0));

  const setStatusAndFlushUI = async (text: string) => {
    console.log(text);
    setStatus(text);
    await flushUI();
  };

  const measureSyncAndUpdate = async <T,>(
    statusText: string,
    fn: () => T,
  ): Promise<Measurement<T>> => {
    await setStatusAndFlushUI(statusText);
    const runCount = parseInt(runs, 10);
    const count = isNaN(runCount) || runCount <= 0 ? 100 : runCount;
    return measureSync(fn, count);
  };

  const measureAsyncAndUpdate = async <T,>(
    statusText: string,
    fn: () => Promise<T>,
  ): Promise<Measurement<T>> => {
    await setStatusAndFlushUI(statusText);
    const runCount = parseInt(runs, 10);
    const count = isNaN(runCount) || runCount <= 0 ? 100 : runCount;
    return measureAsync(fn, count);
  };

  const runBenchmarkForFile = async (
    filepath: string,
    setMeasurements: React.Dispatch<
      React.SetStateAction<
        Measurement<number | ArrayBuffer | string>[][] | null
      >
    >,
    label: string,
    incrementProgress: () => void,
  ) => {
    console.log(`runBenchmark: starting with ${filepath}`);
    await setStatusAndFlushUI(`Starting benchmarks for ${label}...`);
    setMeasurements(null);

    try {
      const config: Array<{
        turbo: () => number | string;
        nitro: () => number | string;
        js: () => Promise<number | string>;
      }> = [
        {
          turbo: () => SampleTurboModule.getSamplesSize(filepath),
          nitro: () => LogbookNitroModule.getSamplesSize(filepath),
          js: async () => getSamplesSize(filepath),
        },
        {
          turbo: () => SampleTurboModule.getSamplesCount(filepath),
          nitro: () => LogbookNitroModule.getSamplesCount(filepath),
          js: async () => getSamplesCount(filepath),
        },
        {
          turbo: () => SampleTurboModule.getConcatString(filepath),
          nitro: () => LogbookNitroModule.getConcatString(filepath),
          js: async () => getConcatString(filepath),
        },
      ];

      const results: Measurement<number | ArrayBuffer | string>[][] = [];

      for (let i = 0; i < config.length; i++) {
        const c = config[i];
        const turbo = await measureSyncAndUpdate(
          `(${label}) Processing Turbomodules ${i + 1}...`,
          c.turbo as () => number | string,
        );
        const nitro = await measureSyncAndUpdate(
          `(${label}) Processing Nitromodules ${i + 1}...`,
          c.nitro as () => number | string,
        );
        const js = await measureAsyncAndUpdate(
          `(${label}) Processing JS ${i + 1}...`,
          c.js as () => Promise<number | string>,
        );
        results.push([turbo, nitro, js]);
        incrementProgress();
      }

      // special case for nitro zero copy
      const iteration = config.length;
      const nitro = await measureSyncAndUpdate(
        `(${label}) Processing Nitromodules ${iteration}...`,
        () => LogbookNitroModule.getConcatStringZeroCopy(filepath),
      );
      results.push([
        results[iteration - 1][0],
        nitro,
        results[iteration - 1][2],
      ]);
      incrementProgress();

      await setStatusAndFlushUI(`Benchmarks complete for ${label} ✅`);

      setMeasurements(results);
    } catch (e: any) {
      console.error('Benchmark threw:', e);
      setMeasurements(null);
      await setStatusAndFlushUI(`Error occurred for ${label} ❌`);
    }
  };

  const runAllBenchmarks = async () => {
    setIsRunning(true);
    setProgressStep(0);
    try {
      const smallFilePath = await copyAssetToExternalPath('small.zstd');
      const heavyFilePath = await copyAssetToExternalPath('big.zstd');

      const incrementProgress = () => setProgressStep(prev => prev + 1);

      await runBenchmarkForFile(
        smallFilePath,
        setMeasurementsSmall,
        'Small File',
        incrementProgress,
      );
      await runBenchmarkForFile(
        heavyFilePath,
        setMeasurementsHeavy,
        'Heavy File',
        incrementProgress,
      );
      await setStatusAndFlushUI('All benchmarks complete ✅');
    } finally {
      setIsRunning(false);
    }
  };

  const renderTable = (
    measurements: Measurement<number | ArrayBuffer | string>[][],
    title: string,
  ) => (
    <View style={styles.tableContainer}>
      <Text style={styles.info}>Results for {title} (avg per run):</Text>
      <View style={styles.table}>
        <View style={styles.tableRowHeader}>
          <Text
            style={[
              styles.tableCell,
              styles.tableHeaderCell,
              styles.functionCell,
            ]}>
            Function
          </Text>
          <Text style={[styles.tableCell, styles.tableHeaderCell]}>
            Turbomodules
          </Text>
          <Text style={[styles.tableCell, styles.tableHeaderCell]}>
            Nitromodules
          </Text>
          <Text style={[styles.tableCell, styles.tableHeaderCell]}>JS</Text>
        </View>

        {[
          'Get data size (bytes)',
          'Get json array size',
          'Get concat string from json',
          'Get concat string from json (zero-copy Nitro)',
        ].map((funcName, idx) => {
          const [turbo, nitro, js] = measurements[idx];
          const turboSpeedup = (js.avgTime / turbo.avgTime).toFixed(1);
          const nitroSpeedup = (js.avgTime / nitro.avgTime).toFixed(1);
          return (
            <View key={funcName} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.functionCell]}>
                {funcName}
              </Text>
              <Text style={styles.tableCell}>
                {turbo.avgTime.toFixed(2)} ms ({turboSpeedup}x vs JS)
              </Text>
              <Text style={styles.tableCell}>
                {nitro.avgTime.toFixed(2)} ms ({nitroSpeedup}x vs JS)
              </Text>
              <Text style={styles.tableCell}>{js.avgTime.toFixed(2)} ms</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.section}>
        <Text style={styles.title}>JS vs Turbo vs Nitro modules benchmark</Text>
        <View style={styles.runsRow}>
          <Text style={styles.subtitle}>Number of runs:</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={runs}
            onChangeText={setRuns}
          />
        </View>

        {!isRunning && (
          <Pressable style={styles.runButton} onPress={runAllBenchmarks}>
            <Text style={styles.runButtonText}>Run</Text>
          </Pressable>
        )}

        {isRunning && (
          <>
            <ActivityIndicator style={styles.spinner} size="large" />
            <Text style={styles.progress}>
              {progressStep}/{TOTAL_STEPS}
            </Text>
          </>
        )}

        {/* Show the current status if available */}
        {status && <Text style={styles.status}>{status}</Text>}

        {measurementsSmall && renderTable(measurementsSmall, 'Small File')}
        {measurementsHeavy && renderTable(measurementsHeavy, 'Heavy File')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white'},
  section: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {fontSize: 20, marginBottom: 16, textAlign: 'center'},
  info: {fontSize: 16, fontWeight: '600', marginTop: 16},
  status: {fontSize: 16, marginTop: 16, fontStyle: 'italic'},

  tableContainer: {
    marginTop: 24,
    width: '100%',
    paddingHorizontal: 16,
  },
  table: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 4,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: palette.headerBackground,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  functionCell: {
    flex: 1.5,
  },
  tableCell: {
    flex: 1,
    padding: 8,
    textAlign: 'center',
  },
  tableHeaderCell: {
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
    textAlign: 'center',
  },
  runsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitle: {fontSize: 16, marginRight: 8},
  runButton: {
    backgroundColor: palette.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    marginBottom: 16,
  },
  runButtonText: {
    color: palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  spinner: {marginTop: 16},
  progress: {fontSize: 16, marginTop: 8},
});
