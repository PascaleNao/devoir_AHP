import { useState } from "react";
import CriteriaForm from "./components/CriteriaForm";
import PairwiseMatrix from "./components/PairwiseMatrix";
import AlternativeScores from "./components/AlternativeScores";
import ResultsView from "./components/ResultsView";
import "./index.css";

const STEPS = ["Critères", "Alternatives", "Matrice", "Résultats"];

export default function App() {
  const [step, setStep] = useState(0);
  const [criteria, setCriteria] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const goToMatrix = (alts) => {
    setAlternatives(alts);
    const n = criteria.length;
    const identity = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
    setMatrix(identity);
    setStep(2);
  };

  const handleSubmit = async (finalMatrix) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ criteria, alternatives, pairwise_matrix: finalMatrix }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur serveur");
      }
      const data = await res.json();
      setResults(data);
      setStep(3);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setCriteria([]); setAlternatives([]);
    setMatrix([]); setResults(null); setError(null);
  };

  return (
    <div className="app-shell">
      <div className="bg-scene">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gw1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bdd5e8" stopOpacity="0.52"/>
              <stop offset="100%" stopColor="#e8c4b0" stopOpacity="0.32"/>
            </linearGradient>
            <linearGradient id="gw2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f2c4a8" stopOpacity="0.38"/>
              <stop offset="100%" stopColor="#c5dced" stopOpacity="0.28"/>
            </linearGradient>
          </defs>
          <path className="w1" fill="url(#gw1)" d="M0,300 C180,180 380,440 580,320 C780,200 980,460 1180,340 C1340,248 1410,355 1440,330 L1440,900 L0,900Z"/>
          <path className="w2" fill="url(#gw2)" d="M0,480 C160,360 340,570 540,460 C740,350 940,550 1140,440 C1310,348 1400,462 1440,440 L1440,900 L0,900Z"/>
          <path className="w3" fill="#f0ebe2" fillOpacity="0.22" d="M0,660 C200,560 420,740 640,640 C860,540 1080,720 1300,620 C1390,582 1425,638 1440,625 L1440,900 L0,900Z"/>
        </svg>
      </div>

      <header className="app-topbar">
        <div className="logo-badge">
  <img src="/logo.jpeg" alt="AHP logo" style={{width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover"}} />
</div>
        <div className="topbar-titles">
          <h1 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "34px",
            fontWeight: "700",
            color: "red",
            margin: "0 0 4px 0",
            lineHeight: "1",
            display: "block",
            visibility: "visible",
            opacity: "1"
          }}>Analyse AHP</h1>
          <p>Aide à la décision multi-critères · Méthode de Saaty</p>
        </div>
        <div className="step-counter">Étape {step + 1} / {STEPS.length}</div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          {STEPS.map((label, i) => (
            <div key={i} className={`step-item ${i === step ? "is-active" : i < step ? "is-done" : ""}`}>
              <div className="step-dot">{i < step ? "✓" : i + 1}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </aside>

        <main className="main-panel">
          {error && <div className="err-banner"><span>⚠</span><span>{error}</span></div>}
          {step === 0 && <CriteriaForm onNext={(crit) => { setCriteria(crit); setStep(1); }} />}
          {step === 1 && <AlternativeScores criteria={criteria} onNext={goToMatrix} onBack={() => setStep(0)} />}
          {step === 2 && <PairwiseMatrix criteria={criteria} matrix={matrix} onSubmit={handleSubmit} onBack={() => setStep(1)} loading={loading} />}
          {step === 3 && results && <ResultsView results={results} criteria={criteria} onReset={reset} />}
        </main>
      </div>
    </div>
  );
}
