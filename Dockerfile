FROM node:21

WORKDIR /app

ENV NODE_ENV=production
ENV TZ="Asia/Jerusalem"
ENV HOST=0.0.0.0

COPY package.json /app/
COPY package-lock.json /app/
RUN npm install

COPY . /app/
RUN rm -f /app/storage/db.json

RUN npx astro telemetry disable
RUN npm run build

EXPOSE 4321 25

ENV PASSWORD=""
ENV WEBSITE_SECRET=""
ARG CAPROVER_GIT_COMMIT_SHA=${CAPROVER_GIT_COMMIT_SHA}
ENV BUILD_NUMBER=${CAPROVER_GIT_COMMIT_SHA}

CMD ["npm", "run", "production"]
