import { createGitHubApiRoute } from "@/lib/github/base";

interface ForkRepoRequest {
  owner: string;
  repo: string;
  organization?: string;
}

export const POST = createGitHubApiRoute<ForkRepoRequest>(
  async ({ owner, repo, organization }, octokit) => {
    try {
      const forkParams: any = {
        owner,
        repo,
      };
      
      if (organization) {
        forkParams.organization = organization;
      }

      const { data } = await octokit.rest.repos.createFork(forkParams);
      return data;
    } catch (error: any) {
      // If fork already exists, get the user's fork
      if (error.status === 403) {
        const { data: user } = await octokit.rest.users.getAuthenticated();
        const { data: fork } = await octokit.rest.repos.get({
          owner: user.login,
          repo: repo
        });
        return fork;
      }
      throw error;
    }
  },
  ["owner", "repo"]
);
