import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateOrderMutation, useSearchOrderClientsQuery } from "@/store/api/authApi";
import { toast } from "sonner";
import { Upload, X, MapPin, Search } from "lucide-react";
import { getImageUrl, resolveApiErrorMessage } from "@/utils";

interface OrderClient {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterId: string;
}

export function AddOrderModal({ isOpen, onClose, masterId }: AddOrderModalProps) {
  const { t } = useTranslation();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [clientSearch, setClientSearch] = useState("");
  const [debouncedClientSearch, setDebouncedClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<OrderClient | null>(null);

  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedClientSearch(clientSearch), 300);
    return () => clearTimeout(timer);
  }, [clientSearch]);

  const { data: searchResults } = useSearchOrderClientsQuery(
    { search: debouncedClientSearch, limit: 5 },
    { skip: !isOpen || debouncedClientSearch.trim().length < 2 || !!selectedClient }
  );
  const searchItems: OrderClient[] = (searchResults as any)?.items ?? [];

  const resetForm = () => {
    setClientSearch("");
    setDebouncedClientSearch("");
    setSelectedClient(null);
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
    if (!selectedClient) {
      toast.error(t("add_order_select_client_required", "Please select a client to send this order to."));
      return;
    }
    if (!description || !startDate || !endDate || !paymentMethod || !privacyAccepted) {
      toast.error(t("fill_required_fields", "Please fill in all required fields."));
      return;
    }

    const formData = new FormData();
    formData.append("masterId", masterId);
    formData.append("clientId", selectedClient.id);
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
          <DialogTitle>{t("add_order_title", "Add Order")}</DialogTitle>
          <DialogDescription>
            {t("add_order_description_help", "Pick a client and fill in the details below to propose a contract/order to them.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client-search">{t("add_order_client_label", "Client")} <span className="text-red-500">*</span></Label>
            {selectedClient ? (
              <div className="flex items-center gap-3 rounded-md border p-3">
                <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                  {selectedClient.avatarUrl ? (
                    <img src={getImageUrl(selectedClient.avatarUrl) || ""} alt="" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedClient.name || t("unknown", "Unknown")}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedClient.email || selectedClient.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="text-muted-foreground hover:text-destructive rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="client-search"
                  className="pl-9"
                  placeholder={t("add_order_client_placeholder", "Search by name, email, or phone...")}
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                {clientSearch.trim().length >= 2 && searchItems.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    {searchItems.map((user) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 last:border-0"
                        onClick={() => {
                          setSelectedClient(user);
                          setClientSearch("");
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={getImageUrl(user.avatarUrl) || ""} alt="" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium truncate">{user.name || t("unknown", "Unknown")}</span>
                          <span className="text-xs text-slate-500 dark:text-gray-400 truncate">{user.email || user.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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

          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="privacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t("accept_privacy", "I accept the Privacy Policy and Contract Conditions")} <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("privacy_desc", "By proposing this order, you agree to the platform's terms and conditions.")}
              </p>
            </div>
          </div>

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
