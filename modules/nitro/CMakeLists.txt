target_sources(${CMAKE_PROJECT_NAME} PRIVATE 
  android/NitroLogbookOnLoad.cpp
  shared/c++/HybridLogbookSpec.cpp
)
target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC 
  ./
  android/
  shared/c++
)

target_link_libraries(${CMAKE_PROJECT_NAME} logbook log)

# Define a flag to check if we are building properly
add_definitions(-DBUILDING_APPMODULES_WITH_GENERATED_CMAKE_PROJECT)

# From node_modules/react-native/ReactAndroid/cmake-utils/folly-flags.cmake
# Used in node_modules/react-native/ReactAndroid/cmake-utils/ReactNative-application.cmake
target_compile_definitions(${CMAKE_PROJECT_NAME} PRIVATE folly_FLAGS)

# Add all libraries required by the generated specs
find_package(fbjni REQUIRED) # <-- Used for communication between Java <-> C++
find_package(ReactAndroid REQUIRED) # <-- Used to set up React Native bindings (e.g. CallInvoker/TurboModule)
find_package(react-native-nitro-modules REQUIRED) # <-- Used to create all HybridObjects and use the Nitro core library

# Link all libraries together (RN >= 0.76)
target_link_libraries(
  ${CMAKE_PROJECT_NAME}
  fbjni::fbjni                              # <-- Facebook C++ JNI helpers
  ReactAndroid::jsi                         # <-- RN: JSI
  react-native-nitro-modules::NitroModules  # <-- NitroModules Core :)
  ReactAndroid::reactnative                 # <-- RN: Native Modules umbrella prefab
)