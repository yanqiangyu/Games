#!/bin/bash
echo "Compiling java source code..."
DIRSEP=:
if [ "$OS" == "Windows_NT" ]
then
	DIRSEP=";"
fi
javac -cp "../lib/http-20070405.jar$DIRSEP../lib/javax.json-1.1.jar" -d ../classes/ `find ../src -name *.java`
echo "done"
echo "jar -cfv ../lib/pig.jar -C ../classes/ com"
jar -cfv ../lib/pig.jar -C ../classes/ com  > build_jar.out
echo "done"
