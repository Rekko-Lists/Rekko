import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import MainLayout from "@/components/layout/MainLayout";

const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Feed = lazy(() => import("@/pages/Feed"));
const Explore = lazy(() => import("@/pages/Explore"));
const Animes = lazy(() => import("@/pages/Animes"));
const AnimeDetail = lazy(() => import("@/pages/AnimeDetail"));
const AnimePosts = lazy(() => import("@/pages/AnimePosts"));
const PostDetail = lazy(() => import("@/pages/PostDetail"));
const SearchResults = lazy(() => import("@/pages/SearchResults"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const List = lazy(() => import("@/pages/List"));
const Profile = lazy(() => import("@/pages/Profile"));
const Animedle = lazy(() => import("@/pages/Animedle"));
const Settings = lazy(() => import("@/pages/Settings"));
const DiscordCallback = lazy(() => import("@/pages/DiscordCallback"));
const EmailStatusPage = lazy(() => import("@/pages/EmailStatusPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const PasswordChangedPage = lazy(() => import("@/pages/PasswordChangedPage"));
const About = lazy(() => import("@/pages/About"));
const Rules = lazy(() => import("@/pages/Rules"));
const Faq = lazy(() => import("@/pages/Faq"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));

function page(element: ReactNode) {
  return (
    <Suspense fallback={<div className="p-6 text-text-muted">Loading...</div>}>
      {element}
    </Suspense>
  );
}

function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/feed" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", element: page(<Login />) },
  { path: "/register", element: page(<Register />) },
  { path: "/animedle", element: page(<Animedle />) },
  { path: "/oauth/discord/callback", element: page(<DiscordCallback />) },
  { path: "/email-verified", element: page(<EmailStatusPage />) },
  { path: "/email-changed", element: page(<EmailStatusPage />) },
  { path: "/user/resetpassword", element: page(<ResetPasswordPage />) },
  { path: "/password-changed", element: page(<PasswordChangedPage />) },
  { path: "/password-forgot", element: page(<PasswordChangedPage />) },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: "feed", element: page(<Feed />) },
      { path: "explore", element: page(<Explore />) },
      { path: "search", element: page(<SearchResults />) },
      { path: "leaderboard", element: page(<Leaderboard />) },
      { path: "animes", element: page(<Animes />) },
      { path: "animes/:malId", element: page(<AnimeDetail />) },
      { path: "animes/:malId/posts", element: page(<AnimePosts />) },
      { path: "post/:postId", element: page(<PostDetail />) },
      { path: "profile/:username", element: page(<Profile />) },
      { path: "/about", element: page(<About />) },
      { path: "/rules", element: page(<Rules />) },
      { path: "/faq", element: page(<Faq /> )},
      {
        element: <ProtectedRoute />,
        children: [
          { path: "list", element: page(<List />) },
          { path: "settings", element: page(<Settings />) },
        ],
      },
      {
        element: <AdminProtectedRoute />,
        children: [
          { path: "admin", element: page(<AdminPanel />) },
        ],
      },
    ],
  },
]);
