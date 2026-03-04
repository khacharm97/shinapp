import { useState, useEffect } from 'react'
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

  // We rely on onSubmit to ignore area/count values if their respective checkboxes are unchecked,
  // which prevents infinite render loops from form.setValue in a useEffect.

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

  const renderCheckable = (id: keyof z.infer<typeof formSchema>, langKey: string, inputId?: keyof z.infer<typeof formSchema>, isCount?: boolean) => {
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
              <FormItem className="flex items-center gap-3">
                <FormLabel className="text-sm text-muted-foreground whitespace-nowrap min-w-[70px]">
                  {isCount ? t("calc_count_input") : t("calc_area_input")}:
                </FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="any" placeholder="0" {...field} className="h-8 max-w-[120px] shadow-sm" />
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
                <div className="bg-muted/30 p-5 rounded-lg border">
                  <h4 className="font-semibold mb-4 text-primary border-b pb-2">{t('calc_walls')}</h4>
                  <div className="space-y-1">
                    {renderCheckable("walls_painting", "calc_walls_painting", "walls_painting_area")}
                    {renderCheckable("walls_wallpaper", "calc_walls_wallpaper", "walls_wallpaper_area")}
                    {renderCheckable("walls_plaster", "calc_walls_plaster", "walls_plaster_area")}
                    {renderCheckable("walls_decorative", "calc_walls_decorative", "walls_decorative_area")}
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg border">
                  <h4 className="font-semibold mb-4 text-primary border-b pb-2">{t('calc_floor')}</h4>
                  <div className="space-y-1">
                    {renderCheckable("floor_laminate", "calc_floor_laminate", "floor_laminate_area")}
                    {renderCheckable("floor_tile", "calc_floor_tile", "floor_tile_area")}
                    {renderCheckable("floor_parquet", "calc_floor_parquet", "floor_parquet_area")}
                    {renderCheckable("floor_dismantling", "calc_floor_dismantling", "floor_dismantling_area")}
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg border">
                  <h4 className="font-semibold mb-4 text-primary border-b pb-2">{t('calc_ceiling')}</h4>
                  <div className="space-y-1">
                    {renderCheckable("ceiling_paint", "calc_ceiling_paint", "ceiling_paint_area")}
                    {renderCheckable("ceiling_drywall", "calc_ceiling_drywall", "ceiling_drywall_area")}
                    {renderCheckable("ceiling_stretch", "calc_ceiling_stretch", "ceiling_stretch_area")}
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg border">
                  <h4 className="font-semibold mb-4 text-primary border-b pb-2">{t('calc_electricity')}</h4>
                  <div className="space-y-1">
                    {renderCheckable("elec_wiring", "calc_elec_wiring")}
                    {renderCheckable("elec_sockets", "calc_elec_sockets", "elec_sockets_count", true)}
                    {renderCheckable("elec_lighting", "calc_elec_lighting", "elec_lighting_count", true)}
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-lg border">
                  <h4 className="font-semibold mb-4 text-primary border-b pb-2">{t('calc_plumbing')}</h4>
                  <div className="space-y-1">
                    {renderCheckable("plumb_pipes", "calc_plumb_pipes")}
                    {renderCheckable("plumb_bathroom", "calc_plumb_bathroom")}
                    {renderCheckable("plumb_fixtures", "calc_plumb_fixtures", "plumb_fixtures_count", true)}
                  </div>
                </div>
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

                  <div className="space-y-6 pt-4 border-t">
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
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg mt-8 shadow-md hover:shadow-lg transition-all">
              {t('calc_submit')}
            </Button>
          </form>
        </Form>

        {estimatedCost !== null && (
          <div className="mt-12 p-8 rounded-xl bg-primary/10 border border-primary/20 text-center animate-in fade-in zoom-in duration-500 shadow-inner">
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
