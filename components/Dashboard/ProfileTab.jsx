"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";

export function ProfileTab({ userData, refetchData }) {
  const { toast } = useToast();
  const [isTranslationsLoaded, setIsTranslationsLoaded] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  let t;
  try {
    t = useTranslations();
    if (!isTranslationsLoaded) {
      setIsTranslationsLoaded(true);
    }
  } catch (error) {
    t = (key) => key;
  }

  const formatPhoneNumber = (phone) => {
    const prefix = "+373 ";
    const numbers = phone.replace(/\D/g, "");

    if (!numbers) return prefix;

    const normalizedNumbers = numbers.startsWith("373")
      ? numbers.slice(3)
      : numbers;

    const trimmedNumbers = normalizedNumbers.slice(0, 8);
    return `${prefix}${trimmedNumbers}`;
  };

  const stripPhonePrefix = (phone) => {
    return phone.replace(/\D/g, "").replace(/^373/, "");
  };

  const [profileForm, setProfileForm] = React.useState({
    firstName: userData.Nume || "",
    lastName: userData.Prenume || "",
    phone: formatPhoneNumber(userData.Numar_Telefon || ""),
    email: userData.Email || "",
    provider: userData.Provider || "",
    password: "",
  });

  React.useEffect(() => {
    if (userData) {
      setProfileForm((prev) => ({
        ...prev,
        firstName: userData.Nume || "",
        lastName: userData.Prenume || "",
        phone: formatPhoneNumber(userData.Numar_Telefon || ""),
        email: userData.Email || "",
        provider: userData.Provider || "",
      }));
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setProfileForm((prev) => ({
        ...prev,
        [name]: formattedPhone,
      }));
    } else {
      setProfileForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (
      [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
      (e.keyCode >= 35 && e.keyCode <= 40) ||
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 96 && e.keyCode <= 105)
    ) {
      return;
    }

    e.preventDefault();
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const phoneNumber = stripPhonePrefix(profileForm.phone);

      const updateData = {
        Nume: profileForm.firstName.trim(),
        Prenume: profileForm.lastName.trim(),
        Numar_Telefon: phoneNumber,
        Email: profileForm.email.trim(),
        Provider: profileForm.provider,
      };

      if (profileForm.provider === "credentials" && profileForm.password) {
        updateData.Password = profileForm.password;
      }

      const response = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      setProfileForm((prev) => ({
        ...prev,
        firstName: data.user.Nume,
        lastName: data.user.Prenume,
        phone: formatPhoneNumber(data.user.Numar_Telefon),
        email: data.user.Email,
        password: "",
      }));

      toast({
        title: t("profile.success"),
        description: t("profile.profile_updated"),
        variant: "default",
        duration: 3000,
      });

      await refetchData();
    } catch (error) {
      setError(error);
      toast({
        title: t("profile.error"),
        description:
          error instanceof Error ? error.message : t("profile.generic_error"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTranslationsLoaded) {
    return (
      <div className="border-gray-200 dark:border-gray-700 dark:bg-charade-900 rounded-lg bg-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-gray-200 dark:border-gray-700 dark:bg-charade-900 rounded-lg bg-white p-6">
      <h2 className="text-xl font-semibold mb-4 dark:text-white text-gray-700">
        {t("profile.profile_information")}
      </h2>

      <form onSubmit={updateProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium dark:text-white text-gray-700">
            {t("profile.first_name")}:
          </label>
          <input
            name="firstName"
            value={profileForm.firstName}
            onChange={handleInputChange}
            type="text"
            required
            className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-white text-gray-700">
            {t("profile.last_name")}:
          </label>
          <input
            name="lastName"
            value={profileForm.lastName}
            onChange={handleInputChange}
            type="text"
            required
            className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-white text-gray-700">
            {t("profile.phone_number")}:
          </label>
          <input
            name="phone"
            value={profileForm.phone}
            onChange={handleInputChange}
            onKeyDown={handlePhoneKeyDown}
            type="text"
            maxLength={13}
            className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <p className="text-sm text-gray-500 mt-1">
            {t("profile.phone_format")} +373 XXXXXXXX
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium dark:text-white text-gray-700">
            {t("profile.email")}:
          </label>
          <input
            name="email"
            value={profileForm.email}
            onChange={handleInputChange}
            type="email"
            required
            disabled={
              profileForm.provider === "google" ||
              profileForm.provider === "facebook"
            }
            className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          {(profileForm.provider === "google" ||
            profileForm.provider === "facebook") && (
            <p className="text-sm text-gray-500 mt-1">
              {t("profile.email_change_restricted")}
            </p>
          )}
        </div>

        {profileForm.provider === "credentials" && (
          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700">
              {t("profile.new_password")}:
            </label>
            <input
              name="password"
              value={profileForm.password}
              onChange={handleInputChange}
              type="password"
              className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`bg-gray-500 hover:bg-charade-800 text-white px-4 py-2 rounded-lg  transition-colors duration-200 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? t("profile.updating") : t("profile.update_profile")}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mt-4">
          <p>{error.message || t("profile.generic_error")}</p>
        </div>
      )}
    </div>
  );
}
