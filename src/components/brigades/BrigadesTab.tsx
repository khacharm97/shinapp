import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Loader2, Users, X, Pencil, Trash2 } from "lucide-react";
import {
  useGetBrigadesQuery,
  useCreateBrigadeMutation,
  useUpdateBrigadeMutation,
  useDeleteBrigadeMutation,
  useGlobalSearchQuery
} from "@/store/api/authApi";
import type { User, Brigade, BrigadeMember } from "@/types";
import { getImageUrl } from "@/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BrigadesTab({ profileData, className = "mt-8" }: { profileData: User, className?: string }) {
  const { t } = useTranslation();
  const { data: brigades, isLoading: isLoadingBrigades } = useGetBrigadesQuery(undefined);
  const [createBrigade, { isLoading: isCreating }] = useCreateBrigadeMutation();
  const [updateBrigade, { isLoading: isUpdating }] = useUpdateBrigadeMutation();
  const [deleteBrigade, { isLoading: isDeleting }] = useDeleteBrigadeMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editBrigadeId, setEditBrigadeId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [invites, setInvites] = useState<string[]>([]); // New invites

  const [existingMembers, setExistingMembers] = useState<BrigadeMember[]>([]); // Members already in brigade
  const [removeMemberIds, setRemoveMemberIds] = useState<string[]>([]); // IDs of existing members to remove

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(inviteInput), 300);
    return () => clearTimeout(timer);
  }, [inviteInput]);

  const { data: searchResults } = useGlobalSearchQuery(
    { search: debouncedSearch, limit: 5 },
    { skip: debouncedSearch.length < 2 }
  );

  const resetForm = () => {
    setErrorMsg(null);
    setName("");
    setAbout("");
    setInvites([]);
    setInviteInput("");
    setExistingMembers([]);
    setRemoveMemberIds([]);
    setEditBrigadeId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (brigade: Brigade) => {
    resetForm();
    setEditBrigadeId(brigade.id);
    setName(brigade.name);
    setAbout(brigade.about || "");
    setExistingMembers(brigade.members || []);
    setIsOpen(true);
  };

  const handleAddInvite = () => {
    const val = inviteInput.trim();
    if (!val) return;
    if (invites.includes(val)) {
      setInviteInput("");
      return;
    }
    setInvites([...invites, val]);
    setInviteInput("");
  };

  const handleRemoveNewInvite = (idx: number) => {
    setInvites(invites.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingMember = (memberId: string) => {
    setRemoveMemberIds([...removeMemberIds, memberId]);
    setExistingMembers(existingMembers.filter((m) => m.id !== memberId));
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg(t("brigade_name_required", "Brigade name is required"));
      return;
    }

    try {
      if (editBrigadeId) {
        await updateBrigade({ 
          id: editBrigadeId, 
          name: name.trim(), 
          about: about.trim(), 
          invites, 
          removeMemberIds 
        }).unwrap();
      } else {
        await createBrigade({ 
          name: name.trim(), 
          about: about.trim(), 
          invites 
        }).unwrap();
      }
      setIsOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error(err);
      const e = err as { data?: { message?: string }; error?: string };
      const msg = e?.data?.message || e?.error || t("brigade_error", "Failed to save brigade");
      setErrorMsg(msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBrigade(id).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className={`w-full bg-white dark:bg-card p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-border ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">
          {t("profile_brigades", "My Brigades")}
        </h2>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <Button variant="outline" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 me-2" />
            {t("profile_add_brigade", "Create Brigade")}
          </Button>

          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editBrigadeId ? t("brigade_edit_title", "Edit Brigade") : t("brigade_create_title", "Create a New Brigade")}
              </DialogTitle>
              <DialogDescription>
                {t("brigade_create_desc", "Group up with other masters. Invite them via their registered email or phone.")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("brigade_name", "Brigade Name")}</Label>
                <Input
                  placeholder={t("brigade_name_placeholder", "e.g. Elite Plumbers")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("brigade_about", "About Brigade")}</Label>
                <Textarea
                  placeholder={t("brigade_about_placeholder", "Tell us about this brigade...")}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
              </div>

              {editBrigadeId && existingMembers.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("brigade_existing_members", "Existing Members")}</Label>
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-zinc-900 rounded-md border border-slate-100 dark:border-zinc-800">
                    {existingMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {member.user?.name || member.user?.email || member.user?.phone}
                        </span>
                        <button
                          onClick={() => handleRemoveExistingMember(member.id)}
                          className="text-slate-400 hover:text-red-500 rounded-full focus:outline-none p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t("brigade_invites", "Invite New Masters (Name, Email or Phone)")}</Label>
                <div className="flex gap-2 relative">
                  <div className="relative flex-1">
                    <Input
                      placeholder={t("brigade_invite_placeholder", "Name, user@example.com, or +374...")}
                      value={inviteInput}
                      onChange={(e) => setInviteInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInvite();
                        }
                      }}
                    />
                    {inviteInput.length >= 2 && searchResults?.items && searchResults.items.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {searchResults.items.map((user: any  ) => (
                          <div
                            key={user.id}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 last:border-0"
                            onClick={() => {
                              const identifier = user.email || user.phone || user.name;
                              if (identifier && !invites.includes(identifier)) {
                                setInvites([...invites, identifier]);
                                setInviteInput("");
                                setErrorMsg("");
                              }
                            }}
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                              {user.avatarUrl ? (
                                <img src={getImageUrl(user.avatarUrl)} alt="" className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-medium truncate">{user.name || 'Unnamed'}</span>
                              <span className="text-xs text-slate-500 truncate">{user.email || user.phone}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button type="button" variant="secondary" onClick={handleAddInvite}>
                    {t("add", "Add")}
                  </Button>
                </div>

                {invites.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 dark:bg-zinc-900 rounded-md border border-slate-100 dark:border-zinc-800">
                    {invites.map((inv, idx) => (
                      <Badge key={idx} variant="secondary" className="px-2 py-1 text-xs font-normal flex items-center gap-1">
                        {inv}
                        <button
                          onClick={() => handleRemoveNewInvite(idx)}
                          className="text-slate-400 hover:text-red-500 rounded-full focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                  {errorMsg}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>{t("cancel", "Cancel")}</Button>
              <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
                {isLoading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {t("brigade_save_btn", "Save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingBrigades ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : brigades && brigades.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brigades.map((brigade: Brigade) => (
            <div key={brigade.id} className="border border-slate-200 dark:border-border rounded-xl p-5 group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-foreground">{brigade.name}</h3>
                    <p className="text-xs text-slate-500">{t("brigade_owner", "Owner")}: {profileData?.name || t("you", "You")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleOpenEdit(brigade)}>
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" disabled={isDeleting}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("brigade_delete_confirm_title", "Are you sure?")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("brigade_delete_confirm_desc", "This will permanently delete the brigade and remove all members.")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel", "Cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(brigade.id)} className="bg-red-600 hover:bg-red-700">
                          {t("delete", "Delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="space-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">{t("brigade_members", "Members")} ({brigade.members?.length || 0})</h4>

                {brigade.members && brigade.members.length > 0 ? (
                  <div className="space-y-2">
                    {brigade.members.map((member: BrigadeMember) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50 dark:bg-zinc-900/50">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {member.user?.name || member.user?.email || member.user?.phone}
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">{t("brigade_no_members", "No members invited yet.")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-border">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">{t("brigade_empty", "You haven't created any brigades yet.")}</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">{t("brigade_empty_desc", "Group up with other masters to showcase joint projects.")}</p>
          <Button variant="outline" onClick={handleOpenCreate}>
            {t("profile_add_brigade", "Create Brigade")}
          </Button>
        </div>
      )}
    </div>
  );
}
