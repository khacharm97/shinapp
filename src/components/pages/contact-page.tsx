import { SEO } from '@/components/seo'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Mail, MessageSquare, User } from 'lucide-react'
import { useInsertContactRequestMutation, useSendContactEmailMutation } from '@/store/api/publicApi'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  notes: z.string().min(1, "Message is required"),
})

export default function ContactPageContent() {
  const { t, i18n } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [insertContactRequest] = useInsertContactRequestMutation()
  const [sendContactEmail] = useSendContactEmailMutation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await insertContactRequest({
        email: values.email,
        notes: values.notes,
        firstName: values.firstName,
        lastName: values.lastName,
        contact: true,
      }).unwrap()

      const payload = {
        recipients: [values.email],
        firstName: values.firstName,
        lastName: values.lastName,
        lang: i18n.language
      }

      await sendContactEmail(payload).unwrap()
      setSubmitStatus('success')
      form.reset()
    } catch (err) {
      console.error('Error submitting to backend:', err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-14rem)] bg-background text-foreground animate-in fade-in duration-700 pb-20">
      <SEO title={t('contact_us_title')} />
      <div className="w-full max-w-2xl mx-auto space-y-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
            {t('nav_contact_us', 'Contact Us')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('contact_desc', 'We would love to hear from you. Fill out the form below and we will get back to you as soon as possible.')}
          </p>
        </div>

        <div className="bg-card shadow-2xl rounded-3xl p-8 md:p-10 border border-primary/10 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 end-0 -me-16 -mt-16 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 -ms-16 -mb-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-semibold">{t('calc_first_name', 'First Name')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute start-3 top-2.5 h-5 w-5 text-muted-foreground/50" />
                          <Input className="ps-10 h-12 bg-background/50 focus-visible:bg-background transition-colors" placeholder={t('calc_first_name_placeholder', 'John')} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 font-semibold">{t('calc_last_name', 'Last Name')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute start-3 top-2.5 h-5 w-5 text-muted-foreground/50" />
                          <Input className="ps-10 h-12 bg-background/50 focus-visible:bg-background transition-colors" placeholder={t('calc_last_name_placeholder', 'Doe')} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-semibold">{t('calc_email', 'Email Address')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute start-3 top-2.5 h-5 w-5 text-muted-foreground/50" />
                        <Input className="ps-10 h-12 bg-background/50 focus-visible:bg-background transition-colors" type="email" placeholder={t('calc_email_placeholder', 'john.doe@example.com')} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 font-semibold">{t('calc_notes', 'Your Message')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MessageSquare className="absolute start-3 top-3 h-5 w-5 text-muted-foreground/50" />
                        <Textarea 
                          className="ps-10 min-h-[150px] resize-none bg-background/50 focus-visible:bg-background transition-colors" 
                          placeholder={t('calc_contact_notes_placeholder', 'How can we help you?')} 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="me-2 h-5 w-5 animate-spin" />
                      {t('calc_send_contact', 'Sending...')}
                    </>
                  ) : (
                    t('calc_send_contact', 'Send Message')
                  )}
                </Button>

                {submitStatus === 'success' && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center animate-in fade-in zoom-in duration-300">
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      {t('calc_contact_success', 'Your message has been sent successfully. We will get back to you soon!')}
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center animate-in fade-in zoom-in duration-300">
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      {t('calc_contact_error', 'There was an error sending your message. Please try again.')}
                    </p>
                  </div>
                )}

              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
