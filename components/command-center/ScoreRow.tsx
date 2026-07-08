export function ScoreRow({ label, value, description }: { label: string; value: number; description?: string }) {
  return (
    <div className="cc-score-row" title={description}>
      <span className="cc-score-label">{label}</span>
      <div className="cc-score-track">
        <div className="cc-score-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="cc-score-val">{value.toFixed(0)}</span>
    </div>
  );
}
