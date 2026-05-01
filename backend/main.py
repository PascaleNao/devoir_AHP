
# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import AHPRequest, AHPResponse, ConsistencyResult, AlternativeResult
from ahp_engine import (
    compute_priority_vector,
    compute_consistency,
    is_consistent,
    get_inconsistency_reason
)
from scoring import compute_final_scores

app = FastAPI(title="AHP API", version="1.0.0")

# Autoriser les appels depuis React (localhost:5173 en dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "AHP API opérationnelle"}


@app.post("/analyze", response_model=AHPResponse)
def analyze(request: AHPRequest):
    n = len(request.criteria)
    matrix = request.pairwise_matrix

    # ── Validation de base ──────────────────────────────────────────────
    if len(matrix) != n or any(len(row) != n for row in matrix):
        raise HTTPException(
            status_code=400,
            detail=f"La matrice doit être {n}×{n} pour {n} critères."
        )

    # Vérification de la réciprocité (a_ij × a_ji ≈ 1)
    for i in range(n):
        for j in range(n):
            if abs(matrix[i][j] * matrix[j][i] - 1.0) > 0.01:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"La matrice n'est pas réciproque : "
                        f"a[{i+1}][{j+1}] × a[{j+1}][{i+1}] ≠ 1. "
                        f"Vérifiez que chaque valeur et son symétrique sont inverses."
                    )
                )

    # ── Calcul AHP ──────────────────────────────────────────────────────
    weights_vector, lambda_max = compute_priority_vector(matrix)
    ci, ri, cr = compute_consistency(n, lambda_max)
    consistent  = is_consistent(cr)

    # ── Résultat de cohérence ────────────────────────────────────────────
    consistency_result = ConsistencyResult(
        is_consistent=consistent,
        lambda_max=round(lambda_max, 4),
        ci=round(ci, 4),
        ri=round(ri, 4),
        cr=round(cr, 4),
        reason=None if consistent else get_inconsistency_reason(matrix, cr, n)
    )

    if not consistent:
        return AHPResponse(consistency=consistency_result)

    # ── Calcul des scores si cohérent ───────────────────────────────────
    criteria_names  = [c.name for c in request.criteria]
    weights_dict    = dict(zip(criteria_names, weights_vector.tolist()))

    raw_results     = compute_final_scores(
        request.alternatives,
        request.criteria,
        weights_dict
    )

    alternative_results = [
        AlternativeResult(name=r["name"], score=r["score"], rank=r["rank"])
        for r in raw_results
    ]

    return AHPResponse(
        consistency=consistency_result,
        criteria_weights={k: round(v, 4) for k, v in weights_dict.items()},
        results=alternative_results,
        best_alternative=alternative_results[0].name
    )