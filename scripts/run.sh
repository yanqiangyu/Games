#!/bin/bash
SCRIPTDIR=`dirname $0`
pushd  $SCRIPTDIR
echo "========================================"
mv ../log/card.log ../log/card.log.`date +"%Y%m%d-%H%M%S"`
echo "LOG Saved"
ls -lrt ../log | tail -1f
echo "========================================"
cd ../
nohup java -cp lib/http-20070405.jar:lib/pig.jar:lib/javax.json-1.1.jar com.ialogic.games.cards.server.CardHttpServer > log/card.log 2>&1 &
ps aux | grep com.ialogic.games.cards.server.CardHttpServer | grep java
popd
