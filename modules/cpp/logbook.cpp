#include "logbook.h"

#include <cstring>
#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <string>

#if defined(__APPLE__)
#include <folly/json.h>
#else
#include <rapidjson/document.h>
#endif
#include "compression.hpp"

using namespace std;

namespace logbook {

inline string readFileIntoString(const string& filename) {
  if (!filesystem::exists(filename)) {
    throw runtime_error("Failed to open file: " + filename);
  }

  return {istreambuf_iterator<char>(ifstream(filename).rdbuf()), istreambuf_iterator<char>()};
}

string decompress(const char *inData, size_t inDataSize) {
  return zstd_decompress_streaming(inData, inDataSize);
}

string decompress(const string &blob) {
  return decompress(blob.data(), blob.size());
}

inline string readFileAndDecompress(const string &filename)
{
  return decompress(readFileIntoString(filename));
}

size_t getSamplesSize(const string &filename) {
  return readFileAndDecompress(filename).size();
}

size_t getSamplesCount(const string &filename)
{
  auto data = readFileAndDecompress(filename);

#if defined(__APPLE__)
  auto doc = folly::parseJson(data);
  if (!doc.isArray()) {
    throw runtime_error("JSON file does not contain an array");
  }
  return doc.size();
#else
  rapidjson::Document doc;
  doc.Parse(data.c_str());
  if (!doc.IsArray()) {
    throw runtime_error("JSON file does not contain an array");
  }
  return doc.Size();
#endif
}

std::vector<std::string> getSamples(const string &filename) {
  auto data = readFileAndDecompress(filename);

#if defined(__APPLE__)
  auto doc = folly::parseJson(data);
  if (!doc.isArray()) {
    throw runtime_error("JSON file does not contain an array");
  }

  std::vector<std::string> samples;
  samples.reserve(doc.size());

  for (const auto& value : doc) {
    const auto &entry = value.at("data").asString();
    samples.emplace_back(entry.data(), entry.size());
  }

  return samples;
#else
  rapidjson::Document doc;
  doc.Parse(data.c_str());
  if (!doc.IsArray()) {
    throw runtime_error("JSON file does not contain an array");
  }

  std::vector<std::string> samples;
  samples.reserve(doc.Size());

  for (const auto& value : doc.GetArray()) {
      samples.emplace_back(std::string(value["data"].GetString(), value["data"].GetStringLength()));
  }

  return samples;
#endif
}

std::string getConcatString(const string &filename) {
  auto data = readFileAndDecompress(filename);

#if defined(__APPLE__)
  auto doc = folly::parseJson(data);
  if (!doc.isArray()) {
    throw runtime_error("JSON file does not contain an array");
  }

  std::string result;
  for (const auto& value : doc) {
    const auto &entry = value.at("data").asString();
    result.append(entry.data(), entry.size());
  }

  return result;
#else
  rapidjson::Document doc;
  doc.Parse(data.c_str());
  if (!doc.IsArray()) {
    throw runtime_error("JSON file does not contain an array");
  }

  std::string result;

  for (const auto& value : doc.GetArray()) {
      std::string data(value["data"].GetString(), value["data"].GetStringLength());
      result.append(data);
  }

  return result;
#endif
}

std::pair<uint8_t *, size_t> getConcatStringBuffer(const string &filename) {
  auto data = readFileAndDecompress(filename);

#if defined(__APPLE__)
  auto doc = folly::parseJson(data);
  if (!doc.isArray()) {
    throw runtime_error("JSON file does not contain an array");
  }

  size_t total_size = 0;
  for (const auto& value : doc) {
    total_size += value.at("data").asString().size();
  }

  auto result = new uint8_t[total_size];

  size_t size = 0;
  for (const auto& value : doc) {
    auto entry = value.at("data").asString();
    std::memcpy(&result[size], entry.data(), entry.size());
    size += entry.size();
  }

  return {result, total_size};
#else
  rapidjson::Document doc;
  doc.Parse(data.c_str());
  if (!doc.IsArray()) {
    throw runtime_error("JSON file does not contain an array");
  }

  size_t total_size = 0;
  for (const auto& value : doc.GetArray()) {
    total_size += value["data"].GetStringLength();
  }

  auto result = new uint8_t[total_size];

  size_t size = 0;
  for (const auto& value : doc.GetArray()) {
    const char* data = value["data"].GetString();
    size_t dataLen = value["data"].GetStringLength();

    std::memcpy(&result[size], data, dataLen);
    size += dataLen;
  }

  return {result, total_size};
#endif
}


} // namespace logbook
