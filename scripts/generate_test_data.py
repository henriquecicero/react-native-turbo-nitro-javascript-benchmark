#!/usr/bin/env python3
import argparse
import json
import os
import random
import string
import zstandard as zstd


def random_entry(i: int) -> dict:
    value_length = random.randint(128, 256)
    random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=value_length))
    return {
        "id": i,
        "data": random_str,
        "int": value_length,
        "boolean": random.choice([True, False]),
    }


def main(output: str, count: int) -> None:
    data = [random_entry(i) for i in range(count)]
    json_bytes = json.dumps(data).encode("utf-8")
    cctx = zstd.ZstdCompressor()
    compressed = cctx.compress(json_bytes)
    os.makedirs(os.path.dirname(output), exist_ok=True)
    with open(output, "wb") as f:
        f.write(compressed)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate compressed JSON sample array")
    parser.add_argument("-o", "--output", required=True, help="Path to output .zstd file")
    parser.add_argument("-n", "--count", type=int, default=100, help="Number of JSON objects")
    args = parser.parse_args()
    main(args.output, args.count)