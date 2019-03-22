#!/usr/bin/env bash

rm -rf /vagrant/output_dev/

until /vagrant/vendor/bin/sculpin generate --watch --server; do
  echo Generation interrupted, cleaning directory and restarting generation...
  rm -rf /vagrant/output_dev/
done