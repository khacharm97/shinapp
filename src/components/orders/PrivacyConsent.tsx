import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PrivacyConsentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function PrivacyConsent({ checked, onCheckedChange }: PrivacyConsentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-4">
      <Checkbox
        id="privacy"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value as boolean)}
      />
      <div className="space-y-1 leading-none">
        <Label htmlFor="privacy" className="block text-sm font-medium leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t("accept_privacy_pre", "I accept the ")}
          <Link
            to="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline hover:no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t("accept_privacy_link", "Privacy Policy")}
          </Link>
          {t("accept_privacy_post", " and Contract Conditions")} <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          {t("privacy_desc", "By proposing this order, you agree to the platform's terms and conditions.")}
        </p>
      </div>
    </div>
  );
}
