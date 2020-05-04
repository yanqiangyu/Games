#!/bin/bash
nohup java -cp ../lib/http-20070405.jar:../lib/pig.jar com.ialogic.games.cards.server.CardHttpServer > ../log/card.log 2>&1 &
ps aux | grep com.ialogic.games.cards.server.CardHttpServer | grep java
