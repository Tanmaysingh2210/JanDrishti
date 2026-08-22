# Societal Innovation Collaboration Portal — Website Specification

## 1. Purpose

A platform that lets citizens in Jharkhand report local societal challenges, routes validated challenges to universities for research-based solutions, connects the selected university with industry partners for funding and prototyping, and gives government full visibility from submission to completion.

This document is written as a build spec — hand it to an AI website builder (or a dev team) to generate the platform screen by screen.

---

## 2. Actors and roles

| Role | Can do |
|---|---|
| Citizen | Submit problems, track status of their own submissions |
| AI system | Classify, validate, deduplicate, flag edge cases |
| Government admin | Approve/reject/merge problems, select winning university, verify AI-flagged edge cases, monitor all progress, view credibility scores |
| University | View assigned problems, submit proposals, form teams, post to industry portal, select industry partner, report milestones |
| Industry / MSME / CSR / startup | View open university requests, submit funding/mentorship proposals |
| Public (optional) | View anonymized dashboard of completed challenges and impact stats |

---

## 3. End-to-end workflow

### Stage 1 — Submission
Citizen submits a problem: title, description, category (optional/self-guessed), photos/video, geolocation, supporting documents.

### Stage 2 — AI recognition and validation
AI system:
- Classifies the problem into a domain (education, agriculture, healthcare, water, environment, energy, urban development, accessibility, administration, rural livelihoods).
- Checks for duplicates against existing open problems in the same area.
- Scores confidence of classification/duplicate match.
- **If confidence is high** → auto-tags and passes to government queue as "AI-validated."
- **If confidence is low, or the case is ambiguous (e.g., possible duplicate, unclear category, low-resource language input)** → flagged as an **edge case** and routed to a government reviewer for manual verification before it proceeds. This is a required human checkpoint, not optional.

### Stage 3 — Government review
Government reviewer sees AI-validated problems (light-touch approval) and edge cases (full manual review). Decision options:
- **Approve** → published to state portal for universities.
- **Merge** → combined into an existing open problem; original submitter is linked to the merged record.
- **Reject** → closed with a reason code (e.g., insufficient detail, out of scope, not verifiable).

### Stage 4 — University proposals
Approved problem appears on the state portal. Any eligible university can submit a proposal (approach, timeline, team composition, estimated cost). Multiple universities (e.g., 5) may propose on the same problem.

### Stage 5 — University selection
Government selects one university based on proposal quality **and current credibility score** (see Section 4). The score is a visible input to selection, not just an internal number — low-credibility universities should require additional justification to be selected.

### Stage 6 — Industry portal
The selected university posts the problem + its proposed approach to the industry-facing portal, seeking funding, mentorship, or prototyping partners.

### Stage 7 — Industry selection
Industry partners (MSMEs, startups, CSR bodies, research labs) submit funding/support proposals. The university reviews and selects one (or more, if co-funding is allowed) industry proposal. Selected industry provides funding and/or technical support.

### Stage 8 — Execution, monitoring, completion
University + industry execute the project. Milestones, deliverables, and test/pilot outcomes are logged. Government dashboard tracks status in real time until the challenge is marked complete.

### Stage 9 — Credibility scoring (continuous, runs alongside all stages)
See Section 4 — this isn't a separate stage, it's an always-on score that updates at every milestone, deadline, and completion event.

---

## 4. University credibility score

**Purpose:** give government and future problem-owners a track-record signal when selecting a university, and create accountability for missed commitments.

### Score mechanics
- Every university starts at a baseline score (e.g., 100).
- Score **drops** when:
  - A milestone deadline is missed.
  - A submitted proposal is later abandoned or withdrawn after being selected.
  - A delivered solution fails government/industry validation testing.
  - A project is marked incomplete or stalled beyond a grace period.
- Score **recovers gradually** when:
  - Milestones are completed on time.
  - A project reaches full completion and passes validation.
  - Sustained good performance over multiple cycles.
- Score is **visible** to government during Stage 5 selection, and optionally visible (aggregated, not raw penalty history) on university's public profile.
- A university whose score falls below a defined floor (e.g., 40) is **automatically excluded** from being selected for new problems until it recovers past a re-entry threshold — this needs government override capability for exceptional cases.

### What the website needs for this
- A `credibility_score` field per university, with a full audit log of every change (date, reason, points delta, linked problem ID).
- A scoring rules table (admin-configurable — don't hardcode point values into the UI logic).
- A visual score indicator (e.g., a badge or trend line) on every university's profile and on proposal cards during selection.

---

## 5. Government edge-case verification

**Purpose:** ensure the AI never makes a final call alone on ambiguous submissions.

### What counts as an edge case (AI flags these automatically)
- Low classification confidence (below a set threshold).
- Possible duplicate with a similarity score in an ambiguous middle range (not clearly same, not clearly different).
- Submission with incomplete or contradictory information.
- Content in a language/dialect the AI can't reliably parse.
- Repeated submissions from the same citizen/location flagged as potential spam.

### What the website needs for this
- A dedicated **"Edge case queue"** in the government admin dashboard, separate from routine approvals — these should never get silently auto-approved.
- Each edge case shows: the original submission, AI's confidence score and reasoning, and (if a duplicate concern) the matched existing record side by side.
- Reviewer actions: confirm AI's suggestion, override classification/duplicate call, request more info from citizen, or reject.
- Every manual override should be logged and (ideally) fed back as a labeled example to improve the AI model over time.

---

## 6. Core website modules (build these as separate sections/apps)

1. **Citizen portal** — submit problem, track status, see resolution once complete.
2. **AI processing layer** — backend service, not a UI citizens interact with directly; exposes classification, duplicate-detection, and confidence scores to the admin dashboard.
3. **Government admin dashboard** — approval queue, edge-case queue, university selection screen (with credibility scores), industry selection oversight, full analytics view, credibility score rule config.
4. **University portal** — view assigned/open problems, submit proposals, manage team, post to industry portal, report milestones, view own credibility score and history.
5. **Industry portal** — browse open university requests, submit funding/support proposals, track funded projects.
6. **Public/analytics dashboard** — district-wise and domain-wise stats, completed challenges, aggregate impact (patents, startups, social outcomes) — no personal citizen data exposed here.
7. **Notification system** — status-change alerts to citizens, universities, industry, and government at every stage transition.

---

## 7. Suggested page list

- `/` — Landing page, explains the platform, call to action to submit or log in
- `/submit` — Citizen problem submission form
- `/my-submissions` — Citizen's own tracker
- `/admin/queue` — Government: routine approval queue
- `/admin/edge-cases` — Government: manual edge-case review
- `/admin/select-university/:problemId` — Government: compare proposals + credibility scores, select one
- `/admin/dashboard` — Government: full analytics and progress overview
- `/university/dashboard` — University: assigned problems, own credibility score
- `/university/propose/:problemId` — University: submit a proposal
- `/university/industry-post/:problemId` — University: post to industry portal, review industry proposals, select one
- `/industry/opportunities` — Industry: browse open requests
- `/industry/propose/:problemId` — Industry: submit funding/support proposal
- `/public/impact` — Public: aggregated dashboard

---

## 8. Core data entities

- **Problem**: id, title, description, media, location, category, status (submitted / ai-validated / edge-case / approved / rejected / merged / open-for-proposals / assigned / in-progress / completed), submitted_by, created_at
- **Citizen**: id, name, contact, submissions[]
- **University**: id, name, departments, credibility_score, credibility_log[]
- **Proposal** (university → problem): id, university_id, problem_id, approach, timeline, cost_estimate, status (submitted / selected / rejected)
- **IndustryPartner**: id, name, type (MSME/startup/CSR/lab), past_projects[]
- **IndustryProposal**: id, industry_id, problem_id (via selected university), funding_offer, support_type, status
- **Milestone**: id, problem_id, university_id, description, due_date, completed_date, status
- **CredibilityEvent**: id, university_id, problem_id, points_delta, reason, timestamp
- **EdgeCaseReview**: id, problem_id, ai_confidence, ai_reasoning, reviewer_id, decision, timestamp

---

## 9. Suggested tech stack (adjust to your team's comfort)

- **Frontend**: React (Next.js) or plain React SPA — needed for role-based dashboards (citizen / government / university / industry are visually and functionally distinct)
- **Backend**: Node.js/Express or Django REST — needs to support role-based auth and a workflow/status-machine for `Problem.status`
- **Database**: PostgreSQL — relational fits well given proposals, milestones, and credibility logs all reference each other
- **AI/ML layer**: Python microservice (FastAPI) for classification and duplicate detection, called by the backend as an internal API
- **Auth**: Role-based access control (citizen, government, university, industry, admin)
- **Notifications**: Email/SMS gateway + in-app notification table

---

## 10. Notes for the AI website builder

- Treat `Problem.status` as a strict state machine — don't allow UI actions that skip stages (e.g., a problem can't go straight from "submitted" to "completed").
- The credibility score must never be directly editable from the UI as a raw number — only through logged events with a reason, so the audit trail stays intact.
- Edge cases must be a hard gate: an AI-flagged edge case cannot reach "approved" status without a government reviewer's explicit decision recorded against it.
- Build the government dashboard first — it's the module every other role's data flows into, and it's the easiest way to validate the full data model early.
