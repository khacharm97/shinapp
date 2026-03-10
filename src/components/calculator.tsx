import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

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
import { Textarea } from '@/components/ui/textarea'
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

  email: z.string().optional(),
  notes: z.string().optional(),
})

export function Calculator() {
  const { t } = useTranslation()
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
      notes: "",
      email: "",
    },
  })

  const [submitMode, setSubmitMode] = useState<'basic' | 'email' | 'contact' | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // We rely on onSubmit to ignore area/count values if their respective checkboxes are unchecked,
  // which prevents infinite render loops from form.setValue in a useEffect.

  function onBasicSubmit(e: React.MouseEvent) {
    e.preventDefault()
    setShowEmailForm(false)
    setSubmitMode('basic')
    form.handleSubmit(onSubmit)()
  }

  function onEmailSubmit(e: React.MouseEvent) {
    e.preventDefault()
    setShowEmailForm(true)
    setSubmitMode(null)
  }

  function onFinalEmailSubmit(e: React.MouseEvent) {
    e.preventDefault()
    setSubmitMode('email')
    
    // Manually trigger validation for email if they want to send it
    const emailValue = form.getValues('email')
    if (!emailValue || !emailValue.includes('@')) {
      form.setError('email', { type: 'manual', message: t('calc_error_required') })
      return
    }

    form.handleSubmit(onSubmit)()
  }

  function onContactSubmit(e: React.MouseEvent) {
    e.preventDefault()
    setShowEmailForm(false)
    setSubmitMode('contact')
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    let baseCostMin = 0
    let baseCostMax = 0

    // Walls
    if (values.walls_painting) { baseCostMin += values.walls_painting_area * 2000; baseCostMax += values.walls_painting_area * 8000; }
    if (values.walls_wallpaper) { baseCostMin += values.walls_wallpaper_area * 3000; baseCostMax += values.walls_wallpaper_area * 5000; }
    if (values.walls_plaster) { baseCostMin += values.walls_plaster_area * 1500; baseCostMax += values.walls_plaster_area * 3000; }
    if (values.walls_decorative) { baseCostMin += values.walls_decorative_area * 4000; baseCostMax += values.walls_decorative_area * 6000; }

    // Floor
    if (values.floor_laminate) { baseCostMin += values.floor_laminate_area * 2000; baseCostMax += values.floor_laminate_area * 3500; }
    if (values.floor_tile) { baseCostMin += values.floor_tile_area * 4500; baseCostMax += values.floor_tile_area * 7000; }
    if (values.floor_parquet) { baseCostMin += values.floor_parquet_area * 5000; baseCostMax += values.floor_parquet_area * 8000; }
    if (values.floor_dismantling) { baseCostMin += values.floor_dismantling_area * 800; baseCostMax += values.floor_dismantling_area * 2000; }

    // Ceiling
    if (values.ceiling_paint) { baseCostMin += values.ceiling_paint_area * 2000; baseCostMax += values.ceiling_paint_area * 8000; }
    if (values.ceiling_drywall) { baseCostMin += values.ceiling_drywall_area * 2000; baseCostMax += values.ceiling_drywall_area * 5000; }
    if (values.ceiling_stretch) { baseCostMin += values.ceiling_stretch_area * 5000; baseCostMax += values.ceiling_stretch_area * 8000; }

    // Electricity fixed / varied costs
    let elecMin = 0, elecMax = 0
    if (values.elec_wiring) { elecMin += 100000; elecMax += 200000; }
    if (values.elec_sockets) { elecMin += values.elec_sockets_count * 2500; elecMax += values.elec_sockets_count * 5000; }
    if (values.elec_lighting) { elecMin += values.elec_lighting_count * 3000; elecMax += values.elec_lighting_count * 6000; }

    // Plumbing fixed / varied costs
    let plumbMin = 0, plumbMax = 0
    if (values.plumb_pipes) { plumbMin += 60000; plumbMax += 100000; }
    if (values.plumb_bathroom) { plumbMin += 120000; plumbMax += 200000; }
    if (values.plumb_fixtures) { plumbMin += values.plumb_fixtures_count * 5000; plumbMax += values.plumb_fixtures_count * 12000; }

    // Repair multiplier
    const repairMults: Record<string, number> = { cosmetic: 1, average: 1.25, capital: 1.6 }
    const repairMult = repairMults[values.repair || "cosmetic"] || 1

    // Material multiplier
    const materialMults: Record<string, number> = { econom: 0.8, standard: 1, premium: 1.4 }
    const materialMult = materialMults[values.material || "standard"] || 1

    // Date multiplier
    const dateMults: Record<string, number> = { urgent: 1.1, ordinary: 1, not_important: 0.9 }
    const dateMult = dateMults[values.date || "ordinary"] || 1

    const combinedMult = repairMult * materialMult * dateMult

    const totalMin = (baseCostMin + elecMin + plumbMin) * combinedMult
    const totalMax = (baseCostMax + elecMax + plumbMax) * combinedMult
    
    setEstimatedCost([Math.round(totalMin), Math.round(totalMax)])
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
            <FormLabel className="font-normal cursor-pointer text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                  <Input type="number" min="0" step="any" placeholder="" {...field} value={field.value || ""} className="h-8 w-full shadow-sm" />
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
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Construction Works (Checkboxes) */}
              
              <div className="space-y-6">
                <Accordion type="multiple" className="w-full space-y-4">
                  <AccordionItem value="walls" className="bg-muted/30 px-5 rounded-lg border border-b pb-0">
                    <AccordionTrigger className="font-semibold text-primary hover:no-underline">{t('calc_walls')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("walls_painting", "calc_walls_painting", "walls_painting_area", false, "calc_wall_area_label")}
                      {renderCheckable("walls_wallpaper", "calc_walls_wallpaper", "walls_wallpaper_area", false, "calc_wall_area_label")}
                      {renderCheckable("walls_plaster", "calc_walls_plaster", "walls_plaster_area", false, "calc_wall_area_label")}
                      {renderCheckable("walls_decorative", "calc_walls_decorative", "walls_decorative_area", false, "calc_wall_area_label")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="floor" className="bg-muted/30 px-5 rounded-lg border border-b pb-0">
                    <AccordionTrigger className="font-semibold text-primary hover:no-underline">{t('calc_floor')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("floor_laminate", "calc_floor_laminate", "floor_laminate_area", false, "calc_floor_area_label")}
                      {renderCheckable("floor_tile", "calc_floor_tile", "floor_tile_area", false, "calc_floor_area_label")}
                      {renderCheckable("floor_parquet", "calc_floor_parquet", "floor_parquet_area", false, "calc_floor_area_label")}
                      {renderCheckable("floor_dismantling", "calc_floor_dismantling", "floor_dismantling_area", false, "calc_floor_area_label")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ceiling" className="bg-muted/30 px-5 rounded-lg border border-b pb-0">
                    <AccordionTrigger className="font-semibold text-primary hover:no-underline">{t('calc_ceiling')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("ceiling_paint", "calc_ceiling_paint", "ceiling_paint_area", false, "calc_ceiling_area_label")}
                      {renderCheckable("ceiling_drywall", "calc_ceiling_drywall", "ceiling_drywall_area", false, "calc_ceiling_area_label")}
                      {renderCheckable("ceiling_stretch", "calc_ceiling_stretch", "ceiling_stretch_area", false, "calc_ceiling_area_label")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="electricity" className="bg-muted/30 px-5 rounded-lg border border-b pb-0">
                    <AccordionTrigger className="font-semibold text-primary hover:no-underline">{t('calc_electricity')}</AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-4 pt-2 border-t">
                      {renderCheckable("elec_wiring", "calc_elec_wiring")}
                      {renderCheckable("elec_sockets", "calc_elec_sockets", "elec_sockets_count", true, "calc_electricity_count_label")}
                      {renderCheckable("elec_lighting", "calc_elec_lighting", "elec_lighting_count", true, "calc_electricity_count_label")}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="plumbing" className="bg-muted/30 px-5 rounded-lg border border-b pb-0">
                    <AccordionTrigger className="font-semibold text-primary hover:no-underline">{t('calc_plumbing')}</AccordionTrigger>
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
                <div className="bg-muted/10 p-5 rounded-lg border h-full space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Button type="button" onClick={onBasicSubmit} size="lg" variant="outline" className="w-full text-base shadow-sm hover:shadow-md transition-all">
                {t('calc_submit_basic')}
              </Button>
              <Button type="button" onClick={onEmailSubmit} size="lg" variant={showEmailForm ? "default" : "secondary"} className="w-full text-base shadow-md hover:shadow-lg transition-all hidden md:flex">
                {t('calc_submit_email')}
              </Button>
              <Button type="button" onClick={onContactSubmit} size="lg" variant={submitMode === "contact" ? "default" : "secondary"} className="w-full text-base shadow-sm hover:shadow-md transition-all">
                {t('calc_submit_contact')}
              </Button>
              {/* Mobile-only email button to keep layout balanced if it wraps */}
              <Button type="button" onClick={onEmailSubmit} size="lg" variant={showEmailForm ? "default" : "secondary"} className="w-full text-base shadow-md hover:shadow-lg transition-all flex md:hidden">
                {t('calc_submit_email')}
              </Button>
            </div>

            {showEmailForm && (
              <div className="mt-8 p-6 bg-muted/20 border border-primary/20 rounded-xl space-y-6 animate-in fade-in slide-in-from-top-4">
                <h4 className="font-semibold text-xl text-primary">{t('calc_submit_email')}</h4>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('calc_email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('calc_email_placeholder')} type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('calc_notes')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('calc_notes_placeholder')} className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="button" onClick={onFinalEmailSubmit} size="lg" className="w-full text-base shadow-md hover:shadow-lg transition-all">
                  {t('calc_send')}
                </Button>
              </div>
            )}
          </form>
        </Form>

        {submitMode === 'contact' && (
          <div className="mt-8 p-6 rounded-xl bg-secondary/30 border border-secondary text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="text-lg font-medium text-foreground">
              {t('calc_contact_info').split('|').map((part, index) => (
                <div key={index}>
                  <span className="block sm:inline sm:mr-4 last:mr-0">{part.trim()}</span>
                </div>
              ))}
            </p>
          </div>
        )}

        {submitMode === 'email' && estimatedCost !== null && (
          <div className="mt-8 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center animate-in fade-in duration-300">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Simulation: Estimate would be sent to {form.getValues('email')} along with notes.
            </p>
          </div>
        )}

        {(submitMode === 'basic' || submitMode === 'email') && estimatedCost !== null && (
          <div className="mt-8 p-8 rounded-xl bg-primary/10 border border-primary/20 text-center animate-in fade-in zoom-in duration-500 shadow-inner">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {t('calc_result')}
            </p>
            <p className="text-4xl md:text-5xl font-extrabold text-primary flex items-center justify-center gap-2">
              <span className="opacity-80">֏</span> {estimatedCost[0].toLocaleString()} - {estimatedCost[1].toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-4 opacity-70">
              * This is a rough estimation and may vary based on specific conditions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
