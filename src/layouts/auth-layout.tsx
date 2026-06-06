import { Outlet, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import homeBanner from "@/assets/home_bunner.png"

export default function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex-1 flex w-full relative bg-cover bg-center font-sans text-foreground" style={{ backgroundImage: `url(${homeBanner})` }}>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col lg:flex-row w-full items-center justify-center lg:justify-between p-8 gap-8">
        {/* Left side: Text overlay */}
        <div className="hidden lg:flex flex-col flex-1 text-white h-full justify-end pb-12">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">
            {t("auth_banner_title", "Find your sweet home")}
          </h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-xl">
            {t("auth_banner_desc", "Research and brainstorm. Think about your background, education, awards, skills and other attributes that you developed or earned throughout your career or education.")}
          </p>
        </div>

        {/* Right side: Auth Form */}
        <div className="w-full max-w-md bg-background p-8 rounded-2xl shadow-2xl shrink-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
