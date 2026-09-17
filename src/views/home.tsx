import Link from "next/link";
import { HeroSystemScene } from "@/components/hero/HeroSystemScene";
import { HeroCaseBridge } from "@/components/hero/HeroCaseBridge";
import { CommercialCaseStory } from "@/components/case/CommercialCaseStory";
import { ProcessPrinciples } from "@/components/process/ProcessPrinciples";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectVisual, SystemClassVisual } from "@/components/visual/VisualBlocks";
import { siteContent } from "@/data/site-content";

const projectLinks = [
  "https://github.com/butomaya12-wq/fieldops-ai--release-1",
  "https://github.com/butomaya12-wq/ai-investment-council",
] as const;

export function HomeView() {
  return (
    <main className="maya-v3">
      <header className="site-header">
        <Link className="brand" href="#top">MAYA <span>РАЗРАБОТЧИК КАСТОМНЫХ СИСТЕМ</span></Link>
        <nav aria-label="Основная навигация">
          {siteContent.nav.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}
        </nav>
        <Link className="ghost-button" href="#contact">ОБСУДИТЬ ЗАДАЧУ</Link>
      </header>

      <HeroSystemScene />
      <HeroCaseBridge />

      <section id="work" className="case case-cinematic section-shell">
        <Reveal>
          <p className="section-index">02 · РЕАЛЬНАЯ СИСТЕМА / РЕАЛЬНАЯ РАБОТА</p>
          <div className="case-head">
            <div>
              <div className="case-label-row"><p className="pill">{siteContent.commercialCase.label}</p><span>ОПЛАЧЕННАЯ B2B-РАЗРАБОТКА</span></div>
              <h2>{siteContent.commercialCase.title}</h2>
              <p>{siteContent.commercialCase.body}</p>
            </div>
            <aside>{siteContent.commercialCase.note}</aside>
          </div>
        </Reveal>

        <CommercialCaseStory />

        <Reveal className="case-proof-bar">
          <span>Полевой процесс</span><i />
          <span>Расчётный контур</span><i />
          <span>Проверка менеджером</span><i />
          <span>Зафиксированная версия</span><i />
          <span>Документы по ролям</span><i />
          <span>АДМИН / ЗАМЕРЩИК / МЕНЕДЖЕР</span>
        </Reveal>
      </section>

      <section id="approach" className="systems systems-cinematic section-shell">
        <Reveal className="section-heading-row">
          <div>
            <p className="section-index">03 · КАКИЕ СИСТЕМЫ Я СОЗДАЮ</p>
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
          <p className="section-index">04 · ДРУГИЕ ПРОЕКТЫ</p>
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
                  <div className="project-status-row"><span>{index === 0 ? "ПУБЛИЧНАЯ РАЗРАБОТКА" : "ПРОТОТИП ДЛЯ ХАКАТОНА"}</span><Link className="project-link" href={projectLinks[index]} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></Link></div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <ProcessPrinciples />

      <section id="notes" className="notes notes-cinematic section-shell">
        <Reveal className="compact-editorial">
          <p className="section-index">07 · ЗАМЕТКИ</p>
          <h2>Последние статьи</h2>
          <div className="notes-preview-grid">
            <article><span>ПРОЕКТИРОВАНИЕ ПРОЦЕССОВ</span><h3>Почему автоматизация ломается ещё до n8n</h3><p>Разбор принципа: сначала процесс, потом инструмент.</p></article>
            <article><span>ЧЕЛОВЕК В КОНТУРЕ</span><h3>Когда AI не должен принимать решение</h3><p>Где система должна возвращать право решения человеку.</p></article>
            <article><span>РАБОЧАЯ ГИПОТЕЗА</span><h3>От поля к выполнению</h3><p>Как данные с объекта становятся расчётом, согласованием и передачей в работу.</p></article>
          </div>
        </Reveal>
      </section>

      <section id="about" className="about about-cinematic section-shell">
        <Reveal className="compact-editorial about-grid">
          <p className="section-index">08 · ОБО МНЕ</p>
          <h2>Я создаю системы, которые остаются понятными и после демонстрации.</h2>
          <p className="about-note">Проектирую прикладные AI- и automation-системы вокруг реальных бизнес-процессов: роли, данные, состояния, правила, интеграции, проверка и передача в работу. За сайтом стоят оплаченный B2B-проект и публичные инженерные разработки — без придуманных ROI и неподтверждённых заявлений.</p>
        </Reveal>
      </section>

      <section id="contact" className="contact contact-cinematic section-shell">
        <Reveal>
          <p className="section-index">09 · КОНТАКТЫ</p>
          <h2>Есть сложный процесс, который должен стать системой?</h2>
          <p className="contact-note">Короткий разбор задачи → понимание процесса → решение, имеет ли смысл автоматизация.</p>
          <Link className="solid-button" href="https://t.me/systemsmaya">Написать в Telegram <span aria-hidden="true">→</span></Link>
          <span className="contact-mode">Проекты · субподряд · техническое сотрудничество</span>
        </Reveal>
      </section>
    </main>
  );
}
