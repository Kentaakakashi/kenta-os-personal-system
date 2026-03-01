export type OSKey = "kenta" | "lemon";

export function getActiveOS(): OSKey {
  const v = localStorage.getItem("kos_active_os");
  return v === "lemon" ? "lemon" : "kenta";
}

export const storageKeys = {
  widgetOrder: (os: OSKey) => `kos-${os}-widget-order`,
  widgetSettings: (os: OSKey) => `kos-${os}-widget-settings`,
  customThemes: (os: OSKey) => `kos-${os}-custom-themes`,
  activeTheme: (os: OSKey) => `kos-${os}-active-theme`,
};

export function emitProfileUpdate(os: OSKey) {
  window.dispatchEvent(new CustomEvent("kos-profile-update", { detail: { os } }));
}
