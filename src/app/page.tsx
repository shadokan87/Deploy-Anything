'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AuthButton from './components/AuthButton';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">GitHub Data Explorer</h1>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {session ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Bienvenue, {session.user?.name}!</h2>
              <p className="text-gray-600 mb-4">
                Vous êtes connecté avec GitHub. Voici toutes les données disponibles via l'API GitHub:
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link
                  href="/demo"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Voir la démo du workflow complet →
                </Link>
                <Link
                  href="/test-fork"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Tester le fork uniquement
                </Link>
                <Link
                  href="/test-file-create"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Tester la création de fichier
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DataCategory
                title="Données utilisateur"
                items={[
                  'Profil complet (nom, email, bio, avatar)',
                  'Statistiques (repos, followers, following)',
                  'Organisations',
                  'Événements publics',
                  'Gists',
                  'Clés SSH et GPG',
                  'Emails vérifiés',
                  'Statut de vérification',
                ]}
              />

              <DataCategory
                title="Repositories"
                items={[
                  'Liste des repos (publics/privés)',
                  'Détails du repo (description, langages)',
                  'Branches et tags',
                  'Commits et historique',
                  'Contributors',
                  'Forks',
                  'Stars et watchers',
                  'Topics et licences',
                ]}
              />

              <DataCategory
                title="Issues & Pull Requests"
                items={[
                  'Liste des issues',
                  'Commentaires',
                  'Labels et milestones',
                  'Assignees',
                  'État et timeline',
                  'Reviews de PR',
                  'Checks et statuts',
                  'Merge status',
                ]}
              />

              <DataCategory
                title="Actions & Workflows"
                items={[
                  'Workflows disponibles',
                  'Runs et jobs',
                  'Artifacts',
                  'Secrets (noms seulement)',
                  'Logs',
                  'Statuts de build',
                  'Déploiements',
                  'Environnements',
                ]}
              />

              <DataCategory
                title="Collaboration"
                items={[
                  'Collaborateurs',
                  'Teams',
                  'Permissions',
                  'Invitations',
                  'Code reviews',
                  'Discussions',
                  'Projects boards',
                  'Webhooks',
                ]}
              />

              <DataCategory
                title="Contenu & Code"
                items={[
                  'Arborescence des fichiers',
                  'Contenu des fichiers',
                  'Blobs et trees',
                  'Comparaison de branches',
                  'Patches et diffs',
                  'Recherche de code',
                  'Releases',
                  'Assets de release',
                ]}
              />
            </div>

            <div className="mt-12 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">API Routes disponibles</h3>
              <p className="text-gray-700 mb-4">
                Cette application expose des routes API modulaires pour interagir avec GitHub:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <div>
                    <code className="bg-white px-2 py-1 rounded">/api/github/repo/info</code>
                    <span className="text-gray-600 ml-2">- Obtenir les informations d'un repository</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <div>
                    <code className="bg-white px-2 py-1 rounded">/api/github/repo/fork</code>
                    <span className="text-gray-600 ml-2">- Forker un repository</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <div>
                    <code className="bg-white px-2 py-1 rounded">/api/github/file/create</code>
                    <span className="text-gray-600 ml-2">- Créer ou modifier un fichier</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <div>
                    <code className="bg-white px-2 py-1 rounded">/api/github/pr/create</code>
                    <span className="text-gray-600 ml-2">- Créer une pull request</span>
                  </div>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">
              Connectez-vous pour explorer les données GitHub
            </h2>
            <p className="text-gray-600 mb-8">
              Cette application vous permet de voir toutes les données disponibles via l'API GitHub
              et de tester un workflow complet de contribution.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Se connecter avec GitHub
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function DataCategory({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <ul className="space-y-1 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
