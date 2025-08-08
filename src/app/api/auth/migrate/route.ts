import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();

    if (!Array.isArray(users)) {
      return NextResponse.json(
        { error: 'Users array is required' },
        { status: 400 }
      );
    }

    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const user of users) {
      try {
        if (!user.username || !user.password || !user.name) {
          results.errors.push(`Invalid user data: ${user.username || 'unknown'}`);
          continue;
        }

        const migratedUser = await userService.createUser({
          username: user.username,
          name: user.name,
          password: user.password, // This will be re-hashed by the service
        });

        if (migratedUser) {
          results.migrated++;
        } else {
          results.skipped++;
          results.errors.push(`User already exists: ${user.username}`);
        }
      } catch (error) {
        results.errors.push(`Error migrating ${user.username}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json(
      { 
        message: 'Migration completed',
        results 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
