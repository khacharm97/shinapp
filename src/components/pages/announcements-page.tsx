import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, CalendarIcon, AlertCircle, ChevronLeft, ChevronRight, MoreHorizontal, Briefcase, ImageIcon, ArrowRight } from "lucide-react";
import { useGetAnnouncementsQuery } from "@/store/api/publicApi";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { getImageUrl } from "@/utils";

export default function AnnouncementsPageContent() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const limit = 9; // Grid of 3x3

  const { data, isLoading, isError } = useGetAnnouncementsQuery({ page, limit });

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">{t("loading_announcements", "Loading announcements...")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">{t("error_loading", "Oops! Something went wrong")}</h2>
          <p className="text-slate-500 mb-6">{t("error_loading_announcements", "We couldn't load the announcements at this time. Please try again later.")}</p>
          <Button onClick={() => window.location.reload()} className="bg-brand text-white hover:bg-brand/90">
            {t("try_again", "Try Again")}
          </Button>
        </div>
      </div>
    );
  }

  const { items: announcements, totalPages } = data || { items: [], totalPages: 1 };

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <SEO title={t('nav_announcements', 'Announcements')} description={t('announcements_meta_desc', 'Browse the latest construction and renovation announcements in Armenia.')} />
      
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            {t("announcements_title", "Latest Announcements")}
          </h1>
          <p className="text-lg text-slate-600">
            {t("announcements_subtitle", "Discover the newest construction projects, job openings, and services from top companies.")}
          </p>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center animate-in fade-in duration-500">
            <div className="bg-brand/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-brand" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{t("no_announcements_title", "No Announcements Yet")}</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {t("no_announcements_desc", "There are currently no active announcements. Check back later for new updates!")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((announcement: any  , i: number) => {
              const companyName = announcement.company?.name || "Unknown Company";
              const isUrgent = announcement.urgent;
              const formattedDate = new Date(announcement.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <Link
                  to={`/announcements/${announcement.id}`}
                  key={announcement.id}
                  className={`group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col border relative animate-in fade-in slide-in-from-bottom-8 hover:-translate-y-2
                    ${isUrgent ? 'border-red-200' : 'border-slate-100'}
                  `}
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                >
                  {isUrgent && (
                    <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 z-20 pointer-events-none">
                      <div className="absolute transform rotate-45 bg-red-500 text-white text-[10px] font-bold py-1 right-[-35px] top-[32px] w-[170px] text-center shadow-md animate-pulse">
                        {t("urgent", "URGENT")}
                      </div>
                    </div>
                  )}

                  {/* Announcement Banner Image */}
                  {announcement.imageUrls && announcement.imageUrls.length > 0 && (
                    <div className="w-full h-48 overflow-hidden relative z-0">
                      <img 
                        src={getImageUrl(announcement.imageUrls[0])} 
                        alt={announcement.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Gradient overlay for better text contrast if we ever put text on it, or just to make it look premium */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                      
                      {announcement.imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm shadow-sm flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>{announcement.imageUrls.length}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col relative z-10 bg-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shadow-inner flex-shrink-0 border border-slate-200">
                        {announcement.company?.avatarUrl ? (
                          <img 
                            src={getImageUrl(announcement.company.avatarUrl)} 
                            alt={companyName} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand/5 text-brand font-bold text-xl">
                            {companyName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate text-lg group-hover:text-brand transition-colors">{companyName}</h4>
                        <p className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full inline-block mt-1 font-medium truncate max-w-full">
                          {announcement.sphere}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-3 line-clamp-2 leading-tight">
                      {announcement.title}
                    </h3>
                    
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                      {announcement.description}
                    </p>

                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-auto">
                      <div className="flex items-center gap-1.5 font-medium">
                        <CalendarIcon className="w-4 h-4 text-brand/70" />
                        <span>{formattedDate}</span>
                      </div>

                      <span className="flex items-center gap-1 text-brand font-semibold group-hover:gap-2 transition-all">
                        {t("view_details", "View details")}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12 animate-in fade-in duration-1000">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
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
                      className={`w-9 h-9 rounded-full font-semibold transition-all ${page === pageNum ? "bg-brand hover:bg-brand/90 text-white shadow-md scale-105" : "text-slate-600 hover:bg-slate-100"}`}
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
                    <div key={pageNum} className="w-9 h-9 flex items-center justify-center text-slate-400">
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
              className="rounded-full w-10 h-10 border-slate-200 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
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
