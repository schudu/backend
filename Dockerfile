FROM node:17.0.1
WORKDIR /api
COPY . .
EXPOSE 3001
RUN npm install
CMD npm start