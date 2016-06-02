#!/bin/sh

if [ ! -f geonode-users-stats ]; then
  echo "Run this in the data/ directory."
  exit 1
fi

for name in geonode-users-stats geonode-dev-stats; do
  echo ""
  echo "Summary of ${name}:"
  echo ""
  for year in 2015 2014 2013 2012 2011 2010; do
    for month in 12 11 10 09 08 07 06 05 04 03 02 01; do
      grep -E " - ${year}/${month}/[0-9]{1,2}" ${name}
    done
  done
done
