FROM node

WORKDIR /home/node/app
COPY package-lock.json /home/node/app
COPY package.json /home/node/app

CMD npm install && npm run start:dev