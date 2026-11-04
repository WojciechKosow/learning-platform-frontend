import { Faq } from "@/components/landing/Faq";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Modes } from "@/components/landing/Modes";
import { Pricing } from "@/components/landing/Pricing";
import {
  Audience,
  AuthorshipSection,
  Compare,
  FinalCta,
  Hero,
  IdeSection,
  Intro,
  MentorSection,
  Projects,
  RoadmapSection,
  SiteFooter,
} from "@/components/landing/Sections";
import { SiteNav } from "@/components/landing/SiteNav";

export default function Home() {
  return (
    <div className="site">
      <SiteNav />
      <main>
        <Hero />
        <Intro />
        <section className="section" id="how">
          <div className="wrap">
            <div className="section-head">
              <h2>How it works</h2>
              <p>Four steps, then the loop repeats with harder projects until you build on your own.</p>
            </div>
            <HowItWorks />
          </div>
        </section>
        <IdeSection />
        <MentorSection />
        <Modes />
        <AuthorshipSection />
        <RoadmapSection />
        <Compare />
        <Audience />
        <Projects />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
