#!/bin/bash

echo "Building Homepage Module..."

mkdir -p app
mkdir -p app/login
mkdir -p app/register
mkdir -p app/dashboard
mkdir -p app/owner
mkdir -p app/owner/dashboard
mkdir -p app/pricing
mkdir -p app/contact
mkdir -p app/about
mkdir -p app/services

touch app/login/page.tsx
touch app/register/page.tsx
touch app/dashboard/page.tsx
touch app/owner/dashboard/page.tsx
touch app/pricing/page.tsx
touch app/contact/page.tsx
touch app/about/page.tsx
touch app/services/page.tsx

echo "Homepage Module Installed."
