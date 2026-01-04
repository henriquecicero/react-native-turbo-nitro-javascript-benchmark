#import <Foundation/Foundation.h>

#include <memory>
#include <NitroModules/HybridObjectRegistry.hpp>

#include "../modules/nitro/shared/c++/HybridLogbook.hpp"

using namespace margelo::nitro::logbook;
using margelo::nitro::HybridObject;
using margelo::nitro::HybridObjectRegistry;

namespace {

// Register the HybridObject at load time so the JS proxy can create it.
__attribute__((constructor))
static void registerNitroLogbook() {
  HybridObjectRegistry::registerHybridObjectConstructor(
    "Logbook",
    []() -> std::shared_ptr<HybridObject> {
      return std::make_shared<HybridLogbook>();
    }
  );
}

} // namespace
