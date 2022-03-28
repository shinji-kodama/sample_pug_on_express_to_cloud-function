FROM node:16-slim

USER root

RUN apt-get update && \
    apt-get install -y git && \
    apt-get install -y vim less && \
    npm install -g firebase-tools && \
    npm install -g express-generator


# # settings for runtime emulator
ENV HOST 0.0.0.0
EXPOSE 5000

# # settings for Firebase login
EXPOSE 9005