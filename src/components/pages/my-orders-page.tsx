import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Loader2, FileText, CheckCircle2, XCircle, Clock, Search, Hourglass, PackageCheck, Wrench, Plus } from "lucide-react";
import { useGetMyOrdersQuery, useGetProfileQuery } from "@/store/api/authApi";
import { SEO } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl, isMaster, isCompany } from "@/utils";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { AddOrderModal } from "@/components/orders/AddOrderModal";

export default function MyOrdersPageContent() {
  const { t } = useTranslation();
  const { data: profile } = useGetProfileQuery(undefined);
  const { data: orders, isLoading } = useGetMyOrdersQuery(undefined);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

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
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId || !orders) return;
    const match = orders.find((o: any) => o.id === orderId);
    if (match) {
      setSelectedOrder(match);
      searchParams.delete("orderId");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, orders, setSearchParams]);

  if (isLoading || !profile) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const filteredOrders = orders?.filter((order: any  ) => {
    const matchesSearch =
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.master?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

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
                onClick={() => setFilterStatus(status)}
                size="sm"
              >
                {t(`status_${status.toLowerCase()}`, status === "ALL" ? t("all", "All") : humanizeStatus(status))}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-foreground">{t("no_orders_found", "No orders found")}</h3>
              <p className="text-slate-500 dark:text-gray-400 mt-1 max-w-sm">{t("no_orders_found_desc", "You don't have any orders matching your criteria.")}</p>
            </div>
          ) : (
            filteredOrders.map((order: any  ) => {
              const isClient = profile.id === order.clientId;
              const otherParty = isClient ? order.master : order.client;
              const roleLabel = isClient ? t("master", "Master") : t("client", "Client");

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 p-5 hover:shadow-md transition-all cursor-pointer flex flex-col h-full group"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400 dark:text-zinc-500">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                  </div>

                  {order.technique && (
                    <Badge variant="outline" className="w-fit mb-3 bg-brand/5 dark:bg-brand/10 text-brand border-brand/20">
                      <Wrench className="w-3 h-3 mr-1" /> {order.technique.name}
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
                        {format(new Date(order.startDate), "MMM d")} - {format(new Date(order.endDate), "MMM d")}
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
