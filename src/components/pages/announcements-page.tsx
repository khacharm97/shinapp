import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Briefcase,
  ImageIcon,
  ArrowRight,
  Search,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { useGetAnnouncementsQuery } from "@/store/api/publicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { armeniaRegions } from "@/lib/armenia-regions";
import { SEO } from "@/components/seo";
import { getImageUrl, getLocalizedName } from "@/utils";

export default function AnnouncementsPageContent() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [regionId, setRegionId] = useState("");
  const limit = 10;

  const { data, isLoading, isError } = useGetAnnouncementsQuery({ page, limit });

  const getLocalizedLocation = (rId?: string | null, cId?: string | null) => {
    if (!rId) return "";
    const region = armeniaRegions.find((r) => r.id === rId);
    if (!region) return "";
    let loc = getLocalizedName(region, i18n.language);
    if (cId) {
      const city = region.cities.find((c) => c.id === cId);
      if (city) loc = `${getLocalizedName(city, i18n.language)}, ${loc}`;
    }
    return loc;
  };

  const { items: pageAnnouncements, totalPages } = data || { items: [], totalPages: 1 };

  const isFiltering = !!search.trim() || !!regionId;

  const filteredAnnouncements = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pageAnnouncements.filter((a: any) => {
      const matchesQuery =
        !q ||
        a.title?.toLowerCase().includes(q) ||
        a.sphere?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q);
      const matchesRegion = !regionId || a.company?.userInfo?.regionId === regionId;
      return matchesQuery && matchesRegion;
    });
  }, [pageAnnouncements, search, regionId]);

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <p className="text-slate-500 dark:text-gray-400 font-medium animate-pulse">{t("loading_announcements", "Loading announcements...")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm text-center max-w-md border border-red-100 dark:border-red-500/30">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-foreground mb-2">{t("error_loading", "Oops! Something went wrong")}</h2>
          <p className="text-slate-500 dark:text-gray-400 mb-6">{t("error_loading_announcements", "We couldn't load the announcements at this time. Please try again later.")}</p>
          <Button onClick={() => window.location.reload()} className="bg-brand text-white hover:bg-brand/90">
            {t("try_again", "Try Again")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8">
      <SEO title={t('nav_announcements', 'Announcements')} description={t('announcements_meta_desc', 'Browse the latest construction and renovation announcements in Armenia.')} />

      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-brand tracking-tight mb-4 leading-tight">
            {t("announcements_title", "Latest Announcements")}
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-300">
            {t("announcements_subtitle", "Discover the newest construction projects, job openings, and services from top companies.")}
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 p-3 flex flex-col md:flex-row gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("announcements_search_placeholder", "Search announcements...")}
              className="pl-10 h-11 border-slate-200 dark:border-zinc-700"
            />
          </div>
          <div className="md:w-56">
            <Select value={regionId} onValueChange={(val) => setRegionId(val === "all" ? "" : val)}>
              <SelectTrigger className="h-11 data-[size=default]:h-11 w-full border-slate-200 dark:border-zinc-700">
                <SelectValue placeholder={t("search_regions_placeholder", "Regions")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("search_all_regions", "All Regions")}</SelectItem>
                {armeniaRegions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {getLocalizedName(r, i18n.language)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="h-11 px-8 bg-brand hover:bg-brand/90 text-white font-bold">
            {t("search_button", "Search")}
          </Button>
        </form>

        <h2 className="text-lg font-bold text-brand">
          {t("announcements_results_count", "{{count}} announcements found", { count: filteredAnnouncements.length })}
        </h2>

        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 text-center animate-in fade-in duration-500">
            <div className="bg-brand/5 dark:bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-brand" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-foreground mb-2">
              {isFiltering ? t("no_announcements_match_title", "No Matching Announcements") : t("no_announcements_title", "No Announcements Yet")}
            </h3>
            <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto">
              {isFiltering
                ? t("no_announcements_match_desc", "Try a different search term or region.")
                : t("no_announcements_desc", "There are currently no active announcements. Check back later for new updates!")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredAnnouncements.map((announcement: any, i: number) => {
              const companyName = announcement.company?.name || t("unknown_company", "Unknown Company");
              const isUrgent = announcement.urgent;
              const isVerified = !!announcement.company?.verifiedAt;
              const location = getLocalizedLocation(announcement.company?.userInfo?.regionId, announcement.company?.userInfo?.cityId);
              const posted = formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true });

              return (
                <Link
                  to={`/announcements/${announcement.id}`}
                  key={announcement.id}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:shadow-lg hover:border-brand/20 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row gap-5 p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <div className="w-full sm:w-40 h-40 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 relative">
                    {announcement.imageUrls && announcement.imageUrls.length > 0 ? (
                      <img
                        src={getImageUrl(announcement.imageUrls[0])}
                        alt={announcement.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                      <span className="truncate">{announcement.sphere}</span>
                      {isVerified && (
                        <span className="flex items-center gap-1 text-brand font-semibold shrink-0">
                          <BadgeCheck className="w-4 h-4" />
                          {t("verified", "Verified")}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-foreground group-hover:text-brand transition-colors line-clamp-1">
                      {announcement.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-gray-400">
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {location}
                        </span>
                      )}
                      {location && <span>&middot;</span>}
                      <span>{t("posted", "Posted")} {posted}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-7 h-7 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                        {announcement.company?.avatarUrl ? (
                          <img src={getImageUrl(announcement.company.avatarUrl)} alt={companyName} className="w-full h-full object-cover" />
                        ) : (
                          companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm text-slate-600 dark:text-gray-300 truncate">{companyName}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-zinc-800 sm:pl-5">
                    {isUrgent && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                        {t("urgent", "URGENT")}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-brand font-semibold text-sm group-hover:gap-2 transition-all shrink-0 whitespace-nowrap">
                      {t("view_details", "View details")}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination - only meaningful when browsing the unfiltered, server-paginated list */}
        {!isFiltering && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 animate-in fade-in duration-1000">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-foreground transition-colors shadow-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1.5 rounded-full shadow-sm border border-slate-100 dark:border-zinc-800">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "ghost"}
                      size="sm"
                      className={`w-9 h-9 rounded-full font-semibold transition-all ${page === pageNum ? "bg-brand hover:bg-brand/90 text-white shadow-md scale-105" : "text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-zinc-800"}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  pageNum === page - 2 ||
                  pageNum === page + 2
                ) {
                  return (
                    <div key={pageNum} className="w-9 h-9 flex items-center justify-center text-slate-400 dark:text-zinc-500">
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-foreground transition-colors shadow-sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
