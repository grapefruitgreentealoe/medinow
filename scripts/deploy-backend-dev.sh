#!/bin/bash

APP_NAME="backend-dev"
IMAGE_NAME="grapefruitgreentealoe/medinow-backend:dev"

echo "🚀 Deploying $APP_NAME using image $IMAGE_NAME"

docker stop $APP_NAME || true
docker rm $APP_NAME || true
docker pull $IMAGE_NAME

docker run -d \
  --name $APP_NAME \
  --env-file ./apps/backend/.env \
  -p 4001:4000 \
  --restart always \
  $IMAGE_NAME


