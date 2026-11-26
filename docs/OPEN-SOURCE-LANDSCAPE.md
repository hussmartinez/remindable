# Remindable: Open-Source Landscape Survey

_Survey date: 2026-10-07. Scope: memory loss, Alzheimer's/dementia, MCI, acquired/traumatic brain injury (TBI), aphasia/anomia._

**Method.** About 110 GitHub searches (keyword and topic searches in English, Spanish and Arabic), plus web searches covering academic, EU/CORDIS, publisher and dataset pages. Licenses come from `gh api repos/OWNER/REPO/license`. Where that returned `NOASSERTION`, I read the LICENSE text directly. Star counts and the last-push date were captured on 2026-10-07.

The earlier quick pass already covered these projects, so they are only referenced here: ts-fsrs, habla-anomia, project-qwerty, freefocusgames, field-vision-trainer, tmlbl/nback, Memora-frontend, RehaBrain-Java, microsoft/ReMe, carp-dk/cognition_package, jsPsych, lab.js, PsychoJS, MultiPic, OpenMoji, ARASAAC, BOSS.

**Verdict key**
- **REUSE CODE**: the license allows use in a closed or commercial app (MIT, Apache-2.0, BSD), and the quality is acceptable.
- **REUSE CONTENT**: the stimuli or data can ship in the app, with attribution or share-alike terms noted.
- **PORT IDEAS**: re-implement the mechanic or protocol yourself. Use this when the code has no license, is copyleft, or is low quality, or when the idea is better than the code.
- **AVOID**: the license blocks use (no license, NC, AGPL in a client) or the project is too poor to be worth reading.

**License flags for a possibly commercial app**
- **GPL/AGPL/CPAL**: copyleft. Do not copy code into Remindable. AGPL also covers network use.
- **NC**: non-commercial. Fine for research or a free tier, but blocks a paid product.
- **No license**: all rights reserved. You may read it, but do not copy it.
- **Share-alike content (CC BY-SA)**: allowed commercially, but derivative assets must stay CC BY-SA.

The biggest mobile-specific problem: most large GitHub projects in "Alzheimer's" are MRI/EEG/genomics machine-learning research (TPOT, NYUMedML, vkola-lab and so on). They are irrelevant to a training app and are left out except where noted.

---

## Top 10 worth using (ranked)

| # | Project | License | Why it matters for Remindable | Verdict |
|---|---|---|---|---|
| 1 | **m2c2kit** (Penn State / NIA M2C2), https://github.com/m2c2-project/m2c2kit | Apache-2.0 (verified, including each assessment package) | TypeScript, mobile-first, canvas (Skia/canvaskit-wasm) engine for **validated ambulatory cognitive tests**: Grid Memory, Color Dots, Color Shapes and Symbol Search. Designed to run in a browser **or in a native webview**, so it can be embedded in Expo via `react-native-webview` and work in the PWA directly. It also has a survey module, a DB addon and a CLI. Pushed 2026-09; 26★. These tasks come from the NIA-funded M2C2 / Einstein Aging Study work (Sliwinski et al.), which has psychometric validation. | **REUSE CODE**: the best base for the "check-in / measure" layer |
| 2 | **ResearchKit** (Apple), https://github.com/ResearchKit/ResearchKit | BSD-3 | Reference implementations of cognitive "active tasks": spatial span memory (Corsi-like), Trail Making A/B, PSAT, Stroop, Tower of Hanoi, reaction time, and 9-hole peg. iOS/ObjC only, so you cannot drop it into React Native, but its timing and scoring logic is permissive to port. 5.7k★, active. Android port: **ResearchStack** (Apache-2.0, 151★, dormant since 2024). | **PORT IDEAS / REUSE CODE** (algorithms) |
| 3 | **Experiment Factory experiments** (Stanford Poldrack lab), https://github.com/expfactory-experiments (132 repos) | Mostly MIT (for example digit-span, tower-of-london) | Many standard tasks as jsPsych web experiments: digit span, spatial span, n-back/adaptive n-back, Stroop, go/no-go, stop-signal, Tower of London, ANT, letter memory. Older jsPsych versions, but the trial logic and parameters are clean to lift. | **REUSE CODE** (per-repo MIT; check each) |
| 4 | **Cboard**, https://github.com/cboard-org/cboard | **GPL-3.0** | The best open web/PWA AAC board (759★, active), with **ar-EG, ar-SA and es-ES** translations. It uses ARASAAC, Mulberry and Global Symbols. It shows how to do RTL Arabic AAC, TTS and symbol search in a React PWA. GPL, so do not copy it. | **PORT IDEAS** (for a word-finding "rescue board") |
| 5 | **Tawasol Symbols** (Mada Qatar / Univ. Southampton), https://tawasol.mada.org.qa | **CC BY-SA 4.0**; Mada explicitly allows commercial products | The only good **Arabic-first** symbol set (Qatari Arabic and MSA, bilingual ar/en). Fills the Arabic gap in ARASAAC/OpenMoji. | **REUSE CONTENT** (attribution; SA applies to derivative symbols only) |
| 6 | **Gulf Arabic picture-naming norms** (Khwaileh et al., 2018, Qatar Univ.), http://qufaculty.qu.edu.qa/tariq-khwaileh/download-center/ | Free download for research; licence not stated, so **ask** before commercial use | Norms for 319 object and 141 action pictures in Qatari Arabic: name agreement, AoA, imageability, familiarity, naming latency, and Aralex frequency. Together with **MultiPic's Lebanese Arabic** norms (CC BY), these are the core stimuli for Arabic anomia training. Also: **Tunisian Arabic norms** for 348 line drawings (Boukadi et al. 2016). | **REUSE CONTENT** (after permission) |
| 7 | **whisper.rn** (MIT, 805★) + **whisper.cpp** (MIT) / **react-native-vosk** (MIT) + **Vosk** (Apache-2.0, es/ar models) | MIT / Apache | On-device ASR in React Native for es/en/ar. You need this for spoken naming, verbal fluency and recall checks without sending health audio to a server. | **REUSE CODE** |
| 8 | **mindLAMP activities** (BIDMC Digital Psychiatry), https://github.com/BIDMCDigitalPsychiatry/LAMP-activities | **No license** in that repo; the dashboard is **AGPL-3.0** | About 40 TypeScript/React mobile-web cognitive games: Jewels (a gamified **Trails A/B**), Digit Span, Symbol-Digit Substitution, Spatial Span, Tower of London, WCST, N-Back, Stroop, Flanker, Mental Rotation, Lexical Decision, Memory Match, Speech/Voice Recording. Published validation exists for "Jewels" as a Trails-B analog (Torous lab). | **PORT IDEAS** (do not copy) |
| 9 | **Prisma** (Open Knowledge Belgium), https://github.com/Prisma-care/mobile-app (100★) | **No license** | A collaborative family photo album for **reminiscence**, co-designed in a Belgian care home. Families add photos and stories; heritage archives add period photos. Ionic, dormant since 2023. The best open reminiscence UX reference. | **PORT IDEAS** |
| 10 | **Small World of Words: Rioplatense Spanish** (SWOW-RP) + **EsPal** + **Aralex** | SWOW: research download, CC BY-NC-ND (confirm on site); EsPal: free; Aralex: "GNU-like" | Lexical data for generating **semantic cues** (associates), matching word frequency and length, and scoring **verbal fluency** in Spanish and Arabic. | **REUSE CONTENT** (EsPal/Aralex after checking terms; SWOW is NC, so research/offline use only) |

Honourable mentions: **thesimonho/cognitive-battery** (MIT, Python/PsychoPy reference tasks); **JATOS** (Apache-2.0, study server); **DisVoice** (MIT, speech features); **Twemoji graphics** (CC BY 4.0, a commercial-friendly alternative to the CC BY-SA OpenMoji); **WHO iSupport** caregiver content, which already has **Arabic (Qatar) and Spanish (Castilla y León)** adaptations but needs a WHO licence.

---

## 1. Cognitive training and stimulation (dementia / MCI / older adults)

| Project | URL | License | ★ / last push | Stack | What it does | Verdict |
|---|---|---|---|---|---|---|
| brain-workshop | github.com/brain-workshop/brainworkshop | GPL-2.0 | 358 / 2025-04 | Python/pyglet | The classic dual n-back. Strong for working-memory research; weak transfer evidence and not friendly for older adults. | PORT IDEAS |
| open-recall | github.com/ObservedObserver/open-recall | AGPL-3.0 | 29 / 2023 | TS/React | N-back web games | AVOID (AGPL) |
| cogniba | github.com/cogniba/cogniba | Apache-2.0 | 3 / 2026-02 | TS/Next.js | Adaptive dual n-back platform with about 2k users | REUSE CODE (small; the adaptive staircase is useful) |
| Clarity | github.com/reivaj-gg/Clarity | Apache-2.0 | 9 / 2026-01 | Kotlin Multiplatform | Cognitive training and self-awareness lab | PORT IDEAS |
| Kognitif | github.com/BerkeKaragoz/Kognitif | none | 4 / 2022 | Preact PWA | PWA cognitive training | AVOID (no license) |
| rabbitbrain | github.com/iyiolacak/rabbitbrain | AGPL-3.0 | 8 / 2026-08 | Web | Brain training with an engagement loop | AVOID |
| Puzzle (sidhant947) | github.com/sidhant947/Puzzle | GPL-3.0 | 252 / 2026-10 | Flutter | 300+ minimalist puzzles | PORT IDEAS (game catalogue inspiration) |
| schulte (drafterleo) | github.com/drafterleo/schulte | none | 43 / 2018 | JS | Schulte tables (visual search) | PORT IDEAS (trivial to rebuild) |
| Dianoia | github.com/scify/Dianoia-app | Apache-2.0 | 16 / 2026-07 | Ionic 3 / Angular 4 (legacy) | SciFY (Greece): a library of **non-pharmacological activities** for people with dementia and their carers. Greek content; a structured "activity card" model. | REUSE CODE (data model) / PORT IDEAS |
| RECODE (Univ. Padova) | Paper: indico.sissa.it/event/149/contributions/3111 | Described as "open-access source code"; repo not located | n/a | Browser | **Remote cognitive stimulation for MCI and mild dementia**. Six domains (attention, memory, language, executive, WM, spatial-temporal orientation). Adaptive difficulty from previous scores. 20-minute sessions with domain feedback. Digitised from an established paper CST program; Italian. | PORT IDEAS (session design closely matches Remindable's "Daily Journey"); contact the authors for the code |
| PESCO | github.com/luinix/pesco | none | 1 / 2012 | C# | Spanish open "cognitive evaluation and stimulation" tool. Published study shows gains in attention and planning. | PORT IDEAS (historic) |
| Rivit (Univalle, Colombia) | github.com/MCV-Univalle/Rivit | none | 5 / 2025 | Unity | Spanish-language serious game for cognitive training in heart-failure patients | PORT IDEAS |
| NeuroMInd | github.com/Dazuncion/NeuroMInd | GPL-3.0 | 2 / 2025 | JS | Spanish cognitive stimulation for neurodivergent children | AVOID (GPL, child-focused) |
| VR-MCT | github.com/JWdori/VR-MCT | Apache-2.0 | 4 / 2025 | Unity VR | VR multimodal cognitive training (older adults) | PORT IDEAS |
| Bridge (Erasmus+) | eurocarers.org (Bridge project) | Closed apps on Play Store | n/a | Android | Eight serious games for dementia (Find the word, Flea market, Next destination, Bird watching) | PORT IDEAS |
| AD-GAMING, GARDINER, Musiquence, ElderGames (EU) | adgaming.ibv.org; CORDIS | No public code found | n/a | Mixed | EU serious-game and reminiscence platforms for AD | PORT IDEAS (Musiquence: music + reminiscence) |
| Generic "brain training" repos (Neuro-Sprint, lexicon-forge and others) | n/a | Mostly no license | n/a | n/a | Several high-star repos (for example "Neuro-Sprint" 55★, "lexicon-forge" 55★) are **SEO/spam repos** | AVOID |

**Evidence note.** Cognitive *stimulation* (CST, Spector et al.) is NICE-recommended for mild to moderate dementia. Computerised *training* in MCI shows small-to-moderate effects on trained domains and weak far transfer. None of these open repos has its own RCT, apart from the m2c2kit/MTB assessments, the published Jewels validation and PESCO's small study.

## 2. Rehab tools for TBI, stroke and aphasia

| Project | URL | License | ★ / last push | Stack | What it does | Verdict |
|---|---|---|---|---|---|---|
| project-qwerty | (prior pass) | GPL-3.0 | 7 / 2026-10 | Web | Spelling/typing therapy for aphasia | PORT IDEAS |
| Android Bilingual Aphasia Test (eBAT) | github.com/BilingualAphasia/AndroidBilingualAphasiaTest | none | 13 / 2012 | Android Java | Digital port of Paradis' **Bilingual Aphasia Test**. The BAT exists in **Spanish and Arabic** versions (paper, McGill). | PORT IDEAS; the BAT content itself is copyrighted |
| Discourse-Assessments | github.com/hanayik/Discourse-Assessments | MIT | 3 / 2018 | JS/Electron | Picture-description and discourse elicitation used in post-stroke aphasia research (USC/MUSC) | REUSE CODE (small) |
| AphasiaRecoveryCohortDemo | github.com/neurolabusc/AphasiaRecoveryCohortDemo | BSD-2 | 9 / 2026-09 | Python | ARC dataset (OpenNeuro: MRI + WAB scores) | Not app-relevant (research only) |
| SpeakEasy AAC | github.com/dylanharrington/aphasia | none | 3 / 2026-01 | JS | Free AAC for aphasia and stroke | AVOID (no license) / PORT IDEAS |
| aphasia-app-sample (Microsoft) | github.com/Azure-Samples/aphasia-app-sample | MIT | 4 / 2024 | Python | GPT rewrites fragmented aphasic speech into a clear sentence | REUSE CODE (pattern: "what I meant to say" helper) |
| Aphasia_APE_Cue_App | github.com/ujjwal-saahu/Aphasia_APE_Cue_App | none | 2 / 2026-03 | Notebook | LLM-generated **personalised naming cues** (semantic and phonological cueing hierarchy) | PORT IDEAS (strong idea) |
| TalkToWorld | github.com/geekgao/TalkToWorld | MIT | 49 / 2023 | Python | Pronunciation keyboard for ALS and aphasia (Chinese) | PORT IDEAS |
| PicSpeak | github.com/vishwapatel/PicSpeak | none | 3 | Android | Picture-based communication | AVOID |
| Lexical | github.com/thrashbun/Lexical | none | 3 / 2019 | n/a | **Reverse dictionary for aphasia**: describe a word and get candidates | PORT IDEAS (very relevant for tip-of-the-tongue; today an LLM or embeddings do this well) |
| WordsPlease | github.com/WordsPlease/WordsPleaseApp | none | 4 / 2019 | React Native | Speech-therapy app built in RN | AVOID / glance |
| Cboard / AsTeRICS Grid / prism-aac | cboard-org/cboard; asterics/Asterics-AAC; dcostenco/prism-aac | GPL-3 / AGPL-3 / AGPL-3 | 759 / 124 / 3 | React PWA | Open AAC boards. Cboard has Arabic and Spanish. | PORT IDEAS |
| EyeRemember (Shepherd Center) | github.com/ShepherdCenter/EyeRemember | Apache-2.0 | 2 / 2015 | Google Glass, Java | Memory compensation for **acquired brain injury**: contextual prompts | PORT IDEAS (rare TBI-specific open project from a top TBI rehab centre) |
| ezeyes | github.com/samuelglaisher/ezeyes | none | 3 / 2024 | TS | Reading-assistance tool for TBI (chunked text, focus) | PORT IDEAS |
| StrokeTrainer | github.com/ian030590/StrokeTrainer | none, archived | 3 | TS | Web rehab for stroke and brain injury | AVOID |
| Neuro-Well | github.com/bdeekshith066/Neuro-Well | none | 9 / 2025 | Python/Streamlit | Neuro-rehab platform (hackathon) | AVOID |
| CogConnect | github.com/tomeara/CogConnect | MIT (cocos2d) | 3 / 2011 | iOS | Stroke cognitive rehab game | PORT IDEAS (historic) |
| ApplTree (Univ. Glasgow) | eprints.gla.ac.uk/299951 | Not open | n/a | Android | **Co-designed reminder app for ABI**. It prompts the user *to set* reminders and scaffolds entry accuracy. Published feasibility work (Jamieson et al.). | PORT IDEAS (key TBI insight: people forget to *create* reminders) |
| Maumahara Papahou / Waikato augmented memory | researchcommons.waikato.ac.nz/handle/10289/9234 | Not open | n/a | Mobile AR | Mobile augmented memory for TBI; Māori mnemonic "treasure box" | PORT IDEAS |
| NeuroPage, Goal Management Training (GMT) | Literature | Commercial / manual | n/a | n/a | NeuroPage is a paging reminder system (Wilson et al. RCT, 2001). GMT is a metacognitive "STOP-state-goal-check" protocol with RCT evidence in ABI. | PORT IDEAS (protocols, not code) |
| Commercial reference (not OSS) | Tactus Naming Therapy, Constant Therapy, NeuronUP (es), Guttmann NeuroPersonalTrainer (es), GRADIOR (es) | Proprietary | n/a | n/a | The benchmarks Remindable competes with. Constant Therapy and Tactus have published efficacy studies. | Competitive reference |

Published naming-therapy apps without public code: **SANTA** (self-administered naming therapy), **VoiceAdapt**, **Banga** (an early Android word-finding prototype), and a Thai picture-naming app (2023). For idea mining, the aphasia app directory **aphasiasoftwarefinder.org** is the best index.

## 3. Open cognitive assessment and screening

| Project | URL | License | ★ / last push | Stack | What it does | Verdict |
|---|---|---|---|---|---|---|
| **m2c2kit** | see Top 10 | Apache-2.0 | 26 / 2026-09 | TS + canvaskit-wasm | Validated ambulatory tasks (Grid Memory, Symbol Search, Color Dots, Color Shapes); webview-embeddable | **REUSE CODE** |
| **MindLogger / Curious** (Child Mind Institute) | github.com/ChildMindInstitute/mindlogger-app-refactor | **CPAL-1.0** (verified) | 9 / 2026-10 | **React Native** + web + admin | A full RN data-collection platform: applets, scheduling, surveys, some cognitive items (for example a Flanker task and a drawing/trails item) | PORT IDEAS. CPAL is copyleft with mandatory attribution. Do not embed. It is the best RN architecture reference for scheduled assessments. |
| **mindLAMP** (BIDMC) | github.com/BIDMCDigitalPsychiatry/LAMP-activities, LAMP-dashboard | activities: none; dashboard: AGPL-3.0 | 6, 11 / 2026-09 | TS/React | About 40 mobile-web cognitive games, including **Jewels A/B (Trails analog, published validation)** | PORT IDEAS |
| **Mobile Toolbox (MTB)** (NIH Toolbox team, Sage Bionetworks) | mobiletoolbox.org; github.com/Sage-Bionetworks/MobileToolboxApp-Android; github.com/BridgeDigitalHealth/AssessmentModelKMM | Mixed / NOASSERTION; some BSD-3 libraries | 1 / 2024 | Swift / Kotlin MP | Eight smartphone adaptations of NIH Toolbox tests: Faces & Names, Arranging Pictures, Sequences, Numbers & Symbols, Arrow Matching, Shape-Color Sorting, Spelling, Word Meaning. **Strong validation** (JINS 2023). Spanish versions exist. The assessment content is NIH-Toolbox licensed, not freely reusable. | PORT IDEAS (task designs and validation literature) |
| **OCTAL** (Oxford Cognitive Testing Portal) | psy.ox.ac.uk, PMC12909784 | "Open, modular"; code not located | n/a | Browser | Remote, cross-cultural assessment (memory, attention, visuospatial, executive) validated in aging and dementia, 2025-26 | PORT IDEAS; contact the authors |
| thesimonho/cognitive-battery | github.com/thesimonho/cognitive-battery | MIT | 55 / 2025-05 | Python/PsychoPy | Standard tasks: digit span, Corsi-like, Stroop, n-back, mental rotation, and others. Warns that some images (Raven's, MRT) are copyrighted. | REUSE CODE (logic) |
| working_memory_tests | github.com/mahiluthra/working_memory_tests | none | 50 / 2022 | JS | Digit span, operation span, visual arrays, spatial span | PORT IDEAS (no license) |
| expfactory digit-span / tower-of-london / spatial-span etc. | github.com/expfactory-experiments | MIT | 5–9 | jsPsych | See Top 10 | REUSE CODE |
| jsPsych_online_TMT | github.com/GEJ1/jsPsych_online_TMT | none | 7 / 2020 | jsPsych | Digital Trail Making Test (Argentine group, Spanish) | PORT IDEAS. The original TMT (US Army, 1944) is public domain, so rebuild it freely. |
| TMTGen | github.com/davidnsousa/TMTGen | GPL-3.0 | 2 / 2021 | Python | Generates parallel TMT layouts (useful for repeat testing without practice effects) | PORT IDEAS (algorithm) |
| AR-TMT (Duke) | github.com/Duke-I3T-Lab/AR-TMT | other | 8 | Magic Leap | AR TMT under distraction | Not relevant |
| CorsiBlockTapping | github.com/Fricker95/CorsiBlockTapping | MIT | 2 / 2024 | PsychoPy | Corsi | REUSE CODE (tiny) |
| Test-Platform (lab-neuro-comp) | github.com/lab-neuro-comp/Test-Platform | MIT | 9 / 2020 | C# | Neuropsych battery (Stroop and others; Brazil) | PORT IDEAS |
| AndroidCognitiveTestBattery (movisens) | github.com/movisens/AndroidCognitiveTestBattery | none | 5 / 2014 | Android | EMA cognitive battery | AVOID |
| CoCA | github.com/begavett/CoCA | MIT | 2 / 2021 | R | Colorado Cognitive Assessment item bank (IRT) | PORT IDEAS (IRT approach) |
| MoCA app (ahmaddioxide) / MoCA-BOT | github.com/ahmaddioxide/moca | none | 4 | Flutter | Digitised MoCA | **AVOID**. The MoCA is copyrighted and licensed (training and certification required). |
| Clock-drawing ML (several) | trebledawson/Alzheimers-Clock-Drawing, iheallab/Clock-Drawing-Classification-With-RF_VAE | none | 4–7 | Python | Classifiers for digitised clock drawings | PORT IDEAS (needs data; the dCDT is patented by Digital Cognition Technologies, so be careful) |
| vfclust | github.com/speechinformaticslab/vfclust | Apache-2.0 (verified text) | 7 / 2014 | Python | **Verbal fluency clustering and switching** scoring (Troyer method, automated) | REUSE CODE (English; adapt lexicons to es/ar) |
| forager | github.com/thelexiconlab/forager (+ forager-web MIT) | GPL-3.0 | 9 / 2026-09 | Python | Models verbal fluency as optimal foraging | PORT IDEAS |
| NeuropsyNorms | github.com/zen-juen/NeuropsyNorms | MIT | 5 / 2026-02 | R | Computes normative scores | REUSE CODE (concept) |
| Neuropsydia.py | github.com/neuropsychology/Neuropsydia.py | MPL-2.0 | 66 / 2019 | Python | Task/questionnaire builder (dormant) | PORT IDEAS |

**Screening instruments (content licensing, not code)**
- **Trail Making (A/B), digit span, Corsi, verbal fluency, clock drawing, word-list recall**: generic paradigms, so they can be rebuilt freely. Avoid copying specific copyrighted stimuli, such as WAIS item sets, RAVLT/CVLT lists as published, CERAD (licensed by Duke) and the BNT pictures.
- **MoCA**: licensed, with fees and certification. **ACE-III** has Spanish and Arabic versions but needs permission for digital or commercial use. **AD8**: WashU copyright; licence needed for commercial use. **Mini-Cog**: free for clinical use, licence for commercial. **SAGE** (Ohio State): free paper use; the digital version is commercial. **RUDAS**: culture-fair and validated in **Arabic** (A-RUDAS, AUB; contact ke05@aub.edu.lb); permission needed.
- Recommended stance: Remindable should present **training-progress metrics**, not a diagnostic "score". This avoids medical-device regulation and instrument licensing (consistent with the Claims policy in RESEARCH-AND-DESIGN.md).

## 4. Memory aids and assistive tech for dementia and TBI

| Project | URL | License | ★ / last push | Stack | What it does | Verdict |
|---|---|---|---|---|---|---|
| **Prisma** | github.com/Prisma-care/mobile-app, /api | none | 100, 45 / 2023 | Ionic + REST | Collaborative family **reminiscence photo album** with heritage content | PORT IDEAS |
| Dianoia | github.com/scify/Dianoia-app | Apache-2.0 | 16 | Ionic | Caregiver activity library (Greek) | REUSE CODE (model) |
| elisabot | github.com/marionacaros/elisabot | Apache-2.0 | 4 / 2023 | Python | **Automatic reminiscence therapy chatbot**: asks questions about the user's own photos via VQA (ACM ICMR 2020, UPC Barcelona) | REUSE CODE / PORT IDEAS (do it today with a multimodal LLM) |
| ReminiscenceSAR | github.com/NathaliaCespedesG/ReminiscenceSAR | none | 3 / 2023 | Python | Pepper robot reminiscence therapy (Colombia, published HRI study) | PORT IDEAS |
| memory-lane / memorylane | github.com/andreihar/memory-lane; aroramrinaal/memorylane | none | 2 | Java / web | Reminiscence apps | AVOID |
| Identity (Sofía Ritz) | git.sofiaritz.com/sofia/identity | (self-hosted Gitea; check) | n/a | n/a | Personal memory-saving app, initially music for dementia | PORT IDEAS |
| DQMusicBox | github.com/rosswesleyporter/dqmusicbox | none | 15 / 2023 | Python/RPi | One-button dementia-friendly music player | PORT IDEAS (music reminiscence; "one control" UX) |
| homerplayer / homerplayer2 | github.com/msimonides/homerplayer2 | MIT | 18 / 2026-09 | Kotlin | Audiobook player for elderly and low-vision users; kiosk-simple UI | REUSE CODE (UX patterns) |
| BaldPhone | github.com/UriahShaulMandel/BaldPhone | Apache-2.0 | 305 / 2024 | Android Java | Accessible senior launcher (big tiles, includes **Hebrew RTL**) | PORT IDEAS (senior and RTL UI) |
| incoming-call-only-launcher / senioren-launcher | lcarne/…, cma58/… | MIT / other | 3–5 | Kotlin | Locked-down launchers for vulnerable users | PORT IDEAS |
| DaySee.org | github.com/Danny-Engelman/DaySee.org | none | 3 / 2017 | HTML | Dementia **day/time orientation clock** ("It's Tuesday morning") | PORT IDEAS (trivial, high value) |
| HeadHome | github.com/GSC23-HeadHome/HeadHome | MIT | 14 / 2023 | Flutter | Dementia wandering and getting-home aid (Google Solution Challenge) | PORT IDEAS |
| AlzheimersCaregiver | github.com/nidhijmr/AlzheimersCaregiver | none | 13 / 2018 | Android | Reminders, face recognition, location | AVOID |
| nemo | github.com/li-pearl/nemo | MIT | 4 / 2023 | Python | Wearable **face recognition** ("who is this?") for AD | PORT IDEAS (privacy-heavy; consent of the faces is a legal issue in the EU) |
| remembr.ai / Smriti / smriti-kunj / synapse | various | none / none / Apache-2.0 / GPL-3 | 2–6 | various | AI memory assistants for elders. smriti-kunj is offline-first and voice-enabled. | smriti-kunj: PORT IDEAS; others AVOID |
| mci-ubicomp | github.com/tushgup/mci-ubicomp | MIT | 3 / 2020 | HTML | Web app helping people with MCI track daily tasks | PORT IDEAS |
| EyeRemember | see §2 | Apache-2.0 | 2 | Glass | Contextual memory prompts for ABI | PORT IDEAS |
| OpenCare | github.com/NexaFlowFrance/OpenCare | AGPL-3.0 | 5 / 2026-10 | TS | Family care-coordination for an ageing relative | AVOID (AGPL) / PORT IDEAS |
| GeriLife wellbeing | github.com/GeriLife/wellbeing | AGPL-3.0 | 13 / 2023 | Meteor | Care-home activity log | AVOID |
| TIHM dataset | github.com/PBarnaghi/TIHM-Dataset | CC-BY-4.0 | 16 | Data | In-home sensor monitoring dataset for dementia (UK) | Not needed now |
| WHO **iSupport** | who.int (iSupport) | WHO copyright; licence on request | n/a | Content | Evidence-based self-help programme for dementia carers. **Arabic (Qatar/HMC)** and **Spanish (Castilla y León)** adaptations exist. | REUSE CONTENT (needs a WHO licence) |

## 5. Speech and language tools

| Project | URL | License | ★ / last push | What it does | Verdict |
|---|---|---|---|---|---|
| whisper.rn / whisper.cpp / Whisper | mybigday/whisper.rn; ggml-org/whisper.cpp; openai/whisper | MIT | 805 / 54k / 110k | On-device multilingual ASR (es/ar/en) from React Native | **REUSE CODE** |
| react-native-vosk + Vosk | riderodd/react-native-vosk; alphacep/vosk-api | MIT / Apache-2.0 | 99 / 15k | Small offline ASR with **grammar-restricted vocab**, ideal for "did they name the target word?" | **REUSE CODE** |
| SpeechBrain | speechbrain/speechbrain | Apache-2.0 | 11.8k | Toolkit for ASR and speaker/paralinguistic models | REUSE CODE (server/research) |
| DisVoice | jcvasquezc/DisVoice | MIT | 402 / 2026-07 | Prosody, phonation, articulation and phonological features. Built by the **Universidad de Antioquia (Colombia)** group for **Spanish** pathological speech (PD). | REUSE CODE (research / biomarker R&D) |
| openSMILE | audeering/opensmile | **Custom: free for research, commercial licence required** (verified) | 854 | eGeMAPS acoustic features, the standard in ADReSS papers | AVOID for product (NC) |
| surfboard / blabla (Novoic) | novoic/surfboard; novoic/blabla | GPL-3.0, archived | 437 / 38 | Audio and linguistic feature extraction for clinical speech | AVOID (GPL) / PORT IDEAS |
| batchalign2 (TalkBank) | Jemoka/batchalign2 | BSD-3, archived | 34 | CHAT transcription and alignment for clinical language samples (AphasiaBank, DementiaBank) | REUSE CODE (research) |
| ADReSS / ADReSSo baselines | KarolChlasta/ADReSS-Challenge2020; NiliRahmani/…; THUsatlab/AD2021 (Apache-2.0) | mixed | 15–57 | Alzheimer's detection from spontaneous speech (Cookie Theft). The data is DementiaBank (members only, NC). | PORT IDEAS (not a product feature) |
| translingual-language-markers | illidanlab/translingual-language-markers | MIT | 13 / 2025 | Cross-lingual language markers for cognitive assessment from spontaneous speech | PORT IDEAS (relevant to trilingual) |
| Speech-pause distribution for AD | ivangtorre/Speech-pause-distribution-as-an-early-marker-for-Alzheimers-disease | GPL-3.0 | 3 | Pause statistics as an AD marker (**Spanish** corpus) | PORT IDEAS |
| acoustic_profile-MCI | themistocleous/acoustic_profile-MCI | none | 2 / 2020 | Voice quality and fluency distinguish MCI (Swedish) | PORT IDEAS |
| awesome-dementia-detection | billzyx/awesome-dementia-detection | MIT | 47 | Curated paper list (speech/language dementia detection) | Reference |
| dementianet | shreyasgite/dementianet | MIT | 40 / 2022 | Longitudinal spontaneous-speech dataset (public figures) | Research only |
| **microsoft/ReMe** | (prior pass) | MIT | 18 | LLM voice chatbot framework for cognitive training | REUSE CODE |
| relief-alzheimer-conversational-agent | gyoridavid/… | none | 5 / 2026-09 | Multimodal voice and vision companion for AD | PORT IDEAS |
| alzheimer-companion | ssps6210/alzheimer-companion | MIT | 6 / 2026-09 | Voice companion **in a family member's cloned voice** (Taiwan) | PORT IDEAS (ethically delicate) |
| The Listening Tree | Brian-code-123/The-Listening-Tree | GPL-3.0 | 2 | Bilingual companion chatbot for elders | AVOID (GPL) |
| Aphasia GPT rewrite | Azure-Samples/aphasia-app-sample | MIT | 4 | See §2 | REUSE CODE |

Arabic-specific clinical speech tooling: **none found**. No open Arabic aphasia or dementia speech corpus exists. Whisper and Vosk Arabic models are general MSA-leaning ASR, and dialect accuracy (Gulf, Levantine, Maghrebi) for older and impaired speakers is unvalidated. Meta **MMS** has broad Arabic coverage but is **CC BY-NC**, so avoid it in a product.

## 6. Research platforms and frameworks for building tasks

| Framework | License | Mobile / React Native fit | Notes | Verdict |
|---|---|---|---|---|
| **m2c2kit** | Apache-2.0 | **Webview-embeddable by design**; touch-first; runs offline | Canvas engine with good timing; includes survey and DB modules | **Best fit** |
| jsPsych (+ jspsych-contrib) | MIT (contrib repo: no top-level license, so check each plugin) | Runs in an RN webview or the PWA; DOM-based, so timing is OK on mobile | Huge plugin ecosystem (expfactory tasks) | REUSE CODE |
| PsychoJS | MIT | Webview/PWA | PsychoPy-to-web export | REUSE CODE |
| lab.js | GPL/other | Webview | Prior pass | Check licence |
| **JATOS** | Apache-2.0 | Server only | Self-hosted study server for jsPsych, lab.js and PsychoJS. Useful for a **research arm / validation study**. | REUSE CODE |
| Tatool Web | GPL-3.0 | Web | Training-study platform (repeated sessions, adaptivity). Designed exactly for **cognitive-training studies**. | PORT IDEAS |
| OpenSesame / OSWeb | GPL-3.0 | Web export | GUI experiment builder | PORT IDEAS |
| Expyriment | GPL-3.0 | Desktop / Android (old) | Python | AVOID |
| Experiment Factory | BSD-3 (framework) / MIT (experiments) | Web | Containerised battery | REUSE CODE |
| MindLogger | CPAL-1.0 | **Native React Native** | The only mature open RN assessment app | PORT IDEAS (CPAL) |
| mindLAMP | AGPL / none | React web + native shells | Digital-psychiatry platform | PORT IDEAS |
| Beiwe | BSD-3 | Native apps | Passive sensing and surveys (Harvard Onnela lab) | Not needed |
| CARP Mobile Sensing / cognition_package | MIT | Flutter | Prior pass: Flutter, not RN | PORT IDEAS |
| ResearchKit / ResearchStack | BSD-3 / Apache-2.0 | Native iOS / Android | Active tasks (see Top 10) | PORT IDEAS / REUSE algorithms |
| Mobile Toolbox / Bridge (Sage) | mixed BSD/NOASSERTION | Swift / Kotlin MP | Assessment model (AssessmentModelKMM) | PORT IDEAS |

**Recommendation.** Write native React Native task components for the core *training* games (they need animation, haptics and RTL). Embed **m2c2kit** in a webview for the periodic *measurement* tasks, so they stay validated and identical on the PWA. Use **ts-fsrs** for spaced retrieval scheduling.

## 7. Open datasets and content (stimuli, norms, symbols, reminiscence)

| Resource | Languages | License | What it gives | Verdict |
|---|---|---|---|---|
| **MultiPic** (BCBL) | 32 incl. **Spanish, Rioplatense Spanish, Lebanese Arabic**, English | **CC BY** | 500 coloured pictures with naming norms and familiarity | **REUSE CONTENT** (core naming set) |
| **Gulf (Qatari) Arabic picture-naming norms** (Khwaileh 2018) | ar (Gulf) | Free download; licence unstated, so ask | 319 objects + 141 actions (verbs!), latency/AoA/imageability | **REUSE CONTENT** (with permission) |
| **Tunisian Arabic norms** (Boukadi 2016) | ar (Tunisian) | Paper norms (uses Snodgrass drawings) | 348 line drawings | REUSE CONTENT (norms; the images are licensed separately) |
| BOSS (Brodeur) | en/fr (+ various) | CC BY-SA | 1,400+ photos | Prior pass |
| Snodgrass & Vanderwart colourised (Rossion & Pourtois) | many norm sets incl. Spanish | Free for research | 260 classic drawings | REUSE CONTENT (research; check commercial use) |
| International Picture Naming Project (IPNP, UCSD CRL) | 7 languages incl. **Spanish** | Free for research | 520 objects + 275 actions with norms | REUSE CONTENT (check) |
| **ARASAAC** | 30+ incl. es, **ar** | **CC BY-NC-SA** | 13k pictograms (Aragón) | Prior pass. **NC blocks paid use.** |
| **Tawasol** (Mada) | **ar**/en | **CC BY-SA 4.0**, commercial OK | Arabic AAC symbols | **REUSE CONTENT** |
| **Mulberry Symbols** | en (labels) | CC BY-SA 4.0 (verified) | 3,400 adult-oriented AAC symbols (good for *adults*, not childish) | **REUSE CONTENT** |
| OpenMoji | n/a | CC BY-SA 4.0 | Emoji-style icons | Prior pass |
| Twemoji (jdecked fork) | n/a | Graphics CC BY 4.0; code MIT | Emoji graphics without share-alike | REUSE CONTENT |
| Sclera symbols | n/a | CC BY-NC | Pictograms | AVOID (NC) |
| Global Symbols | many incl. ar | Per-symbol-set licences | Aggregator (ARASAAC, Mulberry, Tawasol and others) | Use as a discovery tool |
| **EsPal** (BCBL) | es | Free access | Spanish frequency, length, neighbourhood, imageability | REUSE CONTENT (check terms) |
| **Aralex** | ar (MSA) | "GNU-like" | Arabic lexical database: frequencies, roots, patterns | REUSE CONTENT |
| SUBTLEX-ESP | es | Free for research | Subtitle word frequencies | REUSE CONTENT |
| **Small World of Words** (SWOW-EN, **SWOW-RP Spanish**) | en, es | Research download (NC-ND per site; confirm) | Word associations, which power semantic cues and "related words" hints | Offline use to *derive* cues only; confirm the licence |
| AphasiaBank / DementiaBank (TalkBank) | en, es, others | Members only, NC | Clinical discourse corpora | AVOID for product; research only |
| ARC (Aphasia Recovery Cohort) | en | OpenNeuro (CC0) | MRI + WAB aphasia scores | Not app-relevant |
| **CRE Alzheimer (IMSERSO) "Estimulación cognitiva: guía y materiales"** | es | Free public PDFs; copyright IMSERSO | 115 stimulation tasks for mild to moderate dementia | PORT IDEAS / REUSE CONTENT with permission |
| **UCL CST (Cognitive Stimulation Therapy) in Spanish (online version)** | es (+ many) | UCL copyright; free manuals for some formats | Evidence-based CST session themes (NICE-recommended) | PORT IDEAS (session themes); licence needed to brand it "CST" |
| Reminiscence imagery | multi | Europeana (many CC0/PD), Wikimedia Commons, Internet Archive, BNE Biblioteca Digital Hispánica | Period photos (1950s–80s) for reminiscence prompts by country and decade | REUSE CONTENT (filter by CC0/PD) |
| Arab Image Foundation | ar region | Rights-restricted | Historic Arab-world photography | Partnership only |

---

## 8. Beyond GitHub and beyond React Native (any stack)

Added 2026-10-08. Sources: F-Droid metadata, GitLab, Codeberg, KDE Invent, GNOME GitLab, Launchpad, SourceForge pages, and classic open-source software. Licence checks: F-Droid `license` field, forge API, or the LICENSE file itself.

### 8.1 Classic cognitive software (desktop and long-running projects)
| Project | Licence | Stack | Relevance | Verdict |
|---|---|---|---|---|
| **PEBL test battery**, pebl.sourceforge.net (v2.4, Apr 2026) | Runtime GPL-2. **About 25 tests have public-domain headers**: Corsi, digit span, Berg card sort (a free WCST-like test), digit-symbol, matrix rotation, pattern comparison, CPT and others. Other tests carry a GPL header or none. | C++ / own scripting language, WASM | 100+ neuropsychology tests (memory, executive, visuospatial, attention) | Public-domain tests: **REUSE**. Others: PORT IDEAS. Don't use trademarked test names. |
| **gbrainy**, gitlab.gnome.org/Archive/gbrainy | GPL-2+ (archived 2024) | C#/GTK | About 50 logic puzzles, memory trainers, mental arithmetic, verbal analogies. The best single design reference for a brain trainer. | PORT IDEAS |
| **GCompris**, invent.kde.org/education/gcompris | AGPL-3 overall; art mostly CC-BY-SA-4.0 | Qt/QML | Memory pairs and sound memory, Hanoi, tangram, Mastermind, mazes, calendar and clock activities for orientation. Child-focused. | PORT IDEAS |
| KDE games: Blinken (Simon), Kanagram, Picmi (nonogram), KSudoku, Palapeli | GPL-2+ | Qt/C++ | Sequence memory, anagrams, puzzles | PORT IDEAS |
| GNOME games: Sudoku, Tetravex, Taquin, Lights Off, Mahjongg | GPL-2/3 | Vala/GTK | Logic and spatial games | PORT IDEAS |
| Anki / AnkiDroid / Mnemosyne | AGPL-3 / GPL-3 / AGPL plus an attribution clause | Rust+Py / Kotlin / Py | Spaced repetition | PORT IDEAS. Use **FSRS** (MIT/BSD; ts-fsrs, py-fsrs, fsrs-rs) instead. |
| PsychoPy / OpenSesame | GPL-3 | Python | Task builders | PORT IDEAS (PsychoJS runtime is MIT) |
| PsyToolkit | Non-commercial only | Web | Experiment library | AVOID |
| Brain Party (Launchpad) | GPL-3, dormant | C++/SDL | 36 brain-training mini-games | PORT IDEAS |

### 8.2 F-Droid / GitLab / Codeberg apps
| Project | Licence | Stack | What it does | Verdict |
|---|---|---|---|---|
| **Braincup**, F-Droid, github.com/SimonSchubert/Braincup | Apache-2.0 | Kotlin Multiplatform | About 20 mini-games: calculation, visual memory, "Ghost Grid" lit-tile sequence, pattern sequence, anomaly spotting, Schulte | **REUSE CODE** |
| **Eidetic**, F-Droid | Apache-2.0 | Android | "Chimp test": recall where numbers 1–9 were | **REUSE CODE** |
| **Pairs / Echo**, gitlab.com/Relieving | MIT (new, Oct 2026) | Android | Calm pairs game (no timer, missed pairs stay face up, score never below 10, screen-reader friendly) and Simon-style melody repeat | **REUSE CODE** (review first; very young) |
| 1toX, gitlab.com/og8org/1tox | MIT (README) | Android | Number-order span | REUSE CODE (trivial) |
| DékaDico, F-Droid | MIT | Android | Spoken-number (auditory) span | REUSE CODE |
| sudaku, codeberg.org/theoden8/sudaku | MIT | Flutter | Sudoku with pattern assists | REUSE CODE |
| **Memoria Activa**, codeberg.org/rob76uhm/Memoria_Activa | AGPL-3 | One HTML5 file | **Spanish** cognitive stimulation for Alzheimer's, Parkinson's and Lewy-body dementia. 30 exercises at 3 intensities, no timers, no failures, buttons ≥96 px. The closest open project to Remindable's Rebuild profile. | PORT IDEAS |
| pyrehab, gitlab.com/jbompensieri/pyrehab | No licence | Python/pygame | UNSAM (Argentina) thesis: stimulation for older adults | PORT IDEAS |
| **HabsGleich**, gitlab.com/codecivil/habsgleich | GPL-3+ (package.json conflicts) | Cordova | Diary that quizzes you on your own past entries and plots a personal "mind index" | PORT IDEAS (personal memory metric) |
| **Keepsong**, gitlab.com/theagentfactory/keepsong | No licence | PWA | Dementia reminiscence: one-button voice stories, daily prompts, PIN-protected caregiver mode | PORT IDEAS |
| Forgettable, codeberg.org/tunix | No licence | Flutter/Angular | Thesis: digital clock-maze screen for early AD | PORT IDEAS |
| BrainTraining (Codeberg), brainjogging, Mental Math, Quinb, Libre Memory Game, Memo Game (SECUSO) | GPL-3 / AGPL-3 | Kotlin/Flutter/Godot | Arithmetic, recall, Stroop, pairs, reaction | PORT IDEAS |
| **PocketCheck**, codeberg.org/Gonbei774/PocketCheck | GPL-3 | Android | Periodically asks "Anything to put in your pocket?" (external working-memory prompt) | PORT IDEAS |
| Total Recall (F-Droid) | MIT | Android | Local photo/text/location memory helper | REUSE CODE / ideas |
| ReminDiary | GPL-3+ | Android | Resurfaces "this day in past years" | PORT IDEAS |
| aphasia.help, gitlab.com/dhh---aphasia | CC-BY-4.0 | Angular | Aphasia information site | REUSE CONTENT (with attribution) |

### 8.3 Senior-focused projects
| Project | Licence | What it does | Verdict |
|---|---|---|---|
| **MedTimer** (F-Droid, 622★) | MIT | Offline medication reminders with intake log. The only mature permissive medication reminder. | **REUSE CODE** |
| Dosezy | MIT | Medication for patients and caregivers | REUSE CODE |
| Did I Take My Meds?, RxDroid, DailyPill, Simpill | GPL-3 | Reminders and "did I already take it?" | PORT IDEAS |
| **Jitsi Meet** (+ React Native SDK, 30k★) | Apache-2.0 | Video calls with no account. Base for a one-tap "call family" button. | **REUSE CODE** |
| Elderly Launcher (codeberg.org/epsilon-lyrae) | MIT | Large, simple home screen (Flutter) | REUSE CODE |
| Olauncher, Fossify Launcher, Senior Launcher, yinxing, BaldPhone (Apache-2.0, has RTL) | GPL-3 (BaldPhone Apache) | Simplified launchers | PORT IDEAS (BaldPhone reusable) |
| picframe, home-gallery (family send photos via a Telegram bot), MagicMirror² + MMM-ModuleScheduler | MIT | Photo frames and wall displays with time-of-day screens | REUSE CODE |
| ImmichFrame | GPL-3 | Family photo frame | PORT IDEAS |
| whattimeisit, davidnewcomb/dementia-clock | MIT | Dementia day clocks ("Tuesday morning") | REUSE CODE (trivial) |
| chamboard (Codeberg) | MIT | E-paper reminder display for an elderly parent | REUSE CODE / ideas |
| Mail2Voice (framagit) | GPL-3 | Voice email for people with cognitive impairment | PORT IDEAS |
| Aucards | GPL-3 | Communication cards for non-verbal moments | PORT IDEAS |

### 8.4 Non-English batteries and rehab projects
- **Spanish:**
  - habla-anomia (README says MIT, no LICENSE file)
  - ictus-cerebral (MIT, post-stroke rehab, Streamlit)
  - margoth (MIT)
  - VolverAEmpezar (GPL-3)
  - cognitask (GPL-3, Argentina)
  - PESCO (no licence)
  - Memoria Activa and pyrehab (§8.2)
- **Portuguese:** Afasia-Brasil (MIT, Ionic aphasia app).
- **French:** Atelier (MIT, senior games); synapso (no licence).
- **Italian and German:** only student repos (no licence / MIT, low value).
- **Greek, SciFY:** Dianoia-Marketplace (Apache-2.0, content marketplace in EL/EN/IT/ES), Memor-i-Studio (Apache-2.0, audio memory-game authoring), TalkAndPlay (Apache-2.0).
- **Arabic:** only one stub repo (Ain-Jamel, no licence). **Still nothing usable in Arabic.**
- **Assessment code:** Charlie2 (MIT, 9-test battery); computer-adaptive Philadelphia Naming Test in R (GPL-3); Rey-figure deep-learning scoring (CC BY-NC); UDS reliable-change scoring (no licence).
- **EU projects** (CAPTAIN, SMART4MD, Dem@Care, eWALL, In-MINDD, Long Lasting Memories): no public code found.

### 8.5 Tip of the tongue, word retrieval, conversation and memory prosthetics
| Project | Licence | What it does | Verdict |
|---|---|---|---|
| **daveshap/Semantic_Embedding_Reverse_Dictionary** | MIT | Describe a word, get candidates via embeddings and vector search. Works in any language with a multilingual embedder. | **REUSE CODE** (simplest ToT helper pattern) |
| thunlp/MultiRD | MIT | Research reverse-dictionary model (EN/ZH) | REUSE / PORT IDEAS |
| thunlp/WantWords (7k★) | **No licence** | Best-known reverse dictionary | PORT IDEAS only |
| **wiktextract / kaikki.org** | Code MIT; data CC-BY-SA/GFDL | Structured Wiktionary definitions, synonyms and hypernyms for es/en/ar | REUSE CONTENT: legal source for semantic cues and a reverse dictionary |
| CODWOE (SemEval-22) | CC-BY-SA | Definition↔embedding data incl. Spanish | REUSE CONTENT (with attribution) |
| Spanish reverse dictionaries (Ismael9993 GPL-3; alexgcarretero scrapes RAE) | — | — | PORT IDEAS; avoid RAE data |
| TREC tip-of-tongue datasets (Spotify CC0, Microsoft CC-BY-SA) | as listed | "The film/song where…" known-item retrieval | PORT IDEAS / content |
| **Memoro** (MIT Media Lab, CHI'24) | MIT | Infers what you're trying to remember mid-conversation | **PORT IDEAS / REUSE CODE**: closest to "where were we?" |
| **Omi** (13.6k★) | MIT | Wearable plus apps: conversation transcription, summaries, memory chat | REUSE CODE: base for conversation recap |
| Owl | MIT | Local wearable AI capture | REUSE CODE |
| MentraOS | Apache-2.0 | Smart-glasses OS with live captions | PORT IDEAS |
| openrecall, khoj, Windrecorder | AGPL/GPL | Screen or life recall | PORT IDEAS |
| screenpipe, ADeus | Commercial / CC BY-NC-ND | — | AVOID |

## 9. Logic and puzzle engines usable for procedural levels

**Use Simon Tatham's Portable Puzzle Collection (MIT) as the base engine.** It ships 40 puzzles, each with a generator that guarantees solvable puzzles and grades difficulty with its solver. There is an official WASM web build and an MIT Android port (chrisboyle/sgtpuzzles). Good fits for older adults: Solo (sudoku), Keen (KenKen, can be limited to + and −), Towers, Unequal, Pattern (nonogram), Light Up, Map, Bridges, Flip (Lights Out), Fifteen, Guess (Mastermind), Mines (no-guess), Untangle, Same Game, Tents. Keep the copyright notice.

| Family | Permissive engine | Difficulty knobs | Notes |
|---|---|---|---|
| Sudoku | **sudoku-core** (TS, MIT: grades by human technique, step hints), sudoku-gen (MIT), dancing-links (MIT, uniqueness), Tatham Solo | Hardest technique needed; 4×4 → 6×6 → 9×9 | Avoid qqwing/HoDoKu (GPL) |
| KenKen / Kakuro | Tatham Keen; cdok (ISC) | Cage size, operators, deduction level | No permissive Kakuro generator; build with `logic-solver` |
| Nonogram | Tatham Pattern; ThomasR/nonogram-solver (Apache-2.0); nonogrid (MIT, WASM) | Grid 5×5→15×15; accept only line-solvable puzzles | Curated pixel-art pictures work well for seniors |
| Logic grid (Einstein) | tuchandra/zebra (MIT, SAT); `logic-solver` (npm, MIT) | 3×3 → 4×4; clue types (direct → negative → relative → either/or) | Avoid zebra4j/zebra-apps (AGPL) |
| Raven-style matrices | **None permissive.** RAVEN/I-RAVEN are GPL-3; MaRs-IB and ICAR are non-commercial | Number of rules; attribute type; 2×2 → 3×3 | **Build our own** from the RAVEN grammar, with I-RAVEN-style distractors |
| Number/pattern series | None found | Rule count; + → × → second-order; sequence length | **Build our own** (Simon & Kotovsky; Arendasy & Sommer) |
| Tower of London / Hanoi | jspsych-contrib tower-of-london UI (MIT) | ToL: 36 states, enumerate by BFS, grade by minimum moves (2–7) and subgoal moves | Write the generator ourselves (trivial) |
| Corsi / Schulte / n-back | jspsych-contrib corsi-blocks and spatial-nback (MIT) | Span; path crossings; grid size; n | — |
| Tangram | jspsych-contrib tangram (MIT) | Piece count, silhouette complexity | — |
| Mastermind, 15-puzzle, Lights Out, Bridges, Slitherlink | Tatham Guess / Fifteen / Flip / Bridges / Loopy (MIT) | Colours & pegs; optimal distance; presses; grid | — |
| Flow / numberlink | **None permissive** (AGPL / CC BY-NC) | — | Build with `logic-solver` |
| Crossword / word search | Crossword-Layout-Generator (MIT), @blex41/word-search (MIT), bunkat/wordfind (MIT) | Word frequency and length; directions allowed; grid size | Needs per-language word lists |
| Semantic distractors | Open English WordNet (CC BY 4.0), wordpos (MIT); ConceptNet (CC BY-SA) | Semantic similarity of foils | — |
| Constraint solvers | `logic-solver` (MIT, JS), Z3 (MIT, WASM), OR-Tools (Apache), MiniZinc (MPL) | — | For uniqueness checks and offline batch generation |

**Top 10 update:** Simon Tatham's Puzzles (MIT) and Braincup (Apache-2.0) now belong in the Top 10 above jsPsych and Experiment Factory. Tatham's collection gives procedurally generated, graded logic exercises in every family Remindable needs. Braincup is the closest permissive brain-training app.

## Gaps nobody fills (opportunity for Remindable)

1. **No permissively licensed, mobile (React Native/PWA) cognitive *training* app for older adults exists.** Open projects are research tools (jsPsych, m2c2kit), copyleft platforms (MindLogger CPAL, mindLAMP AGPL, Cboard GPL) or abandoned student prototypes with no license. A polished, evidence-informed RN app has no open competitor.
2. **Arabic is almost completely absent.** No open Arabic cognitive-training app, no Arabic anomia/naming app, no Arabic clinical speech corpus, and no open Arabic screening tool. The only assets are Tawasol symbols, the Gulf, Lebanese (MultiPic) and Tunisian naming norms, Aralex, A-RUDAS and iSupport-Qatar. An **Arabic (with dialect awareness) word-finding trainer** would be a first.
3. **Trilingual *switching* as an exercise.** Bilingual-aphasia work (BAT) treats languages separately. Nobody uses the user's own languages *as a resource* (cross-language cueing: "you can't find *tenedor*? you said *fork*") for anomia or for older adults' cognitive reserve.
4. **Everyday word-finding rescue, outside therapy drills.** Lexical (a reverse dictionary for aphasia) and the Azure GPT sample show the idea, but no maintained tool offers *in-the-moment* tip-of-the-tongue help: describe it, get a cueing hierarchy (semantic, then first sound, then the word), and log it for later practice with FSRS. Remindable can close the loop from real-life failures to personalised practice items.
5. **"Losing the thread" of conversations (TBI/MCI).** No open tool addresses discourse coherence: summarising "what were we talking about?", or training topic maintenance. Discourse-Assessments only *elicits* samples. Conversation-thread recap is a new product category.
6. **Prospective-memory support that teaches the habit.** ApplTree's finding is that ABI users forget to *create* reminders. Open reminder apps ignore this, and NeuroPage-style evidence is not in any open app. Prompted reminder capture, combined with training of intention-retention, is unclaimed.
7. **Personalised naming stimuli from the user's own life.** Elisabot and Prisma show photo-based reminiscence, but no open tool turns *family photos* into naming and recall exercises with spaced retrieval and errorless learning (the evidence-based approach for dementia).
8. **Measurement with validated, permissive tasks, plus training-progress transparency.** m2c2kit gives Apache-2.0 validated tasks, but nobody packages them with a lay-friendly progress view and honest claims. Most consumer apps either overclaim or show nothing.
9. **On-device speech scoring in es/ar for naming and fluency.** Plenty of research code (ADReSS, DisVoice) exists, but no app does private, offline spoken-naming verification (whisper.rn or Vosk grammar mode) in Spanish and Arabic.
10. **Dialect-aware Spanish content.** Norms exist for Castilian and Rioplatense Spanish (MultiPic, SWOW-RP), but there is little for Mexican, Andean or Caribbean Spanish. Letting users flag "we say it differently" would build a unique dataset.

**Licensing summary for Remindable (commercial-safe stack):** m2c2kit, ResearchKit algorithms, expfactory (MIT), jsPsych, PsychoJS, JATOS, ts-fsrs, whisper.rn/whisper.cpp, Vosk, DisVoice and SpeechBrain for code. MultiPic (CC BY), Tawasol, Mulberry and OpenMoji (CC BY-SA), Twemoji (CC BY), Aralex and EsPal (check terms), plus Gulf Arabic norms (ask) for content. **Keep out of the product:** ARASAAC (NC), Sclera (NC), openSMILE (NC), Meta MMS (NC), DementiaBank/AphasiaBank (NC), SWOW (NC-ND), and all GPL/AGPL/CPAL code (Cboard, MindLogger, mindLAMP dashboard, brainworkshop, Novoic). Licensed instruments (MoCA, ACE-III, AD8, BNT, CERAD) also stay out.

## Sources (non-GitHub)
- RECODE (Padova): https://indico.sissa.it/event/149/contributions/3111/
- OCTAL: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12909784/
- Mobile Toolbox: https://mobiletoolbox.org/research/ ; https://pmc.ncbi.nlm.nih.gov/articles/PMC9746407
- Gulf Arabic picture norms: https://ifp.nyu.edu/2018/journal-article-abstracts/s13428-018-1019-6/ ; http://qufaculty.qu.edu.qa/tariq-khwaileh/download-center/
- MultiPic: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9304413/
- Tawasol: https://tawasol.mada.org.qa/terms-and-conditions/?lang=en
- A-RUDAS: https://pubmed.ncbi.nlm.nih.gov/25984584
- WHO iSupport: https://hamad.qa/EN/your%20health/Healthy-Ageing/Geriatric-Services/Dementia-Support/Pages/Acknowledgement.aspx ; https://uvadoc.uva.es/handle/10324/80184
- SWOW-RP: https://smallworldofwords.org/en/project/research
- EsPal: https://diposit.ub.edu/dspace/handle/2445/49847 ; Aralex: https://faculty.uaeu.ac.ae/s_boudelaa/aralex.html
- CRE Alzheimer guide: https://crealzheimer.imserso.es/documents/20123/372665/guia_estimulacion.pdf/1e844253-a507-5a1b-d701-05d9cbd1b589
- UCL CST Spanish: https://www.ucl.ac.uk/brain-sciences/sites/brain_sciences/files/2026-08/cst_estimulacion_cognitiva1_en_linea.pdf
- ABI reminder apps (ApplTree): https://eprints.gla.ac.uk/299951 ; Waikato augmented memory: https://researchcommons.waikato.ac.nz/handle/10289/9234
- EU serious games: https://eurocarers.org/bridge-project-new-serious-games-for-dementia-tested-and-ready-to-be-launched/ ; https://adgaming.ibv.org/en/home/
- Naming-therapy apps: https://research.aphasia.com/2023/02 ; https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12440831/
- Vosk: https://www.linuxlinks.com/vosk-offline-speech-recognition-toolkit/
