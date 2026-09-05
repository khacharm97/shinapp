import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { SEO } from '@/components/seo'

const CONTACT_EMAIL = "shinapp.support@gmail.com"
const CONTACT_PHONE = "+374(93)-23-34-02"
const CONTACT_PHONE_HREF = "tel:+37493233402"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPolicyPageContent() {
  const { t } = useTranslation()

  return (
    <div className="w-full min-h-screen bg-background text-foreground animate-in fade-in duration-700">
      <SEO title={t('privacy_title', 'Privacy Policy')} />

      <section className="relative px-4 py-16 md:py-20 overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-background to-blue-500/10 -z-10" />
        <div className="p-4 bg-brand/10 rounded-2xl text-brand mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-brand">
          {t('privacy_title', 'Privacy Policy')}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('privacy_last_updated', 'Last updated: September 6, 2026')}
        </p>
      </section>

      <div className="px-4 pb-20 max-w-3xl mx-auto space-y-10">
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>{t('privacy_intro_1')}</p>
          <p>{t('privacy_intro_2')}</p>
        </div>

        <Section title={t('privacy_section_collect_title', 'Information We Collect')}>
          <p>{t('privacy_collect_intro')}</p>

          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{t('privacy_collect_account_title')}</h3>
            <p>{t('privacy_collect_account_desc')}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{t('privacy_collect_profile_title')}</h3>
            <p>{t('privacy_collect_profile_desc')}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{t('privacy_collect_content_title')}</h3>
            <p>{t('privacy_collect_content_desc')}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{t('privacy_collect_technical_title')}</h3>
            <p>{t('privacy_collect_technical_desc')}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{t('privacy_collect_cookies_title')}</h3>
            <p>{t('privacy_collect_cookies_desc')}</p>
          </div>
        </Section>

        <Section title={t('privacy_section_use_title', 'How We Use Your Information')}>
          <ul className="list-disc ps-5 space-y-2">
            <li>{t('privacy_use_1')}</li>
            <li>{t('privacy_use_2')}</li>
            <li>{t('privacy_use_3')}</li>
            <li>{t('privacy_use_4')}</li>
            <li>{t('privacy_use_5')}</li>
            <li>{t('privacy_use_6')}</li>
          </ul>
        </Section>

        <Section title={t('privacy_section_sharing_title', 'How We Share Your Information')}>
          <p>{t('privacy_sharing_intro')}</p>
          <ul className="list-disc ps-5 space-y-2">
            <li>{t('privacy_sharing_1')}</li>
            <li>{t('privacy_sharing_2')}</li>
            <li>{t('privacy_sharing_3')}</li>
            <li>{t('privacy_sharing_4')}</li>
          </ul>
        </Section>

        <Section title={t('privacy_section_retention_title', 'Data Retention')}>
          <p>{t('privacy_retention_desc')}</p>
        </Section>

        <Section title={t('privacy_section_security_title', 'Data Security')}>
          <p>{t('privacy_security_desc')}</p>
        </Section>

        <Section title={t('privacy_section_rights_title', 'Your Rights')}>
          <p>{t('privacy_rights_intro')}</p>
          <ul className="list-disc ps-5 space-y-2">
            <li>{t('privacy_rights_1')}</li>
            <li>{t('privacy_rights_2')}</li>
            <li>{t('privacy_rights_3')}</li>
            <li>{t('privacy_rights_4')}</li>
          </ul>
          <p>{t('privacy_rights_contact')}</p>
        </Section>

        <Section title={t('privacy_section_children_title', "Children's Privacy")}>
          <p>{t('privacy_children_desc')}</p>
        </Section>

        <Section title={t('privacy_section_changes_title', 'Changes to This Policy')}>
          <p>{t('privacy_changes_desc')}</p>
        </Section>

        <Section title={t('privacy_section_contact_title', 'Contact Us')}>
          <p>{t('privacy_contact_desc')}</p>
          <div className="flex flex-col gap-1">
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand font-medium hover:underline w-fit">
              {CONTACT_EMAIL}
            </a>
            <a href={CONTACT_PHONE_HREF} className="text-brand font-medium hover:underline w-fit" dir="ltr">
              {CONTACT_PHONE}
            </a>
          </div>
        </Section>
      </div>
    </div>
  )
}
