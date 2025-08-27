import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@shared/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Globe, 
  Lock,
  Server,
  Users,
  FileText,
  Activity,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Key,
  Clock,
  Monitor
} from 'lucide-react';

interface SystemSettings {
  general: {
    systemName: string;
    organizationName: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUppercase: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorEnabled: boolean;
    ipWhitelistEnabled: boolean;
    ipWhitelist: string[];
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    criticalAlerts: boolean;
    caseUpdates: boolean;
    systemMaintenance: boolean;
    weeklyReports: boolean;
  };
  backup: {
    autoBackupEnabled: boolean;
    backupFrequency: string;
    retentionDays: number;
    lastBackup: Date | null;
    nextBackup: Date | null;
  };
  audit: {
    enableAuditLog: boolean;
    logLevel: string;
    retentionDays: number;
    logFailedLogins: boolean;
    logDataChanges: boolean;
    logSystemAccess: boolean;
  };
}

export default function SystemConfiguration() {
  const { user, hasRole } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const canConfigureSystem = hasRole(UserRole.SUPER_ADMIN);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Mock data - In production, fetch from API
    const mockSettings: SystemSettings = {
      general: {
        systemName: 'Crime Management System',
        organizationName: 'Wolaita Sodo City Police Department',
        timezone: 'Africa/Addis_Ababa',
        language: 'en',
        dateFormat: 'MM/dd/yyyy'
      },
      security: {
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        sessionTimeout: 30,
        maxLoginAttempts: 3,
        twoFactorEnabled: false,
        ipWhitelistEnabled: false,
        ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8']
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        criticalAlerts: true,
        caseUpdates: true,
        systemMaintenance: true,
        weeklyReports: false
      },
      backup: {
        autoBackupEnabled: true,
        backupFrequency: 'daily',
        retentionDays: 30,
        lastBackup: new Date('2024-01-16T02:00:00Z'),
        nextBackup: new Date('2024-01-17T02:00:00Z')
      },
      audit: {
        enableAuditLog: true,
        logLevel: 'INFO',
        retentionDays: 90,
        logFailedLogins: true,
        logDataChanges: true,
        logSystemAccess: true
      }
    };

    setTimeout(() => {
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  };

  const handleSaveSettings = async () => {
    if (!canConfigureSystem) return;
    
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      alert('Settings saved successfully!');
    }, 2000);
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      fetchSettings();
      setHasChanges(false);
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  if (!canConfigureSystem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-crime-red" />
            <h2 className="text-2xl font-bold text-crime-black mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access system configuration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-crime-red"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-crime-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
              <p className="text-gray-300">Administrative settings and system controls</p>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge className="bg-crime-yellow text-crime-black">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              <Button 
                onClick={handleResetSettings}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-crime-black"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving || !hasChanges}
                className="bg-crime-red hover:bg-crime-red-dark text-white"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="audit">Audit & Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic system configuration and organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-crime-black">System Name</label>
                    <Input
                      value={settings.general.systemName}
                      onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                      placeholder="Enter system name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-crime-black">Organization Name</label>
                    <Input
                      value={settings.general.organizationName}
                      onChange={(e) => updateSetting('general', 'organizationName', e.target.value)}
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-crime-black">Timezone</label>
                    <Select 
                      value={settings.general.timezone} 
                      onValueChange={(value) => updateSetting('general', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-crime-black">Language</label>
                    <Select 
                      value={settings.general.language} 
                      onValueChange={(value) => updateSetting('general', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="am">Amharic</SelectItem>
                        <SelectItem value="or">Oromo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-crime-black">Date Format</label>
                    <Select 
                      value={settings.general.dateFormat} 
                      onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/dd/yyyy">MM/dd/yyyy (US)</SelectItem>
                        <SelectItem value="dd/MM/yyyy">dd/MM/yyyy (EU)</SelectItem>
                        <SelectItem value="yyyy-MM-dd">yyyy-MM-dd (ISO)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>Password policies and authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-crime-black">Password Policy</h4>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-crime-black">Minimum Length</label>
                      <Input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                        min="6"
                        max="20"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Require Special Characters</span>
                        <Switch
                          checked={settings.security.passwordRequireSpecial}
                          onCheckedChange={(checked) => updateSetting('security', 'passwordRequireSpecial', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Require Numbers</span>
                        <Switch
                          checked={settings.security.passwordRequireNumbers}
                          onCheckedChange={(checked) => updateSetting('security', 'passwordRequireNumbers', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Require Uppercase Letters</span>
                        <Switch
                          checked={settings.security.passwordRequireUppercase}
                          onCheckedChange={(checked) => updateSetting('security', 'passwordRequireUppercase', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-crime-black">Access Control</h4>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-crime-black">Session Timeout (minutes)</label>
                      <Input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        min="5"
                        max="480"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-crime-black">Max Login Attempts</label>
                      <Input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        min="3"
                        max="10"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Two-Factor Authentication</span>
                        <Switch
                          checked={settings.security.twoFactorEnabled}
                          onCheckedChange={(checked) => updateSetting('security', 'twoFactorEnabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">IP Whitelist</span>
                        <Switch
                          checked={settings.security.ipWhitelistEnabled}
                          onCheckedChange={(checked) => updateSetting('security', 'ipWhitelistEnabled', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {settings.security.ipWhitelistEnabled && (
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <h5 className="font-medium text-crime-black mb-3">IP Whitelist Configuration</h5>
                      <Textarea
                        value={settings.security.ipWhitelist.join('\n')}
                        onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
                        placeholder="Enter IP addresses or ranges (one per line)&#10;Example: 192.168.1.0/24"
                        rows={4}
                      />
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-crime-black">Delivery Methods</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium text-crime-black">Email Notifications</span>
                        </div>
                        <Switch
                          checked={settings.notifications.emailEnabled}
                          onCheckedChange={(checked) => updateSetting('notifications', 'emailEnabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bell className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium text-crime-black">SMS Notifications</span>
                        </div>
                        <Switch
                          checked={settings.notifications.smsEnabled}
                          onCheckedChange={(checked) => updateSetting('notifications', 'smsEnabled', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-crime-black">Notification Types</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Critical Alerts</span>
                        <Switch
                          checked={settings.notifications.criticalAlerts}
                          onCheckedChange={(checked) => updateSetting('notifications', 'criticalAlerts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Case Updates</span>
                        <Switch
                          checked={settings.notifications.caseUpdates}
                          onCheckedChange={(checked) => updateSetting('notifications', 'caseUpdates', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">System Maintenance</span>
                        <Switch
                          checked={settings.notifications.systemMaintenance}
                          onCheckedChange={(checked) => updateSetting('notifications', 'systemMaintenance', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Weekly Reports</span>
                        <Switch
                          checked={settings.notifications.weeklyReports}
                          onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Backup & Recovery
                </CardTitle>
                <CardDescription>Database backup and recovery settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-crime-black">Automatic Backups</span>
                      <Switch
                        checked={settings.backup.autoBackupEnabled}
                        onCheckedChange={(checked) => updateSetting('backup', 'autoBackupEnabled', checked)}
                      />
                    </div>

                    {settings.backup.autoBackupEnabled && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-crime-black">Backup Frequency</label>
                          <Select 
                            value={settings.backup.backupFrequency} 
                            onValueChange={(value) => updateSetting('backup', 'backupFrequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-crime-black">Retention Days</label>
                          <Input
                            type="number"
                            value={settings.backup.retentionDays}
                            onChange={(e) => updateSetting('backup', 'retentionDays', parseInt(e.target.value))}
                            min="7"
                            max="365"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-crime-black">Backup Status</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Backup:</span>
                        <span className="text-sm font-medium text-crime-black">
                          {settings.backup.lastBackup ? new Date(settings.backup.lastBackup).toLocaleString() : 'Never'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Next Backup:</span>
                        <span className="text-sm font-medium text-crime-black">
                          {settings.backup.nextBackup ? new Date(settings.backup.nextBackup).toLocaleString() : 'Not scheduled'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Healthy
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="bg-crime-red hover:bg-crime-red-dark text-white">
                        <Database className="w-4 h-4 mr-1" />
                        Backup Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restore
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Audit & Logging
                </CardTitle>
                <CardDescription>System activity logging and audit trail configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-crime-black">Enable Audit Logging</span>
                      <Switch
                        checked={settings.audit.enableAuditLog}
                        onCheckedChange={(checked) => updateSetting('audit', 'enableAuditLog', checked)}
                      />
                    </div>

                    {settings.audit.enableAuditLog && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-crime-black">Log Level</label>
                          <Select 
                            value={settings.audit.logLevel} 
                            onValueChange={(value) => updateSetting('audit', 'logLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ERROR">Error</SelectItem>
                              <SelectItem value="WARN">Warning</SelectItem>
                              <SelectItem value="INFO">Info</SelectItem>
                              <SelectItem value="DEBUG">Debug</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-crime-black">Log Retention (days)</label>
                          <Input
                            type="number"
                            value={settings.audit.retentionDays}
                            onChange={(e) => updateSetting('audit', 'retentionDays', parseInt(e.target.value))}
                            min="30"
                            max="365"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-crime-black">Audit Events</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Failed Login Attempts</span>
                        <Switch
                          checked={settings.audit.logFailedLogins}
                          onCheckedChange={(checked) => updateSetting('audit', 'logFailedLogins', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">Data Changes</span>
                        <Switch
                          checked={settings.audit.logDataChanges}
                          onCheckedChange={(checked) => updateSetting('audit', 'logDataChanges', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-crime-black">System Access</span>
                        <Switch
                          checked={settings.audit.logSystemAccess}
                          onCheckedChange={(checked) => updateSetting('audit', 'logSystemAccess', checked)}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-1" />
                        View Audit Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
