#include "NativeSampleModule.h"
#include "logbook.h"
#include <android/log.h>

#define ALOGI(...) __android_log_print(ANDROID_LOG_INFO, "--MODULE---", __VA_ARGS__)

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