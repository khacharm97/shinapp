import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin, Star, CheckCircle2, Phone, Mail, ChevronLeft, ChevronRight, MoreHorizontal, Search, X } from "lucide-react";
import { useGlobalSearchQuery } from "@/store/api/authApi";
import { armeniaRegions } from "@/lib/armenia-regions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/store/hooks";

const MANAGER_PHONE = "+37493233402";
const MANAGER_PHONE_DISPLAY = "+374(93)-23-34-02";
const MANAGER_EMAIL = "info@shinapp.am";

export default function SearchPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);
  
  const [page, setPage] = useState(1);
  const [topRated, setTopRated] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [regionId, setRegionId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to page 1 on new search
      
      const newParams = new URLSearchParams(searchParams);
      if (searchInput) {
        newParams.set("q", searchInput);
      } else {
        newParams.delete("q");
      }
      setSearchParams(newParams, { replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  const { data, isLoading, isError } = useGlobalSearchQuery({ 
    page, 
    limit, 
    search: debouncedSearch,
    regionId: regionId || undefined,
    cityId: cityId || undefined,
    topRated: topRated || undefined,
    availableNow: availableNow || undefined,
  });

  const getLocalizedLocation = (rId?: string | null, cId?: string | null) => {
    if (!rId) return "";
    const region = armeniaRegions.find((r) => r.id === rId);
    if (!region) return "";

    const getLocName = (item: any) => {
      if (i18n.language === "am") return item.nameAm;
      if (i18n.language === "ru") return item.nameRu;
      return item.nameEn;
    };

    let loc = getLocName(region);
    if (cId) {
      const city = region.cities.find((c) => c.id === cId);
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

  const { items: masters, totalPages } = data?.masters || { items: [], totalPages: 1 };

  const selectedRegion = armeniaRegions.find((r) => r.id === regionId);

  return (
    <div className="flex-1 w-full bg-white min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Search Bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-2xl border border-gray-300 rounded-lg shadow-sm flex items-center px-4 h-14 bg-white transition-shadow focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand">
            <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search skills, example shinarar..."
              className="flex-1 min-w-0 bg-transparent border-none focus:outline-none text-base text-gray-900"
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 shrink-0">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                Talent badge
                <div className="ml-2 w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-500 font-bold cursor-help" title="These badges help you identify the best talent.">?</div>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="top-rated" 
                    checked={topRated}
                    onCheckedChange={(c) => { setTopRated(c === true); setPage(1); }}
                  />
                  <Label htmlFor="top-rated" className="flex items-center cursor-pointer text-gray-700 font-medium">
                    <Star className="w-4 h-4 text-orange-500 fill-orange-500 mr-2" />
                    Top Rated
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="available-now" 
                    checked={availableNow}
                    onCheckedChange={(c) => { setAvailableNow(c === true); setPage(1); }}
                  />
                  <Label htmlFor="available-now" className="flex items-center cursor-pointer text-gray-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                    Available now
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Location</h3>
              <div className="space-y-4">
                <div>
                  <Select 
                    value={regionId} 
                    onValueChange={(val) => { 
                      setRegionId(val === "all" ? "" : val); 
                      setCityId(""); 
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300">
                      <SelectValue placeholder="Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {armeniaRegions.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {i18n.language === 'am' ? r.nameAm : r.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {regionId && selectedRegion && selectedRegion.cities.length > 0 && (
                  <div>
                    <Select 
                      value={cityId} 
                      onValueChange={(val) => { setCityId(val === "all" ? "" : val); setPage(1); }}
                    >
                      <SelectTrigger className="w-full bg-white border-gray-300">
                        <SelectValue placeholder="City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        {selectedRegion.cities.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {i18n.language === 'am' ? c.nameAm : c.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
              </div>
            ) : isError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                Failed to load search results.
              </div>
            ) : masters.length === 0 ? (
              <div className="bg-gray-50 border border-gray-100 p-12 rounded-xl text-center">
                <p className="text-gray-500 text-lg">No masters found matching your criteria.</p>
              </div>
            ) : (
              <>
                {masters.map((master: any) => {
                  const isCurrentUser = user?.id === master.id;
                  
                  return (
                  <div key={master.id} className={`bg-gray-50 rounded-xl overflow-hidden flex flex-col md:flex-row p-6 relative ${isCurrentUser ? 'ring-2 ring-brand' : ''}`}>
                    {isCurrentUser && (
                      <div className="absolute top-0 right-0 bg-brand text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 shadow-sm">
                        {t("profile_this_is_you", "Your Profile")}
                      </div>
                    )}
                    
                    {/* Profile Image */}
                    <div className="w-full md:w-48 shrink-0 flex flex-col items-center mb-6 md:mb-0 md:mr-6">
                      <div className="relative">
                        <Link to={`/masters/${master.id}`} className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden block shadow-sm bg-white border border-gray-200 hover:opacity-90 transition-opacity">
                          <img
                            src={master.avatarUrl ? `${import.meta.env.VITE_BACK_URL || 'http://localhost:3000'}${master.avatarUrl}` : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
                            alt={master.name || "Master"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                            }}
                          />
                        </Link>
                        {/* Online Indicator Dot */}
                        <div className="absolute top-2 left-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 flex flex-col justify-center">
                      <Link to={`/masters/${master.id}`} className="block w-max hover:text-brand transition-colors">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          {master.name || "Unnamed Master"}
                        </h2>
                      </Link>
                      <p className="text-gray-700 font-medium mb-3">
                        {getLocalizedSkills(master.userInfo?.skills) || "No specific skills listed"}
                        {master.userInfo?.regionId && (
                           <span className="text-gray-500 ml-2 font-normal">
                             {getLocalizedLocation(master.userInfo?.regionId, master.userInfo?.cityId)}
                           </span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-4">
                        {master.userInfo?.priceValue && (
                          <div className="text-gray-600 font-medium">
                            Minimal price {master.userInfo.priceValue} AMD/{master.userInfo.pricingFormat === 'daily' ? 'day' : master.userInfo.pricingFormat === 'sqm' ? 'sqm' : 'hr'}
                          </div>
                        )}

                        <div className="flex items-center text-orange-500 font-medium">
                          <Star className="w-4 h-4 fill-current mr-1" />
                          Top Rated
                        </div>

                        <div className="flex items-center text-green-600 font-medium">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Available now
                        </div>
                      </div>

                      {/* Tags */}
                      {master.userInfo?.skills && master.userInfo.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {master.userInfo.skills.slice(0, 6).map((skill: string) => (
                            <span key={skill} className="bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
                              {skill}
                            </span>
                          ))}
                          {master.userInfo.skills.length > 6 && (
                            <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
                              +{master.userInfo.skills.length - 6}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">About me</h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {master.userInfo?.about || "Research and brainstorm. Think about your background, education, awards, skills and other attributes..."}
                        </p>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 pt-8 border-t border-gray-100">
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
      </div>
    </div>
  );
}
