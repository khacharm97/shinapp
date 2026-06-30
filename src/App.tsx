import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from '@/layouts/root-layout'
import HomePage from '@/pages/home'
import ComingSoonPage from '@/pages/coming-soon'
import CalculatorPage from '@/pages/calculator'
import ProfilePage from '@/pages/profile'
import MastersPage from '@/pages/masters'
import MasterDetailsPage from '@/pages/master-details'
import AboutPage from '@/pages/about'
import SearchPage from '@/pages/search'
import ProtectedRoute from '@/components/ProtectedRoute'

import AuthLayout from '@/layouts/auth-layout'
import LoginPage from '@/pages/login'
import SignupPage from '@/pages/signup'
import AuthCallbackPage from '@/pages/auth-callback'

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
  return <RouterProvider router={router} />
}

export default App
