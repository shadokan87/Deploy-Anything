import Link from "next/link";
import AuthButton from "./components/AuthButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Démonstration GitHub API
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Explorez toutes les données disponibles via l'authentification GitHub
            </p>
            <AuthButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-blue-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Profil Utilisateur</h3>
              <p className="text-gray-600 text-sm">
                Informations complètes du profil : nom, email, bio, localisation, entreprise, statistiques
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-green-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Repositories</h3>
              <p className="text-gray-600 text-sm">
                Liste des repositories avec détails : langages, stars, forks, taille, dates
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-purple-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Activité Récente</h3>
              <p className="text-gray-600 text-sm">
                Événements récents : commits, issues, pull requests, créations de repos
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-orange-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Organizations</h3>
              <p className="text-gray-600 text-sm">
                Organisations auxquelles l'utilisateur appartient avec leurs détails
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-red-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Réseau Social</h3>
              <p className="text-gray-600 text-sm">
                Followers et following avec leurs profils et informations
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-indigo-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Gists</h3>
              <p className="text-gray-600 text-sm">
                Gists publics et privés avec leurs fichiers et métadonnées
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/github-data"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Voir la Démonstration Complète
            </Link>
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Données GitHub Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Informations Utilisateur</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• ID utilisateur et login</li>
                  <li>• Nom complet et email</li>
                  <li>• Avatar et gravatar</li>
                  <li>• Bio et localisation</li>
                  <li>• Entreprise et blog</li>
                  <li>• Compte Twitter lié</li>
                  <li>• Dates de création/mise à jour</li>
                  <li>• Statistiques (repos, followers, etc.)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-600">Données des Repositories</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Nom et description</li>
                  <li>• Visibilité (public/privé)</li>
                  <li>• Langage principal</li>
                  <li>• Nombre de stars et forks</li>
                  <li>• Taille du repository</li>
                  <li>• Issues ouvertes</li>
                  <li>• Licence utilisée</li>
                  <li>• Dates importantes</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-600">Activité et Événements</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Push events</li>
                  <li>• Création de repositories</li>
                  <li>• Issues et pull requests</li>
                  <li>• Commentaires</li>
                  <li>• Forks et stars</li>
                  <li>• Activité sur les gists</li>
                  <li>• Événements publics</li>
                  <li>• Timestamps détaillés</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-600">Réseau et Social</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Liste des followers</li>
                  <li>• Utilisateurs suivis</li>
                  <li>• Profils des contacts</li>
                  <li>• Organizations membres</li>
                  <li>• Gists publics/privés</li>
                  <li>• Collaborations</li>
                  <li>• Contributions</li>
                  <li>• Métadonnées sociales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
