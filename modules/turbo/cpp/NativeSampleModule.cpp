#include "NativeSampleModule.h"
#include "../../cpp/logbook.h"

namespace facebook::react {

NativeSampleModule::NativeSampleModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeSampleModuleCxxSpec(std::move(jsInvoker)) {}

size_t NativeSampleModule::getSamplesSize(jsi::Runtime& rt, const std::string &filename) {
  return logbook::getSamplesSize(filename);
}

size_t NativeSampleModule::getSamplesCount(jsi::Runtime& rt, const std::string &filename) {
  return logbook::getSamplesCount(filename);
}

std::string NativeSampleModule::getConcatString(jsi::Runtime& rt, const std::string &filename) {
  return logbook::getConcatString(filename);
}

} // namespace facebook::react
