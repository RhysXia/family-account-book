FROM node:14-alpine

LABEL author="RhysXia"

WORKDIR /usr/accountbook

RUN apk --update add tzdata && \
  cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
  echo "Asia/Shanghai" > /etc/timezone && \
  apk del tzdata && \
  rm -rf /var/cache/apk/*

COPY . /usr/accountbook

VOLUME [ "/usr/accountbook" ]

ENTRYPOINT ["npm", "run","start"]

EXPOSE 3000