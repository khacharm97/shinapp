import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Plus, Camera, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useGetProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation } from "@/store/api/authApi";


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

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(5, "Phone number is required."),
  email: z.string().email("Invalid email address."),
  regionId: z.string().min(1, "Region is required."),
  cityId: z.string().optional(),
  skills: z.array(z.string()).min(1, "Select at least one skill."),
  largeScale: z.boolean(),
  urgentOrders: z.boolean(),
  onlinePay: z.boolean(),
  buyMaterial: z.boolean(),
  nightShift: z.boolean(),
  pricingFormat: z.string(),
  priceValue: z.string().optional(),
  about: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { t, i18n } = useTranslation();

  const { data: profileData, isLoading: isFetchingProfile } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We map the backend data to our user info object
  const user = {
    email: profileData?.email || "",
    name: profileData?.name || "",
    role: profileData?.roles?.[0] === 'MASTER' ? t("role_master", "Master") : t("role_customer", "Customer"),
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
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      regionId: "",
      cityId: "",
      skills: ["shinarar", "nerkarar"], // Default skills
      largeScale: false,
      urgentOrders: false,
      onlinePay: false,
      buyMaterial: false,
      nightShift: false,
      pricingFormat: "",
      priceValue: "",
      about: "",
    },
  });

  useEffect(() => {
    if (profileData) {
      // Pre-fill form from backend data (combining user and userInfo)
      form.reset({
        fullName: profileData.name || "",
        phone: profileData.phone || "",
        email: profileData.email || "",
        regionId: profileData.userInfo?.regionId || "",
        cityId: profileData.userInfo?.cityId || "",
        skills: profileData.userInfo?.skills?.length ? profileData.userInfo.skills : ["shinarar", "nerkarar"],
        largeScale: profileData.userInfo?.largeScale || false,
        urgentOrders: profileData.userInfo?.urgentOrders || false,
        onlinePay: profileData.userInfo?.onlinePay || false,
        buyMaterial: profileData.userInfo?.buyMaterial || false,
        nightShift: profileData.userInfo?.nightShift || false,
        pricingFormat: profileData.userInfo?.pricingFormat || "",
        priceValue: profileData.userInfo?.priceValue || "",
        about: profileData.userInfo?.about || "",
      });
    }
  }, [profileData, form]);

  const watchRegion = form.watch("regionId");
  const watchPricingFormat = form.watch("pricingFormat");

  const currentRegion = armeniaRegions.find((r) => r.id === watchRegion);
  const citiesOptions = currentRegion?.cities || [];

  const getLocalizedName = (item: any) => {
    if (i18n.language === "am") return item.nameAm;
    if (i18n.language === "ru") return item.nameRu;
    return item.nameEn;
  };

  const skillOptions: Option[] = [
    { label: t("profile_skill_shinarar"), value: "shinarar" },
    { label: t("profile_skill_nerkarar"), value: "nerkarar" },
    { label: t("calc_plumbing"), value: "plumber" }, // Reusing some calc translations for example
    { label: t("calc_electricity"), value: "electrician" },
  ];

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
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t("profile_title")}
          </h1>
        </div>

        {/* Profile Card Header */}
        <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm transition-all hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand"></div>

          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 group-hover:border-blue-500 transition-colors overflow-hidden">
              {(previewUrl || user.avatarUrl) ? (
                <img src={previewUrl || `http://localhost:3000${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
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
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {user.email}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
              <span>{user.name}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{user.role}</span>
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
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
                              {getLocalizedName(region)}
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
                                {getLocalizedName(city)}
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

              {/* Preferences / Toggles */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <FormField
                  control={form.control}
                  name="largeScale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors">
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
                {(isUpdating || isUploadingAvatar) ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {t("profile_save")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
