import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Leonida Social — how we collect and use your data.",
  alternates: { canonical: "https://grandtheftauto6.com/privacy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-foreground-muted leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-foreground-muted mb-10 text-sm">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}
      </p>

      <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-primary">
        This privacy policy is a placeholder. Final legal copy will be provided by a legal
        professional before public launch.
      </div>

      <Section title="1. Data We Collect">
        <p>We collect the following information when you use Leonida Social:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Account information: email address, username, display name</li>
          <li>Content you post: captions, images, comments</li>
          <li>Usage data: pages visited, interactions (likes, follows)</li>
          <li>Profile information you choose to provide: bio, website, avatar</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Data">
        <p>[Final copy to be provided by legal counsel.]</p>
        <p>In general, your data is used to operate the service, personalise your experience,
          and ensure community safety.</p>
      </Section>

      <Section title="3. Data Sharing">
        <p>[Final copy to be provided by legal counsel.]</p>
        <p>We do not sell your personal data. We use Supabase for database and authentication
          services.</p>
      </Section>

      <Section title="4. Data Retention">
        <p>[Final copy to be provided by legal counsel.]</p>
      </Section>

      <Section title="5. Your Rights">
        <p>[Final copy to be provided by legal counsel.]</p>
        <p>You may request deletion of your account and associated data at any time.</p>
      </Section>

      <Section title="6. Contact">
        <p>[Contact email to be provided by legal counsel.]</p>
        <p>For privacy inquiries, please use the report feature on the site.</p>
      </Section>
    </div>
  );
}
