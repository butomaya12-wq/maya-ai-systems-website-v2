import Link from "next/link";
import { siteContent } from "@/data/site-content";

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

      <section id="top" className="hero section-shell">
        <div className="hero-copy">
          <p className="section-index">01 · FROM COMPLEXITY TO CLARITY</p>
          <h1>{siteContent.hero.title}</h1>
          <p className="hero-body">{siteContent.hero.body}</p>
          <div className="actions">
            <Link className="solid-button" href="#work">{siteContent.hero.primaryCta}</Link>
            <Link className="ghost-button" href="#contact">{siteContent.hero.secondaryCta}</Link>
          </div>
        </div>
        <div className="system-orbit" aria-label="System inputs and outputs">
          <div className="core">SYSTEM</div>
          {siteContent.hero.modules.map((module, index) => (
            <span key={module} className={`module module-${index + 1}`}>{module}</span>
          ))}
        </div>
        <div className="proof-strip">
          {siteContent.hero.proof.map((item) => <span key={item}>● {item}</span>)}
        </div>
      </section>

      <section id="work" className="case section-shell">
        <p className="section-index">02 · REAL SYSTEM / REAL WORK</p>
        <div className="case-head">
          <div>
            <p className="pill">{siteContent.commercialCase.label}</p>
            <h2>{siteContent.commercialCase.title}</h2>
            <p>{siteContent.commercialCase.body}</p>
          </div>
          <aside>{siteContent.commercialCase.note}</aside>
        </div>
        <div className="stage-grid">
          {siteContent.commercialCase.stages.map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="approach" className="systems section-shell">
        <p className="section-index">03 · SYSTEMS I BUILD</p>
        <h2>Три класса систем. Один подход.</h2>
        <div className="card-grid">
          {siteContent.systemClasses.map((item) => (
            <article className="glass-card" key={item.title}>
              <h3>{item.title}</h3><p>{item.body}</p>
              <ul>{item.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="selected section-shell">
        <p className="section-index">04 · SELECTED SYSTEMS</p>
        <div className="selected-grid">
          {siteContent.selectedSystems.map((item) => (
            <article className="glass-card" key={item.title}>
              <p className="meta">{item.meta}</p><h3>{item.title}</h3><p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="thinking section-shell">
        <p className="section-index">05 · HOW I THINK</p>
        <h2>Сначала процесс. Потом автоматизация.</h2>
        <p>AI не исправляет неясную бизнес-логику. Сначала — роли, данные, состояния, правила и точки принятия решения. Затем — автоматизация и AI там, где они действительно нужны.</p>
      </section>

      <section className="principles section-shell">
        <p className="section-index">06 · PRINCIPLES</p>
        <div className="principle-row">{siteContent.principles.map((p) => <span key={p}>{p}</span>)}</div>
      </section>

      <section id="notes" className="notes section-shell">
        <p className="section-index">07 · NOTES</p>
        <h2>Engineering notes coming next.</h2>
      </section>

      <section id="about" className="about section-shell">
        <p className="section-index">08 · ABOUT</p>
        <h2>I build systems that should still make sense after the demo.</h2>
      </section>

      <section id="contact" className="contact section-shell">
        <p className="section-index">09 · CONTACT</p>
        <h2>Есть сложный процесс, который должен стать системой?</h2>
        <Link className="solid-button" href="https://t.me/systemsmaya">Написать в Telegram</Link>
      </section>
    </main>
  );
}
