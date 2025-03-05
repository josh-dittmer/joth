FROM node:22-alpine AS base
WORKDIR /app

RUN mkdir joth

COPY . ./joth

RUN cd joth \
    && npm install -g @nestjs/cli \
    && npm ci \
    && npm run db:generate \
    && npm run build

ENV NODE_ENV=production

#RUN addgroup --system --gid 1001 nodejs
#RUN adduser --system --uid 1001 joth

#USER joth

EXPOSE 8080

ENV API_PORT=8080
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/joth

CMD ["npm", "run", "start:prod"]
#CMD [ "tail", "-F", "VqKVJUkBQKmcNkfC" ]