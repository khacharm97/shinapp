import { getImageUrl } from '@/utils';
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin, Star, CheckCircle2, Clock, Phone, Mail, ArrowLeft, ImagePlus, FileText, Calendar as CalendarIcon, MessageSquare } from "lucide-react";
import { useGetMasterByIdQuery, useGetSkillsQuery, useGetProfileQuery, useGetMasterReviewsQuery, useGetMasterBusyDatesQuery } from "@/store/api/authApi";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isWithinInterval } from "date-fns";
import { armeniaRegions } from "@/lib/armenia-regions";
import { Button } from "@/components/ui/button";
import type { LocalizedString, Skill, Portfolio } from "@/types";
import { getLocalizedName } from "@/utils";
import { SEO } from '@/components/seo';
import { CreateOrderModal } from "@/components/orders/CreateOrderModal";

const MANAGER_PHONE = "+37493233402";
const MANAGER_EMAIL = "info@shinapp.am";

export default function MasterDetailsPageContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Go back to wherever the user came from (usually the search page); fall back
  // to /search when the page was opened directly with no in-app history.
  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/search");
    }
  };
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const { data: profile } = useGetProfileQuery(undefined);
  const { data: master, isLoading, isError } = useGetMasterByIdQuery(id as string, {
    skip: !id,
  });
  const { data: skillsData } = useGetSkillsQuery(undefined);

  const { data: reviewsData } = useGetMasterReviewsQuery(id as string, { skip: !id });
  const { data: busyDatesData } = useGetMasterBusyDatesQuery(id as string, { skip: !id });

  // Calculate disabled days based on busyDatesData
  const disabledDays = (date: Date) => {
    if (!busyDatesData) return false;
    return busyDatesData.some((order: any  ) => {
      const start = new Date(order.startDate);
      const end = new Date(order.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return isWithinInterval(date, { start, end });
    });
  };

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

  if (isError || !master) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4">
        <SEO title={t("error_not_found", "Master not found")} />
        <p className="text-slate-500">{t("error_master_not_found_desc", "Master not found or an error occurred.")}</p>
        <Button variant="outline" onClick={goBack}>
          {t("back", "Back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Button variant="ghost" onClick={goBack} className="mb-4 text-slate-500 hover:text-slate-900 -ms-4">
            <ArrowLeft className="w-4 h-4 me-2" />
            {t("back", "Back")}
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-brand/5 border-b border-slate-100 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-1 text-center md:text-start space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div>
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={master.avatarUrl ? getImageUrl(master.avatarUrl) || "" : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
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
                      {master.name || t("search_unnamed_master", "Unnamed Master")}
                      {master.isVerified && (
                        <span className="inline-block ms-2 text-blue-500">
                          {/* Assuming there is a verified icon somewhere, just omitting for now as it's not strictly requested, but removing the skill is. */}
                        </span>
                      )}
                    </h1>
                    {master.userInfo?.regionId && (
                      <div className="flex items-center text-slate-500">
                        <MapPin className="w-4 h-4 me-1" />
                        {getLocalizedLocation(master.userInfo?.regionId, master.userInfo?.cityId)}
                      </div>
                    )}
                    <div className="flex gap-4">
                      <div className="flex items-center text-orange-500 font-medium bg-orange-50 px-0 py-1 rounded-md">
                        <Star className="w-4 h-4 me-1 fill-current" />
                        {t("search_top_rated", "Top Rated")}
                      </div>

                      {master.availability === "AVAILABLE" && (
                        <div className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md">
                          <CheckCircle2 className="w-4 h-4 me-1" />
                          {t("search_available_now", "Available now")}
                        </div>
                      )}
                      {master.availability === "HALF_BUSY" && (
                        <div className="flex items-center text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md">
                          <Clock className="w-4 h-4 me-1" />
                          {t("search_half_busy", "Partially busy")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  {profile && profile.id !== master.id && (
                    <Button onClick={() => setIsOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full md:w-auto">
                      <FileText className="w-4 h-4 me-2" />
                      {t("propose_order", "Propose Order")}
                    </Button>
                  )}
                  <Button onClick={() => window.location.href = `tel:${MANAGER_PHONE}`} className="bg-brand hover:bg-brand/90 text-white shadow-sm w-full md:w-auto">
                    <Phone className="w-4 h-4 me-2" />
                    {t("master_details_call_manager", "Call Manager")}
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = `mailto:${MANAGER_EMAIL}`} className="w-full md:w-auto">
                    <Mail className="w-4 h-4 me-2" />
                    {t("master_details_email_manager", "Email Manager")}
                  </Button>

                  {/* Brigade Link */}
                  {(() => {
                    const brigade = master.ownedBrigades?.[0] || master.brigadeMemberships?.[0]?.brigade;
                    if (!brigade) return null;
                    return (
                      <div className="mt-2 flex flex-col gap-1.5">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider text-center md:text-start">{t("brigade_label", "Brigade")}</span>
                        <Button asChild variant="outline" className="w-full md:w-auto border-brand text-brand hover:bg-brand/10 hover:text-brand">
                          <Link to={`/brigades/${brigade.id}`}>
                            {brigade.name}
                          </Link>
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-12">
                <div>
                  <div className="text-3xl font-bold text-brand">{master.stats?.customers ?? 0}</div>
                  <div className="text-sm text-slate-500 mt-1">{t("profile_customers", "Customers")}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-brand">{master.stats?.totalJobs ?? 0}</div>
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
                  {master.userInfo?.about || "This master hasn't provided a detailed description yet. Contact the manager for more information."}
                </p>
              </div>
            </section>

            {/* Skills */}
            {master.userInfo?.skills && master.userInfo.skills.length > 0 && (
              <section className="pt-8 border-t border-slate-100">
                <h2 className="text-2xl font-bold text-brand mb-6">
                  {t("profile_skills", "Skills")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {master.userInfo.skills.map((skill: string, index: number) => (
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


            {/* Schedule / Busy Days */}
            <section className="pt-8 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <CalendarIcon className="w-6 h-6 me-2 text-brand" />
                {t("master_schedule", "Schedule")}
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm inline-block">
                <DayPicker
                  mode="multiple"
                  disabled={disabledDays}
                  modifiers={{ busy: disabledDays }}
                  modifiersStyles={{
                    busy: { color: 'white', backgroundColor: '#ef4444' }
                  }}
                  className="mx-auto"
                />
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>{t("busy_days", "Busy Days")}</span>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section className="pt-8 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 me-2 text-brand" />
                {t("reviews_title", "Reviews")}
                {reviewsData?.count > 0 && <span className="ms-2 text-slate-500 text-lg font-normal">({reviewsData.count})</span>}
              </h2>

              {reviewsData && reviewsData.count > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="text-4xl font-bold text-slate-900">{reviewsData.averageRating.toFixed(1)}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-5 h-5 ${star <= Math.round(reviewsData.averageRating) ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-slate-500">{t("average_rating", "Average Rating")}</span>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {reviewsData.reviews.map((review: any  ) => (
                      <div key={review.id} className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img src={getImageUrl(review.author?.avatarUrl) || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <div className="font-semibold text-slate-900">{review.author?.name || t("anonymous", "Anonymous")}</div>
                              <div className="text-xs text-slate-500">{format(new Date(review.createdAt), 'PP')}</div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-slate-500">{t("no_reviews_yet", "No reviews yet. Be the first to leave one after your order is completed!")}</p>
                </div>
              )}
            </section>

            {/* Portfolios */}
            {master.portfolios && master.portfolios.length > 0 && (
              <section className="pt-8 border-t border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Portfolios</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {master.portfolios.map((port: Portfolio) => (
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
        {profile && master && (
          <CreateOrderModal
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            masterId={master.id}
            clientId={profile.id}
            masterName={master.name || t("master", "Master")}
          />
        )}
      </div>
    </div>
  );
}
