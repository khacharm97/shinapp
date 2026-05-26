import { Outlet, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Mail, Phone } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import logo from "@/assets/logo.png"

const FOOTER_PHONE = "+374(93)-23-34-02"
const FOOTER_PHONE_HREF = "tel:+37493233402"
const FOOTER_EMAIL = "shinapp.support@gmail.com"

export default function RootLayout() {
  const { t } = useTranslation()

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

        <main className="flex-1 container mx-auto px-4 md:py-8 py-4 ">
          <Outlet />
        </main>

        <footer className="border-t py-8 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
              <Link to="/" className="flex items-center opacity-70 hover:opacity-100 transition-opacity shrink-0">
                <img src={logo} alt="ShinApp Logo" className="h-6 w-auto object-contain" />
              </Link>

              <div className="text-center sm:text-left space-y-3">
                <h3 className="text-sm font-semibold text-primary">
                  {t("footer_contact")}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                    <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="font-medium text-foreground">{t("footer_phone")}:</span>
                    <a
                      href={FOOTER_PHONE_HREF}
                      className="hover:text-foreground transition-colors"
                    >
                      {FOOTER_PHONE}
                    </a>
                  </li>
                  <li className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                    <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span className="font-medium text-foreground">{t("footer_email")}:</span>
                    <a
                      href={`mailto:${FOOTER_EMAIL}`}
                      className="hover:text-foreground transition-colors break-all"
                    >
                      {FOOTER_EMAIL}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
