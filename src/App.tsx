import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import RootLayout from '@/layouts/root-layout'
import AuthLayout from '@/layouts/auth-layout'
import ProtectedRoute from '@/components/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/home'))
const ComingSoonPage = lazy(() => import('@/pages/coming-soon'))
const CalculatorPage = lazy(() => import('@/pages/calculator'))
const ProfilePage = lazy(() => import('@/pages/profile'))
const MyAnnouncementsPage = lazy(() => import('@/pages/my-announcements'))
const MastersPage = lazy(() => import('@/pages/masters'))
const MasterDetailsPage = lazy(() => import('@/pages/master-details'))
const AboutPage = lazy(() => import('@/pages/about'))
const ContactPage = lazy(() => import('@/pages/contact'))
const SearchPage = lazy(() => import('@/pages/search'))
const LoginPage = lazy(() => import('@/pages/login'))
const SignupPage = lazy(() => import('@/pages/signup'))
const AuthCallbackPage = lazy(() => import('@/pages/auth-callback'))
const AnnouncementsPage = lazy(() => import('@/pages/announcements'))

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
            path: "my-announcements",
            element: <MyAnnouncementsPage />,
          }
        ]
      },
      {
        path: "masters",
        element: <MastersPage />,
      },
      {
        path: "masters/:id",
        element: <MasterDetailsPage />,
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
        element: <ComingSoonPage />,
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
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
