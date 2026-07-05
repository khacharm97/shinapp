import { useTranslation } from 'react-i18next'
import {
  Target, Rocket, CheckCircle, ShieldCheck,
  Eye, Award, Globe, Users, Briefcase,
  Wrench, Building, Truck, UserCheck,
  Compass, MapPin, Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="w-full min-h-screen bg-background text-foreground animate-in fade-in duration-700">

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-background to-blue-500/10 -z-10" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand/20 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />

        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-brand text-center">
            {t('about_title')}
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground/80 mt-4">
            {t('about_subtitle')}
          </h2>
          <div className="mt-8 space-y-4 text-lg md:text-xl text-muted-foreground leading-relaxed">
            <p>{t('about_desc_1')}</p>
            <p>{t('about_desc_2')}</p>
            <p className="font-semibold text-foreground">{t('about_desc_3')}</p>
            <p>{t('about_desc_4')}</p>
          </div>
        </div>
      </section>

      {/* Our Goal Section */}
      <section className="px-4 py-16 md:py-24 bg-card/50 border-y border-border">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl text-orange-500">
                <Target className="w-10 h-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">{t('about_goal_title')}</h2>
            </div>
            <p className="text-lg text-muted-foreground">{t('about_goal_1')}</p>
            <p className="text-lg text-muted-foreground">{t('about_goal_2')}</p>
            <p className="text-lg text-muted-foreground">{t('about_goal_3')}</p>
          </div>
        </div>
      </section>

      {/* What ShinApp Offers */}
      <section className="px-4 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="mb-16 max-w-3xl mx-auto flex flex-col">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('about_offers_title')}</h2>
          <p className="text-xl text-muted-foreground">{t('about_offers_desc_1')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: UserCheck, text: t('about_offers_list_1'), color: "text-blue-500 bg-blue-500/10" },
            { icon: Users, text: t('about_offers_list_2'), color: "text-emerald-500 bg-emerald-500/10" },
            { icon: Compass, text: t('about_offers_list_3'), color: "text-purple-500 bg-purple-500/10" },
            { icon: Truck, text: t('about_offers_list_4'), color: "text-amber-500 bg-amber-500/10" },
            { icon: Briefcase, text: t('about_offers_list_5'), color: "text-rose-500 bg-rose-500/10" },
            { icon: Star, text: t('about_offers_list_6'), color: "text-yellow-500 bg-yellow-500/10" },
            { icon: CheckCircle, text: t('about_offers_list_7'), color: "text-indigo-500 bg-indigo-500/10" },
            { icon: MapPin, text: t('about_offers_list_8'), color: "text-cyan-500 bg-cyan-500/10" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-2xl hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-md">
              <div className={`p-4 rounded-full mb-4 ${item.color}`}>
                <item.icon className="w-8 h-8" />
              </div>
              <p className="font-medium text-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-2xl font-semibold text-brand">{t('about_offers_desc_2')}</p>
        </div>
      </section>

      {/* Our Values */}
      <section className="px-4 py-16 md:py-24 bg-brand/5 dark:bg-brand/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">{t('about_values_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <ShieldCheck className="w-10 h-10 text-brand" />
                <CardTitle className="text-2xl">{t('about_values_1_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t('about_values_1_desc')}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Eye className="w-10 h-10 text-brand" />
                <CardTitle className="text-2xl">{t('about_values_2_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t('about_values_2_desc')}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Award className="w-10 h-10 text-brand" />
                <CardTitle className="text-2xl">{t('about_values_3_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t('about_values_3_desc')}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-background/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Globe className="w-10 h-10 text-brand" />
                <CardTitle className="text-2xl">{t('about_values_4_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t('about_values_4_desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who is ShinApp for? */}
      <section className="px-4 py-16 md:py-24 max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">{t('about_audience_title')}</h2>
        <p className="text-xl text-center text-muted-foreground mb-16">{t('about_audience_desc')}</p>

        <div className="space-y-6">
          {[
            { title: t('about_audience_1_title'), desc: t('about_audience_1_desc'), icon: UserCheck, color: "bg-blue-500" },
            { title: t('about_audience_2_title'), desc: t('about_audience_2_desc'), icon: Wrench, color: "bg-orange-500" },
            { title: t('about_audience_3_title'), desc: t('about_audience_3_desc'), icon: Users, color: "bg-purple-500" },
            { title: t('about_audience_4_title'), desc: t('about_audience_4_desc'), icon: Building, color: "bg-emerald-500" },
            { title: t('about_audience_5_title'), desc: t('about_audience_5_desc'), icon: Truck, color: "bg-amber-500" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 items-start md:items-center p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-xl text-white ${item.color}`}>
                <item.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="px-4 py-16 md:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-8">
              <Eye className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-6">{t('about_vision_title')}</h2>
            <div className="space-y-4 text-lg text-foreground/80">
              <p>{t('about_vision_1')}</p>
              <p>{t('about_vision_2')}</p>
              <p>{t('about_vision_3')}</p>
            </div>
          </div>

          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-bl from-brand/10 to-emerald-500/10 border border-brand/20">
            <div className="w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center mb-8">
              <Rocket className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-6">{t('about_mission_title')}</h2>
            <div className="space-y-4 text-lg text-foreground/80">
              <p>{t('about_mission_1')}</p>
              <p>{t('about_mission_2')}</p>
              <p>{t('about_mission_3')}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
