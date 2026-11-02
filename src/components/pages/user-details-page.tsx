import { getImageUrl, isCompany, isMaster, isTopRated } from '@/utils';
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useRequireLogin } from "@/components/auth/login-required-context";
import { AnnouncementCardLink } from "@/components/announcements/announcement-card-link";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin, Star, CheckCircle2, Clock, Phone, ArrowLeft, ImagePlus, FileText, Calendar as CalendarIcon, MessageSquare, BadgeCheck, Building2, Globe, Instagram, Facebook, Users, Wrench, Megaphone } from "lucide-react";
import { ImageViewer } from "@/components/image-viewer";
import { useGetUserByIdQuery, useGetSkillsQuery, useGetProfileQuery, useGetMasterReviewsQuery, useGetMasterBusyDatesQuery } from "@/store/api/authApi";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isWithinInterval } from "date-fns";
import { armeniaRegions } from "@/lib/armenia-regions";
import { Button } from "@/components/ui/button";
import type { LocalizedString, Skill, Portfolio, Technique } from "@/types";
import { getLocalizedName } from "@/utils";
import { SEO } from '@/components/seo';
import { CreateOrderModal } from "@/components/orders/CreateOrderModal";
import { ReviewCard, type Review } from "@/components/reviews/ReviewCard";
import techniqueImg from '@/assets/technique.webp';

const MANAGER_PHONE = "+37493233402";

// Public profile of any user. What it shows depends on the user's role:
// a master gets skills, pricing, schedule, portfolios and "Propose Order";
// a company gets its company info and published announcements; everyone
// gets the basics, their techniques and their reviews.
export default function UserDetailsPageContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requireLogin = useRequireLogin();
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
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  // Which portfolio's photos are open in the big view, and which photo.
  // The portfolio is kept after closing so its photo stays visible while the viewer fades out.
  const [portfolioView, setPortfolioView] = useState<{ portfolio: Portfolio; index: number | null } | null>(null);

  const token = useAppSelector((state) => state.auth.token);
  const { data: profile } = useGetProfileQuery(undefined, { skip: !token });
  const { data: user, isLoading, isError } = useGetUserByIdQuery(id as string, {
    skip: !id,
  });
  const { data: skillsData } = useGetSkillsQuery(undefined);

  const isMasterUser = isMaster(user?.roles);
  const isCompanyUser = isCompany(user?.roles);

  const { data: reviewsData } = useGetMasterReviewsQuery(id as string, { skip: !id });
  const { data: busyDatesData } = useGetMasterBusyDatesQuery(id as string, { skip: !id || !isMasterUser });

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
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4">
        <SEO title={t("user_not_found", "User not found")} />
        <p className="text-slate-500 dark:text-gray-400">{t("user_not_found_desc", "User not found or an error occurred.")}</p>
        <Button variant="outline" onClick={goBack}>
          {t("back", "Back")}
        </Button>
      </div>
    );
  }

  const info = user.userInfo || {};
  const location = getLocalizedLocation(info.regionId, info.cityId);
  const memberSince = user.createdAt ? new Date(user.createdAt).getFullYear() : null;
  const isOwnPage = !!profile && profile.id === user.id;
  const techniques: Technique[] = user.techniques || [];
  const announcements: { id: string; title: string; sphere: string; startDate: string; endDate: string }[] =
    isCompanyUser ? user.announcements || [] : [];
  const hasReviews = !!reviewsData && reviewsData.count > 0;
  const hasCompanyInfo =
    isCompanyUser &&
    (info.website || info.socialInstagram || info.socialFacebook ||
      (info.workingPlaces && info.workingPlaces.length > 0) ||
      (typeof info.workersCount === "number" && info.workersCount > 0));

  // A plain client may have nothing public beyond the header.
  const hasDetails =
    isMasterUser || !!info.about || hasCompanyInfo || techniques.length > 0 ||
    announcements.length > 0 || hasReviews || (user.portfolios?.length ?? 0) > 0;

  const displayName = user.name || (isMasterUser
    ? t("search_unnamed_master", "Unnamed Master")
    : t("unnamed_user", "Unnamed user"));

  const skillsLabel = isMasterUser && info.skills?.length
    ? info.skills.map(getSkillTranslation).join(', ')
    : undefined;
  const seoDescription = isMasterUser
    ? [skillsLabel, location].filter(Boolean).length
      ? t('seo_master_description', 'Contact {{name}}, a construction master in Armenia{{skills}}{{location}}.', {
          name: user.name,
          skills: skillsLabel ? ` specializing in ${skillsLabel}` : '',
          location: location ? ` based in ${location}` : '',
        })
      : undefined
    : info.about?.slice(0, 160) || undefined;

  const fmtDate = (d: string) => format(new Date(d), 'PP');

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title={displayName} description={seoDescription} />
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Button variant="ghost" onClick={goBack} className="mb-4 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-foreground -ms-4">
            <ArrowLeft className="w-4 h-4 me-2" />
            {t("back", "Back")}
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
          {/* Header Section */}
          <div className="bg-brand/5 dark:bg-brand/10 border-b border-slate-100 dark:border-zinc-800 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-1 text-center md:text-start space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div>
                    {/* Only a real uploaded photo opens in the big view, not the placeholder */}
                    <button
                      type="button"
                      onClick={() => user.avatarUrl && setIsAvatarOpen(true)}
                      disabled={!user.avatarUrl}
                      aria-label={t("view_photo", "View photo")}
                      className="block w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-zinc-800 shadow-md overflow-hidden bg-slate-200 dark:bg-zinc-700 shrink-0 enabled:cursor-zoom-in disabled:cursor-default enabled:hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <img
                        src={user.avatarUrl ? getImageUrl(user.avatarUrl) || "" : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                    </button>
                    {user.avatarUrl && (
                      <ImageViewer
                        images={[getImageUrl(user.avatarUrl) || ""]}
                        index={isAvatarOpen ? 0 : null}
                        onIndexChange={(i) => setIsAvatarOpen(i !== null)}
                        title={displayName}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-start justify-start gap-3 text-sm text-start">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                      {displayName}
                      {user.verifiedAt && (
                        <BadgeCheck className="w-5 h-5 text-brand shrink-0" aria-label={t("verified", "Verified")} />
                      )}
                    </h1>
                    {isCompanyUser && (
                      <div className="flex items-center text-slate-500 dark:text-gray-400">
                        <Building2 className="w-4 h-4 me-1" />
                        {t("company", "Company")}
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center text-slate-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 me-1" />
                        {location}
                      </div>
                    )}
                    {memberSince && (
                      <div className="flex items-center text-slate-500 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4 me-1" />
                        {t("member_since", "Member since")} {memberSince}
                      </div>
                    )}
                    {isMasterUser && (
                      <div className="flex gap-4">
                        {isTopRated(reviewsData?.averageRating, reviewsData?.count) && (
                          <div className="flex items-center text-orange-500 font-medium bg-orange-50 dark:bg-orange-500/10 px-0 py-1 rounded-md">
                            <Star className="w-4 h-4 me-1 fill-current" />
                            {t("search_top_rated", "Top Rated")}
                          </div>
                        )}

                        {user.availability === "AVAILABLE" && (
                          <div className="flex items-center text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                            <CheckCircle2 className="w-4 h-4 me-1" />
                            {t("search_available_now", "Available now")}
                          </div>
                        )}
                        {user.availability === "HALF_BUSY" && (
                          <div className="flex items-center text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
                            <Clock className="w-4 h-4 me-1" />
                            {t("search_half_busy", "Partially busy")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  {isMasterUser && profile && !isOwnPage && (
                    <Button onClick={() => setIsOrderModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full md:w-auto">
                      <FileText className="w-4 h-4 me-2" />
                      {t("propose_order", "Propose Order")}
                    </Button>
                  )}
                  {!isOwnPage && (
                    <Button
                      variant="outline"
                      className="w-full md:w-auto border-brand text-brand hover:bg-brand/10 hover:text-brand"
                      onClick={() =>
                        !profile
                          ? requireLogin()
                          : navigate(
                              `/messages/new?recipientId=${user.id}&type=${isCompanyUser && !isMasterUser ? "MASTER_COMPANY" : "USER_MASTER"}` +
                                `&recipientName=${encodeURIComponent(user.name || "")}` +
                                `&recipientAvatar=${encodeURIComponent(user.avatarUrl || "")}`
                            )
                      }
                    >
                      <MessageSquare className="w-4 h-4 me-2" />
                      {t("send_message", "Message")}
                    </Button>
                  )}
                  <Button onClick={() => window.location.href = `tel:${MANAGER_PHONE}`} className="bg-brand hover:bg-brand/90 text-white shadow-sm w-full md:w-auto">
                    <Phone className="w-4 h-4 me-2" />
                    {t("master_details_call_manager", "Call Manager")}
                  </Button>

                  {/* Brigade Link */}
                  {isMasterUser && (() => {
                    const brigade = user.ownedBrigades?.[0] || user.brigadeMemberships?.[0]?.brigade;
                    if (!brigade) return null;
                    return (
                      <div className="mt-2 flex flex-col gap-1.5">
                        <span className="text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider text-center md:text-start">{t("brigade_label", "Brigade")}</span>
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

              {isMasterUser && (
                <div className="flex items-center justify-center md:justify-start gap-12">
                  <div>
                    <div className="text-3xl font-bold text-brand">{user.stats?.customers ?? 0}</div>
                    <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t("profile_customers", "Customers")}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand">{user.stats?.totalJobs ?? 0}</div>
                    <div className="text-sm text-slate-500 dark:text-gray-400 mt-1">{t("profile_total_jobs", "Total Jobs")}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12 space-y-12">

            {!hasDetails && (
              <p className="text-center text-slate-500 dark:text-gray-400">
                {t("user_no_public_info", "This user hasn't added any public information yet.")}
              </p>
            )}

            {/* About */}
            {(isMasterUser || info.about) && (
              <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-6">
                  {isCompanyUser && !isMasterUser
                    ? t("about_company", "About the company")
                    : t("master_details_about", "Short info")}
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {info.about || t("master_details_no_about", "This master hasn't provided a detailed description yet. Contact the manager for more information.")}
                  </p>
                </div>
              </section>
            )}

            {/* Company info */}
            {hasCompanyInfo && (
              <section className="pt-8 border-t border-slate-100 dark:border-zinc-800 space-y-5">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground flex items-center">
                  <Building2 className="w-6 h-6 me-2 text-brand" />
                  {t("user_company_info", "Company info")}
                </h2>
                {typeof info.workersCount === "number" && info.workersCount > 0 && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-gray-300">
                    <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
                    {t("workers_count", { count: info.workersCount, defaultValue: "{{count}} workers" })}
                  </div>
                )}
                {info.workingPlaces && info.workingPlaces.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 mb-2">
                      {t("working_areas", "Working areas")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {info.workingPlaces.map((place: string) => (
                        <span key={place} className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                          {place}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(info.website || info.socialInstagram || info.socialFacebook) && (
                  <div className="flex flex-wrap gap-4">
                    {info.website && (
                      <a href={info.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">
                        <Globe className="w-5 h-5" />
                        {t("website", "Website")}
                      </a>
                    )}
                    {info.socialInstagram && (
                      <a href={info.socialInstagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">
                        <Instagram className="w-5 h-5" />
                        Instagram
                      </a>
                    )}
                    {info.socialFacebook && (
                      <a href={info.socialFacebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-brand transition-colors">
                        <Facebook className="w-5 h-5" />
                        Facebook
                      </a>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Skills */}
            {isMasterUser && info.skills && info.skills.length > 0 && (
              <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                <h2 className="text-2xl font-bold text-brand mb-6">
                  {t("profile_skills", "Skills")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {info.skills.map((skill: string, index: number) => (
                    <div
                      key={index}
                      className="bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {getSkillTranslation(skill)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pricing (if any) */}
            {isMasterUser && info.priceValue && (
              <section className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-6 border border-slate-100 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-foreground mb-2">{t("master_pricing_title", "Pricing Information")}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-brand">{info.priceValue} {t("currency_amd", "AMD")}</span>
                  <span className="text-slate-500 dark:text-gray-400 font-medium">
                    / {info.pricingFormat === 'daily' ? t("search_per_day", "day") : info.pricingFormat === 'sqm' ? t("search_per_sqm", "sqm") : t("search_per_hr", "hr")}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">{t("master_pricing_disclaimer", "Prices are estimates and may vary based on project requirements.")}</p>
              </section>
            )}

            {/* Techniques */}
            {techniques.length > 0 && (
              <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-6 flex items-center">
                  <Wrench className="w-6 h-6 me-2 text-brand" />
                  {t("techniques_page_title", "Techniques")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {techniques.map((technique) => (
                    <Link
                      key={technique.id}
                      to={`/technique/${technique.id}`}
                      className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="aspect-video bg-slate-100 dark:bg-zinc-800">
                        <img
                          src={technique.imageUrls?.[0] ? getImageUrl(technique.imageUrls[0]) || "" : techniqueImg}
                          alt={technique.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = techniqueImg; }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-foreground line-clamp-1">{technique.name}</h3>
                        <p className="text-sm font-medium text-brand mt-1">
                          {technique.price.toLocaleString()} ֏{technique.priceType === 'HOURLY' ? ` / ${t('technique_price_per_hour', 'hr')}` : ''}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Published announcements (companies) */}
            {announcements.length > 0 && (
              <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-6 flex items-center">
                  <Megaphone className="w-6 h-6 me-2 text-brand" />
                  {t("nav_announcements", "Announcements")}
                </h2>
                <div className="grid gap-3">
                  {announcements.map((announcement) => (
                    <AnnouncementCardLink
                      key={announcement.id}
                      id={announcement.id}
                      className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800 p-4 rounded-xl border border-slate-100 dark:border-zinc-800 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-foreground truncate">{announcement.title}</div>
                        <div className="text-sm text-slate-500 dark:text-gray-400 truncate">{announcement.sphere}</div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-gray-400 shrink-0">
                        {fmtDate(announcement.startDate)} – {fmtDate(announcement.endDate)}
                      </div>
                    </AnnouncementCardLink>
                  ))}
                </div>
              </section>
            )}

            {/* Schedule / Busy Days */}
            {isMasterUser && (
              <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-6 flex items-center">
                  <CalendarIcon className="w-6 h-6 me-2 text-brand" />
                  {t("master_schedule", "Schedule")}
                </h2>
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm inline-block">
                  <DayPicker
                    disabled={disabledDays}
                    modifiers={{ busy: disabledDays }}
                    modifiersStyles={{
                      busy: { color: 'white', backgroundColor: '#ef4444' }
                    }}
                    className="mx-auto"
                  />
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>{t("busy_days", "Busy Days")}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Reviews */}
            {(isMasterUser || hasReviews) && (
              <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-6 flex items-center">
                  <MessageSquare className="w-6 h-6 me-2 text-brand" />
                  {t("reviews_title", "Reviews")}
                  {hasReviews && <span className="ms-2 text-slate-500 dark:text-gray-400 text-lg font-normal">({reviewsData.count})</span>}
                </h2>

                {hasReviews ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="text-4xl font-bold text-slate-900 dark:text-foreground">{reviewsData.averageRating.toFixed(1)}</div>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-5 h-5 ${star <= Math.round(reviewsData.averageRating) ? 'fill-orange-400 text-orange-400' : 'fill-slate-200 text-slate-200 dark:fill-zinc-700 dark:text-zinc-700'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500 dark:text-gray-400">{t("average_rating", "Average Rating")}</span>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      {reviewsData.reviews.map((review: Review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <p className="text-slate-500 dark:text-gray-400">{t("no_reviews_yet", "No reviews yet. Be the first to leave one after your order is completed!")}</p>
                  </div>
                )}
              </section>
            )}

            {/* Portfolios */}
            {user.portfolios && user.portfolios.length > 0 && (
              <section className="pt-8 border-t border-slate-100 dark:border-zinc-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-6">{t("profile_portfolios", "Portfolios")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.portfolios.map((port: Portfolio) => (
                    <div key={port.id} className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden group bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all">
                      <div className="aspect-video bg-slate-100 dark:bg-zinc-800 relative">
                        {port.imageUrls?.[0] ? (
                          <button
                            type="button"
                            onClick={() => setPortfolioView({ portfolio: port, index: 0 })}
                            aria-label={t("view_photo", "View photo")}
                            className="block w-full h-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                          >
                            <img src={getImageUrl(port.imageUrls[0]) || ""} className="w-full h-full object-cover transition-opacity hover:opacity-90" alt={port.title} />
                          </button>
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
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPortfolioView({ portfolio: port, index: i + 1 })}
                                aria-label={t("view_photo", "View photo")}
                                className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 dark:bg-zinc-800 cursor-zoom-in hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                              >
                                <img src={getImageUrl(url) || ""} className="w-full h-full object-cover" alt="" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <ImageViewer
                  images={(portfolioView?.portfolio.imageUrls ?? []).map((url) => getImageUrl(url) || "")}
                  index={portfolioView?.index ?? null}
                  onIndexChange={(i) => setPortfolioView((v) => (v ? { ...v, index: i } : v))}
                  title={portfolioView?.portfolio.title || t("profile_portfolios", "Portfolios")}
                />
              </section>
            )}
          </div>
        </div>
        {isMasterUser && profile && (
          <CreateOrderModal
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            masterId={user.id}
            clientId={profile.id}
            masterName={user.name || t("master", "Master")}
          />
        )}
      </div>
    </div>
  );
}
