#pragma once

#include <cstdint>
#include <stdexcept>
#include <string>
#include <vector>
#include <zstd.h>

inline std::string zstd_compress(const std::string& data, int compress_level) {
    size_t cBuffSize = ZSTD_compressBound(data.size());

    std::string cBuff{};
    cBuff.resize(cBuffSize);

    size_t const cSize = ZSTD_compress((void*)cBuff.data(), cBuffSize, data.data(), data.size(), 1);

    cBuff.resize(cSize);
    cBuff.shrink_to_fit();

    return cBuff;
}

inline std::string zstd_decompress_streaming(const char *inData, size_t inDataSize) {
  // 1) Create & initialize a decompression stream
  ZSTD_DStream* dstream = ZSTD_createDStream();
  if (!dstream) {
    throw std::runtime_error("zstd: failed to create DStream");
  }
  
  size_t initResult = ZSTD_initDStream(dstream);
  if (ZSTD_isError(initResult)) {
    ZSTD_freeDStream(dstream);
    throw std::runtime_error(
      std::string("zstd: initDStream error: ") +
      ZSTD_getErrorName(initResult)
    );
  }

  // 2) Prepare input buffer wrapper
  ZSTD_inBuffer input = { inData, inDataSize, 0 };

  // 3) Allocate an output buffer of the recommended size
  size_t const outChunkSize = ZSTD_DStreamOutSize();
  std::vector<char> outBuffer(outChunkSize);

  // 4) Loop until the stream ends
  std::string result;
  while (input.pos < input.size) {
    ZSTD_outBuffer output = { outBuffer.data(), outBuffer.size(), 0 };

    size_t ret = ZSTD_decompressStream(dstream, &output, &input);
    if (ZSTD_isError(ret)) {
      ZSTD_freeDStream(dstream);
      throw std::runtime_error(
        std::string("zstd decompressStream error: ") +
        ZSTD_getErrorName(ret)
      );
    }

    // append whatever got written this iteration
    result.append(outBuffer.data(), output.pos);

    // ret == 0 means end of frame
    if (ret == 0) {
      break;
    }
  }

  ZSTD_freeDStream(dstream);
  return result;
}

inline std::string zstd_decompress_streaming(const std::string &inData) {
 return zstd_decompress_streaming(inData.data(), inData.size());
}

inline std::string zstd_decompress(const char* data, size_t length) {
    size_t dBuffSize = ZSTD_getFrameContentSize(data, length);

    if (dBuffSize == ZSTD_CONTENTSIZE_ERROR || dBuffSize == ZSTD_CONTENTSIZE_UNKNOWN) {
        throw std::runtime_error(std::string("zstd: invalid frame return: " + std::to_string(dBuffSize)));
    }

    std::string dBuff{};
    dBuff.resize(dBuffSize);

    size_t const dSize = ZSTD_decompress((void*)dBuff.data(), dBuffSize, data, length);

    dBuff.resize(dSize);
    dBuff.shrink_to_fit();

    return dBuff;
}

inline std::string zstd_decompress(const std::string& data) {
    return zstd_decompress(data.c_str(), data.size());
}

inline uint8_t *zstd_decompress_to_buffer(const std::string& data, size_t &outputSize) {
  size_t dBuffSize = ZSTD_getFrameContentSize(data.c_str(), data.size());

  if (dBuffSize == ZSTD_CONTENTSIZE_ERROR || dBuffSize == ZSTD_CONTENTSIZE_UNKNOWN) {
      throw std::runtime_error(std::string("zstd: invalid frame return: " + std::to_string(dBuffSize)));
  }

  uint8_t *dBuff = new uint8_t[dBuffSize + 1];
  outputSize = ZSTD_decompress((void*)dBuff, dBuffSize, data.c_str(), data.size());
  dBuff[outputSize] = 0;

  return dBuff;
}