FROM node:14-alpine

LABEL author="RhysXia"

WORKDIR /usr/accountbook

ENTRYPOINT ["npm", "run","start"]

EXPOSE 3000