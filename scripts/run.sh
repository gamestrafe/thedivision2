#!/usr/bin/env bash

scripts_dir=`dirname $0`

rm -rf $scripts_dir/../output_dev/

until $scripts_dir/../vendor/bin/sculpin generate --watch --server; do
  echo Generation interrupted, cleaning directory and restarting generation...
  rm -rf $scripts_dir/../output_dev/
done