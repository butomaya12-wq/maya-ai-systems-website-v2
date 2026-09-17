"use client";

const steps = [
  {
    n: "01",
    kicker: "ПОЛЕВОЙ ВВОД",
    title: "Замер становится структурированными данными",
    body: "Полевой ввод не заканчивается формой. Размеры, зоны, позиции и обязательные комментарии переходят в единый расчётный контур.",
    visual: "capture",
    badges: ["ЗАМЕРЩИК", "ЗОНЫ", "ПРАВИЛА ВВОДА"],
    evidence: ["Размеры и зоны", "Обязательные комментарии", "Единая структура объекта"],
  },
  {
    n: "02",
    kicker: "БИЗНЕС-ЛОГИКА",
    title: "Данные проходят через правила и расчёты",
    body: "Система считает площади, материалы и стоимость по заданной логике, сохраняя структуру объекта и основания для дальнейшей проверки.",
    visual: "logic",
    badges: ["РАСЧЁТ", "КАТАЛОГ", "ПРАВИЛА"],
    evidence: ["Площади", "Материалы", "Стоимость и каталог"],
  },
  {
    n: "03",
    kicker: "ПРОВЕРКА ЧЕЛОВЕКОМ",
    title: "Менеджер проверяет и утверждает версию",
    body: "Человек остаётся в контуре принятия решения: проверяет данные, вносит корректировки и фиксирует утверждённую версию перед передачей дальше.",
    visual: "review",
    badges: ["МЕНЕДЖЕР", "ПРОВЕРКА", "УТВЕРЖДЕНИЕ"],
    evidence: ["Проверка менеджером", "Корректировки", "Зафиксированное утверждённое состояние"],
  },
  {
    n: "04",
    kicker: "РЕЗУЛЬТАТ ДЛЯ РАБОТЫ",
    title: "Утверждённая версия превращается в рабочие документы",
    body: "После утверждения система формирует документы для разных участников и передаёт результат в следующий операционный шаг без повторного ручного пересбора данных.",
    visual: "output",
    badges: ["PDF", "ЗАФИКСИРОВАННАЯ ВЕРСИЯ", "ПЕРЕДАЧА"],
    evidence: ["Клиентский документ", "Документ для монтажа", "Передача в выполнение"],
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
        <span className="logic-node logic-node-a">м²</span>
        <span className="logic-node logic-node-b">шт.</span>
        <span className="logic-node logic-node-c">₽</span>
        <span className="logic-core">ПРАВИЛА</span>
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
        <span className="review-chip">МЕНЕДЖЕР</span>
        <span className="review-ring" />
        <span className="review-approve">✓</span>
      </div>
    );
  }
  return (
    <div className="case-story-visual output" aria-hidden="true">
      <span className="output-doc output-doc-a">КЛИЕНТ</span>
      <span className="output-doc output-doc-b">МОНТАЖ</span>
      <i className="output-beam" />
      <span className="output-core">УТВЕРЖДЕНО</span>
    </div>
  );
}

export function CommercialCaseStory() {
  return (
    <div className="case-story" aria-label="Процесс коммерческой системы">
      <div className="case-story-summary" aria-label="Краткая схема системы">
        <span><b>ВВОД</b> замер и зоны</span>
        <i />
        <span><b>ЛОГИКА</b> расчёт и правила</span>
        <i />
        <span><b>КОНТРОЛЬ</b> утверждение менеджером</span>
        <i />
        <span><b>РЕЗУЛЬТАТ</b> документы и передача</span>
      </div>

      <div className="case-story-spine" aria-hidden="true"><span /></div>
      {steps.map((step, index) => (
        <article className="case-story-step" key={step.n}>
          <div className="case-story-copy">
            <div className="case-story-meta"><span>{step.n}</span><p>{step.kicker}</p></div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <div className="case-story-evidence">
              {step.evidence.map((item) => <span key={item}><i aria-hidden="true" />{item}</span>)}
            </div>
            <div className="case-story-badges">{step.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
          </div>
          <StoryVisual kind={step.visual} />
          <div className="case-story-node" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span></div>
        </article>
      ))}
    </div>
  );
}
