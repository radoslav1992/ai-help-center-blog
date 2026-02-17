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
      <h2>Branding and support links</h2>
      <p>Update logo, banner, and optional Buy me a coffee link for the whole site.</p>

      {searchParams.status === "saved" ? <p className="notice">Settings updated.</p> : null}
      {searchParams.status === "invalid" ? (
        <p className="error-line">Please fix invalid values and try again.</p>
      ) : null}

      <form action={updateSiteSettingsAction} className="neo-form" encType="multipart/form-data">
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

        <label htmlFor="logoImageUrl">Logo image URL (optional)</label>
        <input
          id="logoImageUrl"
          name="logoImageUrl"
          type="text"
          defaultValue={settings.logoImageUrl}
          placeholder="https://... or /uploads/..."
        />

        <label htmlFor="logoImageFile">Logo image upload (optional)</label>
        <input id="logoImageFile" name="logoImageFile" type="file" accept="image/*" />

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
          type="text"
          defaultValue={settings.bannerImageUrl}
          placeholder="https://... or /uploads/..."
        />

        <label htmlFor="bannerImageMode">Banner image display mode</label>
        <select id="bannerImageMode" name="bannerImageMode" defaultValue={settings.bannerImageMode}>
          <option value="COVER">Cover (can crop)</option>
          <option value="CONTAIN">Fit (no crop)</option>
          <option value="FILL">Stretch</option>
        </select>

        <label htmlFor="bannerImageFile">Banner image upload (optional)</label>
        <input id="bannerImageFile" name="bannerImageFile" type="file" accept="image/*" />

        <p className="meta-line">If you provide both a URL and a file, the uploaded file is used.</p>

        <button type="submit" className="neo-button">
          Save settings
        </button>
      </form>

      <article className="mini-card">
        <p className="meta-line">Banner preview</p>
        {settings.bannerImageUrl ? (
          <img
            src={settings.bannerImageUrl}
            alt="Banner preview"
            className={`banner-image banner-image--${settings.bannerImageMode.toLowerCase()}`}
          />
        ) : null}
        <p>{settings.bannerText}</p>
      </article>

      <article className="mini-card">
        <p className="meta-line">Logo preview</p>
        {settings.logoImageUrl ? (
          <img src={settings.logoImageUrl} alt="Logo preview" className="logo-preview-image" />
        ) : (
          <p className="meta-line">No logo configured yet.</p>
        )}
      </article>
    </section>
  );
}
