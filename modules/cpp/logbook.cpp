#include "logbook.h"

#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <string>
#include <rapidjson/document.h>

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
  return zstd_decompress_streaming(blob);
}

inline string readFileAndDecompress(const string &filename)
{
  return decompress(readFileIntoString(filename));
}

inline void parseJsonAndCheckArray(auto &doc, const char *data)
{
  doc.Parse(data);

  if (!doc.IsArray()) {
    throw runtime_error("JSON file does not contain an array");
  }
}

size_t getSamplesSize(const string &filename) {
  return readFileAndDecompress(filename).size();
}

size_t getSamplesCount(const string &filename)
{
  auto data = readFileAndDecompress(filename);

  rapidjson::Document doc;
  parseJsonAndCheckArray(doc, data.c_str());
  return doc.Size();
}

std::vector<std::string> getSamples(const string &filename) {
  auto data = readFileAndDecompress(filename);

  rapidjson::Document doc;
  parseJsonAndCheckArray(doc, data.c_str());

  std::vector<std::string> samples;
  samples.reserve(doc.Size());

  for (const auto& value : doc.GetArray()) {
      samples.emplace_back(std::string(value["data"].GetString(), value["data"].GetStringLength()));
  }

  return samples;
}

std::string getConcatString(const string &filename) {
  auto data = readFileAndDecompress(filename);

  rapidjson::Document doc;
  parseJsonAndCheckArray(doc, data.c_str());

  std::string result;

  for (const auto& value : doc.GetArray()) {
      std::string data(value["data"].GetString(), value["data"].GetStringLength());
      result.append(data);
  }

  return result;
}

std::pair<uint8_t *, size_t> getConcatStringBuffer(const string &filename) {
  auto data = readFileAndDecompress(filename);

  rapidjson::Document doc;
  parseJsonAndCheckArray(doc, data.c_str());

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
}


} // namespace logbook