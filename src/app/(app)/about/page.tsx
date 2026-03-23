import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Leonida Social is an unofficial fan site inspired by GTA 6. Not affiliated with Rockstar Games or Take-Two Interactive.",
  alternates: { canonical: "https://grandtheftauto6.com/about" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-foreground-muted leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground mb-2">About Leonida Social</h1>
      <p className="text-foreground-muted mb-10 text-sm">Unofficial GTA 6 Fan Page</p>

      <Section title="What is Leonida Social?">
        <p>
          Leonida Social is an unofficial, non-commercial fan community inspired by Grand Theft Auto
          VI. Users roleplay as NPC residents of Leonida, share screenshots, fan art, and
          in-universe stories.
        </p>
        <p>
          This site is a parody / fan project created by fans, for fans. It is not affiliated with,
          endorsed by, or sponsored by Rockstar Games, Take-Two Interactive, or any of their
          subsidiaries.
        </p>
        <p className="font-semibold text-foreground">
          Grand Theft Auto, GTA, and Leonida are trademarks of Take-Two Interactive Software, Inc.
        </p>
      </Section>

      <Section title="Community & Map Attribution">
        <p>The Leonida map data and location information used on this site draws from the
          incredible work of the GTA 6 fan community:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <a href="https://map.stateofleonida.net" target="_blank" rel="noopener noreferrer"
              className="text-primary hover:text-primary-hover">
              stateofleonida.net
            </a>{" "}
            — Interactive GTA 6 map
          </li>
          <li>
            <a href="https://map.gtadb.org" target="_blank" rel="noopener noreferrer"
              className="text-primary hover:text-primary-hover">
              gtadb.org
            </a>{" "}
            — GTA database and map explorer
          </li>
        </ul>
        <p>We are grateful to these communities for their open research and documentation.</p>
      </Section>

      <Section title="Contact">
        <p>
          For questions, DMCA takedown requests, or concerns, please visit our{" "}
          <a href="/dmca" className="text-primary hover:text-primary-hover">DMCA page</a> or use
          the report feature on any post.
        </p>
      </Section>

      <p className="text-[11px] text-foreground-muted border-t border-foreground/5 pt-6">
        Leonida Social is a non-commercial parody fan site. All GTA-related trademarks belong to
        their respective owners. &copy; {new Date().getFullYear()} Leonida Social.
      </p>
    </div>
  );
}
