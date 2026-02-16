import { db } from "@/lib/db";

export type SiteSettings = {
  bannerEnabled: boolean;
  bannerText: string;
  bannerCtaLabel: string;
  bannerImageUrl: string;
  buyMeACoffeeUrl: string;
};

const defaultSettings: SiteSettings = {
  bannerEnabled: true,
  bannerText: "Welcome to AI Help Center",
  bannerCtaLabel: "Buy me a coffee",
  bannerImageUrl: "",
  buyMeACoffeeUrl: ""
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const siteSettingDelegate = (db as unknown as { siteSetting?: { findUnique: Function } }).siteSetting;

  if (!siteSettingDelegate) {
    return defaultSettings;
  }

  try {
    const settings = await db.siteSetting.findUnique({
      where: { id: "main" },
      select: {
        bannerEnabled: true,
        bannerText: true,
        bannerCtaLabel: true,
        bannerImageUrl: true,
        buyMeACoffeeUrl: true
      }
    });

    if (!settings) {
      return defaultSettings;
    }

    return {
      bannerEnabled: settings.bannerEnabled,
      bannerText: settings.bannerText,
      bannerCtaLabel: settings.bannerCtaLabel,
      bannerImageUrl: settings.bannerImageUrl ?? "",
      buyMeACoffeeUrl: settings.buyMeACoffeeUrl ?? ""
    };
  } catch {
    return defaultSettings;
  }
}
