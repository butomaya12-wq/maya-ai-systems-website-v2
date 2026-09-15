type WorkflowStageVisualProps = {
  index: number;
};

type SystemClassVisualProps = {
  index: number;
};

type ProjectVisualProps = {
  kind: "fieldops" | "market-jury";
};

export function WorkflowStageVisual({ index }: WorkflowStageVisualProps) {
  if (index === 0) {
    return (
      <div className="stage-visual stage-visual-capture" aria-hidden="true">
        <span className="device device-main" />
        <span className="device device-side" />
        <span className="capture-line capture-line-a" />
        <span className="capture-line capture-line-b" />
        <span className="capture-dot" />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="stage-visual stage-visual-structure" aria-hidden="true">
        <span className="sheet sheet-a" />
        <span className="sheet sheet-b" />
        <span className="sheet sheet-c" />
        <span className="structure-node structure-node-a" />
        <span className="structure-node structure-node-b" />
        <span className="structure-node structure-node-c" />
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="stage-visual stage-visual-calc" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => <span key={i} className={`calc-cube calc-cube-${i + 1}`} />)}
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="stage-visual stage-visual-review" aria-hidden="true">
        <span className="review-panel review-panel-a" />
        <span className="review-panel review-panel-b" />
        <span className="review-panel review-panel-c" />
        <span className="review-avatar" />
        <span className="review-check review-check-a" />
        <span className="review-check review-check-b" />
      </div>
    );
  }

  if (index === 4) {
    return (
      <div className="stage-visual stage-visual-approval" aria-hidden="true">
        <span className="approval-doc" />
        <span className="approval-seal">✓</span>
        <span className="approval-lock" />
      </div>
    );
  }

  if (index === 5) {
    return (
      <div className="stage-visual stage-visual-docs" aria-hidden="true">
        <span className="doc-card doc-card-a" />
        <span className="doc-card doc-card-b" />
        <span className="doc-card doc-card-c" />
        <span className="doc-line doc-line-a" />
        <span className="doc-line doc-line-b" />
      </div>
    );
  }

  return (
    <div className="stage-visual stage-visual-handoff" aria-hidden="true">
      <span className="handoff-platform" />
      <span className="handoff-column handoff-column-a" />
      <span className="handoff-column handoff-column-b" />
      <span className="handoff-column handoff-column-c" />
      <span className="handoff-beam" />
      <span className="handoff-node" />
    </div>
  );
}

export function SystemClassVisual({ index }: SystemClassVisualProps) {
  if (index === 0) {
    return (
      <div className="class-visual class-visual-operational" aria-hidden="true">
        <span className="ops-cube ops-cube-a" />
        <span className="ops-cube ops-cube-b" />
        <span className="ops-cube ops-cube-c" />
        <span className="ops-cube ops-cube-d" />
        <span className="ops-line ops-line-a" />
        <span className="ops-line ops-line-b" />
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="class-visual class-visual-agentic" aria-hidden="true">
        <span className="agent-core" />
        <span className="agent-orbit agent-orbit-a" />
        <span className="agent-orbit agent-orbit-b" />
        <span className="agent-node agent-node-a" />
        <span className="agent-node agent-node-b" />
        <span className="agent-node agent-node-c" />
        <span className="agent-node agent-node-d" />
      </div>
    );
  }

  return (
    <div className="class-visual class-visual-integrations" aria-hidden="true">
      <span className="integration-core" />
      {Array.from({ length: 7 }, (_, i) => <span key={i} className={`integration-node integration-node-${i + 1}`} />)}
      <span className="integration-ring" />
    </div>
  );
}

export function ProjectVisual({ kind }: ProjectVisualProps) {
  if (kind === "fieldops") {
    return (
      <div className="project-visual project-visual-fieldops" aria-hidden="true">
        <span className="terrain terrain-a" />
        <span className="terrain terrain-b" />
        <span className="terrain terrain-c" />
        <span className="field-node field-node-a" />
        <span className="field-node field-node-b" />
        <span className="field-node field-node-c" />
        <span className="field-path field-path-a" />
        <span className="field-path field-path-b" />
      </div>
    );
  }

  return (
    <div className="project-visual project-visual-jury" aria-hidden="true">
      <span className="jury-core">J</span>
      <span className="jury-ring jury-ring-a" />
      <span className="jury-ring jury-ring-b" />
      <span className="jury-node jury-node-a">BULL</span>
      <span className="jury-node jury-node-b">BEAR</span>
      <span className="jury-node jury-node-c">RED</span>
      <span className="jury-node jury-node-d">JUDGE</span>
    </div>
  );
}
