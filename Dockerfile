FROM node:14-alpine AS base

# Set working directory and non-root user
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --chown=app:app 

# Specify environment variables
ENV PORT=3000

FROM base AS production
RUN pwd
COPY --chown=app:app . ./
RUN ls -la
EXPOSE $PORT
CMD npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all && yarn start
