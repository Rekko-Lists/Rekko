export interface StaticSeoPage {
  title: string;
  description: string;
  path: string;
  schemaType?: string;
  image?: string;
  noindex?: boolean;
}

export const seoPages: Record<string, StaticSeoPage> = {
  feed: {
    title: "Anime Community Feed",
    description:
      "Read the latest anime recommendations, discussions, news, and community posts on Rekko.",
    path: "/feed",
    schemaType: "CollectionPage",
  },
  explore: {
    title: "Explore Anime",
    description:
      "Explore seasonal anime, popular shows, weekly airing schedules, and community recommendations on Rekko.",
    path: "/explore",
    schemaType: "CollectionPage",
  },
  animes: {
    title: "Anime Catalogue",
    description:
      "Browse, filter, and discover anime by ranking, season, genre, type, and status on Rekko.",
    path: "/animes",
    schemaType: "CollectionPage",
  },
  leaderboard: {
    title: "Rekko Leaderboard",
    description:
      "See the Rekko community reputation leaderboard and top anime fans.",
    path: "/leaderboard",
    schemaType: "CollectionPage",
  },
  list: {
    title: "My Anime List",
    description:
      "Track anime status, progress, and scores in your personal Rekko list.",
    path: "/list",
    schemaType: "CollectionPage",
    noindex: true,
  },
  animedle: {
    title: "Animedle",
    description: "Play Animedle, Rekko's anime guessing game.",
    path: "/animedle",
    schemaType: "Game",
  },
  search: {
    title: "Search",
    description: "Search Rekko for anime, users, and community posts.",
    path: "/search",
    schemaType: "SearchResultsPage",
  },
  login: {
    title: "Login",
    description: "Log in to Rekko to save anime, like posts, and manage your list.",
    path: "/login",
  },
  register: {
    title: "Sign Up",
    description:
      "Create a Rekko account to track anime, share recommendations, and join the community.",
    path: "/register",
  },
  settings: {
    title: "Settings",
    description:
      "Manage your Rekko account settings, profile, email, and social links.",
    path: "/settings",
    noindex: true,
  },
  discordCallback: {
    title: "Discord Login",
    description: "Connecting your Discord account to Rekko.",
    path: "/oauth/discord/callback",
    noindex: true,
  },
  emailStatus: {
    title: "Email Status",
    description: "Email confirmation status for your Rekko account.",
    path: "/email-verified",
    noindex: true,
  },
};
