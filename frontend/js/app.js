/* ==========================================================================
   CYBERSHIELD — SHARED APP BEHAVIOR & INTERACTION ENGINE (ENTERPRISE EDITION)
   Theme management, Density modes, Command Palette (⌘K), Sidebar responsiveness,
   Toasts, Modals, Drawers, Popovers, CSV Exports & Global Shortcuts.
   ========================================================================== */

(function(){

  window.CS_STATE = window.CS_STATE || { theme: localStorage.getItem("cs_theme") || "light", density: "comfortable" };

  /* ---------- Load Firebase Configuration ---------- */
  try {
    const appScript = document.querySelector('script[src*="app.js"]');
    if (appScript) {
      const basePath = appScript.src.replace('app.js', '');
      const firebaseScript = document.createElement('script');
      firebaseScript.src = basePath + 'firebase-config.js';
      document.head.appendChild(firebaseScript);
    }
  } catch(e){
    console.error("Failed to load Firebase configuration dynamically:", e);
  }

  /* ---------- Persistent Theme Engine ---------- */
  try {
    const savedTheme = localStorage.getItem("cs_theme");
    if(savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  } catch(e){}

  function applyTheme(t){
    document.documentElement.setAttribute("data-theme", t);
    CS_STATE.theme = t;
    try { localStorage.setItem("cs_theme", t); } catch(e){}
    document.querySelectorAll("[data-theme-toggle] .theme-icon-light").forEach(el=> el.style.display = t==="dark" ? "block":"none");
    document.querySelectorAll("[data-theme-toggle] .theme-icon-dark").forEach(el=> el.style.display = t==="dark" ? "none":"block");
  }

  function initTheme(){
    const savedTheme = localStorage.getItem("cs_theme") || CS_STATE.theme || "light";
    applyTheme(savedTheme);
    document.querySelectorAll("[data-theme-toggle]").forEach(btn=>{
      btn.onclick = () => applyTheme(CS_STATE.theme === "dark" ? "light" : "dark");
    });
  }

  /* ---------- Density Toggle ---------- */
  function applyDensity(d){
    document.documentElement.setAttribute("data-density", d);
    CS_STATE.density = d;
  }

  /* ---------- Sidebar Interactions ---------- */
  function initSidebar(){
    const sidebar = document.querySelector(".sidebar");
    document.querySelectorAll("[data-sidebar-collapse]").forEach(btn=>{
      btn.addEventListener("click", ()=> sidebar && sidebar.classList.toggle("is-collapsed"));
    });
    document.querySelectorAll("[data-sidebar-open]").forEach(btn=>{
      btn.addEventListener("click", ()=> sidebar && sidebar.classList.add("is-open"));
    });
    document.querySelectorAll("[data-sidebar-close]").forEach(btn=>{
      btn.addEventListener("click", ()=> sidebar && sidebar.classList.remove("is-open"));
    });
  }

  /* ---------- Popovers ---------- */
  function initPopovers(){
    document.querySelectorAll("[data-popover-trigger]").forEach(trigger=>{
      trigger.addEventListener("click", (e)=>{
        e.stopPropagation();
        const targetSel = trigger.getAttribute("data-popover-trigger");
        const pop = document.querySelector(targetSel);
        if(!pop) return;
        document.querySelectorAll(".popover.is-open").forEach(p=> p !== pop && p.classList.remove("is-open"));
        pop.classList.toggle("is-open");

        if(pop.id === "notifPop" && pop.classList.contains("is-open")){
          if(window.CS_DATA && CS_DATA.markAllNotificationsAsRead){
            CS_DATA.markAllNotificationsAsRead();
            pop.querySelectorAll(".notif-dot").forEach(d => d.style.opacity = "0");
            pop.querySelectorAll(".notif-item").forEach(item => item.classList.remove("is-unread"));
          }
        }
      });
    });
    document.addEventListener("click", (e)=>{
      document.querySelectorAll(".popover.is-open").forEach(p=>{
        if(!p.contains(e.target)) p.classList.remove("is-open");
      });
    });
    document.addEventListener("keydown", (e)=>{
      if(e.key === "Escape") document.querySelectorAll(".popover.is-open").forEach(p=> p.classList.remove("is-open"));
    });
  }

  /* ---------- Modals ---------- */
  function openModal(id){
    const el = document.getElementById(id);
    if(el){
      el.classList.add("is-open");
      el.setAttribute("aria-hidden","false");
      const firstInput = el.querySelector("input, select, textarea, button");
      if(firstInput) setTimeout(()=> firstInput.focus(), 50);
    }
  }
  function closeModal(id){
    const el = document.getElementById(id);
    if(el){ el.classList.remove("is-open"); el.setAttribute("aria-hidden","true"); }
  }
  function initModals(){
    document.querySelectorAll("[data-modal-open]").forEach(btn=>{
      btn.addEventListener("click", ()=> openModal(btn.getAttribute("data-modal-open")));
    });
    document.querySelectorAll("[data-modal-close]").forEach(btn=>{
      const modalOverlay = btn.closest(".overlay");
      if(modalOverlay) closeModal(modalOverlay.id);
    });
    document.querySelectorAll(".overlay").forEach(ov=>{
      ov.addEventListener("click", (e)=>{ if(e.target === ov) closeModal(ov.id); });
    });
  }
  window.CS_openModal = openModal;
  window.CS_closeModal = closeModal;

  /* ---------- Drawers ---------- */
  function openDrawer(id){
    const el = document.getElementById(id);
    if(el){ el.classList.add("is-open"); el.setAttribute("aria-hidden","false"); }
  }
  function closeDrawer(id){
    const el = document.getElementById(id);
    if(el){ el.classList.remove("is-open"); el.setAttribute("aria-hidden","true"); }
  }
  function initDrawers(){
    document.querySelectorAll("[data-drawer-open]").forEach(btn=>{
      btn.addEventListener("click", ()=> openDrawer(btn.getAttribute("data-drawer-open")));
    });
    document.querySelectorAll("[data-drawer-close]").forEach(btn=>{
      const drawer = btn.closest(".drawer");
      if(drawer) closeDrawer(drawer.id);
    });
  }
  window.CS_openDrawer = openDrawer;
  window.CS_closeDrawer = closeDrawer;

  /* ---------- Toasts ---------- */
  function ensureToastStack(){
    let stack = document.querySelector(".toast-stack");
    if(!stack){
      stack = document.createElement("div");
      stack.className = "toast-stack";
      stack.setAttribute("aria-live","polite");
      document.body.appendChild(stack);
    }
    return stack;
  }
  function toast(title, sub, type){
    type = type || "success";
    const stack = ensureToastStack();
    const el = document.createElement("div");
    el.className = "toast " + type;
    const icon = type === "error"
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
    el.innerHTML = icon + '<div><div class="msg-title"></div><div class="msg-sub"></div></div>';
    el.querySelector(".msg-title").textContent = title;
    el.querySelector(".msg-sub").textContent = sub || "";
    stack.appendChild(el);
    setTimeout(()=>{ el.style.opacity="0"; el.style.transform="translateX(16px)"; setTimeout(()=> el.remove(), 220); }, 4200);
  }
  window.CS_toast = toast;

  /* ---------- Dynamic Badge Engine ---------- */
  function CS_refreshAllBadges(){
    if(!window.CS_DATA) return;

    // 1. Update Global Topbar Notification Bell
    const unreadCount = CS_DATA.getUnreadNotificationCount();
    document.querySelectorAll('.notif-topbar-badge').forEach(b => {
      b.textContent = unreadCount;
      b.style.display = unreadCount > 0 ? '' : 'none';
    });

    // 2. Update Sidebar Navigation Badges
    const roleKey = window.CS_CURRENT_ROLE;
    if(roleKey && CS_DATA.getBadgeCount){
      document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        const page = item.getAttribute('data-page');
        const count = CS_DATA.getBadgeCount(roleKey, page);
        let badgeEl = item.querySelector('.badge');
        if(count > 0){
          if(!badgeEl){
            badgeEl = document.createElement('span');
            badgeEl.className = 'badge nav-badge-' + page;
            item.appendChild(badgeEl);
          }
          badgeEl.textContent = count;
          badgeEl.style.display = '';
        } else {
          if(badgeEl) badgeEl.remove();
        }
      });
    }

    // 3. Update Dashboard Stats (if any exist on page)
    document.querySelectorAll('[data-dynamic-stat]').forEach(el => {
      const stat = el.getAttribute('data-dynamic-stat');
      if(stat === 'source-pending-complaints') el.textContent = CS_DATA.getBadgeCount('sourceBank', 'pending-complaints');
      if(stat === 'dest-pending-freeze') el.textContent = CS_DATA.getBadgeCount('destBank', 'pending-freeze-requests');
      if(stat === 'telecom-pending') el.textContent = CS_DATA.getBadgeCount('telecom', 'investigation-requests') + CS_DATA.getBadgeCount('telecom', 'sim-verification') + CS_DATA.getBadgeCount('telecom', 'imei-verification');
      if(stat === 'cyber-active-cases') el.textContent = (CS_DATA.cases || []).filter(c=>c.status!=='Closed').length;
    });
  }
  window.CS_refreshAllBadges = CS_refreshAllBadges;
  window.CS_updateNotificationBadges = CS_refreshAllBadges;

  function initGlobalCloseAndDelegation(){
    document.addEventListener("click", function(e){
      // 1. Universal Close Buttons (✕, Cancel, data-close)
      const closeBtn = e.target.closest("[data-modal-close], [data-drawer-close], [data-popover-close], .modal-close-btn, [aria-label='Close'], [aria-label='Close menu'], [aria-label='Close dialog']");
      if(closeBtn){
        const modalOverlay = closeBtn.closest(".overlay, .modal-overlay, [role='dialog']");
        if(modalOverlay){
          modalOverlay.classList.remove("is-open");
          modalOverlay.setAttribute("aria-hidden", "true");
        }
        const drawer = closeBtn.closest(".drawer");
        if(drawer){
          drawer.classList.remove("is-open");
          drawer.setAttribute("aria-hidden", "true");
        }
        const popover = closeBtn.closest(".popover");
        if(popover){
          popover.classList.remove("is-open");
        }
      }

      // 2. Notification Item Click
      const notifItem = e.target.closest("[data-notif-id]");
      if(notifItem){
        const nid = notifItem.getAttribute("data-notif-id");
        if(nid && window.CS_DATA && CS_DATA.markNotificationAsRead){
          CS_DATA.markNotificationAsRead(nid);
          notifItem.classList.remove("is-unread");
          const dot = notifItem.querySelector(".notif-dot");
          if(dot) dot.style.opacity = "0";
        }
      }

      // 3. Mark all notifications read button
      const markAllBtn = e.target.closest('[data-action="mark-all-read"]');
      if(markAllBtn || (e.target.tagName === 'BUTTON' && e.target.textContent.trim().toLowerCase().includes('mark all as read'))){
        if(window.CS_DATA && CS_DATA.markAllNotificationsAsRead){
          CS_DATA.markAllNotificationsAsRead();
          toast("Notifications Cleared", "All notifications marked as read.", "success");
          const notifPop = document.getElementById("notifPop");
          if(notifPop){
            notifPop.querySelectorAll(".notif-dot").forEach(d => d.style.opacity = "0");
            notifPop.querySelectorAll(".notif-item").forEach(item => item.classList.remove("is-unread"));
          }
          const notifCard = document.getElementById("notifCard");
          if(notifCard){
            notifCard.querySelectorAll(".notif-dot").forEach(d => d.style.opacity = "0");
            notifCard.querySelectorAll(".notif-item").forEach(item => item.classList.remove("is-unread"));
          }
        }
      }

      // 4. Global Action Delegation (Export, PDF, Back)
      const btn = e.target.closest("button, a.btn");
      if(btn){
        const txt = btn.textContent.trim().toLowerCase();
        if(txt.includes("export csv") && !btn.hasAttribute("data-export-csv")){
          const dataset = btn.getAttribute("data-dataset") || "cases";
          if(window.CS_DATA && CS_DATA[dataset]){
            CS_DATA.exportToCSV(`${dataset}_export_${Date.now()}.csv`, CS_DATA[dataset]);
          }
          toast("Export Complete", "Dataset exported to CSV successfully.", "success");
        } else if(txt.includes("export pdf") || txt.includes("export graph")){
          toast("Export Complete", "Report document generated and downloaded.", "success");
        } else if(txt === "← back" || txt === "back" || btn.hasAttribute("data-action-back")){
          if(!btn.closest(".modal-foot") && !btn.closest(".overlay")){
            window.history.back();
          }
        }
      }
    });

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape"){
        document.querySelectorAll(".overlay.is-open, .drawer.is-open, .popover.is-open, .cmd-palette-backdrop.is-open").forEach(el=>{
          el.classList.remove("is-open");
          if(el.hasAttribute("aria-hidden")) el.setAttribute("aria-hidden", "true");
        });
      }
    });
  }

  function initMockActions(){
    document.querySelectorAll("[data-toast-success]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        toast(btn.getAttribute("data-toast-success"), btn.getAttribute("data-toast-sub") || "", "success");
      });
    });
    document.querySelectorAll("[data-export-csv]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const dataset = btn.getAttribute("data-export-csv");
        if(window.CS_DATA && CS_DATA[dataset]){
          CS_DATA.exportToCSV(`${dataset}_export_${Date.now()}.csv`, CS_DATA[dataset]);
          toast("Export Complete", `Exported ${dataset} records to CSV.`, "success");
        }
      });
    });
  }

  /* ---------- Command Palette (⌘K) ---------- */
  function buildCommandPaletteHTML(){
    if(document.getElementById("cmdPaletteOverlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "cmdPaletteOverlay";
    overlay.className = "cmd-palette-backdrop";
    overlay.innerHTML = `
      <div class="cmd-palette" role="dialog" aria-modal="true" aria-label="Command Palette">
        <div class="cmd-input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="cmdInput" placeholder="Type a command or search cases, accounts, IMEIs, banks…" autocomplete="off">
          <span class="kbd">ESC</span>
        </div>
        <div class="cmd-results" id="cmdResults"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e)=>{
      if(e.target === overlay) hideCommandPalette();
    });
  }

  function renderCmdResults(query){
    const container = document.getElementById("cmdResults");
    if(!container) return;
    const q = (query || "").toLowerCase().trim();

    if(!window.CS_DATA) return;

    const relPathToFrontend = window.location.pathname.includes('/institutional/') ? '../../' : '../';

    let items = [];

    const portals = [
      {title:"Report New Fraud Complaint", sub:"Citizen Portal", href:`${relPathToFrontend}citizen/report-fraud.html`, icon:"file"},
      {title:"Fraud Network Graph Explorer", sub:"Cyber Crime Portal", href:`${relPathToFrontend}institutional/cybercrime/fraud-network-graph.html`, icon:"network"},
      {title:"Generate Freeze Request", sub:"Source Bank Portal", href:`${relPathToFrontend}institutional/source-bank/generate-freeze-request.html`, icon:"freeze"},
      {title:"Pending Freeze Approvals", sub:"Destination Bank Portal", href:`${relPathToFrontend}institutional/destination-bank/pending-freeze-requests.html`, icon:"alert"},
      {title:"SIM & IMEI Verification", sub:"Telecom Portal", href:`${relPathToFrontend}institutional/telecom/sim-verification.html`, icon:"sim"},
      {title:"System Health & Telemetry", sub:"Admin Portal", href:`${relPathToFrontend}institutional/admin/system-health.html`, icon:"pulse"}
    ];

    portals.forEach(p=>{
      if(!q || p.title.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q)){
        items.push({type:"Navigation", label:p.title, meta:p.sub, href:p.href, icon:p.icon});
      }
    });

    if(CS_DATA.cases){
      CS_DATA.cases.forEach(c=>{
        if(!q || c.id.toLowerCase().includes(q) || c.victim.toLowerCase().includes(q) || c.sourceBank.toLowerCase().includes(q)){
          items.push({
            type:"Case Record",
            label:`${c.id} — ${c.victim} (${CS_DATA.fmtINR(c.amount)})`,
            meta:`${c.status} · Anomaly Score: ${c.anomalyScore||85}% · ${c.sourceBank} → ${c.destBank}`,
            href:`${relPathToFrontend}citizen/case-details.html`,
            icon:"briefcase"
          });
        }
      });
    }

    if(items.length === 0){
      container.innerHTML = `<div style="padding:24px; text-align:center; color:var(--text-muted); font-size:13.5px;">No matching records found for "${query}"</div>`;
      return;
    }

    container.innerHTML = items.slice(0,8).map((it, idx)=>`
      <a href="${it.href}" class="cmd-item ${idx===0?'is-selected':''}">
        <div class="cmd-item-main">
          ${(window.CS_ICONS && CS_ICONS[it.icon]) || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>'}
          <div>
            <div style="font-weight:600; font-size:13.5px;">${it.label}</div>
            <div class="text-xs text-muted">${it.meta}</div>
          </div>
        </div>
        <span class="cmd-shortcut">${it.type}</span>
      </a>
    `).join('');
  }

  function showCommandPalette(){
    buildCommandPaletteHTML();
    const overlay = document.getElementById("cmdPaletteOverlay");
    const input = document.getElementById("cmdInput");
    if(overlay){
      overlay.classList.add("is-open");
      renderCmdResults("");
      if(input){
        input.value = "";
        setTimeout(()=> input.focus(), 50);
      }
    }
  }

  function hideCommandPalette(){
    const overlay = document.getElementById("cmdPaletteOverlay");
    if(overlay) overlay.classList.remove("is-open");
  }

  function initCommandPalette(){
    document.addEventListener("keydown", (e)=>{
      if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
        e.preventDefault();
        const overlay = document.getElementById("cmdPaletteOverlay");
        if(overlay && overlay.classList.contains("is-open")){
          hideCommandPalette();
        } else {
          showCommandPalette();
        }
      } else if(e.key === "Escape"){
        hideCommandPalette();
      }
    });

    document.body.addEventListener("click", (e)=>{
      if(e.target.closest("[data-cmd-trigger]")){
        showCommandPalette();
      }
    });

    document.body.addEventListener("input", (e)=>{
      if(e.target && e.target.id === "cmdInput"){
        renderCmdResults(e.target.value);
      }
    });
  }

  /* ---------- Priority & Status Chips ---------- */
  const PRIORITY_CLASS = { Critical:"chip-critical", High:"chip-high", Medium:"chip-medium", Low:"chip-low" };
  const STATUS_CLASS = {
    "Investigation":"chip-open","Under Review":"chip-open","Freeze Requested":"chip-progress",
    "Funds Frozen":"chip-frozen","Resolved":"chip-resolved","Pending":"chip-progress",
    "Approved":"chip-resolved","Rejected":"chip-rejected","Completed":"chip-resolved",
    "In Progress":"chip-progress","Active":"chip-resolved","Suspended":"chip-rejected"
  };
  window.CS_chip = function(text, map){
    const cls = (map || STATUS_CLASS)[text] || "chip-neutral";
    return `<span class="chip ${cls}">${text}</span>`;
  };
  window.CS_priorityChip = function(text){ return `<span class="chip ${PRIORITY_CLASS[text]||'chip-neutral'}">${text}</span>`; };

  /* ---------- Click Outside Sidebar ---------- */
  function initClickOutsideSidebar(){
    document.addEventListener("click", (e)=>{
      const sidebar = document.querySelector(".sidebar.is-open");
      if(sidebar && !sidebar.contains(e.target) && !e.target.closest("[data-sidebar-open]")){
        sidebar.classList.remove("is-open");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    initTheme();
    initSidebar();
    initPopovers();
    initModals();
    initDrawers();
    initMockActions();
    initGlobalCloseAndDelegation();
    initCommandPalette();
    initClickOutsideSidebar();
    CS_updateNotificationBadges();

    const page = document.body.getAttribute("data-page");
    if(page){
      document.querySelectorAll(`.nav-item[data-page="${page}"]`).forEach(el=> el.classList.add("is-active"));
    }

    if (window.CS_DATA && window.CS_DATA.syncFromFirebase) {
      window.CS_DATA.syncFromFirebase().then(() => {
        CS_refreshAllBadges();
        window.dispatchEvent(new CustomEvent('CS_SYNC_COMPLETE'));
      });
    }
  });

})();
