import { updateSiteSettingsAction } from "@/app/actions";
import { getSiteSettings } from "@/lib/site-settings";

type SettingsPageProps = {
  searchParams: { status?: string };
};

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  const settings = await getSiteSettings();

  return (
    <section className="neo-card">
      <p className="neo-kicker">SITE SETTINGS</p>
      <h2>Banner and support links</h2>
      <p>Update your top banner and optional Buy me a coffee link for the whole site.</p>

      {searchParams.status === "saved" ? <p className="notice">Settings updated.</p> : null}
      {searchParams.status === "invalid" ? (
        <p className="error-line">Please fix invalid values and try again.</p>
      ) : null}

      <form action={updateSiteSettingsAction} className="neo-form">
        <label className="checkbox-line" htmlFor="bannerEnabled">
          <input
            id="bannerEnabled"
            name="bannerEnabled"
            type="checkbox"
            defaultChecked={settings.bannerEnabled}
          />
          Show banner
        </label>

        <label htmlFor="bannerText">Banner text</label>
        <input
          id="bannerText"
          name="bannerText"
          type="text"
          minLength={4}
          maxLength={180}
          defaultValue={settings.bannerText}
          required
        />

        <label htmlFor="bannerCtaLabel">Banner button label</label>
        <input
          id="bannerCtaLabel"
          name="bannerCtaLabel"
          type="text"
          minLength={2}
          maxLength={40}
          defaultValue={settings.bannerCtaLabel}
          required
        />

        <label htmlFor="buyMeACoffeeUrl">Buy me a coffee URL (optional)</label>
        <input
          id="buyMeACoffeeUrl"
          name="buyMeACoffeeUrl"
          type="url"
          defaultValue={settings.buyMeACoffeeUrl}
          placeholder="https://buymeacoffee.com/yourname"
        />

        <label htmlFor="bannerImageUrl">Banner image URL (optional)</label>
        <input
          id="bannerImageUrl"
          name="bannerImageUrl"
          type="url"
          defaultValue={settings.bannerImageUrl}
          placeholder="https://..."
        />

        <button type="submit" className="neo-button">
          Save settings
        </button>
      </form>

      <article className="mini-card">
        <p className="meta-line">Preview</p>
        {settings.bannerImageUrl ? (
          <img src={settings.bannerImageUrl} alt="Banner preview" className="banner-image" />
        ) : null}
        <p>{settings.bannerText}</p>
      </article>
    </section>
  );
}
