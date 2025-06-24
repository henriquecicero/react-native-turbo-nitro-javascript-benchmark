# React Native: JavaScript vs TurboModules vs NitroModules — Benchmark

This project compares the performance of **JavaScript**, **TurboModules**, and **NitroModules** in a React Native app by benchmarking a realistic workflow involving I/O, compression and JSON parsing. The goal is to demonstrate the performance benefits of moving heavy operations tasks into shared native C++ code used by TurboModules and NitroModules.

> [!NOTE]
> This project currently supports only Android builds

TurboModules are part of React Native's [native modules](https://reactnative.dev/docs/turbo-native-modules-introduction) system. NitroModules (from Margelo) are an alternative implementation focused on performance; see the [NitroModules documentation](https://nitro.margelo.com/) for details.

Benchmarked operations

1. **Get data size (bytes)**: read .zstd -> decompress -> return size
2. **Get JSON array size**: read .zstd -> decompress -> parse json -> return array size
3. **Get concatenated string from JSON**: read .zstd -> decompress -> parse json -> return concatenated string values
4. **Get concatenated string from JSON (zero-copy Nitro)**: Same as (3) but using the zero-copy BufferArray in the Nitro implementation to avoid extra allocations and copies.

# Summary of results (release build)

* Native Modules dramatically outperform pure JavaScript: TurboModules and NitroModules run roughly **30–60× faster** for these workloads.
* TurboModules and NitroModules show similar performance overall, as the heavy lifting is done in the shared C++ code.
* Nitro's zero-copy strategy (reusing buffers) provides an additional **~8–40% improvement** on large payloads or when many allocations occur.
* Device CPU affects absolute latency but not the relative ordering of approaches.

## Pixel 9 results (1000 runs)

### Small File

| Operation                                     | TurboModules          | NitroModules          | JavaScript |
| --------------------------------------------- | --------------------- | --------------------- | ---------- |
| Get data size (bytes)                         | 0.36 ms (46.2x vs JS) | 0.27 ms (62.2x vs JS) | 16.62 ms   |
| Get JSON array size                           | 0.50 ms (57.2x vs JS) | 0.54 ms (53.7x vs JS) | 28.86 ms   |
| Get concat string from json                   | 0.55 ms (59.6x vs JS) | 0.57 ms (57.7x vs JS) | 32.82 ms   |
| Get concat string from json (zero-copy Nitro) | 0.55 ms (59.6x vs JS) | 0.65 ms (50.4x vs JS) | 32.82 ms   |

### Heavy File

| Operation                                     | TurboModules          | NitroModules          | JavaScript |
| --------------------------------------------- | --------------------- | --------------------- | ---------- |
| Get data size (bytes)                         | 4.01 ms (28.8x vs JS) | 3.37 ms (34.2x vs JS) | 115.56 ms  |
| Get JSON array size                           | 5.70 ms (62.1x vs JS) | 6.50 ms (54.5x vs JS) | 353.95 ms  |
| Get concat string from json                   | 7.08 ms (50.0x vs JS) | 6.73 ms (52.6x vs JS) | 354.23 ms  |
| Get concat string from json (zero-copy Nitro) | 7.08 ms (50.0x vs JS) | 6.11 ms (58.0x vs JS) | 354.23 ms  |


## Orca Display 2 results (1000 runs)

### Small File

| Operation                                     | TurboModules          | NitroModules          | JavaScript |
| --------------------------------------------- | --------------------- | --------------------- | ---------- |
| Get data size (bytes)                         | 0.62 ms (34.4x vs JS) | 0.58 ms (36.4x vs JS) | 21.19 ms   |
| Get JSON array size                           | 0.96 ms (61.6x vs JS) | 0.97 ms (60.7x vs JS) | 58.94 ms   |
| Get concat string from json                   | 1.03 ms (57.6x vs JS) | 1.05 ms (56.8x vs JS) | 59.52 ms   |
| Get concat string from json (zero-copy Nitro) | 1.03 ms (57.6x vs JS) | 1.02 ms (58.2x vs JS) | 59.52 ms   |


### Heavy File

| Operation                                     | TurboModules           | NitroModules           | JavaScript |
| --------------------------------------------- | ---------------------- | ---------------------- | ---------- |
| Get data size (bytes)                         | 6.05 ms (31.5x vs JS)  | 6.06 ms (31.5x vs JS)  | 190.69 ms  |
| Get JSON array size                           | 9.80 ms (60.1x vs JS)  | 9.57 ms (61.5x vs JS)  | 588.45 ms  |
| Get concat string from json                   | 12.25 ms (48.6x vs JS) | 12.51 ms (47.6x vs JS) | 594.98 ms  |
| Get concat string from json (zero-copy Nitro) | 12.25 ms (48.6x vs JS) | 10.61 ms (56.1x vs JS) | 594.98 ms  |



