# react-native-turbo-nitro-javascript-benchmark

This project is forked from
[orca-io/rn-turbo-nitro-js-benchmark](https://github.com/orca-io/rn-turbo-nitro-js-benchmark).

You can check the
[original README](./original_README.md)
or see how the project is currently evolving in
[orca-io/rn-turbo-nitro-js-benchmark](https://github.com/orca-io/rn-turbo-nitro-js-benchmark/blob/master/README.md).
They have an amazing device called **Orca Display** that outperforms a **Pixel 9** in these benchmarks.

I’m publishing the results of my own tests below.

## Samsung Galaxy A12 (SM-A125M) · Android 12 · 1000 runs

### Small File

| Operation                                     | TurboModules          | NitroModules          | JavaScript |
| --------------------------------------------- | --------------------- | --------------------- | ---------- |
| Get data size (bytes)                         | 1.99 ms (38.8x vs JS) | 1.98 ms (38.9x vs JS) | 77.07 ms   |
| Get JSON array size                           | 2.90 ms (68.2x vs JS) | 2.91 ms (68.0x vs JS) | 197.61 ms  |
| Get concat string from json                   | 3.20 ms (62.0x vs JS) | 3.20 ms (62.1x vs JS) | 198.57 ms  |
| Get concat string from json (zero-copy Nitro) | 3.20 ms (62.0x vs JS) | 3.19 ms (62.3x vs JS) | 198.57 ms  |

### Heavy File

| Operation                                     | TurboModules           | NitroModules           | JavaScript |
| --------------------------------------------- | ---------------------- | ---------------------- | ---------- |
| Get data size (bytes)                         | 19.70 ms (37.4x vs JS) | 19.70 ms (37.4x vs JS) | 737.21 ms  |
| Get JSON array size                           | 28.99 ms (68.0x vs JS) | 28.83 ms (68.4x vs JS) | 1971.47 ms |
| Get concat string from json                   | 33.69 ms (58.8x vs JS) | 33.72 ms (58.8x vs JS) | 1981.79 ms |
| Get concat string from json (zero-copy Nitro) | 33.69 ms (58.8x vs JS) | 32.83 ms (60.4x vs JS) | 1981.79 ms |

> [!Note]
> This project was also updated from **react-native 0.78.2** to **0.83.0**, and **react-native-nitro-modules** and **nitro-codegen** were upgraded from **0.25.2** to **0.32.0**.

The benchmark APK was built using **yarn android --mode=Release**.

In the future, I’ll try to add iOS support for this benchmark.
