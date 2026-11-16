const test = require("node:test");
const assert = require("node:assert/strict");
const { parseIPv4, formatIPv4, maskForPrefix, dottedBits, calculateSubnet, hostRange } = require("../network.js");

test("IPv4 sisendi range ja kuju", () => {
  assert.equal(formatIPv4(parseIPv4("192.168.1.70")), "192.168.1.70");
  for (const invalid of ["256.1.1.1", "192.168.1", "192.168.01.70", "192.168.-1.1", "abc", "1.2.3.4.5"]) {
    assert.equal(parseIPv4(invalid), null, invalid);
  }
});

test("CIDR-ist moodustub järjestikune mask", () => {
  assert.equal(formatIPv4(maskForPrefix(0)), "0.0.0.0");
  assert.equal(formatIPv4(maskForPrefix(24)), "255.255.255.0");
  assert.equal(formatIPv4(maskForPrefix(26)), "255.255.255.192");
  assert.equal(formatIPv4(maskForPrefix(32)), "255.255.255.255");
  assert.throws(() => maskForPrefix(33), RangeError);
  assert.throws(() => maskForPrefix(24.5), RangeError);
});

test("binaarne AND eristab /24 ja /26 alamvõrke", () => {
  const wide = calculateSubnet("192.168.1.15", "192.168.1.70", 24);
  const narrow = calculateSubnet("192.168.1.15", "192.168.1.70", 26);
  assert.equal(wide.sameNetwork, true);
  assert.equal(narrow.sameNetwork, false);
  assert.equal(formatIPv4(narrow.network), "192.168.1.0");
  assert.equal(formatIPv4(narrow.peerNetwork), "192.168.1.64");
  assert.equal(formatIPv4(narrow.last), "192.168.1.63");
  assert.equal(narrow.size, 64);
  assert.equal(dottedBits(parseIPv4("192.168.1.70")), "11000000.10101000.00000001.01000110");
});

test("/31 ja /32 erijuhud ei kaota kahte hosti", () => {
  const pair = calculateSubnet("192.0.2.10", "192.0.2.11", 31);
  assert.equal(pair.sameNetwork, true);
  assert.equal(pair.size, 2);
  assert.match(hostRange(pair), /192\.0\.2\.10.*192\.0\.2\.11/);
  const single = calculateSubnet("192.0.2.10", "192.0.2.11", 32);
  assert.equal(single.sameNetwork, false);
  assert.equal(single.size, 1);
  assert.match(hostRange(single), /üks aadress/);
});

test("/0 ja kõrged IPv4 väärtused ei lähe märgiga täisarvuks", () => {
  const defaultRoute = calculateSubnet("203.0.113.250", "1.1.1.1", 0);
  assert.equal(formatIPv4(defaultRoute.network), "0.0.0.0");
  assert.equal(formatIPv4(defaultRoute.last), "255.255.255.255");
  assert.equal(defaultRoute.size, 4294967296);
  const host = calculateSubnet("255.255.255.254", "255.255.255.255", 32);
  assert.equal(formatIPv4(host.network), "255.255.255.254");
  assert.equal(host.sameNetwork, false);
});
