import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from '@/layouts/root-layout'
import HomePage from '@/pages/home'
import ComingSoonPage from '@/pages/coming-soon'
import CalculatorPage from '@/pages/calculator'

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
        path: "login",
        element: <ComingSoonPage />,
      },
      {
        path: "signup",
        element: <ComingSoonPage />,
      }
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
