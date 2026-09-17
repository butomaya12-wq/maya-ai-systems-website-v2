"use client";

const steps = [
  {
    n: "01",
    kicker: "FIELD INPUT",
    title: "Замер становится структурированными данными",
    body: "Полевой ввод не заканчивается формой. Размеры, зоны, позиции и обязательные комментарии переходят в единый расчётный контур.",
    visual: "capture",
    badges: ["MEASURER", "ZONES", "INPUT RULES"],
  },
  {
    n: "02",
    kicker: "BUSINESS LOGIC",
    title: "Данные проходят через правила и расчёты",
    body: "Система считает площади, материалы и стоимость по заданной логике, сохраняя структуру объекта и основания для дальнейшей проверки.",
    visual: "logic",
    badges: ["CALCULATION", "CATALOG", "RULES"],
  },
  {
    n: "03",
    kicker: "HUMAN REVIEW",
    title: "Менеджер проверяет и утверждает версию",
    body: "Человек остаётся в контуре принятия решения: проверяет данные, вносит корректировки и фиксирует утверждённую версию перед передачей дальше.",
    visual: "review",
    badges: ["MANAGER", "REVIEW", "APPROVAL"],
  },
  {
    n: "04",
    kicker: "EXECUTION OUTPUT",
    title: "Одна утверждённая версия превращается в документы для работы",
    body: "После approval система формирует role-specific документы и передаёт результат в следующий операционный шаг без повторного ручного пересбора данных.",
    visual: "output",
    badges: ["PDF", "LOCKED VERSION", "HANDOFF"],
  },
] as const;

function StoryVisual({ kind }: { kind: (typeof steps)[number]["visual"] }) {
  if (kind === "capture") {
    return (
      <div className="case-story-visual capture" aria-hidden="true">
        <div className="case-phone"><i/><i/><i/><i/></div>
        <span className="case-scan case-scan-a" />
        <span className="case-scan case-scan-b" />
        <span className="case-scan case-scan-c" />
        <span className="case-pulse" />
      </div>
    );
  }
  if (kind === "logic") {
    return (
      <div className="case-story-visual logic" aria-hidden="true">
        <span className="logic-node logic-node-a">m²</span>
        <span className="logic-node logic-node-b">qty</span>
        <span className="logic-node logic-node-c">₽</span>
        <span className="logic-core">RULES</span>
        <i className="logic-line logic-line-a" />
        <i className="logic-line logic-line-b" />
        <i className="logic-line logic-line-c" />
      </div>
    );
  }
  if (kind === "review") {
    return (
      <div className="case-story-visual review" aria-hidden="true">
        <div className="review-sheet"><i/><i/><i/><i/></div>
        <span className="review-chip">MANAGER</span>
        <span className="review-ring" />
        <span className="review-approve">✓</span>
      </div>
    );
  }
  return (
    <div className="case-story-visual output" aria-hidden="true">
      <span className="output-doc output-doc-a">CLIENT</span>
      <span className="output-doc output-doc-b">INSTALLER</span>
      <span className="output-doc output-doc-c">MANAGER</span>
      <i className="output-beam" />
      <span className="output-core">APPROVED</span>
    </div>
  );
}

export function CommercialCaseStory() {
  return (
    <div className="case-story" aria-label="Commercial system process">
      <div className="case-story-spine" aria-hidden="true"><span /></div>
      {steps.map((step, index) => (
        <article className="case-story-step" key={step.n}>
          <div className="case-story-copy">
            <div className="case-story-meta"><span>{step.n}</span><p>{step.kicker}</p></div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <div className="case-story-badges">{step.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
          </div>
          <StoryVisual kind={step.visual} />
          <div className="case-story-node" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></div>
        </article>
      ))}
    </div>
  );
}
