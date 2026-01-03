# We link Nitro prefab (produced by :react-native-nitro-modules:prefab{Debug,Release}Package)
# into the React Native app target created in android/app/src/main/jni/CMakeLists.txt.

# Generate the prefab package
# Release
# ./gradlew :react-native-nitro-modules:prefabReleasePackage
# ./gradlew "app:configureCMakeRelease[arm64-v8a]"
# yarn android --mode=Release

# Debug
# ./gradlew :react-native-nitro-modules:prefabDebugPackage
# ./gradlew "app:configureCMakeDebug[arm64-v8a]"
# yarn android

# I’ll come back to this later

if(TARGET appmodules)
  set(APP_TARGET appmodules)
elseif(TARGET ${CMAKE_PROJECT_NAME})
  set(APP_TARGET ${CMAKE_PROJECT_NAME})
else()
  message(FATAL_ERROR "Nitro CMakeLists: expected target appmodules (React Native app), but none found.")
endif()

string(TOLOWER "${CMAKE_BUILD_TYPE}" NITRO_BUILD_TYPE_LOWER)
if("${NITRO_BUILD_TYPE_LOWER}" STREQUAL "" OR "${NITRO_BUILD_TYPE_LOWER}" STREQUAL "debug")
  set(NITRO_BUILD_TYPE_LOWER "debug")
elseif("${NITRO_BUILD_TYPE_LOWER}" STREQUAL "relwithdebinfo")
  # prefab uses "release" folder for both Release/RelWithDebInfo
  set(NITRO_BUILD_TYPE_LOWER "release")
endif()

set(NITRO_PREFAB_ROOT
    ${CMAKE_CURRENT_LIST_DIR}/../../node_modules/react-native-nitro-modules/android/build/intermediates/prefab_package/${NITRO_BUILD_TYPE_LOWER}/prefab/modules/NitroModules
)
set(NITRO_LIB ${NITRO_PREFAB_ROOT}/libs/android.${ANDROID_ABI}/libNitroModules.so)

find_library(ANDROID_LOG_LIB log)
find_package(fbjni REQUIRED)
find_package(ReactAndroid REQUIRED CONFIG)

target_sources(${APP_TARGET} PRIVATE
  android/NitroLogbookOnLoad.cpp
  shared/c++/HybridLogbookSpec.cpp
)

target_include_directories(${APP_TARGET} PUBLIC
  ${CMAKE_CURRENT_LIST_DIR}
  ${CMAKE_CURRENT_LIST_DIR}/android
  ${CMAKE_CURRENT_LIST_DIR}/shared/c++
  ${NITRO_PREFAB_ROOT}/include
)

target_link_libraries(${APP_TARGET}
  ${NITRO_LIB}
  logbook
  ${ANDROID_LOG_LIB}
  android
  fbjni::fbjni
  ReactAndroid::jsi
  ReactAndroid::reactnative
)
