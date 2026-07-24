const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('c:/Users/sahit/OneDrive/Desktop/CyberShield/frontend/citizen/fraud-alerts.html', 'utf8');
const dataJs = fs.readFileSync('c:/Users/sahit/OneDrive/Desktop/CyberShield/frontend/js/data.js', 'utf8');
const appJs = fs.readFileSync('c:/Users/sahit/OneDrive/Desktop/CyberShield/frontend/js/app.js', 'utf8');
const shellJs = fs.readFileSync('c:/Users/sahit/OneDrive/Desktop/CyberShield/frontend/js/shell.js', 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost:8080/citizen/fraud-alerts.html' });
const window = dom.window;

// Polyfill localStorage
let store = {};
window.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k,v) => store[k] = v,
  removeItem: (k) => delete store[k]
};

window.eval(dataJs);
window.eval(appJs);
window.eval(shellJs);

window.eval('CS_renderShell(\'citizen\', \'fraud-alerts\', {pageTitle:\'Fraud Alerts\'});');

const badge = window.document.querySelector('.nav-badge-fraud-alerts') || window.document.querySelector('.badge');
console.log('Badge before click:', badge ? badge.textContent : 'none');

const btn = window.document.querySelector('button[data-toast-success=\"Marked as reviewed\"]');
if (btn) {
  // simulate inline onclick manually since JSDOM sometimes struggles with inline event handlers depending on scope
  window.eval(btn.getAttribute('onclick'));
}

console.log('Unread FA count after click:', window.CS_DATA.fraudAlerts.filter(x=>x.unread).length);
const badge2 = window.document.querySelector('.nav-badge-fraud-alerts') || window.document.querySelector('.badge');
console.log('Badge after click:', badge2 ? badge2.textContent : 'none');
