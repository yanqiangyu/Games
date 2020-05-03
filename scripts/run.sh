#!/bin/bash
nohup java -cp ../lib/http-20070405.jar:../lib/pig.jar com.ialogic.games.cards.server.CardHttpServer > ../log/card.log 2>&1 &
