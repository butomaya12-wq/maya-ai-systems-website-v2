import { Reveal } from "@/components/motion/Reveal";
import { siteContent } from "@/data/site-content";

const processSteps = [
  ["01", "СОБЫТИЕ", "Что произошло и что запускает процесс"],
  ["02", "СОСТОЯНИЕ", "В каком состоянии находится объект сейчас"],
  ["03", "ПРАВИЛО", "Что система может решить детерминированно"],
  ["04", "AI?", "Где правил уже недостаточно и нужен AI"],
  ["05", "ПРОВЕРКА", "Где результат должен пройти контроль"],
  ["06", "РЕЗУЛЬТАТ", "Что остаётся проверяемым итогом"],
] as const;

export function ProcessPrinciples() {
  return (
    <>
      <section className="process-film section-shell" aria-labelledby="process-title">
        <Reveal className="process-film-head">
          <p className="section-index">05 · КАК Я ПРОЕКТИРУЮ</p>
          <div className="process-film-title-row">
            <h2 id="process-title">Сначала процесс.</h2>
            <h2 className="process-film-title-muted">Потом автоматизация.</h2>
          </div>
          <p className="process-film-intro">
            AI не исправляет неясную бизнес-логику. Сначала — роли, данные, состояния, правила и точки принятия решения.
            Затем — автоматизация и AI только там, где они действительно нужны.
          </p>
        </Reveal>

        <Reveal className="process-rail-wrap" delay={90}>
          <div className="process-rail" aria-label="Логика проектирования системы">
            <div className="process-rail-line" aria-hidden="true"><span /></div>
            {processSteps.map(([n, title, body], index) => (
              <article className={`process-node-card ${title === "AI?" ? "process-node-card-accent" : ""}`} key={title}>
                <div className="process-node-orbit" aria-hidden="true" />
                <div className="process-node-index">{n}</div>
                <div className="process-node-core"><span>{title}</span></div>
                <p>{body}</p>
                {index < processSteps.length - 1 && <i className="process-node-arrow" aria-hidden="true">→</i>}
              </article>
            ))}
          </div>
          <div className="process-film-rule">
            <span className="process-rule-dot" aria-hidden="true" />
            <p><strong>AI появляется только там, где детерминированной логики уже недостаточно.</strong> Всё остальное должно оставаться явным, проверяемым и управляемым.</p>
          </div>
        </Reveal>
      </section>

      <section className="principles-film section-shell" aria-labelledby="principles-title">
        <Reveal className="principles-film-head">
          <p className="section-index">06 · ПРИНЦИПЫ</p>
          <div className="principles-film-title-row">
            <h2 id="principles-title">Шесть правил.</h2>
            <p>Не лозунги, а ограничения, по которым я проектирую и проверяю системы.</p>
          </div>
        </Reveal>

        <div className="principles-film-grid">
          {siteContent.principles.map((principle, index) => (
            <Reveal key={principle} delay={index * 55}>
              <article className="principle-film-card">
                <span className="principle-film-ring" aria-hidden="true" />
                <div className="principle-film-top">
                  <span>0{index + 1}</span>
                  <i aria-hidden="true" />
                </div>
                <h3>{principle}</h3>
                <div className="principle-film-footer">
                  <span>{index < 3 ? "ЛОГИКА СИСТЕМЫ" : "ЛОГИКА ПЕРЕДАЧИ"}</span>
                  <span aria-hidden="true">↗</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
