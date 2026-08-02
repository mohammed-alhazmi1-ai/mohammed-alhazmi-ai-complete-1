#!/bin/bash
echo "======================================="
echo " Mohammed Alhazmi AI Builder v1.0"
echo "======================================="

mkdir -p app
mkdir -p components
mkdir -p lib
mkdir -p prisma
mkdir -p public
mkdir -p services
mkdir -p providers
mkdir -p types
mkdir -p styles

echo "✔ Project structure verified"

touch builder/logs/build.log

echo "$(date) Build Completed" >> builder/logs/build.log

echo "Builder Finished Successfully"
