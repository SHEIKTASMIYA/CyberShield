/* ==========================================================================
   CYBERSHIELD — DATA LAYER v5 (CLEAN SLATE)
   All initial arrays are empty. Reports submitted via the UI will populate
   the state and persist in localStorage under cs_state_v5.
   ========================================================================== */

var CS_DATA = (function(){

  // Bumping to v5 clears all old mock/seed data from prior sessions
  const STORAGE_KEY = "cs_state_v5";

  // --- Default user structure ---
  const DEFAULT_USER = {
    citizen:    { name: "", initials: "", email: "", phone: "", role: "Citizen Victim" },
    sourceBank: { name: "", initials: "", org: "",  role: "Fraud Ops Analyst",       email: "" },
    destBank:   { name: "", initials: "", org: "",  role: "Freeze Approval Officer", email: "" },
    telecom:    { name: "", initials: "", org: "",  role: "Nodal Officer",            email: "" },
    cybercrime: { name: "", initials: "", org: "",  role: "Inspector",                email: "" },
    admin:      { name: "", initials: "", org: "",  role: "Platform Administrator",  email: "" }
  };

  const initialAnalytics = {
    monthlyFrauds:    { labels: [], values: [] },
    recoveryRate:     { labels: [], values: [] },
    fraudCategories:  { labels: [], values: [] },
    institutionPerf:  { labels: [], values: [] },
    responseTime:     { labels: [], values: [] },
    freezeSuccess:    { labels: [], values: [] }
  };

  const initialNetwork = { nodes: [], links: [] };

  function freshState() {
    return {
      cases: [],
      evidence: [],
      timeline: [],
      notifications: [],
      fraudAlerts: [],
      messages: [],
      complaints: [],
      freezeRequests: [],
      simRequests: [],
      imeiRequests: [],
      telecomInvestigations: [],
      userApprovals: [],
      institutionRequests: [],
      auditLogs: [],
      institutions: [],
      users: [],
      network: JSON.parse(JSON.stringify(initialNetwork)),
      analytics: JSON.parse(JSON.stringify(initialAnalytics)),
      currentUser: JSON.parse(JSON.stringify(DEFAULT_USER))
    };
  }

  function loadState(){
    // Migrate currentUser from old key (v4) so users don't get logged out
    let migratedUser = null;
    try {
      const old = localStorage.getItem("cs_state_v4") || sessionStorage.getItem("cs_state_v4");
      if (old) {
        const parsed = JSON.parse(old);
        if (parsed && parsed.currentUser) migratedUser = parsed.currentUser;
      }
    } catch(e){}

    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Fill in any missing keys
        const base = freshState();
        Object.keys(base).forEach(k => { if (parsed[k] === undefined) parsed[k] = base[k]; });
        return parsed;
      }
    } catch(e){}

    const s = freshState();
    // Apply migrated user so login session is preserved across version bump
    if (migratedUser) s.currentUser = migratedUser;
    return s;
  }

  const state = loadState();

  // ── Persistence ─────────────────────────────────────────────────────────────
  function saveState(){
    try {
      const str = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, str);
      sessionStorage.setItem(STORAGE_KEY, str);
    } catch(e){}
    if (window.CS_refreshAllBadges) window.CS_refreshAllBadges();
  }

  // ── Formatters ───────────────────────────────────────────────────────────────
  function fmtINR(n){ return "₹" + Number(n||0).toLocaleString("en-IN"); }
  function fmtDate(iso){
    if(!iso) return "—";
    const d = new Date(iso);
    if(isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) +
           " · " + d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  }

  // ── Case Mutations ───────────────────────────────────────────────────────────
  function addCase(newCase){
    state.cases.unshift(newCase);

    // Auto-create a Pending complaint so Source Bank sees it immediately
    if(!state.complaints) state.complaints = [];
    state.complaints.unshift({
      id:         "CMP-" + Math.floor(10000 + Math.random() * 90000),
      caseId:     newCase.id,
      victim:     newCase.victim,
      amount:     newCase.amount,
      channel:    newCase.channel,
      sourceBank: newCase.sourceBank,
      destBank:   newCase.destBank,
      filedOn:    newCase.filedOn,
      status:     "Pending"
    });

    // Auto-create a Pending freeze request so Destination Bank sees it immediately
    if(!state.freezeRequests) state.freezeRequests = [];
    const frId = "FR-" + Math.floor(55000 + Math.random() * 9000);
    const benAcc = newCase.beneficiaryAccount || newCase.beneficiaryUpi || "XXXX-XXXX-4471";
    state.freezeRequests.unshift({
      id:          frId,
      caseId:      newCase.id,
      account:     benAcc,
      bank:        newCase.destBank,
      destBank:    newCase.destBank,
      sourceBank:  newCase.sourceBank,
      amount:      newCase.amount,
      status:      "Pending",
      requestedOn: newCase.filedOn || new Date().toISOString(),
      sla:         "24.0h left"
    });

    // Auto-log initial investigation timeline entries
    if(!state.timeline) state.timeline = [];
    state.timeline.unshift({
      id:     "TL-" + Math.floor(1000 + Math.random() * 9000),
      caseId: newCase.id,
      time:   new Date().toISOString().replace("T"," ").substring(0,16),
      title:  `Fraud Report Filed (${newCase.id})`,
      desc:   `Citizen filed report for ${fmtINR(newCase.amount)} via ${newCase.channel}. Freeze request created for ${newCase.destBank}.`,
      done:   true
    });
    state.timeline.unshift({
      id:     "TL-" + Math.floor(1000 + Math.random() * 9000),
      caseId: newCase.id,
      time:   new Date().toISOString().replace("T"," ").substring(0,16),
      title:  `Freeze Request Dispatched to ${newCase.destBank}`,
      desc:   `Automated high-priority freeze request ${frId} routed to ${newCase.destBank} duty desk.`,
      done:   false
    });

    state.auditLogs.unshift({
      actor: (newCase.victim || "Citizen") + " (Citizen)",
      action: `Reported new fraud case ${newCase.id} (${fmtINR(newCase.amount)})`,
      time: new Date().toISOString().replace("T"," ").substring(0,16),
      ip: "103.44.12.9"
    });
    saveState();
  }

  function updateCaseStatus(caseId, status){
    const c = state.cases.find(x => x.id === caseId);
    if(c){
      c.status = status;
      state.auditLogs.unshift({
        actor: "Cyber Crime Officer",
        action: `Updated status for ${caseId} to "${status}"`,
        time: new Date().toISOString().replace("T"," ").substring(0,16),
        ip: "10.22.4.101"
      });
      saveState();
    }
  }

  function freezeSourceAccount(caseId){
    const c = state.cases.find(x => x.id === caseId);
    if(c){
      c.sourceAccountFrozen = true;
      state.auditLogs.unshift({
        actor: "Source Bank Officer",
        action: `Placed preventative freeze on source account for ${caseId}`,
        time: new Date().toISOString().replace("T"," ").substring(0,16),
        ip: "10.22.4.101"
      });
      saveState();
    }
  }

  function assignCaseOfficer(caseId, officerName){
    const c = state.cases.find(x => x.id === caseId);
    if(c){
      c.officer = officerName || "Insp. Priya Nair";
      if(c.status === "Under Review" || c.status === "Pending") c.status = "Investigation";
      state.auditLogs.unshift({
        actor: officerName || "Officer",
        action: `Assigned case ${caseId} to ${officerName}`,
        time: new Date().toISOString().replace("T"," ").substring(0,16),
        ip: "10.22.4.101"
      });
      saveState();
    }
  }

  function closeCase(caseId){
    const c = state.cases.find(x => x.id === caseId);
    if(c){ c.status = "Resolved"; saveState(); }
  }

  function updateFreezeRequest(id, status, reason){
    const fr = state.freezeRequests.find(x => x.id === id || x.caseId === id);
    if(fr){
      fr.status = status;
      if(reason) fr.reason = reason;

      // Also update parent case status
      const c = state.cases.find(x => x.id === fr.caseId);
      if(c){
        c.status = status === "Approved" ? "Funds Frozen" : "Freeze Rejected";
      }

      // Add timeline entry
      if(!state.timeline) state.timeline = [];
      const bankName = fr.bank || fr.destBank || "Destination Bank";
      state.timeline.unshift({
        id:     "TL-" + Math.floor(1000 + Math.random() * 9000),
        caseId: fr.caseId,
        time:   new Date().toISOString().replace("T"," ").substring(0,16),
        title:  status === "Approved" ? `${bankName} Approved Account Freeze` : `${bankName} Rejected Freeze Request`,
        desc:   status === "Approved" 
          ? `Beneficiary account ${fr.account} placed on hard hold. Amount ${fmtINR(fr.amount)} secured.`
          : `Freeze request declined by ${bankName}. Reason: ${reason || 'Insufficient grounds / account clean'}`,
        done:   true
      });

      // Add notification for citizen
      if(!state.notifications) state.notifications = [];
      state.notifications.unshift({
        id:     "NOTIF-" + Math.floor(1000 + Math.random() * 9000),
        title:  status === "Approved" ? `Funds Frozen for ${fr.caseId}` : `Update on Case ${fr.caseId}`,
        sub:    status === "Approved" ? `${bankName} successfully froze account holding ${fmtINR(fr.amount)}.` : `${bankName} reviewed freeze request.`,
        time:   "Just now",
        unread: true
      });

      state.auditLogs.unshift({
        actor: `${bankName} Nodal Officer`,
        action: `${status} freeze request ${fr.id} (${fmtINR(fr.amount)})`,
        time: new Date().toISOString().replace("T"," ").substring(0,16),
        ip: "10.22.2.88"
      });
      saveState();
    }
  }

  function verifyComplaint(caseId){
    const cmp = (state.complaints||[]).find(c => c.caseId === caseId || c.id === caseId);
    if(cmp) cmp.status = "Verified";
    const c = state.cases.find(x => x.id === caseId);
    if(c && c.status === "Under Review") c.status = "Freeze Requested";
    saveState();
  }

  function addFreezeRequest(request){
    if(!state.freezeRequests) state.freezeRequests = [];
    if(!state.freezeRequests.some(x => x.caseId === request.caseId && x.account === request.account)){
      state.freezeRequests.unshift(request);
      saveState();
    }
  }

  function completeSimVerification(id){
    const sim = (state.simRequests||[]).find(s => s.id === id);
    if(sim) sim.status = "Completed";
    saveState();
  }

  function completeImeiVerification(id){
    const imei = (state.imeiRequests||[]).find(i => i.id === id);
    if(imei) imei.status = "Completed";
    saveState();
  }

  function completeTelecomInvestigation(id){
    const ti = (state.telecomInvestigations||[]).find(t => t.id === id);
    if(ti) ti.status = "Completed";
    saveState();
  }

  function approveUserRequest(id){
    const u = (state.userApprovals||[]).find(x => x.id === id);
    if(u) u.status = "Active";
    saveState();
  }

  function rejectUserRequest(id){
    const u = (state.userApprovals||[]).find(x => x.id === id);
    if(u) u.status = "Rejected";
    saveState();
  }

  function approveInstitutionRequest(id){
    const inst = (state.institutionRequests||[]).find(x => x.id === id);
    if(inst) inst.status = "Active";
    saveState();
  }

  function addEvidenceItem(item){
    if(!item.sha256){
      item.sha256 = "sha256_" + Math.random().toString(36).substring(2,15) +
                                Math.random().toString(36).substring(2,15);
    }
    state.evidence.unshift(item);
    saveState();
  }

  // ── Notifications / Alerts ───────────────────────────────────────────────────
  function getUnreadNotificationCount(){ return (state.notifications||[]).filter(n=>n.unread).length; }

  function markNotificationAsRead(id){
    const n = (state.notifications||[]).find(x=>x.id===id);
    if(n){ n.unread = false; saveState(); }
  }
  function markAllNotificationsAsRead(){ (state.notifications||[]).forEach(n=>n.unread=false); saveState(); }
  function markFraudAlertAsRead(id){ const a=(state.fraudAlerts||[]).find(x=>x.id===id); if(a){a.unread=false;saveState();} }
  function markAllFraudAlertsAsRead(){ (state.fraudAlerts||[]).forEach(a=>a.unread=false); saveState(); }
  function markMessageAsRead(id){ const m=(state.messages||[]).find(x=>x.id===id); if(m){m.unread=false;saveState();} }
  function markAllMessagesAsRead(){ (state.messages||[]).forEach(m=>m.unread=false); saveState(); }

  // ── Badge Engine ─────────────────────────────────────────────────────────────
  function getBadgeCount(roleKey, page){
    if(page==="notifications") return getUnreadNotificationCount();
    if(roleKey==="citizen"){
      if(page==="fraud-alerts") return (state.fraudAlerts||[]).filter(a=>a.unread).length;
      if(page==="messages")     return (state.messages||[]).filter(m=>m.unread).length;
      if(page==="my-cases")     return (state.cases||[]).filter(c=>c.unreadUpdate).length;
    }
    if(roleKey==="sourceBank"){
      if(page==="pending-complaints") return (state.complaints||[]).filter(c=>c.status==="Pending").length;
    }
    if(roleKey==="destBank"){
      if(page==="pending-freeze") return (state.freezeRequests||[]).filter(f=>f.status==="Pending").length;
    }
    if(roleKey==="telecom"){
      if(page==="sim-verification")      return (state.simRequests||[]).filter(s=>s.status==="Pending").length;
      if(page==="imei-verification")     return (state.imeiRequests||[]).filter(i=>i.status==="Pending").length;
      if(page==="investigation-requests")return (state.telecomInvestigations||[]).filter(t=>t.status==="Pending").length;
    }
    if(roleKey==="cybercrime"){
      if(page==="priority-queue") return (state.cases||[]).filter(c=>(c.priority==="Critical"||c.officer==="Unassigned")&&c.status!=="Resolved"&&c.status!=="Closed").length;
    }
    if(roleKey==="admin"){
      if(page==="user-management")       return (state.userApprovals||[]).filter(u=>u.status==="Pending").length;
      if(page==="institution-management")return (state.institutionRequests||[]).filter(i=>i.status==="Pending"||i.status==="Under Review").length;
    }
    return 0;
  }

  // ── Export ───────────────────────────────────────────────────────────────────
  function exportToCSV(filename, rows){
    if(!rows||!rows.length) return;
    const keys = Object.keys(rows[0]);
    let csv = keys.join(",") + "\n";
    rows.forEach(r => { csv += keys.map(k=>`"${String(r[k]||'').replace(/"/g,'""')}"`).join(",") + "\n"; });
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  // ── Firebase Sync ────────────────────────────────────────────────────────────
  async function syncFromFirebase(){
    try {
      if(window.CS_FIREBASE && window.CS_FIREBASE.ready){
        await window.CS_FIREBASE.ready;
        const fbUser = window.CS_FIREBASE.auth.currentUser;
        if(fbUser){
          const token = await fbUser.getIdToken();
          let cases = [];
          try {
            const res = await fetch('http://localhost:5000/api/cases',{
              headers:{'Authorization':`Bearer ${token}`}
            });
            if(res.ok){ const d = await res.json(); cases = d.cases||[]; }
            else throw new Error("Backend GET cases failed");
          } catch(err){
            console.warn("Backend unreachable, reading Firestore directly:", err);
            const db = window.CS_FIREBASE.db;
            const {collection,query,where,getDocs} = await import(
              "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
            );
            const roleKey = window.CS_CURRENT_ROLE||"citizen";
            const profile  = state.currentUser[roleKey];
            let q = collection(db,'cases');
            if(roleKey==='citizen' && profile && profile.name){
              q = query(collection(db,'cases'),where('victim','==',profile.name));
            }
            const snap = await getDocs(q);
            snap.forEach(doc=>cases.push({...doc.data(),id:doc.id}));
          }
          if(cases.length>0){
            cases.forEach(c=>{
              const idx = state.cases.findIndex(x=>x.id===c.id);
              if(idx>-1) state.cases[idx]={...state.cases[idx],...c};
              else state.cases.unshift(c);
            });
            saveState();
          }
        }
      }
    } catch(e){ console.error("Firebase sync failed:",e); }
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  return {
    // Live references into state arrays (mutations are visible immediately)
    get cases()               { return state.cases; },
    get evidence()            { return state.evidence; },
    get timeline()            { return state.timeline; },
    get notifications()       { return state.notifications; },
    get fraudAlerts()         { return state.fraudAlerts; },
    get messages()            { return state.messages; },
    get complaints()          { return state.complaints; },
    get freezeRequests()      { return state.freezeRequests; },
    get simRequests()         { return state.simRequests; },
    get imeiRequests()        { return state.imeiRequests; },
    get telecomInvestigations(){ return state.telecomInvestigations; },
    get userApprovals()       { return state.userApprovals; },
    get institutionRequests() { return state.institutionRequests; },
    get auditLogs()           { return state.auditLogs; },
    get institutions()        { return state.institutions; },
    get users()               { return state.users; },
    get network()             { return state.network; },
    get analytics()           { return state.analytics; },
    get currentUser()         { return state.currentUser; },
    banks:    [],
    telecoms: [],

    // Functions
    fmtINR, fmtDate,
    addCase, updateCaseStatus, freezeSourceAccount, assignCaseOfficer, closeCase,
    updateFreezeRequest, addFreezeRequest, verifyComplaint,
    completeSimVerification, completeImeiVerification, completeTelecomInvestigation,
    approveUserRequest, rejectUserRequest, approveInstitutionRequest,
    addEvidenceItem,
    getUnreadNotificationCount,
    markNotificationAsRead, markAllNotificationsAsRead,
    markFraudAlertAsRead,   markAllFraudAlertsAsRead,
    markMessageAsRead,      markAllMessagesAsRead,
    getBadgeCount, exportToCSV,
    save: saveState,
    saveState: saveState,
    syncFromFirebase: syncFromFirebase,
    resetState: function(){
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };
})();
window.CS_DATA = CS_DATA;
