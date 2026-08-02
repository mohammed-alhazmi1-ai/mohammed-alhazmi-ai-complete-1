#!/bin/bash

echo "Creating Authentication..."

mkdir -p lib/auth
mkdir -p components/auth
mkdir -p app/api/auth

touch lib/auth/auth.ts
touch lib/auth/session.ts
touch lib/auth/permissions.ts

touch components/auth/LoginForm.tsx
touch components/auth/RegisterForm.tsx

touch app/api/auth/route.ts

echo "Authentication Module Installed."
