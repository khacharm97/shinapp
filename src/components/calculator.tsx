import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { insertContactRequest } from '@/lib/contact-requests'

const backendUrl = import.meta.env.VITE_BACK_URL || 'http://localhost:3000';
const apiUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const formSchema = z.object({
  repair: z.string().optional(),
  material: z.string().optional(),
  date: z.string().optional(),

  walls_painting: z.boolean().default(false),
  walls_painting_area: z.coerce.number().optional().default(0),
  walls_wallpaper: z.boolean().default(false),
  walls_wallpaper_area: z.coerce.number().optional().default(0),
  walls_plaster: z.boolean().default(false),
  walls_plaster_area: z.coerce.number().optional().default(0),
  walls_decorative: z.boolean().default(false),
  walls_decorative_area: z.coerce.number().optional().default(0),

  floor_laminate: z.boolean().default(false),
  floor_laminate_area: z.coerce.number().optional().default(0),
  floor_tile: z.boolean().default(false),
  floor_tile_area: z.coerce.number().optional().default(0),
  floor_parquet: z.boolean().default(false),
  floor_parquet_area: z.coerce.number().optional().default(0),
  floor_dismantling: z.boolean().default(false),
  floor_dismantling_area: z.coerce.number().optional().default(0),

  ceiling_paint: z.boolean().default(false),
  ceiling_paint_area: z.coerce.number().optional().default(0),
  ceiling_drywall: z.boolean().default(false),
  ceiling_drywall_area: z.coerce.number().optional().default(0),
  ceiling_stretch: z.boolean().default(false),
  ceiling_stretch_area: z.coerce.number().optional().default(0),

  elec_wiring: z.boolean().default(false),
  elec_sockets: z.boolean().default(false),
  elec_sockets_count: z.coerce.number().optional().default(0),
  elec_lighting: z.boolean().default(false),
  elec_lighting_count: z.coerce.number().optional().default(0),

  plumb_pipes: z.boolean().default(false),
  plumb_bathroom: z.boolean().default(false),
  plumb_fixtures: z.boolean().default(false),
  plumb_fixtures_count: z.coerce.number().optional().default(0),

  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
})

export function Calculator() {
  const { t, i18n } = useTranslation()
  const [estimatedCost, setEstimatedCost] = useState<[number, number] | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      repair: "cosmetic",
      material: "standard",
      date: "ordinary",
      walls_painting: false, walls_painting_area: 0,
      walls_wallpaper: false, walls_wallpaper_area: 0,
      walls_plaster: false, walls_plaster_area: 0,
      walls_decorative: false, walls_decorative_area: 0,
      floor_laminate: false, floor_laminate_area: 0,
      floor_tile: false, floor_tile_area: 0,
      floor_parquet: false, floor_parquet_area: 0,
      floor_dismantling: false, floor_dismantling_area: 0,
      ceiling_paint: false, ceiling_paint_area: 0,
      ceiling_drywall: false, ceiling_drywall_area: 0,
      ceiling_stretch: false, ceiling_stretch_area: 0,
      elec_wiring: false,
      elec_sockets: false, elec_sockets_count: 0,
      elec_lighting: false, elec_lighting_count: 0,
      plumb_pipes: false,
      plumb_bathroom: false,
      plumb_fixtures: false, plumb_fixtures_count: 0,
      firstName: "",
      lastName: "",
      email: "",
    },
  })

  const [submitMode, setSubmitMode] = useState<'basic' | 'email' | null>(null)
  const [activeFormSection, setActiveFormSection] = useState<'email' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'success' | 'error' | null>(null)

  // We rely on onSubmit to ignore area/count values if their respective checkboxes are unchecked,
  // which prevents infinite render loops from form.setValue in a useEffect.

  function onBasicSubmit(e: React.MouseEvent) {
    e.preventDefault()
    setActiveFormSection(null)
    setSubmitMode('basic')
    setEmailStatus(null)
    form.handleSubmit(onSubmit)()
  }

  function onEmailSubmit(e: React.MouseEvent) {
    e.preventDefault()
    setActiveFormSection('email')
    setSubmitMode(null)
    setEmailStatus(null)
  }


  const generateEstimateReport = (values: z.infer<typeof formSchema>) => {
    let baseCostMin = 0
    let baseCostMax = 0
    let colService = 'Service'
    let colQty = 'Quantity / Area'
    let colMin = 'Min Cost'
    let colMax = 'Max Cost'

    if (i18n.language === 'ru') {
      colService = 'Услуга'
      colQty = 'Количество / Площадь'
      colMin = 'Мин. цена'
      colMax = 'Макс. цена'
    } else if (i18n.language === 'am') {
      colService = 'Ծառայություն'
      colQty = 'Քանակ / Մակերես'
      colMin = 'Նվազ. արժեք'
      colMax = 'Առավ. արժեք'
    }

    const items: Array<Record<string, string | number>> = []

    const addItem = (name: string, qty: number | string, min: number, max: number) => {
      items.push({ [colService]: name, [colQty]: qty, [colMin]: min, [colMax]: max })
    }

    // Walls
    if (values.walls_painting) {
      const min = values.walls_painting_area * 2000; const max = values.walls_painting_area * 8000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_walls_painting'), values.walls_painting_area, min, max)
    }
    if (values.walls_wallpaper) {
      const min = values.walls_wallpaper_area * 3000; const max = values.walls_wallpaper_area * 5000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_walls_wallpaper'), values.walls_wallpaper_area, min, max)
    }
    if (values.walls_plaster) {
      const min = values.walls_plaster_area * 1500; const max = values.walls_plaster_area * 3000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_walls_plaster'), values.walls_plaster_area, min, max)
    }
    if (values.walls_decorative) {
      const min = values.walls_decorative_area * 4000; const max = values.walls_decorative_area * 6000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_walls_decorative'), values.walls_decorative_area, min, max)
    }

    // Floor
    if (values.floor_laminate) {
      const min = values.floor_laminate_area * 2000; const max = values.floor_laminate_area * 3500;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_floor_laminate'), values.floor_laminate_area, min, max)
    }
    if (values.floor_tile) {
      const min = values.floor_tile_area * 4500; const max = values.floor_tile_area * 7000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_floor_tile'), values.floor_tile_area, min, max)
    }
    if (values.floor_parquet) {
      const min = values.floor_parquet_area * 5000; const max = values.floor_parquet_area * 8000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_floor_parquet'), values.floor_parquet_area, min, max)
    }
    if (values.floor_dismantling) {
      const min = values.floor_dismantling_area * 800; const max = values.floor_dismantling_area * 2000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_floor_dismantling'), values.floor_dismantling_area, min, max)
    }

    // Ceiling
    if (values.ceiling_paint) {
      const min = values.ceiling_paint_area * 2000; const max = values.ceiling_paint_area * 8000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_ceiling_paint'), values.ceiling_paint_area, min, max)
    }
    if (values.ceiling_drywall) {
      const min = values.ceiling_drywall_area * 2000; const max = values.ceiling_drywall_area * 5000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_ceiling_drywall'), values.ceiling_drywall_area, min, max)
    }
    if (values.ceiling_stretch) {
      const min = values.ceiling_stretch_area * 5000; const max = values.ceiling_stretch_area * 8000;
      baseCostMin += min; baseCostMax += max;
      addItem(t('calc_ceiling_stretch'), values.ceiling_stretch_area, min, max)
    }

    // Electricity
    let elecMin = 0, elecMax = 0
    if (values.elec_wiring) { const min = 100000; const max = 200000; elecMin += min; elecMax += max; addItem(t('calc_elec_wiring'), "1", min, max) }
    if (values.elec_sockets) { const min = values.elec_sockets_count * 2500; const max = values.elec_sockets_count * 5000; elecMin += min; elecMax += max; addItem(t('calc_elec_sockets'), values.elec_sockets_count, min, max) }
    if (values.elec_lighting) { const min = values.elec_lighting_count * 3000; const max = values.elec_lighting_count * 6000; elecMin += min; elecMax += max; addItem(t('calc_elec_lighting'), values.elec_lighting_count, min, max) }

    // Plumbing
    let plumbMin = 0, plumbMax = 0
    if (values.plumb_pipes) { const min = 60000; const max = 100000; plumbMin += min; plumbMax += max; addItem(t('calc_plumb_pipes'), "1", min, max) }
    if (values.plumb_bathroom) { const min = 120000; const max = 200000; plumbMin += min; plumbMax += max; addItem(t('calc_plumb_bathroom'), "1", min, max) }
    if (values.plumb_fixtures) { const min = values.plumb_fixtures_count * 5000; const max = values.plumb_fixtures_count * 12000; plumbMin += min; plumbMax += max; addItem(t('calc_plumb_fixtures'), values.plumb_fixtures_count, min, max) }

    // Multipliers
    const repairMults: Record<string, number> = { cosmetic: 1, average: 1.25, capital: 1.6 }
    const repairMult = repairMults[values.repair || "cosmetic"] || 1

    const materialMults: Record<string, number> = { econom: 0.8, standard: 1, premium: 1.4 }
    const materialMult = materialMults[values.material || "standard"] || 1

    const dateMults: Record<string, number> = { urgent: 1.1, ordinary: 1, not_important: 0.9 }
    const dateMult = dateMults[values.date || "ordinary"] || 1

    const combinedMult = repairMult * materialMult * dateMult

    const totalMinBase = baseCostMin + elecMin + plumbMin
    const totalMaxBase = baseCostMax + elecMax + plumbMax

    const totalMin = totalMinBase * combinedMult
    const totalMax = totalMaxBase * combinedMult

    if (combinedMult !== 1) {
      items.push({ [colService]: '---', [colQty]: '---', [colMin]: '---', [colMax]: '---' })
      items.push({ [colService]: t('calc_multipliers', 'Multipliers factor'), [colQty]: '-', [colMin]: combinedMult.toFixed(2), [colMax]: combinedMult.toFixed(2) })
    }

    items.push({ [colService]: '---', [colQty]: '---', [colMin]: '---', [colMax]: '---' })
    items.push({ [colService]: t('calc_result', 'Total Estimation'), [colQty]: '-', [colMin]: Math.round(totalMin), [colMax]: Math.round(totalMax) })

    return {
      items,
      totalMin: Math.round(totalMin),
      totalMax: Math.round(totalMax)
    }
  }

  async function onSecondarySubmit(e: React.MouseEvent) {
    e.preventDefault()

    const firstNameValue = form.getValues('firstName')?.trim() ?? ''
    const lastNameValue = form.getValues('lastName')?.trim() ?? ''
    const emailValue = form.getValues('email')
    let hasError = false

    if (!firstNameValue) {
      form.setError('firstName', { type: 'manual', message: t('calc_error_required') })
      hasError = true
    }
    if (!lastNameValue) {
      form.setError('lastName', { type: 'manual', message: t('calc_error_required') })
      hasError = true
    }

    if (!emailValue || !emailValue.includes('@')) {
      form.setError('email', { type: 'manual', message: t('calc_error_required') })
      hasError = true
    }

    if (hasError) return

    const email = (emailValue ?? '').trim()
    const values = form.getValues()

    if (activeFormSection === 'email') {
      setIsSubmitting(true)
      setEmailStatus(null)
      try {
        const { error: insertError } = await insertContactRequest({
          email,
          notes: '',
          first_name: firstNameValue,
          last_name: lastNameValue,
          contact: false,
        })
        if (insertError) throw insertError

        const { items } = generateEstimateReport(values)
        const messageParts = [
        ].filter(Boolean)

        let colService = 'Service'
        let colQty = 'Quantity / Area'
        let colMin = 'Min Cost'
        let colMax = 'Max Cost'

        if (i18n.language === 'ru') {
          colService = 'Услуга'
          colQty = 'Количество / Площадь'
          colMin = 'Мин. цена'
          colMax = 'Макс. цена'
        } else if (i18n.language === 'am') {
          colService = 'Ծառայություն'
          colQty = 'Քանակ / Մակերես'
          colMin = 'Նվազ. արժեք'
          colMax = 'Առավ. արժեք'
        }

        const payload = {
          recipients: [email],
          subject: t('calc_email_subject', 'Your Repair Estimate from ShinApp'),
          message: messageParts.join('\n\n'),
          firstName: firstNameValue,
          lastName: lastNameValue,
          columns: [colService, colQty, colMin, colMax],
          rows: items,
          lang: i18n.language
        }

        const response = await fetch(`${apiUrl}/contact-requests/email/estimate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          console.error('Error invoking backend email function:', await response.text())
          setEmailStatus('error')
        } else {
          setEmailStatus('success')
        }

        setSubmitMode(activeFormSection)
        form.handleSubmit(onSubmit)()
      } catch (err) {
        console.error('Error submitting to Supabase:', err)
        setEmailStatus('error')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setSubmitMode(activeFormSection)
      form.handleSubmit(onSubmit)()
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { totalMin, totalMax } = generateEstimateReport(values)
    setEstimatedCost([totalMin, totalMax])
  }

  const renderCheckable = (id: keyof z.infer<typeof formSchema>, langKey: string, inputId?: keyof z.infer<typeof formSchema>, isCount?: boolean, overrideLabelKey?: string) => {
    const isChecked = form.watch(id)

    return (
      <div key={id} className="mb-2">
        <FormField control={form.control} name={id as any} render={({ field }) => (
          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value as boolean} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="font-normal cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t(langKey)}
            </FormLabel>
          </FormItem>
        )} />
        {isChecked && inputId && (
          <div className="pl-7 pt-2 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <FormField control={form.control} name={inputId as any} render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5 mt-1">
                <FormLabel className="text-sm text-muted-foreground font-medium w-full">
                  {overrideLabelKey ? t(overrideLabelKey) : `${t(langKey)} ${t(isCount ? "calc_count_input" : "calc_area_input").toLowerCase()}`}
                </FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="any" placeholder="" {...field} value={field.value || ""} className="h-8 w-full shadow-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg text-left">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('calc_title')}</CardTitle>
        <CardDescription>{t('calc_desc')}</CardDescription>
      </CardHeader>
      <CardContent className="md:px-6 px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Construction Works (Checkboxes) */}

              <div className="space-y-6">
                <Accordion type="multiple" className="w-full space-y-4">
                  <AccordionItem value="walls" className="bg-muted/30 px-5 rounded-lg border last:border-b pb-0">
                    <AccordionTrigger className="text-base font-semibold text-primary hover:no-underline">{t('calc_walls')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("walls_painting", "calc_walls_painting", "walls_painting_area", false, "calc_wall_area_label")}
                      {renderCheckable("walls_wallpaper", "calc_walls_wallpaper", "walls_wallpaper_area", false, "calc_wall_area_label")}
                      {renderCheckable("walls_plaster", "calc_walls_plaster", "walls_plaster_area", false, "calc_wall_area_label")}
                      {renderCheckable("walls_decorative", "calc_walls_decorative", "walls_decorative_area", false, "calc_wall_area_label")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="floor" className="bg-muted/30 px-5 rounded-lg border last:border-b pb-0">
                    <AccordionTrigger className="text-base font-semibold text-primary hover:no-underline">{t('calc_floor')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("floor_laminate", "calc_floor_laminate", "floor_laminate_area", false, "calc_floor_area_label")}
                      {renderCheckable("floor_tile", "calc_floor_tile", "floor_tile_area", false, "calc_floor_area_label")}
                      {renderCheckable("floor_parquet", "calc_floor_parquet", "floor_parquet_area", false, "calc_floor_area_label")}
                      {renderCheckable("floor_dismantling", "calc_floor_dismantling", "floor_dismantling_area", false, "calc_floor_area_label")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ceiling" className="bg-muted/30 px-5 rounded-lg border last:border-b pb-0">
                    <AccordionTrigger className="text-base font-semibold text-primary hover:no-underline">{t('calc_ceiling')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("ceiling_paint", "calc_ceiling_paint", "ceiling_paint_area", false, "calc_ceiling_area_label")}
                      {renderCheckable("ceiling_drywall", "calc_ceiling_drywall", "ceiling_drywall_area", false, "calc_ceiling_area_label")}
                      {renderCheckable("ceiling_stretch", "calc_ceiling_stretch", "ceiling_stretch_area", false, "calc_ceiling_area_label")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="electricity" className="bg-muted/30 px-5 rounded-lg border last:border-b pb-0">
                    <AccordionTrigger className="text-base font-semibold text-primary hover:no-underline">{t('calc_electricity')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("elec_wiring", "calc_elec_wiring")}
                      {renderCheckable("elec_sockets", "calc_elec_sockets", "elec_sockets_count", true, "calc_electricity_count_label")}
                      {renderCheckable("elec_lighting", "calc_elec_lighting", "elec_lighting_count", true, "calc_electricity_count_label")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="plumbing" className="bg-muted/30 px-5 rounded-lg border last:border-b pb-0">
                    <AccordionTrigger className="text-base font-semibold text-primary hover:no-underline">{t('calc_plumbing')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("plumb_pipes", "calc_plumb_pipes")}
                      {renderCheckable("plumb_bathroom", "calc_plumb_bathroom")}
                      {renderCheckable("plumb_fixtures", "calc_plumb_fixtures", "plumb_fixtures_count", true, "calc_plumbing_count_label")}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Multipliers & General Settings */}
              <div className="space-y-6">
                <div className="bg-muted/10 px-5 py-3 rounded-lg border h-full space-y-8">
                  <FormField control={form.control} name="repair" render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-base font-semibold text-primary">{t('calc_repair')}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="cosmetic" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_repair_cosmetic')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="average" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_repair_average')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="capital" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_repair_capital')}</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="material" render={({ field }) => (
                    <FormItem className="space-y-4 pt-4 border-t">
                      <FormLabel className="text-base font-semibold text-primary">{t('calc_material_class')}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="econom" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_material_econom')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="standard" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_material_standard')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="premium" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_material_premium')}</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem className="space-y-4 pt-4 border-t">
                      <FormLabel className="text-base font-semibold text-primary">{t('calc_date')}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-2">
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="urgent" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_date_urgent')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="ordinary" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_date_ordinary')}</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="not_important" /></FormControl>
                            <FormLabel className="font-normal">{t('calc_date_not_important')}</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <Button type="button" onClick={onBasicSubmit} size="lg" variant="outline" className="w-full text-base shadow-sm hover:shadow-md transition-all">
                {t('calc_submit_basic')}
              </Button>
              <Button type="button" onClick={onEmailSubmit} size="lg" variant="outline" className="w-full text-base shadow-sm hover:shadow-md transition-all">
                {t('calc_submit_email')}
              </Button>
            </div>

            {activeFormSection && (
              <div className="mt-8 p-6 bg-muted/20 border border-primary/20 rounded-xl space-y-6 animate-in fade-in slide-in-from-top-4">
                <h4 className="font-semibold text-xl text-primary">
                  {t('calc_submit_email')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('calc_first_name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('calc_first_name_placeholder')} autoComplete="given-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('calc_last_name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('calc_last_name_placeholder')} autoComplete="family-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('calc_email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('calc_email_placeholder')} type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={onSecondarySubmit} disabled={isSubmitting} size="lg" variant="brand" className="w-full text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('calc_send')}
                </Button>
              </div>
            )}
          </form>
        </Form>


        {submitMode === 'email' && estimatedCost !== null && emailStatus === 'success' && (
          <div className="mt-8 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center animate-in fade-in duration-300">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {t('calc_email_success', { email: form.getValues('email') })}
            </p>
          </div>
        )}

        {submitMode === 'email' && estimatedCost !== null && emailStatus === 'error' && (
          <div className="mt-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center animate-in fade-in duration-300">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {t('calc_email_error', { email: form.getValues('email') })}
            </p>
          </div>
        )}

        {(submitMode === 'basic' || submitMode === 'email') && estimatedCost !== null && (
          <div className="mt-8 p-8 rounded-xl bg-white dark:bg-primary/10 border border-zinc-100 dark:border-primary/20 text-center animate-in fade-in zoom-in duration-500 shadow-xl dark:shadow-inner">
            <p className="text-sm font-semibold text-zinc-500 dark:text-muted-foreground mb-3">
              {t('calc_result')}
            </p>
            <p className="text-4xl md:text-5xl font-extrabold text-brand flex items-center justify-center gap-2">
              <span>֏</span> {estimatedCost[0].toLocaleString()} - {estimatedCost[1].toLocaleString()}
            </p>
            <p className="text-xs text-zinc-400 dark:text-muted-foreground mt-4 opacity-80 dark:opacity-70">
              * {t('calc_result_disclaimer')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
