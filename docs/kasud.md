# 21 Linuxi käsu selgitused

Käskudes kasutatud teenuse-, faili-, liidese- ja aadressinimed on näited. Asenda need oma süsteemi väärtustega. Veaotsing algab sümptomist: vaata kõigepealt olekut, seejärel piiritle võimalik põhjus.

## Asukoht ja logid

### `pwd`
`pwd` tähendab *print working directory* ja kuvab praeguse töökataloogi. Kasuta enne failidega töötamist, et teada oma asukohta.

### `ls -lah /var/log`
`ls` loetleb kataloogi sisu; `-l` näitab üksikasju, `-a` ka peidetud kirjeid ja `-h` inimloetavaid suurusi. `/var/log` on logide kataloog. Kasuta logifailide leidmiseks ja suuruste võrdlemiseks.

### `tail -n 50 /var/log/example.log`
`tail` näitab faili lõppu; `-n 50` valib viimased 50 rida. Asenda failitee tegeliku logiga. Kasuta värskeimate kirjete vaatamiseks.

### `grep -ni "timeout" /var/log/example.log`
`grep` otsib teksti; `-n` lisab reanumbri ja `-i` eirab tähesuurust. `"timeout"` on otsingusõna ning viimane argument on fail. Kasuta aegumiskirjete leidmiseks. Väga suure faili puhul võib otsing aega võtta.

### `find /var/log -type f -name '*.log'`
`find` otsib alates `/var/log` kataloogist; `-type f` valib tavalised failid ja `-name '*.log'` `.log` lõpuga nimed. Ülakomad takistavad shellil mustrit enne `find` käivitamist laiendamast. Kasuta siis, kui logifaili nimi on teadmata.

## Teenus

### `journalctl -u example.service --since "1 hour ago" -n 100 --no-pager`
`journalctl` loeb süsteemset logipäevikut; `-u` piirab teenusega; `--since "1 hour ago"` valib ajavahemiku alguse; `-n 100` piirab kirjete arvu ja `--no-pager` kuvab väljundi otse. Kasuta teenuse viimase tunni kirjete uurimiseks. Sõltuvalt õigustest ei pruugi kõik kirjed olla nähtavad.

### `systemctl status example.service --no-pager`
`systemctl status` näitab teenuse olekut; `example.service` on teenuse nimi ja `--no-pager` kuvab väljundi otse. Kasuta kontrolliks, kas teenus töötab või on tõrkesse läinud. `status` ei taaskäivita teenust.

## Võrk

### `ip -br address`
`ip` näitab võrguseadistust; `-br` valib lühivaate ja `address` liideste aadressid. Kasuta kontrolliks, kas liides on üleval ja IP-aadress olemas.

### `ip route`
`ip route` näitab marsruutimistabelit, sealhulgas võimalikku vaikelüüsi. Kasuta siis, kui seadmel on IP-aadress, kuid väline sihtkoht ei tööta.

### `ip route get 1.1.1.1`
`ip route get` näitab, millise marsruudi ja lähteliidese süsteem selle sihtkoha jaoks valiks. `1.1.1.1` on näidissihtkoht. Käsk ise ei saada sihtkohta paketti.

### `resolvectl query example.com`
`resolvectl query` küsib nime lahendust süsteemilt, mis kasutab `systemd-resolved` teenust. Kasuta DNS-i kontrolliks. Kui seda teenust ei kasutata, vali süsteemile sobiv teine tööriist.

### `ping -c 4 192.168.10.1`
`ping` saadab ICMP kajapäringuid; `-c 4` piirab need nelja päringuga. Aadress on näidisvaikelüüs. Kasuta kohaliku lüüsi kättesaadavuse ja paketikadude esmaseks kontrolliks. Mõni võrk blokeerib ICMP-d, mistõttu ebaõnnestunud ping üksi ei tõesta ühenduse puudumist.

### `ss -tln`
`ss` näitab võrgupesi; `-t` valib TCP, `-l` kuulavad pesad ja `-n` numbrilised aadressid ning pordid. Kasuta kontrolliks, kas kohalik teenus kuulab oodatud pordil.

### `curl -I --connect-timeout 5 https://example.com/`
`curl` teeb HTTP päringu; `-I` küsib päiseid `HEAD` päringuga; `--connect-timeout 5` piirab ühenduse loomise aega viie sekundiga. Kasuta HTTPS-i, sertifikaadi ja HTTP vastuse esmaseks kontrolliks. See valik ei piira kogu päringu kestust ning `HEAD` ei tõesta kogu rakenduse töövoogu.

### `tcpdump -i eth0 -nn -c 20 port 443`
`tcpdump` jälgib pakette; `-i eth0` valib liidese, `-nn` jätab IP-aadressid ja pordid numbriliseks, `-c 20` peatub 20 paketi järel ning `port 443` filtreerib liiklust. Kasuta lubatud võrgus, kui pead kontrollima, kas HTTPS-i liiklus üldse liideseni jõuab. Asenda `eth0` oma liidesega (vaata `ip -br address`). Pakettide püüdmine võib vajada kõrgemaid õigusi; väljund võib sisaldada tundlikku infot. Ka liikluse puudumine valel liidesel ei tõesta tõrget.

## Ressursid ja aeg

### `df -h /`
`df` näitab failisüsteemi kasutust ja vaba ruumi; `-h` vormindab ühikud loetavalt; `/` valib juurfailisüsteemi. Kasuta, kui logis on „No space left on device“ või kirjutamine ebaõnnestub. Kui rakendus kasutab muud failisüsteemi, kontrolli selle asukohta.

### `free -h`
`free` näitab mälu kasutust ja `-h` loetavaid ühikuid. Kasuta aeglustumise või mälupuuduse kahtluse korral. Vaata eriti `available` väärtust, mitte ainult `free` veergu.

### `ps -eo pid,comm,%cpu --sort=-%cpu`
`ps` loetleb protsesse; `-e` valib kõik, `-o` määrab veerud (`pid`, `comm`, `%cpu`) ja `--sort=-%cpu` järjestab suurimast alates. Kasuta suure protsessorikasutusega protsessi leidmiseks. Näit on hetkeseis.

### `timedatectl status`
`timedatectl status` näitab süsteemikella, ajavööndit ja sünkroonimise olekut. Kasuta, kui logide ajatemplid või TLS-i sertifikaadi kontroll tunduvad valed.

## Abi ja harjutus

### `man journalctl`
`man` avab käsiraamatu lehe `journalctl` kohta. Kasuta valikute täpse käitumise kontrolliks. Kui `man` puudub, võib süsteemis olla vaja vastav pakett paigaldada.

### `ssh -p 2220 bandit0@bandit.labs.overthewire.org`
`ssh` loob krüptitud kaugseansi; `-p 2220` valib pordi; `bandit0` on kasutaja, `@` eraldab selle serveri nimest. Kasuta [OverTheWire Banditi 0. taseme](https://overthewire.org/wargames/bandit/bandit0.html) harjutuseks. Töökeskkonnas ühendu ainult lubatud kontode ja serveritega ning kontrolli esimesel ühendusel serveri võtme sõrmejälge.
