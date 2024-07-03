FROM node:20 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app
RUN pnpm install -g pm2

# pnpm build
FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile


FROM base
COPY --from=deps /app/node_modules /app/node_modules
EXPOSE 3006 80

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
