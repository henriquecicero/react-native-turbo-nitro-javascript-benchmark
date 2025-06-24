target_sources(${CMAKE_PROJECT_NAME} PRIVATE cpp/NativeSampleModule.cpp)
target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC cpp/)
target_link_libraries(${CMAKE_PROJECT_NAME} logbook log)

