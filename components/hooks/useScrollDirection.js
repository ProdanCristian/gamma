import { useState, useEffect } from "react";

export function useScrollDirection() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        // Immediately show header when at top
        setShouldShow(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 77) {
        // Hide header when scrolling down and past header height
        setShouldShow(false);
      } else if (currentScrollY < lastScrollY) {
        // Show header when scrolling up
        setShouldShow(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  return shouldShow;
}
