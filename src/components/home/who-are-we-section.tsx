import { useTranslation } from 'react-i18next'

export function WhoAreWeSection() {
  const { t } = useTranslation()

  return (
    <section className="w-full mx-auto px-4 md:px-20 py-8 md:py-24 text-start">
      <h2 className="text-3xl md:text-5xl font-bold text-brand mb-8">
        {t('who_are_we_title')}
      </h2>
      <div className="space-y-6 text-base md:text-lg text-foreground/80 w-full leading-relaxed">
        <div className='flex flex-col line-height-'>
          <p>{t('who_are_we_desc_1')}</p>
          <p>{t('who_are_we_desc_2')}</p>
          <p>{t('who_are_we_desc_3')}</p>
        </div>
        <div>
          <p className='text-gray-400 dark:text-gray-400 font-medium'>{t('who_are_we_desc_1')}</p>
          <p className='text-gray-400 dark:text-gray-400 font-medium'>
          {t('who_are_we_desc_2')}
        </p>
        </div>
      </div>
    </section>
  )
}
