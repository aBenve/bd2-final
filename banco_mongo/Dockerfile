# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you're using npm) to the container
COPY package*.json ./

# Copy the .env file
COPY .env ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port on which your Node.js application listens
EXPOSE 3001

# Define the command to start your Node.js application
CMD ["npm", "start"]
