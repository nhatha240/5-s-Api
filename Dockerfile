FROM node:alpine

RUN mkdir -p /usr/src/node-app/node_modules && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY ./ ./

USER node

# RUN yarn install --pure-lockfile
# RUN npm install
COPY --chown=node:node . .


EXPOSE 3000
CMD [ "npm", "run", "dev" ]
