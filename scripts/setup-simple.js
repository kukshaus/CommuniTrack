#!/usr/bin/env node

/**
 * CommuniTrack Simple Setup Script
 * 
 * This script provides the most reliable setup approach:
 * 1. Check/create environment file
 * 2. Create storage bucket (if possible)
 * 3. Provide clear manual instructions for database
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
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
  log(`\n${colors.bold}${colors.cyan}Step ${step}: ${message}${colors.reset}`);
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

function checkEnvironment() {
  logStep(1, 'Environment Setup');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    log('Creating .env.local template...', 'yellow');
    
    const envTemplate = `# CommuniTrack - Supabase Configuration
# Get these values from: https://supabase.com > Your Project > Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For advanced setup
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
`;

    fs.writeFileSync(envPath, envTemplate);
    logSuccess('.env.local created!');
    
    log('\n📋 Next steps:', 'cyan');
    log('1. Go to https://supabase.com', 'blue');
    log('2. Create a project or select existing one', 'blue');
    log('3. Go to Settings > API', 'blue');
    log('4. Copy Project URL and anon key', 'blue');
    log('5. Update .env.local with your actual values', 'blue');
    log('6. Run this script again', 'blue');
    
    return false;
  }
  
  // Check if environment variables are properly set
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasRealValues = envContent.includes('.supabase.co') && 
                       !envContent.includes('your-project-id') &&
                       !envContent.includes('your-anon-key-here');
  
  if (!hasRealValues) {
    logWarning('Please update .env.local with your actual Supabase credentials');
    log('Current .env.local contains placeholder values', 'yellow');
    return false;
  }
  
  logSuccess('Environment configuration looks good!');
  return true;
}

async function setupStorageBucket() {
  logStep(2, 'Storage Bucket Setup');
  
  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey || serviceKey.includes('your-service-role')) {
      log('Service role key not configured for automatic bucket creation', 'yellow');
      log('\n📋 Manual bucket creation:', 'cyan');
      log('1. Go to your Supabase Dashboard', 'blue');
      log('2. Navigate to Storage (left sidebar)', 'blue');
      log('3. Click "Create bucket"', 'blue');
      log('4. Name: attachments', 'blue');
      log('5. Set to Private (not public)', 'blue');
      log('6. Click "Create bucket"', 'blue');
      return;
    }
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceKey);
    
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
    const { error } = await supabase.storage.createBucket('attachments', {
      public: false,
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (error) {
      throw error;
    }
    
    logSuccess('Storage bucket "attachments" created successfully!');
    
  } catch (error) {
    logWarning(`Automatic bucket creation failed: ${error.message}`);
    log('\n📋 Please create the bucket manually (see instructions above)', 'yellow');
  }
}

function provideDatabaseInstructions() {
  logStep(3, 'Database Schema Setup');
  
  log('📋 Database setup instructions:', 'cyan');
  log('', 'reset');
  log('1. Open your Supabase Dashboard', 'blue');
  log('2. Go to SQL Editor (left sidebar)', 'blue');
  log('3. Create a new query', 'blue');
  log('4. Copy ALL content from: supabase_schema_simple.sql', 'blue');
  log('   (Use this if you get permission errors with supabase_schema.sql)', 'yellow');
  log('5. Paste into the SQL editor', 'blue');
  log('6. Click RUN to execute', 'blue');
  log('', 'reset');
  
  // Show what the schema contains
  const schemaPath = path.join(process.cwd(), 'supabase_schema_simple.sql');
  const fallbackPath = path.join(process.cwd(), 'supabase_schema.sql');
  if (fs.existsSync(schemaPath)) {
    try {
      const content = fs.readFileSync(schemaPath, 'utf8');
      const tableCount = (content.match(/CREATE TABLE/g) || []).length;
      const policyCount = (content.match(/CREATE POLICY/g) || []).length;
      
      log(`📊 Schema contains:`, 'magenta');
      log(`   • ${tableCount} tables (categories, entries, attachments)`, 'blue');
      log(`   • ${policyCount} security policies`, 'blue');
      log(`   • Default categories`, 'blue');
      log(`   • Timestamp triggers`, 'blue');
      
    } catch (error) {
      log('Schema file found but could not analyze', 'yellow');
    }
  } else if (fs.existsSync(fallbackPath)) {
    log('Using fallback schema: supabase_schema.sql', 'yellow');
  } else {
    logError('No schema files found!');
  }
  
  log('', 'reset');
  log('💡 Two schema options available:', 'magenta');
  log('   • supabase_schema_simple.sql - Recommended (no permission issues)', 'green');
  log('   • supabase_schema.sql - Full version (may need admin privileges)', 'blue');
}

function showFinalSteps() {
  logStep(4, 'Testing Your Setup');
  
  log('🚀 Ready to test!', 'cyan');
  log('', 'reset');
  log('1. Start the app:', 'green');
  log('   npm run dev', 'blue');
  log('', 'reset');
  log('2. Open browser:', 'green');
  log('   http://localhost:3000', 'blue');
  log('', 'reset');
  log('3. You should see:', 'green');
  log('   • Login/Register page (if setup is correct)', 'blue');
  log('   • Configuration guide (if environment missing)', 'blue');
  log('   • Error messages (if database schema missing)', 'blue');
  log('', 'reset');
  
  log('🔍 Troubleshooting:', 'magenta');
  log('• Environment errors → Check .env.local values', 'yellow');
  log('• Auth errors → Re-run database schema', 'yellow');
  log('• Upload errors → Create storage bucket', 'yellow');
  log('• Still issues → Check browser console', 'yellow');
}

async function main() {
  log(`${colors.bold}${colors.blue}🚀 CommuniTrack - Simple Setup${colors.reset}`);
  log('This script will guide you through the essential setup steps.\n');
  
  try {
    // Step 1: Environment
    const envReady = checkEnvironment();
    if (!envReady) {
      log('\n👆 Complete the environment setup first, then run this script again.', 'cyan');
      return;
    }
    
    // Step 2: Storage
    await setupStorageBucket();
    
    // Step 3: Database instructions
    provideDatabaseInstructions();
    
    // Step 4: Final steps
    showFinalSteps();
    
    log(`\n${colors.bold}${colors.green}🎉 Setup guidance complete!${colors.reset}`);
    log('Follow the steps above to complete your CommuniTrack setup.\n');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    log('\nTry the manual setup steps above.', 'yellow');
  }
}

// Add dotenv as optional dependency
try {
  require('dotenv');
} catch (error) {
  // dotenv not required, we'll read the file manually
}

if (require.main === module) {
  main();
}

module.exports = { main };
