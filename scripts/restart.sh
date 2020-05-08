#!/bin/bash
echo "Stopping Server"
SCRIPTDIR=`dirname $0`
pushd  $SCRIPTDIR
stop.sh
echo "========================================"
sleep 1
echo "Starting Server"
./run.sh
popd
