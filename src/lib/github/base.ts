import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";

/**
 * Récupère une instance Octokit authentifiée
 */
export async function getAuthenticatedOctokit(): Promise<Octokit> {
  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  if (!accessToken) {
    throw new Error("Non authentifié. Veuillez vous connecter avec GitHub.");
  }

  return new Octokit({ auth: accessToken });
}

/**
 * Crée un handler d'API route GitHub simplifié
 */
export function createGitHubApiRoute<TBody = any, TResult = any>(
  handler: (body: TBody, octokit: Octokit) => Promise<TResult>,
  requiredParams?: string[]
) {
  return async (req: NextRequest) => {
    try {
      // Parser le body
      const body = await req.json() as TBody;
      
      // Valider les paramètres requis
      if (requiredParams) {
        const missing = requiredParams.filter(param => !(body as any)[param]);
        if (missing.length > 0) {
          return NextResponse.json(
            { error: `Paramètres manquants: ${missing.join(", ")}` },
            { status: 400 }
          );
        }
      }
      
      // Obtenir Octokit authentifié
      const octokit = await getAuthenticatedOctokit();
      
      // Exécuter le handler
      const result = await handler(body, octokit);
      
      return NextResponse.json(result);
      
    } catch (error: any) {
      // Les erreurs GitHub ont déjà un format standard
      if (error.status) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      
      // Erreur générique
      return NextResponse.json(
        { error: error.message || "Une erreur est survenue" },
        { status: 500 }
      );
    }
  };
}
