#pragma once

#include "HybridLogbookSpec.hpp"
#include "logbook.h"

namespace margelo::nitro::logbook {

class HybridLogbook: public HybridLogbookSpec {
public:
  HybridLogbook(): HybridObject(TAG) {}
public:
  double getSamplesSize(const std::string& filename) override { 
    return ::logbook::getSamplesSize(filename); 
  };

  double getSamplesCount(const std::string& filename) override { 
    return ::logbook::getSamplesCount(filename); 
  };

  virtual std::string getConcatString(const std::string& filename) override {
    return ::logbook::getConcatString(filename);
  };

  virtual std::shared_ptr<ArrayBuffer> getConcatStringZeroCopy(const std::string& filename) override {
    auto [ptr, size] = ::logbook::getConcatStringBuffer(filename);

    return ArrayBuffer::wrap(ptr, size, [=]() {
      delete ptr;
    });

  };


};

}