import { createGitHubApiRoute } from "@/lib/github/base";

interface CreatePRRequest {
  owner: string;
  repo: string;
  title: string;
  head: string; // branch name or owner:branch
  base: string; // target branch
  body?: string;
  draft?: boolean;
}

export const POST = createGitHubApiRoute<CreatePRRequest>(
  async ({ owner, repo, title, head, base, body, draft }, octokit) => {
    const params: any = {
      owner,
      repo,
      title,
      head,
      base,
    };
    
    if (body) {
      params.body = body;
    }
    
    if (draft !== undefined) {
      params.draft = draft;
    }

    const { data } = await octokit.rest.pulls.create(params);
    return data;
  },
  ["owner", "repo", "title", "head", "base"]
);
