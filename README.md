# RiskLens AI — Explainable Corporate Debt Risk Assessment Web App

> **RiskLens AI** is an institutional-grade, AI-assisted corporate credit and debt risk intelligence platform. It ingests verified public financial statements (SEC EDGAR) and high-fidelity synthetic stress-test profiles, computes deterministic financial solvency ratios, produces an explainable credit risk scorecard (0–100), and empowers credit committees to stress-test capital structures under volatile macroeconomic scenarios.

---

## 🌟 Executive Summary & Purpose

Corporate credit risk analysis requires quantitative rigor, transparent provenance, and interpretable explanations. Traditional black-box rating models and LLM hallucinations fail to meet institutional auditability standards.

**RiskLens AI** bridges this gap:
- **Deterministic Math:** Financial ratios, coverage multiples, liquidity runways, and weighted scorecard contributions are computed using pure deterministic algorithms.
- **Explainable Attribution:** Every risk assessment reconciles into exact scorecard factor impacts (`+34% impact` from margin compression, `+26% impact` from short-term debt refinance pressure) rather than opaque scores.
- **Evidence-First Data Quality:** All 11 foundational financial parameters (Balance Sheet, Income Statement, and Cash Flows) track provenance, footnotes (e.g., pension obligations, operating leases), and balance sheet identity reconciliation.
- **Interactive Scenario Stress-Testing:** Real-time macroeconomic and valuation sliders simulate revenue shocks, EBITDA margin compression, benchmark interest rate hikes, and CapEx curtailments with instantaneous covenant delta analysis.
- **Institutional Credit Committee Deliverables:** Includes printable/PDF reports, downloadable Excel financial models, cryptographic audit logs (`JSON`), and multi-party sign-off blocks.

---

## 🚀 The 5-Step End-to-End Workflow

```
[ Step 01 ] Company Selection & Scope
     │     └── Choose Public SEC EDGAR profile or Synthetic Stress Benchmark
     ▼
[ Step 02 ] Data Ingestion & Validation
     │     └── 11 Core Financial Inputs • Live Cell Editor • CSV Parser • Footnotes
     ▼
[ Step 03 ] Explainable Risk Assessment
     │     └── 0-100 Risk Score • 3-Year Sparklines • Scorecard Factor Contributions
     ▼
[ Step 04 ] Scenario Explorer & Stress-Testing
     │     └── Levers (Revenue, Margin, Rate Shock, CapEx) • Presets • FCF Trajectory
     ▼
[ Step 05 ] Final Credit Committee Report
           └── Memorandum • Ratios Table • Covenants • Sign-Off • PDF & Excel Export
```

### 1. Company Selection & Analytics Scope
- **Public Market Ingestion:** Direct SEC EDGAR 10-K/10-Q filing connector with ticker lookup (e.g. `AAPL`).
- **Synthetic Stress-Test Engine:** Pre-configured corporate risk profiles engineered to represent realistic, complex leverage scenarios.
- **Curated Benchmark Profiles:** Instant 1-click loading across industry sectors.

### 2. Financial Data Ingestion & Validation
- **4 Ingestion Channels:** *Public Dataset*, *Synthetic Load*, *CSV / Excel Upload* (with template download and parser), and *Manual Override*.
- **Interactive Financial Statement Inspector:** Editable tabular grid tracking 11 core financial parameters across three consecutive fiscal periods (`FY2021`, `FY2022`, `FY2023`).
- **Data Quality Dashboard:** Validates field completeness (11/11, 100%), flags footnote disclosures, and checks period alignment.

### 3. Explainable Risk Assessment Results
- **Overall Risk Index (0–100):** Clear categorization into *Low Risk* (0–35), *Moderate Risk* (36–65), and *High Risk* (66–100) with assigned credit ratings (AAA to CCC).
- **Ratios & Inline Trend Sparklines:** Multi-year trend sparklines for Total Debt/EBITDA, Interest Coverage, Debt-to-Equity, Current Ratio, Free Cash Flow, and Net Debt/EBITDA.
- **Primary Risk Drivers & Mitigating Buffers:** Explicit attribution showing percentage impact on credit risk score and plain-language financial narratives.
- **Actionable Analyst Recommendations:** Deterministic next steps with interactive triggers (`Assign`, `Simulate`, `Audit`).

### 4. Scenario Explorer & Assumption Stress-Testing
- **Valuation Levers:**
  - Revenue Growth Rate (`-20.0%` to `+20.0%`)
  - EBITDA Margin Shift (`-5.0%` to `+5.0%`)
  - Interest Rate Shock (`+0 bps` to `+300 bps`)
  - CapEx Adjustments (`-40%` to `+50%`)
- **Preset Stress Profiles:** Single-click simulation presets for *Stagflation*, *Tech Crunch*, and *Bull Rally*.
- **Comparative Delta Matrix:** Side-by-side comparison of baseline vs. simulated metrics:
  - Composite Risk Score Delta (`± pts`)
  - Interest Coverage Covenant Delta (`± x`)
  - Leverage Ratio Delta (`± x`)
  - Liquidity Cash Runway (`± months`)
- **Projected Free Cash Flow Trajectory:** Interactive quarterly bar visualization (`Q1 Base`, `Q2 Sim`, `Q3 Sim`, `Q4 Sim`, `FY25E`).
- **Scenario Management:** Save scenario state or export directly to the final credit memorandum.

### 5. Final Credit Committee Risk Assessment & Report
- **Institutional Dossier:** Formal Credit Committee Memorandum with Scorecard ID, Rating, Facility Limit, and Stress Test Survivability.
- **5 Structured Sections:**
  1. Executive Summary & Committee Recommendation
  2. Synthetic & Public Data Provenance Statement
  3. Detailed Financial Ratio Analysis (Prior Year, Current Year, Evaluated TTM, Target Benchmarks, Status)
  4. Stress Test Scenario Findings (Recession, Margin Shock, CapEx Containment)
  5. Actionable Analyst Recommendations & Protective Covenants
- **Sign-Off Block:** Interactive sign-offs for Lead Risk Analyst, Chief Risk Officer (CRO), and Committee Chairperson.
- **Audit & Export Tools:**
  - Print / PDF Report (`window.print()` with dedicated print CSS media queries)
  - Full Financial Model Spreadsheet Export (`.csv` / Excel format)
  - Cryptographic Audit Log Download (`JSON` with SHA-256 style hash)

---

## 📊 Pre-Loaded Company Profiles

| Company Profile | Ticker | Sector | Type | Risk Rating | Debt / EBITDA | Interest Coverage | Credit Profile Summary |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Northstar Mfg. Corp.** | `NSTR` | Industrials | Synthetic | **BBB+** (Stable) | 2.08x | 5.77x | Stable earnings, manageable leverage, strong interest coverage, and healthy operating cash flow. |
| **BluePeak Retail Inc.** | `BPRT` | Consumer Cyclical | Synthetic | **B+** (Watchlist) | 4.81x | 1.31x | Increasing debt burden, declining operating margins, tight working capital, and $45M near-term refinancing obligations. |
| **Apex Infra. Group** | `APXG` | Utilities & Infra | Synthetic | **CCC** (Vulnerable) | 7.44x | 0.83x | Heavy debt burden, subordinated debt covenant breach, weak OCF relative to debt, and high rate vulnerability. |
| **Apple Inc.** | `AAPL` | Technology | Public (SEC) | **AAA** (Prime) | 0.88x | 29.06x | Audited SEC EDGAR Form 10-K data (CIK 0000320193), massive organic free cash flow, and fortress liquidity reserves. |

---

## 🧮 Financial Calculation Engine & Scorecard

### Core Ratios Implemented
$$\text{Debt-to-Equity} = \frac{\text{Total Debt}}{\text{Total Equity}}$$

$$\text{Debt-to-EBITDA} = \frac{\text{Total Debt}}{\text{EBITDA}}$$

$$\text{Net Debt} = \text{Total Debt} - \text{Cash \& Cash Equivalents}$$

$$\text{Net Debt to EBITDA} = \frac{\text{Net Debt}}{\text{EBITDA}}$$

$$\text{Interest Coverage Ratio} = \frac{\text{EBIT}}{\text{Interest Expense}}$$

$$\text{Current Ratio} = \frac{\text{Current Assets}}{\text{Current Liabilities}}$$

$$\text{Quick Ratio} = \frac{\text{Cash} + (\text{Current Assets} - \text{Cash}) \times 0.65}{\text{Current Liabilities}}$$

$$\text{EBITDA Margin} = \frac{\text{EBITDA}}{\text{Revenue}} \times 100\%$$

$$\text{Operating Cash Flow to Total Debt} = \frac{\text{Operating Cash Flow}}{\text{Total Debt}} \times 100\%$$

$$\text{Free Cash Flow} = \text{Operating Cash Flow} - \text{Capital Expenditures (CapEx)}$$

### Scorecard Weights & Thresholds

| Factor Category | Weight | Primary Metric | Prime Benchmark | Elevated Risk Threshold |
| :--- | :---: | :--- | :---: | :---: |
| **Leverage Capacity** | **28%** | Total Debt / EBITDA | $\le 2.20\text{x}$ | $\ge 4.50\text{x}$ |
| **Debt Service Coverage** | **26%** | Interest Coverage (EBIT / Int) | $\ge 5.00\text{x}$ | $\le 1.50\text{x}$ |
| **Short-Term Liquidity** | **16%** | Current Ratio | $\ge 1.50\text{x}$ | $\le 1.00\text{x}$ |
| **Cash Amortization** | **16%** | OCF / Total Debt | $\ge 35.0\%$ | $\le 10.0\%$ |
| **Operating Margin** | **14%** | EBITDA Margin | $\ge 20.0\%$ | $\le 8.0\%$ |

*Edge Case Protections:* Handles negative equity, negative EBITDA, zero interest expense, and zero current liabilities with explicit flags without numerical NaN errors or silent substitution.

---

## 💻 Technical Architecture

```
/
├── index.html                    # Entry HTML with IBM Plex Sans & JetBrains Mono typography
├── metadata.json                 # AI Studio applet capabilities and configuration
├── package.json                  # Dependencies and execution scripts
├── vite.config.ts                # Vite build configuration with Tailwind v4
└── src/
    ├── types/
    │   └── index.ts              # TypeScript domain types (Financial statements, ratios, scorecard)
    ├── data/
    │   └── companyFixtures.ts    # Synthetic and verified public financial statement datasets
    ├── services/
    │   ├── financialEngine.ts    # Pure deterministic ratio calculations and formatting helpers
    │   ├── riskScoringEngine.ts  # Explainable weighted scorecard and attribution generator
    │   └── scenarioEngine.ts     # Multi-vector stress-testing and trajectory simulation
    ├── components/
    │   ├── Header.tsx            # Persistent top bar navigation, API status, and brand mark
    │   ├── Footer.tsx            # Footer with cryptographic security badges and copyright
    │   └── screens/
    │       ├── CompanySelectionScreen.tsx # Screen 1: SEC vs Synthetic selection & curated cards
    │       ├── DataIngestionScreen.tsx    # Screen 2: 11-parameter statement table & live cell editor
    │       ├── RiskAssessmentScreen.tsx   # Screen 3: Scorecard, sparklines & risk factor drivers
    │       ├── ScenarioExplorerScreen.tsx # Screen 4: Real-time levers, matrix & FCF trajectory
    │       └── FinalReportScreen.tsx      # Screen 5: Credit Committee Memorandum & export suite
    ├── App.tsx                   # Top-level state coordinator & single source of truth
    ├── index.css                 # Tailwind CSS v4 design tokens and print-friendly styles
    └── main.tsx                  # React 19 entry point
```

### Technology Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (Stitch dark-slate theme: `#081425` surface, `#4edea3` emerald, `#ffb95f` amber, `#ffb4ab` coral)
- **Typography:** IBM Plex Sans (Display & Body) + JetBrains Mono (Financial Tabular Figures)
- **Icons:** Google Material Symbols Outlined + Lucide
- **Charts:** Inline SVG Sparklines & Responsive Trajectory Visualization
- **Data Storage:** Structured local fixtures with live in-memory state and CSV export/import

---

## 🛠️ Development & Build Scripts

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 3. Validate Type Safety & Linting
```bash
npm run lint
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## ⚖️ Positioning & Regulatory Notice

RiskLens AI is designed exclusively as an **analytical screening and preliminary decision-support tool** for credit analysts, lending officers, and risk committees. 

- Outputs represent illustrative algorithmic risk scores and do not constitute an official credit rating agency opinion (e.g., S&P, Moody's, Fitch).
- All synthetic company figures are clearly identified as synthetic models for testing and simulation purposes.
- Public company figures are sourced directly from publicly accessible Form 10-K SEC EDGAR disclosures.
- Final credit facility approvals require certified human credit committee review and independent legal verification.
