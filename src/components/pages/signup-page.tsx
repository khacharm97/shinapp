import { SEO } from '@/components/seo'
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Briefcase, UserCheck, X, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRegisterMutation } from "@/store/api/authApi"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/store/slices/authSlice"

export default function SignupPageContent() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'master' | 'customer' | 'company' | null>(null)
  
  // RTK Query hook
  const [register, { isLoading, isError, error }] = useRegisterMutation()

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (password !== confirmPassword) {
      setValidationError(t("auth_error_passwords_mismatch", "Passwords do not match."))
      return
    }
    
    try {
      const response = await register({
        name,
        email, 
        phone,
        password,
        role: selectedRole
      }).unwrap()

      console.log("Registration successful:", response)
      if (response.access_token) {
        dispatch(setCredentials({ token: response.access_token, user: response.user }))

        try {
          const payload = JSON.parse(atob(response.access_token.split('.')[1]))
          if (payload.roles && (payload.roles.includes('MASTER') || payload.roles.includes('COMPANY'))) {
            navigate("/profile")
            return
          }
        } catch (e) {
          console.error("Failed to parse JWT payload:", e)
        }

        navigate("/")
      }
    } catch (err) {
      console.error("Registration failed:", err)
      // Additional error handling can be done here
    }
  }

  return (
    <>
      <SEO title={t('signup', 'Sign Up')} />
      <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-brand mb-2">
            {t("welcome", "Welcome to ShinApp")}
          </h1>
          <p className="text-foreground/70 text-lg">
            {t("auth_signup_subtitle", "Create your account")}
            {selectedRole && (
              <span className="ms-2 text-sm px-2 py-1 bg-brand/10 text-brand rounded-full">
                {selectedRole === 'master' ? t("role_master", "Es masnaget em.") : selectedRole === 'company' ? t("role_company", "Es ynkerutyun em.") : t("role_customer", "Es hachaxord em.")}
              </span>
            )}
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSignupSubmit}>
          {isError && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm font-medium">
              {t((error as { data?: { message?: string } })?.data?.message || "auth_error", "An error occurred during registration.")}
            </div>
          )}
          {validationError && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm font-medium">
              {validationError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground/80 font-medium">
              {selectedRole === 'company' 
                ? t("profile_company_name", "Company Name")
                : t("auth_name_label", "Full Name")}
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="h-12 border-gray-300 dark:border-border dark:bg-background focus-visible:ring-brand"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80 font-medium">
              {t("auth_email_label_only", "Email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="h-12 border-gray-300 dark:border-border dark:bg-background focus-visible:ring-brand"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground/80 font-medium">
              {t("auth_phone_label", "Phone Number")}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+374 __ __ __ __"
              className="h-12 border-gray-300 dark:border-border dark:bg-background focus-visible:ring-brand"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground/80 font-medium">
              {t("auth_password_label", "Password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 border-gray-300 dark:border-border dark:bg-background focus-visible:ring-brand pe-10"
                required
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground/80 font-medium">
              {t("auth_confirm_password_label", "Confirm Password")}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 border-gray-300 dark:border-border dark:bg-background focus-visible:ring-brand pe-10"
                required
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 my-2">
            <Checkbox id="terms" className="border-gray-400 data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground" required />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/80"
            >
              {t("auth_agree_terms", "I agree to the terms and conditions")}
            </label>
          </div>

          <Button disabled={isLoading} type="submit" className="w-full h-12 bg-brand hover:bg-brand/90 text-brand-foreground text-lg font-semibold rounded-md transition-colors mt-2">
            {isLoading ? t("loading", "Loading...") : t("nav_signup", "Sign up")}
          </Button>
        </form>

        <div className="mt-8 mb-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-gray-400 font-medium">
              {t("auth_instant_signup", "Instant Sign up")}
            </span>
          </div>
        </div>

        <Button variant="outline" asChild className="w-full h-12 border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-zinc-900 flex items-center justify-center gap-3 font-medium text-foreground">
          <a href={`${import.meta.env.VITE_BACK_URL || 'http://localhost:3000'}/auth/google${selectedRole ? `?role=${selectedRole}` : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            {t("auth_continue_google", "Continue with Google")}
          </a>
        </Button>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {t("auth_have_account", "Already have an account?")}{" "}
          </span>
          <Link to="/login" className="text-brand font-bold hover:underline transition-all">
            {t("nav_login", "Log in")}
          </Link>
        </div>
      </div>

      {selectedRole === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">

          {/* Close button (Navigates back if they cancel signup) */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 end-6 sm:top-8 sm:end-12 flex items-center gap-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative flex flex-col sm:flex-row gap-6 p-6 max-w-3xl w-full justify-center items-center animate-in zoom-in-95 duration-300">
            {/* Master Option */}
            <button
              onClick={() => setSelectedRole('master')}
              className="bg-white dark:bg-card dark:text-foreground rounded-xl shadow-xl w-full max-w-[280px] aspect-video flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform duration-300 group"
            >
              <Briefcase className="w-12 h-12 text-brand group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              <span className="text-xl font-medium text-gray-900 dark:text-foreground">{t("role_master", "Es masnaget em.")}</span>
            </button>

            {/* Customer Option */}
            <button
              onClick={() => setSelectedRole('customer')}
              className="bg-white dark:bg-card dark:text-foreground rounded-xl shadow-xl w-full max-w-[280px] aspect-video flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform duration-300 group"
            >
              <UserCheck className="w-12 h-12 text-brand group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              <span className="text-xl font-medium text-gray-900 dark:text-foreground">{t("role_customer", "Es hachaxord em.")}</span>
            </button>

            {/* Company Option */}
            <button
              onClick={() => setSelectedRole('company')}
              className="bg-white dark:bg-card dark:text-foreground rounded-xl shadow-xl w-full max-w-[280px] aspect-video flex flex-col items-center justify-center gap-4 hover:scale-105 transition-transform duration-300 group"
            >
              <Building2 className="w-12 h-12 text-brand group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
              <span className="text-xl font-medium text-gray-900 dark:text-foreground">{t("role_company", "Es ynkerutyun em.")}</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
