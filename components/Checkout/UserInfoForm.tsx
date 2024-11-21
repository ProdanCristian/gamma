"use client";

import { useTranslations } from "next-intl";
import {
  formatPhoneNumber,
  handlePhoneKeyDown,
  stripPhonePrefix,
} from "@/lib/utils/phoneUtils";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

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

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  const data = await response.json();
  return data.user;
};

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

  const { data: userProfile } = useSWR<UserProfile>(
    session?.user?.email ? "/api/auth/profile" : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 0,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        if (data) {
          setGuestName(`${data.Nume} ${data.Prenume}`.trim());
          if (session?.user?.email) {
            setGuestEmail(session.user.email);
          }
          if (data.Numar_Telefon) {
            setGuestPhone(formatPhoneNumber(data.Numar_Telefon));
          }
        }
      },
    }
  );

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
            className="w-full p-2 rounded-lg dark:bg-[#4a4b59] bg-gray-100"
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
            className="w-full p-2 rounded-lg dark:bg-[#4a4b59] bg-gray-100"
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
      </div>
    </div>
  );
};
