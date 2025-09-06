// Import the Vercel SDK
import { Vercel } from "@vercel/sdk";
import { error } from "console";
const CreateDeploymentStatus = {
  Canceled: "CANCELED",
  Error: "ERROR",
  Queued: "QUEUED",
  Building: "BUILDING",
  Initializing: "INITIALIZING",
  Ready: "READY",
} as const;

// You may want to load these from environment variables in production
const vercelToken = "8BswdY4GSIDPHv5983GJ5M8O";

const vercel = new Vercel({
    bearerToken: process.env.VERCEL_TOKEN || vercelToken,
});

async function createAndCheckDeployment() {
    try {
        // Create a new deployment from GitHub repo
        const createResponse = await vercel.deployments.createDeployment({
            requestBody: {
                name: "my-web-app",
                target: "production",
                gitSource: {
                    type: "github",
                    repo: "Deploy-Anything",
                    ref: "main",
                    org: "afuma",
                }
                // projectSettings: {
                //     framework: "nextjs",
                //     buildCommand: "npm run build",
                //     outputDirectory: ".next",
                //     installCommand: "npm install",
                // },
            },
        });

        const deploymentId = createResponse.id;
        console.log(
            `Deployment created: ID ${deploymentId} and status ${createResponse.status}`
        );

        // Optionally, poll for deployment status
        let deploymentStatus = createResponse.status;
        let deploymentURL = createResponse.url;
        while (
            deploymentStatus != CreateDeploymentStatus.Error
        ) {
            if (deploymentStatus == CreateDeploymentStatus.Ready)
                break ;
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const statusResponse = await vercel.deployments.getDeployment({
                idOrUrl: deploymentId,
                withGitRepoInfo: "true",
            });
            deploymentStatus = statusResponse.status;
            deploymentURL = statusResponse.url;
            console.log(`Deployment status: ${deploymentStatus}`);
        }

        if (deploymentStatus === "READY") {
            console.log(`Deployment successful. URL: ${deploymentURL}`);
        } else {
            // Fetch the latest deployment status for more details
            const details = await vercel.deployments.getDeployment({
                idOrUrl: deploymentId,
                withGitRepoInfo: "true",
            });
            console.log("Deployment failed or was canceled");
            console.log("Full deployment details:", details);
        }
    } catch (error) {
        console.error(
            error instanceof Error ? `Error: ${error.message}` : String(error)
        );
    }
}

createAndCheckDeployment();