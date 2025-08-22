'use client';

import React, { useState, useEffect } from 'react';
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
  const { currentUser, allUsers, handleUserSelect } = useUserManagement();
  const userTheme = useUserTheme(currentUser);
  const [testResults, setTestResults] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [featureEnabled, setFeatureEnabled] = useState(false);

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


  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          🧪 User Theme Mode Isolation Test
        </h1>

        {/* Feature Status */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">User Switching Test</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {allUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentUser?.id === user.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {user.name} {user.isGuest && '(Guest)'}
              </button>
            ))}
          </div>
          <button
            onClick={testUserSwitching}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Test User Switching
          </button>
        </div>

        {/* Theme Controls */}
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Theme Mode Testing</h2>
          <div className="flex items-center gap-4 mb-4">
            <ThemeToggle />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Current: <strong>{userTheme.theme}</strong>
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => testThemePersistence('light')}
              className="px-3 py-2 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500"
            >
              Test Light Mode
            </button>
            <button
              onClick={() => testThemePersistence('dark')}
              className="px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
            >
              Test Dark Mode
            </button>
            <button
              onClick={() => testThemePersistence('system')}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Test System Mode
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Test Results</h2>
          <button
            onClick={() => setTestResults([])}
            className="mb-3 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Clear Results
          </button>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">No test results yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.test}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      result.result === 'PASS' ? 'bg-green-100 text-green-800' :
                      result.result === 'FAIL' ? 'bg-red-100 text-red-800' :
                      result.result === 'SKIP' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {result.result}
                    </span>
                    <span className="text-gray-500 text-xs">{result.timestamp}</span>
                  </div>
                  {result.details && (
                    <p className="text-gray-600 dark:text-gray-400 ml-4">{result.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
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
  );
}