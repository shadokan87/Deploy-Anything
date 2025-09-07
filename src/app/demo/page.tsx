'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface WorkflowStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function DemoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { name: 'Fork repository', status: 'pending' },
    { name: 'Add setup.sh file', status: 'pending' },
    { name: 'Create pull request', status: 'pending' },
  ]);

  // Configuration for the workflow
  const ORIGINAL_REPO = {
    owner: 'shadokan87',
    repo: 'Deploy-Anything'
  };
  const FILE_CONFIG = {
    path: 'setup.sh',
    content: 'echo "hello buddy"',
    message: 'Add setup.sh file'
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, ...updates } : step
    ));
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    const username = (session as any)?.user?.name || '';

    try {
      // Step 1: Fork the repository
      updateStep(0, { status: 'running' });
      const forkResponse = await fetch('/api/github/repo/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: ORIGINAL_REPO.owner,
          repo: ORIGINAL_REPO.repo
        })
      });

      if (!forkResponse.ok) {
        const errorText = await forkResponse.text();
        let errorMessage = 'Fork failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorText;
        } catch {
          errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const forkData = await forkResponse.json();
      updateStep(0, { 
        status: 'success', 
        message: `Forked to ${forkData.full_name}`,
        data: forkData 
      });

      // Wait a bit for GitHub to process the fork
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Add setup.sh file to the fork
      updateStep(1, { status: 'running' });
      const fileResponse = await fetch('/api/github/file/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: username,
          repo: ORIGINAL_REPO.repo,
          path: FILE_CONFIG.path,
          content: FILE_CONFIG.content,
          message: FILE_CONFIG.message,
          branch: 'main'
        })
      });

      if (!fileResponse.ok) {
        throw new Error(`File creation failed: ${await fileResponse.text()}`);
      }

      const fileData = await fileResponse.json();
      updateStep(1, { 
        status: 'success', 
        message: `Created ${FILE_CONFIG.path}`,
        data: fileData 
      });

      // Step 3: Create pull request
      updateStep(2, { status: 'running' });
      const prResponse = await fetch('/api/github/pr/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: ORIGINAL_REPO.owner,
          repo: ORIGINAL_REPO.repo,
          title: 'Add setup.sh script',
          head: `${username}:main`,
          base: 'main',
          body: 'This PR adds a setup.sh script with a simple echo command.\n\nCreated via the GitHub API demo.'
        })
      });

      if (!prResponse.ok) {
        throw new Error(`PR creation failed: ${await prResponse.text()}`);
      }

      const prData = await prResponse.json();
      updateStep(2, { 
        status: 'success', 
        message: `PR #${prData.number} created`,
        data: prData 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const failedStepIndex = steps.findIndex(step => step.status === 'running');
      if (failedStepIndex !== -1) {
        updateStep(failedStepIndex, { 
          status: 'error', 
          message: errorMessage 
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">GitHub Workflow Demo</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Workflow Overview</h2>
          <p className="text-gray-600 mb-4">
            This demo will perform the following actions:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Fork the repository: <code className="bg-gray-100 px-2 py-1 rounded">shadokan87/Deploy-Anything</code></li>
            <li>Add a file <code className="bg-gray-100 px-2 py-1 rounded">setup.sh</code> with content: <code className="bg-gray-100 px-2 py-1 rounded">echo "hello buddy"</code></li>
            <li>Create a pull request back to the original repository</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Workflow Progress</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="text-2xl">{getStepIcon(step.status)}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{step.name}</h3>
                  {step.message && (
                    <p className={`text-sm mt-1 ${
                      step.status === 'error' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {step.message}
                    </p>
                  )}
                  {step.data && step.status === 'success' && (
                    <div className="mt-2">
                      {step.name === 'Create pull request' && (
                        <a 
                          href={step.data.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Pull Request →
                        </a>
                      )}
                      {step.name === 'Fork repository' && (
                        <a 
                          href={step.data.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Fork →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={runWorkflow}
          disabled={isRunning}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Workflow...' : 'Run Workflow'}
        </button>

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
