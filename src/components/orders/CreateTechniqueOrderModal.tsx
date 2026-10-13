import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateOrderMutation } from "@/store/api/authApi";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { resolveApiErrorMessage } from "@/utils";
import { PrivacyConsent } from "./PrivacyConsent";

interface CreateTechniqueOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  techniqueId: string;
  techniqueName: string;
  clientId: string;
}

export function CreateTechniqueOrderModal({ isOpen, onClose, techniqueId, techniqueName, clientId }: CreateTechniqueOrderModalProps) {
  const { t } = useTranslation();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [address, setAddress] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const resetForm = () => {
    setDescription("");
    setStartDate("");
    setEndDate("");
    setPaymentMethod("CASH");
    setAddress("");
    setPrivacyAccepted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !startDate || !endDate || !paymentMethod || !privacyAccepted) {
      toast.error(t("fill_required_fields", "Please fill in all required fields."));
      return;
    }

    const formData = new FormData();
    formData.append("techniqueId", techniqueId);
    formData.append("clientId", clientId);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("paymentMethod", paymentMethod);
    if (address) formData.append("address", address);
    formData.append("privacyAccepted", "true");

    try {
      await createOrder(formData).unwrap();
      toast.success(t("order_created_successfully", "Order proposed successfully!"));
      resetForm();
      onClose();
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      toast.error(resolveApiErrorMessage(t, message, { technique: techniqueName }) || t("order_creation_failed", "Failed to propose order."));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("propose_order", "Propose Order for")} {techniqueName}</DialogTitle>
          <DialogDescription>
            {t("technique_order_description_help", "Fill in the details below to request this technique for your work.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">{t("description", "Description")} <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              placeholder={t("order_desc_placeholder", "Describe the work to be done...")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("start_date", "Start Date")} <span className="text-red-500">*</span></Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("end_date", "End Date")} <span className="text-red-500">*</span></Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("payment_method", "Payment Method")} <span className="text-red-500">*</span></Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder={t("select_payment_method", "Select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">{t("cash", "Cash")}</SelectItem>
                <SelectItem value="ONLINE">{t("online", "Online")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t("location_address", "Location Address")}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                className="pl-9"
                placeholder={t("enter_address", "Enter location address...")}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <PrivacyConsent checked={privacyAccepted} onCheckedChange={setPrivacyAccepted} />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
              {t("cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("submitting", "Submitting...") : t("propose", "Propose Order")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
