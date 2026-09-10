import { getImageUrl } from '@/utils';
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { Loader2, ArrowLeft, FileText, Calendar as CalendarIcon, User, MessageSquare } from "lucide-react";
import { useGetTechniqueByIdQuery, useGetProfileQuery, useGetTechniqueBusyDatesQuery } from "@/store/api/authApi";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { isWithinInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { SEO } from '@/components/seo';
import { CreateTechniqueOrderModal } from "@/components/orders/CreateTechniqueOrderModal";
import techniqueImg from '@/assets/technique.webp';

export default function TechniqueDetailsPageContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/technique");
    }
  };

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const token = useAppSelector((state) => state.auth.token);
  const { data: profile } = useGetProfileQuery(undefined, { skip: !token });
  const { data: technique, isLoading, isError } = useGetTechniqueByIdQuery(id as string, { skip: !id });
  const { data: busyDatesData } = useGetTechniqueBusyDatesQuery(id as string, { skip: !id });

  const disabledDays = (date: Date) => {
    if (!busyDatesData) return false;
    return busyDatesData.some((order) => {
      const start = new Date(order.startDate);
      const end = new Date(order.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return isWithinInterval(date, { start, end });
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (isError || !technique) {
    return (
      <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4">
        <SEO title={t("error_not_found", "Technique not found")} />
        <p className="text-slate-500 dark:text-gray-400">{t("technique_details_not_found", "Technique not found or an error occurred.")}</p>
        <Button variant="outline" onClick={goBack}>
          {t("back", "Back")}
        </Button>
      </div>
    );
  }

  const images = technique.imageUrls && technique.imageUrls.length > 0 ? technique.imageUrls : [];
  const isOwner = profile && profile.id === technique.ownerId;
  const priceLabel = `${technique.price.toLocaleString()} ֏${technique.priceType === 'HOURLY' ? ` / ${t('technique_price_per_hour', 'hr')}` : ''}`;

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-background min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 lg:px-8">
      <SEO title={technique.name} />
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Button variant="ghost" onClick={goBack} className="mb-4 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-foreground -ms-4">
            <ArrowLeft className="w-4 h-4 me-2" />
            {t("back", "Back")}
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-6 md:p-8 space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800">
                <img
                  src={images[activeImage] ? getImageUrl(images[activeImage]) || "" : techniqueImg}
                  alt={technique.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = techniqueImg; }}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-brand' : 'border-transparent'}`}
                    >
                      <img src={getImageUrl(url) || ""} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-6 border-t md:border-t-0 md:border-s border-slate-100 dark:border-zinc-800">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-foreground mb-2">{technique.name}</h1>
                {technique.owner?.name && (
                  <Link to={`/masters/${technique.owner.id}`} className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 hover:text-brand transition-colors w-fit">
                    <User className="w-4 h-4" />
                    {t("technique_owner_label", "Provided by")} {technique.owner.name}
                  </Link>
                )}
              </div>

              <div className="bg-brand/5 dark:bg-brand/10 rounded-xl p-5">
                <div className="text-3xl font-bold text-brand">{priceLabel}</div>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                  {technique.priceType === 'HOURLY'
                    ? t("technique_price_hourly_desc", "Billed per hour of work.")
                    : t("technique_price_fixed_desc", "Fixed price for the job.")}
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-slate-900 dark:text-foreground mb-2">{t("description", "Description")}</h2>
                <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {technique.description || t("no_description_provided", "No description provided.")}
                </p>
              </div>

              {!isOwner && (
                <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
                  <Button
                    onClick={() => profile ? setIsOrderModalOpen(true) : navigate('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    <FileText className="w-4 h-4 me-2" />
                    {t("order_technique", "Order this Technique")}
                  </Button>
                  {profile && technique.owner?.id && (
                    <Button
                      variant="outline"
                      className="border-brand text-brand hover:bg-brand/10 hover:text-brand"
                      onClick={() =>
                        navigate(
                          `/messages/new?recipientId=${technique.owner!.id}&type=USER_MASTER` +
                            `&recipientName=${encodeURIComponent(technique.owner!.name || "")}` +
                            `&recipientAvatar=${encodeURIComponent(technique.owner!.avatarUrl || "")}`
                        )
                      }
                    >
                      <MessageSquare className="w-4 h-4 me-2" />
                      {t("send_message", "Message")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <section className="p-6 md:p-8 border-t border-slate-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-foreground mb-6 flex items-center">
              <CalendarIcon className="w-5 h-5 me-2 text-brand" />
              {t("technique_schedule", "Availability")}
            </h2>
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-6 shadow-sm inline-block">
              <DayPicker
                mode="multiple"
                disabled={disabledDays}
                modifiers={{ busy: disabledDays }}
                modifiersStyles={{
                  busy: { color: 'white', backgroundColor: '#ef4444' }
                }}
                className="mx-auto"
              />
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>{t("busy_days", "Busy Days")}</span>
              </div>
            </div>
          </section>
        </div>

        {profile && technique && (
          <CreateTechniqueOrderModal
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            techniqueId={technique.id}
            techniqueName={technique.name}
            clientId={profile.id}
          />
        )}
      </div>
    </div>
  );
}
