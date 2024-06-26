# pnpm base
# FROM node:lts AS base
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
# RUN corepack enable
# RUN pnpm install -g pm2
# WORKDIR /app
# COPY . .

# # pnpm build
# FROM base AS builder
# WORKDIR /app
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# # pm2 runner
# FROM builder AS runner
# WORKDIR /app
# RUN pnpm release
# # Expose the ports for both apps
# EXPOSE 3002 3002
# CMD ["pm2-runtime", "ecosystem.config.js"]


FROM node:20 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app
RUN pnpm install -g pm2

# pnpm build
FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


FROM base
COPY --from=deps /app/node_modules /app/node_modules
EXPOSE 3002 3002

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
