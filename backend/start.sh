#!/bin/sh
echo $(ls)
./vinguard-backend &
./vinguard-worker
wait

