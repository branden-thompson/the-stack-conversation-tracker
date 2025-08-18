/**
 * Load Test Controls Component
 * 
 * Provides interface for running load tests with different scenarios
 * and real-time monitoring of load test results
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  Settings, 
  Users, 
  Zap, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { THEME } from '@/lib/utils/ui-constants';

const LOAD_TEST_SCENARIOS = {
  'light-load': {
    name: 'Light Load',
    description: '5 concurrent users, moderate API usage',
    icon: <Users className="h-4 w-4" />,
    config: {
      concurrentUsers: 5,
      duration: 30000, // 30 seconds
      apiCallsPerUser: 5,
      delayBetweenCalls: 2000
    }
  },
  'high-user-load': {
    name: 'High User Load',
    description: '25 concurrent users, typical usage patterns',
    icon: <Users className="h-4 w-4" />,
    config: {
      concurrentUsers: 25,
      duration: 60000, // 1 minute
      apiCallsPerUser: 8,
      delayBetweenCalls: 1500
    }
  },
  'api-stress': {
    name: 'API Stress Test',
    description: 'Rapid API calls, test endpoint performance',
    icon: <Zap className="h-4 w-4" />,
    config: {
      concurrentUsers: 15,
      duration: 45000, // 45 seconds
      apiCallsPerUser: 20,
      delayBetweenCalls: 500
    }
  },
  'endurance': {
    name: 'Endurance Test',
    description: 'Long-running test for memory leaks',
    icon: <Clock className="h-4 w-4" />,
    config: {
      concurrentUsers: 10,
      duration: 300000, // 5 minutes
      apiCallsPerUser: 30,
      delayBetweenCalls: 3000
    }
  }
};

export default function LoadTestControls({ onLoadTestStart, onLoadTestStop, isRunning }) {
  const [selectedScenario, setSelectedScenario] = useState('light-load');
  const [customConfig, setCustomConfig] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [testProgress, setTestProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');

  // Mock load test execution
  const runLoadTest = async (scenario) => {
    const config = LOAD_TEST_SCENARIOS[scenario].config;
    onLoadTestStart();
    
    setCurrentPhase('Initializing...');
    setTestProgress(0);
    
    // Simulate load test phases
    const phases = [
      { name: 'Preparing test environment', duration: 2000 },
      { name: 'Spawning virtual users', duration: 3000 },
      { name: 'Running load test', duration: Math.min(config.duration, 30000) }, // Cap at 30s for demo
      { name: 'Collecting results', duration: 2000 },
      { name: 'Analyzing performance data', duration: 1000 }
    ];
    
    let totalProgress = 0;
    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    
    for (const phase of phases) {
      setCurrentPhase(phase.name);
      
      // Simulate phase progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, phase.duration / 20));
        const phaseProgress = totalProgress + (i / 100) * (phase.duration / totalDuration) * 100;
        setTestProgress(phaseProgress);
      }
      
      totalProgress += (phase.duration / totalDuration) * 100;
    }
    
    // Generate mock results
    const mockResults = {
      scenario: scenario,
      config: config,
      startTime: new Date().toISOString(),
      duration: phases.reduce((sum, phase) => sum + phase.duration, 0),
      totalRequests: config.concurrentUsers * config.apiCallsPerUser,
      successfulRequests: Math.floor(config.concurrentUsers * config.apiCallsPerUser * 0.95),
      failedRequests: Math.floor(config.concurrentUsers * config.apiCallsPerUser * 0.05),
      averageResponseTime: Math.floor(Math.random() * 200 + 100),
      peakResponseTime: Math.floor(Math.random() * 500 + 300),
      requestsPerSecond: Math.floor(config.concurrentUsers * config.apiCallsPerUser / (config.duration / 1000)),
      memoryUsage: {
        initial: 45.2,
        peak: Math.random() * 30 + 45,
        final: Math.random() * 10 + 50
      },
      errorTypes: {
        'Network timeout': Math.floor(Math.random() * 3),
        'Server error': Math.floor(Math.random() * 2),
        'Rate limit exceeded': Math.floor(Math.random() * 1)
      }
    };
    
    setTestResults(mockResults);
    setCurrentPhase('Test completed');
    onLoadTestStop();
  };

  const stopLoadTest = () => {
    setCurrentPhase('Stopping test...');
    setTimeout(() => {
      onLoadTestStop();
      setTestProgress(0);
      setCurrentPhase('');
    }, 1000);
  };

  const ScenarioCard = ({ scenarioKey, scenario }) => (
    <Card 
      className={`cursor-pointer transition-colors ${THEME.colors.background.card} ${
        selectedScenario === scenarioKey 
          ? `${THEME.colors.border.secondary} ${THEME.colors.background.accent}` 
          : `${THEME.colors.border.primary} ${THEME.colors.background.hover}`
      }`}
      onClick={() => setSelectedScenario(scenarioKey)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">{scenario.icon}</div>
          <div className="flex-1">
            <h3 className="font-medium">{scenario.name}</h3>
            <p className="text-sm ${THEME.colors.text.tertiary} mb-2">{scenario.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Users: {scenario.config.concurrentUsers}</div>
              <div>Duration: {scenario.config.duration / 1000}s</div>
              <div>API Calls: {scenario.config.apiCallsPerUser}/user</div>
              <div>Delay: {scenario.config.delayBetweenCalls}ms</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TestResultsCard = () => {
    if (!testResults) return null;
    
    const successRate = (testResults.successfulRequests / testResults.totalRequests) * 100;
    const isSuccessful = successRate >= 95;
    
    return (
      <Card className={`mt-6 border-2 ${isSuccessful ? THEME.colors.status.success.border + ' ' + THEME.colors.status.success.bg : THEME.colors.status.warning.border + ' ' + THEME.colors.status.warning.bg}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSuccessful ? <CheckCircle className={`h-5 w-5 ${THEME.colors.status.success.icon}`} /> : <AlertTriangle className={`h-5 w-5 ${THEME.colors.status.warning.icon}`} />}
            Load Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>Success Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{successRate.toFixed(1)}%</p>
                <Badge className={isSuccessful 
                  ? `${THEME.colors.status.success.bg} ${THEME.colors.status.success.border} ${THEME.colors.status.success.text}` 
                  : `${THEME.colors.status.warning.bg} ${THEME.colors.status.warning.border} ${THEME.colors.status.warning.text}`
                }>
                  {testResults.successfulRequests}/{testResults.totalRequests}
                </Badge>
              </div>
            </div>
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>Avg Response</p>
              <p className="text-xl font-bold">{testResults.averageResponseTime}ms</p>
            </div>
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>Peak Response</p>
              <p className="text-xl font-bold">{testResults.peakResponseTime}ms</p>
            </div>
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>Requests/sec</p>
              <p className="text-xl font-bold">{testResults.requestsPerSecond}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Memory Usage</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Initial:</span>
                  <span>{testResults.memoryUsage.initial.toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak:</span>
                  <span>{testResults.memoryUsage.peak.toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Final:</span>
                  <span>{testResults.memoryUsage.final.toFixed(1)} MB</span>
                </div>
              </div>
            </div>
            
            {Object.keys(testResults.errorTypes).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Error Breakdown</p>
                <div className="text-sm space-y-1">
                  {Object.entries(testResults.errorTypes).map(([error, count]) => (
                    count > 0 && (
                      <div key={error} className="flex justify-between">
                        <span>{error}:</span>
                        <span>{count}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Load Test Scenarios */}
      <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Load Test Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(LOAD_TEST_SCENARIOS).map(([key, scenario]) => (
              <ScenarioCard key={key} scenarioKey={key} scenario={scenario} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
        <CardHeader>
          <CardTitle>Test Execution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {!isRunning ? (
              <Button 
                onClick={() => runLoadTest(selectedScenario)}
                className="flex items-center gap-2 bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              >
                <Play className="h-4 w-4" />
                Start Load Test
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                onClick={stopLoadTest}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Test
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <span className={`text-sm ${THEME.colors.text.secondary}`}>Selected:</span>
              <Badge variant="outline" className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300">
                {LOAD_TEST_SCENARIOS[selectedScenario].name}
              </Badge>
            </div>
          </div>

          {isRunning && (
            <div className="space-y-3">
              <div>
                <div className={`flex justify-between text-sm mb-2 ${THEME.colors.text.secondary}`}>
                  <span>Progress</span>
                  <span>{testProgress.toFixed(0)}%</span>
                </div>
                <Progress value={testProgress} className="h-2" />
              </div>
              
              {currentPhase && (
                <div className={`text-sm ${THEME.colors.text.tertiary}`}>
                  {currentPhase}
                </div>
              )}
            </div>
          )}

          {!isRunning && (
            <Alert className={`${THEME.colors.status.warning.bg} ${THEME.colors.status.warning.border}`}>
              <AlertTriangle className={`h-4 w-4 ${THEME.colors.status.warning.icon}`} />
              <AlertDescription className={THEME.colors.status.warning.text}>
                <strong>Safety Notice:</strong> Load tests will create significant system load. 
                Monitor your application's performance metrics during testing and be prepared to stop 
                if issues arise.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <TestResultsCard />
    </div>
  );
}