IMAGE_NAME := ai-chat
REGION     := asia-northeast1
PROJECT_ID ?= your-gcp-project-id
GCR_IMAGE  := gcr.io/$(PROJECT_ID)/$(IMAGE_NAME)

.PHONY: install dev build test lint \
        docker-build docker-run \
        deploy-push deploy-run deploy

# ──────────────────────────────────────────
# ローカル開発
# ──────────────────────────────────────────

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

# ──────────────────────────────────────────
# Docker（ローカル動作確認）
# ──────────────────────────────────────────

docker-build:
	docker build -t $(IMAGE_NAME) .

docker-run:
	docker run --rm -p 3080:3080 \
	  -e ANTHROPIC_API_KEY=$(ANTHROPIC_API_KEY) \
	  $(IMAGE_NAME)

# ──────────────────────────────────────────
# Cloud Run デプロイ
# ──────────────────────────────────────────

deploy-push: docker-build
	docker tag $(IMAGE_NAME) $(GCR_IMAGE)
	docker push $(GCR_IMAGE)

deploy-run:
	gcloud run deploy $(IMAGE_NAME) \
	  --image $(GCR_IMAGE) \
	  --platform managed \
	  --region $(REGION) \
	  --allow-unauthenticated \
	  --set-env-vars ANTHROPIC_API_KEY=$(ANTHROPIC_API_KEY)

deploy: deploy-push deploy-run
