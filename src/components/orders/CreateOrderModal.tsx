import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateOrderMutation } from "@/store/api/authApi";
import { toast } from "sonner";
import { Upload, X, MapPin } from "lucide-react";
import { resolveApiErrorMessage } from "@/utils";
import { PrivacyConsent } from "./PrivacyConsent";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterId: string;
  clientId: string;
  masterName: string;
  // When set, this order is proposed to a Brigade (masterId is the brigade
  // owner) rather than to an individual master - the backend stamps the
  // order with brigadeId so the owner can staff it with specific members
  // once they accept it.
  brigadeId?: string;
}

export function CreateOrderModal({ isOpen, onClose, masterId, clientId, masterName, brigadeId }: CreateOrderModalProps) {
  const { t } = useTranslation();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const resetForm = () => {
    setDescription("");
    setStartDate("");
    setEndDate("");
    setPaymentMethod("CASH");
    setPrice("");
    setAddress("");
    setImage(null);
    setPrivacyAccepted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !startDate || !endDate || !paymentMethod || !privacyAccepted) {
      toast.error(t("fill_required_fields", "Please fill in all required fields."));
      return;
    }

    const formData = new FormData();
    formData.append("masterId", masterId);
    formData.append("clientId", clientId);
    if (brigadeId) formData.append("brigadeId", brigadeId);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("paymentMethod", paymentMethod);
    if (price) formData.append("price", price);
    if (address) formData.append("address", address);
    formData.append("privacyAccepted", "true");
    
    if (image) {
      formData.append("image", image);
    }

    try {
      await createOrder(formData).unwrap();
      toast.success(t("order_created_successfully", "Order proposed successfully!"));
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(resolveApiErrorMessage(t, error?.data?.message) || t("order_creation_failed", "Failed to propose order."));
      console.error(error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
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
          <DialogTitle>{t("propose_order", "Propose Order to")} {masterName}</DialogTitle>
          <DialogDescription>
            {t("order_description_help", "Fill in the details below to propose a contract/order.")}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t("price", "Budget/Price")} ({t("optional", "Optional")})</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
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

          <div className="space-y-2">
            <Label>{t("reference_image", "Reference Image")} ({t("optional", "Optional")})</Label>
            <div className="flex items-center gap-4">
              {image ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-[10px] text-muted-foreground">{t("upload", "Upload")}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
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
