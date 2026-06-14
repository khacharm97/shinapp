import { useTranslation } from 'react-i18next'
import { BadgePercent } from 'lucide-react'

export function WhyTrustUsSection() {
  const { t } = useTranslation()

  const features = [
    {
      id: 1,
      title: "Husali hartak",
      description: "We combine all the services you need in one simple platform – from home maintenance and personal care to computer repairs, gardening, and much more.",
      icon: <BadgePercent className="w-8 h-8" />,
      colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      id: 2,
      title: "Vstaheli masnagetner",
      description: "We combine all the services you need in one simple platform – from home maintenance and personal care to computer repairs, gardening, and much more.",
      icon: <BadgePercent className="w-8 h-8" />,
      colorClass: "bg-orange-100 text-[#F17C23] dark:bg-orange-900/30 dark:text-[#F17C23]"
    },
    {
      id: 3,
      title: "Arag ognutyun",
      description: "We combine all the services you need in one simple platform – from home maintenance and personal care to computer repairs, gardening, and much more.",
      icon: <BadgePercent className="w-8 h-8" />,
      colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
    }
  ]

  return (
    <section className="w-full max-w-[1740px] mx-auto px-4 md:px-20 py-8 md:py-16 text-start">
      <h2 className="text-3xl md:text-5xl font-bold text-brand mb-12">
        {t('why_trust_us_title', 'Why trust us?')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 xl:gap-12 gap-6">
        {features.map((feature) => (
          <div 
            key={feature.id} 
            className="bg-[#FAFAFA] dark:bg-card p-8 rounded-2xl flex flex-col items-center text-center border border-transparent dark:border-border transition-transform hover:-translate-y-1 duration-300"
          >
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${feature.colorClass}`}>
              {feature.icon}
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              {feature.title}
            </h3>
            <p className="text-sm md:text-base text-foreground/60 leading-relaxed max-w-[90%] mx-auto">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
