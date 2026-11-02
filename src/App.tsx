import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'sonner'
import RootLayout from '@/layouts/root-layout'
import AuthLayout from '@/layouts/auth-layout'
import ProtectedRoute from '@/components/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/home'))
const CalculatorPage = lazy(() => import('@/pages/calculator'))
const ProfilePage = lazy(() => import('@/pages/profile'))
const ProfileSettingsPage = lazy(() => import('@/pages/profile-settings'))
const MyAnnouncementsPage = lazy(() => import('@/pages/my-announcements'))
const MyOrdersPage = lazy(() => import('@/pages/my-orders'))
const MyTechniquesPage = lazy(() => import('@/pages/my-techniques'))
const TechniquePage = lazy(() => import('@/pages/technique'))
const TechniqueDetailsPage = lazy(() => import('@/pages/technique-details'))
const NotificationsPage = lazy(() => import('@/pages/notifications'))
const MessagesPage = lazy(() => import('@/pages/messages'))
const MastersPage = lazy(() => import('@/pages/masters'))
const UserDetailsPage = lazy(() => import('@/pages/user-details'))
const BrigadeDetailsPage = lazy(() => import('@/pages/brigade-details'))
const AboutPage = lazy(() => import('@/pages/about'))
const ContactPage = lazy(() => import('@/pages/contact'))
const PrivacyPolicyPage = lazy(() => import('@/pages/privacy-policy'))
const SearchPage = lazy(() => import('@/pages/search'))
const LoginPage = lazy(() => import('@/pages/login'))
const SignupPage = lazy(() => import('@/pages/signup'))
const AuthCallbackPage = lazy(() => import('@/pages/auth-callback'))
const AnnouncementsPage = lazy(() => import('@/pages/announcements'))
const AnnouncementDetailsPage = lazy(() => import('@/pages/announcement-details'))

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "profile/settings",
            element: <ProfileSettingsPage />,
          },
          {
            path: "my-announcements",
            element: <MyAnnouncementsPage />,
          },
          {
            path: "profile/orders",
            element: <MyOrdersPage />,
          },
          {
            path: "profile/techniques",
            element: <MyTechniquesPage />,
          },
          {
            path: "profile/notifications",
            element: <NotificationsPage />,
          },
          {
            path: "messages",
            element: <MessagesPage />,
          },
          {
            path: "messages/:conversationId",
            element: <MessagesPage />,
          },
          {
            // Logged-out visitors only see blurred announcement cards.
            path: "announcements/:id",
            element: <AnnouncementDetailsPage />,
          }
        ]
      },
      {
        path: "masters",
        element: <MastersPage />,
      },
      {
        // Same page as users/:id - kept so existing master links keep working.
        path: "masters/:id",
        element: <UserDetailsPage />,
      },
      {
        path: "users/:id",
        element: <UserDetailsPage />,
      },
      {
        path: "brigades/:id",
        element: <BrigadeDetailsPage />,
      },
      {
        path: "announcements",
        element: <AnnouncementsPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "technique",
        element: <TechniquePage />,
      },
      {
        path: "technique/:id",
        element: <TechniqueDetailsPage />,
      },
      {
        path: "calculator",
        element: <CalculatorPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicyPage />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "signup",
            element: <SignupPage />,
          },
          {
            path: "auth/callback",
            element: <AuthCallbackPage />,
          }
        ]
      }
    ],
  }
])

function App() {
  return (
    <>
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
