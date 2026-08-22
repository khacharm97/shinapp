import { getImageUrl } from '@/utils';
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, ArrowLeft, Star, Phone, Mail, CheckCircle2, User as UserIcon } from "lucide-react";
import { useGetBrigadeByIdQuery } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";
import { SEO } from '@/components/seo';
import brigadeBg from '@/assets/brigade.webp';


const MANAGER_PHONE = "+37493233402";
const MANAGER_EMAIL = "info@shinapp.am";

export default function BrigadeDetailsPageContent() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: brigade, isLoading, isError } = useGetBrigadeByIdQuery(id as string, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !brigade) {
    return (
      <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4">
        <SEO title={t("error_not_found", "Brigade not found")} />
        <p className="text-slate-500">{t("error_brigade_not_found_desc", "Brigade not found or an error occurred.")}</p>
        <Button asChild variant="outline">
          <Link to="/masters">{t("master_details_back", "Back to Masters")}</Link>
        </Button>
      </div>
    );
  }

  // Calculate unique skills from owner and accepted members
  const allSkills = new Set<string>();
  if (brigade.owner?.userInfo?.skills) {
    brigade.owner.userInfo.skills.forEach((s: string) => allSkills.add(s));
  }

  const acceptedMembers = brigade.members?.filter((m: any  ) => m.status === 'ACCEPTED') || [];

  acceptedMembers.forEach((member: any  ) => {
    if (member.user?.userInfo?.skills) {
      member.user.userInfo.skills.forEach((s: string) => allSkills.add(s));
    }
  });


  // Calculate total jobs (sum of portfolios length for all members)
  let totalJobs = 0;
  if (brigade.owner?.portfolios) totalJobs += brigade.owner.portfolios.length;
  acceptedMembers.forEach((member: any  ) => {
    if (member.user?.portfolios) totalJobs += member.user.portfolios.length;
  });

  const totalMembers = 1 + acceptedMembers.length; // Owner + members

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title={`${brigade.name} - ShinApp`} />
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Button asChild variant="ghost" className="mb-4 text-slate-500 hover:text-slate-900 -ms-4">
            <Link to="/masters">
              <ArrowLeft className="w-4 h-4 me-2" />
              {t("master_details_back", "Back to Masters")}
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">

          {/* Banner image */}
          <div className="h-48 md:h-64 w-full bg-slate-200 overflow-hidden">
            <img
              src={brigadeBg}
              alt="Brigade banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Main Card Content that overlaps the banner slightly */}
          <div className="relative mx-4 md:mx-12 -mt-16 md:-mt-24 bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-8 mb-8 z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-6">

              <div className="text-center md:text-start">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                  {brigade.name}
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                </h1>

                <p className="text-slate-500 mt-2 line-clamp-2 max-w-2xl">
                  {brigade.about || brigade.owner?.userInfo?.about || ""}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-slate-600">
                  <div className="flex items-center text-orange-500 font-medium">
                    <Star className="w-4 h-4 me-1 fill-current" />
                    5.0 (0 reviews)
                  </div>
                  <div className="flex items-center text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 me-1" />
                    {t("search_available_now", "Available now")}
                  </div>
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 me-1 text-slate-400" />
                    {totalMembers} {t("brigade_verified_members", "verified members")}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 shrink-0">
                <Button onClick={() => window.location.href = `tel:${MANAGER_PHONE}`} className="bg-brand hover:bg-brand/90 text-white shadow-sm w-full md:w-auto">
                  <Phone className="w-4 h-4 me-2" />
                  {t("master_details_call_manager", "Call Manager")}
                </Button>
                <Button variant="outline" onClick={() => window.location.href = `mailto:${MANAGER_EMAIL}`} className="w-full md:w-auto">
                  <Mail className="w-4 h-4 me-2" />
                  {t("master_details_email_manager", "Email Manager")}
                </Button>
              </div>

            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex-1 min-w-[120px] bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="text-sm text-slate-500 mb-1">{t("profile_total_jobs", "Jobs completed")}</div>
                <div className="text-xl font-bold text-brand">{totalJobs}</div>
              </div>
              <div className="flex-1 min-w-[120px] bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="text-sm text-slate-500 mb-1">{t("brigade_responds_in", "Responds in")}</div>
                <div className="text-xl font-bold text-brand">under 2 hours</div>
              </div>
              <div className="flex-1 min-w-[120px] bg-slate-50 p-4 rounded-lg border border-slate-100 opacity-50">
                <div className="text-sm text-slate-500 mb-1">{t("profile_hourly_rate", "Hourly rate from")}</div>
                <div className="text-xl font-bold text-slate-500">-</div>
              </div>
            </div>
          </div>

          <div className="px-8 md:px-12 pb-12 space-y-12">

            {/* About */}
            <section>
              <h2 className="text-2xl font-bold text-brand mb-4">{t("brigade_about", "About the brigade")}</h2>
              <div className="text-slate-600 leading-relaxed max-w-4xl whitespace-pre-wrap">
                {brigade.about || brigade.owner?.userInfo?.about || t("brigade_no_about", "No description provided.")}
              </div>
            </section>

            {/* Members */}
            <section>
              <h2 className="text-2xl font-bold text-brand mb-4">{t("brigade_members", "Members")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Owner */}
                {brigade.owner && (
                  <Link to={`/masters/${brigade.owner.id}`} className="block group">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={brigade.owner.avatarUrl ? getImageUrl(brigade.owner.avatarUrl) || "" : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
                          alt={brigade.owner.name || "Owner"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-brand transition-colors flex items-center gap-1">
                          {brigade.owner.name || t("search_unnamed_master", "Unnamed Master")}
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </h3>
                        <div className="text-xs text-slate-500 mt-1">{t("brigade_creator", "Creator")}</div>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Other Members */}
                {acceptedMembers.map((member: any  ) => (
                  <Link key={member.user.id} to={`/masters/${member.user.id}`} className="block group">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-center hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={member.user.avatarUrl ? getImageUrl(member.user.avatarUrl) || "" : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600"}
                          alt={member.user.name || "Member"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-brand transition-colors flex items-center gap-1">
                          {member.user.name || t("search_unnamed_master", "Unnamed Master")}
                        </h3>
                        <div className="text-xs text-slate-500 mt-1">{t("brigade_member", "Member")}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
