import Link from "next/link";
import { HeroSystemScene } from "@/components/hero/HeroSystemScene";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectVisual, SystemClassVisual, WorkflowStageVisual } from "@/components/visual/VisualBlocks";
import { siteContent } from "@/data/site-content";

const projectLinks = [
  "https://github.com/butomaya12-wq/fieldops-ai--release-1",
  "https://github.com/butomaya12-wq/ai-investment-council",
] as const;

export function HomeView() {
  return (
    <main>
      <header className="site-header">
        <Link className="brand" href="#top">MAYA <span>AI SYSTEMS ENGINEER</span></Link>
        <nav aria-label="Primary navigation">
          {siteContent.nav.map((item) => <Link key={item} href={`#${item.toLowerCase()}`}>{item}</Link>)}
        </nav>
        <Link className="ghost-button" href="#contact">LET’S TALK</Link>
      </header>

      <HeroSystemScene />

      <section id="work" className="case case-cinematic section-shell">
        <Reveal>
          <p className="section-index">02 · REAL SYSTEM / REAL WORK</p>
          <div className="case-head">
            <div>
              <p className="pill">{siteContent.commercialCase.label}</p>
              <h2>{siteContent.commercialCase.title}</h2>
              <p>{siteContent.commercialCase.body}</p>
            </div>
            <aside>{siteContent.commercialCase.note}</aside>
          </div>
        </Reveal>

        <div className="workflow-track" aria-hidden="true"><span /></div>
        <div className="stage-grid stage-grid-cinematic">
          {siteContent.commercialCase.stages.map(([n, title, text], index) => (
            <Reveal key={n} delay={index * 45}>
              <article className="workflow-card">
                <div className="workflow-number">{n}</div>
                <WorkflowStageVisual index={index} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="case-proof-bar">
          <span>FIELD CAPTURE</span><i />
          <span>CALCULATION</span><i />
          <span>REVIEW</span><i />
          <span>APPROVAL</span><i />
          <span>DOCUMENTS</span><i />
          <span>EXECUTION</span>
        </Reveal>
      </section>

      <section id="approach" className="systems systems-cinematic section-shell">
        <Reveal className="section-heading-row">
          <div>
            <p className="section-index">03 · SYSTEMS I BUILD</p>
            <h2>Три класса систем. Один подход.</h2>
          </div>
          <p className="section-side-note">Разные задачи. Общая логика — реальный результат, который можно проверить, использовать и развивать.</p>
        </Reveal>

        <div className="card-grid system-class-grid">
          {siteContent.systemClasses.map((item, index) => (
            <Reveal key={item.title} delay={index * 70}>
              <article className="glass-card system-class-card">
                <SystemClassVisual index={index} />
                <div className="system-class-copy">
                  <p className="card-index">0{index + 1}</p>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <ul>{item.items.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="selected selected-cinematic section-shell">
        <Reveal className="selected-heading">
          <p className="section-index">04 · SELECTED SYSTEMS</p>
          <h2>Другие системы</h2>
        </Reveal>
        <div className="selected-grid project-grid">
          {siteContent.selectedSystems.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <article className="glass-card project-card">
                <ProjectVisual kind={index === 0 ? "fieldops" : "market-jury"} />
                <div className="project-card-copy">
                  <p className="meta">{item.meta}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link className="project-link" href={projectLinks[index]} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="thinking thinking-cinematic section-shell">
        <Reveal className="thinking-copy">
          <p className="section-index">05 · HOW I THINK</p>
          <h2>Сначала процесс. Потом автоматизация.</h2>
          <p>AI не исправляет неясную бизнес-логику. Сначала — роли, данные, состояния, правила и точки принятия решения. Затем — автоматизация и AI там, где они действительно нужны.</p>
        </Reveal>
        <Reveal className="thinking-diagram" delay={110}>
          <div className="decision-path" aria-hidden="true">
            <span className="decision-node">EVENT</span>
            <i />
            <span className="decision-node">STATE</span>
            <i />
            <span className="decision-node">RULE</span>
            <i />
            <span className="decision-node decision-node-accent">AI?</span>
            <i />
            <span className="decision-node">EVIDENCE</span>
          </div>
          <p>AI появляется только там, где deterministic logic уже недостаточно.</p>
        </Reveal>
      </section>

      <section className="principles principles-cinematic section-shell">
        <Reveal>
          <p className="section-index">06 · PRINCIPLES</p>
          <div className="principle-row">
            {siteContent.principles.map((p, index) => (
              <span key={p}><i className={`principle-mark principle-mark-${index + 1}`} aria-hidden="true" />{p}</span>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="notes" className="notes notes-cinematic section-shell">
        <Reveal className="compact-editorial">
          <p className="section-index">07 · NOTES</p>
          <h2>Engineering notes coming next.</h2>
          <div className="editorial-line"><span>PROCESS DESIGN</span><span>HUMAN-IN-THE-LOOP</span><span>FIELD-TO-EXECUTION</span></div>
        </Reveal>
      </section>

      <section id="about" className="about about-cinematic section-shell">
        <Reveal className="compact-editorial about-grid">
          <p className="section-index">08 · ABOUT</p>
          <h2>I build systems that should still make sense after the demo.</h2>
          <p className="about-note">Applied AI · Operational workflows · Agentic systems · Integrations · Evidence-driven engineering</p>
        </Reveal>
      </section>

      <section id="contact" className="contact contact-cinematic section-shell">
        <Reveal>
          <p className="section-index">09 · CONTACT</p>
          <h2>Есть сложный процесс, который должен стать системой?</h2>
          <p className="contact-note">Selected project / subcontract / technical collaboration</p>
          <Link className="solid-button" href="https://t.me/systemsmaya">Написать в Telegram <span aria-hidden="true">→</span></Link>
        </Reveal>
      </section>
    </main>
  );
}
