# Explicit image build for Railway (used instead of the automatic Railpack builder).
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* values are inlined at build time; Railway passes service variables as build args.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_TELEMETRY_DISABLED=1
RUN npm run build
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
