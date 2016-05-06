#!/bin/sh

if [ ! -f geonode-users-stats ]; then
  echo "Run this in the data/ directory."
  exit 1
fi

for name in geonode-users-stats geonode-dev-stats; do
  echo ""
  echo "Summary of ${name}:"
  echo ""
  for year in 2010 2011 2012 2013 2014 2015; do
    for month in 01 02 03 04 05 06 07 08 09 10 11 12; do
      grep -E " - ${year}/${month}/[0-9]{1,2}" ${name}
    done
  done
done
