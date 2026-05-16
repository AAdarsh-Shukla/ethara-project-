#!/bin/bash

echo "Starting Team Task Manager Setup..."

echo "[1/3] Installing Backend Dependencies..."
cd backend
npm install
cd ..

echo "[2/3] Installing Frontend Dependencies & Building..."
cd frontend
npm install
npm run build
cd ..

echo "[3/3] Starting the Server..."
echo "The application will be available at http://localhost:5001"
node backend/server.js
