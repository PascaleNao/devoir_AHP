# backend/ahp_engine.py
import numpy as np
from typing import List, Tuple, Dict

# Table des indices aléatoires de Saaty (n=1..10)
RANDOM_INDEX = {
    1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90,
    5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41,
    9: 1.45, 10: 1.49
}

def compute_priority_vector(matrix: List[List[float]]) -> Tuple[np.ndarray, float]:
    """
    Calcule le vecteur de priorité (poids) par la méthode de la moyenne
    géométrique des lignes (méthode de Saaty).
    Retourne : (vecteur_poids normalisé, lambda_max)
    """
    A = np.array(matrix, dtype=float)
    n = A.shape[0]

    # 1. Moyenne géométrique de chaque ligne
    geo_means = np.prod(A, axis=1) ** (1.0 / n)

    # 2. Normalisation → vecteur de priorité
    weights = geo_means / geo_means.sum()

    # 3. Calcul de lambda_max
    weighted_sum = A @ weights          # produit matriciel A × w
    lambda_values = weighted_sum / weights
    lambda_max = float(np.mean(lambda_values))

    return weights, lambda_max


def compute_consistency(n: int, lambda_max: float) -> Tuple[float, float, float]:
    """
    Calcule CI, RI et CR.
    CI = (lambda_max - n) / (n - 1)
    CR = CI / RI
    Retourne : (ci, ri, cr)
    """
    ci = (lambda_max - n) / (n - 1) if n > 1 else 0.0
    ri = RANDOM_INDEX.get(n, 1.49)
    cr = ci / ri if ri > 0 else 0.0
    return ci, ri, cr


def is_consistent(cr: float, threshold: float = 0.10) -> bool:
    """La matrice est cohérente si CR ≤ 0.10 (seuil de Saaty)."""
    return cr <= threshold


def get_inconsistency_reason(matrix: List[List[float]], cr: float, n: int) -> str:
    """
    Génère une explication détaillée de l'incohérence.
    Identifie la paire de critères la plus problématique.
    """
    A = np.array(matrix, dtype=float)
    violations = []

    # Vérification de la transitivité approximative : a_ij * a_jk ≈ a_ik
    for i in range(n):
        for j in range(n):
            for k in range(n):
                if i != j and j != k and i != k:
                    expected = A[i, j] * A[j, k]
                    actual   = A[i, k]
                    ratio    = max(expected, actual) / max(min(expected, actual), 1e-9)
                    if ratio > 2.0:  # écart > 200 %
                        violations.append((i, j, k, ratio))

    reason = (
        f"Le ratio de cohérence (CR = {cr:.3f}) dépasse le seuil de Saaty (0.10). "
        f"La matrice n'est pas suffisamment cohérente.\n"
    )

    if violations:
        # Trier par ratio décroissant, prendre le pire
        violations.sort(key=lambda x: x[3], reverse=True)
        i, j, k, ratio = violations[0]
        reason += (
            f"Violation principale : la comparaison entre les critères "
            f"({i+1}, {k+1}) est incohérente avec les comparaisons "
            f"({i+1}, {j+1}) et ({j+1}, {k+1}). "
            f"Écart de transitivité : {ratio:.1f}×. "
            f"Veuillez revoir vos jugements et vous assurer que si "
            f"A est préféré à B et B à C, alors A doit être préféré à C "
            f"de manière proportionnelle."
        )
    else:
        reason += (
            "Les valeurs de la matrice présentent des incohérences mineures "
            "mais cumulées. Révisez vos jugements en partant de la diagonale "
            "et en vérifiant la réciprocité : si a(i,j) = x, alors a(j,i) = 1/x."
        )

    return reason