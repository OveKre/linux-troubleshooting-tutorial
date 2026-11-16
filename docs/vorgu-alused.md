# IP-aadress, võrgumask ja paketi teekond

Topoloogia kirjeldab, kuidas seadmed ja ühendused paiknevad. IP-aadressid ja marsruudid annavad neile loogilise aadressisüsteemi: **kellele** pakett läheb ja **millise järgmise sammuni** see saadetakse. Allpool keskendume IPv4-le; IPv6 erinevused on eraldi lõigus. [Ava interaktiivne binaarkalkulaator](../vorgu-alused.html#kalkulaator).

> Oluline täpsustus: IP-aadress ei pea olema kogu maailmas igal seadmel ainukordne. Privaatset `192.168.1.15` aadressi võivad eri kohtvõrgud korraga kasutada. Aadress peab olema eristatav selles võrgus ja ulatuses, kus seda kasutatakse.

## Kuidas IP-aadress seadmele tekib?

1. **Aadressiplokk eraldatakse.** Avaliku IPv4 ruumi puhul liiguvad plokid ülemaailmsest haldusest piirkondlike registrite kaudu teenusepakkujatele ja organisatsioonidele. Kohtvõrgu haldaja võib valida ühe RFC 1918 privaatploki, näiteks `192.168.10.0/24`. Need on kaks eri tasandit: ploki eraldamine ei määra veel ühe pakiautomaadi aadressi.
2. **Võrk jagatakse alamvõrkudeks.** Haldaja valib prefiksi pikkuse, nt `/24` või `/26`, ning otsustab, millised aadressid lähevad liidesele, ruuterile ja teistele seadmetele. Aadress peab sobima valitud alamvõrku; sama aadressi ei tohi samal lingil konfliktiga kasutada.
3. **Liides saab aadressi.** IPv4 puhul seadistatakse see käsitsi või antakse DHCP-ga. Tavaline DHCP vahetus on **Discover → Offer → Request → Acknowledge**. Vastus võib anda ka maski, vaikelüüsi ja DNS-serveri; need on eraldi seaded, mitte IP-aadressi sisse kodeeritud. DHCP rendilepingul on eluiga ja sama seade võib saada järgmine kord sama või teise aadressi. DHCP reserveeringuga saab seade ka püsivana näiva aadressi, seega „staatiline“ ei tähenda alati käsitsi sisestamist.
4. **Seade lisab marsruudid.** Liidese aadressist ja prefiksist tekib tavaliselt ühendatud võrgu marsruut; eraldi vaikeruut ütleb, kuhu saata paketid, millele täpsemat marsruuti pole. DNS-i seadistus võimaldab nimedest IP-aadresse otsida. Ilma DNS-ita võib numbrilisele IP-le ühendus toimida.

IPv6 puhul saab seade aadressi käsitsi, DHCPv6-ga või **SLAAC**-iga: ruuter reklaamib prefiksi, seade moodustab aadressi liideseidentifikaatoriga ja kontrollib aadressikonflikti. IPv6 `fe80::/10` link-local aadress ei sobi üle ruuteri suhtlemiseks. [RFC 4862](https://www.rfc-editor.org/info/rfc4862/) kirjeldab SLAAC-i.

## Kuidas võrgumask „luuakse“?

Maski ei arvutata välja IP-aadressi kümnendkujust. Võrgu planeerija valib **prefiksi pikkuse** `n` vahemikust 0–32. IPv4 maskis on vasakult alustades `n` ühte ja ülejäänud `32−n` nulli. Ühed peavad olema järjestikused; CIDR ei kasuta lünklikke maske. Iga kaheksabitine osa teisendatakse kümnendarvuks.

| Prefiks | Mask binaarselt | Mask kümnendarvudena | Aadresse plokis |
| --- | --- | --- | ---: |
| `/24` | `11111111.11111111.11111111.00000000` | `255.255.255.0` | 256 |
| `/26` | `11111111.11111111.11111111.11000000` | `255.255.255.192` | 64 |
| `/30` | `11111111.11111111.11111111.11111100` | `255.255.255.252` | 4 |

Miks `/26` lõpeb arvuga `192`? Viimases oktetis on kaks ühte: `11000000₂ = 128 + 64 = 192`. Üldvalem on **aadresse plokis = 2^(32−n)**. Tavapärases IPv4 alamvõrgus `/0` kuni `/30` jäetakse ploki esimene aadress võrgu- ja viimane leviaadressiks. Näiteks `/26` puhul jääb tavaliselt **62 hostiaadressi**. `/31` on punktist punkti ühenduse erijuhtum, kus mõlemad aadressid võivad olla kasutusel; `/32` tähistab üht aadressi. Ära lahuta nende puhul automaatselt kahte.

## Kuidas mask kontrollib binaartasemel?

Seade teeb IP-aadressi ja maski vahel bitikaupa **AND**-tehte: `1 AND 1 = 1`; kõik teised kombinatsioonid annavad `0`. Nii jääb alles võrguosa, hostiosa nullitakse.

Näide aadressiga `192.168.1.70/26`:

```text
IP       11000000.10101000.00000001.01000110   192.168.1.70
mask     11111111.11111111.11111111.11000000   255.255.255.192
AND      11000000.10101000.00000001.01000000   192.168.1.64
```

Võrguaadress on `192.168.1.64`; plokk ulatub `192.168.1.64` kuni `192.168.1.127`. Traditsioonilises `/26` alamvõrgus on kasutatavad hostiaadressid `.65` kuni `.126` ja leviaadress `.127`. Võrdlusaadressi `192.168.1.15` viimane oktett on `00001111`; `00001111 AND 11000000 = 00000000`. Selle võrguaadress on `192.168.1.0`, seega on see teises `/26` alamvõrgus. Kui mõlemal seadmel oleks `/24`, annaksid mõlemad `192.168.1.0` ja maski järgi kuuluksid samasse alamvõrku. See ongi põhjus, miks vale mask võib teha osa naabreid ootamatult kättesaamatuks.

Maski võrdlus on **õppe lihtsustus**. Tegelik paketi tee valitakse marsruutimistabelist: kõige täpsem sobiv marsruut võidab; `0.0.0.0/0` on vaikeruut. VPN, täpsem staatiline marsruut või mitu liidest võivad lihtsat „sama mask = otse“ järeldust muuta. Linuxis küsi konkreetselt `ip route get SIHT_IP` — see vaatab marsruudi, kuid ei saada sihtkohta paketti.

## Aadressi juurde kuuluvad mõisted

### Võrguaadress, hostiosa ja leviaadress

**Võrguaadress** on `IP AND mask`: kõik hostibitid on nullid. **Hostiosa** on bitid, mida mask ei kata; need eristavad seadmeid ploki sees. **Leviaadress** (*broadcast*) on tavapärases IPv4 alamvõrgus ploki viimane aadress ehk kõik hostibitid ühed. IPv6-l broadcast-aadressi ei ole; seal kasutatakse muu hulgas multicast'i.

### CIDR ja prefiks

**CIDR** (*Classless Inter-Domain Routing*) kirjutab võrguosa pikkuse kujul `/n`. `192.168.1.70/26` tähendab, et esimesed 26 bitti on võrguosa. Prefiks kirjeldab aadressiplokki ja marsruudi täpsust. Pikem prefiks, nt `/26`, hõlmab vähem aadresse kui `/24`.

### Vaikelüüs ja järgmine hüpe

**Vaikelüüs** on ruuter, mida kasutatakse siis, kui sihtkohale ei leidu täpsemat marsruuti. Tavaliselt on selle IP samas kohalikus võrgus kui seadme liides, et seade saaks temaga otse suhelda. „Kogu internetiliiklus läheb vaikelüüsi“ on lihtsustus: täpsemad marsruudid ja VPN võivad kasutada teist teed. Kui vaikemarsruuti pole, võib sama lingi liiklus siiski töötada.

### MAC-aadress, ARP ja IPv6 Neighbor Discovery

**MAC-aadress** on lingikihi aadress, mida näiteks Etherneti või Wi-Fi liides kasutab lähima võrguosa kaadrites. Seda ei saadeta IP-paketiga muutumatult kogu interneti teekonnal. MAC võib olla tootja määratud, kohalikult seatud, virtuaalne või privaatsuse huvides juhuslikustatud. **ARP** aitab IPv4 kohtvõrgus leida järgmise hüppe IP-le vastava lingikihi aadressi; IPv6 kasutab selle asemel **Neighbor Discovery** mehhanismi.

### Privaatne ja avalik IPv4

Privaatkasutuseks on määratud täpselt `10.0.0.0/8`, `172.16.0.0/12` (kuni `172.31.255.255`) ja `192.168.0.0/16`. Need ei ole ülemaailmses internetis otse marsruuditavad. Mitte iga aadress väljaspool neid vahemikke pole siiski „avalik“: leidub ka muid eriotstarbelisi plokke. Väljast nähtav avalik aadress ei pruugi kuuluda seadme enda liidesele; operaatori **CGNAT** või tulemüür võib sissetuleva ühenduse ikkagi takistada.

### Staatiline ja dünaamiline aadress

**Staatiline** tähendab, et aadress on mõeldud püsima; seda võib seadistada liidesel käsitsi või hoida DHCP reserveeringuga. **Dünaamiline** aadress antakse tavaliselt DHCP rendina ja võib aja jooksul muutuda. Ka dünaamiline DHCP rent võib praktikas kaua sama aadressi anda. Aadressi püsivus ja selle andmise viis on eri küsimused.

### DHCP, DNS ja NAT

**DHCP** annab IPv4 seadmele aadressi ja võib jagada ka maski, lüüsi ning DNS-i seaded. **DNS** vastab nimepäringutele: `A` kirje võib anda IPv4 ja `AAAA` kirje IPv6 aadressi; DNS ei taga iseenesest, et sihtteenus vastab. **NAT** teisendab aadresse; koduvõrkudes kasutatav **NAPT/PAT** tõlgib ka porte, et mitu sisemist seadet saaks jagada üht välist IPv4 aadressi. NAT ei ole sama mis tulemüür ega ole IPv6 toimimiseks vältimatu.

### ICMP ja ping

**ICMP** kannab võrgu juht- ja veateateid. `ping` saadab ICMP kajapäringuid ning võib mõõta vastust ja paketikadu. Vastuse puudumine ei tõesta üksinda, et teenus või kogu võrk on maas: ICMP võib olla piiratud, samal ajal kui TCP/HTTPS töötab.

## Pakiautomaadi lihtne veaotsingu näide

Oletame, et seadmel on `192.168.10.24/24` ja oodatud lüüs `192.168.10.1`. Need on väljamõeldud väärtused. Kui saadetise sünkroonimine aegub, piira põhjust järjekorras:

1. `ip -br address` — kas liides on üleval ja aadress koos prefiksiga olemas?
2. `ip route` — kas vaikeruut osutab oodatud lüüsile?
3. `ip route get 1.1.1.1` — millise liidese ja lähteaadressi süsteem valiks? See ei saada paketti.
4. `ping -c 4 192.168.10.1` — kas kohalik lüüs vastab? ICMP tulemusega ei saa kõike tõestada.
5. `resolvectl query example.com` — kas DNS lahendab nime, kui kasutusel on `systemd-resolved`?
6. `curl -I --connect-timeout 5 https://example.com/` — kas HTTPS ühendus ja esmane HTTP vastus töötavad? `HEAD` ei kontrolli tervet rakenduse töövoogu.

Kui `ip -br address` näitab näiteks `192.168.10.24/26`, on selle võrguvahemik `192.168.10.0–63` ja lüüs `.1` sobib. Kui lüüs oleks `.129`, oleks see maski järgi teises alamvõrgus ning lihtne otseühendus ei pruugiks toimida. Vaata ka [pakiautomaadi näidisjuhtumeid](../index.html#juhtumid), kus logirida suunab järgmise käsuni.

## Allikad

- [RFC 791: IPv4 aadressi 32 bitti](https://www.rfc-editor.org/info/rfc791/)
- [RFC 4632: CIDR ja järjestikune prefiks](https://www.rfc-editor.org/info/rfc4632/)
- [RFC 1812: kõige täpsema marsruudi valik](https://www.rfc-editor.org/info/rfc1812/)
- [RFC 2131: DHCP aadressi ja rendi andmine](https://www.rfc-editor.org/info/rfc2131/)
- [RFC 2132: DHCP maski, ruuteri ja DNS-i valikud](https://www.rfc-editor.org/info/rfc2132/)
- [IANA: privaatsed IPv4 vahemikud](https://www.iana.org/help/private-addresses)
- [RFC 4291: IPv6 aadressid](https://www.rfc-editor.org/info/rfc4291/)
- [RFC 4862: IPv6 SLAAC](https://www.rfc-editor.org/info/rfc4862/)
- [RFC 826: ARP](https://www.rfc-editor.org/info/rfc826/)
- [RFC 3021: /31 punktist punkti ühendustes](https://www.rfc-editor.org/info/rfc3021/)
- [RFC 9724: muutuvad ja juhuslikustatud MAC-aadressid](https://www.rfc-editor.org/info/rfc9724/)
- [RFC 3022: NAT ja NAPT](https://www.rfc-editor.org/info/rfc3022/)
