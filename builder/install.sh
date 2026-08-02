#!/bin/bash

echo "Installing Dependencies..."

npm install

echo "Generating Prisma..."

npx prisma generate

echo "Installation Complete."
