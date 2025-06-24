set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

include(FetchContent)

# Zstd
FetchContent_Declare(
    zstd
    GIT_REPOSITORY  https://github.com/facebook/zstd
    GIT_TAG         v1.5.5
    SOURCE_SUBDIR   build/cmake
    # BINARY_DIR      lib
    GIT_SHALLOW     TRUE
)
FetchContent_MakeAvailable(zstd)

# boost-headers-only
# FetchContent_Declare(
#     boostheadersonly
#     GIT_REPOSITORY https://github.com/orca-io/boost-headers-only
#     GIT_TAG         571b67368a284ba9cfaea34a8ce6d881acc1647d
#     GIT_SHALLOW     TRUE
# )
# FetchContent_MakeAvailable(boostheadersonly)

# MsgPack
# set(Boost_INCLUDE_DIR ${boostheadersonly_SOURCE_DIR})
# OPTION (MSGPACK_CXX17 "Using c++17 compiler" ON)
# FetchContent_Declare(
#     msgpack
#     GIT_REPOSITORY https://github.com/msgpack/msgpack-c.git
#     GIT_TAG cpp-6.0.0
#     GIT_SHALLOW     TRUE
# )
# FetchContent_MakeAvailable(msgpack)

# RapidJson
option(RAPIDJSON_BUILD_DOC "Build rapidjson documentation." OFF)
option(RAPIDJSON_BUILD_EXAMPLES "Build rapidjson examples." OFF)
option(RAPIDJSON_BUILD_TESTS "Build rapidjson perftests and unittests." OFF)
option(RAPIDJSON_BUILD_CXX11 "Build rapidjson with C++11" OFF)
option(RAPIDJSON_BUILD_CXX17 "Build rapidjson with C++17" ON)
FetchContent_Declare(
    rapidjson
    GIT_REPOSITORY  https://github.com/Tencent/rapidjson.git
    GIT_TAG         24b5e7a8b27f42fa16b96fc70aade9106cf7102f
    GIT_SHALLOW     TRUE
)
FetchContent_MakeAvailable(rapidjson)

add_library(rapidjson INTERFACE)
target_include_directories(rapidjson INTERFACE
    ${rapidjson_SOURCE_DIR}/include
)
target_compile_definitions(rapidjson INTERFACE RAPIDJSON_HAS_STDSTRING=1)

add_library(logbook logbook.cpp)
target_include_directories(logbook PUBLIC .)
target_include_directories(logbook PRIVATE ${zstd_BINARY_DIR}/../zstd-src/lib)
target_link_libraries(logbook libzstd_static rapidjson)
# target_link_libraries(logbook msgpack-cxx)
