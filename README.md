# 📊 LTI Hub Portal 6 - Finance & Billing Frontend

A premium, state-of-the-art Finance Dashboard and Reporting & Analytics hub built as part of the **LTI Hub Portal 6 Specification**. This module implements the frontend components for Subscription Management, Expense Claims, Financial/Operational Reports, and Interactive Visual Analytics.

---

## 🛠️ Technology Stack
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Custom color configurations)
* **Icons:** Lucide React
* **Charts/Visualizations:** Recharts (Area, Line, Bar, Pie charts)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js installed on your machine.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Build for Production
To verify compilation and check linting rules:
```bash
npm run build
```

---

## 📂 Active Routes & Features

| Route | View Component | Key Features |
|---|---|---|
| `/` | **LTI Hub Gateway** | Entrypoint to launch the Portal 6 Finance dashboard. |
| `/finance` | **Overview Dashboard** | KPI overview cards, MRR/ARR summary, and quick list of recent subscriptions/expenses. |
| `/finance/subscriptions` | **Subscription Manager** | Searchable/filterable subscription directory with CRUD actions and detail view. |
| `/finance/expenses` | **Expense Claims Manager** | Manage claims, submit new reimbursements, and approve/reject workflows. |
| `/finance/reports` | **Reports Hub** | P&L statements, Tax Liabilities, AR Ageing, and Operational Department reports. |
| `/finance/analytics` | **Visual Analytics** | Rich dashboards visualizing MRR Trends, Expense Distribution, and Churn Rate. |

---

## 💎 Design and Aesthetics
* **Color Palette:** Curated Slate/Zinc dark backgrounds with deep royal blues, emerald green for success elements, amber for warning warnings, and rose for danger/cancellations.
* **Micro-animations:** Added custom fade-in, slide-in, and zoom keyframes in `globals.css` to offer a premium, responsive feel.
* **Chart Tooltips:** Custom themed tooltips for Recharts to ensure consistent dark-mode visuals.

<!-- Trigger PR3 recalculation -->

