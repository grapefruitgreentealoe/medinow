#!/bin/bash

APP_NAME="frontend-prod"
IMAGE_NAME="grapefruitgreentealoe/medinow-frontend:latest"

echo "🚀 Deploying $APP_NAME using image $IMAGE_NAME"

docker stop $APP_NAME || true
docker rm $APP_NAME || true
docker pull $IMAGE_NAME

docker run -d \
  --name $APP_NAME \
  -p 3000:3000 \
  --restart always \
  $IMAGE_NAME

