import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetSkillsQuery } from "@/store/api/authApi";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function FeaturedSkillsSection() {
  const { t, i18n } = useTranslation();
  const { data: skills, isLoading } = useGetSkillsQuery(undefined);

  if (isLoading) return null;

  const featuredSkills = skills?.filter((skill: any) => skill.icon) || [];

  if (featuredSkills.length === 0) return null;

  const getLocalizedSkillName = (skill: any) => {
    if (i18n.language === "am") return skill.nameAm;
    if (i18n.language === "ru") return skill.nameRu;
    return skill.nameEn;
  };

  return (
    <section className="w-full py-10 bg-white dark:bg-background border-b border-gray-100 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-start gap-8 md:gap-12 lg:gap-16">
          {featuredSkills.map((skill: any, index: number) => {
            const isUrl = skill.icon.startsWith('http') || skill.icon.startsWith('/');
            const IconComponent = !isUrl ? (LucideIcons as any)[skill.icon] : null;

            return (
              <Link 
                key={skill.id} 
                to={`/search?q=${encodeURIComponent(skill.key)}`}
                className="group flex flex-col items-center justify-center w-24 gap-3 animate-in fade-in zoom-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative w-14 h-14 flex items-center justify-center">
                  {/* Hover Blob Background */}
                  <div className="absolute inset-0 bg-brand/10 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] scale-0 group-hover:scale-125 transition-transform duration-300 ease-out origin-center opacity-0 group-hover:opacity-100"></div>
                  
                  {/* Icon */}
                  <div className="relative z-10 text-gray-500 dark:text-gray-400 group-hover:text-brand transition-colors duration-300">
                    {IconComponent ? (
                      <IconComponent className="w-8 h-8 stroke-[1.5]" />
                    ) : isUrl ? (
                      <img src={skill.icon} alt={skill.key} className="w-8 h-8 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <Search className="w-8 h-8 stroke-[1.5]" />
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 text-center group-hover:text-brand group-hover:font-semibold transition-all duration-300 leading-tight">
                  {getLocalizedSkillName(skill)}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
