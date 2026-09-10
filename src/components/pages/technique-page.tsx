import { getImageUrl } from '@/utils';
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Wrench } from "lucide-react";
import { useGetTechniquesQuery } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import type { Technique } from "@/types";
import { SEO } from "@/components/seo";
import techniqueImg from '@/assets/technique.webp';

export default function TechniquePageContent() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const limit = 9;

  const { data, isLoading, isError } = useGetTechniquesQuery({ page, limit, search });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const formatPrice = (technique: Technique) =>
    `${technique.price.toLocaleString()} ֏${technique.priceType === 'HOURLY' ? ` / ${t('technique_price_per_hour', 'hr')}` : ''}`;

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <p className="text-red-500">{t('error_loading_techniques', 'Failed to load techniques.')}</p>
      </div>
    );
  }

  const { items: techniques, totalPages } = data || { items: [], totalPages: 1 };

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title={t('nav_technique', 'Technique')} />
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-brand">
            {t("techniques_page_title", "Techniques")}
          </h1>

          <form onSubmit={handleSearch} className="flex w-full md:w-[400px] bg-white dark:bg-zinc-900 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('techniques_search_placeholder', 'Search techniques...')}
              className="flex-1 min-w-0 h-10 bg-transparent border-none px-3 text-sm text-black dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0"
            />
            <Button type="submit" className="h-10 px-4 rounded-lg bg-brand text-white hover:bg-brand/90 text-[16px] font-bold shrink-0">
              {t('search_button', 'Search')}
            </Button>
          </form>
        </div>

        {techniques.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm text-center">
            <p className="text-slate-500 dark:text-gray-400">{t("no_techniques_found", "No techniques found.")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {techniques.map((technique) => (
              <Link
                to={`/technique/${technique.id}`}
                key={technique.id}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden flex flex-col hover:shadow-md transition-all group"
              >
                <div className="aspect-video bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={technique.imageUrls?.[0] ? getImageUrl(technique.imageUrls[0]) || "" : techniqueImg}
                    alt={technique.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = techniqueImg; }}
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-foreground mb-1 line-clamp-1 group-hover:text-brand transition-colors">
                    {technique.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                    {technique.description || t("no_description_provided", "No description provided.")}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-brand font-bold">{formatPrice(technique)}</span>
                    {technique.owner?.name && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 truncate max-w-[120px]">
                        <Wrench className="w-3.5 h-3.5 shrink-0" />
                        {technique.owner.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

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
                } else if (pageNum === page - 2 || pageNum === page + 2) {
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
