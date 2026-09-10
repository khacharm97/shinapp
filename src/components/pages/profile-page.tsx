import { getImageUrl } from '@/utils';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin, Star, CheckCircle2, ImagePlus, Settings } from "lucide-react";
import { useGetProfileQuery, useGetSkillsQuery } from "@/store/api/authApi";
import { armeniaRegions } from "@/lib/armenia-regions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LocalizedString, Skill, Portfolio } from "@/types";
import { getLocalizedName } from "@/utils";
import { SEO } from '@/components/seo';
import { BrigadesTab } from "@/components/brigades/BrigadesTab";
import { hasBrigadesAccess } from "@/utils/roles";
import { Pencil, Check, X as XIcon, Users } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateProfileMutation } from "@/store/api/authApi";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function ProfilePageContent() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: profile, isLoading, isError } = useGetProfileQuery(undefined);
  const { data: skillsData } = useGetSkillsQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [editAbout, setEditAbout] = useState(false);
  const [aboutValue, setAboutValue] = useState("");

  const [editSkills, setEditSkills] = useState(false);
  const [skillsValue, setSkillsValue] = useState<string[]>([]);

  const [editPricing, setEditPricing] = useState(false);
  const [pricingFormat, setPricingFormat] = useState("");
  const [priceValue, setPriceValue] = useState("");

  const handleSaveAbout = async () => {
    try {
      await updateProfile({ about: aboutValue }).unwrap();
      setEditAbout(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSkills = async () => {
    try {
      await updateProfile({ skills: skillsValue }).unwrap();
      setEditSkills(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePricing = async () => {
    try {
      await updateProfile({ pricingFormat, priceValue }).unwrap();
      setEditPricing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const skillOptions = skillsData?.map((s: Skill) => ({
    label: getLocalizedName(s, i18n.language),
    value: s.key,
  })) || [];

  const getLocalizedLocation = (regionId?: string | null, cityId?: string | null) => {
    if (!regionId) return "";
    const region = armeniaRegions.find((r) => r.id === regionId);
    if (!region) return "";

    const getLocName = (item: LocalizedString) => getLocalizedName(item, i18n.language);

    let loc = getLocName(region);
    if (cityId) {
      const city = region.cities.find((c) => c.id === cityId);
      if (city) {
        loc = `${getLocName(city)}, ${loc}`;
      }
    }
    return loc;
  };

  const getSkillTranslation = (skillKey: string) => {
    if (!skillsData) return skillKey;
    const skill = skillsData.find((s: Skill) => s.key === skillKey);
    if (!skill) return skillKey;
    return getLocalizedName(skill, i18n.language);
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4">
        <SEO title={t("error_not_found", "Profile not found")} />
        <p className="text-slate-500 dark:text-gray-400">{t("error_profile_not_found_desc", "Profile not found or an error occurred.")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
          {/* Header Section */}
          <div className="bg-brand/5 dark:bg-brand/10 border-b border-slate-100 dark:border-zinc-800 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-1 text-center md:text-start space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div>
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-md overflow-hidden bg-slate-200 dark:bg-zinc-700 shrink-0">
                      <img
                        src={profile.avatarUrl ? getImageUrl(profile.avatarUrl) || "" : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
                        alt={profile.name || "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-start md:justify-start gap-4 text-sm border-t md:border-t-0 border-slate-200/60 dark:border-zinc-700/60 pt-4 md:pt-0">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-foreground mb-2 flex items-center justify-center md:justify-start">
                      {profile.name || profile.email || t("profile_unnamed_user", "Unnamed User")}
                      {profile.isVerified && (
                        <span className="inline-block ms-2 text-blue-500">
                          {/* Verified icon here if needed */}
                        </span>
                      )}
                    </h1>
                    {profile.userInfo?.regionId && (
                      <div className="flex items-center justify-center md:justify-start text-slate-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 me-1" />
                        {getLocalizedLocation(profile.userInfo?.regionId, profile.userInfo?.cityId)}
                      </div>
                    )}
                    <div className="flex gap-4 justify-center md:justify-start">
                      <div className="flex items-center text-orange-500 font-medium bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded-md">
                        <Star className="w-4 h-4 me-1 fill-current" />
                        {t("search_top_rated", "Top Rated")}
                      </div>

                      <div className="flex items-center text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4 me-1" />
                        {t("search_available_now", "Available now")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row gap-3 shrink-0">
                  {hasBrigadesAccess(profile.roles) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="shadow-sm w-full md:w-auto border-brand text-brand hover:bg-brand/5 hover:text-brand">
                          <Users className="w-4 h-4 me-2" />
                          {t("profile_brigades", "My Brigades")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-[1400px] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                        <BrigadesTab profileData={profile} className="mt-0" />
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button onClick={() => navigate('/profile/settings')} className="bg-brand hover:bg-brand/90 text-white shadow-sm w-full md:w-auto">
                    <Settings className="w-4 h-4 me-2" />
                    {t("nav_profile_settings", "Profile Settings")}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-12 pt-6">
                <div>
                  <div className="text-3xl font-bold text-brand">0</div>
                  <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t("profile_customers", "Customers")}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-brand">0</div>
                  <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t("profile_total_jobs", "Total Jobs")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12 space-y-12">

            {/* About */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground">
                  {t("master_details_about", "Short info")}
                </h2>
                {!editAbout && (
                  <Button variant="ghost" size="icon" onClick={() => {
                    setAboutValue(profile.userInfo?.about || "");
                    setEditAbout(true);
                  }}>
                    <Pencil className="w-4 h-4 text-brand" />
                  </Button>
                )}
              </div>
              {editAbout ? (
                <div className="space-y-4">
                  <Textarea
                    value={aboutValue}
                    onChange={(e) => setAboutValue(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditAbout(false)}>
                      <XIcon className="w-4 h-4 me-2" /> {t("cancel", "Cancel")}
                    </Button>
                    <Button onClick={handleSaveAbout} disabled={isUpdating}>
                      <Check className="w-4 h-4 me-2" /> {t("save", "Save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {profile.userInfo?.about || t("profile_no_about", "You haven't provided a detailed description yet.")}
                  </p>
                </div>
              )}
            </section>

            {/* Skills */}
            <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brand">
                  {t("profile_skills", "Skills")}
                </h2>
                {!editSkills && (
                  <Button variant="ghost" size="icon" onClick={() => {
                    setSkillsValue(profile.userInfo?.skills || []);
                    setEditSkills(true);
                  }}>
                    <Pencil className="w-4 h-4 text-brand" />
                  </Button>
                )}
              </div>
              {editSkills ? (
                <div className="space-y-4">
                  <MultiSelect
                    options={skillOptions}
                    selected={skillsValue}
                    onChange={setSkillsValue}
                    placeholder={t("profile_skills_placeholder")}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditSkills(false)}>
                      <XIcon className="w-4 h-4 me-2" /> {t("cancel", "Cancel")}
                    </Button>
                    <Button onClick={handleSaveSkills} disabled={isUpdating}>
                      <Check className="w-4 h-4 me-2" /> {t("save", "Save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.userInfo?.skills && profile.userInfo.skills.length > 0 ? profile.userInfo.skills.map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {getSkillTranslation(skill)}
                    </div>
                  )) : (
                    <p className="text-slate-500 dark:text-gray-400 italic">{t("no_skills_added", "No skills added yet.")}</p>
                  )}
                </div>
              )}
            </section>

            {/* Pricing (if any) */}
            <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brand">{t("pricing_information", "Pricing Information")}</h2>
                {!editPricing && (
                  <Button variant="ghost" size="icon" onClick={() => {
                    setPricingFormat(profile.userInfo?.pricingFormat || "");
                    setPriceValue(profile.userInfo?.priceValue || "");
                    setEditPricing(true);
                  }}>
                    <Pencil className="w-4 h-4 text-brand" />
                  </Button>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-slate-100 dark:border-zinc-800">
                {editPricing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select value={pricingFormat} onValueChange={setPricingFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("profile_pricing_placeholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">{t("profile_price_daily")}</SelectItem>
                          <SelectItem value="sqm">{t("profile_price_sqm")}</SelectItem>
                          <SelectItem value="contract">{t("profile_price_contract")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {(pricingFormat === "daily" || pricingFormat === "sqm") && (
                        <Input
                          type="number"
                          placeholder={t("profile_price_value_placeholder")}
                          value={priceValue}
                          onChange={(e) => setPriceValue(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setEditPricing(false)}>
                        <XIcon className="w-4 h-4 me-2" /> {t("cancel", "Cancel")}
                      </Button>
                      <Button onClick={handleSavePricing} disabled={isUpdating}>
                        <Check className="w-4 h-4 me-2" /> {t("save", "Save")}
                      </Button>
                    </div>
                  </div>
                ) : profile.userInfo?.priceValue ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-brand">{profile.userInfo.priceValue} {t("currency_amd", "AMD")}</span>
                      <span className="text-slate-500 dark:text-gray-400 font-medium">
                        / {profile.userInfo.pricingFormat === 'daily' ? t("search_per_day", "day") : profile.userInfo.pricingFormat === 'sqm' ? t("search_per_sqm", "sqm") : t("search_per_hr", "hr")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">{t("pricing_estimate_note", "Prices are estimates and may vary based on project requirements.")}</p>
                  </>
                ) : (
                  <p className="text-slate-500 dark:text-gray-400 italic">{t("no_pricing_added", "No pricing added yet.")}</p>
                )}
              </div>
            </section>

            {/* Portfolios */}
            {profile.portfolios && profile.portfolios.length > 0 && (
              <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-6">{t("portfolios", "Portfolios")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.portfolios.map((port: Portfolio) => (
                    <div key={port.id} className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden group bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all">
                      <div className="aspect-video bg-slate-100 dark:bg-zinc-800 relative">
                        {port.imageUrls?.[0] ? (
                          <img src={getImageUrl(port.imageUrls[0]) || ""} className="w-full h-full object-cover" alt={port.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-500">
                            <ImagePlus className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-foreground line-clamp-1">{port.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 line-clamp-2">{port.description}</p>

                        {port.imageUrls && port.imageUrls.length > 1 && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                            {port.imageUrls.slice(1).map((url: string, i: number) => (
                              <div key={i} className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 dark:bg-zinc-800">
                                <img src={getImageUrl(url) || ""} className="w-full h-full object-cover" alt="" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
