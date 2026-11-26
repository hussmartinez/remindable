# Remindable — Research & Product Design

_Last updated: 2026-10-07_

## 1. Product decisions so far

- **Platforms:** iOS + Android (phone and tablet) and web PWA, one codebase (Expo / React Native).
- **Languages:** Spanish, English, Arabic (RTL). A user can train in **one or several** languages.
- **Content:** generic. No personal photos or family names, so anyone can use it.
- **Exercises:** many types, rotated in each daily session.
- **Audiences:**
  - **"Keep Sharp":** older adults, worried about or early in memory decline.
  - **"Rebuild":** acquired brain injury (TBI): word-finding, losing the thread of a conversation, forgetting.

## 2. What the evidence says (2024–2026)

| Technique | Evidence | What we take from it |
|---|---|---|
| **Speed-of-processing training** (Useful Field of View style: identify a center object + locate a peripheral target, display time adapts) | ACTIVE trial, 20-year follow-up (Feb 2026): speed training **plus booster sessions** → ~25% lower dementia diagnosis (HR 0.75). Without boosters: no effect (HR 1.01). | Include a speed game, keep it adaptive, and **schedule booster blocks** on purpose. Boosters matter. |
| **Multidomain + structured support** | U.S. POINTER (JAMA, 2025): exercise + nutrition + cognitive challenge + social engagement improved cognition. The **structured** arm (support, accountability) beat the self-guided one. | The app should give structure: a fixed daily plan, gentle accountability (a family "buddy"), and non-cognitive habits (movement, social contact). |
| **Spaced retrieval + errorless learning** | 2024 JMIR pilot: an app with algorithmic spacing (per-user forgetting rate) in MCI due to AD gave 80% adherence and no decay after a 1-week break. Earlier RCT (USMART) in MCI was positive. | Core memory engine = adaptive spaced repetition (FSRS-like) with errorless cueing. |
| **Anomia treatment: Semantic Feature Analysis (SFA) + Phonological Components Analysis (PCA) + cueing hierarchy** | Effective for naming in aphasia and in TBI (modified SFA). | Naming game: semantic cues first (category, use, where it is found), then sound cues (first sound, syllables), then the word. The user always ends up succeeding. |
| **Attention Process Training (APT)** | Most TBI RCTs positive (6/10). Goal Management Training effects did not generalize in chronic TBI. | Hierarchical attention drills: sustained → selective → alternating → divided. |
| **Prospective memory ("remember to remember")** | Meta-analysis 2008–2024 in acquired brain injury (14 RCTs): moderate, significant effect. | Embedded intentions: "When you see a ⭐ later, tap it", plus next-day intentions. |
| **Discourse / conversation tracking** | 75%+ of TBI have cognitive-communication deficits; topic-structure tracking is a core problem; evidence is still growing. | "Story Thread": short dialogues, then who-said-what, order of events, "what was the topic?" |
| **Cognitive-motor dual-task / exergames** | Meta-analyses (2020, 2024): benefits on global cognition and executive function in older adults and MCI. Dual-task beats single-task. | "Move & Think": march or clap while doing a simple cognitive task. |
| **Language learning / bilingual control** | 2023 RCT: older adults learning Spanish gained as much as brain-training users. Lifelong bilingualism is linked to later dementia onset. Proficiency matters (PNAS 2026). | Use the three languages **as a training ingredient**: cross-language naming, language switching, learning words in a new language. |
| **Music-based interventions** | 2025 meta-analysis: improvement/maintenance of cognition in healthy older adults (verbal fluency, memory, executive function). | Melody/rhythm memory game, music as reward. |
| **Speech digital biomarkers** | Active research (RADAR-AD, NCT06994767, 2026 JPAD). Not ready for consumer diagnosis. | **Do not diagnose.** Maybe later: optional, private trend tracking only. |

## 3. The creative combination: "The Daily Journey"

One **10–12 minute session per day**, 5 days a week. It feels like scrolling a feed (vertical swipe cards). That reuses a habit many older users already have, but the feed **has an end** ("Done for today. See you tomorrow 👋").

### Session shape
1. **Warm-up (1 min):** quick recall of yesterday's spaced-retrieval items.
2. **Plant an intention:** "Later, when you see a 🐦, tap it" (prospective memory, checked at the end).
3. **3–4 core games**, rotated so every type comes up during the week.
4. **Move & Think break** (dual-task, 1 min).
5. **Close:** intention check, encouraging summary, optional "send to my buddy."

### Exercise catalog (v1 set in **bold**)

| Game | Technique | Main target |
|---|---|---|
| **Word Garden**: name the picture; each word becomes a plant whose leaves are its semantic features | SFA + PCA cueing hierarchy, errorless | Word-finding (Rebuild) |
| **Memory Vault**: facts, name–face pairs (generic faces), and foreign words that come back at growing intervals | Adaptive spaced retrieval | Everyday memory (Keep Sharp) |
| **Quick Eye**: center object + peripheral target, adaptive display time | ACTIVE speed training | Processing speed |
| **Story Thread**: short dialogue (text + audio) → who said it, what happened first, what the topic was | Discourse comprehension | Losing the thread (Rebuild) |
| **Remember to Remember**: intentions planted at the start, checked later | Prospective memory | Both |
| Focus Lanes: tap targets only on a rule that changes | APT hierarchy | Attention |
| Language Switch: name it in Spanish, then Arabic; color/word switching | Bilingual executive control | Executive function |
| Melody Echo: repeat a growing tone/rhythm sequence | Music-based training | Working memory |
| Move & Think: march in place while counting back by 3s or naming animals | Cognitive-motor dual-task | Executive function, movement |

### Multi-language as a feature
- The user picks languages (e.g. Spanish + Arabic). Words are stored as **concepts** with labels in es/en/ar, so every game works in any language.
- **Cross-language cue:** if Spanish naming is stuck, offer the word in the user's other language as a hint.
- **Learn mode:** add a language you don't know, and Memory Vault teaches its words through spaced retrieval (the language-learning benefit).

### Adaptive engine
- **Keep Sharp profile:** target ~80% success ("desirable difficulty"). Timers allowed only in Quick Eye.
- **Rebuild profile:** target ~90% success, errorless cueing, no timers, slower audio, shorter dialogues.
- **Booster cycles** (ACTIVE): 6-week core program, then light maintenance, then booster blocks at about months 11 and 35, flagged in the app.

### Structure & social (POINTER)
- **Buddy link:** a family member gets a weekly summary or "did today's session" ping. Accountability, not surveillance. The user opts in.
- **Life habits card:** a daily nudge to walk, call someone, or drink water.

## 4. UX rules for these users
- Font ≥ 20pt, high contrast, tap targets ≥ 56pt, one task per screen.
- Full **RTL layout** for Arabic.
- Audio for every instruction (TTS in es/en/ar).
- Never a red ✗. Mistakes turn into a hint.
- Large "Continue" button, no hidden gestures needed, swiping is optional.

## 5. Claims policy
Wording: "mind training", "keep your mind active". **Never** "prevents/treats Alzheimer's" or "repairs brain injury" (Lumosity paid the FTC $2M over this in 2016). In-app note: "If you are worried about your memory, talk to a doctor."

## 6. Technical notes
- Expo SDK + Expo Router + TypeScript. `react-native-web` for the PWA.
- Local-first storage (SQLite). Optional sync later (buddy feature needs a backend).
- i18n: `i18next` + `I18nManager` for RTL. Content stored as concepts → labels per language.
- Images: need a license-safe pictogram/illustration set (e.g. OpenMoji, CC BY-SA). Check licenses; ARASAAC is non-commercial only.
- TTS: `expo-speech`. Optional speech recognition for naming later.

## Sources
- ACTIVE 20-year follow-up: https://www.uab.edu/news/research-innovation/study-shows-brain-training-can-reduce-alzheimers-and-dementia-risk-by-25-percent · https://www.patientcareonline.com/view/speed-based-cognitive-training-with-booster-sessions-linked-to-lower-dementia-risk-over-20-years
- U.S. POINTER: https://health.ucdavis.edu/news/headlines/us-pointer-study-shows-lifestyle-program-improves-cognition-in-older-adults/2025/07
- Spaced retrieval app in MCI/AD: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11297374/ · USMART: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5461696/
- SFA in TBI: https://research.polyu.edu.hk/en/publications/modified-semantic-feature-analysis-for-the-anomia-and-dysgraphia-/
- APT/TBI review: https://index.mirasmart.com/AAN2025/PDFfiles/AAN2025-003252.html · Meta-analysis: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5081379/
- Prospective memory in ABI: https://iris.unitn.it/handle/11572/491270
- TBI discourse: https://pmc.ncbi.nlm.nih.gov/articles/PMC9135020 · https://pubs.asha.org/doi/10.1044/2023_JSLHR-22-00632
- Exergames in MCI: https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2024.1424390/full · Cognitive-motor review: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7333372/
- Language learning: https://pharmacytimes.com/view/study-language-learning-associated-with-cognitive-benefits-for-older-adults · https://cordis.europa.eu/article/id/442479-can-learning-a-language-mitigate-the-impact-of-alzheimer-s-disease
- Music: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12669183/
- Speech biomarkers: https://clinicaltrials.gov/study/NCT06994767 · https://www.bumc.bu.edu/fhs-bap/2026/02/15/dr-rhoda-au-co-authors-landmark-study-on-ai-and-multi-modal-digital-biomarkers-for-alzheimers-detection/
