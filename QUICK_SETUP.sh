#!/bin/bash

echo "🚀 Body Transformator - Database Setup"
echo "========================================"
echo ""
echo "STEP 1: Create Database in Vercel Dashboard"
echo "--------------------------------------------"
echo "1. Go to: https://vercel.com/krrish-sehgals-projects/body-transformator"
echo "2. Click 'Storage' tab"
echo "3. Click 'Create Database' → Select 'Postgres' → Choose 'Hobby' plan"
echo "4. Click 'Create' and wait ~30 seconds"
echo ""
read -p "Press ENTER after you've created the database in Vercel..."
echo ""

echo "STEP 2: Pulling Environment Variables from Vercel"
echo "---------------------------------------------------"
vercel env pull .env.local --yes

if [ $? -eq 0 ]; then
    echo "✅ Environment variables pulled successfully!"
    echo ""
    
    # Check if POSTGRES_URL exists
    if grep -q "POSTGRES_URL" .env.local; then
        echo "✅ Found POSTGRES_URL in .env.local"
        echo ""
        
        echo "STEP 3: Running Database Migrations"
        echo "-----------------------------------"
        npm run db:push
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ SUCCESS! Database is set up and ready!"
            echo ""
            echo "Next steps:"
            echo "- Visit: https://body-transformator.vercel.app"
            echo "- Try signing up with a new account"
            echo ""
        else
            echo ""
            echo "❌ Migration failed. Check the error above."
        fi
    else
        echo "❌ POSTGRES_URL not found. Make sure you created the database in Vercel."
        echo "   You can also manually add it to .env.local:"
        echo "   POSTGRES_URL=your-connection-string-here"
    fi
else
    echo "❌ Failed to pull environment variables."
    echo "   Make sure you're logged in: vercel login"
fi

