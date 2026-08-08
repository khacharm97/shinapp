import { getImageUrl } from '@/utils';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Loader2, Trash2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreatePortfolioMutation, useDeletePortfolioMutation } from "@/store/api/authApi";
import type { User, Portfolio } from "@/types";

interface PortfoliosTabProps {
  profileData: User;
}

export function PortfoliosTab({ profileData }: PortfoliosTabProps) {
  const { t } = useTranslation();
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioDesc, setPortfolioDesc] = useState("");
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  
  const [createPortfolio, { isLoading: isCreatingPortfolio }] = useCreatePortfolioMutation();
  const [deletePortfolio, { isLoading: isDeletingPortfolio }] = useDeletePortfolioMutation();

  const handlePortfolioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPortfolioFiles(prev => [...prev, ...filesArray].slice(0, 3)); // Max 3 files
    }
  };

  const handlePortfolioSubmit = async () => {
    if (!portfolioTitle || portfolioFiles.length === 0) return;
    const formData = new FormData();
    formData.append('title', portfolioTitle);
    formData.append('description', portfolioDesc);
    portfolioFiles.forEach(f => formData.append('images', f));
    await createPortfolio(formData).unwrap();
    setPortfolioOpen(false);
    setPortfolioTitle("");
    setPortfolioDesc("");
    setPortfolioFiles([]);
  };

  return (
    <div className="bg-white dark:bg-card p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-border mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">{t("profile_portfolios", "Portfolios")}</h2>
        <Dialog open={portfolioOpen} onOpenChange={setPortfolioOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Plus className="w-4 h-4 me-2" /> {t("profile_add_portfolio", "Add Portfolio")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("profile_add_new_portfolio", "Add New Portfolio")}</DialogTitle>
              <DialogDescription>{t("profile_portfolio_desc", "Showcase your best work (Max 3 images).")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("profile_portfolio_title", "Title")}</Label>
                <Input placeholder={t("profile_portfolio_title_placeholder", "e.g. Modern Kitchen Renovation")} value={portfolioTitle} onChange={e => setPortfolioTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile_portfolio_description", "Description")}</Label>
                <Textarea placeholder={t("profile_portfolio_desc_placeholder", "Details about this project...")} value={portfolioDesc} onChange={e => setPortfolioDesc(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("profile_portfolio_images", "Images")} ({portfolioFiles.length}/3)</Label>
                <Input type="file" multiple accept="image/*" onChange={handlePortfolioFileChange} disabled={portfolioFiles.length >= 3} />
                {portfolioFiles.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {portfolioFiles.map((f, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden bg-slate-100">
                        <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="preview" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPortfolioOpen(false)}>{t("cancel", "Cancel")}</Button>
              <Button onClick={handlePortfolioSubmit} disabled={!portfolioTitle || portfolioFiles.length === 0 || isCreatingPortfolio}>
                {isCreatingPortfolio && <Loader2 className="w-4 h-4 me-2 animate-spin" />} {t("profile_portfolio_save", "Save Portfolio")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {profileData.portfolios && profileData.portfolios.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileData.portfolios.map((port: Portfolio) => (
            <div key={port.id} className="border border-slate-200 dark:border-border rounded-xl overflow-hidden group">
              <div className="aspect-video bg-slate-100 relative">
                {port.imageUrls?.[0] ? (
                  <img src={getImageUrl(port.imageUrls[0]) || ""} className="w-full h-full object-cover" alt={port.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImagePlus className="w-8 h-8" />
                  </div>
                )}
                <button 
                  disabled={isDeletingPortfolio}
                  onClick={() => deletePortfolio(port.id)}
                  className="absolute top-2 end-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-foreground line-clamp-1">{port.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{port.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-border">
          <p className="text-slate-500">{t("profile_portfolio_empty", "You haven't added any portfolios yet.")}</p>
        </div>
      )}
    </div>
  );
}
