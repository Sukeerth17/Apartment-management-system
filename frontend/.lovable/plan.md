

# Water Billing AI System — Implementation Plan

## 1. Authentication Pages (Mobile-First)

### Signup Screen
- Gmail and Confirm Gmail fields with `@gmail.com` validation
- Matching email check before submission
- Success toast: "Your password has been sent to your Gmail"

### Login Screen
- Gmail + Password fields
- "Forgot Password" link
- On success → redirect to Dashboard

### Forgot Password Screen
- Gmail input field
- Success message displayed after submission

All auth screens will use a clean, centered card layout optimized for mobile with large touch-friendly buttons.

**Note:** Auth will be wired to call your backend API endpoints (`/auth/register`, `/auth/login`, `/auth/forgot-password`). JWT stored in localStorage with protected route guards.

---

## 2. Dashboard — Main App (Single Scrollable Page)

The dashboard is a vertically stacked card layout, mobile-first:

### 📤 Upload Excel Card
- Drag & drop zone + file picker (`.xlsx` only)
- Shows uploaded file name
- "Upload & Analyze" button (calls `/upload` then `/process`)

### 📊 Water Usage Summary Cards
- **Units Consumed:** Cauvery, Tanker, Borewell (auto-calculated), Total
- **Cost Breakdown:** Cauvery Cost, Tanker Cost, Borewell Cost, Operation Charges, Fixed Maintenance, Total Amount
- Clean card grid (1 column mobile, 2 columns desktop)

### ⚙️ User Inputs Card
- Editable fields: Cost Per Unit, Fixed Maintenance Charge
- If filled → override system values; if empty → use Excel defaults

### 🔍 Preview Table
- Horizontally scrollable table showing processed data
- Added columns: Water Bill and Maintenance (with formulas applied)

### 📥 Download Section
- Sticky bottom "Download Excel" button on mobile
- Calls `/download/:fileId` to get the processed `.xlsx`

### 🚪 Logout
- Logout button in header/nav
- Clears JWT, redirects to login

---

## 3. UI/UX Design
- Tailwind CSS with rounded cards, soft shadows, smooth transitions
- Mobile: full-width stacked cards, large buttons, sticky bottom actions
- Desktop: centered max-width container, expanded table view
- Toast notifications for all errors (invalid file, upload failed, processing error)
- Loading states with disabled buttons during API calls

---

## 4. Technical Architecture
- **Pages:** Login, Signup, ForgotPassword, Dashboard
- **Components:** UploadCard, SummaryCards, CostInputs, PreviewTable, DownloadButton
- **API Service:** Centralized API layer with JWT auth headers for all endpoints
- **Route Protection:** Auth guard redirecting unauthenticated users to login
- **State Management:** React state + React Query for API data fetching

