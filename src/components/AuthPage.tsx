'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/lib/utils';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { signIn, signUp, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!email || !password) {
      setFormError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (!isValidEmail(email)) {
      setFormError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }

    if (password.length < 6) {
      setFormError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setFormError('Die Passwörter stimmen nicht überein.');
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
        alert('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail.');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">CommuniTrack</CardTitle>
            <CardDescription>
              {isSignUp ? 'Erstellen Sie Ihr Konto' : 'Melden Sie sich an'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {displayError && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                  {displayError}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-Mail-Adresse
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ihre@email.de"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Passwort
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Passwort bestätigen
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {isSignUp ? 'Registrieren' : 'Anmelden'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                {isSignUp
                  ? 'Bereits ein Konto? Hier anmelden'
                  : 'Noch kein Konto? Hier registrieren'
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
