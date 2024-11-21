"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { MoldovaAddressValidator } from "@/lib/moldova-address-validator";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import useSWR, { mutate } from "swr";
import { useLocale } from "next-intl";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const AddressTab = ({
  onAddressChange,
  isCheckout = false,
  guestMode = false,
}) => {
  const locale = useLocale();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = useTranslations();

  const {
    data: addressData,
    error: addressError,
    isLoading: isAddressLoading,
  } = useSWR(session ? "/api/address" : null, fetcher);

  const [address, setAddress] = useState(null);
  const [formData, setFormData] = useState({
    streetType: "street",
    street: "",
    houseNumber: "",
    building: "",
    entrance: "",
    floor: "",
    apartment: "",
    city: "",
    sector: "",
    district: "",
    postalCode: "",
  });
  const [citySearch, setCitySearch] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [validator, setValidator] = useState(null);

  useEffect(() => {
    const validator = new MoldovaAddressValidator(locale);
    setValidator(validator);
  }, [locale]);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtSuggestions, setDistrictSuggestions] = useState([]);

  const [sectorSearch, setSectorSearch] = useState("");
  const [sectorSuggestions, setSectorSuggestions] = useState([]);

  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (guestMode) {
      setShowAddressForm(true);
      return;
    }

    if (!isAddressLoading && addressData) {
      if (addressData.exists && addressData.address) {
        setAddress(addressData.address);
        onAddressChange?.(addressData.address);
        setShowAddressForm(false);
      } else {
        setShowAddressForm(true);
      }
    }
  }, [addressData, onAddressChange, guestMode, isAddressLoading]);

  const getDistricts = () => {
    return Array.from(validator.data.districtsMap.entries()).map(
      ([ro, ru]) => ({
        name: locale === "ru" ? ru : ro,
        nameRo: ro,
        nameRu: ru,
      })
    );
  };

  const handleDistrictSearch = (value) => {
    setDistrictSearch(value);
    if (!value.trim()) {
      setDistrictSuggestions([]);
      return;
    }

    const districts = getDistricts();
    const filtered = districts.filter((district) =>
      district.name.toLowerCase().includes(value.toLowerCase())
    );
    setDistrictSuggestions(filtered);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district.nameRo);
    setDistrictSearch(district.name);
    setDistrictSuggestions([]);
    setCitySearch("");
    setCitySuggestions([]);

    const updatedFormData = {
      ...formData,
      city: "",
      district: district.nameRo,
    };
    setFormData(updatedFormData);

    if (guestMode) {
      const formattedAddress = formatAddressToString(updatedFormData);
      onAddressChange?.(formattedAddress);
    }
  };

  const handleCitySearch = (value) => {
    if (!validator) return;

    console.log("Current validator language:", validator.language);
    console.log("Current locale:", locale);

    setCitySearch(value);
    if (!value.trim()) {
      setCitySuggestions([]);
      return;
    }

    let suggestions = [];

    if (selectedDistrict) {
      const cityResults = validator.autocompleteLocality(value, {
        threshold: 0.3,
        limit: 5,
        type: "city",
        district: selectedDistrict,
      });

      console.log("City results:", cityResults);

      const suburbanResults = validator.autocompleteLocality(value, {
        threshold: 0.3,
        limit: 5,
        type: "suburban",
        district: selectedDistrict,
      });

      const villageResults = validator.autocompleteLocality(value, {
        threshold: 0.3,
        limit: 5,
        type: "village",
        district: selectedDistrict,
      });

      suggestions = [...cityResults, ...suburbanResults, ...villageResults];
    } else {
      suggestions = validator.autocompleteLocality(value, {
        threshold: 0.3,
        limit: 10,
      });
    }

    suggestions = Array.from(new Set(suggestions.map((s) => JSON.stringify(s))))
      .map((s) => JSON.parse(s))
      .slice(0, 10);

    setCitySuggestions(suggestions);
  };

  const handleCitySelect = (suggestion) => {
    const cityNameRo = suggestion.translations?.ro || suggestion.name;
    const cityNameRu = suggestion.translations?.ru || suggestion.name;

    const updatedFormData = {
      ...formData,
      city: cityNameRo,
      district: selectedDistrict,
      sector: "",
    };
    setFormData(updatedFormData);
    setCitySearch(locale === "ru" ? cityNameRu : cityNameRo);
    setCitySuggestions([]);
    setSectorSearch("");
    setSectorSuggestions([]);

    if (guestMode) {
      const formattedAddress = formatAddressToString(updatedFormData);
      onAddressChange?.(formattedAddress);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    if (guestMode) {
      const formattedAddress = formatAddressToString(updatedFormData);
      onAddressChange?.(formattedAddress);
    }
  };

  const formatAddressToString = (formData) => {
    const parts = [];

    if (formData.district) {
      const districtName =
        locale === "ru"
          ? validator.data.districtsMap.get(formData.district)
          : formData.district;
      parts.push(districtName);
    }

    if (formData.city) {
      const cityName =
        locale === "ru"
          ? validator.data.citiesMap.get(formData.city) || formData.city
          : formData.city;
      parts.push(cityName);
    }

    if (formData.sector && isChisinauSelected()) {
      const sectorName =
        locale === "ru"
          ? validator.data.chisinauSectorsMap.get(formData.sector)
          : formData.sector;
      parts.push(`${t("address.sector")} ${sectorName}`);
    }

    const streetTypes = {
      street: t("address.street"),
      avenue: t("address.avenue"),
      lane: t("address.lane"),
      alley: t("address.alley"),
      square: t("address.square"),
    };

    if (formData.street) {
      parts.push(`${streetTypes[formData.streetType]} ${formData.street}`);
    }

    if (formData.building) {
      parts.push(`${t("address.building")} ${formData.building}`);
      if (formData.apartment) {
        parts.push(`${t("address.apartment")} ${formData.apartment}`);
      }
      if (formData.entrance) {
        parts.push(`${t("address.entrance")} ${formData.entrance}`);
      }
      if (formData.floor) {
        parts.push(`${t("address.floor")} ${formData.floor}`);
      }
    } else if (formData.houseNumber) {
      parts.push(`${t("address.house")} ${formData.houseNumber}`);
    }

    if (formData.postalCode) {
      parts.push(formData.postalCode);
    }

    return parts.join(", ");
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formattedAddress = formatAddressToString(formData);

      if (guestMode) {
        onAddressChange?.(formattedAddress);
        setAddress(formattedAddress);
        setShowAddressForm(false);
        toast({
          title: t("address.success"),
          description: t("address.address_updated"),
          variant: "default",
          duration: 3000,
        });
      } else {
        const response = await fetch("/api/address", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: formattedAddress,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || t("address.update_failed"));
        }

        setAddress(data.address);
        onAddressChange?.(data.address);
        setShowAddressForm(false);

        if (data.address !== addressData?.address) {
          mutate("/api/address");
        }

        toast({
          title: t("address.success"),
          description: t("address.address_updated"),
          variant: "default",
          duration: 3000,
        });
      }
    } catch (error) {
      setError(error);
      toast({
        title: t("address.error"),
        description:
          error instanceof Error ? error.message : t("address.generic_error"),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (!formData.city || !formData.street) return false;

    if (formData.building) {
      return !!formData.apartment;
    }

    return !!formData.houseNumber;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".autocomplete-wrapper")) {
        setDistrictSuggestions([]);
        setCitySuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDistrictKeyDown = (e) => {
    if (e.key === "Enter" && districtSuggestions.length > 0) {
      handleDistrictSelect(districtSuggestions[0]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setDistrictSuggestions([]);
    }
  };

  const handleCityKeyDown = (e) => {
    if (e.key === "Enter" && citySuggestions.length > 0) {
      handleCitySelect(citySuggestions[0]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setCitySuggestions([]);
    }
  };

  const handleSectorSearch = (value) => {
    if (!validator) return;

    setSectorSearch(value);
    if (!value.trim() || !isChisinauSelected()) {
      setSectorSuggestions([]);
      return;
    }

    const sectors = Array.from(validator.data.chisinauSectorsMap.entries()).map(
      ([ro, ru]) => ({
        name: validator.language === "ro" ? ro : ru,
        translations: { ro, ru },
      })
    );

    const filtered = sectors.filter((sector) =>
      sector.name.toLowerCase().includes(value.toLowerCase())
    );
    setSectorSuggestions(filtered);
  };

  const handleSectorSelect = (sector) => {
    const updatedFormData = {
      ...formData,
      sector: sector.translations.ro,
    };
    setFormData(updatedFormData);
    setSectorSearch(
      locale === "ru" ? sector.translations.ru : sector.translations.ro
    );
    setSectorSuggestions([]);

    if (guestMode) {
      const formattedAddress = formatAddressToString(updatedFormData);
      onAddressChange?.(formattedAddress);
    }
  };

  const handleSectorKeyDown = (e) => {
    if (e.key === "Enter" && sectorSuggestions.length > 0) {
      handleSectorSelect(sectorSuggestions[0]);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setSectorSuggestions([]);
    }
  };

  const isChisinauSelected = () => {
    const chisinauNames = ["chișinău", "кишинёв"];
    return chisinauNames.includes(formData.city.toLowerCase());
  };

  if (addressError) {
    toast({
      title: t("address.error"),
      description: t("address.fetch_error"),
      variant: "destructive",
    });
  }

  return (
    <div className="border-gray-200 dark:border-gray-700 dark:bg-charade-900 rounded-lg bg-white">
      {isAddressLoading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-charade-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-charade-700 rounded w-1/2"></div>
          </div>
        </div>
      ) : address && !showAddressForm ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-[#4A4B59] rounded-lg ">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{address}</p>
            <Button
              onClick={() => setShowAddressForm(true)}
              className={`bg-gray-500 hover:bg-charade-800 text-white px-4 py-2 rounded-lg transition-colors duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {t("address.edit_address")}
            </Button>
          </div>
        </div>
      ) : showAddressForm ? (
        <form
          onSubmit={handleAddressSubmit}
          onChange={(e) => {
            if (guestMode) {
              const formattedAddress = formatAddressToString(formData);
              onAddressChange?.(formattedAddress);
            }
          }}
          className="space-y-4"
        >
          <div className="autocomplete-wrapper">
            <label className="block text-sm font-medium dark:text-white text-gray-700">
              {t("address.district")}:<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => handleDistrictSearch(e.target.value)}
                onKeyDown={handleDistrictKeyDown}
                placeholder={t("address.search_district")}
                className="p-2 dark:dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              {districtSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white dark:bg-charade-950 shadow-lg rounded-b-md max-h-60 overflow-y-auto">
                  {districtSuggestions.map((district, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleDistrictSelect(district)}
                    >
                      {district.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="autocomplete-wrapper">
            <label className="block text-sm font-medium dark:text-white text-gray-700">
              {t("address.locality")}:<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => handleCitySearch(e.target.value)}
                onKeyDown={handleCityKeyDown}
                placeholder={
                  selectedDistrict
                    ? t("address.search_locality_in_district", {
                        district: districtSearch,
                      })
                    : t("address.search_locality")
                }
                className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              {citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white dark:bg-charade-950 shadow-lg rounded-b-md max-h-60 overflow-y-auto">
                  {citySuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => handleCitySelect(suggestion)}
                    >
                      <div>{suggestion.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {suggestion.type === "city"
                          ? t("address.municipality")
                          : suggestion.type === "suburban"
                          ? t("address.suburban")
                          : t("address.village")}
                        {suggestion.district && ` - ${suggestion.district}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isChisinauSelected() && (
            <div className="autocomplete-wrapper">
              <label className="block text-sm font-medium dark:text-white text-gray-700">
                {t("address.sector")}:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sectorSearch}
                  onChange={(e) => handleSectorSearch(e.target.value)}
                  onKeyDown={handleSectorKeyDown}
                  placeholder={t("address.search_sector")}
                  className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                {sectorSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-charade-950 shadow-lg rounded-b-md max-h-60 overflow-y-auto">
                    {sectorSuggestions.map((sector, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleSectorSelect(sector)}
                      >
                        {sector.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700">
              {t("address.street_name")}:<span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                name="streetType"
                value={formData.streetType}
                onChange={handleInputChange}
                className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="street">{t("address.street")}</option>
                <option value="avenue">{t("address.avenue")}</option>
                <option value="lane">{t("address.lane")}</option>
                <option value="alley">{t("address.alley")}</option>
                <option value="square">{t("address.square")}</option>
              </select>
              <div className="col-span-2">
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700">
              {t("address.building_type")}:
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    building: "",
                    apartment: "",
                    entrance: "",
                    floor: "",
                  }));
                }}
                className={`p-3 rounded-lg border ${
                  !formData.building
                    ? "border-accent bg-accent/5 dark:bg-accent/5"
                    : "border-gray-300"
                }`}
              >
                {t("address.private_house")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, building: "1" }))
                }
                className={`p-3 rounded-lg border ${
                  formData.building
                    ? "border-accent bg-accent/5 dark:bg-accent/5"
                    : "border-gray-300"
                }`}
              >
                {t("address.apartment_building")}
              </button>
            </div>
          </div>

          {formData.building ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white text-gray-700">
                    {t("address.building")}:
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white text-gray-700">
                    {t("address.apartment")}:
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white text-gray-700">
                    {t("address.entrance")}:
                  </label>
                  <input
                    type="text"
                    name="entrance"
                    value={formData.entrance}
                    onChange={handleInputChange}
                    className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white text-gray-700">
                    {t("address.floor")}:
                  </label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-700">
                {t("address.house_number")}:
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleInputChange}
                className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium dark:text-white text-gray-700">
              {t("address.postal_code")}:
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="MD-2001"
              className="p-2 dark:bg-[#4A4B59] bg-gray-100 mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          {!guestMode && (
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className={`bg-gray-500 hover:bg-charade-800 text-white px-4 py-2 rounded-lg  transition-colors duration-200 ${
                  isLoading || !isFormValid()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading ? t("address.saving") : t("address.save_address")}
              </button>

              {address && (
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setFormData({
                      streetType: "street",
                      street: "",
                      houseNumber: "",
                      building: "",
                      entrance: "",
                      floor: "",
                      apartment: "",
                      city: "",
                      sector: "",
                      district: "",
                      postalCode: "",
                    });
                    setCitySearch("");
                    setCitySuggestions([]);
                  }}
                  className=" bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  {t("address.cancel")}
                </button>
              )}
            </div>
          )}
        </form>
      ) : null}

      {error && (
        <div className="text-red-500 mt-4">
          <p>{error.message || t("address.generic_error")}</p>
        </div>
      )}
    </div>
  );
};
