# Use official Node.js image as the base
FROM node:18

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory
WORKDIR /app

# Copy package.json and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install Python dependencies
COPY server/requirements.txt ./server/requirements.txt
RUN pip3 install -r ./server/requirements.txt

# Copy the rest of your code
COPY . .

# Expose the port your app runs on (change if not 5001)
EXPOSE 5001

# Start your Node.js app
CMD ["npm", "start"] 