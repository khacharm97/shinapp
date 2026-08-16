import { getImageUrl } from '@/utils';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin, Star, CheckCircle2, ImagePlus, Settings } from "lucide-react";
import { useGetProfileQuery, useGetSkillsQuery } from "@/store/api/authApi";
import { armeniaRegions } from "@/lib/armenia-regions";
import { Button } from "@/components/ui/button";
import type { LocalizedString, Skill, Portfolio } from "@/types";
import { getLocalizedName } from "@/utils";
import { SEO } from '@/components/seo';

export default function ProfilePageContent() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const { data: profile, isLoading, isError } = useGetProfileQuery(undefined);
  const { data: skillsData } = useGetSkillsQuery(undefined);

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
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4">
        <SEO title={t("error_not_found", "Profile not found")} />
        <p className="text-slate-500">{t("error_profile_not_found_desc", "Profile not found or an error occurred.")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-brand/5 border-b border-slate-100 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-1 text-center md:text-start space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div>
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-200 shrink-0">
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
                  <div className="flex flex-col items-start justify-start md:justify-start gap-4 text-sm border-t md:border-t-0 border-slate-200/60 pt-4 md:pt-0">
                    <h1 className="text-xl font-bold text-slate-900 mb-2 flex items-center justify-center md:justify-start">
                      {profile.name || profile.email || "Unnamed User"}
                      {profile.isVerified && (
                        <span className="inline-block ms-2 text-blue-500">
                          {/* Verified icon here if needed */}
                        </span>
                      )}
                    </h1>
                    {profile.userInfo?.regionId && (
                      <div className="flex items-center justify-center md:justify-start text-slate-500">
                        <MapPin className="w-4 h-4 me-1" />
                        {getLocalizedLocation(profile.userInfo?.regionId, profile.userInfo?.cityId)}
                      </div>
                    )}
                    <div className="flex gap-4 justify-center md:justify-start">
                      <div className="flex items-center text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-md">
                        <Star className="w-4 h-4 me-1 fill-current" />
                        {t("search_top_rated", "Top Rated")}
                      </div>

                      <div className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4 me-1" />
                        {t("search_available_now", "Available now")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  <Button onClick={() => navigate('/profile/settings')} className="bg-brand hover:bg-brand/90 text-white shadow-sm w-full md:w-auto">
                    <Settings className="w-4 h-4 me-2" />
                    {t("nav_profile_settings", "Profile Settings")}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-12 pt-6">
                <div>
                  <div className="text-3xl font-bold text-brand">0</div>
                  <div className="text-sm text-slate-500 mt-1">{t("profile_customers", "Customers")}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-brand">0</div>
                  <div className="text-sm text-slate-500 mt-1">{t("profile_total_jobs", "Total Jobs")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12 space-y-12">

            {/* About */}
            <section>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                {t("master_details_about", "Short info")}
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {profile.userInfo?.about || t("profile_no_about", "You haven't provided a detailed description yet.")}
                </p>
              </div>
            </section>

            {/* Skills */}
            {profile.userInfo?.skills && profile.userInfo.skills.length > 0 && (
              <section className="pt-8 border-t border-slate-100">
                <h2 className="text-2xl font-bold text-brand mb-6">
                  {t("profile_skills", "Skills")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.userInfo.skills.map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="bg-slate-100 text-slate-800 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {getSkillTranslation(skill)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pricing (if any) */}
            {profile.userInfo?.priceValue && (
              <section className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-2">{t("pricing_information", "Pricing Information")}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-brand">{profile.userInfo.priceValue} AMD</span>
                  <span className="text-slate-500 font-medium">
                    / {profile.userInfo.pricingFormat === 'daily' ? 'day' : profile.userInfo.pricingFormat === 'sqm' ? 'sqm' : 'hr'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{t("pricing_estimate_note", "Prices are estimates and may vary based on project requirements.")}</p>
              </section>
            )}

            {/* Portfolios */}
            {profile.portfolios && profile.portfolios.length > 0 && (
              <section className="pt-8 border-t border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("portfolios", "Portfolios")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.portfolios.map((port: Portfolio) => (
                    <div key={port.id} className="border border-slate-200 rounded-xl overflow-hidden group bg-white shadow-sm hover:shadow-md transition-all">
                      <div className="aspect-video bg-slate-100 relative">
                        {port.imageUrls?.[0] ? (
                          <img src={getImageUrl(port.imageUrls[0]) || ""} className="w-full h-full object-cover" alt={port.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImagePlus className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{port.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{port.description}</p>

                        {port.imageUrls && port.imageUrls.length > 1 && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                            {port.imageUrls.slice(1).map((url: string, i: number) => (
                              <div key={i} className="w-12 h-12 rounded-md overflow-hidden bg-slate-100">
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
