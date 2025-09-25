import React from 'react';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/useAuthStore';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = React.useState({
    notifications: {
      email: true,
      push: true,
      alerts: true,
      reports: false,
    },
    optimization: {
      autoRun: false,
      weighting: {
        reliability: 0.6,
        branding: 0.2,
        cost: 0.2,
      },
    },
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'Asia/Kolkata',
    },
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    toast.success('Settings saved successfully');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and application preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md">
                  Profile
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                  Notifications
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                  Optimization
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                  Display
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                  Security
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={user?.name || ''}
                    disabled
                    helperText="Contact admin to update name"
                  />
                  <Input
                    label="Username"
                    value={user?.username || ''}
                    disabled
                    helperText="Username cannot be changed"
                  />
                  <Input
                    label="Role"
                    value={user?.role || ''}
                    disabled
                    helperText="Role assigned by administrator"
                  />
                  <Input
                    label="Email"
                    value={`${user?.username}@kochimetro.com`}
                    disabled
                    helperText="Contact IT for email changes"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            email: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Email notifications
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            push: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Push notifications
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.alerts}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            alerts: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Critical alerts
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.reports}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            reports: e.target.checked,
                          },
                        }))
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Daily reports</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Optimization Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Optimization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.optimization.autoRun}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        optimization: {
                          ...prev.optimization,
                          autoRun: e.target.checked,
                        },
                      }))
                    }
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    Auto-run optimization at scheduled times
                  </span>
                </label>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Default Optimization Weights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Reliability
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.optimization.weighting.reliability}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            optimization: {
                              ...prev.optimization,
                              weighting: {
                                ...prev.optimization.weighting,
                                reliability: parseFloat(e.target.value),
                              },
                            },
                          }))
                        }
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(
                          settings.optimization.weighting.reliability * 100
                        )}
                        %
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Branding
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.optimization.weighting.branding}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            optimization: {
                              ...prev.optimization,
                              weighting: {
                                ...prev.optimization.weighting,
                                branding: parseFloat(e.target.value),
                              },
                            },
                          }))
                        }
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(
                          settings.optimization.weighting.branding * 100
                        )}
                        %
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Cost
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.optimization.weighting.cost}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            optimization: {
                              ...prev.optimization,
                              weighting: {
                                ...prev.optimization.weighting,
                                cost: parseFloat(e.target.value),
                              },
                            },
                          }))
                        }
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(settings.optimization.weighting.cost * 100)}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Display Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={settings.display.theme}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          display: { ...prev.display, theme: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.display.language}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          display: {
                            ...prev.display,
                            language: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ml">Malayalam</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
