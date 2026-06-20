import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useLoginMutation } from "@/store/api/authApi"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/store/slices/authSlice"

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Form state
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')

  // RTK Query hook
  const [login, { isLoading, error }] = useLoginMutation()

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasError(false)
    
    try {
      const response = await login({ identifier, password }).unwrap()
      if (response.access_token) {
        dispatch(setCredentials({ token: response.access_token, user: response.user }))
        
        navigate("/")
      }
    } catch (err) {
      console.error("Login failed:", err)
      setHasError(true)
    }
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-brand mb-2">
          {t("welcome_back", "Welcome back!")}
        </h1>
        <p className="text-foreground/70 text-lg">
          {t("auth_login_subtitle", "Please enter your details")}
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleLoginSubmit}>
        {hasError && (
          <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm font-medium">
            {(error as any)?.data?.message || t("auth_error_invalid_credentials", "Invalid email/phone or password.")}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground/80 font-medium">
            {t("auth_email_label", "Email or Phone")}
          </Label>
          <Input 
            id="email" 
            type="text" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="example@gmail.com" 
            className={`h-12 border-gray-300 focus-visible:ring-brand ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
              className={`h-12 border-gray-300 focus-visible:ring-brand pr-10 ${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between my-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" className="border-gray-400 data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/80"
            >
              {t("auth_remember", "Remember me")}
            </label>
          </div>
          <Link to="/forgot-password" className="text-sm font-semibold text-brand hover:underline transition-all">
            {t("auth_forgot_password", "Forgot password?")}
          </Link>
        </div>

        <Button disabled={isLoading} type="submit" className="w-full h-12 bg-brand hover:bg-brand/90 text-brand-foreground text-lg font-semibold rounded-md transition-colors mt-2">
          {isLoading ? t("loading", "Loading...") : t("nav_login", "Log in")}
        </Button>
      </form>

      <div className="mt-8 mb-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-gray-400 font-medium">
            {t("auth_instant_login", "Instant Login")}
          </span>
        </div>
      </div>

      <Button variant="outline" asChild className="w-full h-12 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 font-medium text-foreground">
        <a href="http://localhost:3000/auth/google">
          {/* Simple Google SVG icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          {t("auth_continue_google", "Continue with Google")}
        </a>
      </Button>

      <div className="mt-8 text-center text-sm">
        <span className="text-gray-500">
          {t("auth_no_account", "Don't have an account?")}{" "}
        </span>
        <Link to="/signup" className="text-brand font-bold hover:underline transition-all">
          {t("nav_signup", "Sign up.")}
        </Link>
      </div>
    </div>
  )
}
