import { useState } from "react";

export default function CriteriaForm({ onNext }) {
  const [criteria, setCriteria] = useState([
    { name: "", type: "numeric", scale: {} },
    { name: "", type: "numeric", scale: {} },
  ]);

  const add = () => setCriteria([...criteria, { name: "", type: "numeric", scale: {} }]);

  const upd = (i, field, val) => {
    const u = [...criteria];
    u[i] = { ...u[i], [field]: val };
    setCriteria(u);
  };

  const updScale = (i, key, val) => {
    const u = [...criteria];
    u[i].scale = { ...u[i].scale, [key]: parseFloat(val) || 0 };
    setCriteria(u);
  };

  const addScaleKey = (i) => {
    const u = [...criteria];
    u[i].scale = { ...u[i].scale, "": 0 };
    setCriteria(u);
  };

  const renameKey = (i, oldKey, newKey) => {
    const u = [...criteria];
    const sc = {};
    Object.entries(u[i].scale).forEach(([k, v]) => { sc[k === oldKey ? newKey : k] = v; });
    u[i].scale = sc;
    setCriteria(u);
  };

  const remove = (i) => setCriteria(criteria.filter((_, j) => j !== i));

  const valid = criteria.length >= 2 && criteria.every(c => c.name.trim() !== "");

  return (
    <div>
      <h2 className="sec-title">Définir les critères</h2>
      <p className="sec-sub" style={{color: "rgba(111,160,192,0.45)#5598b9", fontWeight: "400"}}>
        Ajoutez au moins 2 critères d'évaluation. Pour les critères qualitatifs,
        définissez une échelle de valeurs avec leurs scores numériques associés.
      </p>

      {criteria.map((c, i) => (
        <div className="neu-card" key={i}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <input
              className="neu-inp"
              placeholder={`Critère ${i+1}  (ex: Coût, Qualité, Délai…)`}
              value={c.name}
              onChange={e => upd(i, "name", e.target.value)}
              style={{ flex:1 }}
            />
            <select
              className="neu-sel"
              value={c.type}
              onChange={e => upd(i, "type", e.target.value)}
            >
              <option value="numeric">Numérique</option>
              <option value="categorical">Catégoriel</option>
            </select>
            {criteria.length > 2 && (
              <button className="btn btn-ghost btn-sm" onClick={() => remove(i)}>✕</button>
            )}
          </div>

          {c.type === "categorical" && (
            <div className="scale-panel">
              <span className="field-label">Échelle de valeurs → score</span>
              {Object.entries(c.scale).map(([key, val], j) => (
                <div className="scale-row" key={j}>
                  <input
                    className="neu-inp"
                    placeholder="Valeur (ex: Bon)"
                    defaultValue={key}
                    onBlur={e => renameKey(i, key, e.target.value)}
                    style={{ flex:1 }}
                  />
                  <input
                    className="neu-inp"
                    type="number"
                    placeholder="Score"
                    value={val}
                    onChange={e => updScale(i, key, e.target.value)}
                    style={{ width:88 }}
                  />
                </div>
              ))}
              <button className="add-val-btn" onClick={() => addScaleKey(i)}>
                + Ajouter une valeur
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={add}>+ Ajouter un critère</button>
        <button className="btn btn-primary" disabled={!valid} onClick={() => onNext(criteria)}>
          Suivant →
        </button>
      </div>
    </div>
  );
}
 