#!/bin/bash
# Run this once after cloning to restore local secrets.
# Never commit the actual values — keep them only in your password manager.

cd "$(dirname "$0")"

dotnet user-secrets init

dotnet user-secrets set "JwtSettings:Key"        "REPLACE_WITH_YOUR_JWT_KEY"
dotnet user-secrets set "Stripe:SecretKey"       "sk_test_REPLACE"
dotnet user-secrets set "Stripe:PublishableKey"  "pk_test_REPLACE"
dotnet user-secrets set "PayPal:ClientId"        "REPLACE_WITH_PAYPAL_CLIENT_ID"
dotnet user-secrets set "PayPal:ClientSecret"    "REPLACE_WITH_PAYPAL_SECRET"

echo "Secrets stored in dotnet user-secrets. They live outside the repo."
