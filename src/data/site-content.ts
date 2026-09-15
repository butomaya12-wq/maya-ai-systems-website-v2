export const siteContent = {
  nav: ["Work", "Approach", "About", "Contact"],
  hero: {
    eyebrow: "MAYA · AI SYSTEMS ENGINEER",
    title: "AI SYSTEMS BETWEEN IDEA & RESULT",
    body: "I design and build applied AI systems that turn complex business processes into verifiable outcomes.",
    primaryCta: "View work",
    secondaryCta: "Let’s talk",
    modules: ["Voice", "Photo", "Sheet", "API", "Rule", "Message", "Approval"],
    proof: ["Paid B2B system", "35 verified capabilities", "Commercial V1 delivered", "Public engineering builds"],
  },
  commercialCase: {
    label: "COMMERCIAL SYSTEM",
    title: "Система управления объектом с выездным замером",
    body: "От полевого замера и расчёта до проверки менеджером, утверждённой версии, документов и передачи в выполнение работ.",
    note: "Это не просто форма замера. Это полноценный operational workflow с ролями, состояниями, расчётами и документами.",
    stages: [
      ["01", "Замер", "на объекте"],
      ["02", "Структурирование", "данных"],
      ["03", "Расчёт", "стоимости и материалов"],
      ["04", "Проверка", "менеджером"],
      ["05", "Утверждение", "и фиксация версии"],
      ["06", "Документы", "для разных участников"],
      ["07", "Передача", "в выполнение работ"],
    ],
  },
  systemClasses: [
    {
      title: "Operational Systems",
      body: "Системы вокруг реального рабочего процесса",
      items: ["Workflow", "State", "Roles", "Business rules", "Documents"],
    },
    {
      title: "AI & Agentic Workflows",
      body: "AI там, где deterministic logic недостаточно",
      items: ["LLM / Agents", "Classification", "RAG", "Human-in-the-loop", "Validation"],
    },
    {
      title: "Integrations & Automation",
      body: "Связываю существующие инструменты в единый процесс",
      items: ["API", "CRM", "n8n", "Telegram", "Data"],
    },
  ],
  selectedSystems: [
    {
      title: "FieldOps AI",
      description: "From messy field evidence to structured, execution-ready work.",
      meta: "Public engineering proof",
    },
    {
      title: "Market Jury",
      description: "Adversarial AI decision architecture with separated analysis, approval, and execution authority.",
      meta: "Hackathon prototype",
    },
  ],
  principles: [
    "Evidence over confidence",
    "Deterministic where possible",
    "Human authority where consequential",
    "Explicit state",
    "Fail closed",
    "Build for handoff",
  ],
} as const;
