#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace logbook {

/**
 * @brief Return the size of the json string from a logbook zstd file.
 * 
 * @param filename 
 * @return size_t 
 */
size_t getSamplesSize(const std::string &filename);

/**
 * @brief Return the number of samples from a logbook zstd file (parses json object)
 * 
 */
size_t getSamplesCount(const std::string &filename);


std::string getConcatString(const std::string &filename);

std::pair<uint8_t *, size_t> getConcatStringBuffer(const std::string &filename);

} // namespace logbook
