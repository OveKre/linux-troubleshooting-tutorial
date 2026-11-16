// Kõik juhtumid ja väljundid on väljamõeldud õppematerjal.
// Teenusenimed, failid ja aadressid tuleb päris seadmes asendada.
const lockerCases = [
  {
    id: "dns",
    label: "Sünkroonimine aegub",
    title: "Saadetise olek ei jõua serverisse",
    symptom: "Uks sulgub, kuid saadetise oleku saatmine jääb ootele.",
    log: [
      ["INFO", "10:42:14 locker-agent[2184]: compartment C07 closed; event queued"],
      ["ERROR", "10:42:15 locker-agent[2184]: sync request timed out for api.example.com"],
      ["WARN", "10:42:15 locker-agent[2184]: 7 events waiting for retry"]
    ],
    steps: [
      { command: "systemctl status locker-agent.service --no-pager", why: "Kas pakiautomaadi rakendus töötab?", output: "● locker-agent.service - Locker agent\n   Active: active (running) since 09:18:02", meaning: "Teenus töötab. Aegumine ei tõesta, et teenus oleks seiskunud; uurime selle logi." },
      { command: 'journalctl -u locker-agent.service --since "1 hour ago" -n 100 --no-pager', why: "Kas viga kordub ja millal see algas?", output: "10:42:15 locker-agent[2184]: ERROR sync request timed out for api.example.com\n10:42:45 locker-agent[2184]: ERROR sync request timed out for api.example.com", meaning: "Sama tõrge kordub. Logi ütleb, et päring aegub, kuid ei erista veel võrku, DNS-i ja serverit." },
      { command: "ip -br address", why: "Kas seadmel on aktiivne võrguliides ja IP-aadress?", output: "lo      UNKNOWN  127.0.0.1/8\neth0    UP       192.168.10.24/24", meaning: "eth0 on üleval ja aadress olemas. Järgmisena kontrollime marsruuti." },
      { command: "ip route", why: "Kas välisvõrgu jaoks on vaikelüüs?", output: "default via 192.168.10.1 dev eth0\n192.168.10.0/24 dev eth0 src 192.168.10.24", meaning: "Vaikemarsruut on olemas. Kontrollime, kas kohalik lüüs vastab." },
      { command: "ping -c 4 192.168.10.1", why: "Kas seade saab kohaliku lüüsiga ühendust?", output: "4 packets transmitted, 4 received, 0% packet loss", meaning: "Lüüs vastab. ICMP kontroll üksi ei tõesta interneti või rakenduse toimimist; uurime nime lahendamist." },
      { command: "resolvectl query api.example.com", why: "Kas API nimi lahendub IP-aadressiks?", output: "api.example.com: resolve call failed: All attempts to contact name servers or networks failed", meaning: "Selles näites DNS-päring ebaõnnestub. Kontrollime, kas HTTPS-päring näitab sama takistust." },
      { command: "curl -I --connect-timeout 5 https://api.example.com/", why: "Kas HTTP klient jõuab API nimeni?", output: "curl: (6) Could not resolve host: api.example.com", meaning: "Ka HTTP klient ei saa nime lahendatud. HEAD-päringut ei jõuta veel saata." }
    ],
    rootCause: "Näidisandmete põhjal on tõrge DNS-i nime lahendamises. Rakendus töötab, IP ja vaikelüüs on olemas ning kohalik lüüs vastab, kuid API nime ei saa IP-aadressiks teisendada.",
    nextCheck: "Päris seadmes kontrolli DNS-serveri seadistust ja kättesaadavust. See näide ei ütle veel, kas tõrge on seadme resolveris või DNS-serveris."
  },
  {
    id: "disk",
    label: "Andmeid ei salvestata",
    title: "Sündmus ei mahu kettale",
    symptom: "Saadetise sündmused tekivad, kuid rakendus ei saa neid püsivalt salvestada.",
    log: [
      ["INFO", "11:08:31 locker-agent[2184]: parcel P104 event received"],
      ["ERROR", "11:08:31 locker-agent[2184]: failed to persist event: No space left on device"],
      ["WARN", "11:08:32 locker-agent[2184]: event will be retried"]
    ],
    steps: [
      { command: "systemctl status locker-agent.service --no-pager", why: "Kas teenus on seiskunud või annab töötades vigu?", output: "● locker-agent.service - Locker agent\n   Active: active (running) since 09:18:02", meaning: "Teenus töötab, kuid see ei tähenda, et kirjutamine õnnestuks. Loeme täpse veateate." },
      { command: 'journalctl -u locker-agent.service --since "1 hour ago" -n 100 --no-pager', why: "Mis veateade kirjutamisel ilmub?", output: "11:08:31 locker-agent[2184]: ERROR failed to persist event: No space left on device", meaning: "Teade viitab kettaruumi puudusele. Kontrollime failisüsteemi, kuhu rakendus kirjutab." },
      { command: "df -h /", why: "Kas näidisrakenduse andmed asuvad täis juurfailisüsteemis?", output: "Filesystem       Size  Used Avail Use% Mounted on\n/dev/mmcblk0p2   8.0G  8.0G     0 100% /", meaning: "Juurfailisüsteem on täis. Selles näites paikneb rakenduse kirjutuskoht seal." },
      { command: "ls -lah /var/log", why: "Kas mõni logifail võib ruumikasutust selgitada?", output: "total 6.3G\n-rw-r----- 1 root adm 6.2G locker-agent.log\n-rw-r----- 1 root adm  84M syslog", meaning: "Suur logifail on tõenäoline ruumikasutuse panustaja. Enne kustutamist tuleb kontrollida logi kasvu põhjust ja rotatsiooni." },
      { command: "tail -n 50 /var/log/locker-agent.log", why: "Kas logi lõpus kordub sama viga?", output: "11:08:31 ERROR failed to persist event: No space left on device\n11:08:32 WARN event will be retried\n11:08:33 ERROR failed to persist event: No space left on device", meaning: "Korduvad vead selgitavad, miks logi võib edasi kasvada. Täis failisüsteem on kirjutamisvea vahetu põhjus." }
    ],
    rootCause: "Näidises on juurfailisüsteem 100% täis ja seetõttu ei saa rakendus sündmust salvestada. 6,2 GB logifail on suur tõenäoline panustaja, kuid selle kasvu algpõhjus vajab eraldi uurimist.",
    nextCheck: "Päris seadmes kontrolli, millisel failisüsteemil andmed asuvad, miks logi kasvas ja kas logide rotatsioon toimib. Ära kustuta tõendusmaterjali enne selle säilitamist."
  },
  {
    id: "link",
    label: "Võrk puudub",
    title: "Seade ei pääse kohalikust võrgust välja",
    symptom: "Rakendus on käivitatud, kuid välisühendus katkeb kohe enne päringu saatmist.",
    log: [
      ["INFO", "12:17:03 locker-agent[2184]: event queued for upload"],
      ["ERROR", "12:17:03 locker-agent[2184]: upload failed: Network is unreachable"],
      ["WARN", "12:17:03 locker-agent[2184]: retry scheduled"]
    ],
    steps: [
      { command: "systemctl status locker-agent.service --no-pager", why: "Kas rakendus töötab?", output: "● locker-agent.service - Locker agent\n   Active: active (running) since 09:18:02", meaning: "Rakendus töötab. Veateade osutab võrgutee probleemile, nii et vaatame liidest." },
      { command: "ip -br address", why: "Mis olekus on võrgu liides?", output: "lo      UNKNOWN  127.0.0.1/8\neth0    DOWN", meaning: "eth0 on maas ja sellel puudub näites IP-aadress. Kontrollime marsruute." },
      { command: "ip route", why: "Kas süsteemil on vaikelüüs?", output: "(väljund puudub)", meaning: "Marsruutimistabelis pole näites vaikelüüsi. Selgitame välja, mida süsteem sihtkoha kohta ütleb." },
      { command: "ip route get 1.1.1.1", why: "Kas süsteem leiab sihtkohani tee?", output: "RTNETLINK answers: Network is unreachable", meaning: "Süsteem ei leia välisvõrku marsruuti. See sobib kokku logis nähtud veaga." },
      { command: "ping -c 4 192.168.10.1", why: "Kas näidisvaikelüüs on praegu kättesaadav?", output: "ping: connect: Network is unreachable", meaning: "Ka kohalikku näidislüüsi ei saa võrgu oleku tõttu päringut saata." }
    ],
    rootCause: "Näidises on eth0 maas, IP-aadress puudub ja vaikelüüsi pole. See seletab rakenduse „Network is unreachable“ vea.",
    nextCheck: "Päris seadmes uuri, miks liides on maas: füüsiline ühendus, lülitiport ja võrguseadistus. Need käsud ei näita üksi, milline neist on algpõhjus."
  }
];

const lockerState = { index: 0, revealed: 0 };
const caseNode = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

async function copyLockerCommand(command) {
  try {
    await navigator.clipboard.writeText(command);
    showToast("Käsk kopeeritud. Asenda näidisnimed oma seadme väärtustega.");
  } catch {
    showToast("Kopeerimine ei õnnestunud. Vali käsk ja kopeeri käsitsi.");
  }
}

function renderLockerOptions() {
  const options = document.querySelector("#case-options");
  options.replaceChildren();
  lockerCases.forEach((item, index) => {
    const button = caseNode("button", index === lockerState.index ? "case-option active" : "case-option", item.label);
    button.type = "button";
    button.setAttribute("aria-pressed", String(index === lockerState.index));
    button.addEventListener("click", () => {
      lockerState.index = index;
      lockerState.revealed = 0;
      renderLockerOptions();
      renderLockerContent();
      options.querySelectorAll("button")[index].focus();
    });
    options.append(button);
  });
}

function renderLockerContent() {
  const item = lockerCases[lockerState.index];
  document.querySelector("#case-title").textContent = item.title;
  document.querySelector("#case-symptom").textContent = item.symptom;
  document.querySelector("#case-progress").textContent = `${lockerState.revealed} / ${item.steps.length} kontrolli avatud`;

  const log = document.querySelector("#case-log-lines");
  log.replaceChildren();
  item.log.forEach(([level, line]) => {
    const row = caseNode("div", `case-log-line ${level.toLowerCase()}`);
    row.append(caseNode("span", "log-level", level), caseNode("span", "", line));
    log.append(row);
  });

  const list = document.querySelector("#case-steps");
  list.replaceChildren();
  item.steps.slice(0, lockerState.revealed + 1).forEach((step, index) => {
    const li = caseNode("li", "case-step");
    const top = caseNode("div", "case-step-top");
    top.append(caseNode("span", "case-step-num", String(index + 1).padStart(2, "0")), caseNode("h5", "", step.why));
    li.append(top);

    const codeRow = caseNode("div", "case-command-row");
    codeRow.append(caseNode("code", "", step.command));
    const copy = caseNode("button", "copy-button", "Kopeeri");
    copy.type = "button";
    copy.setAttribute("aria-label", `Kopeeri käsk ${step.command}`);
    copy.addEventListener("click", () => copyLockerCommand(step.command));
    codeRow.append(copy);
    li.append(codeRow);

    if (index < lockerState.revealed) {
      li.append(caseNode("p", "case-output-label", "NÄIDISVÄLJUND"), caseNode("pre", "case-output", step.output), caseNode("p", "case-meaning", step.meaning));
    } else {
      const run = caseNode("button", "button primary case-show-output", "Kuva näidisväljund →");
      run.type = "button";
      run.addEventListener("click", () => {
        lockerState.revealed += 1;
        renderLockerContent();
        const next = document.querySelector(".case-show-output");
        if (next) next.focus();
        else document.querySelector("#case-conclusion").focus();
      });
      li.append(run);
    }
    list.append(li);
  });

  const conclusion = document.querySelector("#case-conclusion");
  conclusion.hidden = lockerState.revealed !== item.steps.length;
  conclusion.replaceChildren();
  if (!conclusion.hidden) {
    conclusion.append(caseNode("p", "mini-label", "JÄRELDUS NÄIDISANDMETEST"), caseNode("h4", "", "Tõenäoline juurpõhjus"), caseNode("p", "", item.rootCause), caseNode("strong", "", "Järgmine kontroll päris seadmes"), caseNode("p", "", item.nextCheck));
    const reset = caseNode("button", "case-reset", "Alusta juhtumit uuesti");
    reset.type = "button";
    reset.addEventListener("click", () => {
      lockerState.revealed = 0;
      renderLockerContent();
      document.querySelector(".case-show-output").focus();
    });
    conclusion.append(reset);
  }
}

renderLockerOptions();
renderLockerContent();
