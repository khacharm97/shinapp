import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Loader2, FileText, CheckCircle2, XCircle, Clock, Search, Hourglass, PackageCheck, Wrench, Plus, Users, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useGetMyOrdersQuery, useGetOrderByIdQuery, useGetProfileQuery } from "@/store/api/authApi";
import { SEO } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl, isMaster, isCompany, getDateLocale } from "@/utils";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { AddOrderModal } from "@/components/orders/AddOrderModal";

export default function MyOrdersPageContent() {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);
  const { data: profile } = useGetProfileQuery(undefined);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "ORDER" | "BRIGADE" | "TECHNIQUE">("ALL");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Any filter change starts again from the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchTerm.trim();
      if (next === debouncedSearch) return;
      setDebouncedSearch(next);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const { data, isLoading, isFetching } = useGetMyOrdersQuery({
    page,
    limit,
    type: filterType === "ALL" ? undefined : filterType,
    status: filterStatus === "ALL" ? undefined : filterStatus,
    search: debouncedSearch || undefined,
  });
  const orders = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  // If the last page empties (e.g. an order moved out of the current status filter), step back.
  if (data && data.totalPages > 0 && page > data.totalPages) setPage(data.totalPages);

  // Turn an enum-style status ("COMPLETION_REQUESTED") into a readable label ("Completion Requested").
  const humanizeStatus = (status: string) =>
    status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  // Open a specific order's details when arriving from a notification link (?orderId=...).
  // Fetched by id since the order may not be on the current page.
  const linkedOrderId = searchParams.get("orderId");
  const { data: linkedOrder, isError: linkedOrderError } = useGetOrderByIdQuery(linkedOrderId as string, {
    skip: !linkedOrderId,
  });
  useEffect(() => {
    if (!linkedOrderId || (!linkedOrder && !linkedOrderError)) return;
    if (linkedOrder) setSelectedOrder(linkedOrder);
    searchParams.delete("orderId");
    setSearchParams(searchParams, { replace: true });
  }, [linkedOrderId, linkedOrder, linkedOrderError, searchParams, setSearchParams]);

  if (isLoading || !profile) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> {t("pending", "Pending")}</Badge>;
      case "ACCEPTED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> {t("accepted", "Accepted")}</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> {t("rejected", "Rejected")}</Badge>;
      case "COMPLETION_REQUESTED":
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"><Hourglass className="w-3 h-3 mr-1" /> {t("status_completion_requested", "Completion Requested")}</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"><PackageCheck className="w-3 h-3 mr-1" /> {t("status_completed", "Completed")}</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700"><XCircle className="w-3 h-3 mr-1" /> {t("status_cancelled", "Cancelled")}</Badge>;
      default:
        return <Badge variant="outline">{humanizeStatus(status)}</Badge>;
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title={t("my_orders", "My Orders")} />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground">{t("my_orders", "My Orders")}</h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">{t("my_orders_desc", "Manage your contracts and service requests.")}</p>
          </div>
          {(isMaster(profile.roles) || isCompany(profile.roles)) && (
            <Button
              className="bg-brand hover:bg-brand/90 text-white shrink-0"
              onClick={() => setIsAddOrderOpen(true)}
            >
              <Plus className="w-4 h-4 me-2" />
              {t("add_order_button", "Add Order")}
            </Button>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <Input
              placeholder={t("search_orders", "Search orders...")}
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {["ALL", "PENDING", "ACCEPTED", "COMPLETION_REQUESTED", "COMPLETED", "REJECTED"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                className={filterStatus === status ? "bg-brand hover:bg-brand/90" : ""}
                onClick={() => { setFilterStatus(status); setPage(1); }}
                size="sm"
              >
                {t(`status_${status.toLowerCase()}`, status === "ALL" ? t("all", "All") : humanizeStatus(status))}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {([
            { value: "ALL", label: t("all", "All"), icon: null },
            { value: "ORDER", label: t("order_type_order", "Orders"), icon: FileText },
            { value: "BRIGADE", label: t("order_type_brigade", "Brigade Orders"), icon: Users },
            { value: "TECHNIQUE", label: t("order_type_technique", "Technique Orders"), icon: Wrench },
          ] as const).map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={filterType === value ? "default" : "outline"}
              className={filterType === value ? "bg-brand hover:bg-brand/90" : ""}
              onClick={() => { setFilterType(value); setPage(1); }}
              size="sm"
            >
              {Icon && <Icon className="w-4 h-4 me-1" />}
              {label}
            </Button>
          ))}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {orders.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-foreground">{t("no_orders_found", "No orders found")}</h3>
              <p className="text-slate-500 dark:text-gray-400 mt-1 max-w-sm">{t("no_orders_found_desc", "You don't have any orders matching your criteria.")}</p>
            </div>
          ) : (
            orders.map((order: any  ) => {
              const isClient = profile.id === order.clientId;
              const otherParty = isClient ? order.master : order.client;
              const roleLabel = isClient
                ? order.technique ? t("technique_owner_label", "Provided by") : t("master", "Master")
                : t("client", "Client");

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 p-5 hover:shadow-md transition-all cursor-pointer flex flex-col h-full group"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400 dark:text-zinc-500">{format(new Date(order.createdAt), "d MMM yyyy", { locale: dateLocale })}</span>
                  </div>

                  {order.technique && (
                    <Badge variant="outline" className="w-fit mb-3 bg-brand/5 dark:bg-brand/10 text-brand border-brand/20">
                      <Wrench className="w-3 h-3 mr-1" /> {order.technique.name}
                    </Badge>
                  )}

                  {order.brigade && (
                    <Badge variant="outline" className="w-fit mb-3 bg-brand/5 dark:bg-brand/10 text-brand border-brand/20">
                      <Users className="w-3 h-3 mr-1" /> {order.brigade.name}
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={otherParty?.avatarUrl ? getImageUrl(otherParty.avatarUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParty?.name || "")}&background=random`}
                      alt={otherParty?.name}
                      className="w-10 h-10 rounded-full object-cover border"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParty?.name || "")}&background=random`; }}
                    />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider">{roleLabel}</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-foreground line-clamp-1">{otherParty?.name || t("unknown", "Unknown")}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-slate-700 dark:text-gray-300 text-sm line-clamp-3 mb-4">{order.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-zinc-800/50 rounded-lg p-3 mt-auto">
                    <div>
                      <p className="text-slate-500 dark:text-gray-400">{t("date", "Date")}</p>
                      <p className="font-medium text-slate-900 dark:text-foreground">
                        {format(new Date(order.startDate), "d MMM", { locale: dateLocale })} - {format(new Date(order.endDate), "d MMM", { locale: dateLocale })}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-gray-400">{t("price", "Price")}</p>
                      <p className="font-medium text-slate-900 dark:text-foreground">{order.price ? `${order.price} ֏` : t("negotiable", "Negotiable")}</p>
                    </div>
                  </div>

                  {order.status === "PENDING" && order.initiatorId !== profile.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <Button className="w-full bg-brand hover:bg-brand/90 text-white" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                        {t("review_order", "Review Order")}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-foreground transition-colors shadow-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
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
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          currentUserId={profile.id}
        />
      )}

      {isAddOrderOpen && (
        <AddOrderModal
          isOpen={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          masterId={profile.id}
        />
      )}
    </div>
  );
}
