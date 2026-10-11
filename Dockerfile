
#Start my container using the Node.js 22 Alpine Linux image.
FROM node:22-alpine

# This creates/sets the working directory inside the container.
WORKDIR /app

#This copies these two files from your local project into the Docker image:
COPY package.json package-lock.json ./

#This command executes during Docker image building.
RUN npm install

#allows Docker to use its build cache.
#This copies the rest of your application into /app.
COPY . .

#The application inside this container is expected to listen on port 8000
EXPOSE 8000
#This specifies the default command when the container starts.
CMD ["npm", "start"]
