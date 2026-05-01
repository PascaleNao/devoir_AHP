import { useState } from "react";

export default function AlternativeScores({ criteria, onNext, onBack }) {
  const blank = () => ({ name: "", scores: Object.fromEntries(criteria.map(c => [c.name, ""])) });

  const [alternatives, setAlternatives] = useState([blank(), blank()]);

  const addAlt = () => setAlternatives([...alternatives, blank()]);

  const updName = (i, v) => {
    const u = [...alternatives];
    u[i] = { ...u[i], name: v };
    setAlternatives(u);
  };

  const updScore = (i, cname, v) => {
    const u = alternatives.map((a, idx) =>
      idx === i ? { ...a, scores: { ...a.scores, [cname]: v } } : a
    );
    setAlternatives(u);
  };

  const remove = (i) => setAlternatives(alternatives.filter((_, j) => j !== i));

  const valid =
    alternatives.length >= 2 &&
    alternatives.every(a =>
      a.name.trim() !== "" && criteria.every(c => a.scores[c.name] !== "")
    );

  return (
    <div>
      <h2 className="sec-title">Définir les alternatives</h2>
      <p className="sec-sub">
        Ajoutez au moins 2 alternatives et renseignez leur valeur pour chaque critère...
      </p>

      {alternatives.map((alt, i) => (
        <div className="neu-card" key={i}>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
            {/* Orb number */}
            <div style={{
              width:36, height:36, borderRadius:"50%",
              background: "linear-gradient(145deg, #bdd5e8, #6fa0c0)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontWeight:500, fontSize:14, flexShrink:0,
              boxShadow:"3px 3px 8px rgba(111,160,192,0.45), -2px -2px 5px #fff"
            }}>
              {i + 1}
            </div>
            <input
              className="neu-inp"
              placeholder={`Alternative ${i+1}  (ex: Option A, Fournisseur X…)`}
              value={alt.name}
              onChange={e => updName(i, e.target.value)}
              style={{ flex:1 }}
            />
            {alternatives.length > 2 && (
              <button className="btn btn-ghost btn-sm" onClick={() => remove(i)}>✕</button>
            )}
          </div>

          <div className="scores-grid">
            {criteria.map(c => (
              <div className="score-field" key={c.name}>
                <label className="field-label">{c.name}</label>
                {c.type === "categorical" ? (
                  <select
                    className="neu-sel"
                    value={alt.scores[c.name]}
                    onChange={e => updScore(i, c.name, e.target.value)}
                    style={{ width:"100%" }}
                  >
                    <option value="">— Choisir —</option>
                    {Object.keys(c.scale || {}).map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="neu-inp"
                    type="number"
                    placeholder="Valeur"
                    value={alt.scores[c.name]}
                    onChange={e => updScore(i, c.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={onBack}>← Retour</button>
        <button className="btn btn-ghost" onClick={addAlt}>+ Ajouter</button>
        <button className="btn btn-primary" disabled={!valid} onClick={() => onNext(alternatives)}>
          Suivant →
        </button>
      </div>
    </div>
  );
}
