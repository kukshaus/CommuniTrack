'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login, register } = useStore((state) => ({ 
    login: state.login, 
    register: state.register 
  }));
  
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegisterMode) {
      // Registration validation
      if (password !== confirmPassword) {
        setError(t('error.passwordMismatch'));
        return;
      }

      if (password.length < 6) {
        setError(t('error.passwordTooShort'));
        return;
      }

      if (!username.trim() || !name.trim()) {
        setError(t('error.fillAllFields'));
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const success = await register(username.trim(), password, name.trim());
        if (!success) {
          setError(t('error.usernameExists'));
        }
      } else {
        const success = await login(username, password);
        if (!success) {
          setError(t('error.invalidCredentials'));
        }
      }
    } catch (err) {
      setError(t('error.general'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Language Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex bg-white rounded-lg shadow-md p-1">
          <button
            onClick={() => setLanguage('de')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              language === 'de'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            DE
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              language === 'en'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Left Side - Upsell Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 flex-col justify-center">
        <div className="max-w-lg">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{t('app.title')}</h1>
            <p className="text-xl text-blue-100 mb-8">
              {t('upsell.tagline')}
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('upsell.legal.title')}</h3>
                <p className="text-blue-100">
                  {t('upsell.legal.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('upsell.security.title')}</h3>
                <p className="text-blue-100">
                  {t('upsell.security.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('upsell.organization.title')}</h3>
                <p className="text-blue-100">
                  {t('upsell.organization.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('upsell.multimedia.title')}</h3>
                <p className="text-blue-100">
                  {t('upsell.multimedia.description')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-800 bg-opacity-50 rounded-lg">
            <h4 className="font-semibold mb-2">{t('upsell.ideal.title')}</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>{t('upsell.ideal.workplace')}</li>
              <li>{t('upsell.ideal.neighborhood')}</li>
              <li>{t('upsell.ideal.family')}</li>
              <li>{t('upsell.ideal.business')}</li>
              <li>{t('upsell.ideal.rental')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 lg:hidden">{t('app.title')}</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 hidden lg:block">
                {isRegisterMode ? t('register.title') : t('login.title')}
              </h2>
              <p className="text-gray-600">
                {isRegisterMode ? t('register.subtitle') : t('login.subtitle')}
              </p>
            </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.name')}
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('form.name.placeholder')}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.username')}
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={isRegisterMode ? t('form.username.placeholder.register') : t('form.username.placeholder.login')}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.password')}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegisterMode ? t('form.password.placeholder.register') : t('form.password.placeholder.login')}
                  required
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 z-10"
                  style={{ marginTop: '0px' }}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.confirmPassword')}
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('form.confirmPassword.placeholder')}
                    required
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 z-10"
                    style={{ marginTop: '0px' }}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isRegisterMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white py-3`}
            >
              {isLoading 
                ? (isRegisterMode ? t('button.register.loading') : t('button.login.loading')) 
                : (isRegisterMode ? t('button.register') : t('button.login'))
              }
            </Button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {isRegisterMode 
                ? t('toggle.toLogin') 
                : t('toggle.toRegister')
              }
            </button>
          </div>

          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              {t('footer.text')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
