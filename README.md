1/ Presentation de AHP app

Application web basée sur l'application du processus de hiérarchie Analytique(Analytic Hierarchy Process) de Thomas L. Saaty.  
Elle permet de comparer plusieurs alternatives selon de multiples critères et de recommander la meilleure option de façon rigoureuse.


2/ Fonctionnalités
- Définition de critères numérique ou catégoriels (avec échelle de valeurs personnalisée)
- Saisie des alternatives avec leurs valeurs pour chaque critère
- Matrice de comparaison par paires interactive(échelle de Saaty 1–9)
- Réciprocité automatique 
- Vérification de la cohérence : calcul de λmax, CI, RI et CR
- Si CR =< 0.10 : classement des alternatives et recommandation de la meilleure
- Si CR > 0.10 : explication détaillée de l'incohérence et conseils de correction


3/ Technologie
- Backend : Python 3.11, FastAPI, NumPy, Pydantic
- Frontend : React 18, Vite


4/ Lancer en local

 Prérequis :
- Python 3.10+
- Node.js 18+


 Backend

cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

L'API sera disponible sur `http://localhost:8000`  


 Frontend

cd frontend/vite-project
cp .env.example .env        # ou créer .env manuellement
npm install
npm run dev


L'interface sera disponible sur `http://localhost:5174`

