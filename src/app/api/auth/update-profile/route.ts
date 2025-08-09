import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/userService';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, username, currentPassword, newPassword, language } = body;

    // Basic validation
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID ist erforderlich' },
        { status: 400 }
      );
    }

    if (!name || !username) {
      return NextResponse.json(
        { error: 'Name und Benutzername sind erforderlich' },
        { status: 400 }
      );
    }

    // Validate new password length if provided
    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Neues Passwort muss mindestens 6 Zeichen haben' },
        { status: 400 }
      );
    }

    // Validate language if provided
    if (language && !['en', 'de'].includes(language)) {
      return NextResponse.json(
        { error: 'Ungültige Sprache' },
        { status: 400 }
      );
    }

    // Update user profile using userService
    const result = await userService.updateUserProfile(userId, {
      name: name.trim(),
      username: username.trim(),
      currentPassword,
      newPassword,
      language,
    });

    if (result.success) {
      return NextResponse.json({
        message: 'Profil erfolgreich aktualisiert',
        user: result.user
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}
