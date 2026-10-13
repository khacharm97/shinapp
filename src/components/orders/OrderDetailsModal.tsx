import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useUpdateOrderMutation,
  useRequestOrderCompletionMutation,
  useAcceptOrderCompletionMutation,
  useAssignOrderMembersMutation,
  useGetBrigadeByIdQuery,
} from "@/store/api/authApi";
import { LeaveReviewModal } from "./LeaveReviewModal";
import { getDateLocale, getImageUrl, resolveApiErrorMessage } from "@/utils";
import { MapPin, Calendar, CreditCard, DollarSign, MessageSquare, Wrench, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any  ;
  currentUserId: string;
}

export function OrderDetailsModal({ isOpen, onClose, order, currentUserId }: OrderDetailsModalProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = getDateLocale(i18n.language);
  const formatDate = (d: string) => format(new Date(d), "d MMM yyyy", { locale: dateLocale });
  const navigate = useNavigate();
  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [requestCompletion, { isLoading: isRequestingCompletion }] = useRequestOrderCompletionMutation();
  const [acceptCompletion, { isLoading: isAcceptingCompletion }] = useAcceptOrderCompletionMutation();
  const [assignOrderMembers, { isLoading: isAssigning }] = useAssignOrderMembersMutation();
  const { data: brigadeData } = useGetBrigadeByIdQuery(order?.brigadeId, { skip: !order?.brigadeId });

  const [isEditing, setIsEditing] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    description: order?.description || "",
    startDate: order?.startDate ? format(new Date(order.startDate), "yyyy-MM-dd") : "",
    endDate: order?.endDate ? format(new Date(order.endDate), "yyyy-MM-dd") : "",
    price: order?.price || "",
    paymentMethod: order?.paymentMethod || "CASH",
    address: order?.address || "",
  });
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    () => (order?.assignments || []).map((a: any) => a.memberId)
  );

  if (!order) return null;

  const isClient = currentUserId === order.clientId;
  const otherParty = isClient ? order.master : order.client;
  const roleLabel = isClient
    ? order.technique ? t("technique_owner_label", "Provided by") : t("master", "Master")
    : t("client", "Client");

  // A user may leave only one review per order.
  const hasReviewed = Array.isArray(order.reviews)
    ? order.reviews.some((r: any) => r.authorId === currentUserId)
    : false;

  // An assigned brigade member can view the order (for context/messaging) but
  // only the two contracting parties - client and brigade owner - can
  // accept/reject/edit its terms.
  const isContractingParty = isClient || currentUserId === order.masterId;
  const canRespond = isContractingParty && order.status === "PENDING" && order.initiatorId !== currentUserId;

  const isBrigadeOrder = !!order.brigadeId;
  const isBrigadeOwner = isBrigadeOrder && currentUserId === order.masterId;
  const canAssignTeam =
    isBrigadeOwner && (order.status === "ACCEPTED" || order.status === "COMPLETION_REQUESTED");
  const acceptedBrigadeMembers = (brigadeData?.members || []).filter((m: any) => m.status === "ACCEPTED");
  const assignableTeam = brigadeData?.owner
    ? [brigadeData.owner, ...acceptedBrigadeMembers.map((m: any) => m.user)]
    : [];

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSaveTeam = async () => {
    try {
      await assignOrderMembers({ id: order.id, memberIds: selectedMemberIds }).unwrap();
      toast.success(t("order_team_saved", "Team updated successfully!"));
    } catch (error: any) {
      toast.error(resolveApiErrorMessage(t, error?.data?.message) || t("order_team_save_failed", "Failed to update the team."));
    }
  };

  const handleAccept = async () => {
    try {
      await acceptOrder(order.id).unwrap();
      toast.success(t("order_accepted", "Order accepted successfully!"));
      onClose();
    } catch (error: any  ) {
      toast.error(resolveApiErrorMessage(t, error?.data?.message, { technique: order.technique?.name }) || t("order_accept_failed", "Failed to accept order."));
    }
  };

  const handleReject = async () => {
    try {
      await rejectOrder(order.id).unwrap();
      toast.success(t("order_rejected", "Order rejected successfully!"));
      onClose();
    } catch (error: any  ) {  
      toast.error(t("order_reject_failed", "Failed to reject order."));
    }
  };

  const handleRequestCompletion = async () => {
    try {
      await requestCompletion(order.id).unwrap();
      toast.success(t("completion_requested", "Order completion requested!"));
      onClose();
    } catch (error: any  ) {  
      toast.error(t("completion_request_failed", "Failed to request completion."));
    }
  };

  const handleAcceptCompletion = async () => {
    try {
      await acceptCompletion(order.id).unwrap();
      toast.success(t("completion_accepted", "Order marked as completed!"));
      // Completion succeeded — prompt this user to leave their review right away.
      if (!hasReviewed) {
        setIsReviewModalOpen(true);
      } else {
        onClose();
      }
    } catch (error: any  ) {
      toast.error(t("completion_accept_failed", "Failed to accept completion."));
    }
  };

  const handleProposeChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.description || !editForm.startDate || !editForm.endDate || !editForm.paymentMethod) {
      toast.error(t("fill_required_fields", "Please fill in all required fields."));
      return;
    }

    const formData = new FormData();
    formData.append("description", editForm.description);
    formData.append("startDate", editForm.startDate);
    formData.append("endDate", editForm.endDate);
    formData.append("paymentMethod", editForm.paymentMethod);
    formData.append("privacyAccepted", "true");
    if (editForm.price) formData.append("price", editForm.price.toString());
    if (editForm.address) formData.append("address", editForm.address);
    if (order.imageUrl) formData.append("imageUrl", order.imageUrl); // keep existing image

    try {
      await updateOrder({ id: order.id, body: formData }).unwrap();
      toast.success(t("order_updated_successfully", "Counter-offer sent successfully!"));
      setIsEditing(false);
      onClose();
    } catch (error: any  ) {  
      toast.error(t("order_update_failed", "Failed to propose changes."));
    }
  };

  return (
    <Dialog open={isOpen && !isReviewModalOpen} onOpenChange={(open) => {
      // Ignore the close that fires when we hand off to the review modal.
      if (!open && !isReviewModalOpen) {
        setIsEditing(false);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("propose_changes", "Propose Changes") : t("order_details", "Order Details")}</DialogTitle>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-6 py-4">
            {order.technique && (
              <div className="flex items-center gap-2 text-sm text-brand bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-lg px-4 py-2 w-fit">
                <Wrench className="w-4 h-4" />
                <span className="font-medium">{t("technique_order_label", "Technique")}:</span> {order.technique.name}
              </div>
            )}

            <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
              <img
                src={otherParty?.avatarUrl ? getImageUrl(otherParty.avatarUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParty?.name || "")}&background=random`}
                alt={otherParty?.name}
                className="w-12 h-12 rounded-full object-cover border"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParty?.name || "")}&background=random`; }}
              />
              <div className="flex-1">
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider">{roleLabel}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-foreground">{otherParty?.name || t("unknown", "Unknown")}</p>
              </div>
              {otherParty?.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-brand text-brand hover:bg-brand/10 hover:text-brand"
                  onClick={() => {
                    onClose();
                    navigate(
                      `/messages/new?recipientId=${otherParty.id}&type=USER_MASTER` +
                        `&recipientName=${encodeURIComponent(otherParty.name || "")}` +
                        `&recipientAvatar=${encodeURIComponent(otherParty.avatarUrl || "")}`
                    );
                  }}
                >
                  <MessageSquare className="w-4 h-4 me-1" />
                  {t("send_message", "Message")}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">{t("description", "Description")}</h4>
              <p className="text-sm text-slate-700 dark:text-gray-300 whitespace-pre-wrap bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-slate-100 dark:border-zinc-800">
                {order.description}
              </p>
            </div>

            {order.imageUrl && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground">{t("reference_image", "Reference Image")}</h4>
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
                  <img src={getImageUrl(order.imageUrl)} alt={t("reference_image", "Reference Image")}className="w-full h-auto max-h-[300px] object-contain" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <Calendar className="w-3 h-3" />
                  <span>{t("timeline", "Timeline")}</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-foreground">
                  {formatDate(order.startDate)} - {formatDate(order.endDate)}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <DollarSign className="w-3 h-3" />
                  <span>{t("price", "Price")}</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-foreground">
                  {order.price ? `${order.price} ֏` : t("negotiable", "Negotiable")}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <CreditCard className="w-3 h-3" />
                  <span>{t("payment_method", "Payment Method")}</span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-foreground">
                  {t(order.paymentMethod.toLowerCase(), order.paymentMethod as string)}
                </p>
              </div>
              {order.address && (
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-slate-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <MapPin className="w-3 h-3" />
                    <span>{t("location", "Location")}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-foreground line-clamp-2">
                    {order.address}
                  </p>
                </div>
              )}
            </div>

            {isBrigadeOrder && (canAssignTeam || order.assignments?.length > 0) && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t("order_team_title", "Team")}
                </h4>

                {canAssignTeam ? (
                  <>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {t("order_team_assign_desc", "Choose who from your brigade will handle this job. Their calendar will show these dates as busy.")}
                    </p>
                    {assignableTeam.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-gray-400">
                        {t("order_team_no_members", "No accepted brigade members yet.")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {assignableTeam.map((person: any) => (
                          <label
                            key={person.id}
                            className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMemberIds.includes(person.id)}
                              onChange={() => toggleMember(person.id)}
                              className="w-4 h-4 accent-brand"
                            />
                            <img
                              src={person.avatarUrl ? getImageUrl(person.avatarUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || "")}&background=random`}
                              alt={person.name}
                              className="w-8 h-8 rounded-full object-cover border"
                            />
                            <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                              {person.name || t("unknown", "Unknown")}
                              {person.id === order.masterId && (
                                <span className="ms-1 text-xs text-slate-500 dark:text-gray-400">({t("brigade_creator", "Creator")})</span>
                              )}
                            </span>
                          </label>
                        ))}
                        <Button
                          size="sm"
                          className="bg-brand hover:bg-brand/90 text-white"
                          onClick={handleSaveTeam}
                          disabled={isAssigning}
                        >
                          {isAssigning ? t("processing", "Processing...") : t("order_team_save", "Save Team")}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {order.assignments.map((a: any) => (
                      <div key={a.memberId} className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-zinc-800">
                        <img
                          src={a.member?.avatarUrl ? getImageUrl(a.member.avatarUrl) : `https://ui-avatars.com/api/?name=${encodeURIComponent(a.member?.name || "")}&background=random`}
                          alt={a.member?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-slate-900 dark:text-foreground">{a.member?.name || t("unknown", "Unknown")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {canRespond && (
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleAccept}
                  disabled={isAccepting || isRejecting}
                >
                  {isAccepting ? t("processing", "Processing...") : t("accept_order", "Accept Order")}
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsEditing(true)}
                  disabled={isAccepting || isRejecting}
                >
                  {t("propose_changes", "Propose Changes")}
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isAccepting || isRejecting}
                >
                  {isRejecting ? t("processing", "Processing...") : t("reject_order", "Reject Order")}
                </Button>
              </div>
            )}

            {isContractingParty && order.status === "ACCEPTED" && (
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleRequestCompletion}
                  disabled={isRequestingCompletion}
                >
                  {isRequestingCompletion ? t("processing", "Processing...") : t("mark_as_completed", "Mark as Completed")}
                </Button>
              </div>
            )}

            {isContractingParty && order.status === "COMPLETION_REQUESTED" && order.initiatorId !== currentUserId && (
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <div className="text-sm text-slate-500 dark:text-gray-400 text-center mb-3">
                  {t("other_party_completed", "The other party marked this order as completed. Please confirm.")}
                </div>
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleAcceptCompletion}
                  disabled={isAcceptingCompletion}
                >
                  {isAcceptingCompletion ? t("processing", "Processing...") : t("confirm_completion", "Confirm Completion")}
                </Button>
              </div>
            )}

            {order.status === "COMPLETION_REQUESTED" && order.initiatorId === currentUserId && (
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
                <p className="text-sm text-slate-500 dark:text-gray-400">{t("waiting_completion_confirmation", "Waiting for the other party to confirm completion...")}</p>
              </div>
            )}

            {order.status === "COMPLETED" && (
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setIsReviewModalOpen(true)}
                  disabled={hasReviewed}
                >
                  {hasReviewed
                    ? t("review_already_left", "Review already submitted")
                    : t("leave_review", "Leave a Review")}
                </Button>
              </div>
            )}

            {order.status === "PENDING" && order.initiatorId === currentUserId && (
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
                <p className="text-sm text-slate-500 dark:text-gray-400">{t("waiting_for_response", "Waiting for the other party to respond...")}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleProposeChanges} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t("description", "Description")} <span className="text-red-500">*</span></Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">{t("start_date", "Start Date")} <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">{t("end_date", "End Date")} <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">{t("price", "Budget/Price")} ({t("optional", "Optional")})</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("payment_method", "Payment Method")} <span className="text-red-500">*</span></Label>
                <Select value={editForm.paymentMethod} onValueChange={(val) => setEditForm({ ...editForm, paymentMethod: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">{t("cash", "Cash")}</SelectItem>
                    <SelectItem value="ONLINE">{t("online", "Online")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">{t("location_address", "Location Address")}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-address"
                  className="pl-9"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                {t("cancel", "Cancel")}
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? t("submitting", "Submitting...") : t("send_counter_offer", "Send Counter-Offer")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          onClose();
        }}
        orderId={order.id}
        targetId={otherParty?.id}
      />
    </Dialog>
  );
}
