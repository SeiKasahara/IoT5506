# Development stage
FROM node:20-slim as development-stage

# Set working directory
WORKDIR /app

# Copy runtime script & make it executable
COPY /docker/frontend/entrypoint.sh /entrypoint.sh

COPY ./frontend/package.json ./frontend/package-lock.json ./

# Install all dependencies
RUN npm install

# Copy application code into a directory called `app`
COPY ./frontend /app

# Build the application
RUN npm run build

# CMD commands get executed at container runtime!
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]

# Production stage
FROM nginx:alpine as production-stage

# Copy built files from development stage
COPY --from=development-stage /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration file
COPY /docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
