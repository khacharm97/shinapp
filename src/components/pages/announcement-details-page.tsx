import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  CalendarIcon,
  MapPin,
  Phone,
  Globe,
  BadgeCheck,
  Briefcase,
  Users,
  Hash,
  Clock,
  Instagram,
  Facebook,
  MessageSquare,
} from "lucide-react";
import { useGetAnnouncementByIdQuery } from "@/store/api/publicApi";
import { useAppSelector } from "@/store/hooks";
import { armeniaRegions } from "@/lib/armenia-regions";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { getImageUrl, getLocalizedName } from "@/utils";
import type { LocalizedString } from "@/types";

export default function AnnouncementDetailsPageContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [activeImage, setActiveImage] = useState(0);

  const { data: announcement, isLoading, isError } = useGetAnnouncementByIdQuery(
    id as string,
    { skip: !id }
  );

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/announcements");
  };

  const getLocalizedLocation = (regionId?: string | null, cityId?: string | null) => {
    if (!regionId) return "";
    const region = armeniaRegions.find((r) => r.id === regionId);
    if (!region) return "";
    const name = (item: LocalizedString) => getLocalizedName(item, i18n.language);
    let loc = name(region);
    if (cityId) {
      const city = region.cities.find((c) => c.id === cityId);
      if (city) loc = `${name(city)}, ${loc}`;
    }
    return loc;
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <p className="text-slate-500 dark:text-gray-400 font-medium animate-pulse">
          {t("loading_announcement", "Loading announcement...")}
        </p>
      </div>
    );
  }

  if (isError || !announcement) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm text-center max-w-md border border-red-100 dark:border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-foreground mb-2">
            {t("announcement_not_found", "Announcement not found")}
          </h2>
          <p className="text-slate-500 dark:text-gray-400 mb-6">
            {t(
              "announcement_not_found_desc",
              "This announcement may have been removed or is no longer published."
            )}
          </p>
          <Button onClick={goBack} className="bg-brand text-white hover:bg-brand/90">
            {t("back_to_announcements", "Back to announcements")}
          </Button>
        </div>
      </div>
    );
  }

  const company = announcement.company || {};
  const info = company.userInfo || {};
  const companyName = company.name || t("unknown_company", "Unknown Company");
  const images: string[] = announcement.imageUrls || [];
  const location = getLocalizedLocation(info.regionId, info.cityId);
  const memberSince = company.createdAt
    ? new Date(company.createdAt).getFullYear()
    : null;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] py-10 px-4 sm:px-6 lg:px-8">
      <SEO
        title={announcement.title}
        description={announcement.description?.slice(0, 160)}
      />

      <div className="max-w-5xl mx-auto">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-brand transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back", "Back")}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <img
                    src={getImageUrl(images[activeImage])}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3 flex-wrap">
                    {images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          i === activeImage
                            ? "border-brand ring-2 ring-brand/20"
                            : "border-slate-200 hover:border-slate-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                        }`}
                      >
                        <img
                          src={getImageUrl(url)}
                          alt={`${announcement.title} ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 p-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {announcement.urgent && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full">
                    {t("urgent", "URGENT")}
                  </span>
                )}
                <span className="text-xs font-medium text-slate-600 dark:text-gray-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  {announcement.sphere}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-foreground mb-4">
                {announcement.title}
              </h1>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-brand/70" />
                  <span>
                    {t("posted", "Posted")} {fmtDate(announcement.createdAt)}
                  </span>
                </div>
                {announcement.startDate && announcement.endDate && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand/70" />
                    <span>
                      {fmtDate(announcement.startDate)} – {fmtDate(announcement.endDate)}
                    </span>
                  </div>
                )}
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {announcement.description}
                </p>
              </div>
            </div>
          </div>

          {/* Company sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 p-6 lg:sticky lg:top-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex-shrink-0">
                  {company.avatarUrl ? (
                    <img
                      src={getImageUrl(company.avatarUrl)}
                      alt={companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand/5 dark:bg-brand/10 text-brand font-bold text-2xl">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-slate-900 dark:text-foreground text-lg truncate">
                      {companyName}
                    </h2>
                    {company.verifiedAt && (
                      <BadgeCheck className="w-5 h-5 text-brand flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    {t("company", "Company")}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm text-slate-600 dark:text-gray-300">
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                    <span>{location}</span>
                  </div>
                )}
                {memberSince && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                    <span>
                      {t("member_since", "Member since")} {memberSince}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                  <span>
                    {t("published_announcements_count", {
                      count: announcement.companyAnnouncementsCount ?? 0,
                      defaultValue: "{{count}} published announcements",
                    })}
                  </span>
                </div>
                {typeof info.workersCount === "number" && info.workersCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                    <span>
                      {t("workers_count", {
                        count: info.workersCount,
                        defaultValue: "{{count}} workers",
                      })}
                    </span>
                  </div>
                )}
                {info.itn && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                    <span>
                      {t("itn", "TIN")}: {info.itn}
                    </span>
                  </div>
                )}
              </div>

              {info.about && (
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 mb-1.5">
                    {t("about_company", "About the company")}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-6">
                    {info.about}
                  </p>
                </div>
              )}

              {info.workingPlaces && info.workingPlaces.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500 mb-2">
                    {t("working_areas", "Working areas")}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {info.workingPlaces.map((place: string) => (
                      <span
                        key={place}
                        className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-gray-300 px-2.5 py-1 rounded-full"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(info.website || info.socialInstagram || info.socialFacebook) && (
                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap gap-3">
                  {info.website && (
                    <a
                      href={info.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 dark:text-zinc-500 hover:text-brand transition-colors"
                      aria-label={t("website", "Website")}
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {info.socialInstagram && (
                    <a
                      href={info.socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 dark:text-zinc-500 hover:text-brand transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {info.socialFacebook && (
                    <a
                      href={info.socialFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 dark:text-zinc-500 hover:text-brand transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                {(!currentUser || currentUser.id !== company.id) && (
                  <Button
                    className="w-full bg-brand text-white hover:bg-brand/90"
                    onClick={() =>
                      !currentUser
                        ? navigate("/login")
                        : navigate(
                            `/messages/new?recipientId=${company.id}&type=MASTER_COMPANY` +
                              `&announcementId=${announcement.id}` +
                              `&recipientName=${encodeURIComponent(companyName)}` +
                              `&recipientAvatar=${encodeURIComponent(company.avatarUrl || "")}`
                          )
                    }
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t("message_company", "Message company")}
                  </Button>
                )}
                {company.phone && (
                  <a href={`tel:${company.phone}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4" />
                      {t("call", "Call")} {company.phone}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
