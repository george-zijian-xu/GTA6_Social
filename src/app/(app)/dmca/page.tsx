import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA Takedown",
  description: "Submit a DMCA takedown request for content on GTA Social.",
  alternates: { canonical: "https://gta-social.com/dmca" },
  robots: { index: false, follow: false },
};

export default function DmcaPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground mb-2">DMCA Takedown Requests</h1>
      <p className="text-foreground-muted mb-10 text-sm">
        GTA Social respects intellectual property rights.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">How to Submit a Takedown Request</h2>
        <div className="text-sm text-foreground-muted leading-relaxed space-y-3">
          <p>
            If you believe that content on GTA Social infringes your copyright, you may submit a
            takedown notice. To be valid, your notice must include:
          </p>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Your full legal name and contact information</li>
            <li>A description of the copyrighted work you claim has been infringed</li>
            <li>The URL(s) of the allegedly infringing content on our site</li>
          </ol>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3">Contact</h2>
        <div className="text-sm text-foreground-muted leading-relaxed">
          <p>
            Send your DMCA takedown request to:{" "}
            <a href="mailto:dmca@gta-social.com" className="text-primary hover:text-primary-hover">
              dmca@gta-social.com
            </a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-foreground mb-3">Note on Fan Content</h2>
        <div className="text-sm text-foreground-muted leading-relaxed space-y-2">
          <p>
            GTA Social is a fan community. GTA 6, Leonida, and related marks are
            trademarks of Take-Two Interactive Software, Inc. This site is not affiliated with or
            endorsed by Rockstar Games or Take-Two Interactive.
          </p>
          <p>
            If you are a representative of Rockstar Games or Take-Two Interactive and wish to discuss
            this site, please contact us directly using the information above.
          </p>
        </div>
      </section>
    </div>
  );
}
