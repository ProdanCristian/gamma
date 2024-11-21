"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ContactForm from "./ContactForm";

export default function ClientContact() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/auth/profile")
        .then((res) => res.json())
        .then((data) => setUserData(data.user))
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [session]);

  return <ContactForm initialUserData={userData} />;
}
