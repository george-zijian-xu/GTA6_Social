import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for GTA Social — how we collect, use, and protect your data.",
  alternates: { canonical: "https://gta-social.com/privacy" },
  robots: { index: false, follow: false },
};

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-8">
      <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-foreground-muted leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
      <p className="text-foreground-muted mb-12 text-base">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <Section title="1. Introduction" id="introduction">
        <p>GTA Social ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
        <p>Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our service.</p>
      </Section>

      <Section title="2. Information We Collect" id="information-we-collect">
        <h3 className="font-semibold text-foreground mb-2">Account Information</h3>
        <p>When you create an account, we collect: email address, username, display name, password (hashed), and optional profile information (bio, avatar, website).</p>

        <h3 className="font-semibold text-foreground mb-2 mt-4">Content You Create</h3>
        <p>We collect and store all posts you create, including: captions, images, comments, likes, and follows. This content is stored in our database and displayed on the platform.</p>

        <h3 className="font-semibold text-foreground mb-2 mt-4">Usage Data</h3>
        <p>We automatically collect information about your interactions with the service: pages visited, posts viewed, search queries, likes, comments, follows, and timestamps. This helps us understand how you use GTA Social and improve the service.</p>

        <h3 className="font-semibold text-foreground mb-2 mt-4">Authentication Data</h3>
        <p>If you sign up via Google or Discord OAuth, we receive your email, name, and profile picture from those services. We do not store your OAuth tokens.</p>

        <h3 className="font-semibold text-foreground mb-2 mt-4">Device & Browser Information</h3>
        <p>We may collect information about your device (browser type, IP address, operating system) through standard web server logs and analytics.</p>
      </Section>

      <Section title="3. How We Use Your Information" id="how-we-use">
        <ul className="list-disc ml-5 space-y-2">
          <li>To operate and maintain the service</li>
          <li>To create and manage your account</li>
          <li>To display your profile and content to other users</li>
          <li>To enable social features (likes, comments, follows, notifications)</li>
          <li>To improve the service and user experience</li>
          <li>To enforce our Terms of Service and prevent abuse</li>
          <li>To respond to your inquiries and support requests</li>
          <li>To comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="4. Data Sharing & Third Parties" id="data-sharing">
        <p>We do not sell, trade, or rent your personal information to third parties.</p>
        <p>We use the following service providers to operate GTA Social:</p>
        <ul className="list-disc ml-5 space-y-2">
          <li><strong>Supabase:</strong> Database, authentication, and file storage. Your data is encrypted and stored securely.</li>
          <li><strong>Cloudflare:</strong> CDN and DDoS protection. Your IP address may be logged for security purposes.</li>
          <li><strong>Vercel:</strong> Hosting and deployment. Server logs may contain your IP address and request data.</li>
        </ul>
        <p className="mt-3">We may disclose your information if required by law, court order, or to protect our legal rights and the safety of our users.</p>
      </Section>

      <Section title="5. Data Retention" id="data-retention">
        <p>We retain your account information and content for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law.</p>
        <p>Deleted content may remain in backups for up to 90 days before permanent deletion.</p>
      </Section>

      <Section title="6. Your Rights & Choices" id="your-rights">
        <p>You have the following rights regarding your personal data:</p>
        <ul className="list-disc ml-5 space-y-2">
          <li><strong>Access:</strong> You can view your account information and content at any time.</li>
          <li><strong>Correction:</strong> You can update your profile information in your account settings.</li>
          <li><strong>Deletion:</strong> You can request deletion of your account and associated data.</li>
          <li><strong>Opt-out:</strong> You can control notification preferences in your account settings.</li>
        </ul>
      </Section>

      <Section title="7. Security" id="security">
        <p>We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
      </Section>

      <Section title="8. Children's Privacy" id="childrens-privacy">
        <p>GTA Social is not intended for users under 13 years old. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will delete such information immediately.</p>
      </Section>

      <Section title="9. Changes to This Policy" id="changes">
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page and updating the "Last updated" date. Your continued use of GTA Social constitutes acceptance of the updated Privacy Policy.</p>
      </Section>

      <Section title="10. Contact Us" id="contact">
        <p>If you have questions about this Privacy Policy or our privacy practices, please contact us at:</p>
        <p className="mt-2">
          <a href="mailto:privacy@gta-social.com" className="text-primary hover:text-primary-hover">
            privacy@gta-social.com
          </a>
        </p>
      </Section>
    </div>
  );
}
