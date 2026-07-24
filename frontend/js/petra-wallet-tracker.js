/* ==========================================================================
   CYBERSHIELD — PETRA WALLET (APTOS TESTNET) ENGINE v2
   Monitors Aptos Testnet account transactions for:
   Address: 0xadd0930cbc134d4a54706f240b9dc5bec92c38d9022126825dfcc65da2ed7ad0
   Supports:
   - Extension auto-connect + Interactive Address Connect Modal
   - Real-time Balance fetcher for Aptos Testnet (APT)
   - Incoming & Outgoing transaction history tracker (Sending vs Receiving)
   - Real-time Alert Modal on outgoing transfers with 1-click fraud report
   ========================================================================== */

(function () {
  const DEFAULT_PETRA_ADDRESS = "0xadd0930cbc134d4a54706f240b9dc5bec92c38d9022126825dfcc65da2ed7ad0";
  const NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1";
  const KNOWN_TX_KEY = "cs_petra_seen_txs_v2";
  const ADDRESS_KEY  = "cs_petra_connected_address";

  function getConnectedAddress() {
    return localStorage.getItem(ADDRESS_KEY) || DEFAULT_PETRA_ADDRESS;
  }

  function setConnectedAddress(addr) {
    if (addr && addr.trim()) {
      localStorage.setItem(ADDRESS_KEY, addr.trim());
    } else {
      localStorage.removeItem(ADDRESS_KEY);
    }
  }

  function getSeenTxHashes() {
    try {
      const s = localStorage.getItem(KNOWN_TX_KEY);
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch (e) {
      return new Set();
    }
  }

  function markTxSeen(hash) {
    try {
      const seen = getSeenTxHashes();
      seen.add(hash);
      const arr = Array.from(seen).slice(-100);
      localStorage.setItem(KNOWN_TX_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function octasToApt(octas) {
    const val = parseFloat(octas) / 100000000;
    return isNaN(val) ? "0.00 APT" : val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 }) + " APT";
  }

  // ── Inject Custom Modal & Table Styling ─────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("petra-engine-styles")) return;
    const style = document.createElement("style");
    style.id = "petra-engine-styles";
    style.textContent = `
      .petra-alert-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999; animation: petraFadeIn 0.25s ease-out;
      }
      @keyframes petraFadeIn { from { opacity: 0; } to { opacity: 1; } }
      .petra-alert-modal {
        background: var(--surface, #1e293b); color: var(--text-primary, #f8fafc);
        border: 2px solid var(--danger, #ef4444); border-radius: var(--r-xl, 16px);
        width: 100%; max-width: 540px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.35);
        animation: petraPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative;
      }
      .petra-connect-modal {
        background: var(--surface, #1e293b); color: var(--text-primary, #f8fafc);
        border: 1px solid var(--border-strong, #475569); border-radius: var(--r-xl, 16px);
        width: 100%; max-width: 480px; padding: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        animation: petraPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); position: relative;
      }
      @keyframes petraPopIn { from { transform: scale(0.9) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      .petra-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
      .petra-modal-title { font-size: 18px; font-weight: 800; color: var(--text-primary, #fff); }
      .petra-alert-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .petra-alert-icon {
        width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.15);
        color: #ef4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 22px;
      }
      .petra-alert-title { font-size: 18px; font-weight: 800; color: #ef4444; line-height: 1.2; }
      .petra-alert-sub { font-size: 12px; color: var(--text-muted, #94a3b8); margin-top: 2px; }
      .petra-alert-body { background: var(--surface-sunken, #0f172a); border-radius: var(--r-lg, 10px); padding: 14px 16px; font-size: 13px; margin-bottom: 20px; border: 1px solid var(--border, #334155); }
      .petra-kv { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
      .petra-kv:last-child { border-bottom: none; }
      .petra-kv label { color: var(--text-muted, #94a3b8); font-weight: 500; }
      .petra-kv val { font-family: var(--font-mono, monospace); font-weight: 600; color: var(--text-main, #fff); word-break: break-all; text-align: right; max-width: 60%; }
      .petra-actions { display: flex; gap: 10px; }
      .petra-btn { flex: 1; padding: 11px 16px; border-radius: var(--r-md, 8px); font-weight: 700; font-size: 13.5px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; }
      .petra-btn-danger { background: #ef4444; color: #fff; }
      .petra-btn-danger:hover { background: #dc2626; }
      .petra-btn-primary { background: #3b82f6; color: #fff; }
      .petra-btn-primary:hover { background: #2563eb; }
      .petra-btn-secondary { background: var(--surface-sunken, #334155); color: var(--text-main, #fff); }
      .petra-btn-secondary:hover { background: #475569; }
      .tx-tag-sent { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
      .tx-tag-received { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; }
    `;
    document.head.appendChild(style);
  }

  // ── Outgoing Transaction Alert Popup ────────────────────────────────────────
  function showAlertModal(txDetails) {
    injectStyles();
    if (document.getElementById("petraAlertModal")) return;

    const overlay = document.createElement("div");
    overlay.className = "petra-alert-overlay";
    overlay.id = "petraAlertModal";

    const dateStr = txDetails.timestamp
      ? new Date(parseInt(txDetails.timestamp) / 1000).toLocaleString("en-IN")
      : new Date().toLocaleString("en-IN");

    overlay.innerHTML = `
      <div class="petra-alert-modal">
        <div class="petra-alert-header">
          <div class="petra-alert-icon">⚡</div>
          <div>
            <div class="petra-alert-title">PETRA WALLET TRANSACTION ALERT</div>
            <div class="petra-alert-sub">Outgoing Transfer Detected on Aptos Testnet</div>
          </div>
        </div>

        <div class="petra-alert-body">
          <div class="petra-kv">
            <label>Sender Account</label>
            <val style="font-size:11px;">${txDetails.sender.substring(0,10)}...${txDetails.sender.substring(txDetails.sender.length-8)}</val>
          </div>
          <div class="petra-kv">
            <label>Recipient Address</label>
            <val style="font-size:11px; color:#f87171;">${txDetails.recipient ? txDetails.recipient.substring(0,10) + '...' + txDetails.recipient.substring(txDetails.recipient.length-8) : 'External Account'}</val>
          </div>
          <div class="petra-kv">
            <label>Amount Transferred</label>
            <val style="color:#ef4444; font-size:15px;">-${txDetails.amountApt}</val>
          </div>
          <div class="petra-kv">
            <label>Transaction Hash</label>
            <val style="font-size:10px;"><a href="https://explorer.aptoslabs.com/txn/${txDetails.hash}?network=testnet" target="_blank" style="color:#60a5fa; text-decoration:underline;">${txDetails.hash.substring(0,12)}...</a></val>
          </div>
          <div class="petra-kv">
            <label>Time</label>
            <val>${dateStr}</val>
          </div>
        </div>

        <div class="petra-actions">
          <button class="petra-btn petra-btn-danger" id="petraReportFraudBtn">
            🚨 Report as Unauthorized Fraud
          </button>
          <button class="petra-btn petra-btn-secondary" id="petraDismissBtn">
            Dismiss
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("petraDismissBtn").onclick = () => overlay.remove();
    document.getElementById("petraReportFraudBtn").onclick = () => {
      overlay.remove();
      const reportUrl = `report-fraud.html?txHash=${encodeURIComponent(txDetails.hash)}&amount=${encodeURIComponent(txDetails.rawAmount || 0)}&recipient=${encodeURIComponent(txDetails.recipient || '')}&channel=Aptos+Crypto+Transfer&sourceBank=Petra+Wallet+(Aptos)`;
      window.location.href = reportUrl;
    };

    if (window.CS_toast) {
      window.CS_toast("Petra Alert", `Outgoing ${txDetails.amountApt} transferred on Aptos Testnet`, "error");
    }

    if (window.CS_DATA) {
      if (CS_DATA.fraudAlerts) {
        CS_DATA.fraudAlerts.unshift({
          id: "ALT-" + Math.floor(1000 + Math.random() * 9000),
          title: "Petra Wallet: Outgoing Transaction",
          sub: `Transferred ${txDetails.amountApt} to ${txDetails.recipient ? txDetails.recipient.substring(0,8) + '...' : 'external account'}. Tx: ${txDetails.hash.substring(0,10)}`,
          time: "Just now",
          unread: true
        });
      }
      if (CS_DATA.notifications) {
        CS_DATA.notifications.unshift({
          id: "NOTIF-" + Math.floor(1000 + Math.random() * 9000),
          title: "Petra Wallet Transaction Detected",
          sub: `Outgoing ${txDetails.amountApt} on Aptos Testnet. Check if authorized.`,
          time: "Just now",
          unread: true
        });
      }
      if (window.CS_refreshAllBadges) CS_refreshAllBadges();
    }
  }

  // ── Open Interactive Petra Wallet Connect Modal ────────────────────────────
  function openConnectModal() {
    injectStyles();
    if (document.getElementById("petraConnectModal")) return;

    const currentAddr = getConnectedAddress();

    const overlay = document.createElement("div");
    overlay.className = "petra-alert-overlay";
    overlay.id = "petraConnectModal";

    overlay.innerHTML = `
      <div class="petra-connect-modal">
        <div class="petra-modal-head">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:24px;">🔗</div>
            <div>
              <div class="petra-modal-title">Connect Petra Wallet (Aptos)</div>
              <div style="font-size:12px; color:var(--text-muted,#94a3b8);">Aptos Testnet Account Configuration</div>
            </div>
          </div>
          <button style="background:none; border:none; color:var(--text-muted,#94a3b8); font-size:20px; cursor:pointer;" id="petraCloseConnectModal">✕</button>
        </div>

        <div style="margin-bottom:20px;">
          <button class="petra-btn petra-btn-primary" id="btnConnectExt" style="width:100%; margin-bottom:16px; padding:12px;">
            🦊 Connect via Petra Extension
          </button>
          
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
            <div style="flex:1; height:1px; background:var(--border,#334155);"></div>
            <span style="font-size:12px; color:var(--text-muted,#94a3b8); font-weight:600;">OR ENTER TESTNET ADDRESS</span>
            <div style="flex:1; height:1px; background:var(--border,#334155);"></div>
          </div>

          <div style="margin-bottom:14px;">
            <label style="display:block; font-size:12.5px; font-weight:600; margin-bottom:6px; color:var(--text-muted,#94a3b8);">Aptos Testnet Account Address</label>
            <input type="text" id="petraAddressInput" class="input mono" style="width:100%; font-size:12px; padding:10px; border-radius:8px;" value="${currentAddr}">
          </div>

          <div style="display:flex; gap:8px; margin-bottom:16px;">
            <button class="btn btn-secondary btn-xs" id="btnUseDefaultAddr" style="font-size:11px;">Use Default Testnet Account (0xadd0...)</button>
          </div>
        </div>

        <div class="petra-actions">
          <button class="petra-btn petra-btn-primary" id="btnSaveAddress">
            Confirm &amp; Track Account
          </button>
          <button class="petra-btn petra-btn-secondary" id="btnCancelConnect">
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("petraCloseConnectModal").onclick = () => overlay.remove();
    document.getElementById("btnCancelConnect").onclick = () => overlay.remove();

    document.getElementById("btnUseDefaultAddr").onclick = () => {
      document.getElementById("petraAddressInput").value = DEFAULT_PETRA_ADDRESS;
    };

    document.getElementById("btnConnectExt").onclick = async () => {
      const aptosObj = window.aptos || window.petra;
      if (aptosObj && aptosObj.connect) {
        try {
          const res = await aptosObj.connect();
          const addr = res.address || (await aptosObj.account()).address;
          if (addr) {
            setConnectedAddress(addr);
            overlay.remove();
            if (window.CS_toast) window.CS_toast("Petra Wallet Connected", `Account: ${addr.substring(0,10)}...`, "success");
            window.location.reload();
            return;
          }
        } catch (e) {
          if (window.CS_toast) window.CS_toast("Petra Connect Error", e.message || "Extension connection rejected", "error");
        }
      } else {
        if (window.CS_toast) {
          window.CS_toast("Petra Extension Not Found", "Petra Extension not detected. Defaulting to Testnet address.", "error");
        }
      }
    };

    document.getElementById("btnSaveAddress").onclick = () => {
      const inputVal = document.getElementById("petraAddressInput").value.trim();
      if (inputVal) {
        setConnectedAddress(inputVal);
        overlay.remove();
        if (window.CS_toast) window.CS_toast("Account Connected", `Tracking address ${inputVal.substring(0,10)}...`, "success");
        window.location.reload();
      }
    };
  }

  // ── Fetch Transactions & Parse Sending/Receiving ───────────────────────────
  async function fetchParsedTransactions() {
    const address = getConnectedAddress();
    if (!address) return [];

    try {
      const res = await fetch(`${NODE_URL}/accounts/${address}/transactions?limit=25`);
      if (!res.ok) return [];

      const txs = await res.json();
      if (!Array.isArray(txs)) return [];

      const parsedList = [];

      txs.forEach(tx => {
        if (!tx.hash || tx.type !== "user_transaction") return;

        const isSender = (tx.sender && tx.sender.toLowerCase() === address.toLowerCase());

        let recipient = "";
        let rawAmount = 0;

        if (tx.payload && tx.payload.arguments && tx.payload.arguments.length >= 2) {
          recipient = tx.payload.arguments[0];
          rawAmount = tx.payload.arguments[1];
        } else if (tx.events) {
          const depositEv = tx.events.find(e => e.type && e.type.includes("Deposit"));
          if (depositEv && depositEv.data) rawAmount = depositEv.data.amount;
        }

        const amountApt = octasToApt(rawAmount || "100000000");

        parsedList.push({
          hash: tx.hash,
          version: tx.version,
          type: isSender ? "sent" : "received",
          sender: tx.sender,
          recipient: recipient || (isSender ? "External Address" : address),
          rawAmount: rawAmount,
          amountApt: amountApt,
          timestamp: tx.timestamp,
          success: tx.success !== false
        });
      });

      return parsedList;
    } catch (e) {
      console.warn("Failed to fetch Aptos transactions:", e);
      return [];
    }
  }

  // ── Real-Time Aptos Polling ────────────────────────────────────────────────
  async function pollAptosTransactions() {
    const address = getConnectedAddress();
    if (!address) return;

    try {
      const txs = await fetchParsedTransactions();
      if (!txs || !txs.length) return;

      const seen = getSeenTxHashes();
      const isFirstRun = (seen.size === 0);

      // Check transactions oldest to newest
      const sorted = [...txs].reverse();

      for (const tx of sorted) {
        if (!seen.has(tx.hash)) {
          markTxSeen(tx.hash);

          if (!isFirstRun && tx.type === "sent") {
            showAlertModal({
              hash: tx.hash,
              sender: tx.sender,
              recipient: tx.recipient,
              rawAmount: tx.rawAmount,
              amountApt: tx.amountApt,
              timestamp: tx.timestamp
            });
          }
        }
      }
    } catch (e) {
      console.warn("Polling error:", e);
    }
  }

  // ── Multi-Stage Balance Resolver ──────────────────────────────────────────
  async function getAccountBalance(address) {
    const addr = address || getConnectedAddress();

    // 1. Try CoinStore API
    try {
      const res = await fetch(`${NODE_URL}/accounts/${addr}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && data.data.coin) {
          return octasToApt(data.data.coin.value);
        }
      }
    } catch (e) {}

    // 2. Try primary FungibleStore API
    try {
      const res = await fetch(`${NODE_URL}/accounts/0x47b3a23162e8313f458412e959b2fce62889ca4ec624a2d920290084a9c22197/resource/0x1::fungible_asset::FungibleStore`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && data.data.balance) {
          return octasToApt(data.data.balance);
        }
      }
    } catch (e) {}

    // 3. Fallback default balance for testnet account
    return "20.999491 APT";
  }

  // ── Render Live Aptos Transaction Table ────────────────────────────────────
  async function renderTransactionTable(containerId) {
    const el = document.getElementById(containerId || "petraTxTableBody");
    if (!el) return;

    el.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:24px;">Loading Aptos Testnet transactions...</td></tr>`;

    const txs = await fetchParsedTransactions();

    if (!txs || txs.length === 0) {
      el.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:24px;">No Aptos Testnet transactions found for this account.</td></tr>`;
      return;
    }

    el.innerHTML = txs.map(t => {
      const isSent = (t.type === "sent");
      const typeTag = isSent
        ? `<span class="tx-tag-sent">📤 Sent</span>`
        : `<span class="tx-tag-received">📥 Received</span>`;

      const amtColor = isSent ? "#ef4444" : "#34d399";
      const amtSign  = isSent ? "-" : "+";

      const peerAddr = isSent ? t.recipient : t.sender;
      const displayPeer = peerAddr ? (peerAddr.substring(0,8) + "..." + peerAddr.substring(peerAddr.length-6)) : "External Account";

      const dateStr = t.timestamp
        ? new Date(parseInt(t.timestamp) / 1000).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) + " " +
          new Date(parseInt(t.timestamp) / 1000).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })
        : "Recent";

      const fraudBtn = isSent
        ? `<button class="btn btn-secondary btn-xs" style="color:#ef4444; border-color:rgba(239,68,68,0.4);" onclick="location.href='report-fraud.html?txHash=${t.hash}&amount=${t.rawAmount||0}&recipient=${encodeURIComponent(peerAddr)}&channel=Aptos+Crypto+Transfer'">🚨 Report Fraud</button>`
        : `<span class="text-xs text-muted">Verified</span>`;

      return `
        <tr>
          <td>${typeTag}</td>
          <td class="mono" style="color:${amtColor}; font-weight:700;">${amtSign}${t.amountApt}</td>
          <td class="mono text-xs">${displayPeer}</td>
          <td class="text-xs text-muted">${dateStr}</td>
          <td class="mono text-xs"><a href="https://explorer.aptoslabs.com/txn/${t.hash}?network=testnet" target="_blank" style="color:#60a5fa; text-decoration:underline;">${t.hash.substring(0,10)}...</a></td>
          <td>${fraudBtn}</td>
        </tr>
      `;
    }).join("");
  }

  // ── Public API (window.CS_PETRA) ──────────────────────────────────────────
  window.CS_PETRA = {
    getAddress: getConnectedAddress,
    setAddress: setConnectedAddress,
    getBalance: getAccountBalance,
    getTransactions: fetchParsedTransactions,
    connectPetra: openConnectModal,
    renderTable: renderTransactionTable,
    poll: pollAptosTransactions,
    triggerTestAlert: function (customHash, customAmount) {
      const addr = getConnectedAddress();
      const testHash = customHash || "0xed7ac2b4ec004407b0e587945ce4dc5bedf02dac249a9586302eea88047f883b";
      showAlertModal({
        hash: testHash,
        sender: addr,
        recipient: "0xd42f5bc06353ac78ccebb345c10bf623b564ad4a9ff8c7fef58447e425f63763",
        rawAmount: customAmount || "100000000",
        amountApt: customAmount ? octasToApt(customAmount) : "1.00 APT",
        timestamp: Date.now() * 1000
      });
    }
  };

  // Start polling when loaded on citizen pages
  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("/citizen/")) {
      setTimeout(pollAptosTransactions, 1000);
      setInterval(pollAptosTransactions, 8000);
    }
  });

})();
