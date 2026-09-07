import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@/utils";
import {
  useGetMyTechniquesQuery,
  useCreateTechniqueMutation,
  useUpdateTechniqueMutation,
  useDeleteTechniqueMutation,
} from "@/store/api/authApi";
import { PlusIcon, PencilIcon, TrashIcon, Loader2, ImageIcon, X, UploadCloud, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Technique, TechniquePriceType } from "@/types";
import { toast } from "sonner";

export default function MyTechniques() {
  const { t } = useTranslation();
  const { data: techniques, isLoading } = useGetMyTechniquesQuery();

  const [createTechnique] = useCreateTechniqueMutation();
  const [updateTechnique] = useUpdateTechniqueMutation();
  const [deleteTechnique] = useDeleteTechniqueMutation();

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    id: null as string | null,
    name: "",
    description: "",
    priceType: "HOURLY" as TechniquePriceType,
    price: "",
  });

  const resetForm = () => {
    setFormData({ id: null, name: "", description: "", priceType: "HOURLY", price: "" });
    setIsEditing(false);
    setSelectedFiles([]);
    setExistingImages([]);
    setPreviewUrls([]);
  };

  const handleAddClick = () => {
    resetForm();
    setOpen(true);
  };

  const handleEditClick = (technique: Technique) => {
    setFormData({
      id: technique.id,
      name: technique.name,
      description: technique.description || "",
      priceType: technique.priceType,
      price: String(technique.price),
    });
    setIsEditing(true);
    setExistingImages(technique.imageUrls || []);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm(t("my_techniques_delete_confirm", "Are you sure you want to delete this technique?"))) {
      await deleteTechnique(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("priceType", formData.priceType);
    data.append("price", formData.price);

    selectedFiles.forEach((file) => data.append("images", file));
    existingImages.forEach((img) => data.append("existingImages", img));

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateTechnique({ id: formData.id!, body: data }).unwrap();
        toast.success(t("technique_updated_successfully", "Technique updated successfully!"));
      } else {
        await createTechnique(data).unwrap();
        toast.success(t("technique_created_successfully", "Technique created successfully!"));
      }
      setOpen(false);
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      toast.error(message || t("technique_creation_failed", "Failed to save technique."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = existingImages.length + selectedFiles.length + filesArray.length;

      if (totalImages > 3) {
        toast.error(t("my_techniques_max_images", "You can only upload up to 3 images."));
        return;
      }

      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand" />
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand to-brand/60 bg-clip-text text-transparent pb-2">
            {t("my_techniques_title", "My Techniques")}
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            {t("my_techniques_subtitle", "Manage the techniques and equipment you offer.")}
          </p>
        </div>
        <Button
          size="lg"
          className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg hover:shadow-brand/20 transition-all rounded-full px-6"
          onClick={handleAddClick}
        >
          <PlusIcon className="w-5 h-5 me-2" /> {t("my_techniques_add_btn", "Add Technique")}
        </Button>
      </div>

      {techniques?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-card/30 border border-dashed rounded-3xl text-center shadow-sm">
          <div className="bg-brand/10 p-5 rounded-full mb-6">
            <Wrench className="w-10 h-10 text-brand" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">{t("my_techniques_no_data", "No techniques found. Add one!")}</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            {t("my_techniques_empty_desc", "You haven't added any techniques yet. Click the button below to get started.")}
          </p>
          <Button onClick={handleAddClick} size="lg" className="rounded-full px-8 shadow-md">
            {t("my_techniques_add_btn", "Add Technique")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techniques?.map((technique, i) => (
            <div
              key={technique.id}
              className="group relative bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="aspect-video bg-muted overflow-hidden">
                {technique.imageUrls?.[0] ? (
                  <img src={getImageUrl(technique.imageUrls[0]) || ""} alt={technique.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-brand transition-colors">
                  {technique.name}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-[2.75rem]">
                  {technique.description || t("no_description_provided", "No description provided.")}
                </p>
                <div className="inline-block px-3 py-1.5 bg-brand/10 text-brand rounded-md text-sm font-bold">
                  {technique.price.toLocaleString()} ֏{technique.priceType === 'HOURLY' ? ` / ${t('technique_price_per_hour', 'hr')}` : ''}
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md bg-background/90 backdrop-blur-sm hover:bg-brand hover:text-white transition-colors"
                  onClick={() => handleEditClick(technique)}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-white transition-colors"
                  onClick={() => handleDeleteClick(technique.id)}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border/40 shadow-2xl">
          <div className="bg-brand/5 h-2 w-full absolute top-0 left-0" />
          <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
            <DialogHeader className="px-6 pt-8 pb-4">
              <DialogTitle className="text-2xl">
                {isEditing ? t("my_techniques_edit_title", "Edit Technique") : t("my_techniques_add_title", "Add Technique")}
              </DialogTitle>
              <DialogDescription>
                {t("my_techniques_modal_desc", "Fill in the details below to create or update your technique.")}
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-semibold">{t("my_techniques_name_label", "Name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/30 focus-visible:bg-background transition-colors border-border/50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-sm font-semibold">{t("my_techniques_desc_label", "Description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/30 focus-visible:bg-background transition-colors border-border/50 min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priceType" className="text-sm font-semibold">{t("my_techniques_price_type_label", "Price Type")}</Label>
                  <Select
                    value={formData.priceType}
                    onValueChange={(val) => setFormData({ ...formData, priceType: val as TechniquePriceType })}
                  >
                    <SelectTrigger className="bg-muted/30 border-border/50 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURLY">{t("technique_price_hourly", "Hourly")}</SelectItem>
                      <SelectItem value="FIXED">{t("technique_price_fixed", "Fixed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-sm font-semibold">{t("my_techniques_price_label", "Price (AMD)")}</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-muted/30 focus-visible:bg-background transition-colors border-border/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 bg-muted/10 p-4 rounded-xl border border-border/40">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-brand" />
                  {t("my_techniques_images_label", "Images (Max 3)")}
                </Label>

                <div className="flex flex-wrap gap-4">
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} className="relative group w-24 h-24 rounded-lg overflow-hidden border">
                      <img src={getImageUrl(url) || url} alt={`Existing ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  ))}

                  {previewUrls.map((url, i) => (
                    <div key={`new-${i}`} className="relative group w-24 h-24 rounded-lg overflow-hidden border">
                      <img src={url} alt={`New ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  ))}

                  {(existingImages.length + selectedFiles.length) < 3 && (
                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-muted-foreground hover:text-brand">
                      <UploadCloud className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">{t("upload", "Upload")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-muted/10 border-t border-border/40 mt-auto">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full px-6">
                {t("my_techniques_cancel_btn", "Cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand hover:bg-brand/90 text-white rounded-full px-8 shadow-md">
                {isSubmitting
                  ? t("submitting", "Submitting...")
                  : isEditing ? t("my_techniques_save_btn", "Save changes") : t("my_techniques_create_btn", "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
