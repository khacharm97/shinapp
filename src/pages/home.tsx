import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import homeBanner from '@/assets/home_bunner.png'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-start w-full flex-1">
      {/* Hero Section */}
      <div
        className="relative w-full min-h-[700px] bg-cover bg-center flex items-center justify-center animate-in fade-in duration-1000"
        style={{ backgroundImage: `url(${homeBanner})` }}
      >
        <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-[1100px] p-8 md:p-14 rounded-[2rem] bg-background/60 backdrop-blur-md shadow-2xl border border-border/40 text-center mx-4 my-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 bg-transparent">

          <h1 className="text-5xl md:text-[84px] font-semibold leading-tight mb-12 tracking-tight">
            <span className="text-brand">Home </span>
            <span className="text-foreground">improvment, </span><br />
            <span className="text-foreground">made </span>
            <span className="text-brand">easy.</span>
          </h1>

          {/* Badges container */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-3 border border-white/80 rounded-full px-5 py-2.5 bg-transparent hover:bg-white/10 transition-colors text-white">
              <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#6823F1' }} />
              <span className="text-sm font-semibold">{t('badge_reliable_specialists')}</span>
            </div>
            <div className="flex items-center gap-3 border border-white/80 rounded-full px-5 py-2.5 bg-transparent hover:bg-white/10 transition-colors text-white">
              <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#F17C23' }} />
              <span className="text-sm font-semibold">{t('badge_reliable_platform')}</span>
            </div>
            <div className="flex items-center gap-3 border border-white/80 rounded-full px-5 py-2.5 bg-transparent hover:bg-white/10 transition-colors text-white">
              <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#0900FF' }} />
              <span className="text-sm font-semibold">{t('badge_wide_selection')}</span>
            </div>
            <div className="flex items-center gap-3 border border-white/80 rounded-full px-5 py-2.5 bg-transparent hover:bg-white/10 transition-colors text-white">
              <div className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#F14623' }} />
              <span className="text-sm font-semibold">{t('badge_fast_decision')}</span>
            </div>
          </div>

          {/* Search Input and Button */}
          <div className="flex w-full max-w-3xl mx-auto bg-white p-1.5 rounded-xl shadow-lg items-center">
            <input 
              type="text" 
              placeholder={t('search_placeholder')} 
              className="flex-1 h-12 bg-transparent border-none px-4 text-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
            <Button className="h-12 px-8 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 text-base font-semibold shrink-0">
              {t('search_button')}
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
