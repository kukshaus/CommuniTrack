import React, { useState } from 'react';
import { User, Lock, Mail, Calendar, Shield, Save, X, Globe } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from './ui/Button';
import Input from './ui/Input';
import { Card, CardHeader, CardContent } from './ui/Card';

interface UserSettingsProps {
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ onClose }) => {
  const { user, setUser } = useStore();
  const { language, setLanguage, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [userTouchedPassword, setUserTouchedPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track if user manually interacts with password fields
    if (field === 'currentPassword' || field === 'newPassword' || field === 'confirmPassword') {
      setUserTouchedPassword(true);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLanguageChange = async (newLanguage: 'en' | 'de') => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Immediately update the language in the context for instant UI feedback
      setLanguage(newLanguage);

      // Save to database
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          username: user.username,
          language: newLanguage,
        }),
      });

      const result = await response.json();

      if (response.ok && result.user) {
        // Update user in store with new language preference
        setUser(result.user);
        setSuccess(t('settings.success'));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Revert language change if save failed
        setLanguage(user.language || 'en');
        setErrors({ general: result.error || t('settings.error') });
      }
    } catch (error) {
      console.error('Language update error:', error);
      // Revert language change if save failed
      setLanguage(user.language || 'en');
      setErrors({ general: t('settings.error') });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Benutzername ist erforderlich';
    }

    // Password validation only if user manually interacted with password fields
    const hasCurrentPassword = formData.currentPassword.trim().length > 0;
    const hasNewPassword = formData.newPassword.trim().length > 0;
    const hasConfirmPassword = formData.confirmPassword.trim().length > 0;
    const hasAnyPasswordInput = hasCurrentPassword || hasNewPassword || hasConfirmPassword;
    
    // Only validate passwords if user has manually touched a password field AND there's content
    if (userTouchedPassword && hasAnyPasswordInput) {
      // If user started typing in any password field, validate all required fields
      if (!hasCurrentPassword) {
        newErrors.currentPassword = 'Aktuelles Passwort erforderlich';
      }
      if (!hasNewPassword) {
        newErrors.newPassword = 'Neues Passwort erforderlich';
      } else if (formData.newPassword.trim().length < 6) {
        newErrors.newPassword = 'Passwort muss mindestens 6 Zeichen haben';
      }
      if (formData.newPassword.trim() !== formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);
    setSuccess('');

    try {
      const updateData: any = {
        userId: user.id,
        name: formData.name.trim(),
        username: formData.username.trim(),
      };

      // Only include password fields if user manually touched password fields and wants to change password
      const hasAnyPasswordInput = formData.newPassword.trim() || formData.currentPassword.trim() || formData.confirmPassword.trim();
      if (userTouchedPassword && hasAnyPasswordInput && formData.newPassword.trim()) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        // Update user in store
        setUser({ ...user!, name: formData.name, username: formData.username });
        setSuccess('Profil erfolgreich aktualisiert!');
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        setErrors({ general: result.error || 'Fehler beim Aktualisieren des Profils' });
      }
    } catch (error) {
      console.error('Settings update error:', error);
      setErrors({ general: 'Netzwerkfehler. Bitte versuchen Sie es erneut.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Benutzereinstellungen</h3>
          <p className="text-sm text-gray-600">Verwalten Sie Ihr Profil und Ihre Sicherheitseinstellungen</p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg animate-fade-in">
          {success}
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg animate-fade-in">
          {errors.general}
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Profil Information</h4>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vollständiger Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ihr vollständiger Name"
              error={errors.name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benutzername
            </label>
            <Input
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Ihr Benutzername"
              error={errors.username}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Sicherheit</h4>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Optional
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Lassen Sie die Felder leer, wenn Sie Ihr Passwort nicht ändern möchten
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Aktuelles Passwort
              </label>
              {(formData.currentPassword || formData.newPassword || formData.confirmPassword) && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }));
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.currentPassword;
                      delete newErrors.newPassword;
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                    setUserTouchedPassword(false);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Passwort-Felder leeren
                </button>
              )}
            </div>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Nur bei Passwort-Änderung erforderlich"
              error={errors.currentPassword}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Neues Passwort
            </label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Mindestens 6 Zeichen"
              error={errors.newPassword}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passwort bestätigen
            </label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Neues Passwort wiederholen"
              error={errors.confirmPassword}
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">{t('settings.language.title')}</h4>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.language.select')}
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'de')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">{t('settings.language.english')}</option>
              <option value="de">{t('settings.language.german')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Account Information (Read-only) */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Account Information</h4>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Rolle</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              user.role === 'admin' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Registriert am</span>
            <span className="text-sm text-gray-600">
              {new Date(user.createdAt).toLocaleDateString('de-DE')}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-gray-700">Zuletzt aktualisiert</span>
            <span className="text-sm text-gray-600">
              {new Date(user.updatedAt).toLocaleDateString('de-DE')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Abbrechen
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Speichere...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Änderungen speichern
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UserSettings;
