import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin, Star, CheckCircle2, Phone, Mail, ArrowLeft } from "lucide-react";
import { useGetMasterByIdQuery } from "@/store/api/authApi";
import { armeniaRegions } from "@/lib/armenia-regions";
import { Button } from "@/components/ui/button";

const MANAGER_PHONE = "+37493233402";
const MANAGER_EMAIL = "info@shinapp.am";

export default function MasterDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();

  const { data: master, isLoading, isError } = useGetMasterByIdQuery(id as string, {
    skip: !id,
  });

  const getLocalizedLocation = (regionId?: string | null, cityId?: string | null) => {
    if (!regionId) return "";
    const region = armeniaRegions.find((r) => r.id === regionId);
    if (!region) return "";

    const getLocName = (item: any) => {
      if (i18n.language === "am") return item.nameAm;
      if (i18n.language === "ru") return item.nameRu;
      return item.nameEn;
    };

    let loc = getLocName(region);
    if (cityId) {
      const city = region.cities.find((c) => c.id === cityId);
      if (city) {
        loc = `${getLocName(city)}, ${loc}`;
      }
    }
    return loc;
  };

  const getLocalizedSkills = (skills?: string[] | null) => {
    if (!skills || skills.length === 0) return "";
    return skills.map(skill => {
      switch (skill) {
        case "shinarar": return t("profile_skill_shinarar", "Shinarar");
        case "nerkarar": return t("profile_skill_nerkarar", "Nerkarar");
        case "plumber": return t("calc_plumbing", "Plumber");
        case "electrician": return t("calc_electricity", "Electrician");
        default: return skill;
      }
    }).join(" | ");
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !master) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Master not found or an error occurred.</p>
        <Button asChild variant="outline">
          <Link to="/masters">Back to Masters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto space-y-8">
        <div>
          <Button asChild variant="ghost" className="mb-4 text-slate-500 hover:text-slate-900 -ml-4">
            <Link to="/masters">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Masters
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-brand/5 border-b border-slate-100 p-4 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div>
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={master.avatarUrl ? `${import.meta.env.VITE_BACK_URL || 'http://localhost:3000'}${master.avatarUrl}` : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
                        alt={master.name || "Master"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-strat justify-start md:justify-start gap-4 text-sm border-t border-slate-200/60">
                    <h1 className="text-xl font-bold text-slate-900 mb-2">
                      {master.name || "Unnamed Master"}
                      {master.isVerified && (
                        <span className="inline-block ml-2 text-blue-500">
                          {/* Assuming there is a verified icon somewhere, just omitting for now as it's not strictly requested, but removing the skill is. */}
                        </span>
                      )}
                    </h1>
                    {master.userInfo?.regionId && (
                      <div className="flex items-center text-slate-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {getLocalizedLocation(master.userInfo?.regionId, master.userInfo?.cityId)}
                      </div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex items-center text-orange-500 font-medium bg-orange-50 px-0 py-1 rounded-md">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        Top Rated
                      </div>

                      <div className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Available now
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  <Button onClick={() => window.location.href = `tel:${MANAGER_PHONE}`} className="bg-brand hover:bg-brand/90 text-white shadow-sm w-full md:w-auto">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Manager
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = `mailto:${MANAGER_EMAIL}`} className="w-full md:w-auto">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Manager
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-12">
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
                {getLocalizedSkills(master.userInfo?.skills) || t("profile_about", "About Me")}
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {master.userInfo?.about || "This master hasn't provided a detailed description yet. Contact the manager for more information."}
                </p>
              </div>
            </section>

            {/* Pricing (if any) */}
            {master.userInfo?.priceValue && (
              <section className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Pricing Information</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-brand">{master.userInfo.priceValue} AMD</span>
                  <span className="text-slate-500 font-medium">
                    / {master.userInfo.pricingFormat === 'daily' ? 'day' : master.userInfo.pricingFormat === 'sqm' ? 'sqm' : 'hr'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Prices are estimates and may vary based on project requirements.</p>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
