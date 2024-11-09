"use client";

import { useTranslations } from "next-intl";
import {
  formatPhoneNumber,
  handlePhoneKeyDown,
  stripPhonePrefix,
} from "@/lib/utils/phoneUtils";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
  Nume: string;
  Prenume: string;
  Numar_Telefon: string;
  Provider?: string;
}

interface UserInfoFormProps {
  guestName: string;
  setGuestName: (value: string) => void;
  guestEmail: string;
  setGuestEmail: (value: string) => void;
  guestPhone: string;
  setGuestPhone: (value: string) => void;
}

export const UserInfoForm = ({
  guestName,
  setGuestName,
  guestEmail,
  setGuestEmail,
  guestPhone,
  setGuestPhone,
}: UserInfoFormProps) => {
  const t = useTranslations();
  const { data: session } = useSession();

  // Fetch user profile when component mounts if user is logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch("/api/auth/profile");
          if (response.ok) {
            const data = await response.json();
            const userProfile: UserProfile = data.user;

            // Set the form values with user data
            setGuestName(`${userProfile.Nume} ${userProfile.Prenume}`.trim());
            setGuestEmail(session.user.email);
            if (userProfile.Numar_Telefon) {
              setGuestPhone(formatPhoneNumber(userProfile.Numar_Telefon));
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    if (session?.user) {
      fetchUserProfile();
    }
  }, [session, setGuestName, setGuestEmail, setGuestPhone]);

  // Set default phone prefix if empty
  useEffect(() => {
    if (!guestPhone) {
      setGuestPhone("+373 ");
    }
  }, [guestPhone, setGuestPhone]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = stripPhonePrefix(e.target.value).toString();
    const formattedPhone = formatPhoneNumber(rawValue);
    setGuestPhone(formattedPhone);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("checkout.first_name")}
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full p-2 rounded-lg dark:bg-[#4a4b59]  bg-gray-100"
            placeholder={t("checkout.first_name_placeholder")}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("checkout.email")}</label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full p-2 rounded-lg dark:bg-[#4a4b59]  bg-gray-100"
            placeholder={t("checkout.email_placeholder")}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("checkout.phone")}</label>
        <input
          type="tel"
          value={guestPhone}
          onChange={handlePhoneChange}
          onKeyDown={handlePhoneKeyDown}
          maxLength={13}
          className="w-full p-2 rounded-lg dark:bg-[#4a4b59] bg-gray-100"
          placeholder="+373 XXXXXXXX"
          required
        />
        <p className="text-xs text-gray-500">{t("checkout.phone_format")}</p>
      </div>
    </div>
  );
};
