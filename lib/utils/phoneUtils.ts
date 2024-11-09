export const formatPhoneNumber = (phone: string) => {
  const prefix = "+373 ";
  const numbers = phone.replace(/\D/g, "");

  if (!numbers) return prefix;

  const normalizedNumbers = numbers.startsWith("373")
    ? numbers.slice(3)
    : numbers;

  const trimmedNumbers = normalizedNumbers.slice(0, 8);
  return `${prefix}${trimmedNumbers}`;
};

export const stripPhonePrefix = (phone: string) => {
  return parseInt(phone.replace(/\D/g, "").replace(/^373/, ""));
};

export const handlePhoneKeyDown = (e: React.KeyboardEvent) => {
  const allowedKeys = [
    46,
    8,
    9,
    27,
    13,
    110,
    190, // Special keys
    65,
    67,
    86, // A, C, V for copy/paste
    ...Array.from({ length: 6 }, (_, i) => i + 35), // Navigation keys
    ...Array.from({ length: 10 }, (_, i) => i + 48), // Numbers
    ...Array.from({ length: 10 }, (_, i) => i + 96), // Numpad
  ];

  const isControlKey = e.ctrlKey || e.metaKey;
  const isCopyPasteKey = [65, 67, 86].includes(e.keyCode);

  if (
    allowedKeys.includes(e.keyCode) &&
    (!isCopyPasteKey || (isCopyPasteKey && isControlKey))
  ) {
    return;
  }

  e.preventDefault();
};
