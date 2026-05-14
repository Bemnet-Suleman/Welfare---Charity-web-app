import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRoleLabel(role: string | undefined, t: (key: string) => string) {
  switch (role) {
    case "admin":
      return t("Admin")
    case "system_admin":
      return t("System Admin")
    case "organizer":
      return t("Organizer")
    case "donor":
      return t("Donor")
    case "volunteer":
      return t("Volunteer")
    case "beneficiary":
      return t("Beneficiary")
    default:
      if (!role) {
        return t("Donor")
      }
      const label = role
        .replace(/_/g, " ")
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
      return t(label)
  }
}
