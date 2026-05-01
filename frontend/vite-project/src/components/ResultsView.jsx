export default function ResultsView({ results, criteria, onReset }) {
  const { consistency, criteria_weights, results: alts, best_alternative } = results;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <h2 className="sec-title">Résultats de l'analyse</h2>
      <p className="sec-sub" style={{ marginBottom:22 }}>
        Processus de Hiérarchie Analytique — Résultats complets
      </p>

      {/* Consistency block */}
      <div className={`cons-block ${consistency.is_consistent ? "cons-ok" : "cons-fail"}`}>
        <p className="cons-title">
          {consistency.is_consistent ? "✓ Matrice cohérente" : "✗ Matrice incohérente"}
        </p>
        <div className="cons-metrics">
          <span className="metric-chip">λmax = {consistency.lambda_max}</span>
          <span className="metric-chip">CI = {consistency.ci}</span>
          <span className="metric-chip">RI = {consistency.ri}</span>
          <span className={`metric-chip ${consistency.is_consistent ? "hi" : "hi-fail"}`}>
            CR = {consistency.cr} {consistency.is_consistent ? "≤ 0.10 ✓" : "> 0.10 ✗"}
          </span>
        </div>
        {!consistency.is_consistent && (
          <p className="cons-reason">{consistency.reason}</p>
        )}
      </div>

      {/* Criteria weights */}
      {criteria_weights && (
        <div style={{ marginBottom:26 }}>
          <h3 style={{ fontSize:15, fontWeight:500, marginBottom:14, color:"var(--text-1)" }}>
            Poids des critères
          </h3>
          {Object.entries(criteria_weights)
            .sort(([,a],[,b]) => b - a)
            .map(([name, w]) => (
              <div className="weight-row" key={name}>
                <div className="weight-header">
                  <span style={{ fontSize:13, color:"var(--text-2)" }}>{name}</span>
                  <span className="weight-pct">{(w * 100).toFixed(1)} %</span>
                </div>
                <div className="track">
                  <div className="fill" style={{ width:`${w * 100}%` }} />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Best recommendation */}
      {best_alternative && (
        <div className="reco-box">
          Recommandation : <strong>{best_alternative}</strong> est la meilleure alternative selon vos critères et préférences.
        </div>
      )}

      {/* Rankings */}
      {alts && (
        <div style={{ marginBottom:22 }}>
          <h3 style={{ fontSize:15, fontWeight:500, marginBottom:14, color:"var(--text-1)" }}>
            Classement des alternatives
          </h3>
          {alts.map(alt => (
            <div key={alt.name} className={`res-card ${alt.rank === 1 ? "rank-1" : "rank-other"}`}>
              <div className="rank-orb">
                {medals[alt.rank - 1] || `#${alt.rank}`}
              </div>
              <span className="alt-name">{alt.name}</span>
              <span className="alt-score">Score : {(alt.score * 100).toFixed(2)} %</span>
            </div>
          ))}
        </div>
      )}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onReset}>↺ Nouvelle analyse</button>
      </div>
    </div>
  );
}
