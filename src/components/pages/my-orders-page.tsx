import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Loader2, FileText, CheckCircle2, XCircle, Clock, Search, Filter } from "lucide-react";
import { useGetMyOrdersQuery, useGetProfileQuery } from "@/store/api/authApi";
import { SEO } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageUrl } from "@/utils";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";

export default function MyOrdersPageContent() {
  const { t } = useTranslation();
  const { data: profile } = useGetProfileQuery(undefined);
  const { data: orders, isLoading } = useGetMyOrdersQuery(undefined);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (isLoading || !profile) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const filteredOrders = orders?.filter((order: any) => {
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
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200"><Clock className="w-3 h-3 mr-1"/> {t("pending", "Pending")}</Badge>;
      case "ACCEPTED":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1"/> {t("accepted", "Accepted")}</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1"/> {t("rejected", "Rejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title={t("my_orders", "My Orders")} />
      
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("my_orders", "My Orders")}</h1>
            <p className="text-slate-500 mt-1">{t("my_orders_desc", "Manage your contracts and service requests.")}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder={t("search_orders", "Search orders...")}
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((status) => (
              <Button 
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                className={filterStatus === status ? "bg-brand hover:bg-brand/90" : ""}
                onClick={() => setFilterStatus(status)}
                size="sm"
              >
                {t(`status_${status.toLowerCase()}`, status)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">{t("no_orders_found", "No orders found")}</h3>
              <p className="text-slate-500 mt-1 max-w-sm">{t("no_orders_found_desc", "You don't have any orders matching your criteria.")}</p>
            </div>
          ) : (
            filteredOrders.map((order: any) => {
              const isClient = profile.id === order.clientId;
              const otherParty = isClient ? order.master : order.client;
              const roleLabel = isClient ? t("master", "Master") : t("client", "Client");

              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all cursor-pointer flex flex-col h-full group"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-slate-400">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={getImageUrl(otherParty?.avatarUrl)} 
                      alt={otherParty?.name}
                      className="w-10 h-10 rounded-full object-cover border"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${otherParty?.name}&background=random`; }}
                    />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{roleLabel}</p>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{otherParty?.name || t("unknown", "Unknown")}</p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-slate-700 text-sm line-clamp-3 mb-4">{order.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-lg p-3 mt-auto">
                    <div>
                      <p className="text-slate-500">{t("date", "Date")}</p>
                      <p className="font-medium text-slate-900">
                        {format(new Date(order.startDate), "MMM d")} - {format(new Date(order.endDate), "MMM d")}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t("price", "Price")}</p>
                      <p className="font-medium text-slate-900">{order.price ? `${order.price} ֏` : t("negotiable", "Negotiable")}</p>
                    </div>
                  </div>

                  {order.status === "PENDING" && order.initiatorId !== profile.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
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
    </div>
  );
}
