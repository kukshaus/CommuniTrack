#!/bin/bash

# CommuniTrack Supabase Setup Script (Bash version)
# 
# This script automatically sets up the database schema and storage bucket
# for the CommuniTrack application using Supabase CLI.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${1}"
}

log_step() {
    echo -e "\n${CYAN}${1}. ${2}${NC}"
}

log_success() {
    echo -e "${GREEN}✅ ${1}${NC}"
}

log_error() {
    echo -e "${RED}❌ ${1}${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  ${1}${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    log_step 1 "Checking prerequisites..."
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        log_error ".env.local file not found!"
        log "${YELLOW}Please create a .env.local file with your Supabase credentials first.${NC}"
        log "${YELLOW}Example:${NC}"
        log "${YELLOW}NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co${NC}"
        log "${YELLOW}NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key${NC}"
        log "${YELLOW}SUPABASE_SERVICE_ROLE_KEY=your-service-role-key${NC}"
        exit 1
    fi
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI not found!"
        log "${YELLOW}Please install it first: npm install -g supabase${NC}"
        exit 1
    fi
    
    log_success "Supabase CLI is installed"
    
    # Load environment variables
    if [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
    fi
    
    # Check required environment variables
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        log_error "Missing required environment variables in .env.local"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to run database schema
run_database_schema() {
    log_step 2 "Setting up database schema..."
    
    if [ ! -f "supabase_schema.sql" ]; then
        log_error "supabase_schema.sql file not found!"
        exit 1
    fi
    
    log "${BLUE}Applying database schema...${NC}"
    
    # Method 1: Try using psql if DATABASE_URL is available
    if [ ! -z "$DATABASE_URL" ] && command -v psql &> /dev/null; then
        psql "$DATABASE_URL" -f supabase_schema.sql
        if [ $? -eq 0 ]; then
            log_success "Database schema applied successfully using psql"
            return
        else
            log_warning "psql failed, trying alternative method..."
        fi
    fi
    
    # Method 2: Try supabase migrations (if in supabase project)
    if command -v supabase &> /dev/null; then
        # Check if we're in a supabase project
        if supabase status &> /dev/null; then
            # Create migrations directory if it doesn't exist
            mkdir -p supabase/migrations
            
            # Create migration file with timestamp
            timestamp=$(date -u +"%Y-%m-%dT%H-%M-%S")
            migration_file="supabase/migrations/${timestamp}_initial_schema.sql"
            
            # Copy schema to migration file
            cp supabase_schema.sql "$migration_file"
            
            # Apply migrations
            supabase db push
            if [ $? -eq 0 ]; then
                log_success "Database schema applied successfully using Supabase migrations"
                return
            fi
        fi
    fi
    
    # Fallback to manual instructions
    log_warning "Automatic schema application failed. Please apply manually:"
    log "${YELLOW}1. Go to your Supabase Dashboard${NC}"
    log "${YELLOW}2. Navigate to SQL Editor${NC}"
    log "${YELLOW}3. Copy the content of supabase_schema.sql${NC}"
    log "${YELLOW}4. Paste and run it in the SQL editor${NC}"
    log "${YELLOW}${NC}"
    log "${BLUE}Alternatively, if you have psql installed:${NC}"
    log "${YELLOW}psql \"your-database-url\" -f supabase_schema.sql${NC}"
}

# Function to setup storage bucket
setup_storage_bucket() {
    log_step 3 "Setting up storage bucket..."
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        log_warning "SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
        log "${YELLOW}Storage bucket setup requires service role key. Please:${NC}"
        log "${YELLOW}1. Go to Supabase Dashboard > Settings > API${NC}"
        log "${YELLOW}2. Copy the 'service_role' key (not the anon key)${NC}"
        log "${YELLOW}3. Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=your-service-role-key${NC}"
        log "${YELLOW}4. Run this script again, or create the bucket manually${NC}"
        return
    fi
    
    # Create a temporary Node.js script to handle bucket creation
    cat > /tmp/create_bucket.js << EOF
const { createClient } = require('@supabase/supabase-js');

async function createBucket() {
    const supabase = createClient(
        '${NEXT_PUBLIC_SUPABASE_URL}',
        '${SUPABASE_SERVICE_ROLE_KEY}'
    );
    
    try {
        // Check if bucket exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) throw listError;
        
        const bucketExists = buckets.some(bucket => bucket.name === 'attachments');
        
        if (bucketExists) {
            console.log('✅ Storage bucket "attachments" already exists');
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
            fileSizeLimit: 10485760
        });
        
        if (error) throw error;
        
        console.log('✅ Storage bucket "attachments" created successfully');
        
    } catch (error) {
        console.error('❌ Failed to create storage bucket:', error.message);
        console.log('Please create the bucket manually in Supabase Dashboard > Storage');
    }
}

createBucket();
EOF
    
    # Run the bucket creation script
    if command -v node &> /dev/null; then
        cd /tmp && npm init -y > /dev/null 2>&1 && npm install @supabase/supabase-js > /dev/null 2>&1
        node create_bucket.js
        rm -f create_bucket.js package.json package-lock.json
        rm -rf node_modules
    else
        log_warning "Node.js not found. Please create the storage bucket manually:"
        log "${YELLOW}1. Go to Supabase Dashboard > Storage${NC}"
        log "${YELLOW}2. Click 'Create bucket'${NC}"
        log "${YELLOW}3. Name it 'attachments'${NC}"
        log "${YELLOW}4. Set it to Private${NC}"
    fi
}

# Function to create environment template
create_env_template() {
    log_step 4 "Creating environment template..."
    
    cat > .env.template << EOF
# CommuniTrack Environment Variables
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
EOF
    
    log_success "Environment template created as .env.template"
}

# Main function
main() {
    log "${BOLD}${BLUE}🚀 CommuniTrack Supabase Setup${NC}\n"
    
    check_prerequisites
    run_database_schema
    setup_storage_bucket
    create_env_template
    
    log "\n${BOLD}${GREEN}🎉 Setup completed successfully!${NC}"
    log "\n${CYAN}Next steps:${NC}"
    log "${BLUE}1. Start your development server: npm run dev${NC}"
    log "${BLUE}2. Visit http://localhost:3000${NC}"
    log "${BLUE}3. Register a new account or sign in${NC}"
    log "${BLUE}4. Start documenting your communication events!${NC}"
}

# Run main function
main
