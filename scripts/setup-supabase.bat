@echo off
setlocal enabledelayedexpansion

REM CommuniTrack Supabase Setup Script (Windows Batch version)
REM 
REM This script automatically sets up the database schema and storage bucket
REM for the CommuniTrack application using Supabase CLI.

echo.
echo 🚀 CommuniTrack Supabase Setup
echo ================================
echo.

REM Function to check prerequisites
echo 1. Checking prerequisites...

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local file not found!
    echo.
    echo Please create a .env.local file with your Supabase credentials first.
    echo Example:
    echo NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    pause
    exit /b 1
)

REM Check if Supabase CLI is installed
supabase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Supabase CLI not found!
    echo Please install it first: npm install -g supabase
    pause
    exit /b 1
)

echo ✅ Supabase CLI is installed

REM Load environment variables from .env.local
for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
    if not "%%a"=="" if not "%%b"=="" (
        set "%%a=%%b"
    )
)

REM Check required environment variables
if "!NEXT_PUBLIC_SUPABASE_URL!"=="" (
    echo ❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local
    pause
    exit /b 1
)

if "!NEXT_PUBLIC_SUPABASE_ANON_KEY!"=="" (
    echo ❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Function to run database schema
echo 2. Setting up database schema...

if not exist "supabase_schema.sql" (
    echo ❌ supabase_schema.sql file not found!
    pause
    exit /b 1
)

echo Applying database schema...

REM Try to apply schema if psql is available and DATABASE_URL is set
if defined DATABASE_URL (
    psql "%DATABASE_URL%" -f supabase_schema.sql >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Direct schema application failed.
        echo Please run the SQL commands from supabase_schema.sql manually in your Supabase SQL editor.
    ) else (
        echo ✅ Database schema applied successfully
    )
) else (
    echo ⚠️  DATABASE_URL not set. Please run the SQL schema manually:
    echo 1. Go to your Supabase Dashboard
    echo 2. Go to SQL Editor
    echo 3. Copy and paste the content of supabase_schema.sql
    echo 4. Run the SQL commands
)
echo.

REM Function to setup storage bucket
echo 3. Setting up storage bucket...

if "!SUPABASE_SERVICE_ROLE_KEY!"=="" (
    echo ⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env.local
    echo Storage bucket setup requires service role key. Please:
    echo 1. Go to Supabase Dashboard ^> Settings ^> API
    echo 2. Copy the 'service_role' key ^(not the anon key^)
    echo 3. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    echo 4. Run this script again, or create the bucket manually
) else (
    REM Create a temporary Node.js script for bucket creation
    echo const { createClient } = require('@supabase/supabase-js'); > temp_bucket.js
    echo. >> temp_bucket.js
    echo async function createBucket() { >> temp_bucket.js
    echo     const supabase = createClient( >> temp_bucket.js
    echo         '!NEXT_PUBLIC_SUPABASE_URL!', >> temp_bucket.js
    echo         '!SUPABASE_SERVICE_ROLE_KEY!' >> temp_bucket.js
    echo     ); >> temp_bucket.js
    echo. >> temp_bucket.js
    echo     try { >> temp_bucket.js
    echo         const { data: buckets, error: listError } = await supabase.storage.listBuckets(); >> temp_bucket.js
    echo         if (listError) throw listError; >> temp_bucket.js
    echo. >> temp_bucket.js
    echo         const bucketExists = buckets.some(bucket =^> bucket.name === 'attachments'); >> temp_bucket.js
    echo         if (bucketExists) { >> temp_bucket.js
    echo             console.log('✅ Storage bucket "attachments" already exists'); >> temp_bucket.js
    echo             return; >> temp_bucket.js
    echo         } >> temp_bucket.js
    echo. >> temp_bucket.js
    echo         const { error } = await supabase.storage.createBucket('attachments', { >> temp_bucket.js
    echo             public: false, >> temp_bucket.js
    echo             allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'], >> temp_bucket.js
    echo             fileSizeLimit: 10485760 >> temp_bucket.js
    echo         }); >> temp_bucket.js
    echo. >> temp_bucket.js
    echo         if (error) throw error; >> temp_bucket.js
    echo         console.log('✅ Storage bucket "attachments" created successfully'); >> temp_bucket.js
    echo. >> temp_bucket.js
    echo     } catch (error) { >> temp_bucket.js
    echo         console.error('❌ Failed to create storage bucket:', error.message); >> temp_bucket.js
    echo         console.log('Please create the bucket manually in Supabase Dashboard ^> Storage'); >> temp_bucket.js
    echo     } >> temp_bucket.js
    echo } >> temp_bucket.js
    echo. >> temp_bucket.js
    echo createBucket(); >> temp_bucket.js
    
    REM Try to run the bucket creation script
    node --version >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Node.js not found. Please create the storage bucket manually:
        echo 1. Go to Supabase Dashboard ^> Storage
        echo 2. Click 'Create bucket'
        echo 3. Name it 'attachments'
        echo 4. Set it to Private
    ) else (
        npm install @supabase/supabase-js >nul 2>&1
        node temp_bucket.js
        del temp_bucket.js >nul 2>&1
    )
)
echo.

REM Function to create environment template
echo 4. Creating environment template...

echo # CommuniTrack Environment Variables > .env.template
echo # Copy this file to .env.local and fill in your actual values >> .env.template
echo. >> .env.template
echo # Get these from Supabase Dashboard ^> Settings ^> API >> .env.template
echo NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co >> .env.template
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here >> .env.template
echo. >> .env.template
echo # Service role key (required for setup script only) >> .env.template
echo # This is different from the anon key - it's the "service_role" key >> .env.template
echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here >> .env.template
echo. >> .env.template
echo # Optional: Database URL for direct SQL operations >> .env.template
echo # Format: postgresql://postgres:[password]@[host]:5432/postgres >> .env.template
echo DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres >> .env.template

echo ✅ Environment template created as .env.template
echo.

echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Start your development server: npm run dev
echo 2. Visit http://localhost:3000
echo 3. Register a new account or sign in
echo 4. Start documenting your communication events!
echo.
pause
