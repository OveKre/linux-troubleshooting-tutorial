// IPv4 õppemudeli arvutus. Tegeliku paketi tee sõltub marsruutimistabelist.
function parseIPv4(text) {
  if (typeof text !== "string") return null;
  const octets = text.trim().split(".");
  if (octets.length !== 4) return null;
  let value = 0;
  for (const octet of octets) {
    if (!/^(0|[1-9][0-9]{0,2})$/.test(octet)) return null;
    const number = Number(octet);
    if (number > 255) return null;
    value = value * 256 + number;
  }
  return value >>> 0;
}

function formatIPv4(value) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}

function maskForPrefix(prefix) {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new RangeError("Prefiks peab olema 0–32.");
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function dottedBits(value) {
  return [24, 16, 8, 0].map((shift) => ((value >>> shift) & 255).toString(2).padStart(8, "0")).join(".");
}

function calculateSubnet(ipText, peerText, prefix) {
  const ip = parseIPv4(ipText);
  const peer = parseIPv4(peerText);
  if (ip === null || peer === null) return null;
  const mask = maskForPrefix(prefix);
  const network = (ip & mask) >>> 0;
  const peerNetwork = (peer & mask) >>> 0;
  const last = (network | (~mask >>> 0)) >>> 0;
  const size = 2 ** (32 - prefix);
  return { ip, peer, prefix, mask, network, peerNetwork, last, size, sameNetwork: network === peerNetwork };
}

function hostRange(result) {
  if (result.prefix === 0) return "Ei ole praktiline kohtvõrgu hostivahemik";
  if (result.prefix === 32) return formatIPv4(result.network) + " (üks aadress)";
  if (result.prefix === 31) return `${formatIPv4(result.network)} – ${formatIPv4(result.last)} (punktist punkti)`;
  return `${formatIPv4(result.network + 1)} – ${formatIPv4(result.last - 1)}`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseIPv4, formatIPv4, maskForPrefix, dottedBits, calculateSubnet, hostRange };
}

if (typeof document !== "undefined") {
  const ipInput = document.querySelector("#ip-input");
  const peerInput = document.querySelector("#peer-input");
  const prefixInput = document.querySelector("#prefix-input");
  const resultPanel = document.querySelector("#calc-result");
  const errorPanel = document.querySelector("#calc-error");
  const node = (id) => document.getElementById(id);

  function renderBitRow(id, value, prefix, name) {
    const row = node(id);
    row.replaceChildren();
    for (let index = 0; index < 32; index += 1) {
      if (index && index % 8 === 0) {
        const dot = document.createElement("span");
        dot.className = "bit-dot";
        dot.textContent = ".";
        dot.setAttribute("aria-hidden", "true");
        row.append(dot);
      }
      const bit = document.createElement("span");
      bit.className = index < prefix ? "bit-network" : "bit-host";
      bit.textContent = String((value >>> (31 - index)) & 1);
      bit.setAttribute("aria-hidden", "true");
      row.append(bit);
    }
    row.setAttribute("aria-label", `${name}: ${dottedBits(value)}`);
    row.setAttribute("role", "img");
  }

  function renderCalculator() {
    const prefix = Number(prefixInput.value);
    node("prefix-value").textContent = `/${prefix}`;
    node("network-bit-count").textContent = String(prefix);
    node("host-bit-count").textContent = String(32 - prefix);

    const result = calculateSubnet(ipInput.value, peerInput.value, prefix);
    const invalid = result === null;
    errorPanel.hidden = !invalid;
    resultPanel.hidden = invalid;
    if (invalid) return;

    node("mask-value").textContent = formatIPv4(result.mask);
    node("network-value").textContent = formatIPv4(result.network);
    node("block-size").textContent = new Intl.NumberFormat("et-EE").format(result.size);
    node("peer-network").textContent = formatIPv4(result.peerNetwork);
    node("last-address").textContent = formatIPv4(result.last);
    node("host-range").textContent = hostRange(result);
    node("decimal-ip").textContent = formatIPv4(result.ip);
    node("decimal-mask").textContent = formatIPv4(result.mask);
    node("decimal-network").textContent = formatIPv4(result.network);
    node("decimal-peer").textContent = formatIPv4(result.peer);
    node("decimal-peer-network").textContent = formatIPv4(result.peerNetwork);
    renderBitRow("bits-ip", result.ip, prefix, "IP-aadress");
    renderBitRow("bits-mask", result.mask, prefix, "Võrgumask");
    renderBitRow("bits-network", result.network, prefix, "Võrguaadress");
    renderBitRow("bits-peer", result.peer, prefix, "Sihtaadress");
    renderBitRow("bits-peer-network", result.peerNetwork, prefix, "Sihtaadressi võrguaadress");

    const note = node("edge-note");
    if (prefix === 0) note.textContent = "/0 tähistab tavaliselt vaikeruuti; see ei ole praktiline ühe kohtvõrgu mask.";
    else if (prefix === 31) note.textContent = "/31 on punktist punkti erijuhtum: mõlemat aadressi saab kasutada, tavapärast leviaadressi ei eraldata.";
    else if (prefix === 32) note.textContent = "/32 tähistab üht aadressi ehk hostimarsruuti; eraldi leviaadressi pole.";
    else note.textContent = "Tavapärases IPv4 alamvõrgus on esimene aadress võrgu- ja viimane leviaadress; hostid jäävad nende vahele.";

    const comparison = node("comparison");
    comparison.className = result.sameNetwork ? "comparison same" : "comparison different";
    comparison.replaceChildren();
    const label = document.createElement("strong");
    label.textContent = result.sameNetwork ? "Maski järgi sama alamvõrk" : "Maski järgi eri alamvõrgud";
    const detail = document.createElement("span");
    detail.textContent = result.sameNetwork
      ? `Mõlemad AND-tulemused on ${formatIPv4(result.network)}. Kohalik otseühendus on võimalik, kui marsruudid ja link seda lubavad.`
      : `${formatIPv4(result.network)} ≠ ${formatIPv4(result.peerNetwork)}. Tavaliselt vajatakse ruuterit, kui täpsem marsruut ei ütle teisiti.`;
    comparison.append(label, detail);
  }

  document.querySelector("#subnet-form").addEventListener("submit", (event) => event.preventDefault());
  [ipInput, peerInput, prefixInput].forEach((input) => input.addEventListener("input", renderCalculator));
  renderCalculator();
}
