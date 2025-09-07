import { createGitHubApiRoute } from "@/lib/github/base";

interface RepoInfoRequest {
  owner: string;
  repo: string;
}

export const POST = createGitHubApiRoute<RepoInfoRequest>(
  async ({ owner, repo }, octokit) => {
    // Récupérer les informations du repository
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // Retourner les informations formatées
    return {
      repository: {
        owner: repoData.owner.login,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        isPrivate: repoData.private,
        defaultBranch: repoData.default_branch,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        url: repoData.html_url,
        cloneUrl: repoData.clone_url,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        size: repoData.size,
        openIssues: repoData.open_issues_count,
        topics: repoData.topics,
        license: repoData.license?.name,
      },
    };
  },
  ["owner", "repo"] // Paramètres requis
);
