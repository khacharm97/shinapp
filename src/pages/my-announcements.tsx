import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetMyAnnouncementsQuery,
  useCreateMyAnnouncementMutation,
  useUpdateMyAnnouncementMutation,
  useDeleteMyAnnouncementMutation,
} from "@/store/api/authApi";
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

export default function MyAnnouncements() {
  const { t } = useTranslation();
  const { data: announcements, isLoading } = useGetMyAnnouncementsQuery({});

  const [createAnnouncement] = useCreateMyAnnouncementMutation();
  const [updateAnnouncement] = useUpdateMyAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteMyAnnouncementMutation();

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null as string | null,
    sphere: "",
    title: "",
    description: "",
    urgent: false,
    status: "PENDING",
    startDate: "",
    endDate: "",
  });

  const resetForm = () => {
    setFormData({
      id: null,
      sphere: "",
      title: "",
      description: "",
      urgent: false,
      status: "PENDING",
      startDate: "",
      endDate: "",
    });
    setIsEditing(false);
  };

  const handleAddClick = () => {
    resetForm();
    setOpen(true);
  };

  const handleEditClick = (announcement: any) => {
    setFormData({
      id: announcement.id,
      sphere: announcement.sphere,
      title: announcement.title,
      description: announcement.description,
      urgent: announcement.urgent,
      status: announcement.status || "PENDING",
      startDate: new Date(announcement.startDate).toISOString().split('T')[0],
      endDate: new Date(announcement.endDate).toISOString().split('T')[0],
    });
    setIsEditing(true);
    setOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm(t("my_announcements_delete_confirm", "Are you sure you want to delete this announcement?"))) {
      await deleteAnnouncement(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      await updateAnnouncement({
        id: formData.id!,
        sphere: formData.sphere,
        title: formData.title,
        description: formData.description,
        urgent: formData.urgent,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
    } else {
      await createAnnouncement({
        sphere: formData.sphere,
        title: formData.title,
        description: formData.description,
        urgent: formData.urgent,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
    }
    setOpen(false);
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
            {t("nav_my_announcements", "My Announcements")}
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            {t("my_announcements_subtitle", "Manage your announcements and track their status")}
          </p>
        </div>
        <div className="flex flex-row gap-3">
          <Button
            size="lg"
            className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg hover:shadow-brand/20 transition-all rounded-full px-6"
            onClick={handleAddClick}
          >
            <PlusIcon className="w-5 h-5 me-2" /> {t("my_announcements_add_btn", "Add Announcement")}
          </Button>
        </div>
      </div>

      {announcements?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-card/30 border border-dashed rounded-3xl text-center shadow-sm">
          <div className="bg-brand/10 p-5 rounded-full mb-6">
            <PlusIcon className="w-10 h-10 text-brand" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">{t("my_announcements_no_data", "No announcements found. Create one!")}</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            {t("my_announcements_empty_desc", "You haven't created any announcements yet. Click the button below to get started.")}
          </p>
          <Button onClick={handleAddClick} size="lg" className="rounded-full px-8 shadow-md">
            {t("my_announcements_add_btn", "Add Announcement")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements?.map((announcement: any, i: number) => (
            <div
              key={announcement.id}
              className="group relative bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${announcement.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                    announcement.status === 'REJECTED' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                      'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    }`}>
                    {announcement.status === 'PENDING' ? t("my_announcements_status_pending", "Pending") :
                      announcement.status === 'PUBLISHED' ? t("my_announcements_status_published", "Published") :
                        announcement.status === 'ARCHIVED' ? t("my_announcements_status_archived", "Archived") :
                          announcement.status}
                  </span>
                  {announcement.urgent && (
                    <span className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-md shadow-sm animate-pulse">
                      {t("my_announcements_urgent_label", "Urgent")}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-brand transition-colors">
                  {announcement.title}
                </h3>
                <div className="inline-block px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium mb-3">
                  {announcement.sphere}
                </div>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 h-[4.5rem]">
                  {announcement.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CalendarIcon className="w-4 h-4 text-brand/70" />
                    <span>
                      {new Date(announcement.startDate).toLocaleDateString()} - {new Date(announcement.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md bg-background/90 backdrop-blur-sm hover:bg-brand hover:text-white transition-colors"
                  onClick={() => handleEditClick(announcement)}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 rounded-full shadow-md bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-white transition-colors"
                  onClick={() => handleDeleteClick(announcement.id)}
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
                {isEditing ? t("my_announcements_edit_title", "Edit Announcement") : t("my_announcements_add_title", "Add Announcement")}
              </DialogTitle>
              <DialogDescription>
                {t("my_announcements_modal_desc", "Fill in the details below to create or update your announcement.")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-sm font-semibold">{t("my_announcements_title_label", "Title")}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-muted/30 focus-visible:bg-background transition-colors border-border/50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sphere" className="text-sm font-semibold">{t("my_announcements_sphere_label", "Sphere (Area)")}</Label>
                  <Input
                    id="sphere"
                    value={formData.sphere}
                    onChange={(e) => setFormData({ ...formData, sphere: e.target.value })}
                    className="bg-muted/30 focus-visible:bg-background transition-colors border-border/50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-sm font-semibold">{t("my_announcements_desc_label", "Description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-muted/30 focus-visible:bg-background transition-colors border-border/50 min-h-[100px] resize-none"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-4 rounded-xl border border-border/30">
                <div className="flex items-center gap-3">
                  <Switch
                    id="urgent"
                    checked={formData.urgent}
                    onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked })}
                  />
                  <div>
                    <Label htmlFor="urgent" className="text-sm font-semibold leading-none cursor-pointer">{t("my_announcements_urgent_label", "Urgent")}</Label>
                    <p className="text-[11px] text-muted-foreground mt-1">Mark as high priority</p>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-sm font-semibold">{t("my_announcements_status_label", "Status")}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className="bg-muted/30 border-border/50 w-full">
                      <SelectValue placeholder={t("my_announcements_status_label", "Select status")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">{t("my_announcements_status_pending", "Pending")}</SelectItem>
                      <SelectItem value="PUBLISHED">{t("my_announcements_status_published", "Published")}</SelectItem>
                      <SelectItem value="ARCHIVED">{t("my_announcements_status_archived", "Archived")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold">{t("my_announcements_start_date_label", "Start Date")}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-muted/30 focus-visible:bg-background transition-colors border-border/50"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold">{t("my_announcements_end_date_label", "End Date")}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-muted/30 focus-visible:bg-background transition-colors border-border/50"
                    required
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 bg-muted/10 border-t border-border/40 mt-auto">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full px-6">
                {t("my_announcements_cancel_btn", "Cancel")}
              </Button>
              <Button type="submit" className="bg-brand hover:bg-brand/90 text-white rounded-full px-8 shadow-md">
                {isEditing ? t("my_announcements_save_btn", "Save changes") : t("my_announcements_create_btn", "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
