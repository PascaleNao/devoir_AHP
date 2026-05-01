
from pydantic import BaseModel
from typing import List, Dict, Optional

class CriterionType(str):
    NUMERIC    = "numeric"
    CATEGORICAL = "categorical"

class Criterion(BaseModel):
    name: str
    type: str  # "numeric" ou "categorical"
    # Pour les critères catégoriels : dictionnaire valeur -> score (ex: {"Bon":3,"Moyen":2})
    scale: Optional[Dict[str, float]] = None

class Alternative(BaseModel):
    name: str
    # scores[criterion_name] = valeur brute (nombre ou catégorie)
    scores: Dict[str, str]



class AHPRequest(BaseModel):
    criteria: List[Criterion]
    alternatives: List[Alternative]
    # Matrice n×n de comparaison par paires (liste de listes)
    pairwise_matrix: List[List[float]]

class ConsistencyResult(BaseModel):
    is_consistent: bool
    lambda_max: float
    ci: float          # Consistency Index
    ri: float          # Random Index
    cr: float          # Consistency Ratio
    reason: Optional[str] = None  # Explication si incohérent

class AlternativeResult(BaseModel):
    name: str
    score: float
    rank: int

class AHPResponse(BaseModel):
    consistency: ConsistencyResult
    criteria_weights: Optional[Dict[str, float]] = None
    results: Optional[List[AlternativeResult]] = None
    best_alternative: Optional[str] = None