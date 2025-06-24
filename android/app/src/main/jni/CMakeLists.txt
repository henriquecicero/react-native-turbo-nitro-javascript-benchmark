cmake_minimum_required(VERSION 3.13)

project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

add_subdirectory(../../../../../modules/cpp ${CMAKE_BINARY_DIR}/modules_cpp)
add_subdirectory(../../../../../modules/turbo ${CMAKE_BINARY_DIR}/modules_turbo)
add_subdirectory(../../../../../modules/nitro ${CMAKE_BINARY_DIR}/modules_nitro)