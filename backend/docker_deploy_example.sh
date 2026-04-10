#!/bin/sh

echo "Building image..."
docker build -t vinguard-backend .

echo "deploying container..."

# 1. Make sure to expose a port if you choose to use Nginx to expose your API 
# 2. Adding a volume is essential if you want a persistent database
docker run -d --env-file .env -p 3000:3000 -v [volume source]:[container destination] vinguard-backend:latest

