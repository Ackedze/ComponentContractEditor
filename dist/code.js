"use strict";
(() => {
  // ../Apollo/packages/component-contract-core/src/occurrence-address.ts
  function occurrenceSegment(name, sourceId, localId) {
    if (sourceId !== void 0) return "@source:" + encodeURIComponent(sourceId);
    if (localId !== void 0) return "@local:" + encodeURIComponent(localId);
    return name.startsWith("@") || name.includes(" / ") ? "@name:" + encodeURIComponent(name) : name;
  }

  // ../Apollo/packages/component-contract-core/src/snapshot-topology.ts
  function snapshotPaths(snapshot) {
    var _a, _b;
    if (snapshot.selection.length !== 1 || ((_a = snapshot.source) == null ? void 0 : _a.truncated) !== false || ((_b = snapshot.source.captureTopology) == null ? void 0 : _b.complete) === false) return void 0;
    const byId = new Map(snapshot.nodes.map((n) => [String(n.id), n]));
    if (byId.size !== snapshot.nodes.length) return void 0;
    const root = byId.get(snapshot.selection[0]);
    if (!root || root.parentId !== null) return void 0;
    const paths = /* @__PURE__ */ new Map(), memo = /* @__PURE__ */ new Map();
    const usedPaths = /* @__PURE__ */ new Set(), siblingCounts = /* @__PURE__ */ new Map();
    for (const node of snapshot.nodes) {
      const parent = String(node.parentId), name = String(node.name);
      if (!siblingCounts.has(parent)) siblingCounts.set(parent, /* @__PURE__ */ new Map());
      const counts = siblingCounts.get(parent);
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    const pathFor = (node, visited = /* @__PURE__ */ new Set()) => {
      var _a2, _b2, _c;
      const id = String(node.id);
      if (visited.has(id)) return void 0;
      if (memo.has(id)) return memo.get(id);
      visited.add(id);
      if (node === root) return "";
      const parent = byId.get(String(node.parentId));
      if (!parent || !Array.isArray(parent.childIds) || !parent.childIds.includes(id)) return void 0;
      const parentPath2 = pathFor(parent, visited);
      if (parentPath2 === void 0 || typeof node.name !== "string") return void 0;
      let segment = node.name;
      if (((_a2 = snapshot.source) == null ? void 0 : _a2.occurrenceAddressVersion) === 1) {
        const siblings = ((_b2 = siblingCounts.get(String(node.parentId))) == null ? void 0 : _b2.get(node.name)) || 0;
        const source = (_c = node.component) == null ? void 0 : _c.sourceIdentity;
        segment = siblings > 1 ? occurrenceSegment(
          node.name,
          typeof (source == null ? void 0 : source.sourceNodeId) === "string" && source.sourceNodeId ? source.sourceNodeId : void 0,
          typeof (source == null ? void 0 : source.sourceNodeId) === "string" && source.sourceNodeId ? void 0 : id
        ) : occurrenceSegment(node.name);
      }
      const path = [parentPath2, segment].filter(Boolean).join(" / ");
      memo.set(id, path);
      return path;
    };
    for (const node of snapshot.nodes) {
      const path = pathFor(node);
      if (path === void 0 || usedPaths.has(path)) return void 0;
      paths.set(String(node.id), path);
      usedPaths.add(path);
      if (!Array.isArray(node.childIds) || new Set(node.childIds).size !== node.childIds.length || node.childIds.some((id) => {
        var _a2;
        return !byId.has(String(id)) || ((_a2 = byId.get(String(id))) == null ? void 0 : _a2.parentId) !== node.id;
      })) return void 0;
    }
    return paths;
  }
  function snapshotShape(snapshot) {
    const paths = snapshotPaths(snapshot);
    return paths && snapshot.nodes.map((n) => ({ path: paths.get(String(n.id)), type: paths.get(String(n.id)) === "" ? "ROOT" : String(n.type) })).sort((a, b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
  }

  // ../Apollo/packages/component-contract-core/vendor/sha256.ts
  function utf8Bytes(input) {
    const bytes = new Uint8Array(input.length * 3);
    let length = 0;
    for (let index = 0; index < input.length; index += 1) {
      let codePoint = input.charCodeAt(index);
      if (codePoint >= 55296 && codePoint <= 56319) {
        const low = input.charCodeAt(index + 1);
        if (low >= 56320 && low <= 57343) {
          codePoint = 65536 + (codePoint - 55296 << 10) + (low - 56320);
          index += 1;
        } else codePoint = 65533;
      } else if (codePoint >= 56320 && codePoint <= 57343) codePoint = 65533;
      if (codePoint <= 127) {
        bytes[length++] = codePoint;
      } else if (codePoint <= 2047) {
        bytes[length++] = 192 | codePoint >>> 6;
        bytes[length++] = 128 | codePoint & 63;
      } else if (codePoint <= 65535) {
        bytes[length++] = 224 | codePoint >>> 12;
        bytes[length++] = 128 | codePoint >>> 6 & 63;
        bytes[length++] = 128 | codePoint & 63;
      } else {
        bytes[length++] = 240 | codePoint >>> 18;
        bytes[length++] = 128 | codePoint >>> 12 & 63;
        bytes[length++] = 128 | codePoint >>> 6 & 63;
        bytes[length++] = 128 | codePoint & 63;
      }
    }
    return bytes.subarray(0, length);
  }
  var SHA256_INITIAL = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
  var SHA256_ROUNDS = [
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ];
  var rightRotate = (value, amount) => value >>> amount | value << 32 - amount;
  function sha256Hex(input) {
    const words = new Int32Array(64);
    const hash = new Int32Array(SHA256_INITIAL);
    const bytes = utf8Bytes(input);
    const bitLength = bytes.length * 8;
    const paddedLength = bytes.length + 9 + 63 >> 6 << 6;
    const padded = new Uint8Array(paddedLength);
    padded.set(bytes);
    padded[bytes.length] = 128;
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLength - 4, bitLength >>> 0, false);
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 4294967296), false);
    for (let offset = 0; offset < paddedLength; offset += 64) {
      for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4, false);
      for (let index = 16; index < 64; index += 1) {
        const w15 = words[index - 15], w2 = words[index - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ w15 >>> 3;
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ w2 >>> 10;
        words[index] = words[index - 16] + s0 + words[index - 7] + s1 | 0;
      }
      let a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4], f = hash[5], g = hash[6], h = hash[7];
      for (let index = 0; index < 64; index += 1) {
        const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
        const choice = e & f ^ ~e & g;
        const temp1 = h + s1 + choice + SHA256_ROUNDS[index] + words[index] | 0;
        const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
        const majority = a & b ^ a & c ^ b & c;
        const temp2 = s0 + majority | 0;
        h = g;
        g = f;
        f = e;
        e = d + temp1 | 0;
        d = c;
        c = b;
        b = a;
        a = temp1 + temp2 | 0;
      }
      hash[0] = hash[0] + a | 0;
      hash[1] = hash[1] + b | 0;
      hash[2] = hash[2] + c | 0;
      hash[3] = hash[3] + d | 0;
      hash[4] = hash[4] + e | 0;
      hash[5] = hash[5] + f | 0;
      hash[6] = hash[6] + g | 0;
      hash[7] = hash[7] + h | 0;
    }
    return Array.from(hash, (value) => (value >>> 0).toString(16).padStart(8, "0")).join("");
  }

  // ../Apollo/packages/component-contract-core/src/stable.ts
  function stableStringify(value) {
    var _a;
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
      const object2 = value;
      return `{${Object.keys(object2).filter((key) => object2[key] !== void 0).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(object2[key])}`).join(",")}}`;
    }
    return (_a = JSON.stringify(value)) != null ? _a : "null";
  }
  function stableHash(value) {
    return sha256Hex(stableStringify(value));
  }

  // ../Apollo/packages/component-contract-core/src/capture-representation.ts
  function matchesCaptureRepresentation(rep, componentKey, componentSetKey = "") {
    if (rep.kind !== "figma" || rep.status === "deprecated" || !componentKey) return false;
    const set = rep.locator.componentSetKey;
    if (typeof set === "string" && set) return Boolean(componentSetKey && set === componentSetKey);
    const key = rep.locator.componentKey;
    return typeof key === "string" && Boolean(key) && (key === componentKey || key === componentSetKey);
  }
  function resolveCaptureRepresentation(representations, componentKey, componentSetKey = "") {
    var _a;
    const matches = representations.filter((rep) => matchesCaptureRepresentation(rep, componentKey, componentSetKey));
    if (matches.length > 1) throw new Error("\u041A\u043B\u044E\u0447 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430 \u0441\u0432\u044F\u0437\u0430\u043D \u0441 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u043C\u0438 Figma-\u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F\u043C\u0438 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430. \u0423\u0442\u043E\u0447\u043D\u0438\u0442\u0435 representations; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430.");
    if (!matches.length) throw new Error("\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440 \u043D\u0435 \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0441\u044F \u043A Figma-\u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F\u043C \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440 \u044D\u0442\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u0438\u043B\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0435\u0433\u043E \u043F\u0430\u043A\u0435\u0442.");
    if (!((_a = matches[0].platform) == null ? void 0 : _a.trim())) throw new Error("\u0414\u043B\u044F \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u043E\u0433\u043E Figma-\u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430. \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430.");
    return matches[0];
  }

  // ../Apollo/packages/component-contract-core/src/instance-correspondence.ts
  var record = (value) => value && typeof value === "object" ? value : {};
  var leaf = (path) => path.split(" / ").slice(-1)[0];
  function compareInstanceCorrespondence(snapshot, reference, nestedVariants) {
    var _a, _b, _c, _d, _e;
    const parents = /* @__PURE__ */ new Map();
    const parentPath2 = (path) => {
      if (!parents.has(path)) parents.set(path, path.split(" / ").slice(0, -1).join(" / "));
      return parents.get(path);
    };
    const paths = snapshotPaths(snapshot), boundaries = [];
    const referencePaths = {};
    const invalid = () => ({ complete: false, boundaries, referencePaths });
    if (!paths || !reference.complete || !((_a = snapshot.source) == null ? void 0 : _a.componentKey) || reference.componentKey !== snapshot.source.componentKey || reference.componentSetKey !== (snapshot.source.componentSetKey || "")) return invalid();
    const actual = new Map(snapshot.nodes.map((n) => [paths.get(String(n.id)), n]));
    const expected = new Map(reference.nodes.map((n) => [n.path, n]));
    if (expected.size !== reference.nodes.length || ((_b = expected.get("")) == null ? void 0 : _b.type) !== "ROOT") return invalid();
    for (const n of reference.nodes) if (n.path && !expected.has(parentPath2(n.path))) return invalid();
    const actualChildren = /* @__PURE__ */ new Map();
    const referenceChildren = /* @__PURE__ */ new Map();
    for (const entry of actual) if (entry[0]) {
      const parent = parentPath2(entry[0]);
      if (!actualChildren.has(parent)) actualChildren.set(parent, []);
      actualChildren.get(parent).push(entry);
    }
    for (const node of reference.nodes) if (node.path) {
      const parent = parentPath2(node.path);
      if (!referenceChildren.has(parent)) referenceChildren.set(parent, []);
      referenceChildren.get(parent).push(node);
    }
    const aIdentity = (n) => record(record(n.component).identity);
    const rIdentity = (path) => {
      var _a2;
      return (_a2 = reference.nodeProperties[path]) == null ? void 0 : _a2.identity;
    };
    const unknown2 = (n, fact) => (n.unknownFacts || []).some((p) => p === fact || fact.startsWith(p + "."));
    const knownIdentity = (n) => Boolean(typeof aIdentity(n).componentKey === "string" && aIdentity(n).componentKey && !unknown2(n, "component.identity.componentKey") && !unknown2(n, "component.identity.componentSetKey"));
    const compatible = (n, path) => {
      const a = aIdentity(n), b = rIdentity(path);
      if (!knownIdentity(n) || !(b == null ? void 0 : b.componentKey)) return false;
      if (a.componentSetKey || b.componentSetKey) return Boolean(a.componentSetKey && a.componentSetKey === b.componentSetKey);
      return a.componentKey === b.componentKey;
    };
    const ownerPaths = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
    const ownerFor = (path, nodes) => {
      var _a2;
      const owners = ownerPaths[nodes === actual ? 0 : 1];
      if (owners.has(path)) return owners.get(path);
      let p = parentPath2(path);
      while (p && ((_a2 = nodes.get(p)) == null ? void 0 : _a2.type) !== "INSTANCE") p = parentPath2(p);
      owners.set(path, p);
      return p;
    };
    const actualPort = (path) => {
      var _a2;
      const node = actual.get(path), c = record(node.component), property = record(c.propertyReferenceBindings).mainComponent;
      if (property === void 0) return void 0;
      const ownerPath = ownerFor(path, actual), ownerNode = actual.get(ownerPath), owner = record(ownerNode == null ? void 0 : ownerNode.component);
      if (typeof property !== "string" || !knownIdentity(node) || typeof ((_a2 = c.identity) == null ? void 0 : _a2.mainComponentId) !== "string" || record(owner.propertyTypes)[property] !== "INSTANCE_SWAP" || record(owner.properties)[property] !== c.identity.mainComponentId || unknown2(node, "component.propertyReferenceBindings.mainComponent") || unknown2(ownerNode, "component.properties." + property) || unknown2(ownerNode, "component.propertyTypes." + property)) return null;
      return { ownerPath, property };
    };
    const referencePort = (path) => {
      var _a2, _b2;
      const c = reference.nodeProperties[path], property = (_a2 = c == null ? void 0 : c.propertyReferenceBindings) == null ? void 0 : _a2.mainComponent;
      if (property === void 0) return void 0;
      const ownerPath = ownerFor(path, expected), owner = reference.nodeProperties[ownerPath];
      if (!property || !((_b2 = c.identity) == null ? void 0 : _b2.mainComponentId) || (owner == null ? void 0 : owner.propertyTypes[property]) !== "INSTANCE_SWAP" || owner.properties[property] !== c.identity.mainComponentId) return null;
      return { ownerPath, property };
    };
    const readSourcePort = (path, referenceSide) => {
      var _a2, _b2, _c2, _d2;
      if (((_a2 = snapshot.source) == null ? void 0 : _a2.instanceSourceIdentityVersion) !== 1) return void 0;
      const type = (_b2 = (referenceSide ? expected : actual).get(path)) == null ? void 0 : _b2.type;
      if (type !== "INSTANCE" && (((_c2 = snapshot.source) == null ? void 0 : _c2.occurrenceAddressVersion) !== 1 || reference.occurrenceAddressVersion !== 1)) return void 0;
      const node = actual.get(path), c = referenceSide ? reference.nodeProperties[path] : record(node == null ? void 0 : node.component);
      const source = c == null ? void 0 : c.sourceIdentity;
      if (source === void 0) return void 0;
      const ownerPath = ownerFor(path, referenceSide ? expected : actual);
      const ownerNode = actual.get(ownerPath);
      const owner = referenceSide ? (_d2 = reference.nodeProperties[ownerPath]) == null ? void 0 : _d2.identity : ownerNode && aIdentity(ownerNode);
      if (!source || source.version !== 1 || typeof source.sourceNodeId !== "string" || !source.sourceNodeId || typeof source.ownerComponentKey !== "string" || typeof source.ownerMainComponentId !== "string" || typeof (owner == null ? void 0 : owner.componentKey) !== "string" || !owner.componentKey || typeof owner.mainComponentId !== "string" || !owner.mainComponentId || source.ownerComponentKey !== owner.componentKey || source.ownerMainComponentId !== owner.mainComponentId || !referenceSide && (!node || type === "INSTANCE" && !knownIdentity(node) || !ownerNode || !knownIdentity(ownerNode) || ["version", "sourceNodeId", "ownerComponentKey", "ownerMainComponentId"].some((field) => unknown2(node, "component.sourceIdentity." + field)) || unknown2(ownerNode, "component.identity.mainComponentId"))) return null;
      return {
        ownerPath,
        sourceNodeId: source.sourceNodeId,
        ownerMainComponentId: source.ownerMainComponentId,
        ownerComponentKey: owner.componentKey,
        ownerComponentSetKey: owner.componentSetKey || ""
      };
    };
    const sourcePorts = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
    const sourcePort = (path, referenceSide) => {
      const ports = sourcePorts[referenceSide ? 1 : 0];
      if (!ports.has(path)) ports.set(path, readSourcePort(path, referenceSide));
      return ports.get(path);
    };
    const sameSourceOwner = (a, b) => {
      var _a2;
      return a.ownerMainComponentId === b.ownerMainComponentId || ((_a2 = snapshot.source) == null ? void 0 : _a2.instanceMainComponentAliasesVersion) === 1 && a.ownerComponentKey === b.ownerComponentKey && a.ownerComponentSetKey === b.ownerComponentSetKey;
    };
    const verifiedSlot = (actualPath, referencePath) => {
      var _a2;
      const node = actual.get(actualPath), ref = reference.nodeProperties[referencePath];
      const property = record(record(node == null ? void 0 : node.component).propertyReferenceBindings).slotContentId;
      if (!node || node.type !== "SLOT" || typeof property !== "string" || !property || ((_a2 = ref == null ? void 0 : ref.propertyReferenceBindings) == null ? void 0 : _a2.slotContentId) !== property || unknown2(node, "component.propertyReferenceBindings.slotContentId")) return false;
      const actualOwnerPath = ownerFor(actualPath, actual);
      const expectedOwnerPath = ownerFor(referencePath, expected);
      const actualOwner = actual.get(actualOwnerPath);
      const expectedOwner = reference.nodeProperties[expectedOwnerPath];
      if (!actualOwner || referencePaths[actualOwnerPath] !== expectedOwnerPath || record(record(actualOwner.component).propertyTypes)[property] !== "SLOT" || (expectedOwner == null ? void 0 : expectedOwner.propertyTypes[property]) !== "SLOT" || unknown2(actualOwner, `component.propertyTypes.${property}`)) return false;
      const actualConsumers = [...actual].filter(([p, n]) => n.type === "SLOT" && ownerFor(p, actual) === actualOwnerPath && record(record(n.component).propertyReferenceBindings).slotContentId === property);
      const expectedConsumers = reference.nodes.filter((n) => {
        var _a3, _b2;
        return n.type === "SLOT" && ownerFor(n.path, expected) === expectedOwnerPath && ((_b2 = (_a3 = reference.nodeProperties[n.path]) == null ? void 0 : _a3.propertyReferenceBindings) == null ? void 0 : _b2.slotContentId) === property;
      });
      return actualConsumers.length === 1 && expectedConsumers.length === 1;
    };
    const visibilityPort = (path, referenceSide) => {
      var _a2, _b2, _c2, _d2, _e2;
      if (((_a2 = snapshot.source) == null ? void 0 : _a2.propertyReferenceIdentityVersion) !== 1) return void 0;
      const node = actual.get(path), c = referenceSide ? reference.nodeProperties[path] : record(node == null ? void 0 : node.component);
      const property = (_b2 = c == null ? void 0 : c.propertyReferenceBindings) == null ? void 0 : _b2.visible;
      if (property === void 0) return void 0;
      const ownerPath = ownerFor(path, referenceSide ? expected : actual);
      const owner = referenceSide ? reference.nodeProperties[ownerPath] : record((_c2 = actual.get(ownerPath)) == null ? void 0 : _c2.component);
      if (typeof property !== "string" || ((_d2 = owner == null ? void 0 : owner.propertyTypes) == null ? void 0 : _d2[property]) !== "BOOLEAN" || typeof ((_e2 = owner.properties) == null ? void 0 : _e2[property]) !== "boolean" || !referenceSide && (!node || !knownIdentity(node) || unknown2(node, "component.propertyReferenceBindings.visible") || unknown2(actual.get(ownerPath), `component.propertyTypes.${property}`) || unknown2(actual.get(ownerPath), `component.properties.${property}`))) return null;
      return { ownerPath, property };
    };
    referencePaths[""] = "";
    const root = actual.get(""), rootIdentity = root && aIdentity(root);
    if (!root || !knownIdentity(root) || (rootIdentity == null ? void 0 : rootIdentity.componentKey) !== reference.componentKey || (rootIdentity.componentSetKey || "") !== reference.componentSetKey) {
      if (reference.occurrenceAddressVersion === 1) delete referencePaths[""];
      return invalid();
    }
    const visit = (actualParent, expectedParent) => {
      const children = actualChildren.get(actualParent) || [];
      const refChildren = referenceChildren.get(expectedParent) || [];
      if (children.length !== refChildren.length) return false;
      const claimed = /* @__PURE__ */ new Set();
      for (const [path, node] of children) {
        let candidates = refChildren.filter((n) => n.type === node.type && leaf(n.path) === leaf(path));
        const port = node.type === "INSTANCE" ? actualPort(path) : void 0;
        const visiblePort = node.type === "INSTANCE" && !port ? visibilityPort(path, false) : void 0;
        const source = sourcePort(path, false);
        let sourceCandidate;
        let uniqueVisibilityPort = false;
        if (port === null || visiblePort === null || source === null) return false;
        if (source) {
          const owner = referencePaths[source.ownerPath];
          const consumers = [...actual].filter(([p, n]) => {
            const other = sourcePort(p, false);
            return (other == null ? void 0 : other.ownerPath) === source.ownerPath && other.sourceNodeId === source.sourceNodeId;
          });
          const matches = reference.nodes.filter((n) => {
            if (n.type !== node.type) return false;
            const other = sourcePort(n.path, true);
            return (other == null ? void 0 : other.ownerPath) === owner && other.sourceNodeId === source.sourceNodeId && sameSourceOwner(source, other);
          });
          if (owner === void 0 || consumers.length !== 1 || matches.length !== 1 || parentPath2(matches[0].path) !== expectedParent) return false;
          sourceCandidate = matches[0];
        }
        if (node.type === "INSTANCE") {
          const typed = refChildren.filter((n) => n.type === "INSTANCE");
          if (port) {
            const owner = referencePaths[port.ownerPath];
            const consumers = [...actual].filter(([p, n]) => {
              if (n.type !== "INSTANCE") return false;
              const other = actualPort(p);
              return (other == null ? void 0 : other.ownerPath) === port.ownerPath && other.property === port.property;
            });
            const refConsumers = reference.nodes.filter((n) => {
              if (n.type !== "INSTANCE") return false;
              const other = referencePort(n.path);
              return (other == null ? void 0 : other.ownerPath) === owner && other.property === port.property;
            });
            if (owner === void 0 || consumers.length !== 1 || refConsumers.length !== 1 || parentPath2(refConsumers[0].path) !== expectedParent) return false;
            candidates = refConsumers;
          } else if (visiblePort) {
            const owner = referencePaths[visiblePort.ownerPath];
            const consumers = [...actual].filter(([p, n]) => n.type === "INSTANCE" && (() => {
              const other = visibilityPort(p, false);
              return (other == null ? void 0 : other.ownerPath) === visiblePort.ownerPath && other.property === visiblePort.property;
            })());
            const matches = typed.filter((n) => {
              const other = visibilityPort(n.path, true);
              return (other == null ? void 0 : other.ownerPath) === owner && other.property === visiblePort.property;
            });
            if (owner !== void 0 && consumers.length === 1 && matches.length === 1) {
              candidates = matches;
              uniqueVisibilityPort = true;
            } else if (sourceCandidate) candidates = [sourceCandidate];
            else {
              const identities = typed.filter((n) => compatible(node, n.path));
              if (identities.length !== 1 || children.filter(([, n]) => n.type === "INSTANCE" && compatible(n, identities[0].path)).length !== 1) return false;
              candidates = identities;
            }
          } else if (sourceCandidate) {
            candidates = [sourceCandidate];
          } else {
            const identities = typed.filter((n) => compatible(node, n.path));
            if (identities.length) {
              if (identities.length !== 1 || children.filter(([, n]) => n.type === "INSTANCE" && compatible(n, identities[0].path)).length !== 1) return false;
              candidates = identities;
            }
          }
        } else if (sourceCandidate) candidates = [sourceCandidate];
        if (candidates.length !== 1 || claimed.has(candidates[0].path)) return false;
        if (source && candidates[0].path !== (sourceCandidate == null ? void 0 : sourceCandidate.path)) return false;
        if (reference.occurrenceAddressVersion === 1 && /^@(source|local):/.test(leaf(candidates[0].path)) && !sourceCandidate && !port && !uniqueVisibilityPort) return false;
        const refPath = candidates[0].path;
        claimed.add(refPath);
        referencePaths[path] = refPath;
        if (node.type === "SLOT" && verifiedSlot(path, refPath)) continue;
        if (node.type === "INSTANCE") {
          const identity = aIdentity(node), other = rIdentity(refPath), refPort = referencePort(refPath);
          if (refPort === null || sourcePort(refPath, true) === null || Boolean(port) !== Boolean(refPort)) return false;
          const keysKnown = knownIdentity(node) && Boolean(other == null ? void 0 : other.componentKey);
          const sameSet = Boolean(identity.componentSetKey && identity.componentSetKey === (other == null ? void 0 : other.componentSetKey));
          const sameIdentity = keysKnown && identity.componentKey === other.componentKey && (identity.componentSetKey || "") === ((other == null ? void 0 : other.componentSetKey) || "");
          if (!sameIdentity) {
            const variant = nestedVariants && keysKnown && !port && sameSet;
            boundaries.push({
              nodeId: String(node.id),
              actualPath: path,
              referencePath: refPath,
              reason: !keysKnown ? "instance-identity-unavailable" : port ? "instance-swap" : variant ? "component-variant-changed" : "component-identity-changed",
              ...identity.componentKey ? { actualComponentKey: identity.componentKey } : {},
              ...(other == null ? void 0 : other.componentKey) ? { referenceComponentKey: other.componentKey } : {},
              ...variant ? { componentSetKey: identity.componentSetKey } : {},
              ...port ? { ownerPath: referencePaths[port.ownerPath], property: port.property } : {}
            });
            continue;
          }
        }
        if (!visit(path, refPath)) return false;
      }
      return claimed.size === refChildren.length;
    };
    const complete = visit("", "");
    if (!complete && ((_c = snapshot.source) == null ? void 0 : _c.occurrenceAddressVersion) === 1 && reference.occurrenceAddressVersion === 1) {
      const claimed = new Set(Object.values(referencePaths));
      const nodes = [...actual].filter(([p]) => p).sort(([a], [b]) => a.split(" / ").length - b.split(" / ").length);
      for (const [path, node] of nodes) {
        if (referencePaths[path] !== void 0 || actualPort(path) !== void 0 || visibilityPort(path, false) === null) continue;
        const source = sourcePort(path, false), parent = referencePaths[parentPath2(path)];
        if (!source || parent === void 0) continue;
        const owner = referencePaths[source.ownerPath], ownerIdentity = aIdentity(actual.get(source.ownerPath)), expectedOwner = owner !== void 0 ? rIdentity(owner) : void 0;
        if (owner === void 0 || !expectedOwner || ownerIdentity.componentKey !== expectedOwner.componentKey || ((_d = snapshot.source) == null ? void 0 : _d.instanceMainComponentAliasesVersion) === 1 && (ownerIdentity.componentSetKey || "") !== (expectedOwner.componentSetKey || "") || ownerIdentity.mainComponentId !== expectedOwner.mainComponentId && ((_e = snapshot.source) == null ? void 0 : _e.instanceMainComponentAliasesVersion) !== 1) continue;
        const consumers = nodes.filter(([p]) => {
          const s = sourcePort(p, false);
          return (s == null ? void 0 : s.ownerPath) === source.ownerPath && s.sourceNodeId === source.sourceNodeId;
        });
        const candidates = reference.nodes.filter((n) => n.type === node.type && parentPath2(n.path) === parent && (() => {
          const s = sourcePort(n.path, true);
          return (s == null ? void 0 : s.ownerPath) === owner && s.sourceNodeId === source.sourceNodeId && sameSourceOwner(source, s);
        })());
        if (consumers.length !== 1 || candidates.length !== 1 || claimed.has(candidates[0].path) || referencePort(candidates[0].path) !== void 0 || visibilityPort(candidates[0].path, true) === null) continue;
        const refPath = candidates[0].path, a = aIdentity(node), b = rIdentity(refPath);
        if (node.type === "INSTANCE") {
          if (!knownIdentity(node) || !(b == null ? void 0 : b.componentKey)) continue;
          const same = a.componentKey === b.componentKey && (a.componentSetKey || "") === (b.componentSetKey || "");
          if (!same) {
            if (!nestedVariants || !a.componentSetKey || a.componentSetKey !== b.componentSetKey) continue;
            boundaries.push({ nodeId: String(node.id), actualPath: path, referencePath: refPath, reason: "component-variant-changed", actualComponentKey: a.componentKey, referenceComponentKey: b.componentKey, componentSetKey: a.componentSetKey });
          }
        }
        referencePaths[path] = refPath;
        claimed.add(refPath);
      }
    }
    return { complete, boundaries, referencePaths };
  }

  // ../Apollo/packages/component-contract-core/src/instance-boundaries.ts
  var record2 = (value) => value && typeof value === "object" ? value : {};
  var parentPath = (path) => path.split(" / ").slice(0, -1).join(" / ");
  var withinBoundary = (path, boundary) => path === boundary || path.startsWith(`${boundary} / `);
  var correspondingPath = (comparison, actualPath) => (comparison == null ? void 0 : comparison.referencePaths) ? comparison.referencePaths[actualPath] : actualPath;
  function compareInstanceBoundaries(snapshot, reference, nestedVariants = ["apollo.instance-content-references.v2", "apollo.instance-content-references.v3", "apollo.instance-content-references.v4"].includes(((_a) => (_a = snapshot.instanceContentReferences) == null ? void 0 : _a.schemaVersion)() || "")) {
    var _a2, _b, _c, _d;
    if (!reference.nodeProperties || typeof reference.nodeProperties !== "object" || Array.isArray(reference.nodeProperties)) {
      return { complete: false, boundaries: [], referencePaths: {} };
    }
    if (((_a2 = snapshot.source) == null ? void 0 : _a2.instanceIdentityVersion) === 1) return compareInstanceCorrespondence(snapshot, reference, nestedVariants);
    const paths = snapshotPaths(snapshot), shape = snapshotShape(snapshot);
    const boundaries = [];
    const invalid = () => ({ complete: false, boundaries });
    if (!paths || !shape || !reference.complete) return invalid();
    if (!((_b = snapshot.source) == null ? void 0 : _b.componentKey) || reference.componentKey !== snapshot.source.componentKey || reference.componentSetKey !== (snapshot.source.componentSetKey || "")) return invalid();
    const actualByPath = new Map(snapshot.nodes.map((n) => [paths.get(String(n.id)), n]));
    const refByPath = new Map(reference.nodes.map((n) => [n.path, n]));
    if (refByPath.size !== reference.nodes.length) return invalid();
    const ownerFor = (path, nodes) => {
      var _a3;
      let parent = parentPath(path);
      while (parent) {
        if (((_a3 = nodes.get(parent)) == null ? void 0 : _a3.type) === "INSTANCE") return parent;
        parent = parentPath(parent);
      }
      return "";
    };
    const actualPort = (path) => {
      var _a3;
      const node = actualByPath.get(path), component = record2(node == null ? void 0 : node.component);
      const property = record2(component.propertyReferenceBindings).mainComponent;
      const ownerPath = ownerFor(path, actualByPath), owner = record2((_a3 = actualByPath.get(ownerPath)) == null ? void 0 : _a3.component);
      if (typeof property !== "string" || record2(owner.propertyTypes)[property] !== "INSTANCE_SWAP" || typeof record2(component.identity).mainComponentId !== "string" || record2(owner.properties)[property] !== record2(component.identity).mainComponentId) return void 0;
      return { ownerPath, property };
    };
    const referencePort = (path) => {
      var _a3, _b2;
      const data = reference.nodeProperties[path], property = (_a3 = data == null ? void 0 : data.propertyReferenceBindings) == null ? void 0 : _a3.mainComponent;
      const ownerPath = ownerFor(path, refByPath), owner = reference.nodeProperties[ownerPath];
      if (!property || (owner == null ? void 0 : owner.propertyTypes[property]) !== "INSTANCE_SWAP" || !((_b2 = data == null ? void 0 : data.identity) == null ? void 0 : _b2.mainComponentId) || owner.properties[property] !== data.identity.mainComponentId) return void 0;
      return { ownerPath, property };
    };
    const instances = [...actualByPath].filter(([path, n]) => path && n.type === "INSTANCE").sort(([a], [b]) => a.split(" / ").length - b.split(" / ").length);
    for (const [path, node] of instances) {
      if (boundaries.some((b) => withinBoundary(path, b.actualPath))) continue;
      const identity = record2(record2(node.component).identity), port = actualPort(path);
      let refPath = ((_c = refByPath.get(path)) == null ? void 0 : _c.type) === "INSTANCE" ? path : void 0;
      if (port) {
        const consumers = instances.filter(([p]) => {
          const other = actualPort(p);
          return (other == null ? void 0 : other.ownerPath) === port.ownerPath && other.property === port.property;
        });
        const candidates = reference.nodes.filter((n) => {
          if (n.type !== "INSTANCE") return false;
          const other = referencePort(n.path);
          return (other == null ? void 0 : other.ownerPath) === port.ownerPath && other.property === port.property;
        });
        if (consumers.length !== 1 || candidates.length !== 1 || parentPath(candidates[0].path) !== parentPath(path)) return invalid();
        refPath = candidates[0].path;
      }
      if (refPath === void 0) return invalid();
      const expected = (_d = reference.nodeProperties[refPath]) == null ? void 0 : _d.identity;
      const keysKnown = typeof identity.componentKey === "string" && Boolean(identity.componentKey) && Boolean(expected == null ? void 0 : expected.componentKey);
      if (keysKnown && identity.componentKey === expected.componentKey && path === refPath) continue;
      const sameSet = nestedVariants && keysKnown && !port && path === refPath && typeof identity.componentSetKey === "string" && Boolean(identity.componentSetKey) && identity.componentSetKey === (expected == null ? void 0 : expected.componentSetKey);
      boundaries.push({
        nodeId: String(node.id),
        actualPath: path,
        referencePath: refPath,
        reason: !keysKnown ? "instance-identity-unavailable" : port ? "instance-swap" : sameSet ? "component-variant-changed" : "component-identity-changed",
        ...sameSet ? { componentSetKey: identity.componentSetKey } : {},
        ...identity.componentKey ? { actualComponentKey: identity.componentKey } : {},
        ...(expected == null ? void 0 : expected.componentKey) ? { referenceComponentKey: expected.componentKey } : {},
        ...port || {}
      });
    }
    const prune = (nodes, actual) => nodes.flatMap((n) => {
      const boundary = boundaries.find((b) => withinBoundary(n.path, actual ? b.actualPath : b.referencePath));
      if (!boundary) return [n];
      if (n.path !== (actual ? boundary.actualPath : boundary.referencePath)) return [];
      return [{ path: boundary.referencePath, type: "INSTANCE" }];
    }).sort((a, b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
    return { complete: stableHash(prune(shape, true)) === stableHash(prune(reference.nodes, false)), boundaries };
  }

  // ../Apollo/packages/component-contract-core/src/variant-facts.ts
  var record3 = (x) => x && typeof x === "object" && !Array.isArray(x) ? x : {};
  var relativeTargetPath = (path) => path.split(" / ").slice(1).join(" / ");
  var propertyAvailabilityKey = (name) => `p_${stableHash(name).slice(0, 16)}`;
  function captureVariantReference(snapshot, componentKey, componentSetKey, definedProperties) {
    var _a, _b, _c, _d, _e;
    const shape = snapshotShape(snapshot);
    const paths = snapshotPaths(snapshot);
    const root = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
    const component = record3(root == null ? void 0 : root.component);
    const referencesKnown = snapshot.nodes.every((n) => Array.isArray(record3(n.component).propertyReferences));
    const byId = new Map(snapshot.nodes.map((n) => [String(n.id), n]));
    const consumers = /* @__PURE__ */ new Map();
    for (const node of snapshot.nodes) {
      let parent = byId.get(String(node.parentId));
      const visited = /* @__PURE__ */ new Set();
      while (parent && !visited.has(String(parent.id))) {
        visited.add(String(parent.id));
        if (parent.type === "INSTANCE") {
          const names = consumers.get(String(parent.id)) || /* @__PURE__ */ new Set();
          (record3(node.component).propertyReferences || []).forEach((name) => names.add(name));
          consumers.set(String(parent.id), names);
          break;
        }
        parent = byId.get(String(parent.parentId));
      }
    }
    const nodeProperties = {};
    for (const node of snapshot.nodes) {
      const component2 = record3(node.component);
      const path = (_a = paths == null ? void 0 : paths.get(String(node.id))) != null ? _a : node === root ? "" : relativeTargetPath(String(record3(node.semantic).path || ""));
      nodeProperties[path] = {
        properties: component2.properties || {},
        propertyTypes: component2.propertyTypes || {},
        propertyReferences: [...consumers.get(String(node.id)) || []],
        ...((_b = snapshot.source) == null ? void 0 : _b.occurrenceAddressVersion) === 1 ? { diagnosticName: String(node.name) } : {},
        ...((_c = component2.identity) == null ? void 0 : _c.componentKey) ? { identity: component2.identity } : {},
        ...component2.propertyReferenceBindings ? { propertyReferenceBindings: component2.propertyReferenceBindings } : {},
        ...node === root && definedProperties ? { definedProperties } : {}
      };
      if (((_d = snapshot.source) == null ? void 0 : _d.instanceSourceIdentityVersion) === 1 && component2.sourceIdentity) nodeProperties[path].sourceIdentity = component2.sourceIdentity;
    }
    return {
      componentKey,
      componentSetKey,
      complete: Boolean(shape && referencesKnown),
      nodes: shape || [],
      ...((_e = snapshot.source) == null ? void 0 : _e.occurrenceAddressVersion) === 1 ? { occurrenceAddressVersion: 1 } : {},
      properties: component.properties || {},
      propertyTypes: component.propertyTypes || {},
      propertyReferences: [...consumers.get(String(root == null ? void 0 : root.id)) || []],
      nodeProperties,
      ...definedProperties ? { definedProperties } : {}
    };
  }

  // ../Apollo/packages/component-contract-core/src/instance-validation.ts
  var EFFECTIVE_FACT_KEYS = [
    "layout",
    "appearance",
    "variable",
    "component",
    "text",
    "visible"
  ];
  function record4(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }
  function semanticRole(node) {
    const semantic = record4(node.semantic);
    return typeof semantic.role === "string" ? semantic.role : "";
  }
  function intrinsicBounds(value) {
    const bounds = record4(value), result = {};
    for (const key of ["width", "height"]) {
      const size = bounds[key];
      if (typeof size === "number" && Number.isFinite(size) && size >= 0) result[key] = size;
    }
    return result;
  }
  function effectiveFacts(node, includeDimensions = false) {
    const result = {};
    EFFECTIVE_FACT_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(node, key)) result[key] = node[key];
    });
    if (includeDimensions) {
      const bounds = intrinsicBounds(node.bounds);
      if (Object.keys(bounds).length) result.bounds = bounds;
      if (node.propertyActivityV1) result.propertyActivityV1 = node.propertyActivityV1;
    }
    return result;
  }
  function cloneSnapshot(snapshot) {
    return JSON.parse(JSON.stringify(snapshot));
  }
  function materializeEffectiveBaseline(actual, reference, strictInstanceBoundaries = true) {
    var _a, _b;
    const result = cloneSnapshot(actual);
    if (strictInstanceBoundaries) {
      const actualPaths = snapshotPaths(actual), referencePaths = snapshotPaths(reference);
      const ref = captureVariantReference(reference, ((_a = reference.source) == null ? void 0 : _a.componentKey) || "", ((_b = reference.source) == null ? void 0 : _b.componentSetKey) || "");
      const comparison = compareInstanceBoundaries(actual, ref);
      const byPath2 = new Map(reference.nodes.map((node) => [referencePaths == null ? void 0 : referencePaths.get(String(node.id)), node]));
      const unmatchedNodeIds2 = [];
      let matchedNodes2 = 0;
      result.nodes = result.nodes.map((node) => {
        const path = actualPaths == null ? void 0 : actualPaths.get(String(node.id));
        const isolated = path !== void 0 && comparison.boundaries.find((b) => withinBoundary(path, b.actualPath));
        const referencePath = path !== void 0 ? correspondingPath(comparison, path) : void 0;
        const expected = referencePath !== void 0 && comparison.complete && !isolated ? byPath2.get(referencePath) : void 0;
        if (!expected || expected.type !== node.type) {
          unmatchedNodeIds2.push(String(node.id));
          return { ...node, baseline: { effective: {} }, baselineProvenance: { status: "unresolved", reason: isolated ? isolated.reason : "structural-identity-unresolved" } };
        }
        matchedNodes2++;
        return { ...node, baseline: { effective: effectiveFacts(expected, true) }, baselineProvenance: { status: "matched", referencePath } };
      });
      return { snapshot: result, matchedNodes: matchedNodes2, unmatchedNodeIds: unmatchedNodeIds2 };
    }
    const referenceByRole = /* @__PURE__ */ new Map();
    reference.nodes.forEach((candidate) => {
      const node = record4(candidate);
      const role = semanticRole(node);
      if (role && !referenceByRole.has(role)) referenceByRole.set(role, node);
    });
    let matchedNodes = 0;
    const unmatchedNodeIds = [];
    result.nodes = result.nodes.map((candidate, index) => {
      const node = record4(candidate);
      const role = semanticRole(node);
      const referenceNode = referenceByRole.get(role) || (index === 0 ? record4(reference.nodes[0]) : void 0);
      if (!referenceNode || referenceNode.type !== node.type) {
        unmatchedNodeIds.push(String(node.id || `node:${index}`));
        return { ...node, baseline: { effective: {} } };
      }
      matchedNodes += 1;
      return {
        ...node,
        baseline: { effective: effectiveFacts(referenceNode, true) }
      };
    });
    return { snapshot: result, matchedNodes, unmatchedNodeIds };
  }
  function matchesComponentIdentity(mainComponentKey2, componentSetKey, acceptedKeys) {
    const accepted = new Set(acceptedKeys.filter(Boolean));
    return accepted.has(mainComponentKey2) || Boolean(componentSetKey && accepted.has(componentSetKey));
  }

  // ../Apollo/packages/component-contract-core/src/capture-facts.ts
  function captureSupplementalFacts(node, mixed) {
    const text = {};
    const parent = {};
    const unknownFacts = [];
    const read = (source, key, output, fact) => {
      let value;
      try {
        value = source[key];
      } catch {
        value = void 0;
      }
      if (value === mixed || value === void 0 || typeof value === "number" && !Number.isFinite(value)) unknownFacts.push(fact);
      else if (value === null || ["string", "boolean", "number"].includes(typeof value)) output[key] = value;
      else unknownFacts.push(fact);
    };
    if (node.type === "TEXT") {
      for (const key of ["textAutoResize", "textAlignHorizontal", "textAlignVertical", "textTruncation", "maxLines", "paragraphSpacing", "maxHeight"]) read(node, key, text, `text.${key}`);
    }
    const sourceParent = node.parent;
    if (sourceParent && !["PAGE", "DOCUMENT"].includes(String(sourceParent.type))) {
      const layout = {};
      read(sourceParent, "layoutMode", layout, "parent.layout.mode");
      if ("layoutMode" in layout) {
        layout.mode = layout.layoutMode;
        delete layout.layoutMode;
      }
      parent.layout = layout;
      read(sourceParent, "clipsContent", parent, "parent.clipsContent");
    } else if (sourceParent && ["PAGE", "DOCUMENT"].includes(String(sourceParent.type))) {
      parent.layout = { mode: "NONE" };
    } else unknownFacts.push("parent");
    return { text, parent, unknownFacts };
  }

  // ../Apollo/packages/component-contract-core/src/capture-topology.ts
  function captureSceneTopology(root, limit = 500, omitChildren) {
    const entries = [], issues = [];
    const seenIds = /* @__PURE__ */ new Map(), seenObjects = /* @__PURE__ */ new Set();
    let limitReached = false;
    const visit = (node, parentIndex, ancestors) => {
      let id, name, type;
      try {
        id = node.id;
        name = node.name;
        type = node.type;
      } catch {
        issues.push({ kind: "unreadable-node", path: parentIndex === null ? "" : entries[parentIndex].path });
        return;
      }
      const path = parentIndex === null ? name : `${entries[parentIndex].path} / ${name}`;
      if (!id || typeof id !== "string" || typeof name !== "string" || !type) {
        issues.push({ kind: "unreadable-node", path });
        return;
      }
      const previous = seenIds.get(id);
      if (previous || seenObjects.has(node)) {
        const kind = previous && previous.type !== type ? "identity-conflict" : ancestors.has(id) ? "cycle" : "duplicate-id";
        if (issues.length < 20) issues.push({ kind, nodeId: id, path });
        return;
      }
      if (entries.length >= limit) {
        limitReached = true;
        return;
      }
      const entry = { node, figmaNodeId: id, name, type, parentIndex, childIndexes: [], depth: parentIndex === null ? 0 : entries[parentIndex].depth + 1, path };
      const index = entries.length;
      entries.push(entry);
      seenIds.set(id, entry);
      seenObjects.add(node);
      if (omitChildren == null ? void 0 : omitChildren(entry, index, entries)) return index;
      let children;
      try {
        children = "children" in node ? Array.from(node.children || []) : [];
      } catch {
        issues.push({ kind: "unreadable-node", nodeId: id, path });
        return index;
      }
      entry.observedChildren = children;
      const next = new Set(ancestors);
      next.add(id);
      for (const child of children) {
        const childIndex = visit(child, index, next);
        if (childIndex !== void 0) entry.childIndexes.push(childIndex);
      }
      return index;
    };
    visit(root, null, /* @__PURE__ */ new Set());
    return { entries, issues, limitReached, complete: !limitReached && !issues.length };
  }

  // ../Apollo/packages/component-contract-core/src/instance-source-identity.ts
  function captureInstanceSourceIdentities(entries, mains, pristineSources = /* @__PURE__ */ new Map(), includeOwnedLayers = false) {
    var _a;
    const result = /* @__PURE__ */ new Map();
    const sources = /* @__PURE__ */ new Map();
    const sourceIndexes = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      if (!includeOwnedLayers && entry.type !== "INSTANCE" || entry.parentIndex === null) continue;
      let ownerIndex = entry.parentIndex;
      while (ownerIndex !== null && entries[ownerIndex].type !== "INSTANCE") ownerIndex = entries[ownerIndex].parentIndex;
      if (ownerIndex === null) continue;
      const owner = entries[ownerIndex], main = mains.get(owner.figmaNodeId);
      if (!main || main.type !== "COMPONENT" || !main.key || !main.id) continue;
      try {
        let source;
        if (main.remote) {
          const pristine = pristineSources.get(main.id), root = pristine == null ? void 0 : pristine.topology.entries[0];
          if (!(pristine == null ? void 0 : pristine.topology.complete) || !root || root.type !== "INSTANCE" || root.parentIndex !== null || pristine.mainComponentId !== main.id || pristine.componentKey !== main.key || root.figmaNodeId === owner.figmaNodeId) continue;
          if (!sources.has(main)) {
            const sourcePrefix = (root.figmaNodeId.startsWith("I") ? root.figmaNodeId : "I" + root.figmaNodeId) + ";";
            const normalized = pristine.topology.entries.map((n, index) => ({
              figmaNodeId: index === 0 ? main.id : n.figmaNodeId.startsWith(sourcePrefix) ? n.figmaNodeId.slice(sourcePrefix.length) : "",
              type: index === 0 ? "COMPONENT" : n.type,
              parentIndex: n.parentIndex
            }));
            if (normalized.some((n) => !n.figmaNodeId) || new Set(normalized.map((n) => n.figmaNodeId)).size !== normalized.length) continue;
            sources.set(main, { entries: normalized, complete: true });
          }
          source = sources.get(main);
        } else {
          if (!sources.has(main)) sources.set(main, captureSceneTopology(
            main,
            500,
            (node, index) => index > 0 && (node.type === "INSTANCE" || node.type === "SLOT")
          ));
          source = sources.get(main);
          if (!source.complete) continue;
        }
        if (!sourceIndexes.has(source)) {
          const index = /* @__PURE__ */ new Map();
          source.entries.forEach((n, i) => {
            const key = JSON.stringify([n.figmaNodeId, n.type, n.parentIndex]);
            if (!index.has(key)) index.set(key, i);
          });
          sourceIndexes.set(source, index);
        }
        const prefix = (owner.figmaNodeId.startsWith("I") ? owner.figmaNodeId : "I" + owner.figmaNodeId) + ";";
        const chain = [];
        let current = entry;
        while (current && current !== owner) {
          chain.unshift(current);
          current = current.parentIndex === null ? void 0 : entries[current.parentIndex];
        }
        if (current !== owner) continue;
        let sourceParentIndex = 0, sourceNodeId = "", valid = true;
        for (const inherited of chain) {
          if (!inherited.figmaNodeId.startsWith(prefix)) {
            valid = false;
            break;
          }
          const id = inherited.figmaNodeId.slice(prefix.length);
          const index = (_a = sourceIndexes.get(source).get(JSON.stringify([id, inherited.type, sourceParentIndex]))) != null ? _a : -1;
          if (!id || index < 1) {
            valid = false;
            break;
          }
          sourceParentIndex = index;
          sourceNodeId = id;
        }
        if (valid) result.set(entry.figmaNodeId, { version: 1, ownerComponentKey: main.key, ownerMainComponentId: main.id, sourceNodeId });
      } catch {
      }
    }
    return result;
  }

  // ../Apollo/packages/component-contract-core/src/native-slot-capture.ts
  function confirmedNativeSlotCaptureBoundaries(plan, reference, representationId, componentKey, componentSetKey) {
    if ((plan == null ? void 0 : plan.version) !== 1 || !reference.complete || reference.componentKey !== componentKey || reference.componentSetKey !== componentSetKey) return [];
    return plan.boundaries.filter((b) => {
      var _a;
      return b.representationId === representationId && ((_a = reference.nodeProperties[""]) == null ? void 0 : _a.propertyTypes[b.property]) === "SLOT" && reference.nodes.filter((n) => {
        var _a2, _b;
        return n.type === "SLOT" && !n.path.includes(" / ") && ((_b = (_a2 = reference.nodeProperties[n.path]) == null ? void 0 : _a2.propertyReferenceBindings) == null ? void 0 : _b.slotContentId) === b.property;
      }).length === 1 && reference.nodes.some((n) => {
        var _a2, _b;
        return n.path === b.path && n.type === "SLOT" && ((_b = (_a2 = reference.nodeProperties[n.path]) == null ? void 0 : _a2.propertyReferenceBindings) == null ? void 0 : _b.slotContentId) === b.property;
      });
    });
  }

  // ../Apollo/packages/component-contract-core/src/variable-mode-facts.ts
  function captureResolvedVariableModes(resolved, collections) {
    const modes = {};
    const modeCatalog = {};
    const unknownFacts = [];
    const byKey = /* @__PURE__ */ new Map();
    for (const collection of collections) {
      if (!/^[a-f0-9]{40}$/i.test(collection.key)) continue;
      byKey.set(collection.key, [...byKey.get(collection.key) || [], collection]);
    }
    for (const [key, candidates] of byKey) {
      const collection = candidates[0];
      if (candidates.length !== 1) {
        unknownFacts.push(`variable.modes.${key}`);
        continue;
      }
      if (typeof collection.name !== "string" || !Array.isArray(collection.modes) || collection.modes.some((mode) => !mode || typeof mode.modeId !== "string" || typeof mode.name !== "string")) {
        unknownFacts.push(`variable.modes.${key}`);
        continue;
      }
      modeCatalog[key] = {
        collectionId: collection.id,
        collectionName: collection.name,
        defaultModeId: collection.defaultModeId,
        modes: collection.modes.map((mode) => ({ modeId: mode.modeId, name: mode.name }))
      };
      const modeId = resolved[collection.id];
      if (typeof modeId === "string" && collection.modes.filter((mode) => mode.modeId === modeId).length === 1) {
        modes[key] = modeId;
      } else {
        unknownFacts.push(`variable.modes.${key}`);
      }
    }
    return { modes, modeCatalog, unknownFacts };
  }

  // ../Apollo/packages/component-contract-core/src/host-context-variable-modes.ts
  var record5 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
  var object = (v) => Boolean(v && typeof v === "object" && !Array.isArray(v));
  var unknown = (n, fact) => (n.unknownFacts || []).some((p) => p === fact || fact.startsWith(p + ".") || p.startsWith(fact + "."));
  function tokenIds(values) {
    const ids = /* @__PURE__ */ new Set();
    let complete = true;
    const add = (id) => {
      if (typeof id === "string" && id.trim()) ids.add(id);
      else complete = false;
    };
    const visit = (v) => {
      if (Array.isArray(v)) {
        v.forEach(visit);
        return;
      }
      if (!v || typeof v !== "object") return;
      for (const [key, value] of Object.entries(v)) {
        if (key === "tokenId" && value !== null) add(value);
        else if (key === "tokenIds") {
          if (Array.isArray(value)) value.forEach(add);
          else complete = false;
        } else if (key === "id" && record5(v).type === "VARIABLE_ALIAS") add(value);
        else visit(value);
      }
      if (record5(v).type === "VARIABLE_ALIAS" && !Object.prototype.hasOwnProperty.call(v, "id")) complete = false;
    };
    values.forEach(visit);
    return { ids: Array.from(ids).sort(), complete };
  }
  async function captureHostVariableUsage(node, resolve) {
    const usage = { version: 1, complete: true, bindings: {} };
    try {
      const values = ["boundVariables", "fills", "strokes", "effects", "layoutGrids"].map((key) => node[key]);
      if (node.type === "TEXT") values.push(node.getStyledTextSegments(["fills", "boundVariables"]));
      const tokens = tokenIds(values);
      usage.complete = tokens.complete;
      const visiting = /* @__PURE__ */ new Set();
      let count = 0;
      const visit = async (id, depth) => {
        if (visiting.has(id) || depth > 16 || ++count > 128) {
          usage.complete = false;
          return;
        }
        if (usage.bindings[id]) return;
        visiting.add(id);
        const collection = await resolve(id, record5(node.resolvedVariableModes));
        if (!collection || !Array.isArray(collection.referencedVariableIds)) usage.complete = false;
        else {
          for (const alias of collection.referencedVariableIds) {
            if (typeof alias !== "string" || !alias) usage.complete = false;
            else await visit(alias, depth + 1);
          }
          usage.bindings[id] = collection;
        }
        visiting.delete(id);
      };
      for (const id of tokens.ids) await visit(id, 0);
    } catch {
      usage.complete = false;
    }
    return usage;
  }
  function hostContextFacts(node) {
    const usage = record5(node.hostVariableUsageV1), variable = record5(node.variable);
    if (usage.version !== 1 || usage.complete !== true || !object(usage.bindings) || !object(variable.bindings) || !object(variable.modes) || !object(variable.modeCatalog) || unknown(node, "hostVariableUsageV1") || unknown(node, "variable.bindings")) return;
    const tokens = tokenIds([variable.bindings, node.appearance, node.textFillEvidenceV1]);
    if (!tokens.complete || tokens.ids.some((id) => !Object.prototype.hasOwnProperty.call(usage.bindings, id))) return;
    const checked = /* @__PURE__ */ new Set(), visiting = /* @__PURE__ */ new Set();
    const validChain = (id, depth) => {
      if (visiting.has(id) || depth > 16) return false;
      if (checked.has(id)) return true;
      const refs = record5(usage.bindings[id]).referencedVariableIds;
      if (!Array.isArray(refs)) return false;
      visiting.add(id);
      if (refs.some((alias) => typeof alias !== "string" || !Object.prototype.hasOwnProperty.call(usage.bindings, alias) || !validChain(alias, depth + 1))) return false;
      visiting.delete(id);
      checked.add(id);
      return true;
    };
    if (Object.keys(usage.bindings).length > 128 || Object.keys(usage.bindings).some((id) => !validChain(id, 0))) return;
    const modes = {}, catalog = {};
    const ids = /* @__PURE__ */ new Map();
    for (const binding of Object.values(usage.bindings)) {
      const collection = record5(binding), key = collection.collectionKey, id = collection.collectionId;
      if (typeof key !== "string" || !/^[a-f0-9]{40}$/i.test(key) || typeof id !== "string" || !id || ids.has(key) && ids.get(key) !== id) return;
      if (!Array.isArray(collection.referencedVariableIds) || collection.referencedVariableIds.some((alias) => typeof alias !== "string" || !Object.prototype.hasOwnProperty.call(usage.bindings, alias))) return;
      ids.set(key, id);
      const mode = variable.modes[key], entry = record5(variable.modeCatalog[key]);
      if (unknown(node, `variable.modes.${key}`) || unknown(node, `variable.modeCatalog.${key}`) || typeof mode !== "string" || record5(node.resolvedModes)[id] !== mode || entry.collectionId !== id || !Array.isArray(entry.modes) || entry.modes.filter((m) => (m == null ? void 0 : m.modeId) === mode).length !== 1) return;
      modes[key] = mode;
      catalog[key] = entry;
    }
    const facts = JSON.parse(JSON.stringify(effectiveFacts(node)));
    facts.variable = Object.assign({}, variable, { modes, modeCatalog: catalog });
    facts.hostVariableUsageV1 = usage;
    return facts;
  }

  // ../Apollo/packages/component-contract-core/src/property-applicability.ts
  function capturePropertyActivity(node) {
    const result = {};
    try {
      if (Array.isArray(node.strokes)) result.strokePresent = node.strokes.length > 0;
    } catch {
    }
    try {
      const mode = node.layoutMode;
      if (mode === "HORIZONTAL" || mode === "VERTICAL" || mode === "GRID") {
        result.paddingApplicable = true;
        result.axisAlignmentApplicable = mode !== "GRID";
      } else if (mode === "NONE") {
        result.paddingApplicable = false;
        result.axisAlignmentApplicable = false;
      }
      if (mode === "NONE" || mode === "GRID") result.gapApplicable = false;
      else if (mode === "HORIZONTAL" || mode === "VERTICAL") {
        if (!Array.isArray(node.children)) return result;
        let certain = 0, possible = 0;
        for (const child of node.children) {
          try {
            const visible = child.visible, positioning = child.layoutPositioning;
            if (visible === false || positioning === "ABSOLUTE") continue;
            possible++;
            if (visible === true && positioning === "AUTO") certain++;
          } catch {
            possible++;
          }
        }
        if (certain >= 2) result.gapApplicable = true;
        else if (possible < 2) result.gapApplicable = false;
      } else if (["GROUP", "BOOLEAN_OPERATION", "VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "POLYGON", "STAR", "TEXT"].includes(String(node.type))) {
        result.gapApplicable = false;
        result.paddingApplicable = false;
        result.axisAlignmentApplicable = false;
      }
    } catch {
    }
    return result;
  }

  // ../Apollo/packages/component-contract-core/src/gradient-paint-facts.ts
  var TYPES = /* @__PURE__ */ new Set(["GRADIENT_LINEAR", "GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"]);
  var record6 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
  var finite = (v) => typeof v === "number" && Number.isFinite(v);
  var unit = (v) => finite(v) && v >= 0 && v <= 1;
  var transformValid = (v) => Array.isArray(v) && v.length === 2 && v.every((row) => Array.isArray(row) && row.length === 3 && row.every(finite));
  var colorValid = (v) => ["r", "g", "b", "a"].every((key) => unit(record6(v)[key]));
  function captureGradientPaintDetails(value) {
    const paint = record6(value), facts = {};
    if (!TYPES.has(String(paint.type))) return facts;
    if (transformValid(paint.gradientTransform)) facts.gradientTransform = paint.gradientTransform.map((row) => row.slice());
    if (Array.isArray(paint.gradientStops)) facts.gradientStops = paint.gradientStops.map((raw) => {
      const stop = record6(raw), result = {};
      if (unit(stop.position)) result.position = stop.position;
      if (colorValid(stop.color)) result.color = Object.fromEntries(["r", "g", "b", "a"].map((key) => [key, record6(stop.color)[key]]));
      if (stop.boundVariables === void 0 || stop.boundVariables && typeof stop.boundVariables === "object" && !Array.isArray(stop.boundVariables) && !Object.prototype.hasOwnProperty.call(stop.boundVariables, "color")) result.tokenId = null;
      else {
        const alias = record6(record6(stop.boundVariables).color);
        if (alias.type === "VARIABLE_ALIAS" && typeof alias.id === "string" && alias.id.trim()) result.tokenId = alias.id;
      }
      return result;
    });
    if (typeof paint.blendMode === "string") facts.blendMode = paint.blendMode;
    return facts;
  }

  // ../Apollo/packages/component-contract-core/src/effect-facts.ts
  function captureEffectDetails(effects, styleId) {
    var _a;
    if (!Array.isArray(effects) || typeof styleId !== "string") return void 0;
    if (effects.some((e) => !e || typeof e !== "object" || typeof e.type !== "string")) return void 0;
    if (effects.some((e) => ["BACKGROUND_BLUR", "LAYER_BLUR"].includes(e.type) && (typeof e.radius !== "number" || !Number.isFinite(e.radius) || e.radius < 0))) return void 0;
    const key = (_a = /^S:([a-f0-9]{40})(?:,|$)/i.exec(styleId)) == null ? void 0 : _a[1];
    return {
      version: 1,
      styleRef: key ? `key:${key.toLowerCase()}` : styleId ? `local:${styleId}` : null,
      effects: effects.map((e) => JSON.parse(JSON.stringify(e)))
    };
  }

  // ../Apollo/packages/component-contract-core/src/text-style-facts.ts
  async function captureTextStyleEvidence(node, resolveKey) {
    const result = { version: 1 };
    try {
      result.segments = node.getStyledTextSegments(["textStyleId"]).map((s) => ({ start: s.start, end: s.end, styleId: s.textStyleId }));
    } catch {
      return result;
    }
    const ids = [...new Set([node.textStyleId, ...result.segments.map((s) => s.styleId)].filter((id) => typeof id === "string" && id && !/^S:[a-f0-9]{40}(?:,[^\s]+)?$/i.test(id)))];
    result.keysById = {};
    for (const id of ids) {
      try {
        const key = await resolveKey(id);
        if (key) result.keysById[id] = key;
      } catch {
      }
    }
    return result;
  }

  // ../Apollo/packages/component-contract-core/src/text-decoration-facts.ts
  function captureTextDecoration(node) {
    try {
      if (node.type !== "TEXT" || typeof node.characters !== "string") return;
      const valid = (v) => typeof v === "string" && ["NONE", "UNDERLINE", "STRIKETHROUGH"].includes(v);
      if (!node.characters.length) return valid(node.textDecoration) ? [node.textDecoration] : void 0;
      const ranges = node.getStyledTextSegments(["textDecoration"]);
      if (!Array.isArray(ranges)) return;
      let end = 0;
      if (!ranges.every((r) => r && Number.isInteger(r.start) && Number.isInteger(r.end) && r.start === end && r.end > r.start && r.end <= node.characters.length && valid(r.textDecoration) && (end = r.end)) || end !== node.characters.length) return;
      return [...new Set(ranges.map((r) => r.textDecoration))].sort();
    } catch {
      return;
    }
  }

  // ../Apollo/packages/component-contract-core/src/text-binding-identity.ts
  var variableKey = (id) => {
    var _a, _b;
    return typeof id === "string" ? (_b = ((_a = /^VariableID:([a-f0-9]{40})(?:\/[^\s]+)?$/i.exec(id)) == null ? void 0 : _a[1]) || (/^[a-f0-9]{40}$/i.test(id) ? id : void 0)) == null ? void 0 : _b.toLowerCase() : void 0;
  };
  async function captureTextFillEvidence(node, serialize, resolveKey) {
    const evidence = { version: 1, keysById: {} };
    try {
      evidence.segments = node.getStyledTextSegments(["fills"]).map((s) => ({ start: s.start, end: s.end, paints: serialize(s.fills) }));
      evidence.emptyPaints = serialize(node.fills);
    } catch {
      return evidence;
    }
    const ids = /* @__PURE__ */ new Set();
    for (const paints of [evidence.emptyPaints, ...evidence.segments.map((s) => s.paints)]) {
      if (Array.isArray(paints)) for (const p of paints) {
        for (const id of [p.tokenId, ...Array.isArray(p.gradientStops) ? p.gradientStops.map((s) => s.tokenId) : []]) {
          if (typeof id === "string" && id && !variableKey(id)) ids.add(id);
        }
      }
    }
    await Promise.all([...ids].map(async (id) => {
      try {
        const key = await resolveKey(id);
        if (key) evidence.keysById[id] = key;
      } catch {
      }
    }));
    return evidence;
  }

  // ../Apollo/packages/component-contract-core/src/nested-instance-content-reference.ts
  var INSTANCE_CONTENT_REFERENCE_LIMIT = 8;
  var record7 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
  var clone = (v) => JSON.parse(JSON.stringify(v));
  var referenceFor = (s) => {
    var _a, _b;
    return captureVariantReference(s, ((_a = s.source) == null ? void 0 : _a.componentKey) || "", ((_b = s.source) == null ? void 0 : _b.componentSetKey) || "");
  };
  var nodesByPath = (s) => {
    const paths = snapshotPaths(s);
    return paths && new Map(s.nodes.map((n) => [paths.get(String(n.id)), n]));
  };
  function planNestedInstanceContentReferences(snapshot, reference, parent) {
    const comparison = compareInstanceBoundaries(snapshot, referenceFor(reference), true);
    return comparison.complete ? comparison.boundaries.filter((b) => b.actualPath !== parent.actualPath && withinBoundary(b.actualPath, parent.actualPath)) : [];
  }
  function materializeNestedInstanceContentReferences(snapshot) {
    var _a, _b, _c, _d;
    const evidence = snapshot.instanceContentReferences;
    const actual = nodesByPath(snapshot), original = snapshot.variantReference;
    const results = [];
    snapshot.instanceContentResults = results;
    const comparison = original && compareInstanceBoundaries(snapshot, original, true);
    const roots = (comparison == null ? void 0 : comparison.complete) ? comparison.boundaries : [];
    snapshot.instanceBoundaries = [...roots];
    const base = evidence.base;
    const baseRef = base && captureVariantReference(base, ((_a = base.source) == null ? void 0 : _a.componentKey) || "", ((_b = base.source) == null ? void 0 : _b.componentSetKey) || "", original == null ? void 0 : original.definedProperties);
    const baseValid = actual && (original == null ? void 0 : original.complete) && (baseRef == null ? void 0 : baseRef.complete) && ((_c = base.source) == null ? void 0 : _c.rootNodeId) && base.source.rootNodeId !== ((_d = snapshot.source) == null ? void 0 : _d.rootNodeId) && stableHash(baseRef) === stableHash(original) && base.context.platform === snapshot.context.platform && stableHash(base.context.modes) === stableHash(snapshot.context.modes);
    let visited = 0;
    const visit = (boundary, context, parentId) => {
      var _a2, _b2, _c2, _d2, _e, _f, _g;
      const result = { boundaryNodeId: boundary.nodeId, status: "unresolved", reason: "reference-not-captured", matchedNodeIds: [] };
      results.push(result);
      if (actual) {
        for (const [path, node] of actual) if (withinBoundary(path, boundary.actualPath)) {
          node.baseline = { effective: {} };
          node.baselineProvenance = { status: "unresolved", reason: boundary.reason, boundaryNodeId: boundary.nodeId };
          if (node.semantic) delete record7(node.semantic).role;
        }
      }
      const fail = (reason) => {
        result.reason = reason;
        return result;
      };
      if (++visited > INSTANCE_CONTENT_REFERENCE_LIMIT) return fail("reference-capture-limit");
      if (!baseValid) return fail("original-host-evidence-invalid");
      if (evidence.hostContextVariableModesVersion !== void 0 && evidence.hostContextVariableModesVersion !== 1) return fail("host-context-mode-version-unsupported");
      const variant = boundary.reason === "component-variant-changed" && Boolean(boundary.componentSetKey);
      if (!boundary.actualComponentKey || !variant && (boundary.reason !== "instance-swap" || !boundary.property || boundary.ownerPath === void 0)) return fail("explicit-swap-port-required");
      const attempts = evidence.attempts.filter((a) => a.boundaryNodeId === boundary.nodeId);
      if (attempts.length !== 1) return fail(attempts.length ? "ambiguous-reference" : "reference-not-captured");
      const attempt = attempts[0], reference = attempt.reference;
      if (attempt.parentBoundaryNodeId !== parentId) return fail("reference-parent-mismatch");
      if (attempt.failure || !reference) return fail(attempt.failure || "reference-not-captured");
      if (variant && attempt.strategy !== "pristine-host-variant-properties") return fail("variant-capture-strategy-unproven");
      const expected = nodesByPath(reference), contextNodes = nodesByPath(context);
      const refId = (_a2 = reference.source) == null ? void 0 : _a2.rootNodeId;
      if (!expected || !contextNodes || !refId || refId === ((_b2 = snapshot.source) == null ? void 0 : _b2.rootNodeId) || refId === ((_c2 = base.source) == null ? void 0 : _c2.rootNodeId) || refId === ((_d2 = context.source) == null ? void 0 : _d2.rootNodeId) || reference.context.platform !== snapshot.context.platform || stableHash(reference.context.modes) !== stableHash(snapshot.context.modes)) return fail("replacement-reference-incomplete");
      const change = compareInstanceBoundaries(reference, referenceFor(context), true), refBoundary = change.boundaries[0];
      if (!change.complete || change.boundaries.length !== 1 || refBoundary.reason !== boundary.reason || refBoundary.referencePath !== boundary.referencePath || refBoundary.ownerPath !== boundary.ownerPath || refBoundary.property !== boundary.property || refBoundary.actualComponentKey !== boundary.actualComponentKey || refBoundary.componentSetKey !== boundary.componentSetKey) return fail("replacement-identity-or-port-mismatch");
      for (const [path, node] of contextNodes) {
        if (withinBoundary(path, boundary.referencePath)) continue;
        const other = expected.get(path);
        if (!other) return fail("host-context-changed");
        const before = evidence.hostContextVariableModesVersion === 1 ? hostContextFacts(node) : clone(effectiveFacts(node));
        const after = evidence.hostContextVariableModesVersion === 1 ? hostContextFacts(other) : clone(effectiveFacts(other));
        if (!before || !after) return fail("host-context-variable-evidence-incomplete");
        if (!variant && path === boundary.ownerPath && boundary.property) {
          delete record7(record7(before.component).properties)[boundary.property];
          delete record7(record7(after.component).properties)[boundary.property];
        }
        if (stableHash(before) !== stableHash(after)) return fail("host-context-changed");
      }
      const remainder = compareInstanceBoundaries(snapshot, referenceFor(reference), true);
      if (!remainder.complete) return fail("replacement-structure-needs-remap");
      const children = remainder.boundaries.filter((b) => withinBoundary(b.actualPath, boundary.actualPath));
      if (children.some((b) => b.actualPath === boundary.actualPath)) return fail("replacement-nested-identity-unresolved");
      const pairs = [];
      for (const [path, node] of actual) {
        if (!withinBoundary(path, boundary.actualPath) || children.some((b) => withinBoundary(path, b.actualPath))) continue;
        const relative = path.slice(boundary.actualPath.length);
        const referencePath = remainder.referencePaths ? correspondingPath(remainder, path) : refBoundary.actualPath + relative;
        const other = referencePath !== void 0 ? expected.get(referencePath) : void 0;
        if (!other || other.type !== node.type) return fail("replacement-structure-needs-remap");
        if (node.type === "INSTANCE") {
          const a = record7(record7(node.component).identity), b = record7(record7(other.component).identity);
          if (!a.componentKey || a.componentKey !== b.componentKey || (a.componentSetKey || "") !== (b.componentSetKey || "")) return fail("replacement-nested-identity-unresolved");
        }
        pairs.push([path, node, other]);
      }
      if (variant) {
        const props = (n) => {
          const c = record7(n == null ? void 0 : n.component);
          return Object.fromEntries(Object.entries(record7(c.propertyTypes)).filter(([, t]) => t === "VARIANT").map(([p]) => [p, record7(c.properties)[p]]));
        };
        const expectedProperties = props(expected.get(refBoundary.actualPath));
        if (!Object.keys(expectedProperties).length || stableHash(props(actual.get(boundary.actualPath))) !== stableHash(expectedProperties)) return fail("variant-properties-mismatch");
      }
      result.lineageProven = true;
      for (const [path, node, other] of pairs) {
        node.baseline = { effective: clone(effectiveFacts(
          other,
          ((_e = snapshot.source) == null ? void 0 : _e.geometryCaptureVersion) === 1 && ((_f = reference.source) == null ? void 0 : _f.geometryCaptureVersion) === 1
        )) };
        if (variant && path === boundary.actualPath) {
          const originalComponent = record7((_g = contextNodes.get(boundary.referencePath)) == null ? void 0 : _g.component), current = record7(node.component);
          const baseline = record7(record7(record7(node.baseline).effective).component), available = record7(record7(node.variantAvailability).componentProperties);
          for (const [name, type] of Object.entries(record7(current.propertyTypes))) {
            if (type !== "VARIANT" || record7(originalComponent.propertyTypes)[name] !== "VARIANT" || !Object.prototype.hasOwnProperty.call(record7(originalComponent.properties), name)) continue;
            record7(baseline.properties)[name] = originalComponent.properties[name];
            available[propertyAvailabilityKey(name)] = true;
            node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== `variantAvailability.componentProperties.${propertyAvailabilityKey(name)}`);
          }
          if (node.variantAvailability) record7(node.variantAvailability).componentProperties = available;
        }
        node.baselineProvenance = {
          status: "matched",
          kind: variant ? "independent-host-variant" : "independent-host-swap",
          boundaryNodeId: boundary.nodeId,
          componentKey: boundary.actualComponentKey,
          ownerPath: boundary.ownerPath,
          property: boundary.property,
          ...variant ? { componentSetKey: boundary.componentSetKey } : {},
          referencePath: remainder.referencePaths ? correspondingPath(remainder, path) : refBoundary.actualPath + path.slice(boundary.actualPath.length)
        };
        result.matchedNodeIds.push(String(node.id));
      }
      let complete = true;
      for (const child of children) {
        snapshot.instanceBoundaries.push(child);
        const childResult = visit(child, reference, boundary.nodeId);
        complete = complete && childResult.status === "matched";
        result.matchedNodeIds.push(...childResult.matchedNodeIds);
      }
      result.status = complete ? "matched" : "partial";
      result.reason = complete ? variant ? "independent-host-variant-reference" : "independent-host-swap-reference" : "nested-content-reference-unresolved";
      return result;
    };
    for (const boundary of roots) visit(boundary, base);
  }

  // ../Apollo/packages/component-contract-core/src/instance-content-reference.ts
  var record8 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
  var clone2 = (v) => JSON.parse(JSON.stringify(v));
  function planInstanceContentReferences(snapshot) {
    if (!snapshot.variantReference) return [];
    const comparison = compareInstanceBoundaries(snapshot, snapshot.variantReference);
    return comparison.complete ? comparison.boundaries : [];
  }
  function byPath(snapshot) {
    const paths = snapshotPaths(snapshot);
    return paths && new Map(snapshot.nodes.map((n) => [paths.get(String(n.id)), n]));
  }
  function subtree(nodes, root) {
    return new Map([...nodes].filter(([p]) => withinBoundary(p, root)).map(([p, n]) => [p === root ? "" : p.slice(root.length + 3), n]));
  }
  function materializeInstanceContentReferences(snapshot) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const evidence = snapshot.instanceContentReferences;
    if (!evidence) return;
    if (evidence.schemaVersion === "apollo.instance-content-references.v4") {
      materializeNestedInstanceContentReferences(snapshot);
      return;
    }
    const boundaries = planInstanceContentReferences(snapshot);
    const results = [];
    snapshot.instanceContentResults = results;
    const original = snapshot.variantReference;
    const actualNodes = byPath(snapshot);
    const base = evidence.base;
    const baseNodes = base && byPath(base);
    const baseReference = base && captureVariantReference(
      base,
      ((_a = base.source) == null ? void 0 : _a.componentKey) || "",
      ((_b = base.source) == null ? void 0 : _b.componentSetKey) || "",
      original == null ? void 0 : original.definedProperties
    );
    const nestedVariants = ["apollo.instance-content-references.v2", "apollo.instance-content-references.v3"].includes(evidence.schemaVersion);
    const baseValid = (evidence.schemaVersion === "apollo.instance-content-references.v1" || nestedVariants) && actualNodes && baseNodes && (original == null ? void 0 : original.complete) && (baseReference == null ? void 0 : baseReference.complete) && ((_c = base.source) == null ? void 0 : _c.rootNodeId) && base.source.rootNodeId !== ((_d = snapshot.source) == null ? void 0 : _d.rootNodeId) && stableHash(baseReference) === stableHash(original) && stableHash(base.context.modes) === stableHash(snapshot.context.modes) && base.context.platform === snapshot.context.platform;
    for (const boundary of boundaries) {
      const result = { boundaryNodeId: boundary.nodeId, status: "unresolved", reason: "reference-not-captured", matchedNodeIds: [] };
      results.push(result);
      if (actualNodes) for (const node of subtree(actualNodes, boundary.actualPath).values()) {
        node.baseline = { effective: {} };
        node.baselineProvenance = { status: "unresolved", reason: boundary.reason, boundaryNodeId: boundary.nodeId };
        if (node.semantic && typeof node.semantic === "object") delete record8(node.semantic).role;
      }
      if (!baseValid) {
        result.reason = "original-host-evidence-invalid";
        continue;
      }
      const variant = nestedVariants && boundary.reason === "component-variant-changed" && Boolean(boundary.componentSetKey);
      if (!boundary.actualComponentKey || !variant && (boundary.reason !== "instance-swap" || !boundary.property || boundary.ownerPath === void 0)) {
        result.reason = "explicit-swap-port-required";
        continue;
      }
      const attempts = evidence.attempts.filter((a) => a.boundaryNodeId === boundary.nodeId);
      if (attempts.length !== 1) {
        result.reason = attempts.length ? "ambiguous-reference" : "reference-not-captured";
        continue;
      }
      const attempt = attempts[0], reference = attempt.reference;
      if (attempt.failure || !reference) {
        result.reason = attempt.failure || "reference-not-captured";
        continue;
      }
      if (variant && evidence.schemaVersion === "apollo.instance-content-references.v3" && attempt.strategy !== "pristine-host-variant-properties") {
        result.reason = "variant-capture-strategy-unproven";
        continue;
      }
      const refNodes = byPath(reference);
      const independent = ((_e = reference.source) == null ? void 0 : _e.rootNodeId) && reference.source.rootNodeId !== ((_f = snapshot.source) == null ? void 0 : _f.rootNodeId) && reference.source.rootNodeId !== ((_g = base.source) == null ? void 0 : _g.rootNodeId);
      if (!independent || !refNodes || stableHash(reference.context.modes) !== stableHash(snapshot.context.modes) || reference.context.platform !== snapshot.context.platform) {
        result.reason = "replacement-reference-incomplete";
        continue;
      }
      const comparison = compareInstanceBoundaries(reference, original, nestedVariants);
      const refBoundary = comparison.boundaries[0];
      if (!comparison.complete || comparison.boundaries.length !== 1 || refBoundary.reason !== boundary.reason || refBoundary.referencePath !== boundary.referencePath || refBoundary.ownerPath !== boundary.ownerPath || refBoundary.property !== boundary.property || refBoundary.actualComponentKey !== boundary.actualComponentKey || refBoundary.componentSetKey !== boundary.componentSetKey) {
        result.reason = "replacement-identity-or-port-mismatch";
        continue;
      }
      let hostIntact = true;
      for (const [path, node] of baseNodes) {
        if (withinBoundary(path, boundary.referencePath)) continue;
        const other = refNodes.get(path);
        if (!other) {
          hostIntact = false;
          break;
        }
        const expected2 = clone2(effectiveFacts(node)), observed = clone2(effectiveFacts(other));
        if (!variant && path === boundary.ownerPath && boundary.property) {
          delete record8(record8(expected2.component).properties)[boundary.property];
          delete record8(record8(observed.component).properties)[boundary.property];
        }
        if (stableHash(expected2) !== stableHash(observed)) {
          hostIntact = false;
          break;
        }
      }
      if (!hostIntact) {
        result.reason = "host-context-changed";
        continue;
      }
      const actual = subtree(actualNodes, boundary.actualPath), expected = subtree(refNodes, refBoundary.actualPath);
      const shape = (nodes) => [...nodes].map(([p, n]) => [p, n.type]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
      if (stableHash(shape(actual)) !== stableHash(shape(expected))) {
        result.reason = "replacement-structure-needs-remap";
        continue;
      }
      const identityKnown = [...actual].every(([path, node]) => {
        var _a2;
        if (node.type !== "INSTANCE") return true;
        const a = record8(record8(node.component).identity), b = record8(record8((_a2 = expected.get(path)) == null ? void 0 : _a2.component).identity);
        return Boolean(a.componentKey && b.componentKey && a.componentKey === b.componentKey && (a.componentSetKey || "") === (b.componentSetKey || ""));
      });
      if (!identityKnown) {
        result.reason = "replacement-nested-identity-unresolved";
        continue;
      }
      if (variant) {
        const variantProperties = (node) => {
          const component = record8(node == null ? void 0 : node.component);
          return Object.fromEntries(Object.entries(record8(component.propertyTypes)).filter(([, type]) => type === "VARIANT").map(([name]) => [name, record8(component.properties)[name]]));
        };
        const expectedProperties = variantProperties(expected.get(""));
        if (!Object.keys(expectedProperties).length || stableHash(variantProperties(actual.get(""))) !== stableHash(expectedProperties)) {
          result.reason = "variant-properties-mismatch";
          continue;
        }
      }
      for (const [path, node] of actual) {
        node.baseline = { effective: clone2(effectiveFacts(
          expected.get(path),
          ((_h = snapshot.source) == null ? void 0 : _h.geometryCaptureVersion) === 1 && ((_i = reference.source) == null ? void 0 : _i.geometryCaptureVersion) === 1
        )) };
        if (variant && path === "") {
          const originalComponent = record8((_j = baseNodes.get(boundary.referencePath)) == null ? void 0 : _j.component);
          const current = record8(node.component), baseline = record8(record8(record8(node.baseline).effective).component);
          const available = record8(record8(node.variantAvailability).componentProperties);
          for (const [name, type] of Object.entries(record8(current.propertyTypes))) {
            if (type !== "VARIANT" || record8(originalComponent.propertyTypes)[name] !== "VARIANT" || !Object.prototype.hasOwnProperty.call(record8(originalComponent.properties), name)) continue;
            record8(baseline.properties)[name] = originalComponent.properties[name];
            available[propertyAvailabilityKey(name)] = true;
            node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== `variantAvailability.componentProperties.${propertyAvailabilityKey(name)}`);
          }
          if (node.variantAvailability) record8(node.variantAvailability).componentProperties = available;
        }
        node.baselineProvenance = {
          status: "matched",
          kind: variant ? "independent-host-variant" : "independent-host-swap",
          boundaryNodeId: boundary.nodeId,
          componentKey: boundary.actualComponentKey,
          ownerPath: boundary.ownerPath,
          property: boundary.property,
          ...variant ? { componentSetKey: boundary.componentSetKey } : {},
          referencePath: [refBoundary.actualPath, path].filter(Boolean).join(" / ")
        };
        result.matchedNodeIds.push(String(node.id));
      }
      result.status = "matched";
      result.reason = variant ? "independent-host-variant-reference" : "independent-host-swap-reference";
    }
  }

  // ../Apollo/packages/component-contract-core/src/component-dependencies.ts
  var COMPONENT_DEPENDENCY_CAPTURE_LIMIT = 8;
  var DIRECT_CHILD_DEPENDENCY_CAPTURE_LIMIT = 16;

  // ../Apollo/packages/component-contract-core/src/dependency-capture-diagnostics.ts
  function boundedText(value, limit) {
    return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, limit) : "";
  }
  function errorField(error, field) {
    try {
      return error && typeof error === "object" ? error[field] : void 0;
    } catch {
      return void 0;
    }
  }
  function dependencyCaptureFailureDetails(stage, error) {
    return {
      version: 1,
      stage,
      errorName: boundedText(errorField(error, "name"), 80) || "Error",
      message: boundedText(typeof error === "string" ? error : errorField(error, "message"), 360) || "\u041E\u0448\u0438\u0431\u043A\u0430 \u0431\u0435\u0437 \u0442\u0435\u043A\u0441\u0442\u0430."
    };
  }

  // ../Apollo/packages/component-contract-core/src/transition-capture.ts
  var layoutKeys = [
    "layoutMode",
    "layoutWrap",
    "layoutSizingHorizontal",
    "layoutSizingVertical",
    "primaryAxisSizingMode",
    "counterAxisSizingMode",
    "primaryAxisAlignItems",
    "counterAxisAlignItems",
    "counterAxisAlignContent",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "itemSpacing",
    "counterAxisSpacing",
    "layoutGrow",
    "layoutAlign",
    "layoutPositioning",
    "minWidth",
    "maxWidth",
    "minHeight",
    "maxHeight",
    "constraints",
    "resolvedVariableModes",
    "boundVariables",
    "rotation",
    "visible"
  ];
  function fields(node, keys) {
    const out = {};
    for (const k of keys) if (k in node) {
      const v = node[k];
      if (v !== void 0) out[k] = v;
    }
    return JSON.parse(JSON.stringify(out));
  }
  function captureTransitionContext(subject) {
    try {
      const ancestors = [];
      let branch = subject, parent = subject.parent;
      while (parent && parent.type !== "PAGE") {
        if (ancestors.length >= 32) throw Error("ancestor-limit");
        const siblings = (parent.children || []).filter((n) => n !== branch);
        if (siblings.length > 200) throw Error("sibling-limit");
        const layout = fields(parent, layoutKeys);
        if (parent.relativeTransform) layout.linearTransform = parent.relativeTransform.map((row) => row.slice(0, 2));
        if (parent.type !== "GROUP") {
          if (parent.layoutSizingHorizontal !== "HUG") {
            if (!Number.isFinite(parent.width)) throw Error("parent-width-unknown");
            layout.width = parent.width;
          }
          if (parent.layoutSizingVertical !== "HUG") {
            if (!Number.isFinite(parent.height)) throw Error("parent-height-unknown");
            layout.height = parent.height;
          }
        }
        if (parent.layoutMode === "GRID") throw Error("unsupported-grid-context");
        ancestors.push({
          id: parent.id,
          type: parent.type,
          layout,
          childIds: (parent.children || []).map((n) => n.id),
          siblings: siblings.map((n) => ({ id: n.id, ...fields(n, ["width", "height", "visible", ...layoutKeys]) }))
        });
        branch = parent;
        parent = parent.parent;
      }
      if (!parent || parent.type !== "PAGE") throw Error("page-unknown");
      const context = {
        profile: "same-instance-context@1",
        pageId: parent.id,
        ancestors,
        rootConstraints: fields(subject, ["minWidth", "maxWidth", "minHeight", "maxHeight", "constraints", "layoutGrow", "layoutAlign", "layoutPositioning", "rotation"])
      };
      const nodes = [];
      const visit = (n) => {
        if (nodes.length >= 500) throw Error("node-limit");
        nodes.push({ id: n.id, ...fields(n, ["visible", "width", "height", "componentProperties", "resolvedVariableModes", ...layoutKeys]) });
        for (const c of n.children || []) visit(c);
      };
      visit(subject);
      return { context, fingerprint: stableHash({ context, nodes }), complete: true };
    } catch {
      return { context: { profile: "same-instance-context@1" }, fingerprint: "", complete: false, reason: "capture-context-incomplete" };
    }
  }

  // ../Apollo/packages/component-contract-core/src/instance-main-aliases.ts
  function configureInstanceMainAliases(snapshot, enabled) {
    if (snapshot.source) {
      delete snapshot.source.instanceMainComponentAliasesVersion;
      if (enabled) snapshot.source.instanceMainComponentAliasesVersion = 1;
    }
    if (snapshot.instanceContentReferences) {
      configureInstanceMainAliases(snapshot.instanceContentReferences.base, enabled);
      for (const attempt of snapshot.instanceContentReferences.attempts)
        if (attempt.reference) configureInstanceMainAliases(attempt.reference, enabled);
    }
    for (const capture of snapshot.componentDependencyCaptures || [])
      if (capture.snapshot) configureInstanceMainAliases(capture.snapshot, enabled);
  }

  // ../Apollo/packages/component-contract-core/src/figma-capture.ts
  var transitionSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  var transitionSequence = 0;
  function slug(value) {
    return value.replace(/^\s*(?:❌|🔒|🔄)?\s*\[[DMT]\]\s*/u, "").replace(/([a-z\d])([A-Z])/g, "$1-$2").normalize("NFKD").replace(/[^a-zA-Z0-9а-яА-ЯёЁ]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "target";
  }
  function finite2(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : void 0;
  }
  function paintFacts(paints) {
    if (paints === figma.mixed || !Array.isArray(paints)) return null;
    return paints.map((paint) => {
      var _a, _b;
      const fact = {
        type: paint.type,
        visible: !("visible" in paint) || paint.visible !== false,
        opacity: "opacity" in paint ? (_a = finite2(paint.opacity)) != null ? _a : 1 : 1
      };
      const bound = paint.boundVariables;
      if ((_b = bound == null ? void 0 : bound.color) == null ? void 0 : _b.id) fact.tokenId = bound.color.id;
      if (paint.type === "SOLID") {
        fact.color = {
          r: Math.round(paint.color.r * 255),
          g: Math.round(paint.color.g * 255),
          b: Math.round(paint.color.b * 255)
        };
      }
      Object.assign(fact, captureGradientPaintDetails(paint));
      return fact;
    });
  }
  function variableBindings(node) {
    const result = {};
    const boundVariables = node.boundVariables;
    if (!boundVariables) return result;
    for (const [field, value] of Object.entries(boundVariables)) {
      const ids = (Array.isArray(value) ? value : [value]).map((alias) => {
        let candidate = alias;
        while (candidate && typeof candidate === "object" && "id" in candidate) {
          candidate = candidate.id;
        }
        return String(candidate);
      });
      result[field.replace(/\./g, "_")] = {
        required: true,
        tokenIds: ids
      };
    }
    return result;
  }
  function layoutFacts(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const layout = {};
    if ("layoutMode" in node) layout.mode = String(node.layoutMode);
    if ("itemSpacing" in node) layout.itemSpacing = (_a = finite2(node.itemSpacing)) != null ? _a : 0;
    if ("paddingTop" in node) {
      layout.padding = {
        top: (_b = finite2(node.paddingTop)) != null ? _b : 0,
        right: (_c = finite2(node.paddingRight)) != null ? _c : 0,
        bottom: (_d = finite2(node.paddingBottom)) != null ? _d : 0,
        left: (_e = finite2(node.paddingLeft)) != null ? _e : 0,
        horizontal: ((_f = finite2(node.paddingLeft)) != null ? _f : 0) + ((_g = finite2(node.paddingRight)) != null ? _g : 0),
        vertical: ((_h = finite2(node.paddingTop)) != null ? _h : 0) + ((_i = finite2(node.paddingBottom)) != null ? _i : 0)
      };
    }
    if ("primaryAxisAlignItems" in node) layout.primaryAxisAlignItems = String(node.primaryAxisAlignItems);
    if ("counterAxisAlignItems" in node) layout.counterAxisAlignItems = String(node.counterAxisAlignItems);
    if ("layoutSizingHorizontal" in node) layout.sizingHorizontal = String(node.layoutSizingHorizontal);
    if ("layoutSizingVertical" in node) layout.sizingVertical = String(node.layoutSizingVertical);
    if ("gridStyleId" in node) layout.gridStyleId = String(node.gridStyleId);
    if ("clipsContent" in node) layout.clipsContent = node.clipsContent;
    return layout;
  }
  function appearanceFacts(node) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const appearance = {};
    if ("fills" in node) appearance.fill = paintFacts(node.fills);
    if ("fillStyleId" in node && node.fillStyleId !== figma.mixed) appearance.fillStyleId = String(node.fillStyleId);
    if ("strokes" in node && Array.isArray(node.strokes)) appearance.stroke = paintFacts(node.strokes);
    if ("strokeStyleId" in node) appearance.strokeStyleId = String(node.strokeStyleId);
    if ("strokeWeight" in node) {
      if (node.strokeWeight !== figma.mixed) appearance.strokeWeight = (_a = finite2(node.strokeWeight)) != null ? _a : 0;
      else {
        const sides = node;
        appearance.strokeWeight = {
          top: (_b = finite2(sides.strokeTopWeight)) != null ? _b : 0,
          right: (_c = finite2(sides.strokeRightWeight)) != null ? _c : 0,
          bottom: (_d = finite2(sides.strokeBottomWeight)) != null ? _d : 0,
          left: (_e = finite2(sides.strokeLeftWeight)) != null ? _e : 0
        };
      }
    }
    if ("strokeAlign" in node) appearance.strokeAlign = String(node.strokeAlign);
    if ("dashPattern" in node) appearance.dashPattern = node.dashPattern.slice();
    if ("opacity" in node) appearance.opacity = (_f = finite2(node.opacity)) != null ? _f : 1;
    if ("blendMode" in node && typeof node.blendMode === "string") appearance.blendMode = node.blendMode;
    if ("effects" in node) {
      appearance.effects = node.effects.map((effect) => ({ type: effect.type, visible: effect.visible !== false }));
      const details = captureEffectDetails(node.effects, "effectStyleId" in node ? node.effectStyleId : void 0);
      if (details !== void 0) appearance.effectDetailsV1 = details;
    }
    if ("effectStyleId" in node) appearance.effectStyleId = String(node.effectStyleId);
    if ("cornerRadius" in node) {
      if (node.cornerRadius === figma.mixed) {
        const corners = node;
        appearance.radius = {
          topLeft: (_g = finite2(corners.topLeftRadius)) != null ? _g : 0,
          topRight: (_h = finite2(corners.topRightRadius)) != null ? _h : 0,
          bottomRight: (_i = finite2(corners.bottomRightRadius)) != null ? _i : 0,
          bottomLeft: (_j = finite2(corners.bottomLeftRadius)) != null ? _j : 0
        };
      } else {
        appearance.radius = (_k = finite2(node.cornerRadius)) != null ? _k : 0;
      }
    }
    if ("textStyleId" in node && node.textStyleId !== figma.mixed) {
      appearance.typography = { styleId: String(node.textStyleId) };
    }
    return appearance;
  }
  function componentFacts(node, identity, sourceIdentity) {
    const propertyReferences = Object.values(node.componentPropertyReferences || {}).filter((value) => typeof value === "string");
    const propertyReferenceBindings = Object.fromEntries(Object.entries(node.componentPropertyReferences || {}).filter((entry) => typeof entry[1] === "string"));
    if (node.type !== "INSTANCE") {
      const facts2 = { propertyReferences, propertyReferenceBindings };
      if (sourceIdentity) facts2.sourceIdentity = sourceIdentity;
      return facts2;
    }
    const properties = {};
    const propertyTypes = {};
    for (const [name, property] of Object.entries(node.componentProperties)) {
      properties[name] = property.value;
      propertyTypes[name] = property.type;
    }
    const facts = { properties, propertyTypes, propertyReferences, propertyReferenceBindings, identity: identity || {} };
    if (sourceIdentity) facts.sourceIdentity = sourceIdentity;
    return facts;
  }
  function textFacts(node) {
    if (node.type !== "TEXT") return {};
    const text = { characters: node.characters };
    if (node.fontSize !== figma.mixed) text.fontSize = node.fontSize;
    if (node.fontName !== figma.mixed) {
      text.fontName = { family: node.fontName.family, style: node.fontName.style };
    }
    if (node.lineHeight !== figma.mixed) text.lineHeight = node.lineHeight;
    if (node.letterSpacing !== figma.mixed) text.letterSpacing = node.letterSpacing;
    if (node.textCase !== figma.mixed) text.case = node.textCase;
    const decoration = captureTextDecoration(node);
    if (decoration !== void 0) text.decoration = decoration;
    return text;
  }
  async function collectSceneNodes(root, platform, modes, captureScope, projection = "full") {
    const identityOnly = projection === "identity";
    const roleCounts = /* @__PURE__ */ new Map();
    const omissions = [];
    const topology = captureSceneTopology(root, 500, (entry, index, all) => {
      var _a, _b, _c, _d;
      if (entry.parentIndex !== 0 || entry.type !== "SLOT" || !captureScope) return false;
      const node = entry.node, owner = all[0].node;
      const property = (_a = node.componentPropertyReferences) == null ? void 0 : _a.slotContentId;
      const path = entry.path.split(" / ").slice(1).join(" / ");
      const candidates = captureScope.boundaries.filter((b) => b.path === path && b.property === property);
      if (typeof property !== "string" || candidates.length !== 1 || owner.type !== "INSTANCE" || String((_b = owner.componentProperties[property]) == null ? void 0 : _b.type) !== "SLOT" || ((_c = node.parent) == null ? void 0 : _c.id) !== owner.id || ((_d = node.parent) == null ? void 0 : _d.type) !== "INSTANCE") return false;
      const consumers = (all[0].observedChildren || []).filter((child) => {
        var _a2;
        return String(child.type) === "SLOT" && ((_a2 = child.componentPropertyReferences) == null ? void 0 : _a2.slotContentId) === property;
      });
      if (consumers.length !== 1 || consumers[0].id !== entry.figmaNodeId) return false;
      omissions.push({ nodeId: `preview:${index}`, targetId: candidates[0].targetId, property, path });
      return true;
    });
    const entries = topology.entries.map((entry) => {
      const baseRole = slug(entry.name);
      const count = (roleCounts.get(baseRole) || 0) + 1;
      roleCounts.set(baseRole, count);
      const role = count === 1 ? baseRole : `${baseRole}-${count}`;
      return { ...entry, node: entry.node, role };
    });
    const collectionIds = new Set(identityOnly ? [] : entries.flatMap((entry) => Object.keys(entry.node.resolvedVariableModes || {})));
    const resolvedCollections = (await Promise.all(Array.from(collectionIds).map(async (id) => {
      try {
        return await figma.variables.getVariableCollectionByIdAsync(id);
      } catch {
        return null;
      }
    }))).filter((collection) => Boolean(collection));
    const identities = /* @__PURE__ */ new Map();
    const mains = /* @__PURE__ */ new Map();
    const instances = entries.filter((entry) => entry.node.type === "INSTANCE");
    let nextIdentity = 0;
    await Promise.all(Array.from({ length: Math.min(6, instances.length) }, async () => {
      var _a;
      while (nextIdentity < instances.length) {
        const instance = instances[nextIdentity++].node;
        try {
          const main = await instance.getMainComponentAsync();
          if (main) mains.set(instance.id, main);
          if (main) identities.set(instance.id, {
            componentKey: main.key,
            mainComponentId: main.id,
            ...((_a = main.parent) == null ? void 0 : _a.type) === "COMPONENT_SET" ? { componentSetKey: main.parent.key } : {}
          });
        } catch {
        }
      }
    }));
    const pristineSources = /* @__PURE__ */ new Map();
    const sourceCapture = [];
    if (topology.complete) {
      const requested = /* @__PURE__ */ new Map();
      for (const entry of topology.entries) {
        if (entry.parentIndex === null) continue;
        let ownerIndex = entry.parentIndex;
        while (ownerIndex !== null && topology.entries[ownerIndex].type !== "INSTANCE") ownerIndex = topology.entries[ownerIndex].parentIndex;
        const main = ownerIndex === null ? void 0 : mains.get(topology.entries[ownerIndex].figmaNodeId);
        if (main == null ? void 0 : main.remote) requested.set(main.id, main);
      }
      for (const main of requested.values()) {
        let pristine;
        const diagnostic = { mainComponentId: main.id, componentKey: main.key, status: "unavailable" };
        try {
          pristine = main.createInstance();
          diagnostic.sourceInstanceId = pristine.id;
          const selected = await pristine.getMainComponentAsync();
          if (!selected || selected.id !== main.id || selected.key !== main.key) diagnostic.reason = "pristine-source-identity-mismatch";
          else {
            const sourceTopology = captureSceneTopology(pristine, 500, (entry, index) => index > 0 && (entry.type === "INSTANCE" || entry.type === "SLOT"));
            if (!sourceTopology.complete) diagnostic.reason = "incomplete-pristine-source-topology";
            else {
              pristineSources.set(main.id, { mainComponentId: main.id, componentKey: main.key, topology: sourceTopology });
              diagnostic.status = "captured";
            }
          }
        } catch {
          diagnostic.reason = "pristine-source-capture-unavailable";
        } finally {
          pristine == null ? void 0 : pristine.remove();
        }
        sourceCapture.push(diagnostic);
      }
    }
    const sourceIdentities = topology.complete ? captureInstanceSourceIdentities(topology.entries, mains, pristineSources, true) : /* @__PURE__ */ new Map();
    const roleToId = new Map(entries.map((entry, index) => [entry.role, `preview:${index}`]));
    const styleKeys = /* @__PURE__ */ new Map();
    const resolveStyleKey = (id) => {
      if (!styleKeys.has(id)) styleKeys.set(id, figma.getStyleByIdAsync(id).then((s) => (s == null ? void 0 : s.type) === "TEXT" ? s.key : void 0).catch(() => void 0));
      return styleKeys.get(id);
    };
    const styleEvidence = /* @__PURE__ */ new Map();
    const fillEvidence = /* @__PURE__ */ new Map();
    const variableKeys = /* @__PURE__ */ new Map();
    const resolveVariableKey = (id) => {
      if (!variableKeys.has(id)) variableKeys.set(id, figma.variables.getVariableByIdAsync(id).then((v) => (v == null ? void 0 : v.resolvedType) === "COLOR" ? v.key : void 0).catch(() => void 0));
      return variableKeys.get(id);
    };
    const textEntries = identityOnly ? [] : entries.filter((entry) => entry.node.type === "TEXT");
    let nextText = 0;
    await Promise.all(Array.from({ length: Math.min(6, textEntries.length) }, async () => {
      while (nextText < textEntries.length) {
        const node = textEntries[nextText++].node;
        styleEvidence.set(node.id, await captureTextStyleEvidence(node, resolveStyleKey));
        fillEvidence.set(node.id, await captureTextFillEvidence(node, paintFacts, resolveVariableKey));
      }
    }));
    const usageEvidence = /* @__PURE__ */ new Map();
    const bindingVariables = /* @__PURE__ */ new Map();
    const resolveBindingCollection = async (id, modes2) => {
      if (!bindingVariables.has(id)) bindingVariables.set(id, (async () => {
        try {
          const variable = await figma.variables.getVariableByIdAsync(id);
          if (!variable) return;
          const collection = resolvedCollections.find((c) => c.id === variable.variableCollectionId) || await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
          if (!collection || !/^[a-f0-9]{40}$/i.test(collection.key)) return;
          return { variable, collection };
        } catch {
          return;
        }
      })());
      const proof = await bindingVariables.get(id);
      if (!proof) return;
      const mode = modes2[proof.collection.id], values = proof.variable.valuesByMode;
      if (typeof mode !== "string" || !values || !Object.prototype.hasOwnProperty.call(values, mode)) return;
      const value = values[mode];
      const alias = value && typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS";
      if (alias && (!("id" in value) || typeof value.id !== "string" || !value.id)) return;
      if (!alias && !["string", "boolean", "number"].includes(typeof value) && !(value && typeof value === "object" && "r" in value && "g" in value && "b" in value)) return;
      return {
        collectionId: proof.collection.id,
        collectionKey: proof.collection.key,
        referencedVariableIds: alias ? [value.id] : []
      };
    };
    let nextUsage = 0;
    await Promise.all(Array.from({ length: identityOnly ? 0 : Math.min(6, entries.length) }, async () => {
      while (nextUsage < entries.length) {
        const entry = entries[nextUsage++];
        usageEvidence.set(entry.node.id, await captureHostVariableUsage(entry.node, resolveBindingCollection));
      }
    }));
    const anatomy = entries.map((entry, index) => {
      var _a, _b;
      const childIds = entry.childIndexes.map((index2) => `preview:${index2}`);
      if (identityOnly) {
        const component = {};
        const identity = identities.get(entry.node.id), sourceIdentity = sourceIdentities.get(entry.node.id);
        if (identity) component.identity = identity;
        if (sourceIdentity) component.sourceIdentity = sourceIdentity;
        return {
          id: `preview:${index}`,
          figmaNodeId: entry.figmaNodeId,
          parentId: entry.parentIndex === null ? null : `preview:${entry.parentIndex}`,
          name: entry.name,
          type: entry.type,
          path: entry.path,
          semanticRole: entry.role,
          visible: entry.node.visible,
          order: index,
          depth: entry.depth,
          childIds,
          properties: { component },
          unknownFacts: []
        };
      }
      const supplemental = captureSupplementalFacts(entry.node, figma.mixed);
      const modeFacts = captureResolvedVariableModes(entry.node.resolvedVariableModes || {}, resolvedCollections);
      const properties = {
        layout: layoutFacts(entry.node),
        appearance: appearanceFacts(entry.node),
        variable: { bindings: variableBindings(entry.node), modes: modeFacts.modes, modeCatalog: modeFacts.modeCatalog },
        hostVariableUsageV1: usageEvidence.get(entry.node.id),
        component: componentFacts(entry.node, identities.get(entry.node.id), sourceIdentities.get(entry.node.id)),
        text: { ...textFacts(entry.node), ...supplemental.text },
        ...styleEvidence.has(entry.node.id) ? { textStyleEvidenceV1: styleEvidence.get(entry.node.id) } : {},
        ...fillEvidence.has(entry.node.id) ? { textFillEvidenceV1: fillEvidence.get(entry.node.id) } : {},
        parent: supplemental.parent,
        propertyActivityV1: capturePropertyActivity(entry.node),
        bounds: {
          x: (_a = finite2(entry.node.x)) != null ? _a : 0,
          y: (_b = finite2(entry.node.y)) != null ? _b : 0,
          ...intrinsicBounds(entry.node)
        },
        resolvedModes: { ...entry.node.resolvedVariableModes }
      };
      return {
        id: `preview:${index}`,
        figmaNodeId: entry.figmaNodeId,
        parentId: entry.parentIndex === null ? null : `preview:${entry.parentIndex}`,
        name: entry.name,
        type: entry.type,
        path: entry.path,
        semanticRole: entry.role,
        visible: entry.node.visible,
        order: index,
        depth: entry.depth,
        childIds,
        properties,
        unknownFacts: [...supplemental.unknownFacts, ...modeFacts.unknownFacts]
      };
    });
    const relations = {};
    if (projection === "full") roleToId.forEach((id, role) => {
      relations[role] = id;
    });
    const nodes = anatomy.map((entry) => {
      const facts = entry.properties;
      if (projection !== "full") return {
        id: entry.id,
        parentId: entry.parentId,
        childIds: entry.childIds,
        name: entry.name,
        type: entry.type,
        semantic: { role: entry.semanticRole, path: entry.path },
        component: facts.component || {}
      };
      return {
        id: entry.id,
        parentId: entry.parentId,
        childIds: entry.childIds,
        order: entry.order,
        name: entry.name,
        type: entry.type,
        visible: entry.visible,
        semantic: { role: entry.semanticRole, path: entry.path },
        component: facts.component || {},
        layout: facts.layout || {},
        appearance: facts.appearance || {},
        variable: facts.variable || {},
        hostVariableUsageV1: facts.hostVariableUsageV1,
        text: facts.text || {},
        ...facts.textStyleEvidenceV1 ? { textStyleEvidenceV1: facts.textStyleEvidenceV1 } : {},
        ...facts.textFillEvidenceV1 ? { textFillEvidenceV1: facts.textFillEvidenceV1 } : {},
        parent: facts.parent || {},
        propertyActivityV1: facts.propertyActivityV1 || {},
        bounds: facts.bounds || {},
        resolvedModes: facts.resolvedModes || {},
        baseline: {
          effective: {
            layout: facts.layout || {},
            appearance: facts.appearance || {},
            variable: facts.variable || {},
            component: facts.component || {},
            text: facts.text || {},
            visible: entry.visible,
            bounds: intrinsicBounds(facts.bounds),
            propertyActivityV1: facts.propertyActivityV1 || {}
          }
        },
        relations,
        unknownFacts: entry.unknownFacts
      };
    });
    for (const entry of entries) if (entry.node.id !== entry.figmaNodeId || entry.node.type !== entry.type || entry.node.name !== entry.name) {
      topology.issues.push({ kind: "identity-changed", nodeId: entry.figmaNodeId, path: entry.path });
      topology.complete = false;
    }
    const result = {
      anatomy,
      snapshot: {
        schemaVersion: "apollo.predicate-snapshot.v2",
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        source: {
          ...identityOnly ? {} : { geometryCaptureVersion: 1, gradientPaintCaptureVersion: 1, propertyReferenceIdentityVersion: 1 },
          instanceIdentityVersion: 1,
          instanceSourceIdentityVersion: 1,
          occurrenceAddressVersion: 1,
          instanceSourceIdentityCapture: { version: 1, owners: sourceCapture },
          fileKey: figma.fileKey,
          fileName: figma.root.name,
          pageId: (() => {
            let parent = root.parent;
            while (parent && parent.type !== "PAGE") parent = parent.parent;
            return (parent == null ? void 0 : parent.id) || figma.currentPage.id;
          })(),
          rootNodeId: root.id,
          truncated: !topology.complete,
          captureTopology: { version: 1, complete: topology.complete, limitReached: topology.limitReached, issues: topology.issues },
          ...omissions.length && captureScope ? { nativeSlotCaptureScope: { version: 1, manualSourceHash: captureScope.manualSourceHash, omissions } } : {},
          nodeLimit: 500
        },
        selection: anatomy.length ? [anatomy[0].id] : [],
        context: { platform, modes, unknownFacts: [] },
        nodes
      }
    };
    {
      const paths = snapshotPaths(result.snapshot);
      const nodesById = new Map(nodes.map((node) => [node.id, node]));
      if (paths) for (const entry of anatomy) {
        const path = paths.get(entry.id);
        if (path !== void 0) {
          entry.path = [root.name, path].filter(Boolean).join(" / ");
          const node = nodesById.get(entry.id);
          node.semantic.path = entry.path;
        }
      }
    }
    const nativeInstances = /* @__PURE__ */ new Map();
    if (topology.complete) for (const entry of entries) {
      if (entry.observedChildren) {
        let children;
        try {
          children = "children" in entry.node ? Array.from(entry.node.children) : [];
        } catch {
          topology.complete = false;
          topology.issues.push({ kind: "unreadable-node", nodeId: entry.figmaNodeId, path: entry.path });
          result.snapshot.source.truncated = true;
          result.snapshot.source.captureTopology.complete = false;
          break;
        }
        if (children.length !== entry.childIndexes.length || children.some((child, index) => child.id !== entries[entry.childIndexes[index]].figmaNodeId)) {
          topology.complete = false;
          topology.issues.push({ kind: "identity-changed", nodeId: entry.figmaNodeId, path: entry.path });
          result.snapshot.source.truncated = true;
          result.snapshot.source.captureTopology.complete = false;
          break;
        }
      }
      if (entry.node.type === "INSTANCE") nativeInstances.set(entry.figmaNodeId, entry.node);
    }
    if (!topology.complete) nativeInstances.clear();
    return { anatomy: result.anatomy, snapshot: result.snapshot, nativeInstances };
  }
  async function collectNodes(root, platform, modes, captureScope) {
    const result = await collectSceneNodes(root, platform, modes, captureScope);
    return { anatomy: result.anatomy, snapshot: result.snapshot };
  }
  async function applyModes(instance, modes) {
    const warnings = [];
    for (const [collectionId, modeId] of Object.entries(modes)) {
      try {
        const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
        if (collection) instance.setExplicitVariableModeForCollection(collection, modeId);
        else warnings.push(`\u041A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u044F ${collectionId} \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430; mode ${modeId} \u043D\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u0451\u043D \u043A reference instance.`);
      } catch {
        warnings.push(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C mode ${modeId} \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438 ${collectionId} \u043A reference instance.`);
      }
    }
    return warnings;
  }
  function referenceProperties(subject, reference, allowedNames) {
    const allowed = new Set(allowedNames);
    const usesRootSwap = (node, property) => {
      var _a;
      if (node.type === "INSTANCE") return ((_a = node.componentPropertyReferences) == null ? void 0 : _a.mainComponent) === property;
      return "children" in node && node.children.some((child) => usesRootSwap(child, property));
    };
    const result = {};
    for (const [name, property] of Object.entries(subject.componentProperties)) {
      const referenceProperty = reference.componentProperties[name];
      if (!referenceProperty) continue;
      const isVariant = property.type === "VARIANT";
      if (!isVariant && !allowed.has(name)) continue;
      if (property.type === "INSTANCE_SWAP" && !subject.children.some((child) => usesRootSwap(child, name))) continue;
      if (typeof property.value === "string" || typeof property.value === "boolean") {
        result[name] = property.value;
      }
    }
    return result;
  }
  async function instanceAtPath(root, path, expected) {
    var _a, _b, _c, _d, _e;
    if (path.split(" / ").some((segment) => segment.startsWith("@local:") || segment.startsWith("@catalog:"))) return void 0;
    const priorScope = (_a = expected.source) == null ? void 0 : _a.nativeSlotCaptureScope;
    const captureScope = priorScope ? {
      manualSourceHash: priorScope.manualSourceHash,
      boundaries: priorScope.omissions.map((entry) => {
        var _a2;
        return {
          targetId: entry.targetId,
          property: entry.property,
          path: entry.path,
          representationId: ((_a2 = expected.source) == null ? void 0 : _a2.representationId) || ""
        };
      })
    } : void 0;
    const current = await collectSceneNodes(root, expected.context.platform, expected.context.modes, captureScope, "identity");
    if (((_b = expected.source) == null ? void 0 : _b.occurrenceAddressVersion) !== 1 && current.snapshot.source) delete current.snapshot.source.occurrenceAddressVersion;
    const paths = snapshotPaths(current.snapshot), expectedPaths = snapshotPaths(expected);
    if (!paths || !expectedPaths) return void 0;
    let node = current.snapshot.nodes.find((n) => paths.get(String(n.id)) === path);
    let prior = expected.nodes.find((n) => expectedPaths.get(String(n.id)) === path);
    if (!node || !prior || node.type !== "INSTANCE" || prior.type !== "INSTANCE") return void 0;
    const locator = (_c = current.anatomy.find((n) => n.id === node.id)) == null ? void 0 : _c.figmaNodeId;
    const instance = locator ? current.nativeInstances.get(locator) : void 0;
    while (node && prior) {
      if (node.type !== prior.type) return void 0;
      const component = node.component;
      const previous = prior.component;
      for (const field of ["componentKey", "mainComponentId", "componentSetKey"]) {
        if (((_d = previous == null ? void 0 : previous.identity) == null ? void 0 : _d[field]) !== ((_e = component == null ? void 0 : component.identity) == null ? void 0 : _e[field])) return void 0;
      }
      const source = previous == null ? void 0 : previous.sourceIdentity, fresh = component == null ? void 0 : component.sourceIdentity;
      if (source && (!fresh || source.version !== fresh.version || source.ownerComponentKey !== fresh.ownerComponentKey || source.ownerMainComponentId !== fresh.ownerMainComponentId || source.sourceNodeId !== fresh.sourceNodeId)) return void 0;
      if (node.parentId === null || prior.parentId === null) return node.parentId === prior.parentId ? instance : void 0;
      node = current.snapshot.nodes.find((n) => n.id === node.parentId);
      prior = expected.nodes.find((n) => n.id === prior.parentId);
    }
    return void 0;
  }
  async function captureInstanceContentReferences(subject, pristine, page, snapshot, base, modesReliable) {
    const attempts = [];
    snapshot.instanceContentReferences = { schemaVersion: "apollo.instance-content-references.v4", hostContextVariableModesVersion: 1, base, attempts };
    const boundaries = planInstanceContentReferences(snapshot);
    let captured = 0;
    const capture = async (boundaries2, contextHost, contextSnapshot, parentBoundaryNodeId) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      for (const boundary of boundaries2) {
        const attempt = { boundaryNodeId: boundary.nodeId, ...parentBoundaryNodeId ? { parentBoundaryNodeId } : {} };
        attempts.push(attempt);
        if (!modesReliable) {
          attempt.failure = "variable-modes-unavailable";
          continue;
        }
        const variant = boundary.reason === "component-variant-changed" && Boolean(boundary.componentSetKey);
        if (!variant && (boundary.reason !== "instance-swap" || !boundary.property || boundary.ownerPath === void 0)) {
          attempt.failure = "explicit-swap-port-required";
          continue;
        }
        if (captured++ >= INSTANCE_CONTENT_REFERENCE_LIMIT) {
          attempt.failure = "reference-capture-limit";
          continue;
        }
        let host;
        try {
          const actual = await instanceAtPath(subject, boundary.actualPath, snapshot);
          const main = actual && await actual.getMainComponentAsync();
          if (!main || main.key !== boundary.actualComponentKey) {
            attempt.failure = "replacement-component-unavailable";
            continue;
          }
          host = contextHost.clone();
          page.appendChild(host);
          const consumer = await instanceAtPath(host, boundary.referencePath, contextSnapshot);
          const before = consumer && await consumer.getMainComponentAsync();
          const owner = boundary.ownerPath !== void 0 ? await instanceAtPath(host, boundary.ownerPath, contextSnapshot) : void 0;
          const provenControl = variant ? ((_a = before == null ? void 0 : before.parent) == null ? void 0 : _a.type) === "COMPONENT_SET" && ((_b = main.parent) == null ? void 0 : _b.type) === "COMPONENT_SET" && before.parent.key === boundary.componentSetKey && main.parent.key === boundary.componentSetKey : owner && boundary.property && ((_c = consumer == null ? void 0 : consumer.componentPropertyReferences) == null ? void 0 : _c.mainComponent) === boundary.property && ((_d = owner.componentProperties[boundary.property]) == null ? void 0 : _d.type) === "INSTANCE_SWAP" && ((_e = owner.componentProperties[boundary.property]) == null ? void 0 : _e.value) === (before == null ? void 0 : before.id);
          if (!consumer || !before || before.key !== boundary.referenceComponentKey || !provenControl) {
            attempt.failure = "replacement-identity-or-port-mismatch";
            continue;
          }
          if (variant) {
            const properties = main.variantProperties;
            if (!properties || !Object.keys(properties).length || Object.entries(properties).some(([name, value]) => {
              var _a2;
              return typeof value !== "string" || ((_a2 = consumer.componentProperties[name]) == null ? void 0 : _a2.type) !== "VARIANT";
            })) {
              attempt.failure = "variant-properties-unavailable";
              continue;
            }
            consumer.setProperties(properties);
            const selected = await consumer.getMainComponentAsync();
            if (!selected || selected.key !== main.key || ((_f = selected.parent) == null ? void 0 : _f.type) !== "COMPONENT_SET" || selected.parent.key !== boundary.componentSetKey) {
              attempt.failure = "variant-switch-identity-mismatch";
              continue;
            }
            attempt.strategy = "pristine-host-variant-properties";
          } else {
            consumer.mainComponent = main;
          }
          const reference = (await collectNodes(host, snapshot.context.platform, snapshot.context.modes)).snapshot;
          configureInstanceMainAliases(reference, ((_g = snapshot.source) == null ? void 0 : _g.instanceMainComponentAliasesVersion) === 1);
          if (reference.source) {
            reference.source.componentKey = (_h = base.source) == null ? void 0 : _h.componentKey;
            reference.source.componentSetKey = (_i = base.source) == null ? void 0 : _i.componentSetKey;
          }
          attempt.reference = reference;
          materializeInstanceContentReferences(snapshot);
          if ((_j = snapshot.instanceContentResults) == null ? void 0 : _j.some((r) => r.boundaryNodeId === boundary.nodeId && r.lineageProven)) {
            await capture(planNestedInstanceContentReferences(snapshot, reference, boundary), host, reference, boundary.nodeId);
          }
        } catch {
          attempt.failure = "reference-capture-failed";
        } finally {
          host == null ? void 0 : host.remove();
        }
      }
    };
    await capture(boundaries, pristine, base);
    materializeInstanceContentReferences(snapshot);
  }
  async function captureComponentDependencies(anatomy, snapshot, temporaryPage, acceptedKeys = [], directChildDependenciesVersion, instanceMainComponentAliasesVersion) {
    var _a, _b, _c;
    if (!acceptedKeys.length) return;
    snapshot.componentDependencyCaptures = [];
    const keys = new Set(acceptedKeys);
    const candidates = snapshot.nodes.filter((n) => !snapshot.selection.includes(String(n.id)) && n.type === "INSTANCE" && (() => {
      var _a2;
      const identity = (_a2 = n.component) == null ? void 0 : _a2.identity;
      return identity && (keys.has(identity.componentKey) || keys.has(identity.componentSetKey));
    })());
    for (const [index, node] of candidates.entries()) {
      const attempt = { nodeId: String(node.id) };
      snapshot.componentDependencyCaptures.push(attempt);
      if (index >= (directChildDependenciesVersion === 1 ? DIRECT_CHILD_DEPENDENCY_CAPTURE_LIMIT : COMPONENT_DEPENDENCY_CAPTURE_LIMIT)) {
        attempt.failure = "dependency-reference-capture-limit";
        continue;
      }
      let reference = null;
      let stage = "resolve-instance";
      try {
        const locator = (_a = anatomy.find((n) => n.id === node.id)) == null ? void 0 : _a.figmaNodeId;
        const instance = locator ? await figma.getNodeByIdAsync(locator) : null;
        if (!instance || instance.type !== "INSTANCE") {
          attempt.failure = "dependency-instance-unavailable";
          continue;
        }
        stage = "read-main-component";
        const main = await instance.getMainComponentAsync();
        if (!main) {
          attempt.failure = "dependency-main-component-unavailable";
          continue;
        }
        stage = "create-reference-instance";
        reference = main.createInstance();
        stage = "append-reference-instance";
        temporaryPage.appendChild(reference);
        stage = "read-variable-modes";
        const modes = Object.assign({}, instance.resolvedVariableModes);
        stage = "apply-variable-modes";
        const warnings = await applyModes(reference, modes);
        if (warnings.length) {
          attempt.failure = "dependency-variable-modes-unavailable";
          continue;
        }
        stage = "capture-actual";
        const actual = await collectNodes(instance, snapshot.context.platform, modes);
        stage = "capture-reference";
        const baseline = await collectNodes(reference, snapshot.context.platform, modes);
        const setKey = ((_b = main.parent) == null ? void 0 : _b.type) === "COMPONENT_SET" ? main.parent.key : "";
        for (const s of [actual.snapshot, baseline.snapshot]) if (s.source) {
          s.source.componentKey = main.key;
          s.source.componentSetKey = setKey;
        }
        configureInstanceMainAliases(actual.snapshot, instanceMainComponentAliasesVersion === 1);
        configureInstanceMainAliases(baseline.snapshot, instanceMainComponentAliasesVersion === 1);
        stage = "materialize-baseline";
        const materialized = materializeEffectiveBaseline(actual.snapshot, baseline.snapshot, true);
        stage = "capture-variant-reference";
        materialized.snapshot.variantReference = captureVariantReference(
          baseline.snapshot,
          main.key,
          setKey,
          Object.keys((((_c = main.parent) == null ? void 0 : _c.type) === "COMPONENT_SET" ? main.parent : main).componentPropertyDefinitions)
        );
        stage = "capture-nested-reference";
        await captureInstanceContentReferences(instance, reference, temporaryPage, materialized.snapshot, baseline.snapshot, true);
        stage = "map-node-ids";
        attempt.nodeMap = Object.fromEntries(actual.anatomy.map((local) => {
          var _a2;
          return [local.id, ((_a2 = anatomy.find((host) => host.figmaNodeId === local.figmaNodeId)) == null ? void 0 : _a2.id) || ""];
        }));
        attempt.snapshot = materialized.snapshot;
      } catch (error) {
        attempt.failure = "dependency-reference-capture-failed";
        attempt.failureDetails = dependencyCaptureFailureDetails(stage, error);
      } finally {
        reference == null ? void 0 : reference.remove();
      }
    }
  }
  async function exportPreview(node) {
    const longest = Math.max(node.width, node.height, 1);
    const scale = Math.min(2, 1600 / longest);
    const bytes = await node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: scale }
    });
    return {
      dataUrl: `data:image/png;base64,${figma.base64Encode(bytes)}`,
      width: node.width,
      height: node.height
    };
  }
  async function captureInstanceAudit(subject, message) {
    var _a, _b, _c, _d, _e;
    const timed = async (stage, work) => {
      var _a2;
      const started = Date.now();
      try {
        return await work();
      } finally {
        (_a2 = message.onTiming) == null ? void 0 : _a2.call(message, stage, Math.max(0, Date.now() - started));
      }
    };
    if (message.expectedRootNodeId && message.expectedRootNodeId !== subject.id) {
      throw new Error("\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u043E\u0441\u044C. \u0417\u0430\u0434\u0430\u0439\u0442\u0435 \u043E\u0436\u0438\u0434\u0430\u0435\u043C\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0434\u043B\u044F \u043D\u043E\u0432\u043E\u0433\u043E instance \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443.");
    }
    const temporalStart = message.captureTransitionContext ? captureTransitionContext(subject) : void 0;
    const temporalSequence = temporalStart ? ++transitionSequence : 0;
    const main = await subject.getMainComponentAsync();
    if (!main) throw new Error("\u0423 \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u043E\u0433\u043E instance \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D main component.");
    const acceptedKeys = new Set([message.componentKey, ...message.acceptedComponentKeys].filter(Boolean));
    const componentSetKey = ((_a = main.parent) == null ? void 0 : _a.type) === "COMPONENT_SET" ? main.parent.key : "";
    const representation = message.representations === void 0 ? void 0 : resolveCaptureRepresentation(
      message.representations,
      main.key,
      componentSetKey
    );
    if (!representation && !matchesComponentIdentity(main.key, componentSetKey, Array.from(acceptedKeys))) {
      throw new Error("\u041A\u043B\u044E\u0447 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u043E\u043C \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0435. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u0439 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440 \u0438\u043B\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0435\u0433\u043E \u043F\u0430\u043A\u0435\u0442.");
    }
    const platform = (representation == null ? void 0 : representation.platform) || message.platform;
    let temporaryPage = null;
    let reference = null;
    try {
      temporaryPage = figma.createPage();
      temporaryPage.name = "__Apollo_IndependentReference__";
      reference = main.createInstance();
      temporaryPage.appendChild(reference);
      const compatible = referenceProperties(subject, reference, message.allowedComponentProperties);
      if (Object.keys(compatible).length) reference.setProperties(compatible);
      const modes = { ...subject.resolvedVariableModes };
      const warnings = await applyModes(reference, modes);
      const baseline = await timed("reference", () => collectNodes(reference, platform, modes));
      if (baseline.snapshot.source) {
        baseline.snapshot.source.componentKey = main.key;
        baseline.snapshot.source.componentSetKey = componentSetKey;
        if (representation) baseline.snapshot.source.representationId = representation.id;
      }
      const independentReference = captureVariantReference(
        baseline.snapshot,
        main.key,
        componentSetKey,
        Object.keys((((_b = main.parent) == null ? void 0 : _b.type) === "COMPONENT_SET" ? main.parent : main).componentPropertyDefinitions)
      );
      const requestedPlan = message.nativeSlotCapturePlan;
      const boundaries = (requestedPlan == null ? void 0 : requestedPlan.manualSourceHash) === message.manualSourceHash ? confirmedNativeSlotCaptureBoundaries(requestedPlan, independentReference, (representation == null ? void 0 : representation.id) || "", main.key, componentSetKey) : [];
      const actual = await timed("actual", () => collectNodes(subject, platform, modes, boundaries.length ? { manualSourceHash: message.manualSourceHash, boundaries } : void 0));
      if (actual.snapshot.source) {
        actual.snapshot.source.componentKey = main.key;
        actual.snapshot.source.componentSetKey = componentSetKey;
        if (representation) actual.snapshot.source.representationId = representation.id;
      }
      configureInstanceMainAliases(actual.snapshot, message.instanceMainComponentAliasesVersion === 1);
      configureInstanceMainAliases(baseline.snapshot, message.instanceMainComponentAliasesVersion === 1);
      const materialized = await timed("baseline", () => materializeEffectiveBaseline(actual.snapshot, baseline.snapshot, true));
      materialized.snapshot.variantReference = independentReference;
      await timed("content-references", () => captureInstanceContentReferences(subject, reference, temporaryPage, materialized.snapshot, baseline.snapshot, warnings.length === 0));
      await timed("dependencies", () => captureComponentDependencies(actual.anatomy, materialized.snapshot, temporaryPage, message.componentDependencyKeys, message.directChildDependenciesVersion, message.instanceMainComponentAliasesVersion));
      materialized.unmatchedNodeIds = materialized.snapshot.nodes.filter((node) => {
        var _a2;
        return ((_a2 = node.baselineProvenance) == null ? void 0 : _a2.status) !== "matched";
      }).map((node) => String(node.id));
      materialized.matchedNodes = materialized.snapshot.nodes.length - materialized.unmatchedNodeIds.length;
      const preview = message.includePreview === false ? { dataUrl: "", width: subject.width, height: subject.height } : await exportPreview(subject);
      if (temporalStart) {
        const end = captureTransitionContext(subject), complete = temporalStart.complete && end.complete && temporalStart.fingerprint === end.fingerprint;
        materialized.snapshot.transitionCapture = {
          schemaVersion: "apollo.transition-capture.v1",
          sessionId: transitionSessionId,
          sequence: temporalSequence,
          manualSourceHash: message.manualSourceHash,
          externalContext: temporalStart.context,
          complete,
          ...!complete ? { reason: temporalStart.reason || end.reason || "changed-during-capture" } : {}
        };
      }
      if (materialized.unmatchedNodeIds.length) {
        warnings.push(`${materialized.unmatchedNodeIds.length} \u0443\u0437\u043B\u043E\u0432 instance \u043D\u0435 \u0441\u043E\u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u044B \u0441 reference baseline.`);
      }
      if ((_d = (_c = actual.snapshot.source) == null ? void 0 : _c.captureTopology) == null ? void 0 : _d.issues.length) warnings.push("\u0417\u0430\u0445\u0432\u0430\u0442 \u0434\u0435\u0440\u0435\u0432\u0430 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D: \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u044B\u0435/\u043F\u0440\u043E\u0442\u0438\u0432\u043E\u0440\u0435\u0447\u0438\u0432\u044B\u0435 Figma ID \u0438\u043B\u0438 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u0443\u0437\u043B\u044B. \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435\u043F\u043E\u043B\u043D\u0430\u044F.");
      if ((_e = actual.snapshot.source) == null ? void 0 : _e.nativeSlotCaptureScope) warnings.push("\u0412\u043D\u0435\u0448\u043D\u0435\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 native SLOT \u043D\u0435 \u043E\u0431\u0445\u043E\u0434\u0438\u043B\u043E\u0441\u044C: \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u044B \u0442\u043E\u043B\u044C\u043A\u043E host \u0438 \u0433\u0440\u0430\u043D\u0438\u0446\u0430 \u0441\u043B\u043E\u0442\u0430. \u041F\u0440\u0430\u0432\u0438\u043B\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0433\u043E \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u043B\u0438\u0441\u044C.");
      return {
        componentKey: main.key,
        anatomy: actual.anatomy,
        snapshot: materialized.snapshot,
        imageDataUrl: preview.dataUrl,
        width: preview.width,
        height: preview.height,
        matchedBaselineNodes: materialized.matchedNodes,
        unmatchedBaselineNodeIds: materialized.unmatchedNodeIds,
        warnings,
        manualSourceHash: message.manualSourceHash
      };
    } finally {
      reference == null ? void 0 : reference.remove();
      temporaryPage == null ? void 0 : temporaryPage.remove();
    }
  }

  // src/code.ts
  var EDITOR_SESSION_STORAGE_KEY = "component-contract-editor.session.v1";
  var sessionWriteQueue = Promise.resolve();
  figma.skipInvisibleInstanceChildren = false;
  figma.showUI(__html__, {
    width: 1200,
    height: 720,
    themeColors: true
  });
  function post(message) {
    figma.ui.postMessage(message);
  }
  function saveSession(message) {
    sessionWriteQueue = sessionWriteQueue.catch(() => void 0).then(async () => {
      await figma.clientStorage.setAsync(EDITOR_SESSION_STORAGE_KEY, message.session);
    });
    return sessionWriteQueue;
  }
  async function mainComponentKey(node) {
    if (node.type === "COMPONENT") return node.key;
    if (node.type !== "INSTANCE") return "";
    const main = await node.getMainComponentAsync();
    return (main == null ? void 0 : main.key) || "";
  }
  function propertyValues(instance) {
    const result = {};
    for (const [name, property] of Object.entries(instance.componentProperties)) {
      if (typeof property.value === "string" || typeof property.value === "boolean") result[name] = property.value;
    }
    return result;
  }
  function collectVariableIds(value, result) {
    if (Array.isArray(value)) {
      value.forEach((entry) => collectVariableIds(entry, result));
      return;
    }
    if (!value || typeof value !== "object") return;
    const candidate = value;
    if (candidate.type === "VARIABLE_ALIAS" && typeof candidate.id === "string") {
      result.add(candidate.id);
      return;
    }
    Object.values(candidate).forEach((entry) => collectVariableIds(entry, result));
  }
  async function variableModeCollections(root) {
    const variableIds = /* @__PURE__ */ new Set();
    const resolvedVariableModes = { ...root.resolvedVariableModes };
    let visited = 0;
    const visit = (node) => {
      if (visited >= 500) return;
      visited += 1;
      collectVariableIds(node.boundVariables, variableIds);
      if ("children" in node) node.children.forEach(visit);
    };
    visit(root);
    const discovered = await Promise.all(Array.from(variableIds).map(async (variableId) => {
      try {
        const variable = await figma.variables.getVariableByIdAsync(variableId);
        if (!variable) return null;
        return await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);
      } catch {
        return null;
      }
    }));
    const collections = /* @__PURE__ */ new Map();
    discovered.forEach((collection) => {
      if (collection) collections.set(collection.id, collection);
    });
    const resolvedCollections = await Promise.all(Object.keys(resolvedVariableModes).map(async (id) => {
      try {
        return await figma.variables.getVariableCollectionByIdAsync(id);
      } catch {
        return null;
      }
    }));
    resolvedCollections.forEach((collection) => {
      if (collection) collections.set(collection.id, collection);
    });
    return Array.from(collections.values()).filter(
      (collection) => typeof collection.name === "string" && Array.isArray(collection.modes) && collection.modes.every((mode) => typeof mode.modeId === "string" && typeof mode.name === "string")
    ).map((collection) => ({
      collectionId: collection.id,
      collectionKey: collection.key,
      collectionName: collection.name,
      activeModeId: resolvedVariableModes[collection.id] || collection.defaultModeId,
      modes: collection.modes.map((mode) => ({ modeId: mode.modeId, name: mode.name }))
    })).sort((left, right) => left.collectionName.localeCompare(right.collectionName));
  }
  async function renderPreview(message) {
    var _a, _b, _c, _d;
    if (!message.componentKey) throw new Error("componentKey is required for live preview.");
    let temporaryPage = null;
    let instance = null;
    try {
      const component = await figma.importComponentByKeyAsync(message.componentKey);
      temporaryPage = figma.createPage();
      temporaryPage.name = "__ComponentContractEditor_Preview__";
      instance = component.createInstance();
      temporaryPage.appendChild(instance);
      const compatibleProperties = {};
      for (const [name, value] of Object.entries(message.variantProperties)) {
        if (Object.prototype.hasOwnProperty.call(instance.componentProperties, name)) compatibleProperties[name] = value;
      }
      if (Object.keys(compatibleProperties).length) instance.setProperties(compatibleProperties);
      for (const [collectionId, modeId] of Object.entries(message.modes)) {
        const collection = await figma.variables.getVariableCollectionByIdAsync(collectionId);
        if (collection) instance.setExplicitVariableModeForCollection(collection, modeId);
      }
      const preview = await exportPreview(instance);
      const modeLookup = await Promise.race([
        variableModeCollections(instance).then((value) => ({ value, timedOut: false })),
        new Promise((resolve) => {
          setTimeout(() => resolve({ value: [], timedOut: true }), 3e3);
        })
      ]);
      const variableModes = modeLookup.value;
      const resolvedModes = Object.fromEntries(variableModes.map((collection) => [
        collection.collectionId,
        message.modes[collection.collectionId] || collection.activeModeId
      ]));
      const renderedMain = await instance.getMainComponentAsync();
      const representation = message.representations === void 0 ? void 0 : resolveCaptureRepresentation(
        message.representations,
        (renderedMain == null ? void 0 : renderedMain.key) || "",
        ((_a = renderedMain == null ? void 0 : renderedMain.parent) == null ? void 0 : _a.type) === "COMPONENT_SET" ? renderedMain.parent.key : ""
      );
      const collected = await collectNodes(instance, (representation == null ? void 0 : representation.platform) || message.platform, resolvedModes);
      if (collected.snapshot.source) {
        collected.snapshot.source.componentKey = renderedMain == null ? void 0 : renderedMain.key;
        collected.snapshot.source.componentSetKey = ((_b = renderedMain == null ? void 0 : renderedMain.parent) == null ? void 0 : _b.type) === "COMPONENT_SET" ? renderedMain.parent.key : void 0;
        if (representation) collected.snapshot.source.representationId = representation.id;
      }
      if (renderedMain) collected.snapshot.variantReference = captureVariantReference(
        collected.snapshot,
        renderedMain.key,
        ((_c = renderedMain.parent) == null ? void 0 : _c.type) === "COMPONENT_SET" ? renderedMain.parent.key : "",
        Object.keys((((_d = renderedMain.parent) == null ? void 0 : _d.type) === "COMPONENT_SET" ? renderedMain.parent : renderedMain).componentPropertyDefinitions)
      );
      configureInstanceMainAliases(collected.snapshot, message.instanceMainComponentAliasesVersion === 1);
      await captureComponentDependencies(collected.anatomy, collected.snapshot, temporaryPage, message.componentDependencyKeys, message.directChildDependenciesVersion, message.instanceMainComponentAliasesVersion);
      post({
        type: "preview-result",
        requestId: message.requestId,
        imageDataUrl: preview.dataUrl,
        width: preview.width,
        height: preview.height,
        anatomy: collected.anatomy,
        snapshot: collected.snapshot,
        componentProperties: propertyValues(instance),
        variableModes,
        warnings: [
          ...collected.anatomy.length >= 500 ? ["Preview anatomy was capped at 500 nodes."] : [],
          ...modeLookup.timedOut ? ["Variable mode discovery timed out; preview was rendered without mode controls."] : []
        ]
      });
    } finally {
      instance == null ? void 0 : instance.remove();
      temporaryPage == null ? void 0 : temporaryPage.remove();
    }
  }
  async function captureSelection(requestId) {
    const node = figma.currentPage.selection[0];
    if (!node || !["INSTANCE", "COMPONENT"].includes(node.type)) {
      throw new Error("Select one component instance or main component in Figma.");
    }
    const componentKey = await mainComponentKey(node);
    const collected = await collectNodes(node, "universal", {});
    const preview = await exportPreview(node);
    post({
      type: "selection-result",
      requestId,
      identity: {
        componentId: `manual.${slug(node.name)}`,
        familyId: `manual.${slug(node.name)}`,
        contractId: `manual.${slug(node.name)}`,
        family: node.name.replace(/^\[[DMT]\]\s*/, ""),
        layer: "unknown",
        library: "Current Figma file",
        platform: "universal",
        platforms: [],
        lifecycle: "active",
        componentKey
      },
      anatomy: collected.anatomy,
      snapshot: collected.snapshot,
      imageDataUrl: preview.dataUrl,
      width: preview.width,
      height: preview.height
    });
  }
  function selectedInstance() {
    const selection = figma.currentPage.selection;
    if (selection.length !== 1 || selection[0].type !== "INSTANCE") {
      throw new Error("\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u043E\u0432\u043D\u043E \u043E\u0434\u0438\u043D instance \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u0432 Figma. Main component \u0437\u0434\u0435\u0441\u044C \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442\u0441\u044F.");
    }
    return selection[0];
  }
  async function testSelection(message) {
    const output = await captureInstanceAudit(selectedInstance(), message);
    post(Object.assign({ type: "selection-test-result", requestId: message.requestId }, output));
  }
  function postSelectionAvailability() {
    const selection = figma.currentPage.selection;
    post({
      type: "selection-availability",
      selectedRootNodeId: selection.length === 1 && selection[0].type === "INSTANCE" ? selection[0].id : "",
      selectionAvailable: selection.length === 1 && ["INSTANCE", "COMPONENT"].includes(selection[0].type),
      instanceSelectionAvailable: selection.length === 1 && selection[0].type === "INSTANCE"
    });
  }
  figma.on("selectionchange", postSelectionAvailability);
  figma.ui.onmessage = async (message) => {
    try {
      if (message.type === "ready") {
        const selection = figma.currentPage.selection;
        post({
          type: "plugin-ready",
          selectedRootNodeId: selection.length === 1 && selection[0].type === "INSTANCE" ? selection[0].id : "",
          selectionAvailable: selection.length === 1 && ["INSTANCE", "COMPONENT"].includes(selection[0].type),
          instanceSelectionAvailable: selection.length === 1 && selection[0].type === "INSTANCE"
        });
        const session = await figma.clientStorage.getAsync(EDITOR_SESSION_STORAGE_KEY);
        post({ type: "session-restored", session: session || null });
        return;
      }
      if (message.type === "save-session") {
        await saveSession(message);
        return;
      }
      if (message.type === "render-preview") {
        await renderPreview(message);
        return;
      }
      if (message.type === "capture-selection") {
        await captureSelection(message.requestId);
        return;
      }
      if (message.type === "test-selection") await testSelection(message);
    } catch (error) {
      post({
        type: "plugin-error",
        requestId: "requestId" in message ? message.requestId : void 0,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  };
})();
//# sourceMappingURL=code.js.map
