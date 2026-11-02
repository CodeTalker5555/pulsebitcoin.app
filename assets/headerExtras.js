/* Network switcher + wallet menu helpers for the PulseBitcoin.app header (added for pLTC). */
import { c3 as useWallet, bW as useEthers, n as ref } from "./index.134b1441.js";

const NETS = {
  1: { name: "Ethereum", icon: "/assets/eth.png", hex: "0x1", explorer: "https://etherscan.io" },
  369: { name: "PulseChain", icon: "/assets/pulsechain.svg", hex: "0x171", explorer: "https://scan.pulsechain.com",
    add: { chainId: "0x171", chainName: "PulseChain", nativeCurrency: { name: "Pulse", symbol: "PLS", decimals: 18 }, rpcUrls: ["https://rpc.pulsechain.com"], blockExplorerUrls: ["https://scan.pulsechain.com"] } }
};
const W = useWallet();
const provider = () => W.wallet.provider || window.ethereum;

export const netName = id => (NETS[id] ? NETS[id].name : "Wrong Network");
export const netIcon = id => (NETS[id] ? "img:" + NETS[id].icon : "warning");
export const netImg = id => NETS[id].icon;

export async function switchNetwork(id) {
  const n = NETS[id], p = provider();
  if (!p) return;
  try { await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: n.hex }] }); }
  catch (e) {
    const code = e?.code ?? e?.data?.originalError?.code;
    if ((code === 4902 || /4902|Unrecognized chain/i.test(e?.message || "")) && n.add) {
      try { await p.request({ method: "wallet_addEthereumChain", params: [n.add] }); } catch (e2) { console.log(e2); }
    } else console.log(e);
  }
}

export async function disconnectWallet(disconnect) {
  // Stop the app auto-reconnecting on the next visit, then drop the site's account permission where the wallet supports it.
  try { localStorage.removeItem("preferedWallet"); } catch {}
  const p = provider();
  try { await p?.request?.({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] }); } catch {}
  try { await disconnect(); } catch (e) { console.log(e); }
}

export async function copyAddress(addr) {
  try { await navigator.clipboard.writeText(addr); } catch { window.prompt("Copy your address", addr); }
}

export const explorerUrl = (id, addr) => `${(NETS[id] || NETS[1]).explorer}/address/${addr}`;

/* ---------- pLTC balance for the header ---------- */
const PLTC = { 1: "0xE8df8F6d75008414Ed4C21715F2d4DadBdB94E6e", 369: "0x68eA849F92998D54555B33F45825c42Ee56866Fb" };
const AE = useEthers();
export const pltcBalance = ref(0n);
let lastKey = "", lastAt = 0;
export async function refreshPltcBalance() {
  const p = provider(), addr = AE.address.value, cid = Number(AE.chainId.value);
  lastKey = `${W.wallet.status}|${addr}|${cid}`; lastAt = Date.now();
  if (W.wallet.status !== "connected" || !p || !addr || !PLTC[cid]) { pltcBalance.value = 0n; return; }
  try {
    const data = "0x70a08231" + addr.slice(2).toLowerCase().padStart(64, "0"); // balanceOf(address)
    const r = await p.request({ method: "eth_call", params: [{ to: PLTC[cid], data }, "latest"] });
    if (`${W.wallet.status}|${AE.address.value}|${Number(AE.chainId.value)}` === lastKey) pltcBalance.value = r && r !== "0x" ? BigInt(r) : 0n;
  } catch (e) { console.log(e); }
}
// Re-read straight away when the account or network changes, otherwise every 20 seconds.
setInterval(() => {
  const key = `${W.wallet.status}|${AE.address.value}|${Number(AE.chainId.value)}`;
  if (key !== lastKey || Date.now() - lastAt > 20000) refreshPltcBalance();
}, 1500);

function units(v) { // 12 decimals, as a Number for display
  const s = (v ?? 0n).toString().padStart(13, "0");
  return Number(s.slice(0, -12) + "." + s.slice(-12));
}
const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
export const pltcShort = v => compactFmt.format(units(v));
export const pltcFull = v => units(v).toLocaleString("en-US", { maximumFractionDigits: 12 });
export async function addPltcToWallet() {
  const cid = Number(AE.chainId.value), p = provider();
  if (!PLTC[cid] || !p) return;
  try { await p.request({ method: "wallet_watchAsset", params: { type: "ERC20", options: { address: PLTC[cid], symbol: "pLTC", decimals: 12, image: `${location.origin}/assets/pltc-color.svg` } } }); }
  catch (e) { console.log(e); }
}
