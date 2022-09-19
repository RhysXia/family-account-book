FROM node:14-alpine

LABEL author="RhysXia"

WORKDIR /usr/accountbook

COPY . /usr/accountbook

VOLUME [ "/usr/accountbook" ]

ENTRYPOINT ["npm", "run","start"]

EXPOSE 3000