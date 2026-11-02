/*
 * PulseLitecoin (pLTC) tab for the PulseBitcoin.app dapp.
 * Mines PulseBitcoin through the pLTC contract on Ethereum and PulseChain.
 * Self-contained: renders Quasar markup into the app's QPage and uses the app's own wallet connection (vue-dapp).
 */
import { ae as h, c3 as useWallet, bW as useEthers } from "./index.134b1441.js";
import { switchNetwork, refreshPltcBalance } from "./headerExtras.js";
import { Q as QPage } from "./QPage.8f2c089c.js";

/* ================= config ================= */
const PLSB = "0x5EE84583f67D5EcEa5420dBb42b462896E7f8D06";
const ASIC = "0x347a96a5BD06D2E15199b032F46fB724d6c73047";
const MULTICALL = "0xcA11bde05977b3631167028862bE2a173976CA11";
const CHAINS = {
  1: {
    id: 1, hex: "0x1", name: "Ethereum Mainnet", explorer: "https://etherscan.io", explorerName: "Etherscan",
    pltc: "0xE8df8F6d75008414Ed4C21715F2d4DadBdB94E6e", dex: "Uniswap",
    dexUrl: a => `https://app.uniswap.org/#/swap?inputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&outputCurrency=${a}&chain=mainnet`
  },
  369: {
    id: 369, hex: "0x171", name: "PulseChain", explorer: "https://scan.pulsechain.com", explorerName: "PulseScan",
    pltc: "0x68eA849F92998D54555B33F45825c42Ee56866Fb", dex: "PulseX",
    dexUrl: a => `https://app.pulsex.com/swap?outputCurrency=${a}`,
    add: { chainId: "0x171", chainName: "PulseChain", nativeCurrency: { name: "Pulse", symbol: "PLS", decimals: 18 }, rpcUrls: ["https://rpc.pulsechain.com"], blockExplorerUrls: ["https://scan.pulsechain.com"] }
  }
};
const DEC = 12, ONE = 10n ** 12n, SCALE = 4n, MIN_DAYS = 30, PENALTY_DAYS = 60;
const MIN_MINER = ONE, MAX_MINER = 140000000n * ONE, PLSB_CAP = 21000000n * ONE;
const ETHERS_CDN = "https://cdn.jsdelivr.net/npm/ethers@6.13.4/dist/ethers.min.js";

const MINER_FIELDS = "uint128 bitoshisMiner,uint128 bitoshisReturned,uint96 pSatoshisMined,uint96 bitoshisBurned,uint40 minerId,uint24 day";
const PLTC_ABI = [
  "function minerStart(uint256 bitoshis)",
  "function minerEnd(int256 minerIndex,uint256 minerOwnerIndex,uint256 minerId,address minerOwner)",
  "function minerCount(address) view returns (uint256)",
  `function minerList(address,uint256) view returns (${MINER_FIELDS})`,
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function symbol() view returns (string)",
  "function pBTC() view returns (address)",
  "error CannotEndMinerEarly(uint256 servedDays,uint256 requiredDays)",
  "error InvalidMinerId(uint256 minerId)",
  "error InvalidMinerIndex(uint256 minerIndex)",
  `error UnknownMiner((${MINER_FIELDS})[] minerList,(uint256,uint256,uint256,uint256,uint256,uint256) miner)`
];
const PLSB_ABI = [
  "function currentDay() view returns (uint256)",
  "function miningRate() view returns (uint256)",
  "function miningFee() view returns (uint256)",
  "function numOfHalvings() view returns (uint256)",
  "function totalpSatoshisMined() view returns (uint256)",
  "function previousHalvingThresold() view returns (uint256)",
  "function currentHalvingThreshold() view returns (uint256)",
  "function calcPayoutAndFee(uint256) view returns (uint256 pSatoshisMine,uint256 bitoshisBurn,uint256 bitoshisReturn,bool isHalving)",
  "function minerCount(address) view returns (uint256)",
  `function minerList(address,uint256) view returns (${MINER_FIELDS})`,
  "function balanceOf(address) view returns (uint256)",
  "error AsicMinerToLarge()",
  "error InsufficientBalance(uint256 available,uint256 required)",
  "error InvalidAmount(uint256 sent,uint256 minRequired)",
  "error InvalidMinerId(uint256 sentId,uint256 expectedId)",
  "error MinerListEmpty()",
  "error InvalidMinerIndex(uint256 sentIndex,uint256 lastIndex)",
  "error CannotEndMinerEarly(uint256 servedDays,uint256 requiredDays)"
];
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function allowance(address,address) view returns (uint256)", "function approve(address,uint256) returns (bool)"];
const MC_ABI = ["function aggregate3((address target,bool allowFailure,bytes callData)[] calls) payable returns ((bool success,bytes returnData)[])"];

/* ================= app wallet (vue-dapp, shared with the header) ================= */
const AW = useWallet(), AE = useEthers();
const eip1193 = () => AW.wallet.provider || null;

/* ================= module state ================= */
let E = null;            // ethers namespace, loaded on first mount
let IFACES = [];
let root = null, timer = null, bodyObs = null;
const S = {
  account: null, chainId: null, chain: null, wallet: null, signer: null,
  verified: {}, stats: null, bal: null, allowance: 0n, miners: null, loadError: null, loading: false,
  lookupAddr: "", lookupMiners: null, hideDetail: true, showDetails: false, amount: "", preview: null,
  sort: { own: { key: "minerId", dir: 1 }, look: { key: "minerId", dir: 1 } }
};

/* ================= helpers ================= */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dk = () => document.body.classList.contains("body--dark");
const D = cls => (dk() ? " " + cls : "");
const q = sel => root && root.querySelector(sel);

function full(v, maxDp = 12) {
  let [i, f = ""] = E.formatUnits(v ?? 0n, DEC).split(".");
  f = f.slice(0, maxDp).replace(/0+$/, "");
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return f ? `${i}.${f}` : i;
}
const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
function compact(v) { const n = Number(E.formatUnits(v ?? 0n, DEC)); return n !== 0 && Math.abs(n) < 0.01 ? n.toPrecision(2) : compactFmt.format(n); }
const show = v => (S.hideDetail ? compact(v) : full(v));
const pct = r => (Number(r) / 1e16).toLocaleString("en-US", { maximumFractionDigits: 6, minimumFractionDigits: 1 });
const short = a => a.slice(0, 6) + "..." + a.slice(-4);
function parseAmt(str) { try { const s = String(str).replace(/,/g, "").trim(); if (!s || s === ".") return null; return E.parseUnits(s, DEC); } catch { return null; } }

/* ================= Quasar markup ================= */
const icon = (name, style = "") => `<i class="q-icon notranslate material-icons" aria-hidden="true" role="presentation"${style ? ` style="${style}"` : ""}>${name}</i>`;
function btn(label, o = {}) {
  const color = o.color || "primary";
  const look = o.flat ? `q-btn--flat q-btn--rectangle text-${color}` : `q-btn--standard q-btn--rectangle bg-${color} text-${o.text || "white"}`;
  const cls = `q-btn q-btn-item non-selectable no-outline ${look} q-btn--actionable q-focusable q-hoverable${o.noCaps ? " q-btn--no-uppercase" : ""}${o.dense ? " q-btn--dense" : ""}${o.disabled ? " disabled" : ""} ${o.cls || ""}`;
  const inner = `<span class="q-focus-helper"></span><span class="q-btn__content text-center col items-center q-anchor--skip justify-center row"><span class="block">${label}</span></span>`;
  const style = o.style ? ` style="${o.style}"` : "";
  if (o.href) return `<a class="${cls}" href="${o.href}" target="_blank" rel="noopener"${style}>${inner}</a>`;
  return `<button class="${cls}" type="button" tabindex="0"${o.disabled ? " disabled" : ""}${style} ${o.attrs || ""}>${inner}</button>`;
}
function roField(label, id, value, suffix, cls) {
  return `<label class="q-field row no-wrap items-start q-field--standard q-input q-field--float q-field--labeled q-field--readonly${D("q-field--dark")} ${cls}" for="${id}" aria-readonly="true"><div class="q-field__inner relative-position col self-stretch"><div class="q-field__control relative-position row no-wrap" tabindex="-1"><div class="q-field__control-container col relative-position row no-wrap q-anchor--skip"><input class="q-field__native q-placeholder" tabindex="0" id="${id}" readonly type="text" value="${esc(value)}"><div class="q-field__label no-pointer-events absolute ellipsis">${label}</div>${suffix ? `<div class="q-field__suffix no-pointer-events row items-center">${suffix}</div>` : ""}</div></div></div></label>`;
}
const sep = () => `<hr class="q-separator q-separator--horizontal${D("q-separator--dark")}" aria-orientation="horizontal" style="height:2px">`;
const badge = t => `<div class="q-badge flex inline items-center no-wrap q-badge--single-line bg-accent prevent-text-select" role="alert">${t}</div>`;
const card = (style, inner, cls = "q-ma-md") => `<div class="q-card${D("q-card--dark q-dark")} ${cls}" style="${style}">${inner}</div>`;
function banner(inner) {
  return `<div class="q-banner row items-center${D("q-banner--dark q-dark")} rounded-borders full-width text-center text-white bg-accent" role="alert"><div class="q-banner__avatar col-auto row items-center self-start"></div><div class="q-banner__content col text-body2">${inner}</div></div>`;
}
function statCard(title, valueHtml) {
  return card("min-width:280px;max-width:280px", `<div class="q-card__section q-card__section--vert full-width row wrap justify-between items-top content-center prevent-text-select"><span>${title}</span></div><div class="q-card__section q-card__section--vert q-pt-none prevent-text-select">${valueHtml}</div>`);
}
function linear(value, color, label, tip) {
  return `<div class="q-linear-progress text-${color} rounded-borders q-mt-sm relative pltc-tip" data-tip="${esc(tip)}" role="progressbar" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${value}" style="font-size:24px"><div class="q-linear-progress__track absolute-full q-linear-progress__track--with-transition${D("q-linear-progress__track--dark")}" style="transform:scale3d(1,1,1)"></div><div class="q-linear-progress__model absolute-full q-linear-progress__model--with-transition q-linear-progress__model--determinate" style="transform:scale3d(${Math.max(0, Math.min(1, value))},1,1)"></div><span class="text-center absolute full-width text-white" style="font-size:medium">${label}</span></div>`;
}
function circular(value, color, tip) {
  const r = 50 / (1 - 0.2 / 2) / 2, vb = 50 / (1 - 0.2 / 2), sw = 0.2 / 2 * vb, c = 2 * Math.PI * 20;
  return `<div class="q-circular-progress q-circular-progress--determinate text-${color} pltc-tip" data-tip="${esc(tip)}" role="progressbar" aria-valuenow="${value.toFixed(0)}" style="font-size:40px"><svg class="q-circular-progress__svg" viewBox="${vb / 2} ${vb / 2} ${vb} ${vb}" aria-hidden="true" style="transform:rotate3d(0,0,1,-90deg)"><circle class="q-circular-progress__track text-grey-5" style="fill:transparent" stroke="currentColor" stroke-width="${sw}" stroke-dasharray="${c}" stroke-dashoffset="0" cx="${vb}" cy="${vb}" r="20"></circle><circle class="q-circular-progress__circle q-circular-progress__circle--determinate" style="fill:transparent;transition:stroke-dashoffset 1s ease 0s,stroke .6s ease" stroke="currentColor" stroke-width="${sw}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - value / 100)}" cx="${vb}" cy="${vb}" r="20"></circle></svg><div class="q-circular-progress__text absolute-full row flex-center content-center" style="font-size:10px">${value.toFixed(0)}% </div></div>`;
}
function toggle(id, on, label) {
  return `<div class="q-toggle cursor-pointer no-outline row inline no-wrap items-center${D("q-toggle--dark")}" tabindex="0" role="checkbox" id="${id}" aria-label="${label}" aria-checked="${on}" style="user-select:none"><div class="q-toggle__inner relative-position non-selectable ${on ? "q-toggle__inner--truthy text-accent" : "q-toggle__inner--falsy"}"><div class="q-toggle__track"></div><div class="q-toggle__thumb absolute flex flex-center no-wrap">${icon(on ? "check" : "clear")}</div></div><div class="q-toggle__label q-anchor--skip">${label}</div></div>`;
}

/* ================= errors ================= */
function decodeErr(e) {
  if (e?.code === "ACTION_REJECTED" || e?.info?.error?.code === 4001 || e?.error?.code === 4001 || e?.code === 4001) return "You rejected the request in your wallet.";
  const cands = [e?.data, e?.error?.data, e?.info?.error?.data, e?.info?.error?.data?.data, e?.error?.data?.data];
  for (const d of cands) {
    if (typeof d !== "string" || !d.startsWith("0x") || d.length < 10) continue;
    for (const i of IFACES) { try { const p = i.parseError(d); if (p) return friendly(p); } catch {} }
  }
  if (e?.revert) return friendly(e.revert);
  return e?.shortMessage || e?.reason || e?.message || "Unknown Error";
}
function friendly(p) {
  const a = p.args || [];
  switch (p.name) {
    case "CannotEndMinerEarly": return `This miner has served ${a[0]} days. It can be ended after ${a[1]} days.`;
    case "InvalidAmount": return "Miner amount must be at least 1 ASIC.";
    case "AsicMinerToLarge": return "Miner amount must be 140,000,000 ASIC or less.";
    case "InsufficientBalance": return "Miner amount exceeds balance.";
    case "InvalidMinerId": case "InvalidMinerIndex": case "UnknownMiner": return "The miner list changed since it loaded. Refresh and try again.";
    default: return p.name + (a.length ? "(" + a.join(", ") + ")" : "");
  }
}

/* ================= dialogs (Quasar markup, appended to body) ================= */
function closeDialog() { document.getElementById("pltc-dialog")?.remove(); }
function dialog({ title, badgeText, body, warn, actions }) {
  closeDialog();
  const acts = actions || [{ label: "OK" }];
  const el = document.createElement("div");
  el.id = "pltc-dialog";
  el.innerHTML = `<div class="q-dialog fullscreen no-pointer-events q-dialog--modal" role="dialog" aria-modal="true"><div class="q-dialog__backdrop fixed-full" aria-hidden="true" tabindex="-1"></div><div class="q-dialog__inner flex no-pointer-events q-dialog__inner--minimized q-dialog__inner--standard fixed-full flex-center" tabindex="-1">
    <div class="q-dialog-plugin q-card${D("q-card--dark q-dark")}${warn ? " text-warning" : ""}" style="min-width:min(370px,100%);max-width:440px">
      <div class="q-card__section q-card__section--vert full-width row wrap justify-between items-center content-center"><div class="text-h6 q-dialog__title">${title}</div>${badgeText ? badge(badgeText) : ""}</div>
      ${badgeText ? sep() : ""}
      <div class="q-card__section q-card__section--vert q-dialog__message${warn ? " text-warning" : ""}" style="overflow-wrap:anywhere">${body}</div>
      <div class="q-card__actions justify-end q-card__actions--horiz row text-primary">${acts.map((a, i) => btn(a.label, { flat: true, color: "primary", disabled: a.disabled, attrs: `data-i="${i}"` })).join("")}</div>
    </div></div></div>`;
  document.body.appendChild(el);
  el.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => { const a = acts[b.dataset.i]; closeDialog(); a.onClick && a.onClick(); }));
  el.querySelector(".q-card__actions button:last-child")?.focus();
}
const errorDialog = e => { console.error(e); dialog({ title: "Error Message", warn: true, body: esc(decodeErr(e)) }); };
function loading(on) {
  document.getElementById("pltc-loading")?.remove();
  if (!on) return;
  const el = document.createElement("div");
  el.id = "pltc-loading";
  el.innerHTML = `<div class="q-loading fullscreen flex flex-center z-max text-white"><div class="q-loading__backdrop"></div><div class="q-loading__box column items-center q-gutter-y-md"><svg class="q-spinner q-spinner-mat" width="50" height="50" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-miterlimit="10"></circle></svg><div class="q-loading__message"><span class="text-amber"> blockchain confirmation is in progress.</span><br/><span class="text-amber text-italic">Please wait...</span></div></div></div>`;
  document.body.appendChild(el);
}

/* ================= wallet + contracts ================= */
const C = {
  pltc: r => new E.Contract(S.chain.pltc, PLTC_ABI, r || S.wallet),
  plsb: r => new E.Contract(PLSB, PLSB_ABI, r || S.wallet),
  asic: r => new E.Contract(ASIC, ERC20_ABI, r || S.wallet)
};
async function multiRead(contract, fn, argsList) {
  if (!argsList.length) return [];
  const iface = contract.interface, target = await contract.getAddress();
  try {
    const mc = new E.Contract(MULTICALL, MC_ABI, S.wallet), out = [];
    for (let i = 0; i < argsList.length; i += 200) {
      const calls = argsList.slice(i, i + 200).map(a => ({ target, allowFailure: false, callData: iface.encodeFunctionData(fn, a) }));
      const res = await mc.aggregate3.staticCall(calls);
      for (const r of res) out.push(iface.decodeFunctionResult(fn, r[1]));
    }
    return out;
  } catch (err) {
    console.warn("[pLTC] multicall unavailable, reading one by one", err);
    const out = [];
    for (let i = 0; i < argsList.length; i += 15) out.push(...await Promise.all(argsList.slice(i, i + 15).map(a => contract[fn](...a))));
    return out;
  }
}
async function walletSnapshot() {
  // Follow the dapp's own connection so the header's Disconnect and network switch apply here too.
  if (AW.wallet.status !== "connected" || !eip1193()) return { account: null, chainId: null };
  const addr = AE.address.value, cid = AE.chainId.value;
  return { account: addr ? E.getAddress(addr) : null, chainId: cid != null ? Number(cid) : null };
}
const switchChain = id => switchNetwork(id);
function openAppConnect() {
  // Use the dapp's own Connect Wallet button in the header so the app's wallet state stays in sync.
  const b = [...document.querySelectorAll("header button, header a")].find(x => /connect wallet/i.test(x.textContent));
  if (b) b.click();
  else dialog({ title: "Error Message", warn: true, body: "No browser wallet was found. Install MetaMask or Rabby and reload the page." });
}
async function addPltcToWallet() {
  try { await eip1193().request({ method: "wallet_watchAsset", params: { type: "ERC20", options: { address: S.chain.pltc, symbol: "pLTC", decimals: DEC, image: `${location.origin}/assets/pltc.svg` } } }); }
  catch (e) { console.log(e); }
}

/* ================= data ================= */
async function verifyContract() {
  if (S.verified[S.chainId] !== undefined) return S.verified[S.chainId];
  try {
    const c = C.pltc();
    const [sym, pb] = await Promise.all([c.symbol(), c.pBTC()]);
    S.verified[S.chainId] = sym === "pLTC" && pb.toLowerCase() === PLSB.toLowerCase();
  } catch (e) { console.warn(e); S.verified[S.chainId] = false; }
  return S.verified[S.chainId];
}
async function loadStats() {
  const p = C.plsb();
  const [day, rate, fee, halv, mined, prev, cur, supply] = await Promise.all([
    p.currentDay(), p.miningRate(), p.miningFee(), p.numOfHalvings(), p.totalpSatoshisMined(),
    p.previousHalvingThresold(), p.currentHalvingThreshold(), C.pltc().totalSupply()]);
  S.stats = { day: Number(day), rate, fee, halv: Number(halv), mined, prev, cur, supply };
}
async function loadBalances() {
  const [asic, pltc, allowance] = await Promise.all([C.asic().balanceOf(S.account), C.pltc().balanceOf(S.account), C.asic().allowance(S.account, S.chain.pltc)]);
  S.bal = { asic, pltc }; S.allowance = allowance;
}
function shapeMiner(r, i, owner) {
  const day = Number(r[5]), served = S.stats.day - day;
  return { index: i, owner, bitoshisMiner: r[0], bitoshisReturned: r[1], pSatoshisMined: r[2], bitoshisBurned: r[3],
    minerId: Number(r[4]), day, served, daysRemaining: Math.max(0, MIN_DAYS - served),
    progress: Math.min(100, Math.max(0, served / MIN_DAYS * 100)), daysUntilPenalty: PENALTY_DAYS - served, pltc: r[2] * SCALE };
}
async function readMiners(addr) {
  const n = Number(await C.pltc().minerCount(addr));
  const raw = await multiRead(C.pltc(), "minerList", Array.from({ length: n }, (_, i) => [addr, i]));
  return raw.map((r, i) => shapeMiner(r, i, addr));
}
async function findPlsbIndex(minerId) {
  const n = Number(await C.plsb().minerCount(S.chain.pltc));
  const rows = await multiRead(C.plsb(), "minerList", Array.from({ length: n }, (_, i) => [S.chain.pltc, i]));
  return rows.findIndex(r => Number(r[4]) === minerId);
}
let previewSeq = 0;
async function updatePreview() {
  const amt = parseAmt(S.amount), seq = ++previewSeq;
  if (!S.chain || !amt || amt < MIN_MINER || amt > MAX_MINER) { S.preview = null; renderStartFields(); return; }
  try {
    const r = await C.plsb().calcPayoutAndFee(amt);
    if (seq !== previewSeq) return;
    S.preview = { plsb: r[0], burn: r[1], ret: r[2], halving: r[3] };
  } catch { S.preview = null; }
  renderStartFields();
}

let refreshing = null;
async function refresh() {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const snap = await walletSnapshot();
    const changed = snap.account !== S.account || snap.chainId !== S.chainId;
    if (changed) { S.miners = null; S.bal = null; S.stats = null; S.preview = null; S.lookupMiners = null; }
    S.account = snap.account; S.chainId = snap.chainId; S.chain = CHAINS[snap.chainId] || null; S.loadError = null;
    S.wallet = eip1193() ? new E.BrowserProvider(eip1193(), "any") : null;
    S.signer = null;
    if (S.account && S.chain) {
      S.loading = !S.stats; render();
      try {
        S.signer = await S.wallet.getSigner();
        if (await verifyContract()) {
          await loadStats();
          await Promise.all([loadBalances(), (async () => { S.miners = await readMiners(S.account); })()]);
          if (S.lookupAddr) S.lookupMiners = await readMiners(S.lookupAddr);
        }
      } catch (e) { console.error(e); S.loadError = decodeErr(e); }
      S.loading = false;
    }
    render(); updatePreview(); refreshPltcBalance();
  })();
  try { await refreshing; } finally { refreshing = null; }
}

/* ================= render ================= */
function notice(iconName, title, text, buttons) {
  root.innerHTML = `<div class="text-center full-width row wrap justify-center items-center content-center" style="min-height:calc(100vh - 136px)"><div class="full-width">${icon(iconName, "font-size:50px")}<div class="full-width text-h5 q-ma-xs">${title}</div><div class="full-width q-ma-xs">${text}</div><div>${buttons}</div></div></div>`;
}

function render() {
  if (!root) return;
  if (!E) { notice("hourglass_empty", "Loading", "Loading the pLTC miner...", ""); return; }
  if (!S.account) {
    notice("warning", "Wallet Not Connected", "Please connect your wallet to either the Ethereum Mainnet or PulseChain.", btn("Connect Wallet", { color: "secondary", cls: "q-ma-sm", attrs: 'data-a="connect"' }));
    return bind();
  }
  if (!S.chain) {
    notice("warning", "Unsupported Network", "pLTC mining works on the Ethereum Mainnet and PulseChain. Switch your wallet to one of them.",
      Object.values(CHAINS).map(c => btn(`Switch to ${c.name}`, { color: "secondary", cls: "q-ma-sm", attrs: `data-sw="${c.id}"` })).join(""));
    return bind();
  }
  if (S.verified[S.chainId] === false) {
    notice("error_outline", "pLTC Contract Not Found", `The PulseLitecoin contract at <span class="text-secondary">${S.chain.pltc}</span> did not respond as expected on ${S.chain.name}. pLTC mining is turned off on this network.`,
      btn(`View on ${S.chain.explorerName}`, { color: "secondary", cls: "q-ma-sm", href: `${S.chain.explorer}/address/${S.chain.pltc}` }));
    return;
  }
  if (S.loadError && !S.stats) { notice("error_outline", "Could Not Load pLTC Data", esc(S.loadError), btn("Try Again", { color: "secondary", cls: "q-ma-sm", attrs: 'data-a="retry"' })); return bind(); }
  if (S.loading || !S.stats) { notice("hourglass_empty", "Loading", `Loading pLTC data from ${S.chain.name}...`, ""); return; }

  const st = S.stats, ms = S.miners || [];
  // Same as the PulseBitcoin miner: no ASIC in the wallet means the amount field is locked.
  const noAsic = (S.bal?.asic ?? 0n) === 0n;
  if (noAsic && S.amount) { S.amount = ""; S.preview = null; }
  const power = ms.reduce((a, m) => a + m.bitoshisMiner, 0n);
  const pend = ms.reduce((a, m) => a + m.pltc, 0n);
  const pendPlsb = ms.reduce((a, m) => a + m.pSatoshisMined, 0n);
  const span = st.cur - st.prev, done = st.mined - st.prev;
  const hp = span > 0n ? Number(done * 10000n / span) / 10000 : 0;
  const sp = Number(st.mined * 10000n / PLSB_CAP) / 10000;

  root.innerHTML = `
  <div class="row justify-center items-center content-center">
    ${card("width:600px;min-width:300px", `
      <div class="q-card__section q-card__section--vert full-width row wrap justify-between items-center content-center"><div class="text-h6">Start Pulse<b>Litecoin</b> Miner</div><div>${badge(`Current Day: ${st.day}`)}</div></div>
      <div class="q-expansion-item q-item-type ${S.showDetails ? "q-expansion-item--expanded" : "q-expansion-item--collapsed"} q-expansion-item--standard"><div class="q-expansion-item__container relative-position">
        <div class="q-item q-item-type row no-wrap${D("q-item--dark")} q-item--clickable q-link cursor-pointer q-focusable q-hoverable" tabindex="0" data-a="details" role="button" aria-expanded="${S.showDetails}"><div class="q-focus-helper" tabindex="-1"></div>
          <div class="q-item__section column q-item__section--side justify-center q-item__section--avatar">${icon("info")}</div>
          <div class="q-item__section column q-item__section--main justify-center"><div class="q-item__label">Details</div></div>
          <div class="q-item__section column q-item__section--side justify-center"><i class="q-icon notranslate material-icons q-expansion-item__toggle-icon${S.showDetails ? " rotate-180" : ""}" aria-hidden="true">keyboard_arrow_down</i></div></div>
        <div class="q-expansion-item__content relative-position" ${S.showDetails ? "" : 'style="display:none"'}><div class="q-card__section q-card__section--vert">
          <p class="text-subtitle3"> ASIC Tokens are used to create PulseLitecoin (pLTC) by locking up 1 or more ASIC Tokens in a "Miner" instance for 30 days through the pLTC contract. The pLTC contract starts a PulseBitcoin miner with your ASIC and records it under your address. Each Miner instance generates a small ASIC fee (burned) and the PLSB reward. When the miner ends, pLTC is minted to you at 4 times the PLSB reward. </p>
          <p>Functionality:</p>
          <ul><li>ASIC Tokens are timelocked in a miner for 30 days.</li><li>At the end of the 30 days, the miner can be ended.</li>
          <li>After ending the miner, the pLTC, the PulseBitcoin reward and your returned ASIC are sent to your address.</li>
          <li>Miners not ended within 30 days of finishing are late: anyone can end them and take half of the pLTC and half of the ASIC. The PLSB is burned.</li>
          <li>A single address can have an unlimited number of miners.</li></ul>
          <p> See this link for information regarding the <a class="text-secondary" href="https://help.defisaver.com/en/recipe-creator/what-does-it-mean-to-approve-a-token-and-is-it-safe" target="_blank" rel="noopener"> Approve Amount</a> function. The approval is given to the pLTC contract, separately from PulseBitcoin. </p>
        </div></div>
      </div></div>
      ${sep()}
      <div class="q-card__section q-card__section--vert">
        <label class="q-field row no-wrap items-start q-field--standard q-input q-field--float q-field--labeled q-field--with-bottom${D("q-field--dark")}${noAsic ? " q-field--disabled" : ""} col-12 q-py-md" for="pltc-amt" id="pltc-amt-field"${noAsic ? ' aria-disabled="true"' : ""}>
          <div class="q-field__inner relative-position col self-stretch"><div class="q-field__control relative-position row no-wrap" tabindex="-1">
            <div class="q-field__control-container col relative-position row no-wrap q-anchor--skip"><input class="q-field__native q-placeholder" tabindex="0" aria-label="Miner Amount" inputmode="decimal" placeholder="1234.56" id="pltc-amt" type="text" autocomplete="off" value="${esc(S.amount)}"${noAsic ? " disabled" : ""}><div class="q-field__label no-pointer-events absolute ellipsis">Miner Amount</div></div>
            <div class="q-field__append q-field__marginal row no-wrap items-center"><div class="full-width col no-wrap justify-center items-center content-center">${btn(" MAX ", { dense: true, cls: "row-auto", attrs: 'data-a="max"', disabled: noAsic })}<div class="row-auto q-pb-sm" style="font-size:medium;text-align:center;font-weight:400"> ASIC </div></div></div>
          </div><div class="q-field__bottom row items-start q-field__bottom--animated"><div class="q-field__messages col"><div>Balance: ${full(S.bal?.asic, 4)} ASIC · ${full(S.bal?.pltc, 4)} pLTC</div></div></div></div>
        </label>
        <div class="full-width row no-wrap justify-center items-center content-center q-py-md">${roField("Mining Reward Rate %", "pltc-rate", pct(st.rate), "%", "col-6 q-pr-sm")}${roField("ASIC Mining Fee %", "pltc-fee", pct(st.fee), "%", "col-6 q-pl-sm")}</div>
        <div class="full-width row no-wrap justify-center items-center content-center q-py-md">${roField("PulseLitecoin Payout", "pltc-pPltc", "0.0", "pLTC", "col-6 q-pr-sm")}${roField("PulseBitcoin Payout", "pltc-pPlsb", "0.0", "PLSB", "col-6 q-pl-sm")}</div>
        <div class="full-width row no-wrap justify-center items-center content-center q-py-md">${roField("ASIC Fee", "pltc-pBurn", "0.0", "ASIC", "col-6 q-pr-sm")}${roField("ASIC Returned", "pltc-pRet", "0.0", "ASIC", "col-6 q-pl-sm")}</div>
      </div>
      ${sep()}
      <div class="q-card__actions justify-start q-card__actions--horiz row full-width row wrap justify-between items-center content-center" id="pltc-action"></div>
    `)}
  </div>
  <div class="row wrap justify-center items-center content-center">
    ${statCard("Your Active pLTC Miner Count", `<span class="text-h5">${ms.length}</span><span class="text-sm"> Miners</span>`)}
    ${statCard("Your Total Active Mining Power", `<span class="text-h5">${compact(power)}</span><span class="text-sm"> ASIC</span>`)}
    ${statCard("Your Total Pending Mining Rewards", `<span class="text-h5">${compact(pend)}</span><span class="text-sm"> pLTC</span><div class="text-caption">plus ${compact(pendPlsb)} PLSB</div>`)}
    ${statCard("Your pLTC Balance", `<span class="text-h5">${compact(S.bal?.pltc)}</span><span class="text-sm"> pLTC</span> ${btn("Add", { flat: true, dense: true, color: "secondary", attrs: 'data-a="watch"' })}`)}
  </div>
  <div class="row wrap justify-center items-center content-center">
    ${statCard(`Halvening ${st.halv} Mining Progress`, linear(hp, "accent", `${(hp * 100).toFixed(2)}% `, `${full(done, 0)} PLSB / ${full(span, 0)} PLSB`))}
    ${statCard("Total Mineable Supply Progress", linear(sp, "positive", `${(sp * 100).toFixed(2)}% `, `${full(st.mined, 0)} PLSB / 21,000,000 PLSB`))}
    ${statCard("PulseLitecoin Total Supply", `<span class="text-h5">${compact(st.supply)}</span><span class="text-sm"> pLTC</span><div class="text-caption">on ${S.chain.name}</div>`)}
  </div>
  <div class="row justify-center">${tableCard("own")}</div>
  <div class="row justify-center">${tableCard("look")}</div>`;
  bind();
  renderStartFields();
}

const COLS = [
  { key: "minerId", label: "Miner ID" },
  { key: "daysRemaining", label: "Days Remaining" },
  { key: "progress", label: "Progress" },
  { key: "bitoshisMiner", label: "Miner Size (ASIC)" },
  { key: "bitoshisBurned", label: "Mining Fee (ASIC)" },
  { key: "pltc", label: "Mining Reward (pLTC)" },
  { key: "pSatoshisMined", label: "Mining Reward (PLSB)" },
  { key: "daysUntilPenalty", label: "Days Until Penalty", tip: "The late miner penalty is only applicable if the miner is over the grace period. (30 days after from the miner end day)" },
  { key: null, label: "Action" }
];
function tableCard(kind) {
  const sort = S.sort[kind];
  const list = kind === "own" ? S.miners : (S.lookupAddr ? S.lookupMiners : []);
  const head = COLS.map(c => {
    const sorted = c.key && sort.key === c.key;
    return `<th class="text-center${c.key ? " sortable" : ""}${sorted ? " sorted" + (sort.dir < 0 ? " sort-desc" : "") : ""}" ${c.key ? `data-sort="${c.key}" data-kind="${kind}"` : ""}>${c.label}${c.tip ? ` <i class="q-icon notranslate material-icons pltc-tip" data-tip="${esc(c.tip)}" aria-hidden="true" style="font-size:20px">help_outline</i>` : ""}${c.key ? `<i class="q-icon notranslate material-icons q-table__sort-icon q-table__sort-icon--center" aria-hidden="true">arrow_upward</i>` : ""}</th>`;
  }).join("");
  let rows = "", nodata = "";
  if (!list) nodata = `${icon("hourglass_empty")}Loading miners...`;
  else if (kind === "look" && !S.lookupAddr) nodata = `${icon("search")}Enter an address to view its pLTC miners and end any late ones.`;
  else if (!list.length) nodata = `${icon("warning")}${kind === "own" ? "You do not have any active pLTC Miners." : "No matching records found"}`;
  else {
    rows = [...list].sort((a, b) => { const x = a[sort.key], y = b[sort.key]; return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; }).map(m => {
      const color = m.served < 30 ? "secondary" : m.served <= 45 ? "positive" : m.served < 60 ? "warning" : "negative";
      const pen = m.daysUntilPenalty < 0 ? "LATE" : m.daysUntilPenalty <= 30 ? m.daysUntilPenalty : "";
      return `<tr class="q-tr text-center">
        <td class="q-td">${m.minerId}</td><td class="q-td">${m.daysRemaining}</td>
        <td class="q-td"><div style="min-width:100px" class="prevent-text-select">${circular(m.progress, color, `Day: ${m.served} / 30`)}</div></td>
        <td class="q-td">${show(m.bitoshisMiner)}</td><td class="q-td">${show(m.bitoshisBurned)}</td>
        <td class="q-td text-positive text-bold">${show(m.pltc)}</td><td class="q-td">${show(m.pSatoshisMined)}</td>
        <td class="q-td text-negative text-bold">${pen}</td>
        <td class="q-td">${btn("Actions", { flat: true, dense: true, attrs: `data-act="${kind}:${m.minerId}"` })}</td></tr>`;
    }).join("");
  }
  const right = kind === "own" ? toggle("pltc-hide", S.hideDetail, "Hide Detailed Data") :
    `<form class="row no-wrap items-end q-gutter-x-sm" id="pltc-lookup" style="flex:1 1 320px;max-width:520px">
      <label class="q-field row no-wrap items-start q-field--standard q-input q-field--float q-field--labeled${D("q-field--dark")} col" for="pltc-addr"><div class="q-field__inner relative-position col self-stretch"><div class="q-field__control relative-position row no-wrap" tabindex="-1"><div class="q-field__control-container col relative-position row no-wrap q-anchor--skip"><input class="q-field__native q-placeholder" id="pltc-addr" placeholder="0x..." spellcheck="false" autocomplete="off" value="${esc(S.lookupAddr)}"><div class="q-field__label no-pointer-events absolute ellipsis">Wallet Address</div></div></div></div></label>
      ${btn("View", { color: "secondary", attrs: 'data-a="lookup"' })}${S.lookupAddr ? btn("Clear", { flat: true, attrs: 'data-a="clear"' }) : ""}</form>`;
  const title = kind === "own" ? "Active pLTC Miners" : `Look Up pLTC Miners${S.lookupAddr ? " " + badge(short(S.lookupAddr)) : ""}`;
  const img = kind === "own" ? "/assets/atm.svg" : "/assets/timeline.svg";
  return card("width:1230px;min-width:300px", `<div class="q-table__container q-table--cell-separator column no-wrap q-table__card${D("q-table__card--dark q-dark q-table--dark")} q-table--no-wrap">
    <div class="q-table__top relative-position row items-center"><div class="full-width row wrap justify-between items-center content-center q-gutter-y-sm">
      <div class="row no-wrap items-center content-center"><img src="${img}" width="30" height="30" class="pltc-icon" alt=""><div class="text-h6 q-pl-md">${title}</div></div>${right}</div></div>
    <div class="q-table__middle scroll"><table class="q-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>
    ${nodata ? `<div class="q-table__bottom row items-center q-table__bottom--nodata"><i class="q-icon notranslate material-icons q-table__bottom-nodata-icon" aria-hidden="true">${nodata.match(/>([a-z_]+)<\/i>/)[1]}</i>${nodata.replace(/^<i[^>]*>[a-z_]+<\/i>/, "")}</div>` : ""}
  </div>`, "q-mx-md q-my-md");
}

function renderStartFields() {
  const act = q("#pltc-action"); if (!act) return;
  const p = S.preview, amt = parseAmt(S.amount), bal = S.bal?.asic ?? 0n;
  q("#pltc-pPltc").value = p ? full(p.plsb * SCALE, 6) : "0.0";
  q("#pltc-pPlsb").value = p ? full(p.plsb, 6) : "0.0";
  q("#pltc-pBurn").value = p ? full(p.burn, 6) : "0.0";
  q("#pltc-pRet").value = p ? full(p.ret, 6) : "0.0";
  let html;
  if (bal === 0n) html = banner(`<div class="q-pb-sm"> Looks like your wallet doesn't contain any ASIC. </div><div>${btn(`Get ASIC on ${S.chain.dex}`, { color: "secondary", noCaps: true, cls: "col text-bold", style: "font-size:10pt", href: S.chain.dexUrl(ASIC) })}</div>`);
  else if (!amt || amt === 0n) html = banner(" Enter an amount of ASIC to create a miner. ");
  else if (amt < MIN_MINER) html = banner(" Miner amount must be at least 1 ASIC ");
  else if (amt > bal) html = banner(" Miner amount exceeds balance ");
  else if (amt > MAX_MINER) html = banner(" Miner amount must be 140,000,000 ASIC or less ");
  else if (S.allowance < amt) html = btn("Approve Amount", { noCaps: true, cls: "col text-bold", attrs: 'data-a="approve"', style: "font-size:16pt;min-height:54px" });
  else html = btn("Start Miner", { color: "positive", noCaps: true, cls: "col text-bold", attrs: 'data-a="start"', style: "font-size:16pt;min-height:54px" });
  if (p?.halving) html = `<div class="full-width text-center text-warning q-pb-sm">This miner crosses the halving threshold, so part of it mines at the halved rate.</div>` + html;
  act.innerHTML = html;
}

/* ================= events ================= */
function bind() {
  if (root.dataset.bound) return;
  root.dataset.bound = "1";
  root.addEventListener("click", onClick);
  root.addEventListener("input", e => {
    if (e.target.id === "pltc-amt") { S.amount = e.target.value; renderStartFields(); clearTimeout(bind.t); bind.t = setTimeout(updatePreview, 250); }
  });
  root.addEventListener("focusin", e => e.target.closest(".q-field")?.classList.add("q-field--focused", "q-field--highlighted"));
  root.addEventListener("focusout", e => e.target.closest(".q-field")?.classList.remove("q-field--focused", "q-field--highlighted"));
  root.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && (e.target.matches("[data-a='details']") || e.target.id === "pltc-hide")) { e.preventDefault(); e.target.click(); }
  });
  root.addEventListener("submit", e => { e.preventDefault(); doLookup(); });
}
function onClick(e) {
  const t = e.target.closest("[data-a],[data-sw],[data-sort],[data-act],#pltc-hide");
  if (!t || t.disabled) return;
  if (t.id === "pltc-hide") { S.hideDetail = !S.hideDetail; render(); return; }
  if (t.dataset.sw) { switchChain(Number(t.dataset.sw)); return; }
  if (t.dataset.sort) { const s = S.sort[t.dataset.kind]; if (s.key === t.dataset.sort) s.dir *= -1; else { s.key = t.dataset.sort; s.dir = 1; } render(); return; }
  if (t.dataset.act) {
    const [kind, id] = t.dataset.act.split(":");
    const list = kind === "own" ? S.miners : S.lookupMiners;
    const m = list.find(x => x.minerId === Number(id));
    endDialog(m, m.owner.toLowerCase() === S.account.toLowerCase());
    return;
  }
  switch (t.dataset.a) {
    case "connect": openAppConnect(); break;
    case "retry": refresh(); break;
    case "details": S.showDetails = !S.showDetails; render(); break;
    case "max": { const b = S.bal?.asic ?? 0n, v = b > MAX_MINER ? MAX_MINER : b; S.amount = v > 0n ? E.formatUnits(v, DEC).replace(/\.0$/, "") : ""; q("#pltc-amt").value = S.amount; updatePreview(); break; }
    case "approve": approve(); break;
    case "start": start(); break;
    case "watch": addPltcToWallet(); break;
    case "lookup": doLookup(); break;
    case "clear": S.lookupAddr = ""; S.lookupMiners = null; render(); break;
  }
}
async function doLookup() {
  const v = (q("#pltc-addr")?.value || "").trim();
  if (!E.isAddress(v)) { dialog({ title: "Error Message", warn: true, body: "That is not a valid wallet address." }); return; }
  S.lookupAddr = E.getAddress(v); S.lookupMiners = null; render();
  try { S.lookupMiners = await readMiners(S.lookupAddr); } catch (err) { S.lookupMiners = []; errorDialog(err); }
  render();
}

function endDialog(m, isOwner) {
  const late = m.daysUntilPenalty < 0, ready = m.daysRemaining === 0;
  const fields = (a, b, c) => `<div class="full-width row no-wrap justify-center items-center content-center q-pb-md">${roField("ASIC Returned", "pltc-d1", a, "", "col-4 q-pr-sm")}${roField("pLTC Minted", "pltc-d2", b, "", "col-4 q-px-xs")}${roField("PLSB", "pltc-d3", c, "", "col-4 q-pl-sm")}</div>`;
  const amounts = fields(full(m.bitoshisReturned, 4), full(m.pltc, 4), full(m.pSatoshisMined, 4));
  let body, label = "End Miner", disabled = !ready || (!isOwner && !late);
  if (!ready) body = amounts + ` Miner instance has not finished. <br><br> The 'END MINER' action will be available after the 30 day miner instance has completed (day ${m.day + MIN_DAYS}). `;
  else if (!late && isOwner) body = amounts + ` Click 'END MINER' to end the Miner ID: ${m.minerId} mining instance. <br><br> The ASIC, pLTC and PLSB amounts shown above will be sent to your wallet. `;
  else if (!late) body = amounts + ` Only the owner can end this miner until it is late. It becomes late after day ${m.day + PENALTY_DAYS}. `;
  else if (isOwner) body = fields(full(m.bitoshisReturned, 4), full(m.pltc, 4), "0 (burned)") + ` This miner is late. If you end it yourself you keep all of the pLTC and returned ASIC, but the PLSB reward is burned. `;
  else { label = "End & Claim"; body = fields(full(m.bitoshisReturned / 2n, 4), full(m.pltc / 2n, 4), "0 (burned)") + ` This miner is late. Ending it sends you the half shown above. The owner receives the other half and the PLSB reward is burned. `; }
  dialog({ title: "End Miner", badgeText: `Miner ID: ${m.minerId}`, body: `<div class="text-warning">${body}</div>`,
    actions: [{ label: "Cancel" }, { label, disabled, onClick: () => endMiner(m) }] });
}

/* ================= transactions ================= */
async function runTx(okMsg, fn) {
  try {
    loading(true);
    const tx = await fn();
    const rc = await tx.wait();
    loading(false);
    await refresh();
    dialog({ title: "Transaction Message", body: `${okMsg}<br><br><a class="text-secondary" href="${S.chain.explorer}/tx/${rc.hash}" target="_blank" rel="noopener">View transaction on ${S.chain.explorerName}</a>` });
  } catch (e) { loading(false); errorDialog(e); }
}
function approve() {
  const amt = parseAmt(S.amount); if (!amt) return;
  runTx("Approve Spend successful. You can now mine PulseLitecoin.", () => C.asic(S.signer).approve(S.chain.pltc, amt));
}
function start() {
  const amt = parseAmt(S.amount); if (!amt) return;
  runTx("Miner start successful", async () => { const c = C.pltc(S.signer); await c.minerStart.estimateGas(amt); return c.minerStart(amt); });
}
function endMiner(m) {
  runTx(`Miner ${m.minerId} ended successfully`, async () => {
    const idx = await findPlsbIndex(m.minerId);
    const c = C.pltc(S.signer), args = [BigInt(idx), BigInt(m.index), BigInt(m.minerId), m.owner];
    await c.minerEnd.estimateGas(...args);
    return c.minerEnd(...args);
  });
}

/* ================= lifecycle ================= */
function injectStyle() {
  if (document.getElementById("pltc-style")) return;
  const s = document.createElement("style");
  s.id = "pltc-style";
  s.textContent = `
  .pltc-root{padding-bottom:16px}
  .pltc-root .q-table tbody td{font-size:13px}
  .pltc-root .q-table th,.pltc-root .q-table td{padding-left:10px;padding-right:10px}
  .pltc-root .q-circular-progress__text{letter-spacing:-.02em}
  .pltc-tip{position:relative}
  .pltc-tip:hover::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);background:#757575;color:#fff;font-size:10px;line-height:1.4;padding:6px 10px;border-radius:4px;white-space:normal;width:max-content;max-width:260px;z-index:10;text-align:center;font-family:inherit;font-weight:400;text-transform:none;letter-spacing:normal}
  body.body--light .pltc-icon{filter:invert(1)}
  .pltc-root .q-btn.disabled{opacity:.6!important;cursor:not-allowed!important}`;
  document.head.appendChild(s);
}
async function mount(el) {
  root = el;
  injectStyle();
  bind();
  render();
  if (!E) {
    try { const m = await import(/* @vite-ignore */ "./ethers.min.js"); E = m.ethers || m; }
    catch { try { const m = await import(/* @vite-ignore */ ETHERS_CDN); E = m.ethers || m; } catch (e) { console.error(e); } }
    if (!E) { notice("error_outline", "Could Not Load", "The ethers library could not be loaded. Check your internet connection and reload the page.", ""); return; }
    IFACES = [new E.Interface(PLTC_ABI), new E.Interface(PLSB_ABI)];
  }
  if (!root) return;
  // Pick up connects, disconnects and network switches made through the app's header.
  timer = setInterval(async () => {
    if (!root || refreshing) return;
    const s = await walletSnapshot();
    if (s.account !== S.account || s.chainId !== S.chainId) refresh();
  }, 1500);
  // Re-render with Quasar's dark classes when the footer theme toggle is used.
  let wasDark = dk();
  bodyObs = new MutationObserver(() => { if (dk() !== wasDark) { wasDark = dk(); render(); } });
  bodyObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  refresh();
}
function unmount() {
  root = null;
  clearInterval(timer); timer = null;
  bodyObs?.disconnect(); bodyObs = null;
  closeDialog(); loading(false);
}
const mountRef = el => { if (el) { if (el !== root) mount(el); } else unmount(); };

export default {
  name: "PltcView",
  render: () => h(QPage, null, { default: () => h("div", { ref: mountRef, class: "pltc-root" }) })
};
