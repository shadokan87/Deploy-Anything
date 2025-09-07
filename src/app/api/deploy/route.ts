import { NextRequest, NextResponse } from 'next/server';
import { Vercel } from "@vercel/sdk";

function parseGitHubURL(urlStr: string) {
    try {
        const url = new URL(urlStr);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length < 2) return null;
        const [account, repo] = parts;
        return { account, repo: repo.replace(".git", "") };
    } catch {
        return null;
    }
}

function isValidGitHubURL(urlStr: string) {
    try {
        const url = new URL(urlStr);
        return url.hostname === "github.com" && url.pathname.split("/").filter(Boolean).length >= 2;
    } catch {
        return false;
    }
}

async function getValidBranch(account: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${account}/${repo}/branches`);
    if (!res.ok) throw new Error("Error fetching branches.");
    const branches = await res.json();
    for (const branch of branches) {
        if (branch.name === "main" || branch.name === "master") return branch.name;
    }
    throw new Error("Neither 'main' nor 'master' branch found.");
}

async function createAndCheckDeployment(repo_name: string, account_name: string, branch: string, vercelToken: string) {
    try {
        const vercel = new Vercel({
            bearerToken: vercelToken
        });

        // Create a new deployment from GitHub repo
        const createResponse = await vercel.deployments.createDeployment({
            requestBody: {
                name: repo_name.toLowerCase(),
                target: "production",
                gitSource: {
                    type: "github",
                    repo: repo_name,
                    ref: branch,
                    org: account_name,
                }
            },
        });

        const deploymentId = createResponse.id;
        console.log(`Deployment created: ID ${deploymentId} and status ${createResponse.status}`);

        // Poll for deployment status
        let deploymentStatus = createResponse.status;
        let deploymentURL = createResponse.url;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max
        
        while (
            deploymentStatus !== "CANCELED" &&
            deploymentStatus !== "ERROR" &&
            deploymentStatus !== "READY" &&
            attempts < maxAttempts
        ) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const statusResponse = await vercel.deployments.getDeployment({
                idOrUrl: deploymentId,
                withGitRepoInfo: "true",
            });
            deploymentStatus = statusResponse.status;
            deploymentURL = statusResponse.url;
            console.log(`Deployment status: ${deploymentStatus}`);
            attempts++;
        }

        if (deploymentStatus === "READY") {
            console.log(`Deployment successful. URL: ${deploymentURL}`);
            return { success: true, url: `https://${deploymentURL}` };
        } else {
            // Fetch the latest deployment status for more details
            const details = await vercel.deployments.getDeployment({
                idOrUrl: deploymentId,
                withGitRepoInfo: "true",
            });
            console.log("Deployment failed or was canceled");
            console.log("Full deployment details:", details);
            return { success: false, error: `Deployment failed with status: ${deploymentStatus}` };
        }
    } catch (error) {
        console.error(
            error instanceof Error ? `Error: ${error.message}` : String(error)
        );
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const { repoUrl, vercelToken } = await request.json();

        if (!repoUrl || !vercelToken) {
            return NextResponse.json({ success: false, error: 'Missing repoUrl or vercelToken' }, { status: 400 });
        }

        if (!isValidGitHubURL(repoUrl)) {
            return NextResponse.json({ success: false, error: 'Invalid GitHub URL' }, { status: 400 });
        }

        const parsed = parseGitHubURL(repoUrl);
        if (!parsed) {
            return NextResponse.json({ success: false, error: 'Unable to parse GitHub URL' }, { status: 400 });
        }

        const branch = await getValidBranch(parsed.account, parsed.repo);
        const result = await createAndCheckDeployment(parsed.repo, parsed.account, branch, vercelToken);

        return NextResponse.json(result);
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
