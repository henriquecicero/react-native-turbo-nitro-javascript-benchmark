#pragma once

#include <AppSpecsJSI.h>

#include <memory>
#include <string>
#include <vector>

namespace facebook::react {

class NativeSampleModule : public NativeSampleModuleCxxSpec<NativeSampleModule> {
public:
  NativeSampleModule(std::shared_ptr<CallInvoker> jsInvoker);

  size_t getSamplesSize(jsi::Runtime& rt, const std::string &filename);
  size_t getSamplesCount(jsi::Runtime& rt, const std::string &filename);
  std::string getConcatString(jsi::Runtime& rt, const std::string &filename);
};

} // namespace facebook::react
