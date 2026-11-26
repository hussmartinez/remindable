# Remindable: Logic, Reasoning & Cognitive Exercise Catalog

_Last updated: 2026-10-07. Companion to [RESEARCH-AND-DESIGN.md](./RESEARCH-AND-DESIGN.md)._

**Scope.** This document proposes **new** exercises for reasoning, executive function, working memory, attention, visuospatial skills, semantic language, everyday function and strategy (metacognition). It sits next to the games already built (Memory Vault, Word Garden, Quick Eye, Story Thread, Move & Think, Remember-to-Remember) and the planned ones (Focus Lanes, Melody Echo, Language Switch).

**Reading guide.** Section 0 covers the cross-cutting evidence: transfer, dose, adaptivity, variety and engagement. Section 1 summarizes each domain. Section 2 is the catalog. Section 3 gives the build order and how games rotate in a session.

All levels follow the existing engine: `level 1–10`, `nextLevel()` keeps success near **80% (Keep Sharp)** or **90% (Rebuild)** (`src/engine/adaptive.ts`).

---

## 0. Cross-cutting evidence: what transfers, how much, how to keep people engaged

| Question | What the literature says | Design consequence |
|---|---|---|
| **Does training transfer?** | Near transfer is reliable. Far transfer is small or zero once you control for placebo effects and publication bias ([Sala et al. 2019, second-order meta-analysis](https://pure.fujita-hu.ac.jp/en/publications/near-and-far-transfer-in-cognitive-training-a-second-order-meta-a/); [Melby-Lervåg et al., WM training and far transfer](https://ora.ox.ac.uk/objects/uuid:daa9a729-f17b-4e45-97c0-cff5075ea404)). Cochrane: little evidence that ≥12 weeks of computerized training improves cognition in **healthy** older adults; evidence certainty is low ([Gates et al. 2020, CD012277](https://pmc.ncbi.nlm.nih.gov/articles/PMC7045394)). In **MCI**, the pooled effect on global cognition is moderate, g≈0.35 ([Hill et al. 2017](https://psychiatryonline.org/doi/abs/10.1176/appi.ajp.2016.16030360)). | Train skills that **look like daily life** (pills, money, schedules, conversations). Then even "near" transfer is useful transfer. Make no far-transfer claims. |
| **Single vs multi-domain** | Across 215 RCTs, **multicomponent** training beat single-component training for near transfer, far transfer and everyday function (near g=0.37, far g=0.22) ([Basak et al. 2020, Psychol Aging](https://pmc.ncbi.nlm.nih.gov/articles/PMC7050567/)). | Rotate domains within each week. No single game should take more than about 30% of weekly time, except the anchor game. |
| **Reasoning specifically** | ACTIVE reasoning training (series completion) kept its effect on reasoning at **10 years** (ES 0.23). Trained users reported less IADL difficulty (ES 0.38) ([Rebok et al. 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4055506/)). Boosters added about half the original training effect, and adherence predicted the size of the gain ([Willis & Caskie 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3882330)). At 20 years, reasoning and memory training did **not** reduce dementia diagnoses; only speed training with boosters did ([UAB 2026](https://www.dpo.uab.edu/news/research-innovation/study-shows-brain-training-can-reduce-alzheimers-and-dementia-risk-by-25-percent); [BrainHQ release](https://www.brainhq.com/news/press-releases/first-intervention-shown-to-lower-alzheimers-and-dementia-incidence/)). | Reasoning games are worth building for **function and durable ability**, not as dementia prevention. Quick Eye stays the Keep Sharp anchor. Reasoning games get booster blocks too. |
| **Speed generalizes to function** | IHAMS: speed training improved UFOV, Trails A/B, SDMT and Stroop. With boosters, it reduced new IADL difficulties ([Wolinsky et al., IHAMS](https://cambridge.org/core/journals/international-psychogeriatrics/article/effects-of-cognitive-speed-of-processing-training-on-a-composite-neuropsychological-outcome-results-at-oneyear-from-the-ihams-randomized-controlled-trial/E0295C85DBBF3CB033A4C47D538AA24D)). In SKILL, MCI participants improved on Timed IADL ([Edwards et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC3689869)). | No change to Quick Eye's role. Optional **untimed** versions of new games for Rebuild only. |
| **Dose and supervision** | Healthy older adults: small overall effect (g=0.22). **Home-based, unsupervised** training was ineffective for global cognition. Sessions under 30 min had weak evidence ([Lampit et al. 2014, PLOS Med](https://pmc.ncbi.nlm.nih.gov/articles/PMC4236041)); see also the 2020 network meta-analysis of 90 RCTs ([Lampit et al., medRxiv](https://www.medrxiv.org/content/10.1101/2020.10.07.20208306v1)). U.S. POINTER: BrainHQ at least 3×/week for 15–20 min, **inside a coached, structured program** ([UC Davis](https://health.ucdavis.edu/news/headlines/us-pointer-study-shows-lifestyle-program-improves-cognition-in-older-adults/2025/07); [BrainHQ](https://www.brainhq.com/better-brain-health/article/brain-news/new-research-shows-how-to-change-trajectory-of-cognitive-decline/)). INCOG: computer training after TBI should be **therapist-guided** ([INCOG 2.0 memory](https://digitalcommons.chapman.edu/comm_science_articles/25)). | Aim for at least 50–60 min/week (5 × 10–12 min) plus an optional "one more round". **Structure stands in for supervision**: a fixed plan, buddy pings, and a weekly summary that a clinician or family member can read. |
| **Adherence and engagement** | In FINGER, 63% of participants started computerized training, but only **12% completed every session**. Prior computer use was the main predictor of adherence ([Turunen et al. 2019](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6620011/)). Gamification raises motivation (g=0.72) without harming training effects ([Vermeir et al. 2020](https://games.jmir.org/2020/3/e18644)). | Use a simple, consistent interaction grammar (tap a big card), the same across all games. Add light rewards such as the garden and streaks, with **no leaderboards**. |
| **Anxiety, stereotype threat, frustration** | Older adults' memory and cognitive scores drop when a situation evokes negative age stereotypes ([Lamont et al. 2015 meta-analysis](https://kar.kent.ac.uk/46931)). Errorless learning helps people with memory impairment; error-based learning generalizes better when awareness is intact ([errorless learning in TBI](https://pmc.ncbi.nlm.nih.gov/articles/PMC4228339)). | Frame everything as **"practice"**, never "test". Never mention age or decline. After 2 misses in a row, give a hint; after 3, demonstrate the answer and step down a level. Rebuild: no countdown timers, ever. Keep Sharp: timers only in Quick Eye and as an **opt-in** "challenge" on 2–3 games. |

---

## 1. Evidence summary by domain

### 1.1 Reasoning and logic
- **Inductive reasoning (series completion)** has the strongest trial record of any reasoning task. It was ACTIVE's reasoning arm (letter, number and word series, with strategies like "find the pattern, check it, apply it"), and the effects lasted 10 years ([Rebok 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4055506/); [Willis 2013 training details](https://sls.psychiatry.uw.edu/wp-content/uploads/2020/03/Willis-2013-Reasoning-training.pdf)). Reasoning in older adults shows substantial **reserve capacity**. In ACTIVE, age (65–90) and gender did not predict who benefited from training ([Willis & Caskie 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3882330)). ACTIVE also measured "everyday problem solving": reading medication labels, charts and forms. That is a direct template for ecological reasoning tasks.
- **Matrix reasoning (Raven-like)** and **analogies** are standard fluid-reasoning items. Reasoning training produced gains in fluid intelligence (meta-analytic d≈0.6, mostly younger samples) ([inductive reasoning training review](https://econtent.hogrefe.com/doi/10.1024/1010-0652/a000123)). In older adults, expect near transfer, so present these as fresh puzzles rather than "IQ boosters".
- **Planning (Tower of London/Hanoi)** is sensitive to TBI ([4-disk ToL in TBI](https://research.polyu.edu.hk/en/publications/planning-ability-following-moderate-to-severe-traumatic-brain-inj/)). Training it in isolation has weak transfer. Its value comes when paired with a **"plan first, then move" metacognitive step**, as in GMT-style training ([metacognitive training in TBI, NCT00857207](https://clinicaltrials.gov/study/NCT00857207)).
- **Script ordering / sequencing everyday tasks** maps onto INCOG's call for **functional, contextualized** practice. It suits Rebuild users with planning and sequencing problems.
- **Sudoku / logic grids**: there are no RCTs of these as training. Use them as "deduction" variants (small 4×4 shape sudoku, simple constraint scheduling), not as a core claim.

### 1.2 Executive function (switching, inhibition, updating, flexibility)
- An earlier meta-analysis found EF/WM training in older adults gives near transfer and smaller far transfer ([Karbach & Verhaeghen 2014, via review](https://pmc.ncbi.nlm.nih.gov/articles/PMC5362725)). Later re-analyses find far transfer is not reliable.
- **Inhibition:** in a 2023 meta-analysis, training improved Stroop performance but not Go/No-Go, and cognitive flexibility did not improve ([Olegário et al. 2023](https://eupercebo.unb.br/wp-content/uploads/2023/10/Olegario-et-al.-2023.pdf)). Stroop/flanker/spatial-conflict tasks are cheap to build and language-independent. Expect task-specific gains.
- **Task switching:** gains are robust on the trained switch and mixing costs, with little generalization ([Karbach & Kray 2009](https://Www.Gwern.net/doc/dual-n-back/2009-karbach.pdf); [Frontiers review](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2017.00069/full)). Variable training (switching between several rules) transfers better than fixed rules.
- **Updating / n-back:** this is the most contested paradigm. N-back gives large gains on the trained task and **no transfer**. In brain injury, even the trained-task gains were small: SMD 0.5–1.1 vs 3.3–6.1 in healthy controls ([Lindeløv et al. 2017](https://www.Gwern.net/doc/dual-n-back/2016-lindelov.pdf)). n-back is also aversive for many older users. **Recommendation: do not build a classic n-back.** Use a gentler, ecologically framed updating task ("Keep Track") instead.
- **Metacognitive strategy instruction** (problem solving, planning, self-monitoring with feedback) has **Level A** support for TBI in INCOG 2.0 ([INCOG 2.0 Part III, Executive Functions](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/8ba6ea6c-1191-ed11-8141-005056834e2b); [Wolters Kluwer summary](https://www.wolterskluwer.com/en/news/updated-guidelines-on-cognitive-rehabilitation-after-traumatic-brain-injury)).

### 1.3 Working memory
- Lampit 2014 found **no evidence for WM-only training** in healthy older adults ([PLOS Med](https://pmc.ncbi.nlm.nih.gov/articles/PMC4236041)).
- **Cogmed in acquired brain injury:** one small RCT (n=21) reported gains in WM and self-rated occupational performance (Lundqvist et al. 2010; see also [Westerberg et al. 2007](https://pubmed.ncbi.nlm.nih.gov/17624476)). However, the outcome tasks overlapped with the training tasks, so transfer is uncertain. Pediatric TBI trials are ongoing ([REPeaT protocol](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6247519/)).
- **Design takeaway:** forward/backward span (Corsi, digits) is useful mostly as a **vehicle for strategy practice** (chunking, rehearsal, visual imagery) and as a progress signal. It should not be sold as a cure.

### 1.4 Attention (APT hierarchy, search, cancellation)
- INCOG 2.0 Part II (Attention and Processing Speed) supports **metacognitive strategy training embedded in functional everyday activities** and **dual-task training**. It finds **insufficient evidence for practice on decontextualized computer tasks** alone ([INCOG 2.0 attention, Ponsford et al. 2023](https://research.monash.edu/en/publications/incog-20-guidelines-for-cognitive-rehabilitation-following-trauma-3/); [summary](https://knowledgebank.epworth.org.au/epworthjspui/handle/11434/45)).
- APT shows positive results in most TBI RCTs (see the main research doc).
- **Implication:** attention games (Focus Lanes, Find & Tick) should include a **strategy layer**: "scan row by row", "say the target to yourself", plus brief self-rating. Attention should also be practiced inside everyday contexts (pill box, shopping).

### 1.5 Visuospatial
- **Route learning** in 70–90-year-olds in residential care beat an active control on route tasks at 3 months, with **transfer to visuospatial span** ([Lopez/route training RCT, PMC6050286](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6050286/)). Older adults learn better from a **fixed aerial (map) view** than from first-person or rotating views, and **highlighted landmarks** help ([same source](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6050286/); [Frontiers 2020](https://www.frontiersin.org/articles/10.3389/fnhum.2020.00005/pdf)).
- Mental rotation and pattern copying are standard items in multidomain suites (HappyNeuron, NeuronUP, RehaCom "spatial operations"). Evidence is mostly near-transfer. They add variety, and variety itself is supported by the multicomponent finding.

### 1.6 Semantic / language beyond naming
- **Verbal fluency** taps semantic memory and executive search. In MCI the semantic network is relatively preserved, but **retrieval/switching efficiency** is reduced ([Alzheimer's & Dementia: DADM 2025](https://doaj.org/article/6fdcf96c7a434762aba91830b89c795e)). That argues for practicing **cued, structured category search**: subcategories and clustering strategies.
- Categorization and "which doesn't belong" reuse SFA logic (features: category, use, location). This reinforces Word Garden.
- **Sentence completion / cloze** targets word retrieval in context. It is used in anomia and cognitive-communication therapy, and its context differs from single-picture naming.
- **Cognitive stimulation** (themed discussion, categorization, word games) gives small, clinically meaningful benefits in mild-to-moderate dementia (MMSE +1.99) ([Cochrane, Woods et al. 2023](https://www.cochrane.org/podcasts/10.1002/14651858.CD005562.pub3)). This supports "stimulation" style semantic games even for users who decline further.

### 1.7 Everyday-function / ecologically valid tasks
- The strongest generalization in TBI rehab comes from training **the actual skill in context**. INCOG recommends that memory and EF instruction consider functional and contextual needs, and that **external aids** (smartphone reminders) be the primary strategy for severe impairment ([INCOG 2.0 memory](https://digitalcommons.chapman.edu/comm_science_articles/25)).
- In older adults, 6 of 13 trials showed significant IADL change after cognitive training ([systematic review, PMC6787728](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6787728/)). VR/simulated IADL training improves ADL/IADL in MCI/AD.
- **Implication:** simulated pill boxes, money and change, shopping lists, calendars and recipes are the highest-value new content for **both** profiles. They also double as reasoning practice (ACTIVE's everyday problems used the same materials).

### 1.8 Metacognition and strategy training
- **TBI:** metacognitive strategy instruction and self-monitoring with feedback are **Level A** in INCOG 2.0. Internal memory strategies (visualization, association, chunking) are recommended for mild-to-moderate impairment, taught with **error-constraining** instruction ([INCOG 2.0 EF](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/8ba6ea6c-1191-ed11-8141-005056834e2b); [INCOG 2.0 memory](https://digitalcommons.chapman.edu/comm_science_articles/25)).
- **Older adults:** memory strategy training gives a moderate effect on episodic memory (d≈0.31). The method of loci helps, but only about 25% of older adults keep using it, and **semantically congruent** loci work better ([method of loci in aging, JINS](https://resolve.cambridge.org/core/journals/journal-of-the-international-neuropsychological-society/article/abs/method-of-loci-and-semantic-link-assessment-of-memory-benefits-in-healthy-aging/5B00D9E9365D7D0E709F82378B552D0C); [PMC3955885](https://pmc.ncbi.nlm.nih.gov/articles/PMC3955885)). ACTIVE's memory arm taught exactly these mnemonics. Its memory-test effect faded by 10 years, but IADL benefit persisted (ES 0.48) ([Rebok 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4055506/)).
- **Implication:** teach **one strategy at a time** in 60-second micro-lessons. Apply it immediately in a game, ask the user to **predict their score** before and **reflect** after (calibration), and offer the strategy as a hint in later games.

---

## 2. Proposed new exercises (18)

Conventions:
- **KS** = Keep Sharp, **RB** = Rebuild.
- **Complexity** is for React Native/Expo plus react-native-web:
  - **S** = 1–3 days. Card/grid UI only, reuses `Choices.tsx`.
  - **M** = about 1 week. Needs a procedural generator or SVG.
  - **L** = 2+ weeks. Needs a content pipeline, a constraint solver or ASR.
- Every game uses tap-only input with ≥56pt targets, one question per screen, TTS for instructions, and the "hint, not red ✗" feedback rule.
- In RB, every game is untimed and starts at a level where the answer is nearly certain.

### 2.1 Pattern Path — *Camino de patrones* — *دَرب الأنماط*
- **Domain:** Inductive reasoning (series completion).
- **Evidence:** ACTIVE reasoning arm, with effects at 10 years and booster effects ([Rebok 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4055506/); [Willis & Caskie 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3882330)).
- **Mechanic:** A row of 4–7 tiles (shapes, colors, dot counts, or emoji objects) with a "?" at the end. Below it are 3–4 large answer cards. The user taps one. A correct answer animates the tile into place, and a voice says the rule ("Big, small, big, small").
  - Every 5th item, a **"Why?"** card asks the user to tap the rule from 2–3 rule cards with pictures. This is the strategy step ACTIVE taught: *find, check, apply*.
- **Adaptive levels:**
  - L1–2: one attribute, period 2 (AB AB).
  - L3–4: period 3 (ABC), or simple +1 counts.
  - L5–6: two attributes changing together (color + size).
  - L7–8: increment series (1, 3, 5 dots), interleaved series (A1 B2 A3 B4), or mirror patterns.
  - L9–10: two independent rules, more distractors that share one attribute with the answer.
  - Distractor similarity also rises with level.
- **KS vs RB:**
  - KS: 4 options, rule-reveal only after an answer.
  - RB: 2–3 options, and the series is **read aloud** while tiles highlight one by one. After one miss, the rule is shown and the item repeated (errorless).
- **Localization:** Use shapes, colors and dots, so it is language-free. **Series direction follows reading direction**: right-to-left in Arabic, so the "?" tile sits on the left. Number series can show Western or Eastern Arabic digits (٠١٢٣) per setting. Letter series (ACTIVE-style) are an optional KS mode built per alphabet (Latin; Arabic letters in alphabetical *abjadī/hijā'ī* order).
- **Complexity:** **S** (procedural generator plus `Choices`).

### 2.2 Missing Tile — *La pieza que falta* — *القطعة الناقصة*
- **Domain:** Matrix reasoning (Raven-like), deduction.
- **Evidence:** Fluid-reasoning items; reasoning reserve capacity in aging ([Willis & Caskie 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3882330); [inductive reasoning meta-analysis](https://econtent.hogrefe.com/doi/10.1024/1010-0652/a000123)).
- **Mechanic:** A 2×2 or 3×3 grid with one empty cell and 4 candidate tiles underneath. Tap a tile to fill the cell.
  - Upper-level variant: **"Shape Sudoku 4×4"**. Each row and column must contain each of 4 shapes once. Tap an empty cell, then tap a shape.
- **Adaptive levels:**
  - L1–2: 2×2, one attribute changes across rows.
  - L3–4: 2×2, attributes change on both axes.
  - L5–6: 3×3, row rule only.
  - L7–8: 3×3, row and column rules.
  - L9–10: 3×3 with addition/subtraction of parts (overlay logic), or 4×4 shape sudoku with 6–8 givens.
  - Distractor similarity rises with level.
- **KS vs RB:**
  - KS: standard.
  - RB: stays at 2×2 longer. The row rule is narrated ("Each row: circle, then square"). After a miss, the matching row highlights.
- **Localization:** Language-free. Mirror column logic in RTL (or keep the grid symmetric).
- **Complexity:** **M** (SVG tile generator with attribute composition).

### 2.3 Odd One Out & Links — *¿Cuál sobra? / Parejas que se parecen* — *أيُّها لا ينتمي؟*
- **Domain:** Semantic reasoning, categorization, analogies.
- **Evidence:** Semantic-feature (SFA) logic and categorization in cognitive stimulation ([Cochrane CST 2023](https://www.cochrane.org/podcasts/10.1002/14651858.CD005562.pub3)); analogical reasoning as fluid reasoning.
- **Mechanic:**
  - **Mode A (L1–6), odd one out:** 4 picture cards (from `concepts.ts`); tap the one that doesn't belong. Feedback names the shared feature: "Apple, banana, pear are fruit. The hammer is a tool."
  - **Mode B (L6–10), picture analogies:** "Bird → nest, as Bee → ?" with 3 picture choices (hive, flower, honey).
- **Adaptive levels:**
  - Categories go from broad and perceptual (color) to taxonomic (fruit vs tool) to subcategories (sea animals vs farm animals) to functional/thematic (things for the kitchen) to abstract (things that are cold).
  - Analogy relations go from part–whole to object–location to function to cause–effect.
  - The number of cards rises from 3 to 5.
- **KS vs RB:**
  - KS: 4–5 cards, thematic and abstract categories.
  - RB: 3 cards, taxonomic only. Each card can be tapped and held to **hear its name** (word-finding support). After a miss, a "feature hint" appears (what is it used for? where is it found?), which reuses Word Garden's semantic cue rung.
- **Localization:** Picture-based. Concepts already carry es/en/ar labels. Cultural check needed: avoid items that categorize differently by culture (pork, alcohol, holiday objects).
- **Complexity:** **S** (content tagging: add a `category`/`relations` field to concepts).

### 2.4 Step by Step — *Paso a paso* — *خطوة بخطوة*
- **Domain:** Sequencing everyday scripts (planning / EF), discourse order.
- **Evidence:** INCOG preference for functional, contextual training; script and sequencing work in TBI rehab ([INCOG 2.0 EF](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/8ba6ea6c-1191-ed11-8141-005056834e2b)); ACTIVE everyday problem solving.
- **Mechanic:** 3–6 shuffled picture cards of an everyday task (making tea, posting a letter, taking a pill with water, washing hands). Empty numbered slots sit above them. The user **taps cards in order**: tap-to-place, no dragging. Each placed card says its step aloud. At higher levels, one card is an **intruder step** to discard ("put on swimsuit" in "make tea").
- **Adaptive levels:**
  - Number of steps: 3, then 4, then 5, then 6.
  - Then add an intruder card.
  - Then add a **missing step** to choose from options ("What's missing between 'fill kettle' and 'pour water'?").
  - Then add **two interleaved scripts** (make tea while toast is in the toaster).
- **KS vs RB:**
  - KS: up to 6 steps plus interleaving.
  - RB: 3–4 steps. The first card is pre-placed. After a misplacement, the card slides back and the correct slot glows (errorless). Optional "practice in real life" prompt.
- **Localization:** Mostly pictures. Step captions use short i18n strings. Scripts should be culturally neutral or localized (tea with mint for the ar locale; mate optional for es-AR). Slot order flows RTL in Arabic.
- **Complexity:** **S/M** (needs about 20 illustrated scripts; OpenMoji compositions can work).

### 2.5 Tower Tidy — *Torre ordenada* — *ترتيب البرج*
- **Domain:** Planning (Tower of London).
- **Evidence:** ToL is a standard planning measure that is sensitive to TBI ([4-disk ToL](https://research.polyu.edu.hk/en/publications/planning-ability-following-moderate-to-severe-traumatic-brain-inj/)). Paired with a GMT-style "stop and plan" step, per INCOG metacognitive recommendations.
- **Mechanic:** Three pegs with colored balls. A small "goal picture" sits above. Tap a ball to lift it, then tap a peg to drop it.
  - **Before the first move, a "Plan" card asks: "How many moves do you think?" (choose 2–7).**
  - After solving, the user sees "You planned 4, you used 5. Perfect would be 4." This gives self-monitoring feedback.
- **Adaptive levels:**
  - Minimum moves: 2, then 3, 4, 5, 6, 7.
  - Ball count: 3, then 4.
  - Peg capacity constraints.
  - At top levels, "subgoal" puzzles where the obvious first move is wrong.
- **KS vs RB:**
  - KS: no move limit, but a "gold" badge for minimum moves.
  - RB: 2–3-move puzzles. Unlimited undo. A "show me the first move" hint is always available. The plan step uses pictures, not numbers.
- **Localization:** Language-free.
- **Complexity:** **M** (state machine plus BFS solver for minimum moves, about 200 lines).

### 2.6 Plan My Day — *Organiza mi día* — *نظِّم يومي*
- **Domain:** Deduction (logic-grid-lite), calendar planning, prospective memory.
- **Evidence:** ACTIVE everyday problem solving (schedules); INCOG metacognitive planning; ecological transfer argument ([IADL review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6787728/)).
- **Mechanic:** A one-day timeline with 4–6 hour slots (morning, noon, afternoon). The user sees 2–4 errand cards (doctor 🩺, pharmacy 💊, lunch with friend 🍽️, bank 🏦) and 1–3 constraint cards read aloud ("Doctor is at 10." "Pharmacy closes at 1." "Get the prescription **after** the doctor."). The user taps an errand, then a slot. A "Check my plan" button highlights any violated constraint with a gentle explanation.
- **Adaptive levels:**
  - Errands: 2, then 3, 4, 5.
  - Constraint types: fixed time, then before/after, then opening hours, then travel (things near each other go together), then conflicts that require choosing what to drop.
  - At top levels: plan a **week** across 3 days.
- **KS vs RB:**
  - KS: up to 5 errands and 3 constraints.
  - RB: 2–3 errands, one constraint at a time, constraints shown as icons on the timeline. The game ends with "Want to add a real reminder?", which links to phone reminders (INCOG external aids).
- **Localization:** Time format 12/24h per locale; Arabic RTL timeline; constraint sentences via i18n templates with slot variables.
- **Complexity:** **L** (constraint generator and validator, timeline UI).

### 2.7 Pill Box — *El pastillero* — *علبة الدواء*
- **Domain:** Everyday reasoning, attention to detail, prospective memory.
- **Evidence:** ACTIVE everyday-problem measures used medication labels ([Rebok 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4055506/)); INCOG functional training and errorless instruction.
- **Mechanic:**
  1. A simple **prescription card** with pill icons and plain rules ("Blue pill: morning and night." "White pill: with lunch." "Yellow: Monday, Wednesday, Friday only").
  2. Below it, a **weekly pill organizer** grid (days × morning/noon/night). The user taps a pill, then taps the compartments.
  3. Question mode: "It's Wednesday noon. Which pills?"
- **Adaptive levels:**
  - Pills: 1, then 2, 3, 4.
  - Rule complexity: daily, then twice daily, then specific days, then "every other day", then "with food", then a **change instruction** ("Doctor says: stop the yellow from Thursday").
  - Grid size: one day, then 3 days, then a full week.
  - At top levels, the prescription card is **hidden** after study (memory load).
- **KS vs RB:**
  - KS: full week plus rule changes.
  - RB: one day, 1–2 pills, the prescription stays visible, and a wrong compartment pulses with the correct one.
- **Localization:** Icons and colors. Use generic pill names, never real drugs. Day names and week start (Sat/Sun/Mon) per locale.
- **Claims note:** This is practice only. Show a clear "This is practice, not medical advice" line.
- **Complexity:** **M**.

### 2.8 Market Run — *De compras* — *جولة في السوق*
- **Domain:** Money handling, working memory (shopping list), arithmetic reasoning.
- **Evidence:** IADL-focused training; ecological validity ([IADL review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6787728/)); ACTIVE IADL outcomes.
- **Mechanic:**
  - **Phase 1 (list):** see a shopping list of 2–6 pictured items for a few seconds (KS) or as long as needed (RB).
  - **Phase 2 (shop):** a market shelf grid of 9–16 items; tap the ones on the list.
  - **Phase 3 (pay):** a price total is shown. Tap coins and notes from a wallet to pay, then answer "How much change?" from 3 options.
- **Adaptive levels:**
  - List length: 2, then 6.
  - Shelf distractors: similar items such as green apple vs red apple.
  - Prices: whole units, then cents, then adding 3 prices.
  - Pay exact, then pay with change.
  - Top levels add a budget constraint ("You have 10; what can you NOT buy?").
- **KS vs RB:**
  - KS: list hidden during shopping. Change calculation.
  - RB: list visible as a checklist (an external aid, which mirrors the strategy we want them to use in real life). Exact payment only. A "count together" hint.
- **Localization:** **Currency per locale or user setting** (EUR, USD, MXN, MAD, AED, EGP…) with real coin and note images or neutral drawings. Decimal separator per locale. Price formatting via `Intl.NumberFormat`.
- **Complexity:** **M** (coin and note assets per currency is the main cost).

### 2.9 Sort Switch — *Cambia y clasifica* — *صنِّف وبدِّل*
- **Domain:** Task switching / cognitive flexibility.
- **Evidence:** Switch-training gains on trained switch costs in older adults; variable rules generalize better ([Karbach & Kray 2009](https://Www.Gwern.net/doc/dual-n-back/2009-karbach.pdf); [review](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2017.00069/full)).
- **Mechanic:** One card appears (e.g. a red fish). Two big bins sit below. A **cue banner** at the top shows which rule is active, as an icon: 🎨 *color* (red bin / blue bin) or 🔷 *shape/kind* (animal bin / object bin). The user taps a bin. The rule changes predictably (every 4 cards), then unpredictably at higher levels.
  - This differs from planned **Language Switch**, which switches the *response language*. Sort Switch switches *perceptual rules*.
- **Adaptive levels:**
  - Single rule (no switching).
  - Then predictable switch every N cards.
  - Then random switches.
  - Then 3 rules (color, shape, size).
  - Then the cue shows briefly and disappears (KS).
  - Top level: **hidden-rule** discovery (WCST-lite). Feedback tells you if you are right, and you infer the rule.
- **KS vs RB:**
  - KS: optional speed challenge.
  - RB: self-paced; the cue is always visible and is **spoken** at every switch ("Now sort by COLOR"). No hidden-rule levels.
- **Localization:** Language-free (icon cues).
- **Complexity:** **S**.

### 2.10 Arrow Wise — *Flechas listas* — *انتبه للسهم*
- **Domain:** Inhibition / interference control (flanker plus spatial Stroop).
- **Evidence:** Stroop-type inhibition improves with training; Go/No-Go does not ([Olegário 2023](https://eupercebo.unb.br/wp-content/uploads/2023/10/Olegario-et-al.-2023.pdf)). IHAMS speed training also improved Stroop. Here the conflict is spatial, not color-word, to avoid reading demands.
- **Mechanic:** A central arrow (or fish) points left or right, flanked by arrows that are congruent or incongruent. Two giant buttons sit at the bottom: ⬅️ and ➡️. Spatial-Stroop variant: the arrow appears **on the opposite side** of where it points. Tap the direction it **points**, not where it is.
- **Adaptive levels:**
  - Neutral flankers, then congruent/incongruent at 25% incongruent, then 50%.
  - Then spatial-Stroop trials.
  - Then a reverse rule ("tap where it *isn't* pointing" when the arrow is red), which combines inhibition and switching.
  - KS only: a response window shrinks via a Quick-Eye-like staircase, as an opt-in challenge.
- **KS vs RB:**
  - KS: opt-in timing.
  - RB: no timing; accuracy only. Flankers fade in after the target (a gentler conflict). Max 50% incongruent.
- **Localization:** **Important: arrows must NOT be auto-mirrored in RTL.** Use explicit `transform` and `I18nManager`-independent rendering, and keep the button order physical (left = left). Verbal labels are optional.
- **Complexity:** **S**.

### 2.11 Light Path — *Camino de luces* — *دَرب الأضواء*
- **Domain:** Visuospatial working memory (Corsi span), with a pattern-copy mode.
- **Evidence:** Standard span paradigm; visuospatial span improved after route training in 70–90-year-olds ([PMC6050286](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6050286/)). Cogmed's core tasks are of this type; evidence for transfer is weak ([Westerberg 2007 / Lundqvist 2010](https://pubmed.ncbi.nlm.nih.gov/17624476); [Lampit 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4236041)). The value here is strategy practice.
- **Mechanic:**
  - **Sequence mode:** 9 large tiles in an irregular layout light up one by one with a soft tone. The user taps them in the same order.
  - **Picture mode (Mosaic):** a pattern of 3–8 lit cells on a 4×4 grid shows, then hides. The user taps to recreate it. In RB, the model can stay visible, which makes it pure **pattern copy**, a visuoconstruction task.
  - **Strategy prompts** appear every few levels: "Try making a shape out of the path (like a letter L)" (chunking/visualization).
- **Adaptive levels:**
  - Span: 2, then 3, up to 7.
  - Then backward recall (KS L6+).
  - Grid: 3×3, then 4×4, then 5×5.
  - Presentation rate goes from slow to standard.
  - Mosaic: from model visible, to brief view, to delay with a distractor.
- **KS vs RB:**
  - KS: backward and delayed modes.
  - RB: span 2–4, forward only. A replay button (unlimited). Mosaic with the model visible at low levels.
- **Localization:** Language-free.
- **Complexity:** **S**.

### 2.12 Keep Track — *Lo último de cada uno* — *تابِع الأحدث*
- **Domain:** Working-memory updating (the replacement for n-back), with a conversation-tracking flavor for RB.
- **Evidence:** Updating is a core EF. n-back shows poor transfer and is especially weak in brain injury ([Lindeløv 2017](https://www.Gwern.net/doc/dual-n-back/2016-lindelov.pdf)). The keep-track task is gentler and maps to "who said what last" in conversations.
- **Mechanic:** 2–4 category "boxes" sit at the top (🍎 fruit, 🐾 animal, 🔧 tool). Pictures appear one at a time in the center, and each drops into its box with a gentle animation. The box closes, so the content is hidden. At the end, the question is "What was the **last** fruit?" with 3 picture choices per box.
  - **RB "conversation" skin:** the boxes are 2–3 people (avatars). Speech bubbles say short phrases about plans ("I'll bring bread"). Question: "What did **Ana** say last?" This bridges to Story Thread.
- **Adaptive levels:**
  - Categories: 1, then 4.
  - Stream length: 4, then 12.
  - Updates per category increase.
  - Similarity between items in the same category increases.
  - Then the question is asked mid-stream.
- **KS vs RB:**
  - KS: 3–4 categories.
  - RB: 1–2 categories, short streams, with a "peek" hint that reopens one box once.
- **Localization:** Pictures, or short i18n phrases for the conversation skin (TTS in es/en/ar).
- **Complexity:** **S**.

### 2.13 Find & Tick — *Busca y marca* — *ابحث وعلِّم*
- **Domain:** Selective and sustained attention (cancellation / visual search), scanning strategy.
- **Evidence:** Cancellation and visual search are APT staples. INCOG says to pair drills with a metacognitive strategy ([INCOG 2.0 attention](https://research.monash.edu/en/publications/incog-20-guidelines-for-cognitive-rehabilitation-following-trauma-3/)).
- **Mechanic:** A target card at the top ("find all 🍐"). A scrollable-free grid of 12–48 items appears. Tapping a target marks it with a ✓. A "Done" button checks the result: missed targets glow softly, and the app says "You found 9 of 10. Try scanning row by row next time."
  - At the start of the session, the user picks a **strategy** ("row by row" or "column by column") and a guide line follows the chosen order. Before starting, the user predicts how many they will find.
- **Adaptive levels:**
  - Grid size: 12, then 48.
  - Target/distractor similarity: different category, then same category, then mirror or rotated look-alikes.
  - Then conjunction search (red **and** round).
  - Then 2 targets at once.
  - Random vs structured layout.
- **KS vs RB:**
  - KS: up to 48, conjunctions.
  - RB: 12–20 items in **ordered rows**, one target type, with the guide line always on.
- **Localization:** Language-free. Scanning guide direction follows reading direction (RTL for Arabic) by default.
- **Complexity:** **S**.
- **Note:** Distinct from planned Focus Lanes (a temporal stream with rule changes). Find & Tick is static spatial search.

### 2.14 Turn It — *Gíralo* — *أدِرها*
- **Domain:** Mental rotation / spatial transformation.
- **Evidence:** A standard visuospatial component in multidomain suites (RehaCom, NeuronUP, HappyNeuron). Supported by the multicomponent advantage ([Basak 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7050567/)), not as a standalone claim.
- **Mechanic:** A reference shape (polyomino, or an everyday object such as a teapot or key) and 3 candidate shapes. "Which one is the same shape, just turned?" One candidate is the **mirror** image.
  - Low-level variant: "Does this key fit the lock?" (rotate-to-fit, with a ⟳ button the user taps to rotate a piece, which supports concrete thinking).
- **Adaptive levels:**
  - Rotation angle: 0–45°, then 90°, then 180°, then arbitrary.
  - Mirror distractors added.
  - Then complex polyominoes (4 to 6 cells).
  - Then 3D-looking blocks.
  - Interactive rotate button at low levels, removed at higher ones.
- **KS vs RB:**
  - KS: no rotate button from L4.
  - RB: rotate button always available; everyday objects first; 2 options.
- **Localization:** Language-free.
- **Complexity:** **M** (SVG shape generation with rotation and reflection).

### 2.15 Walk Home — *Camino a casa* — *طريق البيت*
- **Domain:** Route / map memory, spatial navigation.
- **Evidence:** Route-learning RCT in 70–90-year-olds: gains held at 3 months, with transfer to visuospatial span. Older adults learn best from a **fixed aerial view with highlighted landmarks** ([PMC6050286](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6050286/); [Frontiers 2020](https://www.frontiersin.org/articles/10.3389/fnhum.2020.00005/pdf)).
- **Mechanic:** A simple top-down town map (a street grid with landmark icons: bakery, fountain, mosque/church-neutral "tower", park). A walker animates a route from 🏠 to a destination, highlighting landmarks it passes. The map then resets, and the user **taps intersections in order** to retrace the route. Question variants: "What did you pass after the bakery?", or "Find the way back" (reverse route).
- **Adaptive levels:**
  - Turns: 2, then 7.
  - Landmarks shown on the route, then only at turns, then removed (KS top levels).
  - Grid size increases.
  - Reverse-route recall.
  - Then a delay with another game in between (pairs well with a vault-later style slot).
- **KS vs RB:**
  - KS: up to 7 turns, landmark-free levels.
  - RB: 2–3 turns, landmarks at every turn. A "replay walk" button. Verbal route description is read aloud ("Left at the bakery").
- **Localization:** Landmarks should be culturally neutral icons. Left/right words via i18n. **Do not mirror the map in RTL** (it is a picture of space).
- **Complexity:** **L** (map generator, path animation, intersection hit-testing).

### 2.16 Word Basket — *Cesta de palabras* — *سلّة الكلمات*
- **Domain:** Semantic verbal fluency, category clustering and switching.
- **Evidence:** Fluency reflects semantic store plus executive search. In MCI, the network is preserved but search is less efficient ([DADM 2025](https://doaj.org/article/6fdcf96c7a434762aba91830b89c795e)). Cognitive stimulation supports word-category games ([Cochrane 2023](https://www.cochrane.org/podcasts/10.1002/14651858.CD005562.pub3)).
- **Mechanic:**
  - **Tap version (default):** the category is "Things in a kitchen". A grid of 16 pictures, 6–10 of which fit. Tap all that belong, say them aloud if you like, and drop them into the basket.
  - **Recall version (KS, L5+):** "Name as many animals as you can." The user says them aloud, with an optional mic. Optional on-device ASR later. Without ASR, the user **self-counts** with a big "+1" button.
  - **Strategy coaching:** "Think of places: farm animals... sea animals... pets." **Sub-category bubbles** appear when the user pauses. This is a clustering strategy.
- **Adaptive levels:**
  - Category breadth: broad (animals), then narrow (birds), then letter-constrained (KS only, per language), then alternating categories (fruit / furniture, a switching fluency).
  - Grid distractors become semantically closer.
- **KS vs RB:**
  - KS: recall version available, with an opt-in 60-second challenge.
  - RB: tap version only. Distractors are clearly different. Each picture's name is spoken when tapped (exposure that supports word-finding).
- **Localization:** Categories are concepts. Letter fluency must be built per language (Arabic root/letter behavior differs; consider omitting letter fluency for Arabic). ASR quality differs by language and dialect, so keep ASR optional.
- **Complexity:** **M** (tap version) / **L** (ASR version).

### 2.17 Finish the Line — *Completa la frase* — *أكمل الجملة*
- **Domain:** Word retrieval in sentence context (cloze), semantic and pragmatic reasoning.
- **Evidence:** Sentence-completion cueing is used in anomia and cognitive-communication therapy, and complements Word Garden's single-picture naming (see the SFA/PCA sources in the main doc). It also targets "losing the thread" by training contextual prediction.
- **Mechanic:** A sentence is read aloud and shown in large text with a blank: "I put the milk back in the ___." There are 3 picture-plus-word answer cards (fridge / oven / book). Higher levels use **idioms and proverbs** per language ("Más vale tarde que ___"; "اللي فات ___") and short **two-sentence inferences** ("Rain started. Ana opened her ___").
- **Adaptive levels:**
  - Sentence constraint goes from high (only one answer fits) to lower.
  - Picture support is removed (word cards only).
  - Then idioms.
  - Then inference.
  - Then "say it before you see options" (generation first, with options shown after 5 s or on tap, in KS).
- **KS vs RB:**
  - KS: generation-first mode, idioms, inference.
  - RB: highly constrained sentences, picture cards, and a cue ladder (first sound, then the word) that reuses Word Garden's cue components.
- **Localization:** **Must be authored per language.** Not translatable 1:1, especially idioms. Start with 60 items × 3 languages, reviewed by native speakers, using MSA plus a common dialect for Arabic idioms.
- **Complexity:** **M** (content-heavy, code-light).

### 2.18 Memory Toolkit — *Caja de trucos* — *أدوات الذاكرة*
- **Domain:** Metacognition / strategy training (chunking, visualization, association, method of loci, "Stop–Think–Check").
- **Evidence:** INCOG 2.0 Level A for metacognitive strategy instruction and self-monitoring in TBI ([EF](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/8ba6ea6c-1191-ed11-8141-005056834e2b); [memory](https://digitalcommons.chapman.edu/comm_science_articles/25)). Memory strategy training in older adults gives d≈0.31. Method of loci works best when semantically congruent ([JINS](https://resolve.cambridge.org/core/journals/journal-of-the-international-neuropsychological-society/article/abs/method-of-loci-and-semantic-link-assessment-of-memory-benefits-in-healthy-aging/5B00D9E9365D7D0E709F82378B552D0C)). ACTIVE memory arm: mnemonic training, with IADL benefit at 10 years ([Rebok 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4055506/)).
- **Mechanic:** One **"tool of the week"**, introduced over 3 short screens:
  1. **Learn (60 s):** an animated example. Chunking: "6 1 8 4 2 9 → 61-84-29". Visualization: "picture a huge banana on your sofa". Loci: "put each shopping item in a room of your home". Stop–Think–Check: before answering, ask "What am I doing? Did I check?"
  2. **Try it:** first **predict** "How many will you remember?" (tap 1–8). Then a short list (pictures or digits) using the tool, and recall by tapping.
  3. **Reflect:** "You predicted 4, you got 6!" plus "Did the trick help?" (👍 / 🤷).
  - Afterwards, the tool appears as an optional **hint button** inside other games: Memory Vault, Market Run, Light Path, Walk Home.
- **Adaptive levels:**
  - Advancement is by **strategy**, not just difficulty: chunking, then visualization, then story linking, then loci (KS), then a mix of strategies.
  - List length: 3, then 10.
  - Loci go from fixed generic rooms to the user's own home rooms (named privately, stored locally).
- **KS vs RB:**
  - KS: loci and story linking.
  - RB: chunking, visualization and **external aids** first (write it down, set a reminder, which mirrors INCOG). Errorless demos. A "Stop–Think–Check" card is offered before every Tower Tidy, Plan My Day and Pill Box.
- **Localization:** Short scripted micro-lessons via i18n. Example lists use concepts. Digit grouping follows locale conventions.
- **Complexity:** **M**.

### Quick reference

| # | Name (EN / ES / AR) | Domain | Lang-free? | KS | RB | Cx |
|---|---|---|---|---|---|---|
| 1 | Pattern Path / Camino de patrones / دَرب الأنماط | Inductive reasoning | Yes | ✓ | ✓ | S |
| 2 | Missing Tile / La pieza que falta / القطعة الناقصة | Matrix reasoning | Yes | ✓ | ✓ (2×2) | M |
| 3 | Odd One Out & Links / ¿Cuál sobra? / أيُّها لا ينتمي؟ | Semantic reasoning, analogies | Pictures | ✓ | ✓ | S |
| 4 | Step by Step / Paso a paso / خطوة بخطوة | Script sequencing | Mostly | ✓ | ✓✓ | S/M |
| 5 | Tower Tidy / Torre ordenada / ترتيب البرج | Planning | Yes | ✓ | ✓ | M |
| 6 | Plan My Day / Organiza mi día / نظِّم يومي | Deduction, scheduling | Templates | ✓✓ | ✓ | L |
| 7 | Pill Box / El pastillero / علبة الدواء | Everyday reasoning | Mostly | ✓✓ | ✓✓ | M |
| 8 | Market Run / De compras / جولة في السوق | Money, WM | Currency per locale | ✓✓ | ✓✓ | M |
| 9 | Sort Switch / Cambia y clasifica / صنِّف وبدِّل | Task switching | Yes | ✓ | ✓ | S |
| 10 | Arrow Wise / Flechas listas / انتبه للسهم | Inhibition | Yes (no RTL mirroring) | ✓ | ✓ | S |
| 11 | Light Path / Camino de luces / دَرب الأضواء | Visuospatial WM, pattern copy | Yes | ✓ | ✓ | S |
| 12 | Keep Track / Lo último de cada uno / تابِع الأحدث | WM updating | Pictures | ✓ | ✓✓ | S |
| 13 | Find & Tick / Busca y marca / ابحث وعلِّم | Selective/sustained attention | Yes | ✓ | ✓ | S |
| 14 | Turn It / Gíralo / أدِرها | Mental rotation | Yes | ✓ | ✓ | M |
| 15 | Walk Home / Camino a casa / طريق البيت | Route memory | Yes | ✓✓ | ✓ | L |
| 16 | Word Basket / Cesta de palabras / سلّة الكلمات | Semantic fluency | Concepts | ✓✓ | ✓ | M/L |
| 17 | Finish the Line / Completa la frase / أكمل الجملة | Contextual word retrieval | **Per-language content** | ✓ | ✓✓ | M |
| 18 | Memory Toolkit / Caja de trucos / أدوات الذاكرة | Metacognition / strategies | Lessons i18n | ✓✓ | ✓✓ | M |

✓✓ = especially high value for that profile.

### Suggested improvements to existing and planned games
- **Quick Eye:** schedule **booster blocks** for reasoning games too, not just speed. ACTIVE reasoning boosters added about 50% of the training effect ([Willis & Caskie 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3882330)).
- **Memory Vault:** add an optional **strategy hint** from Memory Toolkit ("make a picture in your mind"). Add **prediction before recall** for metacognitive calibration.
- **Story Thread:** add a **Keep Track conversation skin** as a warm-up. Add a "summarize in one picture" topic question (gist). In RB, let users **replay one line** as an errorless support.
- **Focus Lanes (planned):** build it as the true APT ladder: sustained, then selective, then **alternating** (rule switch, sharing code with Sort Switch), then **divided** (two streams). Add a strategy self-talk prompt per INCOG.
- **Move & Think:** good evidence base. Reuse Sort Switch and Word Basket categories as its cognitive load.
- **Do not build** a classic n-back (see 1.2).

---

## 3. Build order and session rotation

### 3.1 Recommended build order

**Top 6 (first wave):** chosen for evidence, value to both profiles, low cost, and domain coverage.

1. **Pattern Path** (S). This is the reasoning arm with the best long-term RCT data (ACTIVE). It is language-free and quick to build.
2. **Pill Box** (M). It is the most ecologically valid task, valuable for both profiles, mirrors ACTIVE's everyday-problems outcome, and fits INCOG's functional emphasis.
3. **Memory Toolkit** (M). INCOG Level A. It makes every other game a strategy-practice vehicle and turns drills into transferable skills.
4. **Step by Step** (S/M). Planning and sequencing in everyday scripts. It is especially useful for Rebuild.
5. **Odd One Out & Links** (S). Reuses `concepts.ts` and Word Garden cues, and covers semantic language beyond naming.
6. **Light Path** (S). Covers visuospatial WM and pattern copy at the cheapest cost. It is fully language-free and carries chunking and visualization practice.

**Second wave:** Find & Tick (S), Sort Switch (S), Arrow Wise (S), Keep Track (S), Market Run (M), Tower Tidy (M).

**Third wave:** Missing Tile (M), Turn It (M), Finish the Line (M, content), Word Basket (M), Plan My Day (L), Walk Home (L).

Also complete the planned Focus Lanes, Melody Echo and Language Switch alongside the second wave.

### 3.2 Domain groups for rotation

| Group | Games |
|---|---|
| **A. Speed/Attention** | Quick Eye, Focus Lanes, Find & Tick, Arrow Wise |
| **B. Memory** | Memory Vault (daily), Light Path, Keep Track, Melody Echo, Walk Home |
| **C. Reasoning/EF** | Pattern Path, Missing Tile, Tower Tidy, Sort Switch, Turn It, Language Switch |
| **D. Language** | Word Garden, Story Thread, Odd One Out & Links, Word Basket, Finish the Line |
| **E. Everyday life** | Pill Box, Market Run, Step by Step, Plan My Day |
| **F. Strategy** | Memory Toolkit (lesson day 1 of the week; hint button all week) |
| **Body** | Move & Think (daily) |

### 3.3 Session template (about 10–12 min)

This extends the current `buildPlan()`, adding one slot and keeping the frame:

```
intro → plant intention → vault (2 min) → ANCHOR (2.5 min) → move (1 min)
      → ROTATE-1 (2.5 min) → ROTATE-2 (2 min) → vaultLater → close
```

| Slot | Keep Sharp | Rebuild |
|---|---|---|
| **Anchor** (daily) | Quick Eye (ACTIVE speed, with boosters) | Word Garden (naming) |
| **Rotate-1** | Cycles **C → E → D → C → B** across the week | Cycles **E → D (Story Thread) → E → B → D** |
| **Rotate-2** | Cycles **E → B → A → D → E** | Cycles **C (light: Step by Step / Pattern Path / Sort Switch) → A → C → E → F-apply** |
| **Day 1 of each week** | Rotate-2 = **Memory Toolkit lesson** | Rotate-2 = **Memory Toolkit lesson** |

**Rotation rules for the engine:**
1. **Domain balance:** over any 5 consecutive sessions, each of A–E appears at least once, and no group appears more than 3 times outside the anchor.
2. **No repeats:** the same game never appears in two consecutive sessions, except the anchor and Memory Vault.
3. **Interleave within a game:** each game covers 2–3 levels or variants per session (variable practice), not one long block.
4. **Hard-then-easy:** never put two high-load reasoning games back to back. Put Move & Think or a language game between them. In RB, place the hardest slot early, since TBI fatigue builds over the session.
5. **Intention placement:** the intention emoji never appears on timed games (already enforced), and also not on Tower Tidy or Plan My Day, where it would disrupt planning.
6. **Boosters:** after the 6-week core program, add **booster weeks** at about month 11 and month 35. In those weeks, Pattern Path and Quick Eye appear more often, mirroring ACTIVE.
7. **Strategy carry-over:** after a Toolkit lesson, the week's games show that strategy's hint button, and close-of-session reflection asks "Did you use the trick today?"
8. **Frustration guard:** if a game's success rate falls below 60% (KS) or 75% (RB) for 2 sessions, swap it out for a week and drop 2 levels on return. Show no message about the drop.

### 3.4 Weekly picture (example, Keep Sharp, 5 sessions)

| Day | Anchor | Rotate-1 | Rotate-2 |
|---|---|---|---|
| Mon | Quick Eye | Pattern Path | **Toolkit: chunking** |
| Tue | Quick Eye | Pill Box | Light Path (hint: chunking) |
| Wed | Quick Eye | Odd One Out | Find & Tick |
| Thu | Quick Eye | Tower Tidy | Market Run |
| Fri | Quick Eye | Keep Track | Story Thread |

### 3.5 Weekly picture (example, Rebuild, 5 sessions)

| Day | Anchor | Rotate-1 | Rotate-2 |
|---|---|---|---|
| Mon | Word Garden | Pill Box | **Toolkit: write it down / visualize** |
| Tue | Word Garden | Story Thread | Step by Step |
| Wed | Word Garden | Market Run (list visible) | Find & Tick (guide line) |
| Thu | Word Garden | Light Path (span 2–4) | Pattern Path (2 options) |
| Fri | Word Garden | Finish the Line | Keep Track (conversation skin) |

---

## 4. Implementation notes for React Native / Expo
- **Shared primitives:** most games are "stimulus area + 2–6 big tap cards" (extend `src/components/Choices.tsx`), "grid of tappable tiles" (Light Path, Find & Tick, Missing Tile, Pill Box), or "ordered slots" (Step by Step, Plan My Day). Building three generic primitives first makes the S-sized games about 1 day each.
- **Generators over content:** Pattern Path, Missing Tile, Turn It, Tower Tidy, Light Path, Sort Switch and Arrow Wise can be **procedurally generated** from a seeded RNG (`src/engine/random.ts`). That gives unlimited items and makes them language-free.
- **Content-heavy games** (Finish the Line, Step by Step scripts, Plan My Day templates, Odd One Out categories) need a per-language content review checklist. Add `category`, `features` and `relations` to `concepts.ts`.
- **RTL:** decide per game whether the layout **follows reading order** (series, timelines, scan guide, step slots) or is **physical space** that must not flip (arrows, maps, rotation). Add a `noFlip` wrapper component.
- **Digits:** a setting for Western vs Eastern Arabic numerals in ar, applied consistently in Pattern Path, Market Run, Pill Box and Plan My Day.
- **Timing:** a single `profile === 'rebuild' ? untimed : optionalTimer` helper so that no RB code path can show a countdown.
- **Metrics per game:** accuracy, level, hints used, self-prediction vs actual (calibration) and strategy-hint use. Feed these into the buddy and clinician weekly summary, which is POINTER-style structure.
- **Claims:** keep the existing policy. These games are "practice"; Pill Box and Plan My Day carry "practice, not medical advice".

## Sources (key)
- ACTIVE 10-year: [Rebok et al. 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4055506/) · reasoning dose and boosters: [Willis & Caskie 2013](https://pmc.ncbi.nlm.nih.gov/articles/PMC3882330), [training manual summary](https://sls.psychiatry.uw.edu/wp-content/uploads/2020/03/Willis-2013-Reasoning-training.pdf) · 20-year dementia outcomes: [UAB](https://www.dpo.uab.edu/news/research-innovation/study-shows-brain-training-can-reduce-alzheimers-and-dementia-risk-by-25-percent), [BrainHQ](https://www.brainhq.com/news/press-releases/first-intervention-shown-to-lower-alzheimers-and-dementia-incidence/)
- IHAMS: [Wolinsky et al.](https://cambridge.org/core/journals/international-psychogeriatrics/article/effects-of-cognitive-speed-of-processing-training-on-a-composite-neuropsychological-outcome-results-at-oneyear-from-the-ihams-randomized-controlled-trial/E0295C85DBBF3CB033A4C47D538AA24D) · SKILL/MCI: [Edwards et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC3689869)
- U.S. POINTER: [UC Davis](https://health.ucdavis.edu/news/headlines/us-pointer-study-shows-lifestyle-program-improves-cognition-in-older-adults/2025/07) · FINGER adherence: [Turunen et al. 2019](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6620011/)
- Meta-analyses: [Lampit 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4236041) · [Lampit 2020 NMA](https://www.medrxiv.org/content/10.1101/2020.10.07.20208306v1) · [Hill 2017 MCI](https://psychiatryonline.org/doi/abs/10.1176/appi.ajp.2016.16030360) · [Cochrane Gates 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7045394) · [Basak 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7050567/) · [Sala 2019](https://pure.fujita-hu.ac.jp/en/publications/near-and-far-transfer-in-cognitive-training-a-second-order-meta-a/) · [Cochrane CST, Woods 2023](https://www.cochrane.org/podcasts/10.1002/14651858.CD005562.pub3) · [IADL review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6787728/) · [EF training in older adults, Olegário 2023](https://eupercebo.unb.br/wp-content/uploads/2023/10/Olegario-et-al.-2023.pdf)
- WM/n-back: [Lindeløv 2017 (ABI n-back)](https://www.Gwern.net/doc/dual-n-back/2016-lindelov.pdf) · [Westerberg 2007 (Cogmed ABI)](https://pubmed.ncbi.nlm.nih.gov/17624476) · [Melby-Lervåg](https://ora.ox.ac.uk/objects/uuid:daa9a729-f17b-4e45-97c0-cff5075ea404)
- Task switching: [Karbach & Kray 2009](https://Www.Gwern.net/doc/dual-n-back/2009-karbach.pdf) · [Frontiers 2017 review](https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2017.00069/full)
- INCOG 2.0 (2023): [EF](https://apps.asha.org/EvidenceMaps/Articles/ArticleSummary/8ba6ea6c-1191-ed11-8141-005056834e2b) · [Attention](https://research.monash.edu/en/publications/incog-20-guidelines-for-cognitive-rehabilitation-following-trauma-3/) · [Memory](https://digitalcommons.chapman.edu/comm_science_articles/25) · [overview](https://www.wolterskluwer.com/en/news/updated-guidelines-on-cognitive-rehabilitation-after-traumatic-brain-injury)
- Errorless learning in TBI: [PMC4228339](https://pmc.ncbi.nlm.nih.gov/articles/PMC4228339)
- Visuospatial/route: [PMC6050286](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6050286/) · [Frontiers 2020](https://www.frontiersin.org/articles/10.3389/fnhum.2020.00005/pdf)
- Mnemonics: [Method of loci in aging (JINS)](https://resolve.cambridge.org/core/journals/journal-of-the-international-neuropsychological-society/article/abs/method-of-loci-and-semantic-link-assessment-of-memory-benefits-in-healthy-aging/5B00D9E9365D7D0E709F82378B552D0C) · [PMC3955885](https://pmc.ncbi.nlm.nih.gov/articles/PMC3955885)
- Engagement/anxiety: [Vermeir 2020 gamification](https://games.jmir.org/2020/3/e18644) · [Lamont 2015 stereotype threat](https://kar.kent.ac.uk/46931)
- Semantic fluency in MCI: [DADM 2025](https://doaj.org/article/6fdcf96c7a434762aba91830b89c795e)
