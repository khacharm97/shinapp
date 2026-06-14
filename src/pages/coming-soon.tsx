import { useTranslation } from 'react-i18next'

export default function ComingSoonPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-in fade-in zoom-in duration-500">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 text-primary">
        {t('coming_soon_title')}
      </h1>
      <p className="text-lg text-muted-foreground">
        {t('coming_soon_desc')}
      </p>
    </div>
  )
}
