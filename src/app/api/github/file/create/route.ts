import { createGitHubApiRoute } from "@/lib/github/base";

interface CreateFileRequest {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
}

export const POST = createGitHubApiRoute<CreateFileRequest>(
  async ({ owner, repo, path, content, message, branch }, octokit) => {
    // Encoder le contenu en base64
    const encodedContent = Buffer.from(content).toString('base64');
    
    const params: any = {
      owner,
      repo,
      path,
      message,
      content: encodedContent,
    };
    
    if (branch) {
      params.branch = branch;
    }

    try {
      // Essayer de récupérer le fichier existant pour obtenir son SHA
      const { data: existingFile } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ...(branch && { ref: branch })
      });

      // Si le fichier existe et n'est pas un répertoire, ajouter le SHA
      if ('sha' in existingFile && existingFile.type === 'file') {
        params.sha = existingFile.sha;
      }
    } catch (error: any) {
      // Si le fichier n'existe pas (404), c'est normal, on continue
      if (error.status !== 404) {
        // Si c'est une autre erreur, on la propage
        throw error;
      }
    }

    // Créer ou mettre à jour le fichier
    const { data } = await octokit.rest.repos.createOrUpdateFileContents(params);
    return data;
  },
  ["owner", "repo", "path", "content", "message"]
);
