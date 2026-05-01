# backend/scoring.py
import numpy as np
from typing import List, Dict
from models import Criterion, Alternative

def normalize_scores(
    alternatives: List[Alternative],
    criteria: List[Criterion]
) -> Dict[str, Dict[str, float]]:
    """
    Normalise les scores bruts de chaque alternative pour chaque critère.
    - Critère numérique  : normalisation min-max → [0, 1]
    - Critère catégoriel : utilise l'échelle fournie puis normalise
    Retourne : {criterion_name: {alternative_name: normalized_score}}
    """
    normalized = {}

    for criterion in criteria:
        cname = criterion.name
        raw_scores = {}

        for alt in alternatives:
            raw_value = alt.scores.get(cname, "0")

            if criterion.type == "categorical":
                # Convertir via l'échelle fournie
                scale = criterion.scale or {}
                raw_scores[alt.name] = float(scale.get(raw_value, 0))
            else:
                # Valeur numérique directe
                try:
                    raw_scores[alt.name] = float(raw_value)
                except ValueError:
                    raw_scores[alt.name] = 0.0

        # Normalisation min-max
        values = list(raw_scores.values())
        min_v, max_v = min(values), max(values)
        span = max_v - min_v

        normalized[cname] = {}
        for alt_name, score in raw_scores.items():
            if span > 0:
                normalized[cname][alt_name] = (score - min_v) / span
            else:
                normalized[cname][alt_name] = 1.0  # Tous égaux

    return normalized


def compute_final_scores(
    alternatives: List[Alternative],
    criteria: List[Criterion],
    weights: Dict[str, float]
) -> List[Dict]:
    """
    Score final = somme pondérée des scores normalisés.
    score(alt) = Σ weight(crit) × normalized_score(alt, crit)
    """
    normalized = normalize_scores(alternatives, criteria)
    results = []

    for alt in alternatives:
        total = 0.0
        for criterion in criteria:
            cname = criterion.name
            w = weights.get(cname, 0.0)
            s = normalized[cname].get(alt.name, 0.0)
            total += w * s

        results.append({"name": alt.name, "score": round(total, 4)})

    # Tri décroissant et ajout du rang
    results.sort(key=lambda x: x["score"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return results