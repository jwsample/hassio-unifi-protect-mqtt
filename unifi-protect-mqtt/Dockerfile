ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

RUN apk update; apk add mosquitto-clients nodejs npm openssh-client sshpass; 

# Copy data for add-on
RUN mkdir /app
COPY run.sh read.js package.json /app/
WORKDIR /app
RUN chmod a+x /app/run.sh
RUN cd /app;npm install

CMD [ "/app/run.sh" ]

