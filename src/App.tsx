import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { Button } from '@/components/ui/button'

function App() {
  const { t } = useTranslation()
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <a href="/" className="flex items-center">
                <img src="/logo-light.png" alt="ShinApp Logo" className="h-8 dark:hidden" />
                <img src="/logo-dark.png" alt="ShinApp Logo" className="h-8 hidden dark:block" />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <ModeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-primary animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {t('welcome')}
            </h2>
            
            <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
              {t('get_started')}
            </p>

            <div className="pt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <Button 
                onClick={() => setCount((count) => count + 1)}
                size="lg"
                className="font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Count is {count}
              </Button>
            </div>
          </div>
        </main>

        <footer className="border-t py-6">
          <div className="container mx-auto flex items-center justify-center px-4">
            <a href="/" className="flex items-center opacity-70 hover:opacity-100 transition-opacity">
              <img src="/logo-light.png" alt="ShinApp Logo" className="h-6 dark:hidden" />
              <img src="/logo-dark.png" alt="ShinApp Logo" className="h-6 hidden dark:block" />
            </a>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App
