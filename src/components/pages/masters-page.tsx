import { getImageUrl } from '@/utils';
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin, Star, CheckCircle2, Phone, Mail, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useGetMastersQuery } from "@/store/api/authApi";
import { armeniaRegions } from "@/lib/armenia-regions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/store/hooks";
import type { LocalizedString, Master } from "@/types";
import { getLocalizedName } from "@/utils";
import { SEO } from "@/components/seo";

// Manager contact details
const MANAGER_PHONE = "+37493233402";
const MANAGER_PHONE_DISPLAY = "+374(93)-23-34-02";
const MANAGER_EMAIL = "info@shinapp.am";

export default function MastersPageContent() {
  const { t, i18n } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 5;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const { data, isLoading, isError } = useGetMastersQuery({ page, limit });

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

  const getLocalizedSkills = (skills?: string[] | null) => {
    if (!skills || skills.length === 0) return "";
    return skills.map(skill => {
      switch(skill) {
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

  if (isError) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center">
        <p className="text-red-500">Failed to load masters.</p>
      </div>
    );
  }

  const { items: masters, totalPages } = data || { items: [], totalPages: 1 };

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title={t('nav_masters', 'Masters')} />
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-brand">
            {t("nav_masters", "Masters")}
          </h1>
          
          <form onSubmit={handleSearch} className="flex w-full md:w-[400px] bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', 'Search...')}
              className="flex-1 min-w-0 h-10 bg-transparent border-none px-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
            <Button type="submit" className="h-10 px-4 rounded-lg bg-brand text-white hover:bg-brand/90 text-[16px] font-bold shrink-0">
              {t('search_button', 'Search')}
            </Button>
          </form>
        </div>

        {masters.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
            <p className="text-slate-500">No masters found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {masters.map((master: Master) => {
              const isCurrentUser = user?.id === master.id;
              
              return (
              <div key={master.id} className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md relative ${isCurrentUser ? 'border-2 border-brand' : 'border border-slate-100'}`}>
                {isCurrentUser && (
                  <div className="absolute top-0 end-0 bg-brand text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 shadow-sm">
                    {t("profile_this_is_you", "Your Profile")}
                  </div>
                )}
                
                {/* Profile Image */}
                <div className="w-full md:w-72 md:min-w-72 p-6 md:p-8 flex items-center justify-center bg-slate-50/50 relative shrink-0 border-b md:border-b-0 md:border-r border-slate-100">
                  <Link to={`/masters/${master.id}`} className={`w-48 h-48 md:w-52 md:h-52 rounded-full border-4 shadow-sm overflow-hidden bg-slate-200 block transition-transform hover:scale-[1.02] ${isCurrentUser ? 'border-brand/20' : 'border-white'}`}>
                    <img
                      src={master.avatarUrl ? getImageUrl(master.avatarUrl) || "" : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
                      alt={master.name || "Master"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                      }}
                    />
                  </Link>
                </div>

                {/* Profile Info */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/masters/${master.id}`}>
                      <h2 className="text-2xl font-bold text-slate-900 mb-1 hover:text-brand transition-colors">
                        {master.name || "Unnamed Master"}
                      </h2>
                    </Link>
                    <p className="text-lg text-slate-600 font-medium mb-3">
                      {getLocalizedSkills(master.userInfo?.skills)}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                      {master.userInfo?.regionId && (
                        <div className="flex items-center text-slate-500">
                          <MapPin className="w-4 h-4 me-1" />
                          {getLocalizedLocation(master.userInfo?.regionId, master.userInfo?.cityId)}
                        </div>
                      )}
                      
                      {master.userInfo?.priceValue && (
                        <div className="text-slate-500">
                          Minimal price {master.userInfo.priceValue} AMD/{master.userInfo.pricingFormat === 'daily' ? 'day' : master.userInfo.pricingFormat === 'sqm' ? 'sqm' : 'hr'}
                        </div>
                      )}

                      <div className="flex items-center text-orange-500 font-medium">
                        <Star className="w-4 h-4 me-1 fill-current" />
                        Top Rated
                      </div>

                      <div className="flex items-center text-green-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 me-1" />
                        Available now
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-slate-900 mb-2">About me</h3>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                        {master.userInfo?.about || "This master hasn't provided a description yet."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button asChild variant="outline" className="font-medium rounded-md px-6">
                      <Link to={`/masters/${master.id}`}>View Profile</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-brand hover:bg-brand/90 text-white font-medium rounded-md px-6">
                          {t("contact_master", "Kap masnageti het")}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem onClick={() => window.location.href = `tel:${MANAGER_PHONE}`} className="cursor-pointer">
                          <Phone className="me-2 h-4 w-4" />
                          <span>{MANAGER_PHONE_DISPLAY}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `mailto:${MANAGER_EMAIL}`} className="cursor-pointer">
                          <Mail className="me-2 h-4 w-4" />
                          <span>Email Manager</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show first, last, current, and adjacent pages
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
                      className={`w-9 h-9 ${page === pageNum ? "bg-brand hover:bg-brand/90 text-white" : ""}`}
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
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
