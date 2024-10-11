FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
RUN chmod a+x /app/node_modules/.bin/react-scripts
CMD ["npm", "start"]