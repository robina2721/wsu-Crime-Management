import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@shared/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';

import { useI18n } from '@/contexts/I18nContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError(t('login.errorFillFields'));
      return;
    }

    setIsLoading(true);
    setError('');

    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(t('login.invalidCredentials'));
    }
    setIsLoading(false);
  };

  const roleOptions = [
    { value: UserRole.SUPER_ADMIN, label: 'Super Admin', icon: '👑' },
    { value: UserRole.POLICE_HEAD, label: 'Police Head', icon: '🚔' },
    { value: UserRole.HR_MANAGER, label: 'HR Manager', icon: '👥' },
    { value: UserRole.PREVENTIVE_OFFICER, label: 'Preventive Officer', icon: '🛡️' },
    { value: UserRole.DETECTIVE_OFFICER, label: 'Detective Officer', icon: '🔍' },
    { value: UserRole.CITIZEN, label: 'Citizen', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-crime-black via-gray-900 to-crime-red-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <Card className="w-full max-w-md relative z-10 border-crime-red shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-crime-red rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-crime-black">{t('login.portalTitle')}</CardTitle>
            <CardDescription className="text-gray-600">{t('login.portalSubtitle')}</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-crime-black font-medium">{t('login.accessLevel')}</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger className="border-gray-300 focus:border-crime-red">
                  <SelectValue placeholder={t('login.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="flex items-center">
                      <span className="mr-2">{role.icon}</span>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-crime-black font-medium">{t('login.username')}</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.usernamePlaceholder')}
                className="border-gray-300 focus:border-crime-red"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-crime-black font-medium">{t('login.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  className="border-gray-300 focus:border-crime-red pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-crime-red"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-crime-red bg-red-50 p-3 rounded-md">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-crime-red hover:bg-crime-red-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? t('login.authenticating') : t('login.secureLogin')}
            </Button>
          </form>

          <div className="border-t pt-4">
            <p className="text-center text-sm text-gray-600">{t('login.emergencyContact')}</p>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 left-4 text-white/60 text-xs">{t('footer.dept')} © 2024</div>
    </div>
  );
}
