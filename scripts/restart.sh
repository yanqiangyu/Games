#!/bin/bash
echo "Stopping Server"
./stop.sh
echo "========================================"
sleep 1
echo "Starting Server"
./run.sh
