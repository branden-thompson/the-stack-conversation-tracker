'use client';

import React, { useState, useEffect } from 'react';
import { UniversalDevHeader } from '@/components/ui/universal-dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { useUserManagement } from '@/lib/hooks/useUserManagement';
import { useUserTheme } from '@/lib/hooks/useUserTheme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { isUserThemeIsolationEnabled } from '@/lib/utils/user-theme-storage';

/**
 * User Theme Mode Isolation Test Page
 * 
 * Tests the complete user theme isolation system in the browser.
 * Open multiple tabs/windows to test cross-tab isolation.
 */
export default function ThemeIsolationTestPage() {
  const dynamicTheme = useDynamicAppTheme();
  const { currentUser, allUsers, handleUserSelect } = useUserManagement();
  const userTheme = useUserTheme(currentUser);
  const [testResults, setTestResults] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const enabled = isUserThemeIsolationEnabled();
    setFeatureEnabled(enabled);
    
    addTestResult(
      'Feature Flag Check',
      enabled ? 'PASS' : 'FAIL',
      `User theme isolation is ${enabled ? 'enabled' : 'disabled'}`
    );
  }, []);

  // Test user switching
  const testUserSwitching = () => {
    if (allUsers.length < 2) {
      addTestResult('User Switching Test', 'SKIP', 'Need at least 2 users');
      return;
    }

    const currentMode = userTheme.theme;
    const targetUser = allUsers.find(u => u.id !== currentUser?.id);
    
    if (targetUser) {
      addTestResult(
        'User Switch Test',
        'INITIATED',
        `Switching from ${currentUser?.name} (${currentMode}) to ${targetUser.name}`
      );
      handleUserSelect(targetUser);
    }
  };

  // Test theme persistence
  const testThemePersistence = (mode) => {
    const oldMode = userTheme.theme;
    userTheme.setTheme(mode);
    
    setTimeout(() => {
      addTestResult(
        'Theme Persistence Test',
        userTheme.theme === mode ? 'PASS' : 'FAIL',
        `Set ${mode}, got ${userTheme.theme} (was ${oldMode})`
      );
    }, 100);
  };

  // Handlers for UniversalDevHeader
  const handleExportAllData = () => {
    const exportData = {
      testResults,
      currentUser,
      allUsers: allUsers.length,
      featureEnabled,
      currentTheme: userTheme.theme,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-isolation-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`h-screen flex flex-col ${dynamicTheme.colors.background.primary}`}>
      {/* Header */}
      <UniversalDevHeader
        onOpenTray={() => setTrayOpen(true)}
        onExportAllData={handleExportAllData}
      />

      {/* Main Content */}
      <div className={`flex-1 overflow-auto p-6 ${dynamicTheme.colors.text.primary}`}>
        <div className="container mx-auto space-y-8">
          <div className={`${dynamicTheme.colors.background.card} rounded-lg p-6 ${dynamicTheme.colors.border.primary} border shadow-lg`}>
            <h1 className={`text-3xl font-bold mb-6 ${dynamicTheme.colors.text.primary}`}>
              🧪 User Theme Mode Isolation Test
            </h1>

            {/* Feature Status */}
            <div className={`mb-6 p-4 ${dynamicTheme.colors.status.info.bg} rounded-lg`}>
              <h2 className="text-lg font-semibold mb-2">Feature Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Feature Enabled:</strong> {isClient ? (featureEnabled ? '✅ Yes' : '❌ No') : '⏳ Loading...'}
            </div>
            <div>
              <strong>Current Theme Mode:</strong> {userTheme.theme}
            </div>
            <div>
              <strong>Current User:</strong> {currentUser?.name || 'None'} 
              {currentUser?.isGuest && ' (Guest)'}
            </div>
            <div>
              <strong>Total Users:</strong> {allUsers.length}
            </div>
          </div>
            </div>

            {/* User Selection */}
            <div className={`mb-6 p-4 ${dynamicTheme.colors.status.success.bg} rounded-lg`}>
              <h2 className="text-lg font-semibold mb-3">User Switching Test</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {allUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentUser?.id === user.id
                    ? `${dynamicTheme.colors.status.info.bg} text-white border-0`
                    : `${dynamicTheme.colors.background.secondary} ${dynamicTheme.colors.text.primary} hover:${dynamicTheme.colors.background.tertiary} border ${dynamicTheme.colors.border.primary}`
                }`}
              >
                {user.name} {user.isGuest && '(Guest)'}
              </button>
            ))}
          </div>
          <button
            onClick={testUserSwitching}
            className={`px-4 py-2 ${dynamicTheme.colors.status.success.bg} text-white rounded-md hover:opacity-80 border-0`}
          >
            Test User Switching
          </button>
            </div>

            {/* Theme Controls */}
            <div className={`mb-6 p-4 rounded-lg`} style={{ backgroundColor: 'rgb(147 51 234 / 0.1)' }}>
              <h2 className="text-lg font-semibold mb-3">Theme Mode Testing</h2>
          <div className="flex items-center gap-4 mb-4">
            <ThemeToggle />
            <span className={`text-sm ${dynamicTheme.colors.text.tertiary}`}>
              Current: <strong>{userTheme.theme}</strong>
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => testThemePersistence('light')}
              className={`px-3 py-2 ${dynamicTheme.colors.status.warning.bg} ${dynamicTheme.colors.text.primary} rounded-md hover:opacity-80 border-0`}
            >
              Test Light Mode
            </button>
            <button
              onClick={() => testThemePersistence('dark')}
              className={`px-3 py-2 ${dynamicTheme.colors.background.secondary} ${dynamicTheme.colors.text.primary} rounded-md hover:opacity-80 border border-2 ${dynamicTheme.colors.border.primary}`}
            >
              Test Dark Mode
            </button>
            <button
              onClick={() => testThemePersistence('system')}
              className={`px-3 py-2 ${dynamicTheme.colors.status.info.bg} text-white rounded-md hover:opacity-80 border-0`}
            >
              Test System Mode
            </button>
          </div>
            </div>

            {/* Test Results */}
            <div className={`p-4 ${dynamicTheme.colors.background.tertiary} rounded-lg`}>
              <h2 className="text-lg font-semibold mb-3">Test Results</h2>
          <button
            onClick={() => setTestResults([])}
            className={`mb-3 px-3 py-1 ${dynamicTheme.colors.status.error.bg} text-white rounded text-sm hover:opacity-80 border-0`}
          >
            Clear Results
          </button>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className={`${dynamicTheme.colors.text.tertiary} italic`}>No test results yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className={`p-2 ${dynamicTheme.colors.background.card} rounded text-sm`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.test}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      result.result === 'PASS' ? dynamicTheme.colors.status.success.bg + ' ' + dynamicTheme.colors.status.success.text :
                      result.result === 'FAIL' ? dynamicTheme.colors.status.error.bg + ' ' + dynamicTheme.colors.status.error.text :
                      result.result === 'SKIP' ? dynamicTheme.colors.status.warning.bg + ' ' + dynamicTheme.colors.status.warning.text :
                      dynamicTheme.colors.status.info.bg + ' ' + dynamicTheme.colors.status.info.text
                    }`}>
                      {result.result}
                    </span>
                    <span className={`${dynamicTheme.colors.text.tertiary} text-xs`}>{result.timestamp}</span>
                  </div>
                  {result.details && (
                    <p className={`${dynamicTheme.colors.text.tertiary} ml-4`}>{result.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
            </div>

            {/* Instructions */}
            <div className={`mt-6 p-4 ${dynamicTheme.colors.status.warning.bg} rounded-lg`}>
              <h2 className="text-lg font-semibold mb-2">Testing Instructions</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open this page in multiple browser tabs/windows</li>
            <li>Switch between different users in each tab</li>
            <li>Change theme modes (Light/Dark/System) for each user</li>
            <li>Verify that theme settings are isolated per user across tabs</li>
            <li>Test guest users get dark mode by default</li>
            <li>Check that settings persist after page refresh</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
        onNewCard={() => {}} // Disabled for dev pages
        onResetLayout={() => {}} // Disabled for dev pages  
        onRefreshCards={() => window.location.reload()}
        title="Theme Isolation Test"
      />
    </div>
  );
}