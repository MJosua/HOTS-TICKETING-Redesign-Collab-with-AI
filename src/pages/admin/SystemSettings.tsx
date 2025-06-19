
import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload, Bell, Mail, Shield, Database } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    systemName: 'HOTS - Helpdesk System',
    companyName: 'PT INDOFOOD CBP SUKSES MAKMUR',
    timezone: 'Asia/Jakarta',
    language: 'id',
    
    // Email Settings
    emailHost: 'smtp.company.com',
    emailPort: '587',
    emailUsername: 'helpdesk@company.com',
    emailPassword: '',
    emailEncryption: 'tls',
    
    // Notification Settings
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    notifyOnTicketCreation: true,
    notifyOnStatusChange: true,
    notifyOnComments: false,
    
    // Security Settings
    sessionTimeout: '60',
    passwordMinLength: '8',
    requireSpecialChars: true,
    enableTwoFactor: false,
    loginAttempts: '5',
    
    // Ticket Settings
    defaultPriority: 'medium',
    autoAssignment: true,
    allowUserTicketEdit: true,
    requireApproval: true,
  });

  const handleSave = (section: string) => {
    // console.log(`Saving ${section} settings:`, settings);
    // Handle save logic here
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>General Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="systemName">System Name</Label>
                    <Input
                      id="systemName"
                      value={settings.systemName}
                      onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                        <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                        <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Default Language</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Button onClick={() => handleSave('general')}>
                    <Save className="w-4 h-4 mr-2" />
                    Save General Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Email Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emailHost">SMTP Host</Label>
                    <Input
                      id="emailHost"
                      value={settings.emailHost}
                      onChange={(e) => setSettings({...settings, emailHost: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailPort">SMTP Port</Label>
                    <Input
                      id="emailPort"
                      value={settings.emailPort}
                      onChange={(e) => setSettings({...settings, emailPort: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailUsername">Username</Label>
                    <Input
                      id="emailUsername"
                      value={settings.emailUsername}
                      onChange={(e) => setSettings({...settings, emailUsername: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailPassword">Password</Label>
                    <Input
                      id="emailPassword"
                      type="password"
                      value={settings.emailPassword}
                      onChange={(e) => setSettings({...settings, emailPassword: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailEncryption">Encryption</Label>
                    <Select value={settings.emailEncryption} onValueChange={(value) => setSettings({...settings, emailEncryption: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">Test Connection</Button>
                  <Button onClick={() => handleSave('email')}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Email Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.enableEmailNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, enableEmailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.enableSMSNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, enableSMSNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Ticket Creation</Label>
                      <p className="text-sm text-muted-foreground">Notify when new tickets are created</p>
                    </div>
                    <Switch
                      checked={settings.notifyOnTicketCreation}
                      onCheckedChange={(checked) => setSettings({...settings, notifyOnTicketCreation: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Status Changes</Label>
                      <p className="text-sm text-muted-foreground">Notify when ticket status changes</p>
                    </div>
                    <Switch
                      checked={settings.notifyOnStatusChange}
                      onCheckedChange={(checked) => setSettings({...settings, notifyOnStatusChange: checked})}
                    />
                  </div>
                </div>
                <div>
                  <Button onClick={() => handleSave('notifications')}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings({...settings, passwordMinLength: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={settings.loginAttempts}
                      onChange={(e) => setSettings({...settings, loginAttempts: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Special Characters</Label>
                      <p className="text-sm text-muted-foreground">Passwords must contain special characters</p>
                    </div>
                    <Switch
                      checked={settings.requireSpecialChars}
                      onCheckedChange={(checked) => setSettings({...settings, requireSpecialChars: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Enable 2FA for all users</p>
                    </div>
                    <Switch
                      checked={settings.enableTwoFactor}
                      onCheckedChange={(checked) => setSettings({...settings, enableTwoFactor: checked})}
                    />
                  </div>
                </div>
                <div>
                  <Button onClick={() => handleSave('security')}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ticket Settings */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultPriority">Default Priority</Label>
                    <Select value={settings.defaultPriority} onValueChange={(value) => setSettings({...settings, defaultPriority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Assignment</Label>
                      <p className="text-sm text-muted-foreground">Automatically assign tickets to available agents</p>
                    </div>
                    <Switch
                      checked={settings.autoAssignment}
                      onCheckedChange={(checked) => setSettings({...settings, autoAssignment: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow User Ticket Edit</Label>
                      <p className="text-sm text-muted-foreground">Users can edit their own tickets</p>
                    </div>
                    <Switch
                      checked={settings.allowUserTicketEdit}
                      onCheckedChange={(checked) => setSettings({...settings, allowUserTicketEdit: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Approval</Label>
                      <p className="text-sm text-muted-foreground">Tickets require approval workflow</p>
                    </div>
                    <Switch
                      checked={settings.requireApproval}
                      onCheckedChange={(checked) => setSettings({...settings, requireApproval: checked})}
                    />
                  </div>
                </div>
                <div>
                  <Button onClick={() => handleSave('tickets')}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Ticket Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default SystemSettings;
