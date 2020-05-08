#!/bin/bash

proc=`ps -aux | grep java | grep com.ialogic.games.cards.server.CardHttpServer| grep -v grep |  awk '{print $2}'`
if [ "$proc" != "" ]
then
	echo "Killing process $proc"
	ps $proc
	kill $proc
else
	echo "Process not running"
fi
echo $done
