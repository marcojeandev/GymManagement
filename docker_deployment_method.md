Professional Docker Deployment Guide
📁 Project Structure
text
GymManagement/
├── Backend/
│   ├── Dockerfile
│   ├── .env
│   └── ... (Laravel files)
├── Frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env
│   └── ... (React files)
└── docker-compose.yml
Step 1: Create Dockerfile for Backend (Laravel)
Backend/Dockerfile

dockerfile
# Stage 1: Build
FROM php:8.2-fpm AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Install dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Stage 2: Production
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy from builder
COPY --from=builder /var/www /var/www

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port 9000
EXPOSE 9000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
Step 2: Create Entrypoint for Backend
Backend/docker-entrypoint.sh

bash
#!/bin/bash
set -e

# Run migrations
php artisan migrate --force

# Clear and cache config
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chown -R www-data:www-data /var/www/storage
chown -R www-data:www-data /var/www/bootstrap/cache

exec "$@"
Step 3: Create Dockerfile for Frontend (React)
Frontend/Dockerfile

dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint for dynamic env vars
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
Step 4: Create Nginx Config for Frontend
Frontend/nginx.conf

nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
Step 5: Create Frontend Entrypoint (Runtime Env Vars)
Frontend/docker-entrypoint.sh

bash
#!/bin/sh
set -e

# Replace env vars in JavaScript files
echo "Replacing environment variables..."

# Find all JS files and replace placeholders
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i \
    -e "s|PLACEHOLDER_API_URL|${VITE_API_URL:-http://localhost:8000/api}|g" \
    -e "s|PLACEHOLDER_APP_URL|${VITE_APP_URL:-http://localhost:8000}|g" \
    {} \;

echo "Environment variables replaced successfully!"

exec "$@"
Step 6: Create docker-compose.yml (Root Directory)
docker-compose.yml

yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: gym_mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: gymsys_db
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:-root}
      MYSQL_USER: ${DB_USERNAME:-gym_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-root}
      MYSQL_ALLOW_EMPTY_PASSWORD: 'yes'
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - gym_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  # Backend - Laravel
  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: gym_backend
    restart: unless-stopped
    environment:
      APP_ENV: ${APP_ENV:-production}
      APP_DEBUG: ${APP_DEBUG:-false}
      APP_URL: ${APP_URL:-http://localhost}
      DB_CONNECTION: mysql
      DB_HOST: mysql
      DB_PORT: 3306
      DB_DATABASE: gymsys_db
      DB_USERNAME: ${DB_USERNAME:-root}
      DB_PASSWORD: ${DB_PASSWORD:-root}
      REDIS_HOST: redis
      REDIS_PASSWORD: null
      REDIS_PORT: 6379
    volumes:
      - backend_storage:/var/www/storage
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - gym_network

  # Backend Nginx
  backend_nginx:
    image: nginx:alpine
    container_name: gym_backend_nginx
    restart: unless-stopped
    ports:
      - "8000:80"
    volumes:
      - ./Backend:/var/www
      - ./nginx-backend.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
    networks:
      - gym_network

  # Frontend - React
  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
    container_name: gym_frontend
    restart: unless-stopped
    environment:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:8000/api}
      VITE_APP_URL: ${VITE_APP_URL:-http://localhost:8000}
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - gym_network

  # Redis (optional - for caching)
  redis:
    image: redis:alpine
    container_name: gym_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - gym_network

networks:
  gym_network:
    driver: bridge

volumes:
  mysql_data:
  redis_data:
  backend_storage:
Step 7: Create Nginx Config for Backend
nginx-backend.conf (in root directory)

nginx
server {
    listen 80;
    server_name localhost;
    root /var/www/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass backend:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
Step 8: Create .env Files
Backend/.env

env
APP_NAME=GymManagement
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=gymsys_db
DB_USERNAME=root
DB_PASSWORD=root

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379
Frontend/.env

env
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:8000
Step 9: Create .dockerignore Files
Backend/.dockerignore

text
.env
.git
.gitignore
node_modules
vendor
storage/*.key
public/hot
public/storage
storage/framework/views/*
storage/logs/*.log
tests
.phpunit.result.cache
docker-compose.yml
Frontend/.dockerignore

text
node_modules
dist
.git
.gitignore
.env
.env.local
*.log
.DS_Store
Step 10: Deployment Commands
🚀 One-Time Setup
bash
# Clone your repository
git clone https://github.com/yourusername/GymManagement.git
cd GymManagement

# Create .env files (use the ones above)
# Make sure all files are in place

# Build and start containers
docker-compose up -d --build

# Wait for containers to start (about 30 seconds)
# Check logs
docker-compose logs -f
🔄 Everyday Maintenance
bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart backend

# Update and rebuild after code changes
git pull
docker-compose up -d --build

# Clean up old images
docker system prune -af
🔧 Common Commands
bash
# Access Laravel container
docker exec -it gym_backend bash

# Run artisan commands
docker exec gym_backend php artisan tinker
docker exec gym_backend php artisan cache:clear

# Access MySQL
docker exec -it gym_mysql mysql -u root -p

# Check container status
docker ps

# View specific logs
docker logs gym_backend
docker logs gym_frontend
docker logs gym_mysql
Step 11: Domain and SSL (Production)
For production with domain:

yaml
# Add to docker-compose.yml
services:
  # ... existing services ...

  # Nginx Proxy (for SSL and domain routing)
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - /etc/nginx/certs:/etc/nginx/certs
      - /etc/nginx/vhost.d
      - /usr/share/nginx/html
    networks:
      - gym_network

  # Let's Encrypt for SSL
  letsencrypt:
    image: nginxproxy/acme-companion
    container_name: nginx-proxy-acme
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /etc/nginx/certs:/etc/nginx/certs
      - /etc/nginx/vhost.d
      - /usr/share/nginx/html
    environment:
      DEFAULT_EMAIL: your-email@example.com
    depends_on:
      - nginx-proxy
    networks:
      - gym_network
Environment variables for domain:

yaml
# In each service
backend:
  environment:
    VIRTUAL_HOST: api.yourdomain.com
    LETSENCRYPT_HOST: api.yourdomain.com
    LETSENCRYPT_EMAIL: your-email@example.com

frontend:
  environment:
    VIRTUAL_HOST: yourdomain.com
    LETSENCRYPT_HOST: yourdomain.com
    LETSENCRYPT_EMAIL: your-email@example.com
Step 12: Backup & Recovery
Automated Backup Script
scripts/backup.sh

bash
#!/bin/bash

# Create backup directory
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec gym_mysql mysqldump -u root -p${DB_PASSWORD} gymsys_db > ${BACKUP_DIR}/db_${TIMESTAMP}.sql

# Backup storage
docker run --rm -v gym_backend_storage:/storage -v ${BACKUP_DIR}:/backup alpine tar czf /backup/storage_${TIMESTAMP}.tar.gz -C /storage .

# Clean old backups (keep last 7 days)
find ${BACKUP_DIR} -name "*.sql" -mtime +7 -delete
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: ${TIMESTAMP}"
Recovery
bash
# Restore database
docker exec -i gym_mysql mysql -u root -p${DB_PASSWORD} gymsys_db < backup.sql

# Restore storage
docker run --rm -v gym_backend_storage:/storage -v $(pwd)/backup:/backup alpine tar xzf /backup/storage.tar.gz -C /storage
Step 13: Monitoring & Health Checks
Add health checks to docker-compose.yml:

yaml
backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s

frontend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:80"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 10s
Step 14: Create a Deployment Script
deploy.sh

bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Build and restart containers
docker-compose down
docker-compose up -d --build

# Wait for containers to be healthy
echo "⏳ Waiting for containers to be ready..."
sleep 30

# Run migrations
docker exec gym_backend php artisan migrate --force

# Clear caches
docker exec gym_backend php artisan config:clear
docker exec gym_backend php artisan cache:clear

echo "✅ Deployment complete!"
echo "🌐 App running at: http://localhost:3000"
Step 15: Production Server Requirements
Server Specs (Minimum)
Resource	Minimum	Recommended
CPU	2 vCPUs	4 vCPUs
RAM	4 GB	8 GB
Storage	20 GB SSD	50 GB SSD
OS	Ubuntu 22.04 LTS	Ubuntu 22.04 LTS
Server Setup
bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Reboot
sudo reboot
✅ Summary: One-Command Deployment
After initial setup, deploying is:

bash
./deploy.sh