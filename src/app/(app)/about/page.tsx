import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "About GTA Social | GTA 6 Fan Community & Roleplay Platform",
  },
  description: "Learn about GTA Social, the unofficial GTA 6 fan community. Roleplay as Leonida locals, explore Vice City, and connect with players across Florida and beyond.",
  alternates: { canonical: "https://gta-social.com/about" },
};

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      <div className="text-sm text-foreground-muted leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-foreground mb-3">About GTA Social</h1>
      <p className="text-foreground-muted mb-12 text-base">An immersive fan community bridging GTA 6 and reality</p>

      <Section title="Why GTA Social?" id="why">
        <p>
          GTA is a franchise built on immersion and never hesitates to draw from reality. As tech advances, that immersion has only deepened; the relationship between the game and its players has become closer and more personal. I studied in Los Angeles, and my roommate was a GTA V guru; coming to college was his first time ever living in LA. Not surprisingly, it never really felt like his first time there. He knows Santa Monica like the back of his hand (kinda), and he notices all these little landmarks and attractions that most people in LA would never think twice about. He belongs to LA because he spent his teenage years in the sodium yellow lights of Los Santos, in the cracked streets of Strawberry, always trying to fight his way up towards Maze Bank Tower—even though he is physically standing on some wide plain, thousands of miles away. While, ironically, I never played any Rockstar games because the new ones are always launched on consoles, I had the same relationship with Florence, Boston, Akihabara, and more. (I trust you can figure out what each means.)
        </p>
        <p>
          But times have changed. NVIDIA is no longer just a gaming company, and it is a cliché to say a game is hyperrealistic. AI is so real that people are subscribing to AI OnlyFans. So even before the game launches, it is safe to say that GTA VI will feel close, maybe too close, to reality. And all this closeness creates intimacy, and this raises questions: What if someone from Florida wants to reflect on their life in Leonida? What if a player wants to bring the characters into Florida streets? What if people want to use this overlap to share their own lives in Florida? Traditional forums cannot really satisfy those urges, at least not directly. That's why I created GTA Social: a fan website that mirrors how social media works today, so people can have a more interactive yet immersive relationship with everything in the game, in real life, and anything in between.
        </p>
      </Section>

      <Section title="FAQs" id="faqs">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">What is GTA Social?</h3>
            <p>GTA Social is an unofficial fan community inspired by Grand Theft Auto VI. Users roleplay as NPC residents of Leonida, share screenshots, fan art, and in-universe stories.</p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">What should I post here?</h3>
            <p>This website is about anything related to in-game Leonida, real-life Florida, and anything in between. Whether you want to share gaming tips, share your own story in Florida, or roleplay a character in Leonida (or Florida), they are all welcome.</p>
            <p>But this site does not condone content that promotes, glorifies, threatens, or celebrates real-world violence, hate speech, or harm against real people. No seriously. Real life is already violent enough. Do not use this site to add to that and hurt people.</p>
            <p>As of now, no NSFW or commercial content is allowed yet this may change after further development. Meanwhile, AI artwork is welcome and does not need to be labeled as AI for now.</p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">Is this an official Rockstar website?</h3>
            <p>No. This site is a parody / fan project created by fans, for fans. It is not affiliated with, endorsed by, or sponsored by Rockstar Games, Take-Two Interactive, or any of their subsidiaries.</p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">What is a post-type, and what do R/R, R/G, G/R, G/G mean?</h3>
            <p>A post type shows the relationship between the poster and the setting.</p>
            <p>The first letter tells you whether the poster is real-world or in-game. The second letter tells you whether the post takes place in the real world or in-game.</p>
            <p>For the first letter, in-game means the persona exists inside the GTA universe and does not treat GTA VI as a game. For the second letter, in-game or real-world simply refers to where the post is set.</p>
            <p className="font-semibold text-foreground mt-2">Examples:</p>
            <ul className="list-disc ml-5 space-y-2 mt-2">
              <li><strong>G/G:</strong> An in-game character posting in the in-game world. Ada, a Leonida resident, brags about the yacht her dad bought her. Jason Duval posts about worrying over whether the next heist will go wrong. A user shares a "Leonida man" headline.</li>
              <li><strong>G/R:</strong> An in-game character posting in the real world. Lucia Caminos comments on real-life news. Ada, a Leonida resident, is teleported to Florida and discovers she is poor in this alternate universe.</li>
              <li><strong>R/G:</strong> A real-world person posting in the in-game world. A gamer showcases their GTA 6 Online character. Someone writes a mission guide. A Florida gamer is somehow teleported to Leonida and documents the journey.</li>
              <li><strong>R/R:</strong> A real-world person posting in the real world. Fun facts about Florida. A user shares a "Florida man" headline. A fan compares Vice City locations to places they visited in real life.</li>
              <li><strong>Non-canon:</strong> Catch all for anything else. Memes, shitposts, crossover jokes, dream sequences, "what if" scenarios, out-of-character announcements, and site meta posts.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Community & Map Attribution" id="attribution">
        <p>The Leonida map data and location information on this site are built on the work of the wider GTA VI mapping community. This project draws from the research, discoveries, and shared resources created by fans who have spent countless hours documenting the world of the game. Their effort, generosity, and attention to detail made this possible, and this site is deeply indebted to that work.</p>

        <p className="font-semibold text-foreground mt-4">Primary sources and references:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li><a href="https://map.gtadb.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">GTADB Map</a></li>
          <li><a href="https://github.com/rolux/gtadb.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">GTADB Repository</a></li>
          <li><a href="https://discord.com/channels/1021410853901320323/1255150425230016552" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">Mapping Community Thread</a></li>
          <li><a href="https://vimap.saamexe.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">Saam.exe / VIMap</a></li>
        </ul>

        <p className="font-semibold text-foreground mt-4">Special acknowledgment to rlx for GTADB and the Landmarks Marker Database, to Saam.exe for VIMap, and to the many contributors whose work helped shape the mapping community's shared knowledge.</p>

        <details className="mt-4 cursor-pointer">
          <summary className="font-semibold text-foreground hover:text-primary">View all contributors</summary>
          <p className="text-xs text-foreground-muted mt-2 leading-relaxed">rlx, Saam.exe, YANIS, RickRick, DuPz0r, TreeFitty, Fido_le_muet, avatarsd, Koeklin, ChurchOfGTA, Mehaniq, DX, Nikhil, DerekLeet, Rafamendes, Raptexalicious, Musa98, DazRave, ThisGoesToEleven, Vicey, GhettoJesus, Bubba, Squnard, Cr0ssm, DarkDayz, Michal, ScaledAnd1cy, g*, aaazito, ClawMaster, FrenchAug, gunz, Waffles Syrup, Sunmoth, Jaxrud, Mati, Mattineu, Ser_Salty, C4K3, JStarr31, Stinger, Darth Sk8d3r, Aupx, Pixelclone, IAmAtYourWindows, BlackScout, Saerkal, The Dude, The_Mek, Edge333, Dridex, finger, AsD, Antoñio, kloadit, TussTaster(Kyo), GTA-Fan_made Radio, FranciscoM, Long Long Time, sirstirfry, bloo, TurboLight, Mesa, golden, babydracula, pariah87, higgs, M E D I, XL Jawn, flyingmonkey97, TakeNoShift, Revent66, SkymnäsWolf, Z Ξ T Λ, lu, JupoL, Ascendency, Perseus, ChrisTheRealOne, snsjackz, NeinKnight, rainy, Glenn "SlamTilt" Pegden, Holt, lezzylree, Laze, JAXXN, Squire, CoolGingerGinger, SatanGOLD!, Juzilex, pilgrim, goldygoldy, MrDrFlamingo, LittleJoeyD, Ganton Studios, Prestigefi, blodi, SpeedyAero, bmxm, Takeshino, CP, Aeviternum, grated_lemon, ZombieElvis, el pepe, LucidNotAwake, yeri_161, BolbiiS, The Ardashir, ClayishWall, Nnrrzz, Jehu, jfavignano, h_fx57, Saukko505, Frosty, magnoliy, Tops, Pilgrim, Random, Danix, E.W., Not I Not, Skena, Fwankster, sylhes, violet, Jac, iSrirachaa, DeathDarf, Dondactor, MysticFoxYT, edg333, ShadowSorcery, Mesh, Oriond34, mysticcc, astonishedscout, chrome, Synthesis, Merlie :3, ! Echo, Chatterer, Cola, baregen, MeldoniY, Balibompa, Tachyon, Angelito, hotel tap water, SpaceVolcano, Kamra, JKD, Kiwieh, Eleanor Demona, blaue, Scooter&Half12, Cygnus, RoblifeBetter, ian_, Kindlyspace, richalligator, gorbux, Carfreak200, Stefan10, martipk, Giovanni_Tirado_48, Yeri_161, TheMcDudeCM, Topecahigh, imvibin, EducatedHotshot, Bombardilo Crocodilo, vextox, idleuser, TheOneAndOnlyHeisenbob, hypsal, Frosty1936, V (Hunter-is-Great), the_JR, bobsageit, SirFrolo, Ram, ManOfLaGanja, insidediamond, allie_lacey, HerrFalcon, Dauby, Zonimu, Hartelijke.</p>
        </details>
      </Section>

      <Section title="Contact" id="contact">
        <p>For questions, DMCA takedown requests, or concerns, please visit our <a href="/dmca" className="text-primary hover:text-primary-hover">DMCA page</a> or use the report feature on any post.</p>
      </Section>

      <p className="text-xs text-foreground-muted border-t border-foreground/5 pt-6 mt-12">
        GTA Social is a parody fan site. Grand Theft Auto, GTA, and Leonida are trademarks of Take-Two Interactive Software, Inc. All GTA-related trademarks belong to their respective owners. &copy; {new Date().getFullYear()} GTA Social.
      </p>
    </div>
  );
}
