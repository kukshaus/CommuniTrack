import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    // This endpoint will add the language field to existing users
    const result = await userService.migrateUserLanguages();
    
    if (result.success) {
      return NextResponse.json({
        message: `Successfully migrated ${result.updatedCount} users with language preferences`,
        updatedCount: result.updatedCount
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Language migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate user language preferences' },
      { status: 500 }
    );
  }
}
