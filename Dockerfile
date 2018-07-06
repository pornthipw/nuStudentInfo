FROM collinestes/docker-node-oracle

RUN mkdir -p /usr/app/src
WORKDIR /usr/app/src
COPY . /usr/app/src

RUN npm install 

