# CyberShield — Cyber Fraud Detection, Response & Investigation Platform

A frontend-only, production-styled prototype for a national cyber-fraud coordination
platform connecting Victims, Source Banks, Destination Banks, Telecom Operators,
the Cyber Crime Department, and Administrators.

Pure HTML5 / CSS3 / vanilla ES6 + Chart.js. No React, no Bootstrap, no Tailwind,
no build step — open any `.html` file directly in a browser, or serve the folder
with any static file server.

## How to run

Just open `public/index.html` in a browser. All internal links are relative, so
you can also serve the whole folder:

```
npx serve cybershield
# or
python3 -m http.server --directory cybershield 8080
```

## Structure

```
cybershield/
├── css/
│   ├── tokens.css        Design tokens: color, type scale, spacing, radius, shadow, dark mode
│   ├── base.css           Reset, typography, app-shell/sidebar/topbar layout primitives
│   ├── components.css     Buttons, cards, chips, tables, nav, modals, toasts, forms, etc.
│   ├── auth.css           Split-screen auth layout
│   └── public.css         Marketing site nav/footer/hero/prose styles
├── js/
│   ├── data.js            Shared mock data layer (cases, evidence, freeze requests, etc.)
│   ├── shell.js           Renders the sidebar + topbar per role (avoids duplicating nav markup)
│   └── app.js              Theme toggle, sidebar collapse, popovers, modals, toasts
├── public/                 Marketing site (Home, Features, How it Works, Security, About,
│                            Contact, FAQs, Privacy, Terms, Careers)
├── auth/                   Login, Role Selection, MFA, Forgot/Reset Password
├── errors/                 404, 403, 500, Session Expired
├── citizen/                 Citizen Portal: Dashboard, Report Fraud (4-step wizard), Fraud
│                            Alerts, My Cases, Case Details, Recovery Status, Upload History,
│                            Notifications, Messages, Support, Settings, Profile
└── institutional/
    ├── source-bank/         Dashboard, Pending Complaints, Complaint Verification,
    │                        Transaction Verification, Generate/Sent Freeze Requests,
    │                        Case Updates, Notifications, Reports
    ├── destination-bank/    Dashboard, Pending/Approve/Reject Freeze Requests, Frozen
    │                        Accounts, Investigation Updates, Reports
    ├── telecom/              Dashboard, SIM/IMEI Verification, Device Details,
    │                        Investigation Requests, Completed Reports
    ├── cybercrime/           Dashboard, All Cases, Priority Queue, Investigation Timeline,
    │                        Assign Officer, Linked Cases, Fraud Network Graph (interactive
    │                        SVG graph), Evidence Review, Case Closure, Analytics
    └── admin/                Dashboard, User/Institution Management, Roles, Permissions,
                              Audit Logs, Platform Analytics, Reports, System Health, Settings
```

## Design system

All colors, spacing, type, radius, and shadow values are CSS custom properties in
`css/tokens.css`. Dark mode is a single `[data-theme="dark"]` attribute swap — toggle
it from the topbar moon/sun icon on any institutional/citizen page. Reusable UI
patterns (buttons, cards, status chips, tables, timelines, modals, toasts, skeletons,
empty states, forms, pagination) live in `css/components.css` and are used consistently
across all ~60 pages.

## Notes on scope

This build focuses on making every included page **fully functional with realistic
mock data and working interactions** (tabs, modals, toasts, multi-step forms, an
interactive fraud-network graph, live Chart.js analytics) rather than generating a
larger number of shallow placeholder pages. The navigation config in `js/shell.js`
already lists the full IA for every role — extending to any remaining page (e.g.
additional report types) means duplicating an existing sibling page's markup and
pointing it at `CS_DATA`, since the design system and shell already do the heavy
lifting.

## Mock data

Everything renders from `js/data.js` (`CS_DATA`) — cases, evidence, freeze requests,
SIM/IMEI requests, audit logs, institutions, users, the fraud-network graph, and
analytics series. Swap this file for real API calls to wire up a backend; the shapes
in the comments describe the intended contract.
