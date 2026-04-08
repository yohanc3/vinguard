#!/bin/sh

./vinguard-backend &
xvfb-run --auto-servernum --server-args="-screen 0 1280x1024x24" un run src/services/scraper/worker.ts &
wait

