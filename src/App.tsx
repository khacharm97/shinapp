import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from '@/layouts/root-layout'
import HomePage from '@/pages/home'
import ComingSoonPage from '@/pages/coming-soon'
import CalculatorPage from '@/pages/calculator'
import ProfilePage from '@/pages/profile'

import AuthLayout from '@/layouts/auth-layout'
import LoginPage from '@/pages/login'
import SignupPage from '@/pages/signup'

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
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "masters",
        element: <ComingSoonPage />,
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
        element: <ComingSoonPage />,
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
