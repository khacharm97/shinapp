import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetMyAnnouncementsQuery,
  useCreateMyAnnouncementMutation,
  useUpdateMyAnnouncementMutation,
  useDeleteMyAnnouncementMutation,
} from "@/store/api/authApi";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
    if (window.confirm("Are you sure you want to delete this announcement?")) {
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

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("nav_my_announcements", "My Announcements")}</h1>
        <Button onClick={handleAddClick}>
          <PlusIcon className="w-4 h-4 me-2" /> Add Announcement
        </Button>
      </div>

      <div className="bg-card text-card-foreground border rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Sphere</th>
              <th className="px-6 py-3">Urgent</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Start Date</th>
              <th className="px-6 py-3">End Date</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {announcements?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No announcements found. Create one!
                </td>
              </tr>
            ) : (
              announcements?.map((announcement: any) => (
                <tr key={announcement.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{announcement.title}</td>
                  <td className="px-6 py-4">{announcement.sphere}</td>
                  <td className="px-6 py-4">{announcement.urgent ? "Yes" : "No"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      announcement.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      announcement.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {announcement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(announcement.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(announcement.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(announcement)}>
                      <PencilIcon className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(announcement.id)}>
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Announcement" : "Add Announcement"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sphere">Sphere (Area)</Label>
                <Input
                  id="sphere"
                  value={formData.sphere}
                  onChange={(e) => setFormData({ ...formData, sphere: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex gap-8 items-center">
                <div className="flex items-center gap-2">
                  <Switch
                    id="urgent"
                    checked={formData.urgent}
                    onCheckedChange={(checked) => setFormData({ ...formData, urgent: checked })}
                  />
                  <Label htmlFor="urgent">Urgent</Label>
                </div>
                {/* Companies cannot set their own status directly to PUBLISHED in a real app, but for now we follow the exact schema */}
                <div className="flex items-center gap-2 flex-1">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
