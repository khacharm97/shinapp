import { getImageUrl } from '@/utils';

import { NavLink, Outlet, Link, useNavigate, ScrollRestoration } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Mail, Phone, Menu, User, LogOut, FileText } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { isMaster, isCompany } from "@/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import logo from "@/assets/logo.png"
import logoMini from "@/assets/logo_mini.png"
import { useGetProfileQuery } from "@/store/api/authApi"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { logout, updateUser } from "@/store/slices/authSlice"
import { useEffect, useState } from "react"
import { NotificationsMenu } from "@/components/notifications/NotificationsMenu"

const FOOTER_PHONE = "+374(93)-23-34-02"
const FOOTER_PHONE_HREF = "tel:+37493233402"
const FOOTER_EMAIL = "shinapp.support@gmail.com"

export default function RootLayout() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { token, user: reduxUser } = useAppSelector((state) => state.auth)

  // Fetch user profile only if there is a token (this acts as a fallback or background sync)
  const { data: profile, isSuccess } = useGetProfileQuery(undefined, { skip: !token })

  useEffect(() => {
    if (isSuccess && profile) {
      dispatch(updateUser(profile))
    }
  }, [profile, isSuccess, dispatch])

  useEffect(() => {
    const dir = i18n.language === 'fa' ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  // Combine redux user state with fetched profile (fetched profile takes precedence if loaded)
  const user = reduxUser || profile;

  // We consider them logged in if there's a token
  const isLoggedIn = !!token

  const isMasterUser = isMaster(user?.roles)
  const isCompanyUser = isCompany(user?.roles)
  const isVerified = !!user?.verifiedAt
  const showCompleteProfileBanner = isLoggedIn && (isMasterUser || isCompanyUser) && !isVerified

  const [showNavbar, setShowNavbar] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling down
        setShowNavbar(false)
      } else {
        // Scrolling up or at the top
        setShowNavbar(true)
      }

      lastScrollY = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  const getDesktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 transition-colors hover:text-brand ${isActive ? "text-brand after:scale-x-100" : "text-foreground/80 after:scale-x-0"
    } after:absolute after:-bottom-1 after:start-0 after:h-[2px] after:w-full after:origin-left after:bg-brand after:transition-transform after:duration-300`

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-brand ${isActive ? "text-brand font-semibold" : "text-foreground/80"
    }`

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <header
          className={`border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${showNavbar ? "translate-y-0" : "-translate-y-full"
            }`}
        >
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4 md:gap-10">
              <Link to="/" className="flex items-center">
                <img src={logoMini} width={44} height={56} alt="ShinApp Logo" className="h-8 w-auto object-contain animate-in fade-in duration-500" />
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <NavLink to="/" end className={getDesktopNavLinkClass}>{t("nav_home")}</NavLink>
                <NavLink to="/search" className={getDesktopNavLinkClass}>{t("nav_masters")}</NavLink>
                <NavLink to="/announcements" className={getDesktopNavLinkClass}>{t("nav_announcements", "Announcements")}</NavLink>
                {/* <NavLink to="/technique" className={getDesktopNavLinkClass}>{t("nav_technique")}</NavLink> */}
                <NavLink to="/calculator" className={getDesktopNavLinkClass}>{t("nav_calculator")}</NavLink>
                <NavLink to="/about" className={getDesktopNavLinkClass}>{t("nav_about_us")}</NavLink>
                <NavLink to="/contact" className={getDesktopNavLinkClass}>{t("nav_contact_us", "Contact us")}</NavLink>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <ModeToggle />
              <div className="hidden md:flex items-center gap-2">
                {isLoggedIn && <NotificationsMenu />}
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatarUrl ? getImageUrl(user.avatarUrl) || "" : "/profile.png"} alt={user?.name || "Profile"} className="object-cover" />
                          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-auto min-w-[16rem]" align="end" forceMount>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer flex items-center">
                          <User className="me-2 h-4 w-4" />
                          <span>{user?.name || t("nav_profile", "Profile")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile/orders" className="cursor-pointer flex items-center">
                          <FileText className="me-2 h-4 w-4" />
                          <span>{t("nav_my_orders", "My Orders")}</span>
                        </Link>
                      </DropdownMenuItem>
                      {isCompanyUser && isVerified && (
                        <DropdownMenuItem asChild>
                          <Link to="/my-announcements" className="cursor-pointer flex items-center">
                            <span className="me-2 h-4 w-4">📢</span>
                            <span>{t("nav_my_announcements", "My Announcements")}</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                        <LogOut className="me-2 h-4 w-4" />
                        <span>{t("nav_logout", "Log out")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/login">{t("nav_login")}</Link>
                    </Button>
                    <Button className="bg-brand text-brand-foreground hover:bg-brand/90" asChild>
                      <Link to="/signup">{t("nav_signup")}</Link>
                    </Button>
                  </>
                )}
              </div>
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="flex flex-col p-6 sm:max-w-xs">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex items-center gap-3 mb-8 mt-2 border-b pb-6">
                      <img src={logoMini} width={44} height={56} alt="ShinApp Logo" className="h-8 w-auto object-contain" />
                      <span className="font-bold text-xl tracking-tight">ShinApp</span>
                    </div>
                    <nav className="flex flex-col gap-6 text-base font-medium flex-1 overflow-y-auto">
                      <NavLink to="/" end className={getMobileNavLinkClass}>{t("nav_home")}</NavLink>
                      <NavLink to="/search" className={getMobileNavLinkClass}>{t("nav_masters")}</NavLink>
                      <NavLink to="/announcements" className={getMobileNavLinkClass}>{t("nav_announcements", "Announcements")}</NavLink>
                      {/* <NavLink to="/technique" className={getMobileNavLinkClass}>{t("nav_technique")}</NavLink> */}
                      <NavLink to="/calculator" className={getMobileNavLinkClass}>{t("nav_calculator")}</NavLink>
                      <NavLink to="/about" className={getMobileNavLinkClass}>{t("nav_about_us")}</NavLink>
                      <NavLink to="/contact" className={getMobileNavLinkClass}>{t("nav_contact_us", "Contact us")}</NavLink>
                    </nav>
                    
                    {isLoggedIn && <NotificationsMenu isMobile={true} />}

                    <div className="mt-auto flex flex-col gap-2 pt-6 border-t pb-2">
                      {isLoggedIn ? (
                        <>
                          <Button variant="outline" size="sm" asChild className="w-full justify-start">
                            <Link to="/profile"><User className="me-2 h-4 w-4" /> {user?.name || t("nav_profile", "Profile")}</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="w-full justify-start">
                            <Link to="/profile/orders"><FileText className="me-2 h-4 w-4" /> {t("nav_my_orders", "My Orders")}</Link>
                          </Button>
                          {isCompanyUser && isVerified && (
                            <Button variant="outline" size="sm" asChild className="w-full justify-start">
                              <Link to="/my-announcements"><span className="me-2 h-4 w-4">📢</span> {t("nav_my_announcements", "My Announcements")}</Link>
                            </Button>
                          )}
                          <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full justify-start">
                            <LogOut className="me-2 h-4 w-4" /> {t("nav_logout", "Log out")}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <Link to="/login">{t("nav_login")}</Link>
                          </Button>
                          <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90 w-full" asChild>
                            <Link to="/signup">{t("nav_signup")}</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </header>
        {showCompleteProfileBanner && (
          <div className="bg-orange-100 border-b border-orange-200 py-3 px-4 flex justify-between flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-top-2">
            <div className="text-orange-800 font-medium text-sm">
              {t("banner_complete_profile_text", "Please complete your profile to start receiving orders")}
            </div>
            <Button size="sm" asChild className="bg-orange-500 hover:bg-orange-600 text-white shrink-0">
              <Link to="/profile">{t("banner_complete_profile_button", "Complete Profile")}</Link>
            </Button>
          </div>
        )}
        <main className="flex-1 w-full flex flex-col">
          <Outlet />
        </main>
        <ScrollRestoration />

        <footer className="border-t py-8 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
              <Link to="/" className="flex items-center opacity-70 hover:opacity-100 transition-opacity shrink-0">
                <img src={logo} width={125} height={42} alt="ShinApp Logo" className="h-6 w-auto object-contain" />
              </Link>

              <div className="text-center sm:text-start space-y-3">
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
