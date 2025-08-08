#!/usr/bin/env node

/**
 * CommuniTrack Supabase Setup Script
 * 
 * This script automatically sets up the database schema and storage bucket
 * for the CommuniTrack application.
 * 
 * Prerequisites:
 * - Supabase CLI installed (npm install -g supabase)
 * - .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - Service role key (available in Supabase dashboard under Settings > API)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
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

function checkPrerequisites() {
  logStep(1, 'Checking prerequisites...');
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    logError('.env.local file not found!');
    log('Please create a .env.local file with your Supabase credentials first.', 'yellow');
    log('Example:', 'yellow');
    log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co', 'yellow');
    log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key', 'yellow');
    log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key', 'yellow');
    process.exit(1);
  }
  
  // Check if Supabase CLI is installed
  try {
    execSync('supabase --version', { stdio: 'pipe' });
    logSuccess('Supabase CLI is installed');
  } catch (error) {
    logError('Supabase CLI not found!');
    log('The Supabase CLI is required for automatic setup.', 'yellow');
    log('Please install it using one of these methods:', 'yellow');
    log('', 'yellow');
    log('Windows (using Scoop):', 'blue');
    log('  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git', 'yellow');
    log('  scoop install supabase', 'yellow');
    log('', 'yellow');
    log('Windows (using Chocolatey):', 'blue');
    log('  choco install supabase', 'yellow');
    log('', 'yellow');
    log('macOS (using Homebrew):', 'blue');
    log('  brew install supabase/tap/supabase', 'yellow');
    log('', 'yellow');
    log('Linux:', 'blue');
    log('  # See: https://supabase.com/docs/guides/cli/getting-started', 'yellow');
    log('', 'yellow');
    log('Alternative: Use the manual setup mode instead!', 'green');
    log('The app will guide you through manual setup when you visit http://localhost:3000', 'green');
    process.exit(1);
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
    process.exit(1);
  }
  
  logSuccess('Prerequisites check passed');
  return envVars;
}

function runDatabaseSchema() {
  logStep(2, 'Setting up database schema...');
  
  const schemaPath = path.join(process.cwd(), 'supabase_schema.sql');
  if (!fs.existsSync(schemaPath)) {
    logError('supabase_schema.sql file not found!');
    process.exit(1);
  }
  
  try {
    // Check if we're in a Supabase project directory and try different approaches
    log('Applying SQL schema...', 'blue');
    
    // Method 1: Try using psql if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
      try {
        execSync(`psql "${process.env.DATABASE_URL}" -f "${schemaPath}"`, {
          stdio: 'inherit'
        });
        logSuccess('Database schema applied successfully using psql');
        return;
      } catch (psqlError) {
        log('psql not available, trying alternative method...', 'yellow');
      }
    }
    
    // Method 2: Try supabase db reset with migrations (if in supabase project)
    try {
      // First check if we're in a supabase project
      execSync('supabase status', { stdio: 'pipe' });
      
      // Create a migration file
      const migrationDir = './supabase/migrations';
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(migrationDir)) {
        fs.mkdirSync(migrationDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const migrationFile = path.join(migrationDir, `${timestamp}_initial_schema.sql`);
      
      // Copy schema to migration file
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      fs.writeFileSync(migrationFile, schemaContent);
      
      // Run migration
      execSync('supabase db push', { stdio: 'inherit' });
      logSuccess('Database schema applied successfully using Supabase migrations');
      
    } catch (supabaseError) {
      throw new Error('Could not apply schema automatically');
    }
    
  } catch (error) {
    logWarning('Automatic schema application failed.');
    log('Please apply the schema manually:', 'yellow');
    log('1. Go to your Supabase Dashboard', 'yellow');
    log('2. Navigate to SQL Editor', 'yellow');
    log('3. Copy the content of supabase_schema.sql', 'yellow');
    log('4. Paste and run it in the SQL editor', 'yellow');
    log('', 'yellow');
    log('Alternatively, if you have psql installed:', 'blue');
    log(`psql "your-database-url" -f "${schemaPath}"`, 'blue');
  }
}

async function setupStorageBucket(envVars) {
  logStep(3, 'Setting up storage bucket...');
  
  const { createClient } = require('@supabase/supabase-js');
  
  // We need the service role key for admin operations
  const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    logWarning('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
    log('Storage bucket setup requires service role key. Please:', 'yellow');
    log('1. Go to Supabase Dashboard > Settings > API', 'yellow');
    log('2. Copy the "service_role" key (not the anon key)', 'yellow');
    log('3. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=your-service-role-key', 'yellow');
    log('4. Run this script again, or create the bucket manually', 'yellow');
    return;
  }
  
  const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey
  );
  
  try {
    // Check if bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const bucketExists = existingBuckets.some(bucket => bucket.name === 'attachments');
    
    if (bucketExists) {
      logSuccess('Storage bucket "attachments" already exists');
      return;
    }
    
    // Create the bucket
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
    
    logSuccess('Storage bucket "attachments" created successfully');
    
  } catch (error) {
    logError(`Failed to create storage bucket: ${error.message}`);
    log('Please create the bucket manually:', 'yellow');
    log('1. Go to Supabase Dashboard > Storage', 'yellow');
    log('2. Click "Create bucket"', 'yellow');
    log('3. Name it "attachments"', 'yellow');
    log('4. Set it to Private', 'yellow');
  }
}

function createEnvTemplate() {
  logStep(4, 'Creating environment template...');
  
  const templatePath = path.join(process.cwd(), '.env.template');
  const template = `# CommuniTrack Environment Variables
# Copy this file to .env.local and fill in your actual values

# Get these from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key (required for setup script only)
# This is different from the anon key - it's the "service_role" key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Database URL for direct SQL operations
# Format: postgresql://postgres:[password]@[host]:5432/postgres
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
`;
  
  fs.writeFileSync(templatePath, template);
  logSuccess('Environment template created as .env.template');
}

async function main() {
  log(`${colors.bold}${colors.blue}🚀 CommuniTrack Supabase Setup${colors.reset}\n`);
  
  try {
    const envVars = checkPrerequisites();
    
    // Set environment variables for this process
    Object.assign(process.env, envVars);
    
    runDatabaseSchema();
    await setupStorageBucket(envVars);
    createEnvTemplate();
    
    log(`\n${colors.bold}${colors.green}🎉 Setup completed successfully!${colors.reset}`);
    log('\nNext steps:', 'cyan');
    log('1. Start your development server: npm run dev', 'blue');
    log('2. Visit http://localhost:3000', 'blue');
    log('3. Register a new account or sign in', 'blue');
    log('4. Start documenting your communication events!', 'blue');
    
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
