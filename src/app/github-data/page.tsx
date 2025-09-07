'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import AuthButton from "../components/AuthButton";

interface ExtendedSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  hireable: boolean;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  clone_url: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
  } | null;
  default_branch: string;
  visibility: string;
}

interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    display_login: string;
    gravatar_id: string;
    url: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: any;
  public: boolean;
  created_at: string;
}

interface GitHubOrganization {
  login: string;
  id: number;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string;
}

export default function GitHubDataPage() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [organizations, setOrganizations] = useState<GitHubOrganization[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [gists, setGists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('user');

  const fetchGitHubData = async () => {
    const extendedSession = session as ExtendedSession;
    if (!extendedSession?.accessToken) return;

    setLoading(true);
    const token = extendedSession.accessToken;
    const headers = {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    };

    try {
      // Données utilisateur
      const userResponse = await fetch('https://api.github.com/user', { headers });
      const userData = await userResponse.json();
      setUserData(userData);

      // Repositories
      const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', { headers });
      const reposData = await reposResponse.json();
      setRepos(reposData);

      // Événements récents
      const eventsResponse = await fetch(`https://api.github.com/users/${userData.login}/events?per_page=10`, { headers });
      const eventsData = await eventsResponse.json();
      setEvents(eventsData);

      // Organizations
      const orgsResponse = await fetch('https://api.github.com/user/orgs', { headers });
      const orgsData = await orgsResponse.json();
      setOrganizations(orgsData);

      // Followers
      const followersResponse = await fetch(`https://api.github.com/users/${userData.login}/followers?per_page=10`, { headers });
      const followersData = await followersResponse.json();
      setFollowers(followersData);

      // Following
      const followingResponse = await fetch(`https://api.github.com/users/${userData.login}/following?per_page=10`, { headers });
      const followingData = await followingResponse.json();
      setFollowing(followingData);

      // Gists
      const gistsResponse = await fetch('https://api.github.com/user/gists?per_page=10', { headers });
      const gistsData = await gistsResponse.json();
      setGists(gistsData);

    } catch (error) {
      console.error('Erreur lors de la récupération des données GitHub:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const extendedSession = session as ExtendedSession;
    if (extendedSession?.accessToken) {
      fetchGitHubData();
    }
  }, [session]);

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Données GitHub</h1>
        <p className="mb-4">Vous devez vous connecter pour voir vos données GitHub.</p>
        <AuthButton />
      </div>
    );
  }

  const tabs = [
    { id: 'user', label: 'Profil Utilisateur', count: userData ? 1 : 0 },
    { id: 'repos', label: 'Repositories', count: repos.length },
    { id: 'events', label: 'Activité Récente', count: events.length },
    { id: 'organizations', label: 'Organizations', count: organizations.length },
    { id: 'social', label: 'Réseau Social', count: followers.length + following.length },
    { id: 'gists', label: 'Gists', count: gists.length },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Données GitHub Complètes</h1>
        <AuthButton />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'user' && userData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Profil Utilisateur</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <img
                src={userData.avatar_url}
                alt={userData.name}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h3 className="text-xl font-semibold">{userData.name}</h3>
                <p className="text-gray-600">@{userData.login}</p>
                <p className="text-sm text-gray-500">ID: {userData.id}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><strong>Email:</strong> {userData.email || 'Non public'}</p>
              <p><strong>Localisation:</strong> {userData.location || 'Non spécifiée'}</p>
              <p><strong>Entreprise:</strong> {userData.company || 'Non spécifiée'}</p>
              <p><strong>Blog:</strong> {userData.blog || 'Aucun'}</p>
              <p><strong>Twitter:</strong> {userData.twitter_username || 'Non lié'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p><strong>Bio:</strong> {userData.bio || 'Aucune bio'}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userData.public_repos}</div>
              <div className="text-sm text-gray-600">Repositories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userData.followers}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userData.following}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userData.public_gists}</div>
              <div className="text-sm text-gray-600">Gists</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Compte créé: {new Date(userData.created_at).toLocaleDateString('fr-FR')}</p>
            <p>Dernière mise à jour: {new Date(userData.updated_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      )}

      {activeTab === 'repos' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Repositories ({repos.length})</h2>
          {repos.map((repo) => (
            <div key={repo.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {repo.name}
                    </a>
                  </h3>
                  <p className="text-gray-600 mt-1">{repo.description || 'Aucune description'}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    {repo.language && (
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                    <span>📁 {repo.size} KB</span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Mis à jour: {new Date(repo.updated_at).toLocaleDateString('fr-FR')}</p>
                  {repo.private && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Privé</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Activité Récente ({events.length})</h2>
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-3">
                <img
                  src={event.actor.avatar_url}
                  alt={event.actor.login}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <strong>{event.actor.login}</strong> {event.type.replace('Event', '')} sur{' '}
                    <strong>{event.repo.name}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.created_at).toLocaleString('fr-FR')}
                  </p>
                  {event.payload && Object.keys(event.payload).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">Détails</summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Organizations ({organizations.length})</h2>
          {organizations.length === 0 ? (
            <p className="text-gray-500">Aucune organisation trouvée.</p>
          ) : (
            organizations.map((org) => (
              <div key={org.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={org.avatar_url}
                    alt={org.login}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{org.login}</h3>
                    <p className="text-gray-600">{org.description || 'Aucune description'}</p>
                    <p className="text-sm text-gray-500">ID: {org.id}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'social' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Followers ({followers.length})</h2>
            <div className="space-y-2">
              {followers.slice(0, 10).map((follower) => (
                <div key={follower.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={follower.avatar_url}
                      alt={follower.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{follower.login}</p>
                      <p className="text-sm text-gray-500">ID: {follower.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Following ({following.length})</h2>
            <div className="space-y-2">
              {following.slice(0, 10).map((user) => (
                <div key={user.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{user.login}</p>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gists' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Gists ({gists.length})</h2>
          {gists.length === 0 ? (
            <p className="text-gray-500">Aucun gist trouvé.</p>
          ) : (
            gists.map((gist) => (
              <div key={gist.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold">
                  <a href={gist.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {gist.description || 'Gist sans titre'}
                  </a>
                </h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Fichiers: {Object.keys(gist.files).join(', ')}</p>
                  <p>Créé: {new Date(gist.created_at).toLocaleDateString('fr-FR')}</p>
                  <p>Mis à jour: {new Date(gist.updated_at).toLocaleDateString('fr-FR')}</p>
                  <p>{gist.public ? 'Public' : 'Privé'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
