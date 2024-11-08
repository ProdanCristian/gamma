cd /root/gamma

# Create the Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy the entire application
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
EOF