import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { localeFromLanguage, text, useLanguage } from "@/lib/i18n";

type LessonSection = {
	title: string;
	intro: string;
	formulas?: string[];
	example?: string;
	note?: string;
};
type LessonChapter = {
	title: string;
	strapline: string;
	sections: LessonSection[];
};

const lessons: Record<"en" | "fr", LessonChapter[]> = {
	fr: [
		{
			title: "Chapitre 1 · Définitions de base",
			strapline: "Modéliser, représenter et analyser un graphe.",
			sections: [
				{
					title: "Modèle, vocabulaire et sous-graphes",
					intro:
						"Un graphe formalise des objets et les relations pertinentes pour une question. Dans les conventions de ce chapitre, un graphe simple non orienté est fini, sans boucle ni arêtes multiples. Le dessin peut changer sans changer le graphe : seuls les sommets et les arêtes comptent.",
					formulas: [
						"G = (V, E) · n = |V| (ordre) · m = |E| (taille)",
						"G simple non orienté : E ⊆ {{u, v} : u, v ∈ V, u ≠ v}",
						"u et v adjacents ⇔ uv ∈ E",
						"N(v) = {u ∈ V : uv ∈ E} · N[v] = N(v) ∪ {v}",
						"H = (W, F) ⊆ G ⇔ W ⊆ V et F ⊆ E",
						"G[W] : sous-graphe induit qui conserve toutes les arêtes entre les sommets de W",
					],
					example:
						"Si N(A) = {B, C}, alors N[A] = {A, B, C}. Pour W = {A, B}, le sous-graphe induit garde l’arête AB si elle existe dans G.",
					note: "Par défaut, le cours suppose un graphe fini, simple, non orienté et non pondéré. Dans un graphe orienté, une arête devient un arc ordonné ; une pondération associe une valeur aux arêtes. Une marche peut répéter des sommets ; un chemin n’en répète aucun. Un cycle est une marche fermée de longueur au moins 3, sans répétition sauf le sommet de départ à la fin. Toute marche entre deux sommets contient un chemin entre ces sommets.",
				},
				{
					title: "Représentations et complexité",
					intro:
						"Une liste d’arêtes, des listes de voisins ou une matrice décrivent le même objet. Le choix dépend de la mémoire disponible et des opérations fréquentes.",
					formulas: [
						"Liste d’arêtes : espace Θ(m) · tester uv : O(m) · lister N(u) : O(m)",
						"Listes de voisins : espace Θ(n + m) · tester uv : O(d(u)) · lister N(u) : Θ(d(u))",
						"Matrice A : espace Θ(n²) · tester uv : O(1) · lister N(u) : Θ(n) · lister E : Θ(n²)",
						"G simple non orienté : A[u,v] = A[v,u] et A[u,u] = 0",
						"Graphe simple : m ≤ n(n − 1)/2",
						"f=O(g) ⇔ ∃C,n₀>0, ∀n≥n₀ : f(n)≤Cg(n)",
						"f=Ω(g) ⇔ ∃c,n₀>0, ∀n≥n₀ : cg(n)≤f(n)",
						"f=Θ(g) ⇔ ∃c,C,n₀>0, ∀n≥n₀ : cg(n)≤f(n)≤Cg(n)",
					],
					example:
						"Pour V = {A, B, C} et E = {AB, AC}, la liste de voisins donne A:{B,C}, B:{A}, C:{A}. Dans la matrice, A relie B et C ; la matrice est symétrique.",
					note: "Dans un graphe non orienté, chaque arête apparaît dans les listes de ses deux extrémités. Un graphe creux a m proche de n : les listes sont souvent économes. Un graphe dense a m de l’ordre de n² : la matrice peut convenir, surtout si les tests d’adjacence sont fréquents. O est une borne supérieure, Ω une borne inférieure, Θ un ordre exact ; par exemple 3n² + 5n + 7 = Θ(n²).",
				},
				{
					title: "Degrés et double comptage",
					intro:
						"Le degré d’un sommet est son nombre de voisins. Le lemme des poignées de main compte les incidences sommet-arête de deux façons : par sommet, puis par arête.",
					formulas: [
						"d(v) = |N(v)| · δ(G) = minᵥ d(v) · Δ(G) = maxᵥ d(v)",
						"Σᵥ∈V d(v) = 2m",
						"Le nombre de sommets de degré impair est pair",
						"G k-régulier : d(v) = k pour tout v, donc kn = 2m",
						"Graphe simple : 0 ≤ d(v) ≤ n − 1",
						"Graphe complet Kₙ : d(v) = n − 1 et m = n(n − 1)/2",
					],
					example:
						"Pour les degrés 3, 2, 2 et 1, la somme vaut 8 ; il y a donc m = 8/2 = 4 arêtes. Une liste de degrés dont la somme est impaire est impossible.",
					note: "Une somme paire est nécessaire, mais ne suffit pas à prouver qu’une suite est réalisable comme degrés d’un graphe simple.",
				},
				{
					title: "Connexité et algorithme Composantes",
					intro:
						"Un graphe est connexe si chaque paire de sommets est reliée par un chemin. Les composantes connexes sont les sous-ensembles connexes maximaux et forment une partition des sommets.",
					formulas: [
						"V = C₁ ⊎ C₂ ⊎ … ⊎ Cₖ",
						"Avec exactement k composantes : m ≤ (n − k + 1)(n − k)/2",
						"comp[x] = comp[y] ⇔ x et y sont dans la même composante",
						"Composantes : initialiser comp[x] ← x ; pour chaque xy, fusionner les étiquettes si elles diffèrent",
						"Temps : O(m + n²) · espace auxiliaire : Θ(n) · au plus n − 1 fusions",
					],
					example:
						"Avec les arêtes AB, BC et DE, comp code les classes {A,B,C} et {D,E}. Traiter une arête entre deux classes fusionne toutes les entrées portant l’ancienne étiquette.",
					note: "L’invariant est qu’une étiquette commune implique déjà un chemin dans les arêtes traitées. À la fin, deux sommets ont la même étiquette exactement quand ils sont dans la même composante. Pour connecter k composantes, il faut au minimum k − 1 nouvelles arêtes. Le maximum d’arêtes avec k composantes est obtenu en regroupant n−k+1 sommets en une clique et en laissant les k−1 autres isolés.",
				},
			],
		},
		{
			title: "Chapitre 2 · Arbres couvrants",
			strapline: "Relier tous les sommets sans cycle, puis minimiser le coût.",
			sections: [
				{
					title: "Arbres et forêts",
					intro:
						"Un arbre est un graphe connexe sans cycle ; une forêt est un graphe sans cycle, éventuellement déconnecté. Une feuille est un sommet de degré 1 (le graphe à un seul sommet n’a pas de feuille selon la convention du cours).",
					formulas: [
						"Arbre d’ordre n : m = n − 1",
						"Forêt d’ordre n à c composantes : m = n − c",
						"Deux propriétés parmi {connexe, sans cycle, m = n − 1} ⇒ la troisième",
						"Arbre ⇔ un unique chemin entre chaque paire de sommets",
						"Arbre à n ≥ 2 : au moins deux feuilles",
					],
					example:
						"Une forêt de 12 sommets avec 3 composantes a 12 − 3 = 9 arêtes. Chaque composante de taille 2, 4 et 6 en possède respectivement 1, 3 et 5.",
					note: "Supprimer une arête d’un arbre le déconnecte. Ajouter une arête entre deux sommets déjà dans le même arbre crée exactement un cycle. Supprimer une feuille d’un arbre conserve un arbre.",
				},
				{
					title: "Arbre couvrant et algorithme",
					intro:
						"Un sous-graphe H=(W,F) de G=(V,E) est couvrant lorsque W=V. Un arbre couvrant garde tous les sommets et choisit juste assez d’arêtes pour rester connexe sans cycle.",
					formulas: [
						"G connexe ⇔ G possède un arbre couvrant",
						"Arbre couvrant sur n sommets : exactement n − 1 arêtes",
						"Arbre-Couvrant : A←∅ ; comp[x]←x ; pour xy∈E, garder xy si comp[x]≠comp[y], puis fusionner les étiquettes",
						"Temps avec tableau comp : O(n² + m)",
					],
					example:
						"Sur A-B, A-C, B-C, B-D, C-D, D-E dans cet ordre, on retient AB, AC, BD et DE ; BC et CD sont rejetées car elles créeraient un cycle. Résultat : 5 sommets, 4 arêtes.",
					note: "Pour un graphe déconnecté, cette procédure construit une forêt couvrante : chaque composante initiale reçoit son arbre couvrant. Il n’existe pas d’arbre couvrant global.",
				},
				{
					title: "Poids et problème ACPM",
					intro:
						"Un graphe pondéré associe un réel à chaque arête. L’ACPM est un arbre couvrant de poids minimal dans un graphe pondéré connexe.",
					formulas: [
						"w : E → ℝ",
						"Pour A ⊆ E : w(A) = Σₑ∈A w(e)",
						"ACPM : T arbre couvrant et w(E(T)) = minₜ′ arbre couvrant w(E(T′))",
					],
					example:
						"Comparer des arbres couvrants revient à additionner leurs poids d’arêtes, pas à comparer le nombre d’arêtes : tout arbre couvrant d’un même graphe connexe en a déjà n − 1.",
					note: "Un graphe peut avoir plusieurs ACPM. Si tous les poids d’arêtes sont distincts, l’ACPM est unique ; la réciproque est fausse. Des égalités autorisent plusieurs choix, mais ne garantissent pas plusieurs solutions.",
				},
				{
					title: "Kruskal et Union-Find",
					intro:
						"Kruskal examine les arêtes par poids croissant. Il ajoute une arête seulement si ses extrémités sont dans deux composantes différentes ; sinon, elle créerait un cycle.",
					formulas: [
						"1. Trier E par poids croissant · 2. A←∅ et comp[x]←x",
						"3. Pour xy triée : si comp[x]≠comp[y], ajouter xy à A puis fusionner les classes",
						"4. Arrêt connexe : |A| = n − 1 · poids final = Σₑ∈A w(e)",
						"Tri : O(m log m) · mise à jour comp : O(n² + m)",
						"Bilan tableau comp : O(m log m + n²)",
						"Union-Find avec listes pondérées : O(m log m + n log n), donc O(m log m) si G est connexe",
						"Échange de preuve : w(T′)=w(T)−w(f)+w(e)≤w(T) si e est traitée avant f",
					],
					example:
						"AB=4, AC=2, BC=1, BD=5, CD=8, CE=10, DE=2 et F isolé : après tri, Kruskal retient BC(1), AC(2), DE(2), BD(5). La forêt minimale a 4 arêtes, poids 10, et deux composantes : {A,B,C,D,E} et {F}.",
					note: "Union-Find fournit Créer-Ensemble, Trouver-Représentant et Union. Avec des listes chaînées pondérées, on rattache la plus petite classe à la plus grande : chaque élément change de représentant au plus ⌊log₂ n⌋ fois. La preuve de Kruskal repose sur l’invariant : les arêtes retenues sont toujours incluses dans un ACPM possible.",
				},
			],
		},
		{
			title: "Chapitre 3 · Les parcours",
			strapline:
				"Explorer un graphe, calculer les distances et construire un arbre de parcours.",
			sections: [
				{
					title: "Parcours et distances",
					intro:
						"Un parcours ordonne les sommets découverts et associe à chaque sommet sauf la racine un parent antérieur qui lui est relié. Les arêtes parent forment un arbre enraciné. Le choix des voisins peut changer l’ordre et l’arbre obtenus.",
					formulas: [
						"p(r)=⊥ · pour i≥2 : p(vᵢ)∈{v₁,…,vᵢ₋₁} et p(vᵢ)vᵢ∈E",
						"Après k découvertes : Tₖ=(Wₖ,Fₖ) est un arbre, avec |Fₖ|=k−1",
						"Distance non pondérée dG(x,y) = longueur minimale en nombre d’arêtes",
						"dG(x,x)=0 · dG(x,y)=+∞ si y est inaccessible depuis x",
						"Dans un APCC enraciné en r : niveau ℓT(v)=dT(r,v)=dG(r,v)",
						"Caractérisation APCC : pour toute xy∈E, |ℓ(x)−ℓ(y)|≤1",
					],
					example:
						"Dans un losange A-B-D et A-C-D, les deux chemins A-B-D et A-C-D ont chacun 2 arêtes : dG(A,D)=2. Une arête dans le dessin ne vaut pas plus parce qu’elle est tracée plus longue.",
					note: "Un parcours quelconque donne un arbre couvrant si G est connexe, mais pas nécessairement un arbre des plus courts chemins. Le parcours en largeur (BFS) produit un APCC.",
				},
				{
					title: "Parcours en largeur · BFS",
					intro:
						"BFS explore par couches à partir d’une racine r et utilise une file FIFO. Au premier passage d’une arête vers un sommet non découvert, il fixe son parent et son niveau.",
					formulas: [
						"Initialiser p[v]=⊥, ℓ[v]=∞, ord[v]=∞ pour tout v",
						"ℓ[r]=0 · ord[r]=1 · t=2 · enfiler r",
						"Tant que Q≠∅ : u←défiler(Q) ; pour v∈N(u) non découvert, p[v]←u, ℓ[v]←ℓ[u]+1, ord[v]←t, t←t+1, enfiler v",
						"Avec listes de voisins : Θ(n + m) · avec matrice : Θ(n²)",
						"Invariant de la file : au plus deux niveaux consécutifs, les niveaux inférieurs d’abord",
					],
					example:
						"Dans A-B, A-C, B-D, C-D, les couches sont L₀={A}, L₁={B,C}, L₂={D}. Les deux plus courts chemins de A à D sont A-B-D et A-C-D ; l’arbre BFS en choisit un selon l’ordre des voisins.",
					note: "Un sommet non atteint conserve ℓ[v]=ord[v]=∞ et p[v]=⊥. Pour parcourir un graphe non connexe en entier, relancer BFS depuis chaque sommet encore non découvert. Dans un graphe biparti, les niveaux pairs et impairs donnent les deux classes ; une arête entre deux sommets de même parité révèle un conflit.",
				},
				{
					title: "Parcours en profondeur · DFS",
					intro:
						"DFS suit une branche aussi loin que possible avant de revenir en arrière. Il utilise une pile explicite ou la récursivité et produit un arbre (ou une forêt si le graphe est déconnecté).",
					formulas: [
						"Initialiser entree[v]=⊥ · t=0",
						"Explorer(u) : t←t+1 ; entree[u]←t ; pour chaque voisin v non découvert, p[v]←u puis Explorer(v)",
						"À la fin des voisins : t←t+1 ; sortie[u]←t",
						"u ancêtre de v ⇔ [entree(v), sortie(v)] ⊂ [entree(u), sortie(u)]",
						"Pour toute arête uv non orientée, l’un de u,v est ancêtre de l’autre",
						"Avec listes de voisins : Θ(n + m) · avec matrice : Θ(n²)",
					],
					example:
						"Si u a l’intervalle [1,8] et v [2,5], u est ancêtre de v. Si les intervalles [2,5] et [6,7] sont disjoints, ces deux sommets ne sont pas ancêtre l’un de l’autre.",
					note: "Poser p[r]=⊥ puis lancer Explorer(r). Pour une forêt DFS complète, relancer depuis chaque sommet non découvert, en le prenant pour racine. Un sommet est actif entre son entrée et sa sortie ; les sommets actifs forment la pile et la branche courante. L’ordre de visite des voisins change l’arbre et les dates, mais pas les garanties générales du parcours.",
				},
			],
		},
	],
	en: [
		{
			title: "Chapter 1 · Basic definitions",
			strapline: "Model, represent, and analyze graphs.",
			sections: [
				{
					title: "Model, vocabulary, and subgraphs",
					intro:
						"A graph models objects and the relationships relevant to a question. In this chapter, a simple undirected graph is finite, has no loops, and has no multiple edges. A drawing can change without changing the graph: only its vertices and edges matter.",
					formulas: [
						"G = (V, E) · n = |V| (order) · m = |E| (size)",
						"Simple undirected graph: E ⊆ {{u, v} : u, v ∈ V, u ≠ v}",
						"u and v are adjacent ⇔ uv ∈ E",
						"N(v) = {u ∈ V : uv ∈ E} · N[v] = N(v) ∪ {v}",
						"H = (W, F) ⊆ G ⇔ W ⊆ V and F ⊆ E",
						"G[W]: induced subgraph containing every edge between vertices in W",
					],
					example:
						"If N(A) = {B, C}, then N[A] = {A, B, C}. For W = {A, B}, the induced subgraph keeps AB if it is an edge of G.",
					note: "By default, the course assumes a finite, simple, undirected, unweighted graph. In a directed graph, an edge becomes an ordered arc; a weight function assigns values to edges. A walk may repeat vertices; a path does not. A cycle is a closed walk of length at least 3 with no repeated vertices except its start and end. Every walk between two vertices contains a path between them.",
				},
				{
					title: "Representations and complexity",
					intro:
						"An edge list, adjacency lists, and an adjacency matrix represent the same graph. Choose according to memory limits and the operations you use most.",
					formulas: [
						"Edge list: space Θ(m) · test uv: O(m) · list N(u): O(m)",
						"Adjacency lists: space Θ(n + m) · test uv: O(d(u)) · list N(u): Θ(d(u))",
						"Matrix A: space Θ(n²) · test uv: O(1) · list N(u): Θ(n) · list E: Θ(n²)",
						"Simple undirected graph: A[u,v] = A[v,u] and A[u,u] = 0",
						"Simple graph: m ≤ n(n − 1)/2",
						"f=O(g) ⇔ ∃C,n₀>0, ∀n≥n₀: f(n)≤Cg(n)",
						"f=Ω(g) ⇔ ∃c,n₀>0, ∀n≥n₀: cg(n)≤f(n)",
						"f=Θ(g) ⇔ ∃c,C,n₀>0, ∀n≥n₀: cg(n)≤f(n)≤Cg(n)",
					],
					example:
						"For V = {A, B, C} and E = {AB, AC}, adjacency lists are A:{B,C}, B:{A}, C:{A}. The adjacency matrix is symmetric.",
					note: "In an undirected graph, each edge appears in the lists of both endpoints. A sparse graph has m close to n, so lists are often space-efficient. A dense graph has m on the order of n², where a matrix can be useful, especially for frequent adjacency tests. O is an upper bound, Ω a lower bound, and Θ a tight asymptotic order; for example, 3n² + 5n + 7 = Θ(n²).",
				},
				{
					title: "Degrees and double counting",
					intro:
						"The degree of a vertex is its number of neighbors. The handshaking lemma counts vertex-edge incidences once by vertices and once by edges.",
					formulas: [
						"d(v) = |N(v)| · δ(G) = minᵥ d(v) · Δ(G) = maxᵥ d(v)",
						"Σᵥ∈V d(v) = 2m",
						"The number of odd-degree vertices is even",
						"k-regular graph: d(v) = k for every v, so kn = 2m",
						"Simple graph: 0 ≤ d(v) ≤ n − 1",
						"Complete graph Kₙ: d(v) = n − 1 and m = n(n − 1)/2",
					],
					example:
						"For degrees 3, 2, 2, and 1, the sum is 8, so m = 8/2 = 4 edges. A degree sequence with an odd sum is impossible.",
					note: "An even degree sum is necessary, but does not prove that a sequence is realizable by a simple graph.",
				},
				{
					title: "Connectivity and the Components algorithm",
					intro:
						"A graph is connected if every pair of vertices is joined by a path. Connected components are the maximal connected vertex sets and partition the vertices.",
					formulas: [
						"V = C₁ ⊎ C₂ ⊎ … ⊎ Cₖ",
						"With exactly k components: m ≤ (n − k + 1)(n − k)/2",
						"comp[x] = comp[y] ⇔ x and y belong to the same component",
						"Components: initialize comp[x] ← x; for each xy, merge labels if they differ",
						"Time: O(m + n²) · auxiliary space: Θ(n) · at most n − 1 merges",
					],
					example:
						"For edges AB, BC, and DE, comp encodes {A,B,C} and {D,E}. Processing an edge between two classes replaces every entry with the old label.",
					note: "The invariant is that equal labels imply a path using processed edges. At the end, labels are equal exactly for vertices in the same component. Connecting k components requires at least k − 1 new edges. The maximum edge count occurs when n−k+1 vertices form a clique and the remaining k−1 vertices are isolated.",
				},
			],
		},
		{
			title: "Chapter 2 · Spanning trees",
			strapline: "Connect all vertices without cycles, then minimize the cost.",
			sections: [
				{
					title: "Trees and forests",
					intro:
						"A tree is a connected acyclic graph; a forest is an acyclic graph, possibly disconnected. A leaf has degree 1 (by the course convention, a one-vertex tree has no leaf).",
					formulas: [
						"Tree of order n: m = n − 1",
						"Forest of order n with c components: m = n − c",
						"Any two of {connected, acyclic, m = n − 1} imply the third",
						"Tree ⇔ exactly one path joins every pair of vertices",
						"A tree with n ≥ 2 has at least two leaves",
					],
					example:
						"A forest with 12 vertices and 3 components has 12 − 3 = 9 edges. Components of sizes 2, 4, and 6 have 1, 3, and 5 edges respectively.",
					note: "Removing an edge from a tree disconnects it. Adding an edge between vertices already in the same tree creates exactly one cycle. Removing a leaf from a tree leaves a tree.",
				},
				{
					title: "Spanning trees and the construction algorithm",
					intro:
						"A subgraph H=(W,F) of G=(V,E) is spanning when W=V. A spanning tree keeps every vertex and just enough edges to remain connected without cycles.",
					formulas: [
						"G is connected ⇔ G has a spanning tree",
						"A spanning tree on n vertices has exactly n − 1 edges",
						"Spanning tree: A←∅; comp[x]←x; for each xy∈E, keep xy if comp[x]≠comp[y], then merge labels",
						"Time with the comp array: O(n² + m)",
					],
					example:
						"For edges AB, AC, BC, BD, CD, DE in that order, keep AB, AC, BD, and DE; reject BC and CD because they create cycles. The result has 5 vertices and 4 edges.",
					note: "On a disconnected graph, the procedure constructs a spanning forest, one spanning tree per original component. There is no spanning tree for the entire graph.",
				},
				{
					title: "Weights and the minimum spanning tree problem",
					intro:
						"A weighted graph assigns a real number to each edge. A minimum spanning tree (MST) is a spanning tree with minimum total weight in a connected weighted graph.",
					formulas: [
						"w : E → ℝ",
						"For A ⊆ E: w(A) = Σₑ∈A w(e)",
						"MST: T is a spanning tree and w(E(T)) = min over spanning trees T′ of w(E(T′))",
					],
					example:
						"Compare spanning trees by summing their edge weights, not by edge count: every spanning tree of the same connected graph already has n − 1 edges.",
					note: "A graph can have multiple MSTs. If all edge weights are distinct, the MST is unique; the converse is false. Ties allow multiple choices but do not guarantee multiple solutions.",
				},
				{
					title: "Kruskal and Union-Find",
					intro:
						"Kruskal processes edges in increasing weight order. It adds an edge only when its endpoints belong to different components; otherwise, the edge would create a cycle.",
					formulas: [
						"1. Sort E by increasing weight · 2. A←∅ and comp[x]←x",
						"3. For each sorted xy: if comp[x]≠comp[y], add xy to A and merge the classes",
						"4. If connected: |A| = n − 1 · final weight = Σₑ∈A w(e)",
						"Sorting: O(m log m) · comp updates: O(n² + m)",
						"Array implementation: O(m log m + n²)",
						"Weighted-list Union-Find: O(m log m + n log n), hence O(m log m) when G is connected",
						"Exchange proof: w(T′)=w(T)−w(f)+w(e)≤w(T) when e is processed before f",
					],
					example:
						"AB=4, AC=2, BC=1, BD=5, CD=8, CE=10, DE=2, and F isolated: Kruskal keeps BC(1), AC(2), DE(2), BD(5). The minimum spanning forest has 4 edges, weight 10, and components {A,B,C,D,E} and {F}.",
					note: "Union-Find provides Make-Set, Find-Representative, and Union. With weighted linked lists, attach the smaller set to the larger: each element changes representative at most ⌊log₂ n⌋ times. Kruskal’s invariant is that the chosen edges remain contained in at least one possible MST.",
				},
			],
		},
		{
			title: "Chapter 3 · Graph traversals",
			strapline:
				"Explore a graph, compute distances, and build a traversal tree.",
			sections: [
				{
					title: "Traversals and distances",
					intro:
						"A traversal orders discovered vertices and assigns each vertex except the root a parent discovered earlier and connected to it. Parent edges form a rooted tree. Neighbor order can change the discovery order and tree.",
					formulas: [
						"p(r)=⊥ · for i≥2: p(vᵢ)∈{v₁,…,vᵢ₋₁} and p(vᵢ)vᵢ∈E",
						"After k discoveries: Tₖ=(Wₖ,Fₖ) is a tree with |Fₖ|=k−1",
						"Unweighted distance dG(x,y) = minimum path length in number of edges",
						"dG(x,x)=0 · dG(x,y)=+∞ if y is unreachable from x",
						"In a rooted shortest-path tree: level ℓT(v)=dT(r,v)=dG(r,v)",
						"Shortest-path tree criterion: for every xy∈E, |ℓ(x)−ℓ(y)|≤1",
					],
					example:
						"In the diamond A-B-D and A-C-D, both A-B-D and A-C-D have 2 edges, so dG(A,D)=2. A drawn edge does not count for more because it looks longer.",
					note: "An arbitrary traversal gives a spanning tree when G is connected, but not necessarily a shortest-path tree. Breadth-first search (BFS) constructs one.",
				},
				{
					title: "Breadth-first search · BFS",
					intro:
						"BFS explores in layers from a root r using a FIFO queue. When it first reaches an undiscovered vertex along an edge, it records that vertex’s parent and level.",
					formulas: [
						"Initialize p[v]=⊥, ℓ[v]=∞, ord[v]=∞ for every v",
						"ℓ[r]=0 · ord[r]=1 · t=2 · enqueue r",
						"While Q≠∅: u←dequeue(Q); for each undiscovered v∈N(u), set p[v]←u, ℓ[v]←ℓ[u]+1, ord[v]←t, t←t+1, then enqueue v",
						"Adjacency lists: Θ(n + m) · matrix: Θ(n²)",
						"Queue invariant: at most two consecutive levels, with the lower level first",
					],
					example:
						"For A-B, A-C, B-D, C-D, the layers are L₀={A}, L₁={B,C}, L₂={D}. The shortest A-to-D paths are A-B-D and A-C-D; the BFS tree picks one according to neighbor order.",
					note: "An unreached vertex keeps ℓ[v]=ord[v]=∞ and p[v]=⊥. To traverse a disconnected graph completely, restart BFS at each undiscovered vertex. In a bipartite graph, even and odd levels give the two parts; an edge between vertices of the same parity is a conflict.",
				},
				{
					title: "Depth-first search · DFS",
					intro:
						"DFS follows one branch as far as possible before backtracking. It uses an explicit stack or recursion and produces a tree, or a forest when the graph is disconnected.",
					formulas: [
						"Initialize enter[v]=⊥ · t=0",
						"Explore(u): t←t+1; enter[u]←t; for each undiscovered neighbor v, set p[v]←u then Explore(v)",
						"After all neighbors: t←t+1; exit[u]←t",
						"u is an ancestor of v ⇔ [enter(v), exit(v)] ⊂ [enter(u), exit(u)]",
						"For every undirected edge uv, one endpoint is an ancestor of the other",
						"Adjacency lists: Θ(n + m) · matrix: Θ(n²)",
					],
					example:
						"If u has interval [1,8] and v has [2,5], u is an ancestor of v. Disjoint intervals [2,5] and [6,7] mean neither vertex is an ancestor of the other.",
					note: "Set p[r]=⊥ and call Explore(r). For a full DFS forest, restart at each undiscovered vertex and make it a root. A vertex is active between its entry and exit; active vertices form the stack and current branch. Neighbor order changes the tree and timestamps, but not the general traversal guarantees.",
				},
			],
		},
	],
};

export function LessonsPage() {
	const [language] = useLanguage();
	const locale = localeFromLanguage(language);
	const chapters = lessons[language];
	const [selectedChapter, setSelectedChapter] = useState(0);
	const chapter = chapters[selectedChapter] ?? chapters[0];
	const changeChapter = (index: number) => {
		setSelectedChapter(index);
		document.getElementById("lesson-content")?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	return (
		<main className="w-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
			<header className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
				<div>
					<p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
						{text(
							language,
							"Graph theory · course notes",
							"Théorie des graphes · cours",
						)}
					</p>
					<h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
						{text(language, "Lesson summaries", "Synthèses des leçons")}
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
						{text(
							language,
							"Three chapters, organized into short topics with formulas, worked examples, and algorithm notes.",
							"Trois chapitres organisés en notions courtes : formules, exemples résolus et algorithmes.",
						)}
					</p>
				</div>
				<Link
					to="/$locale/$page"
					params={{ locale, page: "simulator" }}
					className="inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
				>
					{text(language, "Open simulator", "Ouvrir le simulateur")} →
				</Link>
			</header>

			<div className="mt-7 grid items-start gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
				<nav
					aria-label={text(language, "Chapters", "Chapitres")}
					className="flex snap-x gap-2 overflow-x-auto pb-2 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:snap-none lg:flex-col lg:overflow-y-auto lg:pr-1"
				>
					<p className="hidden px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground lg:block">
						{text(language, "Study path", "Parcours du cours")}
					</p>
					{chapters.map((item, index) => {
						const selected = selectedChapter === index;
						return (
							<div
								key={item.title}
								className={`min-w-64 snap-start rounded-xl border p-2 lg:min-w-0 ${selected ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}
							>
								<button
									type="button"
									aria-current={selected ? "step" : undefined}
									onClick={() => changeChapter(index)}
									className="flex min-h-14 w-full items-start gap-3 rounded-lg p-2 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
								>
									<span
										className={`grid size-8 shrink-0 place-items-center rounded-md font-mono text-xs ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
									>
										{String(index + 1).padStart(2, "0")}
									</span>
									<span className="min-w-0">
										<span className="block text-[11px] text-muted-foreground">
											{text(
												language,
												`Chapter ${index + 1}`,
												`Chapitre ${index + 1}`,
											)}
										</span>
										<span className="mt-0.5 block text-sm font-medium leading-5 text-foreground">
											{item.title.split(" · ")[1]}
										</span>
										<span className="mt-1 block text-xs leading-5 text-muted-foreground">
											{item.strapline}
										</span>
									</span>
								</button>
								{selected && (
									<div className="border-t border-border/70 px-2 pb-2 pt-2">
										<p className="mb-1 px-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
											{text(language, "In this chapter", "Dans ce chapitre")}
										</p>
										{item.sections.map((section, sectionIndex) => (
											<a
												key={section.title}
												href={`#chapter-${index + 1}-section-${sectionIndex + 1}`}
												className="flex min-h-9 items-center gap-2 rounded-md px-1 text-xs leading-4 text-muted-foreground outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
											>
												<span className="font-mono text-[10px] opacity-60">
													{sectionIndex + 1}.
												</span>
												<span>{section.title}</span>
											</a>
										))}
									</div>
								)}
							</div>
						);
					})}
				</nav>

				<div id="lesson-content" className="min-w-0 scroll-mt-4">
					<section className="overflow-hidden rounded-2xl border border-border bg-muted/20">
						<div className="flex flex-wrap items-end justify-between gap-5 p-5 sm:p-7">
							<div className="min-w-0">
								<p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
									{text(
										language,
										`Chapter ${selectedChapter + 1} of ${chapters.length}`,
										`Chapitre ${selectedChapter + 1} sur ${chapters.length}`,
									)}
								</p>
								<h2 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
									{chapter.title.split(" · ")[1]}
								</h2>
								<p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
									{chapter.strapline}
								</p>
							</div>
							<div className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
								<span className="font-mono text-foreground">
									{chapter.sections.length}
								</span>
								<span className="ml-2 text-muted-foreground">
									{text(language, "topics", "notions")}
								</span>
							</div>
						</div>
						<div className="h-1 bg-border" aria-hidden="true">
							<div
								className="h-full bg-primary"
								style={{
									width: `${((selectedChapter + 1) / chapters.length) * 100}%`,
								}}
							/>
						</div>
					</section>

					<div className="mt-5 space-y-5">
						{chapter.sections.map((section, index) => (
							<article
								key={section.title}
								id={`chapter-${selectedChapter + 1}-section-${index + 1}`}
								className="scroll-mt-6 rounded-2xl border border-border bg-background p-5 sm:p-7"
							>
								<div className="flex items-start gap-3">
									<span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted font-mono text-xs text-muted-foreground">
										{String(index + 1).padStart(2, "0")}
									</span>
									<div className="min-w-0">
										<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
											{text(
												language,
												`Topic ${selectedChapter + 1}.${index + 1}`,
												`Notion ${selectedChapter + 1}.${index + 1}`,
											)}
										</p>
										<h3 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
											{section.title}
										</h3>
									</div>
								</div>
								<p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
									{section.intro}
								</p>
								{section.formulas && (
									<div className="mt-5">
										<div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
											<h4 className="text-xs font-semibold uppercase tracking-wide">
												{text(
													language,
													"Key ideas & formulas",
													"Repères & formules",
												)}
											</h4>
											<p className="text-[11px] text-muted-foreground">
												{text(
													language,
													"Definitions · rules · complexity",
													"Définitions · règles · complexité",
												)}
											</p>
										</div>
										<ul className="grid gap-2 sm:grid-cols-2">
											{section.formulas.map((formula, formulaIndex) => {
												const notation = isMathematicalNotation(formula);
												return (
													<li
														key={formula}
														className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-muted/20 p-3"
													>
														<span className="mt-px font-mono text-[10px] text-muted-foreground">
															{String(formulaIndex + 1).padStart(2, "0")}
														</span>
														<p
															className={`min-w-0 [overflow-wrap:anywhere] text-sm leading-6 ${notation ? "font-mono text-[12px] sm:text-[13px]" : "text-foreground"}`}
														>
															{formula}
														</p>
													</li>
												);
											})}
										</ul>
									</div>
								)}
								{section.example && (
									<aside className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
										<h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground">
											<span
												className="grid size-6 place-items-center rounded-md bg-primary/10 font-mono text-primary"
												aria-hidden="true"
											>
												=
											</span>
											{text(language, "Worked example", "Exemple résolu")}
										</h4>
										<p className="mt-3 text-sm leading-7 text-foreground">
											{section.example}
										</p>
									</aside>
								)}
								{section.note && (
									<aside className="mt-4 rounded-lg border-l-2 border-border bg-muted/20 px-4 py-3">
										<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
											{text(language, "Remember", "À retenir")}
										</p>
										<p className="mt-1 text-sm leading-6 text-muted-foreground">
											{section.note}
										</p>
									</aside>
								)}
							</article>
						))}
					</div>

					<nav
						aria-label={text(
							language,
							"Chapter navigation",
							"Navigation des chapitres",
						)}
						className="mt-6 flex justify-between gap-3 border-t border-border pt-5"
					>
						<button
							type="button"
							disabled={selectedChapter === 0}
							onClick={() => changeChapter(selectedChapter - 1)}
							className="min-h-11 rounded-lg border border-border px-4 text-left text-sm hover:bg-muted disabled:invisible"
						>
							<span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
								← {text(language, "Previous", "Précédent")}
							</span>
							<span className="mt-1 block font-medium">
								{chapters[selectedChapter - 1]?.title.split(" · ")[1]}
							</span>
						</button>
						<button
							type="button"
							disabled={selectedChapter === chapters.length - 1}
							onClick={() => changeChapter(selectedChapter + 1)}
							className="min-h-11 rounded-lg border border-border px-4 text-right text-sm hover:bg-muted disabled:invisible"
						>
							<span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
								{text(language, "Next", "Suivant")} →
							</span>
							<span className="mt-1 block font-medium">
								{chapters[selectedChapter + 1]?.title.split(" · ")[1]}
							</span>
						</button>
					</nav>
				</div>
			</div>
		</main>
	);
}

function isMathematicalNotation(value: string) {
	return /[=⇔→←≤≥⊆ΣΘΩℝ∞∅]|\b(?:O|Ω|Θ)\(/.test(value);
}
