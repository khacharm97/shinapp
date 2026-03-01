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
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const formSchema = z.object({
  area: z.coerce.number().min(1, { message: "Positive area required" }),
  height: z.coerce.number().min(1, { message: "Positive height required" }),
  rooms: z.coerce.number().min(1, { message: "Positive rooms required" }),
  repair: z.string().min(1, { message: "Required" }),
  walls: z.string().min(1, { message: "Required" }),
  floor: z.string().min(1, { message: "Required" }),
  ceiling: z.string().min(1, { message: "Required" }),
  electricity: z.string().min(1, { message: "Required" }),
  electricity_sockets_count: z.coerce.number().optional().default(0),
  electricity_lighting_count: z.coerce.number().optional().default(0),
  plumbing: z.string().min(1, { message: "Required" }),
  plumbing_fixtures_count: z.coerce.number().optional().default(0),
  material: z.string().min(1, { message: "Required" }),
  date: z.string().min(1, { message: "Required" }),
  notes: z.string().optional(),
  email: z.string().optional(),
})

export function Calculator() {
  const { t } = useTranslation()
  const [estimatedCost, setEstimatedCost] = useState<[number, number] | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      area: 0,
      height: 0,
      rooms: 0,
      repair: "",
      walls: "",
      floor: "",
      ceiling: "",
      electricity: "",
      electricity_sockets_count: 0,
      electricity_lighting_count: 0,
      plumbing: "",
      plumbing_fixtures_count: 0,
      material: "",
      date: "",
      notes: "",
      email: "",
    },
  })

  // Watch fields for conditional inputs
  const electricityType = form.watch("electricity")
  const plumbingType = form.watch("plumbing")

  // Reset conditional fields when hidden to avoid invisible data
  useEffect(() => {
    if (electricityType !== 'sockets') form.setValue('electricity_sockets_count', 0)
    if (electricityType !== 'lighting') form.setValue('electricity_lighting_count', 0)
  }, [electricityType, form])

  useEffect(() => {
    if (plumbingType !== 'fixtures') form.setValue('plumbing_fixtures_count', 0)
  }, [plumbingType, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Wall costs
    const wallCosts: Record<string, [number, number]> = {
      painting: [2000, 8000],
      wallpaper: [3000, 5000],
      plaster: [1500, 3000],
      decorative: [4000, 6000],
    }
    const wallCost = wallCosts[values.walls] || [0, 0]

    // Floor costs
    const floorCosts: Record<string, [number, number]> = {
      laminate: [2000, 3500],
      tile: [4500, 7000],
      parquet: [5000, 8000],
      dismantling: [800, 2000],
    }
    const floorCost = floorCosts[values.floor] || [0, 0]

    // Ceiling costs
    const ceilingCosts: Record<string, [number, number]> = {
      paint: [2000, 8000],
      drywall: [2000, 5000],
      stretch: [5000, 8000],
    }
    const ceilingCost = ceilingCosts[values.ceiling] || [0, 0]

    // Repair multiplier
    const repairMults: Record<string, number> = {
      cosmetic: 1,
      average: 1.25,
      capital: 1.6,
    }
    const repairMult = repairMults[values.repair] || 1

    // Material multiplier
    const materialMults: Record<string, number> = {
      econom: 0.8,
      standard: 1,
      premium: 1.4,
    }
    const materialMult = materialMults[values.material] || 1

    // Date multiplier
    const dateMults: Record<string, number> = {
      urgent: 1.1,
      ordinary: 1,
      not_important: 0.9,
    }
    const dateMult = dateMults[values.date] || 1

    // Area-based works
    const baseCostMin = values.area * (wallCost[0] + floorCost[0] + ceilingCost[0])
    const baseCostMax = values.area * (wallCost[1] + floorCost[1] + ceilingCost[1])

    // Electricity fixed / varied costs
    let elecMin = 0, elecMax = 0
    if (values.electricity === 'wiring') { elecMin = 100000; elecMax = 200000; }
    if (values.electricity === 'sockets') { elecMin = (values.electricity_sockets_count || 0) * 2500; elecMax = (values.electricity_sockets_count || 0) * 5000; }
    if (values.electricity === 'lighting') { elecMin = (values.electricity_lighting_count || 0) * 3000; elecMax = (values.electricity_lighting_count || 0) * 6000; }

    // Plumbing fixed / varied costs
    let plumbMin = 0, plumbMax = 0
    if (values.plumbing === 'pipes') { plumbMin = 60000; plumbMax = 100000; }
    if (values.plumbing === 'bathroom') { plumbMin = 120000; plumbMax = 200000; }
    if (values.plumbing === 'fixtures') { plumbMin = (values.plumbing_fixtures_count || 0) * 5000; plumbMax = (values.plumbing_fixtures_count || 0) * 12000; }

    const combinedMult = repairMult * materialMult * dateMult

    const totalMin = (baseCostMin + elecMin + plumbMin) * combinedMult
    const totalMax = (baseCostMax + elecMax + plumbMax) * combinedMult
    
    setEstimatedCost([Math.round(totalMin), Math.round(totalMax)])
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
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('calc_area')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('calc_area_placeholder')} type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('calc_height')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('calc_height_placeholder')} type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="rooms" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('calc_rooms')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('calc_rooms_placeholder')} type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
              {/* Repair Level */}
              <FormField control={form.control} name="repair" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('calc_repair')}</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
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

              {/* Material Class */}
              <FormField control={form.control} name="material" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('calc_material_class')}</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t">
              {/* Walls */}
              <FormField control={form.control} name="walls" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('calc_walls')}</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="painting" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_walls_painting')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="wallpaper" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_walls_wallpaper')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="plaster" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_walls_plaster')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="decorative" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_walls_decorative')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Floor */}
              <FormField control={form.control} name="floor" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('calc_floor')}</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="laminate" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_floor_laminate')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="tile" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_floor_tile')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="parquet" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_floor_parquet')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="dismantling" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_floor_dismantling')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Ceiling */}
              <FormField control={form.control} name="ceiling" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('calc_ceiling')}</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="paint" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_ceiling_paint')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="drywall" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_ceiling_drywall')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="stretch" /></FormControl>
                        <FormLabel className="font-normal">{t('calc_ceiling_stretch')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
              {/* Electricity */}
              <div className="space-y-4">
                <FormField control={form.control} name="electricity" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t('calc_electricity')}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="wiring" /></FormControl>
                          <FormLabel className="font-normal">{t('calc_elec_wiring')}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="sockets" /></FormControl>
                          <FormLabel className="font-normal">{t('calc_elec_sockets')}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="lighting" /></FormControl>
                          <FormLabel className="font-normal">{t('calc_elec_lighting')}</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {electricityType === 'sockets' && (
                  <FormField control={form.control} name="electricity_sockets_count" render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2">
                      <FormLabel>{t('calc_elec_sockets_count')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {electricityType === 'lighting' && (
                  <FormField control={form.control} name="electricity_lighting_count" render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2">
                      <FormLabel>{t('calc_elec_lighting_count')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>

              {/* Plumbing */}
              <div className="space-y-4">
                <FormField control={form.control} name="plumbing" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t('calc_plumbing')}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="pipes" /></FormControl>
                          <FormLabel className="font-normal">{t('calc_plumb_pipes')}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="bathroom" /></FormControl>
                          <FormLabel className="font-normal">{t('calc_plumb_bathroom')}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl><RadioGroupItem value="fixtures" /></FormControl>
                          <FormLabel className="font-normal">{t('calc_plumb_fixtures')}</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {plumbingType === 'fixtures' && (
                  <FormField control={form.control} name="plumbing_fixtures_count" render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2">
                      <FormLabel>{t('calc_plumb_fixtures_count')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
              {/* Date */}
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('calc_date')}</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
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

              {/* Email & Notes */}
              <div className="space-y-6">
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

            <Button type="submit" size="lg" className="w-full text-lg mt-8">
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
