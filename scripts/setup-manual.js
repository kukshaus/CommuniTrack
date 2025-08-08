#!/usr/bin/env node

/**
 * CommuniTrack Manual Setup Script
 * 
 * This script provides guided manual setup without requiring Supabase CLI.
 * It creates the storage bucket programmatically and provides step-by-step
 * instructions for database schema setup.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}${colors.cyan}${step}. ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function checkEnvironment() {
  logStep(1, 'Checking environment configuration...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    logError('.env.local file not found!');
    log('\nLet me help you create it...', 'yellow');
    createEnvironmentFile();
    return null;
  }
  
  // Load environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    logError('Missing required environment variables in .env.local');
    log('Please add your Supabase credentials to the .env.local file', 'yellow');
    return null;
  }
  
  logSuccess('Environment configuration found');
  return envVars;
}

function createEnvironmentFile() {
  logStep('1a', 'Creating .env.local template...');
  
  const envTemplate = `# CommuniTrack Environment Variables
# Replace these values with your actual Supabase credentials

# Get these from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service role key (for advanced setup)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`;

  fs.writeFileSync('.env.local', envTemplate);
  
  logSuccess('.env.local file created!');
  log('\nPlease follow these steps:', 'cyan');
  log('1. Go to https://supabase.com and sign in', 'yellow');
  log('2. Create a new project or select an existing one', 'yellow');
  log('3. Go to Settings > API in your Supabase dashboard', 'yellow');
  log('4. Copy the Project URL and anon/public key', 'yellow');
  log('5. Replace the values in .env.local with your actual credentials', 'yellow');
  log('6. Run this script again: npm run setup:manual', 'yellow');
}

function provideDatabaseInstructions() {
  logStep(2, 'Database Schema Setup Instructions');
  
  const schemaPath = path.join(process.cwd(), 'supabase_schema.sql');
  if (!fs.existsSync(schemaPath)) {
    logError('supabase_schema.sql file not found!');
    return;
  }
  
  log('Please follow these steps to set up your database:', 'cyan');
  log('', 'reset');
  log('1. Open your Supabase dashboard in a web browser', 'yellow');
  log('2. Navigate to the SQL Editor (left sidebar)', 'yellow');
  log('3. Click "New query" or use the existing editor', 'yellow');
  log('4. Copy the entire content from the file: supabase_schema.sql', 'yellow');
  log('5. Paste it into the SQL editor', 'yellow');
  log('6. Click "Run" to execute the SQL commands', 'yellow');
  log('', 'reset');
  
  logInfo('The SQL file contains all necessary tables, policies, and functions.');
  logInfo('This includes categories, entries, attachments, and security policies.');
  
  // Show a preview of what's in the schema
  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const lines = schemaContent.split('\n').slice(0, 10);
    log('\nPreview of supabase_schema.sql:', 'blue');
    lines.forEach(line => {
      if (line.trim()) {
        log(`  ${line}`, 'reset');
      }
    });
    log('  ...', 'reset');
  } catch (error) {
    logWarning('Could not read schema file for preview');
  }
}

async function setupStorageBucket(envVars) {
  logStep(3, 'Setting up storage bucket...');
  
  if (!envVars.SUPABASE_SERVICE_ROLE_KEY) {
    log('Manual storage bucket setup required:', 'yellow');
    log('', 'reset');
    log('1. Go to your Supabase dashboard', 'yellow');
    log('2. Navigate to Storage (left sidebar)', 'yellow');
    log('3. Click "Create bucket"', 'yellow');
    log('4. Name it: attachments', 'yellow');
    log('5. Set it to Private (not public)', 'yellow');
    log('6. Click "Create bucket"', 'yellow');
    log('', 'reset');
    logInfo('The bucket will be used to store uploaded files and images.');
    return;
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      envVars.NEXT_PUBLIC_SUPABASE_URL,
      envVars.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'attachments');
    
    if (bucketExists) {
      logSuccess('Storage bucket "attachments" already exists');
      return;
    }
    
    // Create bucket
    const { error: createError } = await supabase.storage.createBucket('attachments', {
      public: false,
      allowedMimeTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (createError) {
      throw createError;
    }
    
    logSuccess('Storage bucket "attachments" created successfully!');
    
  } catch (error) {
    logWarning(`Automatic bucket creation failed: ${error.message}`);
    log('\nPlease create the bucket manually:', 'yellow');
    log('1. Go to Storage in your Supabase dashboard', 'yellow');
    log('2. Click "Create bucket"', 'yellow');
    log('3. Name it "attachments"', 'yellow');
    log('4. Set it to Private', 'yellow');
  }
}

function provideNextSteps() {
  logStep(4, 'Final steps and testing');
  
  log('After completing the database and storage setup:', 'cyan');
  log('', 'reset');
  log('1. Start the development server:', 'green');
  log('   npm run dev', 'yellow');
  log('', 'reset');
  log('2. Open your browser to:', 'green');
  log('   http://localhost:3000', 'yellow');
  log('', 'reset');
  log('3. You should see the CommuniTrack login page', 'green');
  log('4. Register a new account to test the setup', 'green');
  log('5. Try creating an entry and uploading a file', 'green');
  log('', 'reset');
  
  logInfo('If you see any errors, check the browser console and terminal output.');
  logInfo('Make sure all SQL commands were executed successfully in Supabase.');
}

function showTroubleshooting() {
  log(`\n${colors.bold}${colors.magenta}🔧 Troubleshooting${colors.reset}`);
  log('', 'reset');
  log('Common issues and solutions:', 'cyan');
  log('', 'reset');
  log('❓ "Missing Supabase environment variables"', 'yellow');
  log('   → Check your .env.local file has correct values', 'blue');
  log('   → Restart the dev server after changing .env.local', 'blue');
  log('', 'reset');
  log('❓ "Authentication error" or "Cannot sign up"', 'yellow');
  log('   → Make sure the database schema was applied correctly', 'blue');
  log('   → Check Supabase logs in dashboard > Logs', 'blue');
  log('', 'reset');
  log('❓ "Cannot upload files"', 'yellow');
  log('   → Ensure the "attachments" storage bucket exists', 'blue');
  log('   → Check bucket is set to Private, not Public', 'blue');
  log('', 'reset');
  log('❓ "Policy violation" errors', 'yellow');
  log('   → Re-run the SQL schema to ensure RLS policies are created', 'blue');
  log('', 'reset');
}

async function main() {
  log(`${colors.bold}${colors.blue}🚀 CommuniTrack Manual Setup${colors.reset}`);
  log('This script will guide you through setting up CommuniTrack without the Supabase CLI.\n');
  
  try {
    const envVars = checkEnvironment();
    
    if (!envVars) {
      log('\n👆 Please complete the environment setup first, then run this script again.', 'cyan');
      return;
    }
    
    provideDatabaseInstructions();
    await setupStorageBucket(envVars);
    provideNextSteps();
    showTroubleshooting();
    
    log(`\n${colors.bold}${colors.green}🎉 Setup guidance completed!${colors.reset}`);
    log('Follow the instructions above to complete your CommuniTrack setup.\n');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
