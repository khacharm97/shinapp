import { useForm, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Plus, Camera, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { SEO } from '@/components/seo';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useGetSkillsQuery,
} from "@/store/api/authApi";
import { BrigadesTab } from "@/components/brigades/BrigadesTab";
import { PortfoliosTab } from "@/components/profile/PortfoliosTab";
import { isMaster, isCompany, canHavePortfolio, hasBrigadesAccess } from "@/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect, type Option } from "@/components/ui/multi-select";
import { armeniaRegions } from "@/lib/armenia-regions";
import type { Skill } from "@/types";
import { getLocalizedName } from "@/utils";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(5, "Phone number is required."),
  email: z.string().email("Invalid email address."),
  regionId: z.string().min(1, "Region is required."),
  cityId: z.string().optional(),
  skills: z.array(z.string()).optional().default([]),
  largeScale: z.boolean(),
  urgentOrders: z.boolean(),
  onlinePay: z.boolean(),
  buyMaterial: z.boolean(),
  nightShift: z.boolean(),
  pricingFormat: z.string().optional(),
  priceValue: z.string().optional(),
  about: z.string().optional(),

  // Company fields
  website: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialTiktok: z.string().optional(),
  itn: z.string().optional(),
  workersCount: z.string().optional(),
  workingPlaces: z.array(z.string()).optional().default([]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePageContent() {
  const { t, i18n } = useTranslation();

  const { data: profileData, isLoading: isFetchingProfile } = useGetProfileQuery(undefined);
  const { data: skillsData } = useGetSkillsQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We map the backend data to our user info object
  const isCompanyUser = isCompany(profileData?.roles);
  const isMasterUser = isMaster(profileData?.roles);

  const user = {
    email: profileData?.email || "",
    name: profileData?.name || "",
    role: isCompanyUser ? t("role_company", "Company") : isMasterUser ? t("role_master", "Master") : t("role_customer", "Customer"),
    avatarUrl: profileData?.avatarUrl || null,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as unknown as Resolver<ProfileFormValues>,
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      regionId: "",
      cityId: "",
      skills: [],
      largeScale: false,
      urgentOrders: false,
      onlinePay: false,
      buyMaterial: false,
      nightShift: false,
      pricingFormat: "",
      priceValue: "",
      about: "",
      website: "",
      socialFacebook: "",
      socialInstagram: "",
      socialTiktok: "",
      itn: "",
      workersCount: "",
      workingPlaces: [],
    },
  });

  useEffect(() => {
    if (profileData) {
      // Pre-fill form from backend data (combining user and userInfo)
      setTimeout(() => {
        form.reset({
          fullName: profileData.name || "",
          phone: profileData.phone || "",
          email: profileData.email || "",
          regionId: profileData.userInfo?.regionId || "",
          cityId: profileData.userInfo?.cityId || "",
          skills: profileData.userInfo?.skills?.length ? profileData.userInfo.skills : [],
          largeScale: profileData.userInfo?.largeScale || false,
          urgentOrders: profileData.userInfo?.urgentOrders || false,
          onlinePay: profileData.userInfo?.onlinePay || false,
          buyMaterial: profileData.userInfo?.buyMaterial || false,
          nightShift: profileData.userInfo?.nightShift || false,
          pricingFormat: profileData.userInfo?.pricingFormat || "",
          priceValue: profileData.userInfo?.priceValue || "",
          about: profileData.userInfo?.about || "",
          website: profileData.userInfo?.website || "",
          socialFacebook: profileData.userInfo?.socialFacebook || "",
          socialInstagram: profileData.userInfo?.socialInstagram || "",
          socialTiktok: profileData.userInfo?.socialTiktok || "",
          itn: profileData.userInfo?.itn || "",
          workersCount: profileData.userInfo?.workersCount?.toString() || "",
          workingPlaces: profileData.userInfo?.workingPlaces?.length ? profileData.userInfo.workingPlaces : [],
        });
      }, 100);

    }
  }, [profileData, form]);

  const watchRegion = useWatch({
    control: form.control,
    name: "regionId",
  });
  const watchPricingFormat = useWatch({
    control: form.control,
    name: "pricingFormat",
  });

  const currentRegion = armeniaRegions.find((r) => r.id === watchRegion);
  const citiesOptions = currentRegion?.cities || [];

  // getLocalizedName is now imported from @/utils

  const skillOptions: Option[] = skillsData ? skillsData.map((s: Skill) => ({
    label: getLocalizedName(s, i18n.language),
    value: s.key,
  })) : [];

  async function onSubmit(data: ProfileFormValues) {
    setSubmitStatus('idle');
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        await uploadAvatar(formData).unwrap();
        setAvatarFile(null); // Clear so it doesn't re-upload on next save
      }

      await updateProfile({
        name: data.fullName,
        phone: data.phone,
        email: data.email,
        regionId: data.regionId,
        cityId: data.cityId,
        skills: data.skills,
        largeScale: data.largeScale,
        urgentOrders: data.urgentOrders,
        onlinePay: data.onlinePay,
        buyMaterial: data.buyMaterial,
        nightShift: data.nightShift,
        pricingFormat: data.pricingFormat,
        priceValue: data.priceValue,
        about: data.about,
        website: data.website,
        socialFacebook: data.socialFacebook,
        socialInstagram: data.socialInstagram,
        socialTiktok: data.socialTiktok,
        itn: data.itn,
        workersCount: data.workersCount ? parseInt(data.workersCount, 10) : null,
        workingPlaces: data.workingPlaces,
      }).unwrap();
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      setSubmitStatus('error');
    }
  }

  if (isFetchingProfile) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start w-full bg-slate-50/50 min-h-[calc(100vh-14rem)] py-8 animate-in fade-in duration-500">
      <SEO title={t('profile')} />
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            {t("profile_title")}
          </h1>
        </div>

        {/* Profile Card Header */}
        <div className="flex items-center gap-6 p-6 bg-white dark:bg-card border border-transparent dark:border-border rounded-2xl shadow-sm transition-all hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 start-0 w-2 h-full bg-brand"></div>

          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-zinc-600 group-hover:border-blue-500 transition-colors overflow-hidden">
              {(previewUrl || user.avatarUrl) ? (
                <img
                  src={previewUrl || `${import.meta.env.VITE_BACK_URL || 'http://localhost:3000'}${user.avatarUrl}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                  }}
                />
              ) : (
                <Plus className="w-8 h-8 text-orange-500" strokeWidth={3} />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-1">
              {user.email}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
              <span>{user.name}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              <span>{user.role}</span>
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-card p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile_full_name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("profile_full_name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile_phone")}</FormLabel>
                      <FormControl>
                        <Input placeholder="+374 __ __ __ __" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t("profile_email")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("calc_email_placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="regionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile_region")}</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("cityId", ""); // Reset city when region changes
                        }}
                        value={field.value}
                      >
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder={t("profile_region_placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {armeniaRegions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                              {getLocalizedName(region, i18n.language)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {citiesOptions.length > 0 && (
                  <FormField
                    control={form.control}
                    name="cityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>&nbsp;</FormLabel> {/* Alignment trick */}
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("profile_city_placeholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {citiesOptions.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {getLocalizedName(city, i18n.language)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {!isCompanyUser && (
                <>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile_skills")}</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={skillOptions}
                              selected={field.value}
                              onChange={field.onChange}
                              placeholder={t("profile_skills_placeholder")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Preferences / Toggles */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <FormField
                      control={form.control}
                      name="largeScale"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-border p-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">{t("profile_large_scale")}</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="urgentOrders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-border p-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">{t("profile_urgent")}</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="onlinePay"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-border p-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">{t("profile_online_pay")}</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buyMaterial"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-border p-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">{t("profile_buy_material")}</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nightShift"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-border p-4 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">{t("profile_night_shift")}</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Pricing Format */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <FormField
                      control={form.control}
                      name="pricingFormat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile_pricing_format")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder={t("profile_pricing_placeholder")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">{t("profile_price_daily")}</SelectItem>
                              <SelectItem value="sqm">{t("profile_price_sqm")}</SelectItem>
                              <SelectItem value="contract">{t("profile_price_contract")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(watchPricingFormat === "daily" || watchPricingFormat === "sqm") && (
                      <FormField
                        control={form.control}
                        name="priceValue"
                        render={({ field }) => (
                          <FormItem className="animate-in fade-in slide-in-from-top-2">
                            <FormLabel>{t("profile_price_value")}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder={t("profile_price_value_placeholder")} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </>
              )}

              {/* About Textarea */}
              <div className="pt-4 border-t border-slate-100">
                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("profile_about")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("profile_about_placeholder")}
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCompanyUser && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900 dark:text-foreground">{t("profile_company_details", "Company Details")}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile_website", "Website")}</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="itn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile_itn", "ITN")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("profile_itn_placeholder", "Individual Taxpayer Number")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workersCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile_workers_count", "Workers Count")}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="socialFacebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile_facebook", "Facebook")}</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialInstagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile_instagram", "Instagram")}</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="socialTiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("profile_tiktok", "TikTok")}</FormLabel>
                          <FormControl>
                            <Input placeholder="https://tiktok.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {submitStatus === 'success' && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                  {t("profile_update_success", "Profile updated successfully!")}
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium">
                  {t("profile_update_error", "Failed to update profile. Please try again.")}
                </div>
              )}
              <Button disabled={isUpdating || isUploadingAvatar} type="submit" className="w-full sm:w-auto mt-8 h-12 px-8 text-base font-semibold">
                {(isUpdating || isUploadingAvatar) ? <Loader2 className="w-5 h-5 animate-spin me-2" /> : null}
                {t("profile_save")}
              </Button>
            </form>
          </Form>
        </div>

        {canHavePortfolio(profileData?.roles) && (
          <PortfoliosTab profileData={profileData} />
        )}

        {hasBrigadesAccess(profileData?.roles) && (
          <BrigadesTab profileData={profileData} />
        )}

      </div>
    </div>
  );
}
