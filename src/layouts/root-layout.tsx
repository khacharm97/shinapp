import { Outlet, Link } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import logo from "@/assets/logo.png"

export default function RootLayout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="ShinApp Logo" className="h-8 w-auto object-contain animate-in fade-in duration-500" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <ModeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
          <Outlet />
        </main>

        <footer className="border-t py-6">
          <div className="container mx-auto flex items-center justify-center px-4">
            <Link to="/" className="flex items-center opacity-70 hover:opacity-100 transition-opacity">
              <img src={logo} alt="ShinApp Logo" className="h-6 w-auto object-contain" />
            </Link>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
