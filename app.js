const categories = ["Asukoht ja logid", "Teenus", "Võrk", "Ressursid ja aeg", "Abi ja harjutus"];

const commands = [
  { id: "pwd", category: 0, command: "pwd", short: "Kontrolli, millises kataloogis töötad.", parts: [["pwd", "print working directory; näitab praegust kataloogi"]], when: "Enne failidega töötamist, et teada oma asukohta.", tags: "asukoht kataloog" },
  { id: "ls", category: 0, command: "ls -lah /var/log", short: "Leia logifailid ja võrdle nende suurust.", parts: [["ls", "loetleb kataloogi sisu"], ["-l", "üksikasjalik vaade"], ["-a", "ka peidetud kirjed"], ["-h", "loetavad suurused"], ["/var/log", "logide kataloog"]], when: "Kui otsid logifaili või vaatad, kas see on väga suureks kasvanud.", tags: "log fail suurus" },
  { id: "tail", category: 0, command: "tail -n 50 /var/log/example.log", short: "Vaata logi viimast 50 rida.", parts: [["tail", "näitab faili lõppu"], ["-n 50", "viimased 50 rida"], ["/var/log/example.log", "näidislogifail"]], when: "Kui vajad värskeimaid logikirjeid.", tags: "log viga" },
  { id: "grep", category: 0, command: 'grep -ni "timeout" /var/log/example.log', short: "Leia aegumise kirjed koos reanumbriga.", parts: [["grep", "otsib teksti"], ["-n", "lisab reanumbri"], ["-i", "eirab tähesuurust"], ['"timeout"', "otsitav sõna"], ["failitee", "uuritav logifail"]], when: "Kui kahtlustad vastuse ooteaja ületamist.", tags: "timeout log otsing" },
  { id: "find", category: 0, command: "find /var/log -type f -name '*.log'", short: "Otsi kõiki .log lõpuga faile.", parts: [["find /var/log", "otsib sellest kataloogist alates"], ["-type f", "ainult tavalised failid"], ["-name '*.log'", "nimi lõpeb .log-ga"]], when: "Kui ei tea, millisesse faili rakendus logib.", tags: "log fail otsing" },
  { id: "journalctl", category: 1, command: 'journalctl -u example.service --since "1 hour ago" -n 100 --no-pager', short: "Vaata teenuse viimase tunni kirjeid.", parts: [["journalctl", "loeb süsteemi logipäevikut"], ["-u example.service", "valib teenuse"], ['--since "1 hour ago"', "ajavahemiku algus"], ["-n 100", "kuni 100 kirjet"], ["--no-pager", "väljund otse terminali"]], when: "Kui teenus on tõrkes või vajad selle värskeid logisid.", tags: "teenus log systemd" },
  { id: "systemctl", category: 1, command: "systemctl status example.service --no-pager", short: "Kontrolli teenuse olekut.", parts: [["systemctl", "suhtleb teenusehalduriga"], ["status", "näitab olekut; ei taaskäivita"], ["example.service", "näidisteenus"], ["--no-pager", "väljund otse terminali"]], when: "Kui kontrollid, kas teenus töötab või on tõrkesse läinud.", tags: "teenus status systemd" },
  { id: "ip-address", category: 2, command: "ip -br address", short: "Vaata liideseid ja nende IP-aadresse.", parts: [["ip", "võrguseadistuse tööriist"], ["-br", "lühike vaade"], ["address", "liideste aadressid"]], when: "Kui tahad teada, kas liides on üleval ja IP olemas.", tags: "võrk ip liides" },
  { id: "ip-route", category: 2, command: "ip route", short: "Vaata marsruute ja võimalikku vaikelüüsi.", parts: [["ip", "võrguseadistuse tööriist"], ["route", "marsruutimistabel"]], when: "Kui aadress on olemas, aga väline sihtkoht ei tööta.", tags: "võrk marsruut vaikelüüs" },
  { id: "ip-route-get", category: 2, command: "ip route get 1.1.1.1", short: "Näe, millist teed süsteem sihtkohta kasutaks.", parts: [["ip route get", "pärib valitava marsruudi"], ["1.1.1.1", "näidissihtkoht"]], when: "Kui tahad teada lähteliidest ja marsruuti. Käsk ei saada paketti.", tags: "võrk marsruut liides" },
  { id: "resolvectl", category: 2, command: "resolvectl query example.com", short: "Kontrolli nime lahendamist.", parts: [["resolvectl", "systemd-resolved tööriist"], ["query", "nimepäring"], ["example.com", "näidisdomeen"]], when: "DNS-i kontrolliks süsteemis, mis kasutab systemd-resolved teenust.", tags: "dns võrk domeen" },
  { id: "ping", category: 2, command: "ping -c 4 192.168.10.1", short: "Saada lüüsile neli kajapäringut.", parts: [["ping", "ICMP kajapäring"], ["-c 4", "neli päringut"], ["192.168.10.1", "näidisvaikelüüs"]], when: "Kohaliku lüüsi esmaseks kättesaadavuse kontrolliks. ICMP võib olla blokeeritud.", tags: "võrk lüüs paketikadu" },
  { id: "ss", category: 2, command: "ss -tln", short: "Vaata, millised TCP pordid kuulavad.", parts: [["ss", "võrgupesade vaade"], ["-t", "TCP"], ["-l", "kuulavad pesad"], ["-n", "numbrilised aadressid ja pordid"]], when: "Kui uurid, kas kohalik teenus kuulab oodatud pordil.", tags: "võrk port tcp listen" },
  { id: "curl", category: 2, command: "curl -I --connect-timeout 5 https://example.com/", short: "Kontrolli HTTPS päiseid ja esmast vastust.", parts: [["curl", "võrgupäring"], ["-I", "HEAD päring, kuvab päised"], ["--connect-timeout 5", "ühenduse loomiseks kuni 5 sekundit"], ["URL", "näidissihtkoht"]], when: "HTTPS-i, sertifikaadi ja HTTP vastuse esmaseks kontrolliks. Ajapiirang ei hõlma kogu päringut.", tags: "https http tls võrk" },
  { id: "tcpdump", category: 2, command: "tcpdump -i eth0 -nn -c 20 port 443", short: "Vaata piiratud hulka HTTPS liikluse pakette.", parts: [["tcpdump", "püüab võrgupakette"], ["-i eth0", "näidisliides"], ["-nn", "jätab aadressid ja pordid numbriliseks"], ["-c 20", "peatub 20 paketi järel"], ["port 443", "liiklusfilter"]], when: "Kui pead lubatud võrgus kontrollima, kas liiklus jõuab liideseni. Võib vajada kõrgemaid õigusi.", tags: "võrk paketid https", caution: "Püüa pakette ainult lubatud võrgus; väljund võib sisaldada tundlikke andmeid." },
  { id: "df", category: 3, command: "df -h /", short: "Vaata juurfailisüsteemi vaba ruumi.", parts: [["df", "failisüsteemi ruumikasutus"], ["-h", "loetavad ühikud"], ["/", "juurfailisüsteem"]], when: "Kui rakendus ei saa kirjutada või näed teadet „No space left on device“.", tags: "ketas ruum failisüsteem" },
  { id: "free", category: 3, command: "free -h", short: "Vaata mälu kasutust ja saadaolevat mälu.", parts: [["free", "mälu kasutus"], ["-h", "loetavad ühikud"]], when: "Kui süsteem aeglustub või kahtlustad mälupuudust; vaata available väärtust.", tags: "mälu ram aeglane" },
  { id: "ps", category: 3, command: "ps -eo pid,comm,%cpu --sort=-%cpu", short: "Leia suurima CPU kasutusega protsessid.", parts: [["ps", "protsesside loend"], ["-e", "kõik protsessid"], ["-o pid,comm,%cpu", "kuvatavad veerud"], ["--sort=-%cpu", "suurim kasutus ees"]], when: "Kui vajad kiiret ülevaadet CPU koormajatest. Näit on hetkeseis.", tags: "cpu protsess aeglane" },
  { id: "timedatectl", category: 3, command: "timedatectl status", short: "Kontrolli süsteemikella ja ajavööndit.", parts: [["timedatectl", "kella seadistuse tööriist"], ["status", "näitab olekut"]], when: "Kui logide ajad või TLS sertifikaadi kontroll näivad valed.", tags: "aeg kell ajavöönd tls" },
  { id: "man", category: 4, command: "man journalctl", short: "Ava käsu ametlik käsiraamat.", parts: [["man", "avab käsiraamatu"], ["journalctl", "uuritav käsk"]], when: "Kui pead käsu valiku täpset mõju kontrollima.", tags: "abi dokumentatsioon" },
  { id: "ssh", category: 4, command: "ssh -p 2220 bandit0@bandit.labs.overthewire.org", short: "Ühendu Banditi harjutusserveriga.", parts: [["ssh", "krüptitud kaugseanss"], ["-p 2220", "serveri port"], ["bandit0", "kasutajanimi"], ["@server", "serveri nimi"]], when: "OverTheWire Banditi 0. taseme harjutuseks. Ühendu ainult lubatud serveritega.", tags: "harjutus ssh bandit", caution: "Kontrolli serveri võtme sõrmejälge esimesel ühendusel." }
];

const scenarios = [
  { id: "service", label: "Teenus ei tööta", intro: "Alusta teenuse olekust ja liigu värskeimate logikirjeteni. Kui näed timeout'i, kontrolli ka võrku.", steps: ["systemctl", "journalctl", "ls", "tail", "grep", "ss", "curl"] },
  { id: "network", label: "Võrk või DNS", intro: "Kontrolli esmalt kohalikku aadressi ja marsruuti, seejärel nime lahendamist ning ühendust.", steps: ["ip-address", "ip-route", "ip-route-get", "ping", "resolvectl", "ss", "curl", "tcpdump"] },
  { id: "resources", label: "Aeglane või täis", intro: "Vaata, kas piirang on kettaruumis, mälus või protsessori kasutuses, ning seosta tulemus logidega.", steps: ["df", "free", "ps", "journalctl", "find"] },
  { id: "clock", label: "Kell või TLS", intro: "Ajanihe võib muuta logid segaseks ja rikkuda sertifikaadi kontrolli. Võrdle kella ning HTTPS vastust.", steps: ["timedatectl", "curl", "man"] }
];

const byId = new Map(commands.map((item) => [item.id, item]));
const state = { scenario: "service", step: 0 };
const $ = (selector) => document.querySelector(selector);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("visible"), 2500);
}

async function copyCommand(command) {
  try {
    await navigator.clipboard.writeText(command);
    showToast("Käsk kopeeritud. Kontrolli enne käivitamist näidisväärtusi.");
  } catch {
    showToast("Kopeerimine ei õnnestunud. Vali käsk ja kopeeri käsitsi.");
  }
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderFocus() {
  const scenario = scenarios.find((item) => item.id === state.scenario);
  const data = byId.get(scenario.steps[state.step]);
  const panel = $("#focus-panel");
  panel.replaceChildren();
  const top = element("div", "focus-top");
  top.append(element("span", "mini-label", `SAMM ${String(state.step + 1).padStart(2, "0")} / ${String(scenario.steps.length).padStart(2, "0")}`), element("span", "topic-badge", categories[data.category]));
  panel.append(top, element("h3", "", data.short));
  const codeRow = element("div", "code-row");
  codeRow.append(element("code", "", data.command));
  const copy = element("button", "copy-button", "Kopeeri");
  copy.type = "button";
  copy.addEventListener("click", () => copyCommand(data.command));
  codeRow.append(copy);
  panel.append(codeRow, element("p", "focus-when", data.when));
  const caption = element("p", "mini-label", "KÄSU OSAD");
  const parts = element("dl", "parts-list");
  for (const [part, meaning] of data.parts) {
    parts.append(element("dt", "", part), element("dd", "", meaning));
  }
  panel.append(caption, parts);
  if (data.caution) panel.append(element("p", "caution", data.caution));
}

function renderJourney() {
  const scenario = scenarios.find((item) => item.id === state.scenario);
  const tabs = $("#scenario-tabs");
  tabs.replaceChildren();
  for (const item of scenarios) {
    const tab = element("button", item.id === state.scenario ? "scenario-tab active" : "scenario-tab", item.label);
    tab.type = "button";
    tab.id = `scenario-${item.id}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", "journey-panel");
    tab.setAttribute("aria-selected", String(item.id === state.scenario));
    tab.tabIndex = item.id === state.scenario ? 0 : -1;
    tab.addEventListener("click", () => { state.scenario = item.id; state.step = 0; renderJourney(); });
    tabs.append(tab);
  }
  const list = $("#journey-list");
  $("#journey-panel").setAttribute("aria-labelledby", `scenario-${scenario.id}`);
  $("#journey-intro").textContent = scenario.intro;
  list.replaceChildren();
  scenario.steps.forEach((id, index) => {
    const data = byId.get(id);
    const li = element("li", index === state.step ? "active" : "");
    const button = element("button", "step-button");
    button.type = "button";
    button.setAttribute("aria-current", index === state.step ? "step" : "false");
    button.append(element("span", "step-number", String(index + 1).padStart(2, "0")));
    const body = element("span", "step-body");
    body.append(element("strong", "", data.command), element("small", "", data.short));
    button.append(body, element("span", "step-arrow", "↗"));
    button.addEventListener("click", () => { state.step = index; renderJourney(); });
    li.append(button);
    list.append(li);
  });
  renderFocus();
}

function renderCommandTables() {
  const container = $("#command-tables");
  container.replaceChildren();

  categories.forEach((category, categoryIndex) => {
    const section = element("section", "catalog-group");
    const heading = element("h2", "", category);
    heading.id = `kategooria-${categoryIndex + 1}`;
    section.setAttribute("aria-labelledby", heading.id);
    section.append(heading);

    const wrapper = element("div", "command-table-wrap");
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", `${category} käskude tabel, kitsal ekraanil keritav`);
    wrapper.tabIndex = 0;
    const table = element("table", "command-explanation-table catalog-table");
    const thead = element("thead", "");
    const header = element("tr", "");
    for (const label of ["Käsk", "Mida teeb ja millal kasutada?", "Käsu osad"]) {
      const th = element("th", "", label);
      th.scope = "col";
      header.append(th);
    }
    thead.append(header);
    const tbody = element("tbody", "");

    for (const item of commands.filter((command) => command.category === categoryIndex)) {
      const row = element("tr", "");
      const commandCell = element("th", "");
      commandCell.scope = "row";
      commandCell.append(element("code", "", item.command));

      const explanationCell = element("td", "");
      explanationCell.append(element("p", "catalog-short", item.short));
      const when = element("p", "catalog-when");
      when.append(element("strong", "", "Millal kasutada: "), document.createTextNode(item.when));
      explanationCell.append(when);

      const partsCell = element("td", "");
      const parts = element("dl", "catalog-parts");
      for (const [part, meaning] of item.parts) {
        parts.append(element("dt", "", part), element("dd", "", meaning));
      }
      partsCell.append(parts);
      if (item.caution) partsCell.append(element("p", "catalog-caution", item.caution));

      row.append(commandCell, explanationCell, partsCell);
      tbody.append(row);
    }

    table.append(thead, tbody);
    wrapper.append(table);
    section.append(wrapper);
    container.append(section);
  });
}

if ($("#command-tables")) renderCommandTables();

if ($("#scenario-tabs")) {
  $("#scenario-tabs").addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = scenarios.findIndex((item) => item.id === state.scenario);
    const next = event.key === "Home" ? 0 : event.key === "End" ? scenarios.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + scenarios.length) % scenarios.length;
    state.scenario = scenarios[next].id;
    state.step = 0;
    renderJourney();
    $("#scenario-tabs .active").focus();
  });
  renderJourney();
}
