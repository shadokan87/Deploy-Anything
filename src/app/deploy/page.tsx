"use client";
import { signOut, useSession } from "next-auth/react";
import AuthButton from "../components/AuthButton";
import Flex from "@/components/Flex";
import { useEffect, useState, useRef } from "react";
import { Else, If, Then, When } from "react-if";
import { ModeToggle } from "../components/ModeToggle";
import { Button } from "@/components/ui/button";
import z from "zod";
import { AgentState } from "@fragola-ai/agentic/agent";
import { Input } from "@/components/ui/input";

const LoadingDots = () => {
  const dotStyle = "w-2 h-2 rounded-full bg-foreground";
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <Flex gap={2} className="h-8 items-center">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${dotStyle} transition-all duration-300 ${activeDot === index ? "opacity-100" : "opacity-30"}`}
          style={{
            backgroundColor: "var(--background)",
            // fallback to #222 if --foreground is not set
          }}
        />
      ))}
    </Flex>
  );
};

/**
 * Schema representing the diagnostic state of a repository.
 *
 * @property success - Indicates whether the diagnostic was successful.
 * @property missingConfig - Indicates if the repository is missing configuration.
 * @property missingScripts - Describes the state of missing scripts. If `missing` is false, no scripts are missing.
 *   If `missing` is true, provides details about what is missing and an explanation.
 */
export const repoDiagnosticStateSchema = z.object({
  success: z.boolean().describe("Indicates whether the diagnostic was successful."),
  missingConfig: z.boolean().describe("Indicates if the repository is missing configuration."),
  missingScripts: z.union([
    z.object({
      missing: z.literal(false).describe("No scripts are missing.")
    }),
    z.object({
      missing: z.literal(true).describe("Scripts are missing."),
      what: z.string().describe("1 keyword of what is missing e.g 'install', 'build' and so on"),
      explaination: z.string().describe("Provides an explanation for the missing scripts.")
    })
  ]).describe("Describes the state of missing scripts. If `missing` is false, no scripts are missing. If `missing` is true, provides details about what is missing and an explanation.")
});

// GitHub repo validation schema
const githubRepoSchema = z.object({
  repo: z.string()
    .regex(/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/, "Must be a valid GitHub repository URL")
    .describe("GitHub repository URL")
});

type RepoDiagnosticState = {
  complete?: boolean,
  success: boolean,
  agentState: AgentState | undefined
} & z.infer<typeof repoDiagnosticStateSchema>;

export default function Deploy() {
  const { data: session, status } = useSession();

  interface _state {
    step: "idle" | "diag",
    diagState?: RepoDiagnosticState
  }

  const [state, setState] = useState<_state>({ step: "idle" });
  const [repoUrl, setRepoUrl] = useState("");
  const [repoError, setRepoError] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState<"none" | "diag">("none");
  const [vercelToken, setVercelToken] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isCompleteRef = useRef(false);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleRepoSubmit = () => {
    if (loadingHint != "none" || isCompleteRef.current)
      return;
    
    // Close any existing EventSource
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    const _url = repoUrl;
    setLoadingHint("diag");
    isCompleteRef.current = false;
    
    try {
      // Extract org and repo name from the GitHub URL
      const match = _url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);
      if (!match) {
        setRepoError("Invalid GitHub repository URL");
        setLoadingHint("none");
        return;
      }
      setState((prev) => {
        return { ...prev, step: "diag", diagState: undefined }
      });
      const org = match[1];
      const name = match[2];

      const eventSource = new EventSource(`http://localhost:3000/api/repoDiagnostic?org=${org}&name=${name}&access_token=${accessToken}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        // Check ref instead of state to avoid stale closure
        if (isCompleteRef.current) {
          console.log("Already complete, ignoring message");
          eventSource.close();
          return;
        }
        
        console.log("Received EventSource message:", event.data);
        const diagState = JSON.parse(event.data) as RepoDiagnosticState;
        
        if (diagState.complete) {
          console.log("Diagnostic complete, closing EventSource");
          isCompleteRef.current = true;
          setLoadingHint("none");
          eventSource.close();
          eventSourceRef.current = null;
        }
        
        setState((prev) => {
          return { ...prev, diagState };
        });
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        eventSourceRef.current = null;
        setLoadingHint("none");
      };

    } catch (error) {
      console.error('Error setting up EventSource:', error);
      setLoadingHint("none");
    }
  };

  const handleVercelDeploy = async () => {
    if (!vercelToken || !repoUrl) return;

    setDeploymentStatus("Deploying...");
    
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          vercelToken,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setDeploymentStatus(`Deployment successful! URL: ${result.url}`);
      } else {
        setDeploymentStatus(`Deployment failed: ${result.error}`);
      }
    } catch (error) {
      setDeploymentStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const validateRepo = (url: string) => {
    try {
      githubRepoSchema.parse({ repo: url });
      setRepoError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setRepoError(error.errors[0]?.message || "Invalid repository URL");
      }
      return false;
    }
  };
  const chat = () => {
    return (
      <Flex col gap={4} className="flex-1 overflow-auto flex-wrap">
        <If condition={state.step == "idle"}>
          <Then>
            <div className="space-y-4 w-full mx-auto">
              <div className="space-y-2">
                <Input
                  id="repo-url"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    if (e.target.value) {
                      validateRepo(e.target.value);
                    } else {
                      setRepoError(null);
                    }
                  }}
                  className={repoError ? "border-red-500" : ""}
                />
                {repoError && (
                  <p className="text-sm text-red-500">{repoError}</p>
                )}
              </div>
              <Button
                onClick={handleRepoSubmit}
                disabled={!repoUrl || !!repoError || loadingHint == "diag"}
                className="w-full"
              >
                Deploy
                <When condition={loadingHint == "diag"}>
                  <LoadingDots />
                </When>
              </Button>
            </div>
          </Then>
          <Else>
            <If condition={state.diagState != undefined}>
              <Then>
                <If condition={state.diagState?.complete === true || state.diagState?.success == true}>
                  <Then>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Repository Analysis Complete</h2>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap">
                            {state.diagState ? JSON.stringify(state.diagState, null, 2).slice(1, -1) : 'No data available'}
                          </pre>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Deploy to Vercel</h3>
                        <div className="space-y-2">
                          <label htmlFor="vercel-token" className="text-sm font-medium">
                            Vercel Access Token
                          </label>
                          <Input
                            id="vercel-token"
                            type="password"
                            placeholder="Enter your Vercel access token"
                            value={vercelToken}
                            onChange={(e) => setVercelToken(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={handleVercelDeploy}
                          disabled={!vercelToken || deploymentStatus === "Deploying..."}
                          className="w-full"
                        >
                          Deploy to Vercel
                        </Button>
                        {deploymentStatus && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm">{deploymentStatus}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Then>
                  <Else>
                    <p className="whitespace-nowrap text-xl font-semibold">{"We're analyzing your repository, hang tight !"}</p>
                    {(() => {
                      const lastMessage = state.diagState?.agentState?.conversation.at(-1);
                      console.log("__LAST__", lastMessage);
                      if (lastMessage?.role == "assistant" && typeof lastMessage.content == "string" && lastMessage.content.length > 0) {
                        console.log("__CONTENT__", lastMessage.content);
                        return <p className="font-semibold opacity-50">
                          {lastMessage.content}
                        </p>
                      }
                    })()}
                  </Else>
                </If>
              </Then>
            </If>
          </Else>
        </If>
      </Flex>
    );
  }
  // Access token is available after login
  const accessToken = (session as any)?.accessToken;
  return (
    <main className="w-full flex-col">
      <Flex justify="between" className="h-12 position-sticky">
        <p className="whitespace-nowrap text-xl font-semibold">{"Deploy Anyting"}</p>
        <div className="w-full"></div>
        <Flex gap={2}>
          <ModeToggle />
          <When condition={accessToken != undefined}>
            <Button variant="ghost" onClick={() => signOut()}>{(() => {
              if (session?.user)
                return `signout: ${session.user.email}`;
            })()}</Button>
          </When>
        </Flex>
      </Flex>
      <Flex col className="w-full md:w-2/3 mx-auto max-h-[calc(100vh-4rem)]">
        <If condition={accessToken != undefined}>
          <Then>
            {chat}
          </Then>
          <Else>
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-2xl font-bold mb-4">Connexion</h1>
              <AuthButton />
            </div>
          </Else>
        </If>
      </Flex>
    </main>
  );
}