'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function TestForkPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  const testFork = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test fork only
      const forkResponse = await fetch('/api/github/repo/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: 'shadokan87',
          repo: 'Deploy-Anything'
        })
      });

      const responseText = await forkResponse.text();
      let forkData;
      
      try {
        forkData = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid response: ${responseText}`);
      }

      if (!forkResponse.ok) {
        throw new Error(forkData.error || `Fork failed with status ${forkResponse.status}`);
      }

      setResult({
        success: true,
        message: 'Fork successful!',
        data: forkData,
        forkUrl: forkData.html_url,
        owner: forkData.owner.login
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Fork Repository</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Information</h2>
          <p className="text-gray-600 mb-4">
            This page will test forking the repository: <code className="bg-gray-100 px-2 py-1 rounded">shadokan87/Deploy-Anything</code>
          </p>
          <p className="text-sm text-gray-500">
            Logged in as: <strong>{(session as any)?.user?.name}</strong>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-green-800 mb-2">{result.message}</h3>
            <div className="text-sm text-green-700 space-y-2">
              <p>Fork owner: <strong>{result.owner}</strong></p>
              <p>
                Fork URL: 
                <a 
                  href={result.forkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  {result.forkUrl}
                </a>
              </p>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600">View full response</summary>
              <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          </div>
        )}

        <button
          onClick={testFork}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Testing Fork...' : 'Test Fork'}
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
