import { useState } from "react";

const SAATY = [1/9, 1/7, 1/5, 1/3, 1, 3, 5, 7, 9];

function label(v, a, b) {
  if (Math.abs(v - 1) < 0.001) return "Égaux";
  if (v < 1) return `${b} préféré (${(1/v).toFixed(0)}×)`;
  return `${a} préféré (${v.toFixed(0)}×)`;
}

export default function PairwiseMatrix({ criteria, matrix, onSubmit, onBack, loading }) {
  const n = criteria.length;

  const [mat, setMat] = useState(() =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (i === j) return 1;
        if (i < j) return (matrix[i] && matrix[i][j]) || 1;
        return 0;
      })
    )
  );

  const setVal = (i, j, v) => {
    const u = mat.map(r => [...r]);
    u[i][j] = v;
    u[j][i] = 1 / v;
    setMat(u);
  };

  const pairs = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      pairs.push([i, j]);

  const full = mat.map((row, i) =>
    row.map((v, j) => {
      if (i === j) return 1;
      if (i < j) return mat[i][j] || 1;
      return 1 / (mat[j][i] || 1);
    })
  );

  return (
    <div>
      <h2 className="sec-title">Comparaison par paires</h2>
      <p className="sec-sub">
        Pour chaque paire, indiquez votre préférence selon l'échelle de Saaty.
        La réciprocité est appliquée automatiquement.
      </p>

      {pairs.map(([i, j]) => {
        const v = mat[i][j] || 1;
        return (
          <div className="pair-row" key={`${i}-${j}`}>
            <span className="pair-crit">{criteria[i].name}</span>
            <span className="pair-vs">vs</span>
            <span className="pair-crit">{criteria[j].name}</span>
            <select
              className="neu-sel"
              value={v}
              onChange={e => setVal(i, j, parseFloat(e.target.value))}
              style={{ flex:1, minWidth:200 }}
            >
              {SAATY.map(s => (
                <option key={s} value={s}>
                  {label(s, criteria[i].name, criteria[j].name)}
                </option>
              ))}
            </select>
            <span className="pair-val">{v.toFixed(3)}</span>
          </div>
        );
      })}

      <details>
        <summary>Voir la matrice complète ({n}×{n})</summary>
        <div className="mx-wrap">
          <table className="mx-table">
            <thead>
              <tr>
                <th></th>
                {criteria.map(c => <th key={c.name}>{c.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {full.map((row, i) => (
                <tr key={i}>
                  <th style={{ textAlign:"left", color:"var(--text-3)", fontWeight:400, fontSize:11, padding:"5px 9px" }}>
                    {criteria[i].name}
                  </th>
                  {row.map((v, j) => (
                    <td key={j} className={i === j ? "diag" : ""}>{v.toFixed(3)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>← Retour</button>
        <button
          className="btn btn-accent"
          onClick={() => onSubmit(full)}
          disabled={loading}
        >
          {loading ? "Calcul en cours…" : "Analyser ✦"}
        </button>
      </div>
    </div>
  );
}
