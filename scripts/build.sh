#!/bin/bash
echo "Compiling java source code..."
javac -d ../classes/ `find ../src -name *.java`
echo "done"
echo "jar -cfv ../lib/pig.jar -C ../classes/ com"
jar -cfv ../lib/pig.jar -C ../classes/ com 
echo "done"
