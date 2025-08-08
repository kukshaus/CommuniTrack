# 🚀 CommuniTrack Quick Setup Guide

This guide will help you automatically set up your CommuniTrack application with Supabase.

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** at [supabase.com](https://supabase.com)
3. **Supabase CLI** (install with `npm install -g supabase`)

## ⚡ Quick Setup (Guided - Recommended)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to finish setting up

### Step 2: Get Your Credentials
1. In your Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** (looks like `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 3: Run Guided Setup
```bash
npm run setup:manual
```

This script will:
- Help you create the `.env.local` file
- Guide you through database setup
- Provide step-by-step instructions for storage bucket creation
- Show troubleshooting tips

### Step 4: Follow the Instructions
The script will guide you through:
1. Setting up environment variables
2. Running SQL schema in Supabase dashboard
3. Creating the storage bucket
4. Testing your setup

## 🔧 Alternative: Automatic Setup (CLI Required)

If you prefer automatic setup and can install the Supabase CLI:

### Install Supabase CLI:
- **Windows**: `scoop install supabase` or `choco install supabase`
- **macOS**: `brew install supabase/tap/supabase`
- **Linux**: See [Supabase CLI docs](https://supabase.com/docs/guides/cli/getting-started)

### Run Automatic Setup:
```bash
npm run setup
```

### Step 5: Start the Application
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and you're ready to go! 🎉

## 🔧 What the Setup Script Does

The automatic setup script will:

1. ✅ **Verify Prerequisites** - Check if Supabase CLI is installed
2. 🗄️ **Setup Database Schema** - Apply all tables, policies, and functions
3. 📁 **Create Storage Bucket** - Set up the "attachments" bucket for file uploads
4. 📄 **Create Templates** - Generate environment file templates

## 🛠️ Manual Setup (If Automatic Fails)

If the automatic setup doesn't work, you can set up manually:

### Database Schema:
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content of `supabase_schema.sql`
4. Paste and run it in the SQL editor

### Storage Bucket:
1. Go to **Storage** in your Supabase dashboard
2. Click **"Create bucket"**
3. Name it `attachments`
4. Set it to **Private**
5. Configure allowed file types (images, PDFs, documents)

## 🚨 Troubleshooting

### "Supabase CLI not found"
```bash
npm install -g supabase
```

### "Missing environment variables"
- Ensure your `.env.local` file exists
- Check that all required variables are set
- Restart your development server after creating the file

### "Failed to create storage bucket"
- Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Make sure it's the service role key, not the anon key
- Create the bucket manually in Supabase dashboard

### "Database connection failed"
- Check if your `DATABASE_URL` is correct
- Run the SQL schema manually in Supabase SQL editor

## 📝 Environment Variables Explained

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your project URL | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public/anon key | Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Settings → API → service_role key |
| `DATABASE_URL` | Direct DB connection | Settings → Database → Connection string |

## 🎯 Next Steps

After successful setup:

1. **Register** a new account at [http://localhost:3000](http://localhost:3000)
2. **Create your first entry** by clicking "Neuer Eintrag"
3. **Upload files** using drag & drop or copy-paste
4. **Export your data** when needed for legal purposes

## 🔒 Security Notes

- Keep your `.env.local` file private (it's in .gitignore)
- Never share your service role key publicly
- The service role key is only needed for initial setup
- Regular app usage only requires the anon key

## 📞 Support

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are correct
3. Ensure Supabase project is fully initialized
4. Try the manual setup steps if automatic setup fails

---

**Happy documenting with CommuniTrack!** 📝✨
