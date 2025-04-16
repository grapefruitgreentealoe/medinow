#!/bin/bash

cd /home/cloud  # VM 내 compose 파일 있는 디렉토리

echo "🚀 프로덕션 서비스 종료 중..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 최신 이미지 Pull..."
docker pull grapefruitgreentealoe/medinow-backend:latest

echo "🚀 프로덕션 서비스 시작!"
docker-compose -f docker-compose.prod.yml up -d

# #!/bin/bash

# APP_NAME="backend-prod"
# IMAGE_NAME="grapefruitgreentealoe/medinow-backend:latest"

# echo "🚀 Deploying $APP_NAME using image $IMAGE_NAME"

# docker stop $APP_NAME || true
# docker rm $APP_NAME || true
# docker pull $IMAGE_NAME

# docker run -d \
#   --name $APP_NAME \
#   -p 4000:4000 \
#   --restart always \
#   $IMAGE_NAME