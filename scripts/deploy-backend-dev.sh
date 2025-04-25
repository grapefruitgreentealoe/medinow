#!/bin/bash

APP_NAME="backend-dev"
COMPOSE_FILE="./apps/backend/docker-compose.dev.yml"
ENV_PATH="./apps/backend/.env"

echo "🚀 [DEV] 백엔드 배포 시작"
# ✅ GitLab CI/CD 변수로부터 .env 파일 생성
mkdir -p ./apps/backend
echo "$ENV_DEVELOPMENT" > $ENV_PATH
echo "✅ .env 파일 생성 완료: $ENV_PATH"

# ✅ 기존 컨테이너 및 네트워크 정리
docker-compose -f $COMPOSE_FILE down

# 최신 이미지 pull
docker pull grapefruitgreentealoe/medinow-backend:dev

# ✅ 새로 빌드 및 실행
docker-compose -f $COMPOSE_FILE up -d --build

echo "✅ [DEV] 백엔드 배포 완료"

# #!/bin/bash

# APP_NAME="backend-dev"
# IMAGE_NAME="grapefruitgreentealoe/medinow-backend:dev"

# echo "🚀 Deploying $APP_NAME using image $IMAGE_NAME"

# docker stop $APP_NAME || true
# docker rm $APP_NAME || true
# docker pull $IMAGE_NAME

# docker run -d \
#   --name $APP_NAME \
#   --env-file /home/cloud/.env
#   -p 4001:4000 \
#   --restart always \
#   $IMAGE_NAME