interface PhasePlaceholderProps {
  title: string;
  dek: string;
  phase: string;
  willShow: string[];
}

export function PhasePlaceholder({ title, dek, phase, willShow }: PhasePlaceholderProps) {
  return (
    <div>
      <h1 className="cc-page-title">{title}</h1>
      <p className="cc-page-dek">{dek}</p>
      <div className="cc-empty">
        <strong style={{ color: "var(--cc-text)" }}>Arrives in {phase}.</strong>
        <ul style={{ margin: "10px 0 0", paddingLeft: "1.2em" }}>
          {willShow.map((item) => (
            <li key={item} style={{ marginBottom: 4 }}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
