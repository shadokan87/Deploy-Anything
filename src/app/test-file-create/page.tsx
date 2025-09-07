'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TestFileCreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const testFileCreate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test file creation
      const fileResponse = await fetch('/api/github/file/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: owner || (session as any)?.user?.name,
          repo: repo || 'Deploy-Anything',
          path: 'setup.sh',
          content: 'echo "hello buddy"',
          message: 'Add setup.sh file - test',
          branch: 'main'
        })
      });

      const responseText = await fileResponse.text();
      let fileData;
      
      try {
        fileData = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid response: ${responseText}`);
      }

      if (!fileResponse.ok) {
        throw new Error(fileData.error || `File creation failed with status ${fileResponse.status}`);
      }

      setResult({
        success: true,
        message: 'File created successfully!',
        data: fileData,
        fileUrl: fileData.content?.html_url || fileData.html_url
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test File Creation</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          <p className="text-gray-600 mb-4">
            Test creating a file in a GitHub repository. Make sure you have write access to the repository.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository Owner (leave empty to use your username)
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder={(session as any)?.user?.name || 'owner'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repository Name
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="Deploy-Anything"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <p className="font-medium">File to create:</p>
            <p>Path: <code className="bg-gray-200 px-1 rounded">setup.sh</code></p>
            <p>Content: <code className="bg-gray-200 px-1 rounded">echo "hello buddy"</code></p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
            <div className="mt-3 text-sm text-red-600">
              <p className="font-medium">Common issues:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Make sure you have write access to the repository</li>
                <li>Check if the file already exists</li>
                <li>Verify the branch name is correct</li>
                <li>Ensure your GitHub token has the necessary scopes</li>
              </ul>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-green-800 mb-2">{result.message}</h3>
            {result.fileUrl && (
              <p className="text-sm text-green-700">
                File URL: 
                <a 
                  href={result.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  {result.fileUrl}
                </a>
              </p>
            )}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600">View full response</summary>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <button
          onClick={testFileCreate}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creating File...' : 'Test File Creation'}
        </button>

        <div className="mt-8 text-center space-x-4">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
          <a href="/test-fork" className="text-blue-600 hover:underline">
            Test Fork
          </a>
        </div>
      </div>
    </div>
  );
}
