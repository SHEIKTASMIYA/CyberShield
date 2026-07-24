/* ==========================================================================
   CYBERSHIELD — PORTAL SHELL ARCHITECTURE
   Renders responsive sidebar + topbar for all 6 portals with active tab
   highlighting, dark mode toggle, density mode, notification popovers,
   and ⌘K Command Palette integration.
   ========================================================================== */

const CS_ICONS = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
  file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  upload:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>',
  briefcase:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  trend:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  help:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4"/><path d="M12 17h.01"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  bank:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M4 21V9l8-5 8 5v12M9 21v-6h6v6"/></svg>',
  freeze:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M4.9 6.9l14.2 10.2M19.1 6.9 4.9 17.1M2 12h20"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  sim:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 9h6v6H9z"/></svg>',
  device:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  network:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 6h7.6M6 8.2v7.6M18 8.2v7.6M8.2 18h7.6"/></svg>',
  timeline:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 8v8M8 6h4a4 4 0 0 1 4 4M8 18h4a4 4 0 0 0 4-4"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1 0 7.8"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 3 6v6c0 5 3.8 9.3 9 10 5.2-.7 9-5 9-10V6l-9-4Z"/></svg>',
  key:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 7.7-7.7 2 2M16 5l3 3"/></svg>',
  audit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  pulse:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  building:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 6h1M14 6h1M9 10h1M14 10h1M9 14h1M14 14h1"/></svg>',
  logout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
  activity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
};

const CS_NAV = {
  citizen:{
    label:"Citizen Portal", root:"",
    groups:[
      {items:[
        {page:"dashboard", label:"Dashboard", icon:"home", href:"dashboard.html"},
        {page:"fraud-alerts", label:"Fraud Alerts", icon:"alert", href:"fraud-alerts.html", badge:2},
        {page:"report-fraud", label:"Report Fraud", icon:"file", href:"report-fraud.html"},
      ]},
      {label:"My Cases", items:[
        {page:"my-cases", label:"My Cases", icon:"briefcase", href:"my-cases.html"},
        {page:"case-details", label:"Case Details", icon:"file", href:"case-details.html"},
        {page:"upload-history", label:"Upload History", icon:"upload", href:"upload-history.html"},
      ]},
      {label:"Account", items:[
        {page:"notifications", label:"Notifications", icon:"bell", href:"notifications.html", badge:3},
        {page:"messages", label:"Messages", icon:"chat", href:"messages.html"},
        {page:"support", label:"Support", icon:"help", href:"support.html"},
        {page:"settings", label:"Settings", icon:"settings", href:"settings.html"},
        {page:"profile", label:"Profile", icon:"user", href:"profile.html"},
      ]}
    ]
  },
  sourceBank:{
    label:"Source Bank", root:"",
    groups:[
      {items:[
        {page:"dashboard", label:"Dashboard", icon:"home", href:"dashboard.html"},
        {page:"pending-complaints", label:"Pending Complaints", icon:"alert", href:"pending-complaints.html", badge:5},
        {page:"complaint-verification", label:"Complaint Verification", icon:"file", href:"complaint-verification.html"},
        {page:"transaction-verification", label:"Transaction Verification", icon:"search", href:"transaction-verification.html"},
      ]},
      {label:"Freeze Requests", items:[
        {page:"generate-freeze", label:"Generate Freeze Request", icon:"freeze", href:"generate-freeze-request.html"},
        {page:"sent-requests", label:"Sent Requests", icon:"upload", href:"sent-requests.html"},
      ]},
      {label:"Operations", items:[
        {page:"case-updates", label:"Case Updates", icon:"timeline", href:"case-updates.html"},
        {page:"notifications", label:"Notifications", icon:"bell", href:"notifications.html", badge:4},
        {page:"reports", label:"Reports", icon:"trend", href:"reports.html"},
        {page:"profile", label:"Profile", icon:"user", href:"profile.html"},
        {page:"settings", label:"Settings", icon:"settings", href:"settings.html"},
      ]}
    ]
  },
  destBank:{
    label:"Destination Bank", root:"",
    groups:[
      {items:[
        {page:"dashboard", label:"Dashboard", icon:"home", href:"dashboard.html"},
        {page:"pending-freeze", label:"Pending Freeze Requests", icon:"alert", href:"pending-freeze-requests.html", badge:3},
        {page:"freeze-approval", label:"Freeze Approval", icon:"lock", href:"freeze-approval.html"},
        {page:"reject-request", label:"Reject Request", icon:"freeze", href:"reject-request.html"},
      ]},
      {label:"Accounts", items:[
        {page:"frozen-accounts", label:"Frozen Accounts", icon:"bank", href:"frozen-accounts.html"},
        {page:"investigation-updates", label:"Investigation Updates", icon:"timeline", href:"investigation-updates.html"},
      ]},
      {label:"Operations", items:[
        {page:"reports", label:"Reports", icon:"trend", href:"reports.html"},
        {page:"profile", label:"Profile", icon:"user", href:"profile.html"},
        {page:"settings", label:"Settings", icon:"settings", href:"settings.html"},
      ]}
    ]
  },
  telecom:{
    label:"Telecom", root:"",
    groups:[
      {items:[
        {page:"dashboard", label:"Dashboard", icon:"home", href:"dashboard.html"},
        {page:"sim-verification", label:"SIM Verification", icon:"sim", href:"sim-verification.html", badge:2},
        {page:"imei-verification", label:"IMEI Verification", icon:"device", href:"imei-verification.html"},
        {page:"device-details", label:"Device Details", icon:"device", href:"device-details.html"},
      ]},
      {label:"Investigations", items:[
        {page:"investigation-requests", label:"Investigation Requests", icon:"search", href:"investigation-requests.html"},
        {page:"completed-reports", label:"Completed Reports", icon:"file", href:"completed-reports.html"},
        {page:"profile", label:"Profile", icon:"user", href:"profile.html"},
        {page:"settings", label:"Settings", icon:"settings", href:"settings.html"},
      ]}
    ]
  },
  cybercrime:{
    label:"Cyber Crime Dept.", root:"",
    groups:[
      {items:[
        {page:"dashboard", label:"Dashboard", icon:"home", href:"dashboard.html"},
        {page:"all-cases", label:"All Cases", icon:"briefcase", href:"all-cases.html"},
        {page:"priority-queue", label:"Priority Queue", icon:"alert", href:"priority-queue.html", badge:6},
      ]},
      {label:"Investigation", items:[
        {page:"investigation-timeline", label:"Investigation Timeline", icon:"timeline", href:"investigation-timeline.html"},
        {page:"assign-officer", label:"Assign Officer", icon:"users", href:"assign-officer.html"},
        {page:"linked-cases", label:"Linked Cases", icon:"network", href:"linked-cases.html"},
        {page:"fraud-network", label:"Fraud Network Graph", icon:"network", href:"fraud-network-graph.html"},
        {page:"evidence-review", label:"Evidence Review", icon:"file", href:"evidence-review.html"},
        {page:"case-closure", label:"Case Closure", icon:"lock", href:"case-closure.html"},
      ]},
      {label:"Insights & System", items:[
        {page:"analytics", label:"Analytics", icon:"trend", href:"analytics.html"},
        {page:"profile", label:"Profile", icon:"user", href:"profile.html"},
        {page:"settings", label:"Settings", icon:"settings", href:"settings.html"},
      ]}
    ]
  },
  admin:{
    label:"Administrator", root:"",
    groups:[
      {items:[
        {page:"dashboard", label:"Dashboard", icon:"home", href:"dashboard.html"},
      ]},
      {label:"Management", items:[
        {page:"user-management", label:"User Management", icon:"users", href:"user-management.html"},
        {page:"institution-management", label:"Institution Management", icon:"building", href:"institution-management.html"},
        {page:"roles", label:"Roles", icon:"key", href:"roles.html"},
        {page:"permissions", label:"Permissions", icon:"lock", href:"permissions.html"},
      ]},
      {label:"Platform", items:[
        {page:"audit-logs", label:"Audit Logs", icon:"audit", href:"audit-logs.html"},
        {page:"platform-analytics", label:"Platform Analytics", icon:"trend", href:"platform-analytics.html"},
        {page:"reports", label:"Reports", icon:"file", href:"reports.html"},
        {page:"system-health", label:"System Health", icon:"pulse", href:"system-health.html"},
        {page:"profile", label:"Profile", icon:"user", href:"profile.html"},
        {page:"settings", label:"Settings", icon:"settings", href:"settings.html"},
      ]}
    ]
  }
};

function CS_switchBankOrg(newOrg) {
  if (!window.CS_CURRENT_ROLE) return;
  const roleKey = window.CS_CURRENT_ROLE;
  if (roleKey !== 'sourceBank' && roleKey !== 'destBank') return;

  const stateStr = localStorage.getItem('cs_state_v5') || sessionStorage.getItem('cs_state_v5');
  let stateObj = stateStr ? JSON.parse(stateStr) : {};
  if (!stateObj.currentUser) stateObj.currentUser = {};
  if (!stateObj.currentUser[roleKey]) stateObj.currentUser[roleKey] = {};

  stateObj.currentUser[roleKey].org = newOrg;
  localStorage.setItem('cs_state_v5', JSON.stringify(stateObj));
  sessionStorage.setItem('cs_state_v5', JSON.stringify(stateObj));
  window.location.reload();
}

function CS_renderShell(roleKey, activePage, opts){
  opts = opts || {};
  const cfg = CS_NAV[roleKey] || CS_NAV.citizen;
  let rawUser = (CS_DATA.currentUser && CS_DATA.currentUser[roleKey]) || {};
  const defaultBank = roleKey === 'sourceBank' ? 'HDFC Bank' : roleKey === 'destBank' ? 'Yes Bank' : '';
  const user = {
    initials: rawUser.initials || (roleKey === 'citizen' ? 'CV' : roleKey === 'cybercrime' ? 'CI' : roleKey === 'admin' ? 'AD' : 'NO'),
    name: rawUser.name || (roleKey === 'citizen' ? 'Citizen Victim' : roleKey === 'cybercrime' ? 'Cyber Crime Inspector' : roleKey === 'admin' ? 'Root Administrator' : roleKey === 'sourceBank' ? 'Source Bank Nodal' : 'Destination Bank Nodal'),
    role: rawUser.role || (roleKey === 'citizen' ? 'Citizen' : roleKey === 'cybercrime' ? 'Inspector' : roleKey === 'admin' ? 'Platform Administrator' : 'Nodal Officer'),
    org: rawUser.org || (roleKey === 'citizen' ? '' : roleKey === 'cybercrime' ? 'Bengaluru East Cyber Cell' : roleKey === 'admin' ? 'CyberShield HQ' : defaultBank)
  };
  const root = cfg.root;
  const relPathToFrontend = roleKey === 'citizen' ? '../' : '../../';
  window.CS_CURRENT_ROLE = roleKey;
  const unreadCount = (window.CS_DATA && CS_DATA.getUnreadNotificationCount) ? CS_DATA.getUnreadNotificationCount() : 0;

  const groupsHtml = cfg.groups.map(g=>{
    const label = g.label ? `<div class="nav-group-label">${g.label}</div>` : "";
    const items = g.items.map(it=>{
      const active = it.page === activePage ? "is-active" : "";
      const badgeCount = (window.CS_DATA && CS_DATA.getBadgeCount) ? CS_DATA.getBadgeCount(roleKey, it.page) : (it.badge || 0);
      const badge = `<span class="badge nav-badge-${it.page}" style="${badgeCount > 0 ? '' : 'display:none;'}">${badgeCount}</span>`;
      return `<a class="nav-item ${active}" href="${root}${it.href}" data-page="${it.page}">${CS_ICONS[it.icon]||CS_ICONS.file}<span>${it.label}</span>${badge}</a>`;
    }).join("");
    return label + items;
  }).join("");

  const sidebar = `
  <aside class="sidebar" id="sidebar">
    <div class="brand">
      <a href="${relPathToFrontend}public/index.html" class="flex items-center gap-2" style="flex:1; min-width:0;" aria-label="CyberShield Home">
        <span class="brand-mark">${CS_ICONS.shield.replace('currentColor','#fff')}</span>
        <span style="min-width:0;">
          <span class="brand-name" style="display:block;">CyberShield</span>
          <span class="brand-sub">${cfg.label}</span>
        </span>
      </a>
      <button class="btn btn-ghost btn-icon" data-sidebar-close aria-label="Close menu" style="display:none;">✕</button>
    </div>
    <nav class="nav-scroll" aria-label="Primary Portal Navigation">${groupsHtml}</nav>
    <div class="sidebar-foot">
      <button class="nav-item" data-sidebar-collapse style="width:100%;" aria-label="Collapse sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3v18M15 3v18M3 9l3 3-3 3"/></svg>
        <span>Collapse</span>
      </button>
      <a href="${relPathToFrontend}auth/login.html" class="nav-item">${CS_ICONS.logout}<span>Log out</span></a>
    </div>
  </aside>`;

  const notifHtml = (CS_DATA.notifications || []).slice(0,5).map(n=>`
    <div class="notif-item ${n.unread?'is-unread':''}" data-notif-id="${n.id}" style="cursor:pointer;">
      <span class="notif-dot" style="${n.unread?'':'opacity:0'}"></span>
      <div>
        <div style="font-size:13px; font-weight:600;">${n.title}</div>
        <div class="text-xs text-muted">${n.sub}</div>
        <div class="text-xs text-muted" style="margin-top:2px;">${n.time}</div>
      </div>
    </div>`).join("");

  const isBankRole = (roleKey === 'sourceBank' || roleKey === 'destBank');
  const bankOptionsHTML = `
    <option value="HDFC Bank" ${user.org === 'HDFC Bank' ? 'selected' : ''}>HDFC Bank</option>
    <option value="ICICI Bank" ${user.org === 'ICICI Bank' ? 'selected' : ''}>ICICI Bank</option>
    <option value="State Bank of India" ${user.org === 'State Bank of India' ? 'selected' : ''}>State Bank of India</option>
    <option value="Axis Bank" ${user.org === 'Axis Bank' ? 'selected' : ''}>Axis Bank</option>
    <option value="Kotak Mahindra" ${user.org === 'Kotak Mahindra' ? 'selected' : ''}>Kotak Mahindra</option>
    <option value="Yes Bank" ${user.org === 'Yes Bank' ? 'selected' : ''}>Yes Bank</option>
    <option value="Punjab National Bank" ${user.org === 'Punjab National Bank' ? 'selected' : ''}>Punjab National Bank</option>
    <option value="Bank of Baroda" ${user.org === 'Bank of Baroda' ? 'selected' : ''}>Bank of Baroda</option>
    <option value="IndusInd Bank" ${user.org === 'IndusInd Bank' ? 'selected' : ''}>IndusInd Bank</option>
  `;

  const bankPillHTML = isBankRole ? `
    <div style="margin-right:8px; display:flex; align-items:center; gap:6px; background:var(--surface-sunken); border:1px solid var(--border); padding:3px 10px; border-radius:var(--r-md);">
      <span style="font-size:12px;">🏛️</span>
      <select onchange="CS_switchBankOrg(this.value)" style="background:transparent; border:none; color:var(--text-main); font-weight:700; font-size:12.5px; cursor:pointer; outline:none;">
        ${bankOptionsHTML}
      </select>
    </div>` : '';

  const topbar = `
  <header class="topbar">
    <button class="btn btn-ghost btn-icon" data-sidebar-open aria-label="Open sidebar menu" style="display:none;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
    <nav class="breadcrumbs" aria-label="Breadcrumbs" style="margin:0;">
      <a href="dashboard.html">${cfg.label}</a><span class="sep">/</span><span class="current">${opts.pageTitle || activePage}</span>
    </nav>
    <div class="search-box" style="margin-left:auto; cursor:pointer;" data-cmd-trigger aria-label="Global search palette (Ctrl+K)">
      ${CS_ICONS.search}
      <input type="text" placeholder="Search cases, accounts, UPI IDs…" readonly tabIndex="-1">
      <span class="kbd">⌘K</span>
    </div>
    ${bankPillHTML}
    <div style="position:relative;">
      <button class="btn btn-ghost btn-icon" data-popover-trigger="#notifPop" aria-label="Notifications menu">
        ${CS_ICONS.bell}
      </button>
      <span class="badge notif-topbar-badge" style="position:absolute; top:2px; right:2px; pointer-events:none; ${unreadCount > 0 ? '' : 'display:none;'}">${unreadCount}</span>
      <div class="popover" id="notifPop">
        <div class="card-header" style="border-radius:var(--r-lg) var(--r-lg) 0 0; display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:13px;">Notifications</strong>
          <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-xs text-xs" data-action="mark-all-read" style="color:var(--accent-strong); font-weight:600; padding:0 4px;">Mark all read</button>
            <a href="notifications.html" class="text-xs" style="color:var(--text-muted); font-weight:600;">View all</a>
          </div>
        </div>
        ${notifHtml}
      </div>
    </div>
    <button class="btn btn-ghost btn-icon" data-theme-toggle aria-label="Toggle light/dark theme">
      <svg class="theme-icon-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      <svg class="theme-icon-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>
    </button>
    <div style="position:relative;">
      <button class="flex items-center gap-2" data-popover-trigger="#userPop" style="border-radius:var(--r-full);" aria-label="User account menu">
        <span class="avatar">${user.initials}</span>
      </button>
      <div class="popover" id="userPop" style="width:240px;">
        <div style="padding:16px; border-bottom:1px solid var(--border);">
          <div style="font-weight:700; font-size:14px;">${user.name}</div>
          <div class="text-xs text-muted">${user.role || 'Officer'} ${user.org && user.org!=='—' ? '· '+user.org : ''}</div>
        </div>
        <a href="profile.html" class="notif-item" style="padding:10px 16px;">${CS_ICONS.user}<span style="font-size:13px;">My Profile</span></a>
        <a href="settings.html" class="notif-item" style="padding:10px 16px;">${CS_ICONS.settings}<span style="font-size:13px;">Settings</span></a>
        <a href="${relPathToFrontend}auth/role-select.html" class="notif-item" style="padding:10px 16px;">${CS_ICONS.shield}<span style="font-size:13px;">Switch Role</span></a>
        <a href="${relPathToFrontend}auth/login.html" class="notif-item" style="padding:10px 16px; border-bottom:none;">${CS_ICONS.logout}<span style="font-size:13px;">Log out</span></a>
      </div>
    </div>
  </header>`;

  const shellSidebar = document.getElementById("shell-sidebar");
  const shellTopbar = document.getElementById("shell-topbar");
  if(shellSidebar) shellSidebar.outerHTML = sidebar;
  if(shellTopbar) shellTopbar.outerHTML = topbar;

  function syncResponsive(){
    const isMobile = window.innerWidth <= 860;
    document.querySelectorAll('[data-sidebar-open]').forEach(b=> b.style.display = isMobile ? 'flex':'none');
    document.querySelectorAll('[data-sidebar-close]').forEach(b=> b.style.display = isMobile ? 'flex':'none');
  }
  syncResponsive();
  window.addEventListener('resize', syncResponsive);
}
