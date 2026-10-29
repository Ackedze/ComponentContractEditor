"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../Apollo/packages/component-contract-core/vendor/sha256.ts
var sha256_exports = {};
__export(sha256_exports, {
  sha256Hex: () => sha256Hex
});
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
function sha256Hex(input) {
  const words = new Int32Array(64);
  const hash3 = new Int32Array(SHA256_INITIAL);
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
    let a = hash3[0], b = hash3[1], c = hash3[2], d = hash3[3], e = hash3[4], f = hash3[5], g = hash3[6], h = hash3[7];
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
    hash3[0] = hash3[0] + a | 0;
    hash3[1] = hash3[1] + b | 0;
    hash3[2] = hash3[2] + c | 0;
    hash3[3] = hash3[3] + d | 0;
    hash3[4] = hash3[4] + e | 0;
    hash3[5] = hash3[5] + f | 0;
    hash3[6] = hash3[6] + g | 0;
    hash3[7] = hash3[7] + h | 0;
  }
  return Array.from(hash3, (value) => (value >>> 0).toString(16).padStart(8, "0")).join("");
}
var SHA256_INITIAL, SHA256_ROUNDS, rightRotate;
var init_sha256 = __esm({
  "../Apollo/packages/component-contract-core/vendor/sha256.ts"() {
    "use strict";
    SHA256_INITIAL = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
    SHA256_ROUNDS = [
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
    rightRotate = (value, amount) => value >>> amount | value << 32 - amount;
  }
});

// ../Apollo/packages/component-contract-core/schemas/apollo-predicate-capabilities.v1.json
var require_apollo_predicate_capabilities_v1 = __commonJS({
  "../Apollo/packages/component-contract-core/schemas/apollo-predicate-capabilities.v1.json"(exports2, module2) {
    module2.exports = {
      schemaVersion: "apollo.predicate-capabilities.v1",
      documentType: "predicate-capability-registry",
      status: "mvp",
      semantics: {
        truthValues: ["true", "false", "unknown"],
        applicabilityValues: ["applicable", "not-applicable", "unknown"],
        unknownPolicy: "fail-closed",
        hiddenNodePolicy: "excluded-from-audit",
        orderingPolicy: "document-order-then-stable-id",
        verdictOwner: "predicate-engine",
        agentMayChangeVerdict: false
      },
      selectors: [
        "selection-root",
        "self",
        "direct-children",
        "descendants",
        "self-and-descendants",
        "parent",
        "ancestors",
        "siblings",
        "page-descendants",
        "where"
      ],
      factFamilies: [
        "node.identity",
        "node.type",
        "node.order",
        "node.bounds",
        "component.identity",
        "component.lifecycle",
        "component.properties",
        "baseline.effective",
        "override.actual",
        "layout.properties",
        "paint.state",
        "style.identity",
        "variable.binding",
        "text.content",
        "ownership.owner",
        "ownership.contour",
        "slot.identity",
        "page.context",
        "relation.measurement"
      ],
      predicates: [
        { id: "all", family: "logic", arity: "many" },
        { id: "any", family: "logic", arity: "many" },
        { id: "not", family: "logic", arity: "one" },
        { id: "exists", family: "value", arity: "one" },
        { id: "fact-present", family: "value", arity: "one" },
        { id: "equals", family: "value", arity: "two" },
        { id: "not-equals", family: "value", arity: "two" },
        { id: "one-of", family: "value", arity: "many" },
        { id: "none-of", family: "value", arity: "many" },
        { id: "compare", family: "value", arity: "two" },
        { id: "approximately-equals", family: "value", arity: "two" },
        { id: "between", family: "value", arity: "three" },
        { id: "string-length-between", family: "value", arity: "three" },
        { id: "matches", family: "value", arity: "two" },
        { id: "every", family: "collection", arity: "many" },
        { id: "some", family: "collection", arity: "many" },
        { id: "none", family: "collection", arity: "many" },
        { id: "count-between", family: "collection", arity: "three" },
        { id: "all-equal", family: "collection", arity: "many" },
        { id: "unique", family: "collection", arity: "many" },
        { id: "sequence-equals", family: "collection", arity: "many" },
        { id: "value-position", family: "collection", arity: "many" },
        { id: "direct-parent", family: "relation", arity: "two" },
        { id: "ancestor", family: "relation", arity: "two" },
        { id: "direct-child", family: "relation", arity: "two" },
        { id: "descendant", family: "relation", arity: "two" },
        { id: "before", family: "relation", arity: "two" },
        { id: "after", family: "relation", arity: "two" },
        { id: "adjacent", family: "relation", arity: "two" },
        { id: "contains", family: "geometry", arity: "two" },
        { id: "overlaps", family: "geometry", arity: "two" },
        { id: "aligned", family: "geometry", arity: "two" },
        { id: "distance", family: "geometry", arity: "three" },
        { id: "component-api-valid", family: "contract", arity: "one" },
        { id: "matches-effective-baseline", family: "contract", arity: "two" },
        { id: "binding-satisfies", family: "contract", arity: "two" },
        { id: "paint-state-satisfies", family: "contract", arity: "two" }
      ],
      gates: [
        "active-authority",
        "supported-capabilities",
        "complete-required-evidence",
        "unambiguous-component-identity",
        "no-authority-conflict"
      ],
      terminalClassifications: [
        "violation",
        "compliant",
        "allowed",
        "human-review",
        "not-applicable",
        "not-evaluable"
      ]
    };
  }
});

// ../Apollo/packages/component-contract-core/predicate/index.js
var require_predicate = __commonJS({
  "../Apollo/packages/component-contract-core/predicate/index.js"(exports2, module2) {
    "use strict";
    var { sha256Hex: sha256Hex2 } = (init_sha256(), __toCommonJS(sha256_exports));
    var crypto = { createHash: function(algorithm) {
      if (algorithm !== "sha256") throw new Error("Only SHA-256 is supported");
      let value = "";
      return {
        update: function(next) {
          value += String(next);
          return this;
        },
        digest: function(format) {
          if (format !== "hex") throw new Error("Only hex digest is supported");
          return sha256Hex2(value);
        }
      };
    } };
    var registry = require_apollo_predicate_capabilities_v1();
    var TRUTH = Object.freeze({ TRUE: "true", FALSE: "false", UNKNOWN: "unknown" });
    var APPLICABILITY = Object.freeze({
      APPLICABLE: "applicable",
      NOT_APPLICABLE: "not-applicable",
      UNKNOWN: "unknown"
    });
    var IMPLEMENTED_PREDICATES = /* @__PURE__ */ new Set([
      "all",
      "any",
      "not",
      "exists",
      "fact-present",
      "equals",
      "not-equals",
      "one-of",
      "none-of",
      "compare",
      "approximately-equals",
      "between",
      "string-length-between",
      "matches",
      "every",
      "some",
      "none",
      "count-between",
      "all-equal",
      "unique",
      "sequence-equals",
      "value-position",
      "direct-parent",
      "ancestor",
      "direct-child",
      "descendant",
      "before",
      "after",
      "adjacent",
      "contains",
      "overlaps",
      "aligned",
      "distance",
      "component-api-valid",
      "matches-effective-baseline",
      "binding-satisfies",
      "paint-state-satisfies"
    ]);
    var REGISTERED_PREDICATES = new Set(registry.predicates.map((predicate) => predicate.id));
    var SELECTOR_ORIGINS = /* @__PURE__ */ new Set(["selection-root", "self", "page-descendants"]);
    var QUERY_ORIGINS = /* @__PURE__ */ new Set(["subject", "selection-root", "page-descendants"]);
    var SELECTOR_TRAVERSALS = /* @__PURE__ */ new Set([
      "self",
      "direct-children",
      "descendants",
      "self-and-descendants",
      "parent",
      "ancestors",
      "siblings"
    ]);
    var DERIVE_OPERATORS = /* @__PURE__ */ new Set([
      "add",
      "subtract",
      "multiply",
      "divide",
      "length",
      "absolute-difference"
    ]);
    var CAUSAL_RELATIONS = /* @__PURE__ */ new Set([
      "same-subject",
      "same-focus",
      "descendant-subject"
    ]);
    function stableStringify2(value) {
      if (Array.isArray(value)) return `[${value.map(stableStringify2).join(",")}]`;
      if (value && typeof value === "object") {
        return `{${Object.keys(value).sort().map((key2) => `${JSON.stringify(key2)}:${stableStringify2(value[key2])}`).join(",")}}`;
      }
      return JSON.stringify(value);
    }
    function stableHash2(value) {
      return crypto.createHash("sha256").update(stableStringify2(value)).digest("hex");
    }
    function snapshotHash2(snapshot) {
      if (typeof snapshot.snapshotHash === "string" && snapshot.snapshotHash) return snapshot.snapshotHash;
      const normalized = { ...snapshot };
      delete normalized.generatedAt;
      delete normalized.snapshotHash;
      return stableHash2(normalized);
    }
    function capabilityError(code, message) {
      const error = new Error(message);
      error.code = code;
      return error;
    }
    function validateValueRef(valueRef, location) {
      if (!valueRef || typeof valueRef !== "object" || Array.isArray(valueRef)) {
        throw capabilityError("RULE_IR_INVALID", `${location} must be a value reference object`);
      }
      const kinds = ["literal", "fact", "query", "derive"].filter((key2) => Object.prototype.hasOwnProperty.call(valueRef, key2));
      if (kinds.length !== 1) {
        throw capabilityError(
          "RULE_IR_INVALID",
          `${location} must contain exactly one of literal, fact, query or derive`
        );
      }
      if (kinds[0] === "literal") return;
      if (kinds[0] === "fact") {
        if (typeof valueRef.fact !== "string" || !valueRef.fact) {
          throw capabilityError("RULE_IR_INVALID", `${location}.fact must be a non-empty string`);
        }
        return;
      }
      if (kinds[0] === "query") {
        const query = valueRef.query;
        if (!query || typeof query !== "object" || Array.isArray(query)) {
          throw capabilityError("RULE_IR_INVALID", `${location}.query must be an object`);
        }
        if (!QUERY_ORIGINS.has(query.from)) {
          throw capabilityError("SELECTOR_UNKNOWN", `Unknown query origin: ${query.from}`);
        }
        if (!SELECTOR_TRAVERSALS.has(query.traverse)) {
          throw capabilityError("SELECTOR_UNKNOWN", `Unknown query traversal: ${query.traverse}`);
        }
        for (const [index, expression] of (query.where || []).entries()) {
          validateExpressionCapabilities(expression, `${location}.query.where[${index}]`);
        }
        if (query.project !== void 0) {
          validateValueRef(query.project, `${location}.query.project`);
        }
        return;
      }
      const derive = valueRef.derive;
      if (!derive || typeof derive !== "object" || Array.isArray(derive)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.derive must be an object`);
      }
      if (!DERIVE_OPERATORS.has(derive.operator)) {
        throw capabilityError(
          "RULE_IR_INVALID",
          `${location}.derive.operator is unsupported: ${derive.operator}`
        );
      }
      if (!Array.isArray(derive.args) || derive.args.length === 0) {
        throw capabilityError("RULE_IR_INVALID", `${location}.derive.args must not be empty`);
      }
      if (derive.operator === "length" && derive.args.length !== 1) {
        throw capabilityError("RULE_IR_INVALID", `${location}.derive.length requires one arg`);
      }
      if (["subtract", "divide", "absolute-difference"].includes(derive.operator) && derive.args.length !== 2) {
        throw capabilityError(
          "RULE_IR_INVALID",
          `${location}.derive.${derive.operator} requires two args`
        );
      }
      for (const [index, value] of derive.args.entries()) {
        validateValueRef(value, `${location}.derive.args[${index}]`);
      }
    }
    function validateExpressionCapabilities(expression, location) {
      if (!expression || typeof expression !== "object" || Array.isArray(expression)) {
        throw capabilityError("RULE_IR_INVALID", `${location} must be an expression object`);
      }
      const predicate = expression.predicate;
      if (typeof predicate !== "string" || !predicate) {
        throw capabilityError("RULE_IR_INVALID", `${location}.predicate is required`);
      }
      if (!REGISTERED_PREDICATES.has(predicate)) {
        throw capabilityError("PREDICATE_UNKNOWN", `Unknown predicate: ${predicate}`);
      }
      if (!IMPLEMENTED_PREDICATES.has(predicate)) {
        throw capabilityError("PREDICATE_NOT_IMPLEMENTED", `Predicate is not implemented yet: ${predicate}`);
      }
      const args = expression.args || [];
      if (["all", "any"].includes(predicate) && (!Array.isArray(args) || args.length === 0)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.${predicate} requires at least one arg`);
      }
      if (predicate === "not" && (!Array.isArray(args) || args.length !== 1)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.not requires exactly one arg`);
      }
      if (!["all", "any", "not"].includes(predicate) && !expression.actual) {
        throw capabilityError("RULE_IR_INVALID", `${location}.${predicate}.actual is required`);
      }
      for (const key2 of ["actual", "expected", "target", "lower", "upper"]) {
        if (expression[key2] !== void 0) validateValueRef(expression[key2], `${location}.${key2}`);
      }
      if ([
        "equals",
        "not-equals",
        "one-of",
        "none-of",
        "compare",
        "approximately-equals",
        "matches",
        "every",
        "some",
        "none",
        "sequence-equals",
        "value-position",
        "direct-parent",
        "ancestor",
        "direct-child",
        "descendant",
        "before",
        "after",
        "adjacent",
        "matches-effective-baseline",
        "binding-satisfies",
        "paint-state-satisfies"
      ].includes(predicate) && !expression.expected) {
        throw capabilityError("RULE_IR_INVALID", `${location}.${predicate}.expected is required`);
      }
      if (predicate === "compare" && !["lt", "lte", "gt", "gte"].includes(expression.operator)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.compare.operator must be lt, lte, gt or gte`);
      }
      if (["between", "string-length-between", "count-between"].includes(predicate) && (!expression.lower || !expression.upper)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.between requires lower and upper values`);
      }
      if (expression.bounds && !["inclusive", "exclusive", "inclusive-lower", "inclusive-upper"].includes(expression.bounds)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.bounds is invalid`);
      }
      if (predicate === "value-position") {
        if (!Array.isArray(expression.positions) || expression.positions.length === 0) {
          throw capabilityError("RULE_IR_INVALID", `${location}.value-position.positions requires at least one position`);
        }
        if (expression.maxCount !== void 0 && (!Number.isInteger(expression.maxCount) || expression.maxCount < 0)) {
          throw capabilityError("RULE_IR_INVALID", `${location}.value-position.maxCount must be a non-negative integer`);
        }
      }
      if (["contains", "overlaps", "aligned", "distance"].includes(predicate) && !expression.target) {
        throw capabilityError("RULE_IR_INVALID", `${location}.${predicate}.target is required`);
      }
      if (predicate === "distance" && !expression.expected) {
        throw capabilityError("RULE_IR_INVALID", `${location}.distance.expected is required`);
      }
      if (predicate === "aligned" && !["left", "center-x", "right", "top", "center-y", "bottom"].includes(expression.axis)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.aligned.axis is invalid`);
      }
      if (predicate === "distance" && !["horizontal", "vertical", "euclidean"].includes(expression.axis)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.distance.axis is invalid`);
      }
      if (expression.tolerance !== void 0 && (typeof expression.tolerance !== "number" || !Number.isFinite(expression.tolerance) || expression.tolerance < 0)) {
        throw capabilityError("RULE_IR_INVALID", `${location}.tolerance must be a non-negative finite number`);
      }
      for (const [index, child] of args.entries()) {
        validateExpressionCapabilities(child, `${location}.args[${index}]`);
      }
    }
    function validateRule(rule) {
      if (!rule || rule.schemaVersion !== "apollo.rule-ir.v1") {
        throw capabilityError("RULE_IR_INVALID", "RuleIR schemaVersion must be apollo.rule-ir.v1");
      }
      if (!["require", "forbid", "allow"].includes(rule.effect)) {
        throw capabilityError("RULE_IR_INVALID", `Unsupported rule effect: ${rule.effect}`);
      }
      for (const [dimension, values] of Object.entries(rule.scope || {})) {
        if (!["platform", "product", "channel", "pageType"].includes(dimension) || values !== void 0 && (!Array.isArray(values) || values.some((value) => typeof value !== "string" || !value.trim()))) {
          throw capabilityError("RULE_IR_INVALID", `Unsupported or invalid scope dimension: ${dimension}`);
        }
      }
      if (!rule.select || !SELECTOR_ORIGINS.has(rule.select.from)) {
        throw capabilityError("SELECTOR_UNKNOWN", `Unknown selector origin: ${rule.select?.from}`);
      }
      if (!SELECTOR_TRAVERSALS.has(rule.select.traverse)) {
        throw capabilityError("SELECTOR_UNKNOWN", `Unknown selector traversal: ${rule.select.traverse}`);
      }
      validateExpressionCapabilities(rule.assert, "assert");
      if (rule.when) validateExpressionCapabilities(rule.when, "when");
      for (const [index, expression] of (rule.select?.where || []).entries()) {
        validateExpressionCapabilities(expression, `select.where[${index}]`);
      }
      if (rule.causality !== void 0 && rule.causality !== null) {
        if (typeof rule.causality !== "object" || Array.isArray(rule.causality) || !Array.isArray(rule.causality.causes) || !rule.causality.causes.length) {
          throw capabilityError(
            "RULE_IR_INVALID",
            "causality.causes must be a non-empty array"
          );
        }
        for (const [index, cause] of rule.causality.causes.entries()) {
          if (!cause || typeof cause !== "object" || Array.isArray(cause)) {
            throw capabilityError("RULE_IR_INVALID", `causality.causes[${index}] must be an object`);
          }
          if (typeof cause.ruleId !== "string" || !cause.ruleId) {
            throw capabilityError(
              "RULE_IR_INVALID",
              `causality.causes[${index}].ruleId must be a non-empty string`
            );
          }
          if (!CAUSAL_RELATIONS.has(cause.relation)) {
            throw capabilityError(
              "RULE_IR_INVALID",
              `causality.causes[${index}].relation is unsupported: ${cause.relation}`
            );
          }
          if (typeof cause.reason !== "string" || !cause.reason) {
            throw capabilityError(
              "RULE_IR_INVALID",
              `causality.causes[${index}].reason must be a non-empty string`
            );
          }
        }
      }
      return rule;
    }
    function unknownFactMatches(unknownFacts, factPath) {
      return (unknownFacts || []).some((unknownPath) => unknownPath === factPath || factPath.startsWith(`${unknownPath}.`));
    }
    function readObjectPath(root2, factPath) {
      let current = root2;
      for (const part of factPath.split(".")) {
        if (current === null || current === void 0 || typeof current !== "object") {
          return { state: "absent", value: void 0 };
        }
        if (!Object.prototype.hasOwnProperty.call(current, part)) {
          return { state: "absent", value: void 0 };
        }
        current = current[part];
      }
      return { state: "known", value: current };
    }
    function resolveQueryValue(query, subject, snapshot) {
      const index = nodeIndex(snapshot);
      const roots = query.from === "subject" ? [subject] : selectionRoots(snapshot, query.from, index);
      const candidates = roots.flatMap((root2) => traversalNodes(root2, query.traverse, index));
      const unique = new Map(candidates.map((node) => [node.id, node]));
      const nodes = Array.from(unique.values()).sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
      const selected = [];
      const factPaths = /* @__PURE__ */ new Set();
      for (const node of nodes) {
        let matches2 = true;
        for (const expression of query.where || []) {
          const trace = evaluateExpression(expression, node, snapshot);
          for (const factPath of trace.factPaths) factPaths.add(factPath);
          if (trace.truth === TRUTH.UNKNOWN) {
            return { state: "unknown", value: void 0, factPaths: Array.from(factPaths).sort() };
          }
          if (trace.truth === TRUTH.FALSE) {
            matches2 = false;
            break;
          }
        }
        if (!matches2) continue;
        if (query.project === void 0) {
          selected.push(node.id);
          continue;
        }
        const projected = resolveValue2(query.project, node, snapshot);
        for (const factPath of projected.factPaths) factPaths.add(factPath);
        if (projected.state !== "known") {
          return { state: "unknown", value: void 0, factPaths: Array.from(factPaths).sort() };
        }
        selected.push(projected.value);
      }
      return { state: "known", value: selected, factPaths: Array.from(factPaths).sort() };
    }
    function resolveDerivedValue(derive, subject, snapshot) {
      const resolved = derive.args.map((value) => resolveValue2(value, subject, snapshot));
      const factPaths = Array.from(new Set(resolved.flatMap((value) => value.factPaths))).sort();
      if (resolved.some((value) => value.state !== "known")) {
        return { state: "unknown", value: void 0, factPaths };
      }
      const values = resolved.map((value) => value.value);
      if (derive.operator === "length") {
        const value = values[0];
        if (!Array.isArray(value) && typeof value !== "string") {
          return { state: "unknown", value: void 0, factPaths };
        }
        return {
          state: "known",
          value: Array.isArray(value) ? value.length : Array.from(value).length,
          factPaths
        };
      }
      if (!values.every((value) => typeof value === "number" && Number.isFinite(value))) {
        return { state: "unknown", value: void 0, factPaths };
      }
      if (derive.operator === "add") {
        return { state: "known", value: values.reduce((sum, value) => sum + value, 0), factPaths };
      }
      if (derive.operator === "multiply") {
        return { state: "known", value: values.reduce((product, value) => product * value, 1), factPaths };
      }
      if (derive.operator === "subtract") {
        return { state: "known", value: values[0] - values[1], factPaths };
      }
      if (derive.operator === "absolute-difference") {
        return { state: "known", value: Math.abs(values[0] - values[1]), factPaths };
      }
      if (values[1] === 0) return { state: "unknown", value: void 0, factPaths };
      return { state: "known", value: values[0] / values[1], factPaths };
    }
    function resolveValue2(valueRef, subject, snapshot) {
      if (!valueRef || typeof valueRef !== "object" || Array.isArray(valueRef)) {
        return { state: "unknown", value: void 0, factPaths: [] };
      }
      if (Object.prototype.hasOwnProperty.call(valueRef, "literal")) {
        return { state: "known", value: valueRef.literal, factPaths: [] };
      }
      if (Object.prototype.hasOwnProperty.call(valueRef, "query")) {
        return resolveQueryValue(valueRef.query, subject, snapshot);
      }
      if (Object.prototype.hasOwnProperty.call(valueRef, "derive")) {
        return resolveDerivedValue(valueRef.derive, subject, snapshot);
      }
      if (typeof valueRef.fact !== "string" || !valueRef.fact) {
        return { state: "unknown", value: void 0, factPaths: [] };
      }
      const factPath = valueRef.fact;
      if (unknownFactMatches(subject.unknownFacts, factPath)) {
        return { state: "unknown", value: void 0, factPaths: [factPath] };
      }
      if (factPath.startsWith("page.context.")) {
        const contextFactPath = factPath.slice("page.context.".length);
        if (unknownFactMatches(snapshot.context?.unknownFacts, contextFactPath)) {
          return { state: "unknown", value: void 0, factPaths: [factPath] };
        }
        const resolved = readObjectPath(snapshot.context, contextFactPath);
        return { ...resolved, factPaths: [factPath] };
      }
      return { ...readObjectPath(subject, factPath), factPaths: [factPath] };
    }
    function deepEqual(left, right) {
      return stableStringify2(left) === stableStringify2(right);
    }
    function makeTrace(predicate, truth, reason, actual, expected, factPaths, children) {
      const trace = {
        predicate,
        truth,
        reason,
        actual: actual.state === "known" ? actual.value : { state: actual.state },
        expected: expected.state === "known" ? expected.value : { state: expected.state },
        factPaths
      };
      if (children) trace.children = children;
      return trace;
    }
    function combineLogic(predicate, children) {
      const truths = children.map((child) => child.truth);
      if (predicate === "all") {
        if (truths.includes(TRUTH.FALSE)) return TRUTH.FALSE;
        return truths.includes(TRUTH.UNKNOWN) ? TRUTH.UNKNOWN : TRUTH.TRUE;
      }
      if (predicate === "any") {
        if (truths.includes(TRUTH.TRUE)) return TRUTH.TRUE;
        return truths.includes(TRUTH.UNKNOWN) ? TRUTH.UNKNOWN : TRUTH.FALSE;
      }
      return truths[0] === TRUTH.UNKNOWN ? TRUTH.UNKNOWN : truths[0] === TRUTH.TRUE ? TRUTH.FALSE : TRUTH.TRUE;
    }
    function evaluateLogicExpression(expression, subject, snapshot) {
      const children = expression.args.map((child) => evaluateExpression(child, subject, snapshot));
      const truth = combineLogic(expression.predicate, children);
      const factPaths = Array.from(new Set(children.flatMap((child) => child.factPaths))).sort();
      const reason = expression.predicate === "not" ? "logical negation evaluated" : `logical ${expression.predicate} evaluated`;
      return makeTrace(
        expression.predicate,
        truth,
        reason,
        { state: "known", value: children.map((child) => child.truth) },
        { state: "known", value: expression.predicate === "all" ? "all true" : expression.predicate === "any" ? "at least one true" : "negated" },
        factPaths,
        children
      );
    }
    function numericValue(resolved) {
      return resolved.state === "known" && typeof resolved.value === "number" && Number.isFinite(resolved.value);
    }
    function knownArray(resolved) {
      return resolved.state === "known" && Array.isArray(resolved.value);
    }
    function resolveBounds(expression, subject, snapshot) {
      const lower = resolveValue2(expression.lower, subject, snapshot);
      const upper = resolveValue2(expression.upper, subject, snapshot);
      return {
        lower,
        upper,
        factPaths: Array.from(/* @__PURE__ */ new Set([...lower.factPaths, ...upper.factPaths])).sort()
      };
    }
    function evaluateNumericRange(predicate, actual, lower, upper, bounds, factPaths) {
      if ([actual, lower, upper].some((value) => value.state === "unknown")) {
        return makeTrace(predicate, TRUTH.UNKNOWN, "range evidence is unknown", actual, { state: "unknown" }, factPaths);
      }
      if ([actual, lower, upper].some((value) => value.state === "absent")) {
        return makeTrace(predicate, TRUTH.FALSE, "range value is absent", actual, { state: "absent" }, factPaths);
      }
      if (![actual, lower, upper].every(numericValue) || lower.value > upper.value) {
        return makeTrace(predicate, TRUTH.UNKNOWN, "range requires ordered finite numeric bounds", actual, { state: "known", value: { lower: lower.value, upper: upper.value } }, factPaths);
      }
      const lowerPass = ["inclusive", "inclusive-lower"].includes(bounds) ? actual.value >= lower.value : actual.value > lower.value;
      const upperPass = ["inclusive", "inclusive-upper"].includes(bounds) ? actual.value <= upper.value : actual.value < upper.value;
      const truth = lowerPass && upperPass ? TRUTH.TRUE : TRUTH.FALSE;
      return makeTrace(predicate, truth, `numeric range ${bounds} evaluated`, actual, { state: "known", value: { lower: lower.value, upper: upper.value, bounds } }, factPaths);
    }
    function resolveNodePair(actual, expected, snapshot) {
      if (typeof actual.value !== "string" || typeof expected.value !== "string") {
        return { state: "invalid", actualNode: null, expectedNode: null };
      }
      const index = nodeIndex(snapshot);
      const actualNode = index.get(actual.value) || null;
      const expectedNode = index.get(expected.value) || null;
      if (!actualNode || !expectedNode) {
        return { state: "missing", actualNode, expectedNode };
      }
      return { state: "known", actualNode, expectedNode };
    }
    function isAncestorNode(ancestorNode, descendantNode, index) {
      let current = descendantNode.parentId ? index.get(descendantNode.parentId) : null;
      while (current) {
        if (current.id === ancestorNode.id) return true;
        current = current.parentId ? index.get(current.parentId) : null;
      }
      return false;
    }
    function siblingPosition(node, parent3, index) {
      if (!parent3) return null;
      const visibleIds = (parent3.childIds || []).filter((id) => index.get(id)?.visible === true);
      const position = visibleIds.indexOf(node.id);
      return position >= 0 ? position : null;
    }
    function evaluateRelation(predicate, actual, expected, snapshot, factPaths) {
      const pair = resolveNodePair(actual, expected, snapshot);
      if (pair.state !== "known") {
        return makeTrace(predicate, TRUTH.UNKNOWN, pair.state === "missing" ? "relation node is outside the snapshot" : "relation operands must be node ids", actual, expected, factPaths);
      }
      const { actualNode, expectedNode } = pair;
      const index = nodeIndex(snapshot);
      let passes = false;
      if (predicate === "direct-parent") passes = actualNode.parentId === expectedNode.id;
      else if (predicate === "ancestor") passes = isAncestorNode(expectedNode, actualNode, index);
      else if (predicate === "direct-child") passes = expectedNode.parentId === actualNode.id;
      else if (predicate === "descendant") passes = isAncestorNode(actualNode, expectedNode, index);
      else {
        const sameParent = actualNode.parentId !== null && actualNode.parentId === expectedNode.parentId;
        const parent3 = sameParent ? index.get(actualNode.parentId) : null;
        const actualPosition = siblingPosition(actualNode, parent3, index);
        const expectedPosition = siblingPosition(expectedNode, parent3, index);
        if (sameParent && actualPosition !== null && expectedPosition !== null) {
          if (predicate === "before") passes = actualPosition < expectedPosition;
          else if (predicate === "after") passes = actualPosition > expectedPosition;
          else passes = Math.abs(actualPosition - expectedPosition) === 1;
        }
      }
      const truth = passes ? TRUTH.TRUE : TRUTH.FALSE;
      return makeTrace(predicate, truth, truth === TRUTH.TRUE ? `node relation ${predicate} holds` : `node relation ${predicate} does not hold`, actual, expected, factPaths);
    }
    function isBounds(value) {
      return value && typeof value === "object" && !Array.isArray(value) && ["x", "y", "width", "height"].every((key2) => typeof value[key2] === "number" && Number.isFinite(value[key2])) && value.width >= 0 && value.height >= 0;
    }
    function boundsCoordinate(bounds, axis) {
      if (axis === "left") return bounds.x;
      if (axis === "center-x") return bounds.x + bounds.width / 2;
      if (axis === "right") return bounds.x + bounds.width;
      if (axis === "top") return bounds.y;
      if (axis === "center-y") return bounds.y + bounds.height / 2;
      return bounds.y + bounds.height;
    }
    function axisGap(firstStart, firstSize, secondStart, secondSize) {
      const firstEnd = firstStart + firstSize;
      const secondEnd = secondStart + secondSize;
      if (firstEnd < secondStart) return secondStart - firstEnd;
      if (secondEnd < firstStart) return firstStart - secondEnd;
      return 0;
    }
    function partialMatch(actual, constraint) {
      if (!constraint || typeof constraint !== "object" || Array.isArray(constraint)) {
        return deepEqual(actual, constraint);
      }
      if (!actual || typeof actual !== "object" || Array.isArray(actual)) return false;
      return Object.keys(constraint).every((key2) => partialMatch(actual[key2], constraint[key2]));
    }
    function evaluateExpression(expression, subject, snapshot) {
      if (["all", "any", "not"].includes(expression.predicate)) {
        return evaluateLogicExpression(expression, subject, snapshot);
      }
      const actual = resolveValue2(expression.actual, subject, snapshot);
      const expected = expression.expected ? resolveValue2(expression.expected, subject, snapshot) : { state: "known", value: null, factPaths: [] };
      const factPaths = Array.from(/* @__PURE__ */ new Set([...actual.factPaths, ...expected.factPaths])).sort();
      if (expression.predicate === "exists") {
        if (actual.state === "unknown") {
          return makeTrace("exists", TRUTH.UNKNOWN, "required fact is unknown", actual, expected, factPaths);
        }
        const truth = actual.state === "known" && actual.value !== null ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("exists", truth, truth === TRUTH.TRUE ? "fact exists" : "fact is absent", actual, expected, factPaths);
      }
      if (expression.predicate === "fact-present") {
        if (actual.state === "unknown") {
          return makeTrace("fact-present", TRUTH.UNKNOWN, "fact presence is unknown", actual, expected, factPaths);
        }
        const truth = actual.state === "known" ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace(
          "fact-present",
          truth,
          truth === TRUTH.TRUE ? "fact path is present" : "fact path is absent",
          actual,
          expected,
          factPaths
        );
      }
      if (actual.state === "unknown" || expected.state === "unknown") {
        return makeTrace(expression.predicate, TRUTH.UNKNOWN, "comparison evidence is unknown", actual, expected, factPaths);
      }
      if (actual.state === "absent" || expected.state === "absent") {
        if (expression.missingPolicy === "unknown") {
          return makeTrace(expression.predicate, TRUTH.UNKNOWN, "comparison value is absent", actual, expected, factPaths);
        }
        return makeTrace(expression.predicate, TRUTH.FALSE, "comparison value is absent", actual, expected, factPaths);
      }
      if (expression.predicate === "equals") {
        const truth = deepEqual(actual.value, expected.value) ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("equals", truth, truth === TRUTH.TRUE ? "values are equal" : "values differ", actual, expected, factPaths);
      }
      if (expression.predicate === "not-equals") {
        const truth = deepEqual(actual.value, expected.value) ? TRUTH.FALSE : TRUTH.TRUE;
        return makeTrace("not-equals", truth, truth === TRUTH.TRUE ? "values differ" : "values are equal", actual, expected, factPaths);
      }
      if (expression.predicate === "one-of") {
        if (!Array.isArray(expected.value)) {
          return makeTrace("one-of", TRUTH.UNKNOWN, "expected value is not an array", actual, expected, factPaths);
        }
        const truth = expected.value.some((candidate) => deepEqual(actual.value, candidate)) ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("one-of", truth, truth === TRUTH.TRUE ? "value belongs to the allowed set" : "value is outside the allowed set", actual, expected, factPaths);
      }
      if (expression.predicate === "none-of") {
        if (!Array.isArray(expected.value)) {
          return makeTrace("none-of", TRUTH.UNKNOWN, "expected value is not an array", actual, expected, factPaths);
        }
        const truth = expected.value.some((candidate) => deepEqual(actual.value, candidate)) ? TRUTH.FALSE : TRUTH.TRUE;
        return makeTrace("none-of", truth, truth === TRUTH.TRUE ? "value is outside the forbidden set" : "value belongs to the forbidden set", actual, expected, factPaths);
      }
      if (expression.predicate === "compare") {
        if (!numericValue(actual) || !numericValue(expected)) {
          return makeTrace("compare", TRUTH.UNKNOWN, "comparison requires finite numeric values", actual, expected, factPaths);
        }
        const comparisons = {
          lt: actual.value < expected.value,
          lte: actual.value <= expected.value,
          gt: actual.value > expected.value,
          gte: actual.value >= expected.value
        };
        const truth = comparisons[expression.operator] ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("compare", truth, `numeric comparison ${expression.operator} evaluated`, actual, { state: "known", value: { operator: expression.operator, value: expected.value } }, factPaths);
      }
      if (expression.predicate === "approximately-equals") {
        if (!numericValue(actual) || !numericValue(expected)) {
          return makeTrace(
            "approximately-equals",
            TRUTH.UNKNOWN,
            "approximate comparison requires finite numeric values",
            actual,
            expected,
            factPaths
          );
        }
        const tolerance = expression.tolerance || 0;
        const difference = Math.abs(actual.value - expected.value);
        const truth = difference <= tolerance ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace(
          "approximately-equals",
          truth,
          truth === TRUTH.TRUE ? "values are equal within tolerance" : "values differ beyond tolerance",
          actual,
          { state: "known", value: { value: expected.value, tolerance, difference } },
          factPaths
        );
      }
      if (expression.predicate === "between") {
        const range = resolveBounds(expression, subject, snapshot);
        const bounds = expression.bounds || "inclusive";
        const rangeFactPaths = Array.from(/* @__PURE__ */ new Set([...actual.factPaths, ...range.factPaths])).sort();
        return evaluateNumericRange("between", actual, range.lower, range.upper, bounds, rangeFactPaths);
      }
      if (expression.predicate === "string-length-between") {
        const range = resolveBounds(expression, subject, snapshot);
        const rangeFactPaths = Array.from(/* @__PURE__ */ new Set([...actual.factPaths, ...range.factPaths])).sort();
        if (actual.state === "unknown") {
          return makeTrace("string-length-between", TRUTH.UNKNOWN, "string evidence is unknown", actual, { state: "unknown" }, rangeFactPaths);
        }
        if (actual.state === "absent") {
          return makeTrace("string-length-between", TRUTH.FALSE, "string value is absent", actual, { state: "absent" }, rangeFactPaths);
        }
        if (typeof actual.value !== "string") {
          return makeTrace("string-length-between", TRUTH.UNKNOWN, "actual value is not a string", actual, { state: "unknown" }, rangeFactPaths);
        }
        return evaluateNumericRange(
          "string-length-between",
          { state: "known", value: Array.from(actual.value).length, factPaths: actual.factPaths },
          range.lower,
          range.upper,
          expression.bounds || "inclusive",
          rangeFactPaths
        );
      }
      if (expression.predicate === "matches") {
        if (typeof actual.value !== "string" || typeof expected.value !== "string") {
          return makeTrace("matches", TRUTH.UNKNOWN, "regex comparison requires string values", actual, expected, factPaths);
        }
        let matcher;
        try {
          matcher = new RegExp(expected.value, expression.flags || "u");
        } catch (_error) {
          return makeTrace("matches", TRUTH.UNKNOWN, "regular expression is invalid", actual, expected, factPaths);
        }
        const truth = matcher.test(actual.value) ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("matches", truth, truth === TRUTH.TRUE ? "string matches the pattern" : "string does not match the pattern", actual, { state: "known", value: { pattern: expected.value, flags: expression.flags || "u" } }, factPaths);
      }
      if (["every", "some", "none"].includes(expression.predicate)) {
        if (!knownArray(actual)) {
          return makeTrace(expression.predicate, TRUTH.UNKNOWN, "collection predicate requires an actual array", actual, expected, factPaths);
        }
        const allowed = Array.isArray(expected.value) ? expected.value : [expected.value];
        const matches2 = actual.value.map((item) => allowed.some((candidate) => deepEqual(item, candidate)));
        const values = {
          every: matches2.every(Boolean),
          some: matches2.some(Boolean),
          none: matches2.every((match) => !match)
        };
        const truth = values[expression.predicate] ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace(expression.predicate, truth, `collection membership ${expression.predicate} evaluated`, actual, { state: "known", value: allowed }, factPaths);
      }
      if (expression.predicate === "count-between") {
        const range = resolveBounds(expression, subject, snapshot);
        const rangeFactPaths = Array.from(/* @__PURE__ */ new Set([...actual.factPaths, ...range.factPaths])).sort();
        if (!knownArray(actual)) {
          return makeTrace("count-between", actual.state === "unknown" ? TRUTH.UNKNOWN : TRUTH.FALSE, "count predicate requires an actual array", actual, { state: "unknown" }, rangeFactPaths);
        }
        return evaluateNumericRange(
          "count-between",
          { state: "known", value: actual.value.length, factPaths: actual.factPaths },
          range.lower,
          range.upper,
          expression.bounds || "inclusive",
          rangeFactPaths
        );
      }
      if (expression.predicate === "all-equal") {
        if (!knownArray(actual)) {
          return makeTrace("all-equal", TRUTH.UNKNOWN, "all-equal requires an actual array", actual, expected, factPaths);
        }
        const reference = expression.expected ? expected.value : actual.value[0];
        const truth = actual.value.every((item) => deepEqual(item, reference)) ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("all-equal", truth, truth === TRUTH.TRUE ? "all collection values are equal" : "collection values differ", actual, { state: "known", value: reference }, factPaths);
      }
      if (expression.predicate === "unique") {
        if (!knownArray(actual)) {
          return makeTrace("unique", TRUTH.UNKNOWN, "unique requires an actual array", actual, expected, factPaths);
        }
        const identities = actual.value.map(stableStringify2);
        const truth = identities.length === new Set(identities).size ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("unique", truth, truth === TRUTH.TRUE ? "collection values are unique" : "collection contains duplicates", actual, { state: "known", value: "unique values" }, factPaths);
      }
      if (expression.predicate === "sequence-equals") {
        if (!knownArray(actual) || !knownArray(expected)) {
          return makeTrace("sequence-equals", TRUTH.UNKNOWN, "sequence comparison requires two arrays", actual, expected, factPaths);
        }
        const truth = deepEqual(actual.value, expected.value) ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("sequence-equals", truth, truth === TRUTH.TRUE ? "sequences are equal" : "sequences differ", actual, expected, factPaths);
      }
      if (expression.predicate === "value-position") {
        if (!knownArray(actual)) {
          return makeTrace("value-position", TRUTH.UNKNOWN, "value-position requires an actual array", actual, expected, factPaths);
        }
        const positions = expression.positions;
        const matchingIndexes = actual.value.map((item, index) => deepEqual(item, expected.value) ? index : -1).filter((index) => index >= 0);
        const allowedIndexes = /* @__PURE__ */ new Set();
        for (const position of positions) {
          if (position === "first") allowedIndexes.add(0);
          else if (position === "last") allowedIndexes.add(Math.max(0, actual.value.length - 1));
          else if (Number.isInteger(position) && position >= 0) allowedIndexes.add(position);
        }
        const withinCount = expression.maxCount === void 0 || matchingIndexes.length <= expression.maxCount;
        const correctlyPositioned = matchingIndexes.every((index) => allowedIndexes.has(index));
        const truth = withinCount && correctlyPositioned ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("value-position", truth, truth === TRUTH.TRUE ? "matching values occupy allowed positions" : "matching values violate position or count constraints", actual, { state: "known", value: { value: expected.value, positions, maxCount: expression.maxCount ?? null } }, factPaths);
      }
      if ([
        "direct-parent",
        "ancestor",
        "direct-child",
        "descendant",
        "before",
        "after",
        "adjacent"
      ].includes(expression.predicate)) {
        return evaluateRelation(expression.predicate, actual, expected, snapshot, factPaths);
      }
      if (["contains", "overlaps", "aligned", "distance"].includes(expression.predicate)) {
        const target = resolveValue2(expression.target, subject, snapshot);
        const geometryFactPaths = Array.from(/* @__PURE__ */ new Set([...actual.factPaths, ...target.factPaths, ...expected.factPaths])).sort();
        if (actual.state === "unknown" || target.state === "unknown" || expected.state === "unknown") {
          return makeTrace(expression.predicate, TRUTH.UNKNOWN, "geometry evidence is unknown", actual, target, geometryFactPaths);
        }
        if (!isBounds(actual.value) || !isBounds(target.value)) {
          return makeTrace(expression.predicate, TRUTH.UNKNOWN, "geometry predicate requires valid bounds", actual, target, geometryFactPaths);
        }
        let passes = false;
        let measured = null;
        if (expression.predicate === "contains") {
          passes = target.value.x >= actual.value.x && target.value.y >= actual.value.y && target.value.x + target.value.width <= actual.value.x + actual.value.width && target.value.y + target.value.height <= actual.value.y + actual.value.height;
        } else if (expression.predicate === "overlaps") {
          const intersectionWidth = Math.min(actual.value.x + actual.value.width, target.value.x + target.value.width) - Math.max(actual.value.x, target.value.x);
          const intersectionHeight = Math.min(actual.value.y + actual.value.height, target.value.y + target.value.height) - Math.max(actual.value.y, target.value.y);
          passes = intersectionWidth > 0 && intersectionHeight > 0;
        } else if (expression.predicate === "aligned") {
          measured = Math.abs(boundsCoordinate(actual.value, expression.axis) - boundsCoordinate(target.value, expression.axis));
          passes = measured <= (expression.tolerance || 0);
        } else {
          if (!numericValue(expected)) {
            return makeTrace("distance", TRUTH.UNKNOWN, "distance expectation must be a finite number", actual, expected, geometryFactPaths);
          }
          const horizontal = axisGap(actual.value.x, actual.value.width, target.value.x, target.value.width);
          const vertical = axisGap(actual.value.y, actual.value.height, target.value.y, target.value.height);
          measured = expression.axis === "horizontal" ? horizontal : expression.axis === "vertical" ? vertical : Math.sqrt(horizontal ** 2 + vertical ** 2);
          passes = Math.abs(measured - expected.value) <= (expression.tolerance || 0);
        }
        const truth = passes ? TRUTH.TRUE : TRUTH.FALSE;
        const expectedTrace = expression.predicate === "distance" ? { state: "known", value: { distance: expected.value, axis: expression.axis, tolerance: expression.tolerance || 0, measured } } : { state: "known", value: { target: target.value, axis: expression.axis || null, tolerance: expression.tolerance || 0, measured } };
        return makeTrace(expression.predicate, truth, truth === TRUTH.TRUE ? `geometry ${expression.predicate} holds` : `geometry ${expression.predicate} does not hold`, actual, expectedTrace, geometryFactPaths);
      }
      if (expression.predicate === "component-api-valid") {
        const valid = typeof actual.value === "boolean" ? actual.value : actual.value && typeof actual.value === "object" ? actual.value.valid : void 0;
        if (typeof valid !== "boolean") {
          return makeTrace("component-api-valid", TRUTH.UNKNOWN, "component API evidence has no boolean validity", actual, expected, factPaths);
        }
        return makeTrace("component-api-valid", valid ? TRUTH.TRUE : TRUTH.FALSE, valid ? "component API is valid" : "component API is invalid", actual, { state: "known", value: true }, factPaths);
      }
      if (expression.predicate === "matches-effective-baseline") {
        const truth = deepEqual(actual.value, expected.value) ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace("matches-effective-baseline", truth, truth === TRUTH.TRUE ? "actual value matches effective baseline" : "actual value differs from effective baseline", actual, expected, factPaths);
      }
      if (["binding-satisfies", "paint-state-satisfies"].includes(expression.predicate)) {
        if (!expected.value || typeof expected.value !== "object" || Array.isArray(expected.value)) {
          return makeTrace(expression.predicate, TRUTH.UNKNOWN, "contract constraint must be an object", actual, expected, factPaths);
        }
        const truth = partialMatch(actual.value, expected.value) ? TRUTH.TRUE : TRUTH.FALSE;
        return makeTrace(expression.predicate, truth, truth === TRUTH.TRUE ? "contract constraint is satisfied" : "contract constraint is not satisfied", actual, expected, factPaths);
      }
      return makeTrace(expression.predicate, TRUTH.UNKNOWN, "predicate is not implemented", actual, expected, factPaths);
    }
    function scopeApplicability(rule, snapshot) {
      const scope = rule.scope || {};
      let unknown14;
      for (const key2 of ["platform", "product", "channel", "pageType"]) {
        if (!scope[key2]?.length) continue;
        const factPath = `page.context.${key2}`;
        const actual = resolveValue2({ fact: factPath }, { unknownFacts: [] }, snapshot);
        const result = { dimension: key2 === "pageType" ? "page type" : key2, actual, expected: scope[key2], factPath };
        if (actual.state !== "known" || typeof actual.value !== "string" || !actual.value.trim()) {
          unknown14 = unknown14 || { ...result, applicability: APPLICABILITY.UNKNOWN };
          continue;
        }
        if (!scope[key2].includes(actual.value)) return { ...result, applicability: APPLICABILITY.NOT_APPLICABLE };
      }
      return unknown14 || { applicability: APPLICABILITY.APPLICABLE };
    }
    var EXECUTION_INDEX = Symbol("predicate-execution-index");
    function nodeIndex(snapshot) {
      return snapshot[EXECUTION_INDEX] || new Map(snapshot.nodes.map((node) => [node.id, node]));
    }
    function descendantsOf(root2, index) {
      const result = [];
      const visit = (node) => {
        for (const childId of node.childIds || []) {
          const child = index.get(childId);
          if (!child || child.visible !== true) continue;
          result.push(child);
          visit(child);
        }
      };
      visit(root2);
      return result;
    }
    function traversalNodes(root2, traverse, index) {
      if (traverse === "self") return [root2];
      if (traverse === "direct-children") {
        return (root2.childIds || []).map((id) => index.get(id)).filter((node) => node?.visible === true);
      }
      if (traverse === "descendants") return descendantsOf(root2, index);
      if (traverse === "self-and-descendants") return [root2, ...descendantsOf(root2, index)];
      if (traverse === "parent") {
        const parent3 = root2.parentId ? index.get(root2.parentId) : null;
        return parent3?.visible === true ? [parent3] : [];
      }
      if (traverse === "ancestors") {
        const result = [];
        let current = root2.parentId ? index.get(root2.parentId) : null;
        while (current) {
          if (current.visible === true) result.push(current);
          current = current.parentId ? index.get(current.parentId) : null;
        }
        return result;
      }
      if (traverse === "siblings") {
        const parent3 = root2.parentId ? index.get(root2.parentId) : null;
        return (parent3?.childIds || []).filter((id) => id !== root2.id).map((id) => index.get(id)).filter((node) => node?.visible === true);
      }
      throw capabilityError("SELECTOR_NOT_IMPLEMENTED", `Unsupported traversal: ${traverse}`);
    }
    function selectionRoots(snapshot, from, index) {
      if (from === "selection-root" || from === "self") {
        const ids = from === "self" ? snapshot.selection.slice(0, 1) : snapshot.selection;
        return ids.map((id) => index.get(id)).filter((node) => node?.visible === true);
      }
      if (from === "page-descendants") {
        return snapshot.nodes.filter((node) => node.visible === true && node.parentId === null);
      }
      throw capabilityError("SELECTOR_NOT_IMPLEMENTED", `Unsupported selector origin: ${from}`);
    }
    function selectSubjects2(rule, snapshot) {
      const index = nodeIndex(snapshot);
      const roots = selectionRoots(snapshot, rule.select.from, index);
      const candidates = roots.flatMap((root2) => traversalNodes(root2, rule.select.traverse, index));
      const unique = new Map(candidates.map((node) => [node.id, node]));
      const unknownNodes = [];
      const nodes = Array.from(unique.values()).filter((node) => {
        for (const expression of rule.select.where || []) {
          const result = evaluateExpression(expression, node, snapshot);
          if (result.truth === TRUTH.UNKNOWN) {
            unknownNodes.push(node);
            return false;
          }
          if (result.truth === TRUTH.FALSE) return false;
        }
        return true;
      });
      nodes.sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
      unknownNodes.sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
      return { nodes, unknown: unknownNodes.length > 0, unknownNodes, roots };
    }
    function terminalClassification(rule, truth) {
      if (truth === TRUTH.UNKNOWN) return rule.unknownPolicy;
      if (rule.effect === "allow") return truth === TRUTH.TRUE ? "allowed" : "not-applicable";
      const violation = rule.effect === "require" ? truth === TRUTH.FALSE : truth === TRUTH.TRUE;
      return violation ? "violation" : "compliant";
    }
    function evaluationId(hash3, rule, subject, trace, applicability2) {
      return stableHash2({
        snapshotHash: hash3,
        ruleId: rule.ruleId,
        ruleRevision: rule.revision,
        subjectNodeId: subject.id,
        factPaths: trace.factPaths,
        applicability: applicability2
      });
    }
    function traceNodes(trace) {
      if (!trace || typeof trace !== "object") return [];
      return [trace, ...(trace.children || []).flatMap(traceNodes)];
    }
    function normalizePlatformTrace(rule, subject, trace) {
      if (rule.presentation?.causalRole !== "platform-root") return trace;
      const componentPlatform = subject.component?.platform;
      const candidates = traceNodes(trace).filter((item) => (item.factPaths || []).includes("page.context.platform"));
      const comparison = componentPlatform === "universal" ? candidates.find((item) => item.predicate === "one-of") : candidates.find((item) => item.predicate === "equals" && (item.factPaths || []).includes("component.platform"));
      if (!comparison) return trace;
      return Object.assign({}, trace, {
        reason: "page channel compatibility evaluated",
        actual: comparison.actual,
        expected: comparison.expected
      });
    }
    function makeEvaluation(hash3, rule, subject, applicability2, classification, trace) {
      const normalizedTrace = normalizePlatformTrace(rule, subject, trace);
      return {
        evaluationId: evaluationId(hash3, rule, subject, normalizedTrace, applicability2),
        ruleId: rule.ruleId,
        ruleRevision: rule.revision,
        subjectNodeId: subject.id,
        subjectNodeName: subject.name || subject.id,
        focusNodeId: subject.id,
        focusNodeName: subject.name || subject.id,
        applicability: applicability2,
        classification,
        severity: rule.severity,
        trace: normalizedTrace,
        actionId: null
      };
    }
    function buildCoverage(evaluations) {
      const byClassification = {};
      for (const item of evaluations) {
        byClassification[item.classification] = (byClassification[item.classification] || 0) + 1;
      }
      const ids = evaluations.map((item) => item.evaluationId);
      return {
        total: evaluations.length,
        byClassification,
        unclassified: evaluations.filter((item) => !item.classification).length,
        duplicateEvaluationIds: ids.length - new Set(ids).size
      };
    }
    function isDescendantOrSelf(node, ancestorNodeId, index) {
      let current = node;
      while (current) {
        if (current.id === ancestorNodeId) return true;
        current = current.parentId ? index.get(current.parentId) : null;
      }
      return false;
    }
    function suppressPlatformDependentViolations(evaluations, rules, snapshot, hash3) {
      const index = nodeIndex(snapshot);
      const rulesById = new Map(rules.map((rule) => [rule.ruleId, rule]));
      const platformViolations = evaluations.filter((evaluation) => evaluation.classification === "violation" && rulesById.get(evaluation.ruleId)?.presentation?.causalRole === "platform-root");
      if (!platformViolations.length) return evaluations;
      return evaluations.map((evaluation) => {
        if (evaluation.classification !== "violation" || platformViolations.some((platform) => platform.evaluationId === evaluation.evaluationId) || !(evaluation.trace?.factPaths || []).includes("page.context.platform")) return evaluation;
        const subject = index.get(evaluation.subjectNodeId);
        const cause = platformViolations.find((platform) => subject && isDescendantOrSelf(subject, platform.subjectNodeId, index));
        if (!cause) return evaluation;
        const rule = rulesById.get(evaluation.ruleId);
        if (!rule) return evaluation;
        const trace = makeTrace(
          "causal-suppression",
          TRUTH.UNKNOWN,
          `platform-dependent violation is suppressed by ${cause.ruleId}`,
          { state: "known", value: evaluation.subjectNodeId },
          { state: "known", value: cause.subjectNodeId },
          ["page.context.platform"]
        );
        return Object.assign(
          makeEvaluation(
            hash3,
            rule,
            subject,
            APPLICABILITY.NOT_APPLICABLE,
            "not-applicable",
            trace
          ),
          {
            suppressedByEvaluationId: cause.evaluationId,
            suppressedByRuleId: cause.ruleId
          }
        );
      });
    }
    function causalRelationMatches(root2, derived, relation, index) {
      if (relation === "same-subject") {
        return root2.subjectNodeId === derived.subjectNodeId;
      }
      if (relation === "same-focus") {
        return root2.focusNodeId === derived.focusNodeId;
      }
      if (relation === "descendant-subject") {
        const derivedSubject = index.get(derived.subjectNodeId);
        return Boolean(
          derivedSubject && derivedSubject.id !== root2.subjectNodeId && isDescendantOrSelf(derivedSubject, root2.subjectNodeId, index)
        );
      }
      return false;
    }
    function groupCausalViolations(evaluations, rules, snapshot) {
      const index = nodeIndex(snapshot);
      const rulesById = new Map(rules.map((rule) => [rule.ruleId, rule]));
      const violations = evaluations.filter((evaluation) => evaluation.classification === "violation");
      const assignmentByDerivedId = /* @__PURE__ */ new Map();
      const derivedByRootId = /* @__PURE__ */ new Map();
      const roots = violations.filter((evaluation) => rulesById.get(evaluation.ruleId)?.causality?.causes?.length).sort((left, right) => left.subjectNodeId.localeCompare(right.subjectNodeId) || left.ruleId.localeCompare(right.ruleId) || left.evaluationId.localeCompare(right.evaluationId));
      for (const root2 of roots) {
        const rule = rulesById.get(root2.ruleId);
        for (const cause of rule.causality.causes) {
          const candidates = violations.filter((evaluation) => evaluation.evaluationId !== root2.evaluationId && evaluation.ruleId === cause.ruleId && !assignmentByDerivedId.has(evaluation.evaluationId) && causalRelationMatches(root2, evaluation, cause.relation, index)).sort((left, right) => left.subjectNodeId.localeCompare(right.subjectNodeId) || left.evaluationId.localeCompare(right.evaluationId));
          for (const derived of candidates) {
            assignmentByDerivedId.set(derived.evaluationId, {
              rootFindingId: root2.evaluationId,
              causalGroupingReason: cause.reason
            });
            if (!derivedByRootId.has(root2.evaluationId)) {
              derivedByRootId.set(root2.evaluationId, []);
            }
            derivedByRootId.get(root2.evaluationId).push(derived.evaluationId);
          }
        }
      }
      return evaluations.map((evaluation) => {
        const derived = assignmentByDerivedId.get(evaluation.evaluationId);
        if (derived) {
          return Object.assign({}, evaluation, derived, { derivedFindingIds: [] });
        }
        const derivedFindingIds = (derivedByRootId.get(evaluation.evaluationId) || []).slice().sort((left, right) => left.localeCompare(right));
        if (!derivedFindingIds.length) return evaluation;
        return Object.assign({}, evaluation, {
          rootFindingId: evaluation.evaluationId,
          derivedFindingIds,
          causalGroupingReason: "explicit source-rule causal relation"
        });
      });
    }
    function evaluateRules3({ snapshot, rules, ruleRelease = "unversioned" }) {
      snapshot = Object.assign({}, snapshot);
      Object.defineProperty(snapshot, EXECUTION_INDEX, { value: nodeIndex(snapshot) });
      const hash3 = snapshotHash2(snapshot);
      const evaluations = [];
      for (const ruleInput of rules) {
        const rule = validateRule(ruleInput);
        const index = nodeIndex(snapshot);
        const fallback = index.get(snapshot.selection[0]) || snapshot.nodes[0];
        if (!fallback) continue;
        if (rule.authority?.status !== "active") {
          const trace = makeTrace(rule.assert.predicate, TRUTH.UNKNOWN, "rule authority is not active", { state: "unknown" }, { state: "unknown" }, []);
          evaluations.push(makeEvaluation(hash3, rule, fallback, APPLICABILITY.UNKNOWN, "not-evaluable", trace));
          continue;
        }
        const scopeResult = scopeApplicability(rule, snapshot);
        let unknownScopeTrace;
        if (scopeResult.applicability !== APPLICABILITY.APPLICABLE) {
          const unknown14 = scopeResult.applicability === APPLICABILITY.UNKNOWN;
          const trace = makeTrace(
            "one-of",
            unknown14 ? TRUTH.UNKNOWN : TRUTH.FALSE,
            `rule ${scopeResult.dimension} scope ${unknown14 ? "is unknown" : "does not apply"}`,
            scopeResult.actual,
            { state: "known", value: scopeResult.expected },
            [scopeResult.factPath]
          );
          if (!unknown14) {
            evaluations.push(makeEvaluation(hash3, rule, fallback, scopeResult.applicability, "not-applicable", trace));
            continue;
          }
          unknownScopeTrace = trace;
        }
        const selected = selectSubjects2(rule, snapshot);
        if (selected.unknown && !selected.nodes.length) {
          const trace = makeTrace(rule.assert.predicate, TRUTH.UNKNOWN, "selector evidence is unknown", { state: "unknown" }, { state: "unknown" }, []);
          evaluations.push(makeEvaluation(hash3, rule, fallback, APPLICABILITY.UNKNOWN, rule.unknownPolicy, trace));
          continue;
        }
        if (!selected.nodes.length) {
          if (unknownScopeTrace) {
            evaluations.push(makeEvaluation(hash3, rule, fallback, APPLICABILITY.UNKNOWN, rule.unknownPolicy, unknownScopeTrace));
            continue;
          }
          const trace = makeTrace(rule.assert.predicate, TRUTH.UNKNOWN, "selector matched no visible nodes", { state: "absent" }, { state: "unknown" }, []);
          evaluations.push(makeEvaluation(hash3, rule, fallback, APPLICABILITY.NOT_APPLICABLE, "not-applicable", trace));
          continue;
        }
        for (const subject of selected.nodes) {
          if (rule.when) {
            const whenTrace = evaluateExpression(rule.when, subject, snapshot);
            if (whenTrace.truth === TRUTH.FALSE) {
              evaluations.push(makeEvaluation(hash3, rule, subject, APPLICABILITY.NOT_APPLICABLE, "not-applicable", whenTrace));
              continue;
            }
            if (whenTrace.truth === TRUTH.UNKNOWN) {
              evaluations.push(makeEvaluation(hash3, rule, subject, APPLICABILITY.UNKNOWN, rule.unknownPolicy, whenTrace));
              continue;
            }
          }
          if (unknownScopeTrace) {
            evaluations.push(makeEvaluation(hash3, rule, subject, APPLICABILITY.UNKNOWN, rule.unknownPolicy, unknownScopeTrace));
            continue;
          }
          const trace = evaluateExpression(rule.assert, subject, snapshot);
          evaluations.push(makeEvaluation(
            hash3,
            rule,
            subject,
            APPLICABILITY.APPLICABLE,
            terminalClassification(rule, trace.truth),
            trace
          ));
        }
      }
      const normalizedEvaluations = groupCausalViolations(suppressPlatformDependentViolations(
        evaluations,
        rules,
        snapshot,
        hash3
      ), rules, snapshot);
      normalizedEvaluations.sort((left, right) => left.subjectNodeId.localeCompare(right.subjectNodeId) || left.ruleId.localeCompare(right.ruleId) || left.evaluationId.localeCompare(right.evaluationId));
      return {
        schemaVersion: "apollo.predicate-result.v1",
        snapshotHash: hash3,
        ruleRelease,
        evaluations: normalizedEvaluations,
        coverage: buildCoverage(normalizedEvaluations)
      };
    }
    module2.exports = {
      APPLICABILITY,
      IMPLEMENTED_PREDICATES,
      TRUTH,
      evaluateExpression,
      evaluateRules: evaluateRules3,
      resolveValue: resolveValue2,
      selectSubjects: selectSubjects2,
      snapshotHash: snapshotHash2,
      stableHash: stableHash2,
      stableStringify: stableStringify2,
      validateRule
    };
  }
});

// src/core/index.ts
var index_exports = {};
__export(index_exports, {
  CAPABILITY_SETS: () => CAPABILITY_SETS,
  CAPABILITY_SET_LABELS: () => CAPABILITY_SET_LABELS,
  COMPILED_SCHEMA_VERSION: () => COMPILED_SCHEMA_VERSION,
  COMPONENT_DEPENDENCY_CAPTURE_LIMIT: () => COMPONENT_DEPENDENCY_CAPTURE_LIMIT,
  COMPONENT_DEPENDENCY_DEPTH_LIMIT: () => COMPONENT_DEPENDENCY_DEPTH_LIMIT,
  DECLARED_TARGET_IDENTITY_SCHEMA: () => DECLARED_TARGET_IDENTITY_SCHEMA,
  DECLARED_TARGET_IDENTITY_VERSION: () => DECLARED_TARGET_IDENTITY_VERSION,
  DEPENDENCY_USAGE_PREFIX: () => DEPENDENCY_USAGE_PREFIX,
  DIRECT_CHILD_DEPENDENCY_CAPTURE_LIMIT: () => DIRECT_CHILD_DEPENDENCY_CAPTURE_LIMIT,
  EDITOR_SESSION_SCHEMA_VERSION: () => EDITOR_SESSION_SCHEMA_VERSION,
  INSTANCE_CONTENT_REFERENCE_LIMIT: () => INSTANCE_CONTENT_REFERENCE_LIMIT,
  LEGACY_MANUAL_SCHEMA_VERSION: () => LEGACY_MANUAL_SCHEMA_VERSION,
  MANUAL_SCHEMA_VERSION: () => MANUAL_SCHEMA_VERSION,
  PRODUCT_SCOPE_CATALOG: () => PRODUCT_SCOPE_CATALOG,
  PROPERTY_APPLICABILITY: () => PROPERTY_APPLICABILITY,
  PROTECTED_INTERNAL_CAPABILITY_SETS: () => PROTECTED_INTERNAL_CAPABILITY_SETS,
  RULE_OWNERSHIP_KINDS: () => RULE_OWNERSHIP_KINDS,
  TARGET_RESOLUTION_SCHEMA: () => TARGET_RESOLUTION_SCHEMA,
  allowPublicComponentProperties: () => allowPublicComponentProperties,
  allowedComponentPropertyNames: () => allowedComponentPropertyNames,
  applyCodeTransform: () => applyCodeTransform,
  applyProtectInternalsPolicy: () => applyProtectInternalsPolicy,
  applyTargetRemap: () => applyTargetRemap,
  assertDeclaredTargetContract: () => assertDeclaredTargetContract,
  assertNativeInstanceReplacementPolicy: () => assertNativeInstanceReplacementPolicy,
  assertNativeRuleFactPolicies: () => assertNativeRuleFactPolicies,
  baselineFactsForRule: () => baselineFactsForRule,
  bindDeclaredTargetRuleSelectors: () => bindDeclaredTargetRuleSelectors,
  bindingConsistencyKey: () => bindingConsistencyKey,
  buildAuthoringZip: () => buildAuthoringZip,
  buildContractReadiness: () => buildContractReadiness,
  buildEditorValidationReport: () => buildEditorValidationReport,
  buildEvaluationDetails: () => buildEvaluationDetails,
  buildExportBundle: () => buildExportBundle,
  buildOwnershipCoverage: () => buildOwnershipCoverage,
  buildOwnershipReadiness: () => buildOwnershipReadiness,
  buildValidationReportDownload: () => buildValidationReportDownload,
  capabilitiesForSet: () => capabilitiesForSet,
  capabilitySetLabel: () => capabilitySetLabel,
  captureEffectDetails: () => captureEffectDetails,
  captureGradientPaintDetails: () => captureGradientPaintDetails,
  captureHostVariableUsage: () => captureHostVariableUsage,
  captureInstanceSourceIdentities: () => captureInstanceSourceIdentities,
  capturePropertyActivity: () => capturePropertyActivity,
  captureResolvedVariableModes: () => captureResolvedVariableModes,
  captureSceneTopology: () => captureSceneTopology,
  captureSupplementalFacts: () => captureSupplementalFacts,
  captureTextDecoration: () => captureTextDecoration,
  captureTextFillEvidence: () => captureTextFillEvidence,
  captureTextStyleEvidence: () => captureTextStyleEvidence,
  captureTransitionContext: () => captureTransitionContext,
  captureVariantReference: () => captureVariantReference,
  catalogOccurrencePaths: () => catalogOccurrencePaths,
  collectionPropertyMatches: () => collectionPropertyMatches,
  compareInstanceBoundaries: () => compareInstanceBoundaries,
  compileApplicabilityProbe: () => compileApplicabilityProbe,
  compileManualSource: () => compileManualSource,
  componentDependencyKeys: () => componentDependencyKeys,
  componentPropertyName: () => componentPropertyName,
  configurationDeclaredTargetReferenceHash: () => configurationDeclaredTargetReferenceHash,
  configureInstanceMainAliases: () => configureInstanceMainAliases,
  confirmedNativeSlotCaptureBoundaries: () => confirmedNativeSlotCaptureBoundaries,
  contractRepresentationShape: () => contractRepresentationShape,
  correspondingPath: () => correspondingPath,
  createEditorSession: () => createEditorSession,
  createValidationIntent: () => createValidationIntent,
  createWorkspaceFromPreview: () => createWorkspaceFromPreview,
  createZip: () => createZip,
  declaredRootAliasRoles: () => declaredRootAliasRoles,
  declaredTargetIdentityErrors: () => declaredTargetIdentityErrors,
  declaredTargetMembershipKey: () => declaredTargetMembershipKey,
  dependencyBinding: () => dependencyBinding,
  dependencyCaptureFailureDetails: () => dependencyCaptureFailureDetails,
  dependencyCaptureFailureLabel: () => dependencyCaptureFailureLabel,
  dependencyPinIssue: () => dependencyPinIssue,
  dependencyUsageErrors: () => dependencyUsageErrors,
  diagnoseRuleApplicability: () => diagnoseRuleApplicability,
  diagnosticStructure: () => diagnosticStructure,
  editVariantTextTargets: () => editVariantTextTargets,
  effectiveFacts: () => effectiveFacts,
  evaluateCompiledContract: () => evaluateCompiledContract,
  extractAssetCatalogs: () => extractAssetCatalogs,
  extractTextStyleCatalogs: () => extractTextStyleCatalogs,
  extractVariantEvidence: () => extractVariantEvidence,
  factForCapability: () => factForCapability,
  forbiddenConstraintsForEdit: () => forbiddenConstraintsForEdit,
  gradientPaintIssues: () => gradientPaintIssues,
  groupEvaluationDetails: () => groupEvaluationDetails,
  hostContextFacts: () => hostContextFacts,
  importWorkspace: () => importWorkspace,
  inspectRuleFacts: () => inspectRuleFacts,
  intrinsicBounds: () => intrinsicBounds,
  isDeclaredRootTarget: () => isDeclaredRootTarget,
  isolateInstanceBoundaries: () => isolateInstanceBoundaries,
  linkComponentDependencies: () => linkComponentDependencies,
  manualRepresentationShape: () => manualRepresentationShape,
  matchesCaptureRepresentation: () => matchesCaptureRepresentation,
  matchesComponentIdentity: () => matchesComponentIdentity,
  matchesDeclaredTarget: () => matchesDeclaredTarget,
  matchesTargetRole: () => matchesTargetRole,
  materializeDeclaredTargetIdentities: () => materializeDeclaredTargetIdentities,
  materializeDependencyFacts: () => materializeDependencyFacts,
  materializeEffectiveBaseline: () => materializeEffectiveBaseline,
  materializeGradientPaintEvidence: () => materializeGradientPaintEvidence,
  materializeInstanceContentReferences: () => materializeInstanceContentReferences,
  materializeLineHeightReferences: () => materializeLineHeightReferences,
  materializeMemberCollections: () => materializeMemberCollections,
  materializeNativeTargetProperties: () => materializeNativeTargetProperties,
  materializeNestedInstanceContentReferences: () => materializeNestedInstanceContentReferences,
  materializeSemanticFacts: () => materializeSemanticFacts,
  materializeTargetResolution: () => materializeTargetResolution,
  materializeTextBindingIdentities: () => materializeTextBindingIdentities,
  materializeTextContent: () => materializeTextContent,
  materializeTextStyleBindings: () => materializeTextStyleBindings,
  materializeTransitionFacts: () => materializeTransitionFacts,
  materializeValidationIntent: () => materializeValidationIntent,
  materializeValidationMode: () => materializeValidationMode,
  materializeVariantFacts: () => materializeVariantFacts,
  materializeVerifiedVariantTargets: () => materializeVerifiedVariantTargets,
  memberCollectionErrors: () => memberCollectionErrors,
  memberCollectionSummary: () => memberCollectionSummary,
  mergeEditedApplicability: () => mergeEditedApplicability,
  nativeSlotCapturePlan: () => nativeSlotCapturePlan,
  occurrenceSegment: () => occurrenceSegment,
  paintDiagnosticSummary: () => paintDiagnosticSummary,
  parseAssetCatalogs: () => parseAssetCatalogs,
  parseEditorSession: () => parseEditorSession,
  planInstanceContentReferences: () => planInstanceContentReferences,
  planNestedInstanceContentReferences: () => planNestedInstanceContentReferences,
  planTargetRemap: () => planTargetRemap,
  portableDeclaredTargetReferenceHash: () => portableDeclaredTargetReferenceHash,
  prepareAuthoringPreviewContract: () => prepareAuthoringPreviewContract,
  prepareValidationSnapshot: () => prepareValidationSnapshot,
  projectOwnedCodeCollection: () => projectOwnedCodeCollection,
  propertyApplicabilityCondition: () => propertyApplicabilityCondition,
  propertyAvailabilityKey: () => propertyAvailabilityKey,
  provenHiddenRuleTarget: () => provenHiddenRuleTarget,
  publicSwapDeclaredTargetReferenceHash: () => publicSwapDeclaredTargetReferenceHash,
  readZip: () => readZip,
  relativeTargetPath: () => relativeTargetPath,
  representationEvidenceErrors: () => representationEvidenceErrors,
  representationFeatureFlags: () => representationFeatureFlags,
  representationScopeHash: () => representationScopeHash,
  resolveCaptureRepresentation: () => resolveCaptureRepresentation,
  resolveComponentProperty: () => resolveComponentProperty,
  resolveDirectChildBinding: () => resolveDirectChildBinding,
  resolveFixedNestedBinding: () => resolveFixedNestedBinding,
  resolveSnapshotTargets: () => resolveSnapshotTargets,
  restoreInstanceMainAliasBaseline: () => restoreInstanceMainAliasBaseline,
  ruleOwnershipGroup: () => ruleOwnershipGroup,
  safeEvidencePath: () => safeEvidencePath,
  sameManualComponentFamily: () => sameManualComponentFamily,
  samePreviewComponent: () => samePreviewComponent,
  selectedTargetPathHint: () => selectedTargetPathHint,
  sharedUsageContract: () => sharedUsageContract,
  slug: () => slug,
  snapshotPaths: () => snapshotPaths,
  snapshotShape: () => snapshotShape,
  stableHash: () => stableHash,
  stableStringify: () => stableStringify,
  supportedSemanticBinding: () => supportedSemanticBinding,
  targetResolutionReason: () => targetResolutionReason,
  textStyleBindingFact: () => textStyleBindingFact,
  textZipEntry: () => textZipEntry,
  transitionReason: () => transitionReason,
  typedCollectionValue: () => typedCollectionValue,
  uniqueSorted: () => uniqueSorted,
  validRuleOwnership: () => validRuleOwnership,
  validTextStyleCatalog: () => validTextStyleCatalog,
  validateComponentDependencies: () => validateComponentDependencies,
  validateManualSource: () => validateManualSource,
  validateNativeSlotCaptureScope: () => validateNativeSlotCaptureScope,
  validateRuleEdit: () => validateRuleEdit,
  validatedDependencyCapture: () => validatedDependencyCapture,
  validationInputs: () => validationInputs,
  validationIssueLabel: () => validationIssueLabel,
  validationMode: () => validationMode,
  validationSnapshotHash: () => validationSnapshotHash,
  variantAvailability: () => variantAvailability,
  verifyProjectionStamp: () => verifyProjectionStamp,
  withinBoundary: () => withinBoundary,
  zipEntryText: () => zipEntryText
});
module.exports = __toCommonJS(index_exports);

// ../Apollo/packages/component-contract-core/src/types.ts
var LEGACY_MANUAL_SCHEMA_VERSION = "apollo.component-contract.manual.v1-experimental";
var MANUAL_SCHEMA_VERSION = "apollo.component-contract.manual.v2-experimental";
var COMPILED_SCHEMA_VERSION = "apollo.component-contract.v2.1-experimental";

// ../Apollo/packages/component-contract-core/src/capabilities.ts
var CAPABILITY_SETS = {
  "fill@1": [
    "appearance.fill",
    "appearance.fillStyleId"
  ],
  "stroke@1": [
    "appearance.stroke",
    "appearance.strokeStyleId",
    "appearance.strokeWeight",
    "appearance.strokeAlign",
    "appearance.dashPattern"
  ],
  "radius@1": [
    "appearance.radius"
  ],
  "effects@1": [
    "appearance.effects",
    "appearance.effectStyleId"
  ],
  "visual-style@1": [
    "appearance.fill",
    "appearance.stroke",
    "appearance.opacity",
    "appearance.radius",
    "appearance.effects"
  ],
  "auto-layout@1": [
    "layout.mode",
    "layout.padding.top",
    "layout.padding.right",
    "layout.padding.bottom",
    "layout.padding.left",
    "layout.itemSpacing",
    "layout.primaryAxisAlignItems",
    "layout.counterAxisAlignItems",
    "layout.sizingHorizontal",
    "layout.sizingVertical"
  ]
};
var CAPABILITY_SET_LABELS = {
  "fill@1": "\u0417\u0430\u043B\u0438\u0432\u043A\u0430",
  "stroke@1": "\u041E\u0431\u0432\u043E\u0434\u043A\u0430",
  "auto-layout@1": "\u0410\u0432\u0442\u043E\u043B\u0435\u0439\u0430\u0443\u0442",
  "radius@1": "\u0421\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u0438\u0435",
  "effects@1": "\u042D\u0444\u0444\u0435\u043A\u0442\u044B",
  "visual-style@1": "\u0412\u043D\u0435\u0448\u043D\u0438\u0439 \u0432\u0438\u0434"
};
function capabilitiesForSet(capabilitySet) {
  return capabilitySet ? CAPABILITY_SETS[capabilitySet] || [] : [];
}
function factForCapability(capability) {
  if (capability.startsWith("component-property.")) return `component.properties.${capability.slice("component-property.".length)}`;
  if (capability === "visibility") return "visible";
  if (capability === "token.binding") return "variable.bindings";
  return capability;
}
function capabilitySetLabel(capabilitySet) {
  return capabilitySet ? CAPABILITY_SET_LABELS[capabilitySet] || capabilitySet : "";
}

// ../Apollo/packages/component-contract-core/src/text-decoration-facts.ts
function captureTextDecoration(node) {
  try {
    if (node.type !== "TEXT" || typeof node.characters !== "string") return;
    const valid = (v) => typeof v === "string" && ["NONE", "UNDERLINE", "STRIKETHROUGH"].includes(v);
    if (!node.characters.length) return valid(node.textDecoration) ? [node.textDecoration] : void 0;
    const ranges2 = node.getStyledTextSegments(["textDecoration"]);
    if (!Array.isArray(ranges2)) return;
    let end = 0;
    if (!ranges2.every((r) => r && Number.isInteger(r.start) && Number.isInteger(r.end) && r.start === end && r.end > r.start && r.end <= node.characters.length && valid(r.textDecoration) && (end = r.end)) || end !== node.characters.length) return;
    return [...new Set(ranges2.map((r) => r.textDecoration))].sort();
  } catch {
    return;
  }
}

// ../Apollo/packages/component-contract-core/src/property-applicability.ts
var PROPERTY_APPLICABILITY = {
  "appearance.strokeWeight": "stroke-present-either@1",
  "layout.itemSpacing": "flow-gap-either@1",
  "layout.padding.top": "auto-layout-padding-either@1",
  "layout.padding.right": "auto-layout-padding-either@1",
  "layout.padding.bottom": "auto-layout-padding-either@1",
  "layout.padding.left": "auto-layout-padding-either@1",
  "layout.primaryAxisAlignItems": "flow-alignment-either@1",
  "layout.counterAxisAlignItems": "flow-alignment-either@1"
};
var ACTIVITY_FIELDS = {
  "stroke-present-either@1": "strokePresent",
  "flow-gap-either@1": "gapApplicable",
  "auto-layout-padding-either@1": "paddingApplicable",
  "flow-alignment-either@1": "axisAlignmentApplicable"
};
function baselineFactsForRule(rule) {
  const capabilities = rule.capabilitySet ? capabilitiesForSet(rule.capabilitySet).filter((c) => !rule.capabilitySelection || rule.capabilitySelection.includes(c)) : [rule.capability];
  const constraints = rule.permission === "forbidden" && !rule.constraints.length ? [{ type: "propertyForbidden" }] : rule.constraints;
  return [...new Set(capabilities.flatMap((c) => constraints.filter((x) => x.type === "propertyForbidden").map((x) => "fact" in x && x.fact || factForCapability(c))))];
}
function propertyApplicabilityCondition(rule, fact2) {
  const policy = rule.propertyApplicability?.[fact2];
  if (!policy) return;
  const field = ACTIVITY_FIELDS[policy];
  if (!field) throw new Error(`Unsupported property applicability: ${policy}`);
  return { predicate: "any", args: ["", "baseline.effective."].map((prefix) => ({
    predicate: "equals",
    actual: { fact: `${prefix}propertyActivityV1.${field}` },
    expected: { literal: true },
    missingPolicy: "unknown"
  })) };
}
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
          const visible2 = child.visible, positioning = child.layoutPositioning;
          if (visible2 === false || positioning === "ABSOLUTE") continue;
          possible++;
          if (visible2 === true && positioning === "AUTO") certain++;
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

// ../Apollo/packages/component-contract-core/src/stable.ts
init_sha256();
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const object2 = value;
    return `{${Object.keys(object2).filter((key2) => object2[key2] !== void 0).sort().map((key2) => `${JSON.stringify(key2)}:${stableStringify(object2[key2])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
function stableHash(value) {
  return sha256Hex(stableStringify(value));
}
function slug(value) {
  const normalized = value.replace(/^\s*(?:❌|🔒|🔄)?\s*\[[DMT]\]\s*/u, "").replace(/([a-z\d])([A-Z])/g, "$1-$2").normalize("NFKD").replace(/[^a-zA-Z0-9а-яА-ЯёЁ]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return normalized || "target";
}
function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

// ../Apollo/packages/component-contract-core/src/capture-representation.ts
function matchesCaptureRepresentation(rep, componentKey, componentSetKey = "") {
  if (rep.kind !== "figma" || rep.status === "deprecated" || !componentKey) return false;
  const set = rep.locator.componentSetKey;
  if (typeof set === "string" && set) return Boolean(componentSetKey && set === componentSetKey);
  const key2 = rep.locator.componentKey;
  return typeof key2 === "string" && Boolean(key2) && (key2 === componentKey || key2 === componentSetKey);
}
function resolveCaptureRepresentation(representations, componentKey, componentSetKey = "") {
  const matches2 = representations.filter((rep) => matchesCaptureRepresentation(rep, componentKey, componentSetKey));
  if (matches2.length > 1) throw new Error("\u041A\u043B\u044E\u0447 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430 \u0441\u0432\u044F\u0437\u0430\u043D \u0441 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u043C\u0438 Figma-\u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F\u043C\u0438 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430. \u0423\u0442\u043E\u0447\u043D\u0438\u0442\u0435 representations; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430.");
  if (!matches2.length) throw new Error("\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440 \u043D\u0435 \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0441\u044F \u043A Figma-\u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F\u043C \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440 \u044D\u0442\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u0438\u043B\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0435\u0433\u043E \u043F\u0430\u043A\u0435\u0442.");
  if (!matches2[0].platform?.trim()) throw new Error("\u0414\u043B\u044F \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u043E\u0433\u043E Figma-\u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430. \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0430.");
  return matches2[0];
}

// ../Apollo/packages/component-contract-core/src/component-property-identity.ts
function resolveComponentProperty(requested, data, allowedTypes) {
  const names = [.../* @__PURE__ */ new Set([
    ...Object.keys(data.properties || {}),
    ...Object.keys(data.propertyTypes || {}),
    ...data.definedProperties || [],
    ...data.propertyReferences || []
  ])];
  const explicitId = /#[^#]+$/.test(requested);
  const candidates = names.filter((name2) => explicitId ? name2 === requested : name2.replace(/#[^#]+$/, "") === requested);
  if (!candidates.length) return { reason: "property-missing" };
  if (candidates.length !== 1) return { reason: "property-ambiguous" };
  const name = candidates[0], type = data.propertyTypes?.[name], alias = name !== requested;
  if (alias && !["BOOLEAN", "TEXT", "VARIANT", "INSTANCE_SWAP"].includes(String(type)) || allowedTypes && type !== void 0 && !allowedTypes.includes(String(type))) {
    return { reason: "property-type-incompatible" };
  }
  return { name, match: alias ? "alias" : "exact" };
}

// ../Apollo/packages/component-contract-core/src/occurrence-address.ts
function occurrenceSegment(name, sourceId, localId) {
  if (sourceId !== void 0) return "@source:" + encodeURIComponent(sourceId);
  if (localId !== void 0) return "@local:" + encodeURIComponent(localId);
  return name.startsWith("@") || name.includes(" / ") ? "@name:" + encodeURIComponent(name) : name;
}
function catalogOccurrencePaths(tree) {
  const paths = /* @__PURE__ */ new Map();
  const visit = (id, seen = /* @__PURE__ */ new Set()) => {
    if (seen.has(id)) return void 0;
    if (paths.has(id)) return paths.get(id);
    seen.add(id);
    const n = tree.get(id);
    if (!n || typeof n.name !== "string") return void 0;
    if (n.parentId === null) {
      paths.set(id, "");
      return "";
    }
    const p = visit(String(n.parentId), seen);
    if (p === void 0) return void 0;
    const siblings = [...tree].filter(([, other]) => other.parentId === n.parentId && other.name === n.name);
    const segment = siblings.length > 1 ? "@catalog:" + encodeURIComponent(id) : occurrenceSegment(n.name);
    const path = [p, segment].filter(Boolean).join(" / ");
    if ([...paths.values()].includes(path)) return void 0;
    paths.set(id, path);
    return path;
  };
  for (const id of tree.keys()) if (visit(id) === void 0) return void 0;
  return [...paths.values()].filter((p) => p === "").length === 1 ? paths : void 0;
}
function diagnosticStructure(nodes, names) {
  const byPath2 = new Map(nodes.map((n) => [n.path, n]));
  if (byPath2.size !== nodes.length || byPath2.get("")?.type !== "ROOT") return void 0;
  const parent3 = (path) => path.split(" / ").slice(0, -1).join(" / ");
  if (nodes.some((n) => n.path && !byPath2.has(parent3(n.path)))) return void 0;
  const visit = (path) => {
    const node = byPath2.get(path);
    const name = path ? names[path] : "";
    if (typeof name !== "string") return void 0;
    const children = nodes.filter((n) => n.path && parent3(n.path) === path).map((n) => visit(n.path));
    if (children.some((n) => n === void 0)) return void 0;
    return { name, type: node.type, children: children.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) };
  };
  return visit("");
}
function selectedTargetPathHint(target, representationId, componentKey, requireVariant = false) {
  const variants = target.variantHints?.filter((h) => h.representationId === representationId && h.componentKey === componentKey) || [];
  if (variants.length > 1) return void 0;
  if (variants.length === 1) return variants[0].pathHint;
  const hints = target.representationHints?.filter((h) => h.representationId === representationId) || [];
  if (hints.length > 1) return void 0;
  const path = hints[0]?.pathHint || target.pathHint;
  return requireVariant && path?.split(" / ").length !== 1 ? void 0 : path;
}

// ../Apollo/packages/component-contract-core/src/snapshot-topology.ts
function snapshotPaths(snapshot) {
  if (snapshot.selection.length !== 1 || snapshot.source?.truncated !== false || snapshot.source.captureTopology?.complete === false) return void 0;
  const byId = new Map(snapshot.nodes.map((n) => [String(n.id), n]));
  if (byId.size !== snapshot.nodes.length) return void 0;
  const root2 = byId.get(snapshot.selection[0]);
  if (!root2 || root2.parentId !== null) return void 0;
  const paths = /* @__PURE__ */ new Map(), memo = /* @__PURE__ */ new Map();
  const usedPaths = /* @__PURE__ */ new Set(), siblingCounts = /* @__PURE__ */ new Map();
  for (const node of snapshot.nodes) {
    const parent3 = String(node.parentId), name = String(node.name);
    if (!siblingCounts.has(parent3)) siblingCounts.set(parent3, /* @__PURE__ */ new Map());
    const counts = siblingCounts.get(parent3);
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  const pathFor = (node, visited = /* @__PURE__ */ new Set()) => {
    const id = String(node.id);
    if (visited.has(id)) return void 0;
    if (memo.has(id)) return memo.get(id);
    visited.add(id);
    if (node === root2) return "";
    const parent3 = byId.get(String(node.parentId));
    if (!parent3 || !Array.isArray(parent3.childIds) || !parent3.childIds.includes(id)) return void 0;
    const parentPath2 = pathFor(parent3, visited);
    if (parentPath2 === void 0 || typeof node.name !== "string") return void 0;
    let segment = node.name;
    if (snapshot.source?.occurrenceAddressVersion === 1) {
      const siblings = siblingCounts.get(String(node.parentId))?.get(node.name) || 0;
      const source = node.component?.sourceIdentity;
      segment = siblings > 1 ? occurrenceSegment(
        node.name,
        typeof source?.sourceNodeId === "string" && source.sourceNodeId ? source.sourceNodeId : void 0,
        typeof source?.sourceNodeId === "string" && source.sourceNodeId ? void 0 : id
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
    if (!Array.isArray(node.childIds) || new Set(node.childIds).size !== node.childIds.length || node.childIds.some((id) => !byId.has(String(id)) || byId.get(String(id))?.parentId !== node.id)) return void 0;
  }
  return paths;
}
function snapshotShape(snapshot) {
  const paths = snapshotPaths(snapshot);
  return paths && snapshot.nodes.map((n) => ({ path: paths.get(String(n.id)), type: paths.get(String(n.id)) === "" ? "ROOT" : String(n.type) })).sort((a, b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
}

// ../Apollo/packages/component-contract-core/src/declared-target-membership.ts
function declaredTargetMembershipKey(targetId) {
  return `t_${stableHash(targetId)}`;
}
function matchesDeclaredTarget(node, role, contract) {
  const targets = contract.facts.targets.filter((target) => target.semanticRole === role);
  if (targets.length !== 1) return false;
  return node.declaredTargetMembershipV1?.[declaredTargetMembershipKey(targets[0].id)] === true;
}

// ../Apollo/packages/component-contract-core/src/root-target.ts
function isDeclaredRootTarget(target) {
  if (target?.semanticRole === "root") return true;
  if (!target || target.resolution !== "resolved" || target.lineage?.length !== 0) return false;
  const paths = [
    target.pathHint,
    ...(target.representationHints || []).map((h) => h.pathHint),
    ...(target.variantHints || []).map((h) => h.pathHint)
  ].filter((path) => path !== void 0);
  return paths.length > 0 && paths.every((path) => typeof path === "string" && path.length > 0 && path === path.trim() && path.split(" / ").length === 1);
}
function declaredRootAliasRoles(targets) {
  const roots = targets.filter((t) => t.resolution === "resolved" && isDeclaredRootTarget(t));
  const roles = new Set(roots.map((t) => t.semanticRole));
  return roots.length > 1 && roles.size === roots.length ? roles : /* @__PURE__ */ new Set();
}
function matchesTargetRole(node, role, contract) {
  if ([1, 2, 3].includes(contract.runtimePolicy.declaredTargetIdentityVersion || 0)) return matchesDeclaredTarget(node, role, contract);
  return node.semantic?.role === role || contract.runtimePolicy.rootTargetAliasesVersion === 1 && node.rootTargetAliasesV1?.[role] === true;
}

// ../Apollo/packages/component-contract-core/src/public-swap-reference.ts
var parent = (path) => path.split(" / ").slice(0, -1).join(" / ");
var inside = (path, boundary) => path === boundary || path.startsWith(boundary + " / ");
function publicSwapSlots(reference, shape) {
  const root2 = reference.nodeProperties[""], slots = [];
  if (!reference.complete || reference.occurrenceAddressVersion !== 1 || !root2?.identity) return slots;
  for (const target of shape.targets) {
    if (target.resolution !== "resolved") continue;
    const bindings = target.identityBindingsV1?.filter((b) => b.componentKey === reference.componentKey && b.componentSetKey === reference.componentSetKey) || [];
    if (bindings.length !== 1 || bindings[0].nodeType !== "INSTANCE" || !bindings[0].nativeSource) continue;
    const binding = bindings[0], source = binding.nativeSource;
    if (source.ownerComponentKey !== root2.identity.componentKey) continue;
    const policies = shape.policies.filter((p) => p.targetId === target.id && p.targetScope === "self" && p.capability === "component.swap" && p.permission === "allowed" && p.status !== "deprecated" && p.applicability.scopeStatus === "confirmed" && p.applicability.variants === "all" && p.applicability.modes === "all" && (!p.applicability.platforms.length || shape.representations.some((r) => r.id === binding.representationId && p.applicability.platforms.includes(r.platform))) && !p.targetApplicability && !p.propertyApplicability);
    const candidates = reference.nodes.filter((n) => {
      const value2 = reference.nodeProperties[n.path], native = value2?.sourceIdentity;
      return n.type === "INSTANCE" && native?.version === 1 && native.sourceNodeId === source.sourceNodeId && native.ownerComponentKey === source.ownerComponentKey && native.ownerMainComponentId === root2.identity.mainComponentId;
    });
    if (candidates.length !== 1) continue;
    const path = candidates[0].path, value = reference.nodeProperties[path], property = value.propertyReferenceBindings?.mainComponent;
    let owner = parent(path);
    while (owner && !["INSTANCE", "COMPONENT", "SLOT"].includes(reference.nodes.find((n) => n.path === owner)?.type || "")) owner = parent(owner);
    if (owner !== "" || !property || !root2.definedProperties?.includes(property) || root2.propertyTypes[property] !== "INSTANCE_SWAP" || reference.propertyTypes[property] !== "INSTANCE_SWAP" || typeof root2.properties[property] !== "string" || reference.properties[property] !== root2.properties[property] || !value.identity?.componentKey || typeof value.identity.componentSetKey !== "string" || !value.identity.mainComponentId || root2.properties[property] !== value.identity.mainComponentId || reference.nodes.filter((n) => reference.nodeProperties[n.path]?.propertyReferenceBindings?.mainComponent === property).length !== 1 || !policies.some((p) => p.controlPaths.some((c) => c.kind === "slot-api" && c.target === target.id && c.property === property && c.contentOwnership === "external" && c.exclusive === true && c.ownerTargetId === void 0))) continue;
    slots.push({
      referencePath: path,
      bindingPath: binding.referencePath,
      canonicalPath: [parent(path), "@public-swap:" + encodeURIComponent(source.sourceNodeId)].filter(Boolean).join(" / "),
      property
    });
  }
  return slots.filter((s) => !slots.some((other) => other !== s && (inside(s.referencePath, other.referencePath) || inside(other.referencePath, s.referencePath) || s.canonicalPath === other.canonicalPath || s.property === other.property)));
}
function projectPublicSwapStructure(nodes, slots, bindingSide = false) {
  const pathFor = (s) => bindingSide ? s.bindingPath : s.referencePath;
  return nodes.filter((n) => !slots.some((s) => n.path !== pathFor(s) && inside(n.path, pathFor(s)))).map((n) => ({ path: slots.find((s) => n.path === pathFor(s))?.canonicalPath || n.path, type: n.type })).sort((a, b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
}
function projectPublicSwapNames(names, slots, bindingSide = false) {
  const result = Object.assign({}, names);
  for (const slot of slots) {
    const path = bindingSide ? slot.bindingPath : slot.referencePath;
    if (Object.prototype.hasOwnProperty.call(names, path)) result[slot.canonicalPath] = slot.canonicalPath.split(" / ").slice(-1)[0];
  }
  return result;
}
function projectPublicSwapReference(reference, shape) {
  const slots = publicSwapSlots(reference, shape), projected = JSON.parse(JSON.stringify(reference));
  projected.nodes = projectPublicSwapStructure(reference.nodes, slots);
  for (const slot of slots) {
    const value = projected.nodeProperties[slot.referencePath];
    for (const path of Object.keys(projected.nodeProperties)) if (inside(path, slot.referencePath)) delete projected.nodeProperties[path];
    projected.nodeProperties[slot.canonicalPath] = {
      properties: {},
      propertyTypes: {},
      propertyReferences: [],
      diagnosticName: slot.canonicalPath.split(" / ").slice(-1)[0],
      propertyReferenceBindings: value.propertyReferenceBindings,
      sourceIdentity: value.sourceIdentity
    };
    delete projected.properties[slot.property];
    delete projected.nodeProperties[""].properties[slot.property];
  }
  return projected;
}

// ../Apollo/packages/component-contract-core/src/instance-correspondence.ts
var record = (value) => value && typeof value === "object" ? value : {};
var leaf = (path) => path.split(" / ").slice(-1)[0];
function compareInstanceCorrespondence(snapshot, reference, nestedVariants) {
  const parents = /* @__PURE__ */ new Map();
  const parentPath2 = (path) => {
    if (!parents.has(path)) parents.set(path, path.split(" / ").slice(0, -1).join(" / "));
    return parents.get(path);
  };
  const paths = snapshotPaths(snapshot), boundaries = [];
  const referencePaths = {};
  const invalid = () => ({ complete: false, boundaries, referencePaths });
  if (!paths || !reference.complete || !snapshot.source?.componentKey || reference.componentKey !== snapshot.source.componentKey || reference.componentSetKey !== (snapshot.source.componentSetKey || "")) return invalid();
  const actual = new Map(snapshot.nodes.map((n) => [paths.get(String(n.id)), n]));
  const expected = new Map(reference.nodes.map((n) => [n.path, n]));
  if (expected.size !== reference.nodes.length || expected.get("")?.type !== "ROOT") return invalid();
  for (const n of reference.nodes) if (n.path && !expected.has(parentPath2(n.path))) return invalid();
  const actualChildren = /* @__PURE__ */ new Map();
  const referenceChildren = /* @__PURE__ */ new Map();
  for (const entry of actual) if (entry[0]) {
    const parent3 = parentPath2(entry[0]);
    if (!actualChildren.has(parent3)) actualChildren.set(parent3, []);
    actualChildren.get(parent3).push(entry);
  }
  for (const node of reference.nodes) if (node.path) {
    const parent3 = parentPath2(node.path);
    if (!referenceChildren.has(parent3)) referenceChildren.set(parent3, []);
    referenceChildren.get(parent3).push(node);
  }
  const aIdentity = (n) => record(record(n.component).identity);
  const rIdentity = (path) => reference.nodeProperties[path]?.identity;
  const unknown14 = (n, fact2) => (n.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + "."));
  const knownIdentity = (n) => Boolean(typeof aIdentity(n).componentKey === "string" && aIdentity(n).componentKey && !unknown14(n, "component.identity.componentKey") && !unknown14(n, "component.identity.componentSetKey"));
  const compatible = (n, path) => {
    const a = aIdentity(n), b = rIdentity(path);
    if (!knownIdentity(n) || !b?.componentKey) return false;
    if (a.componentSetKey || b.componentSetKey) return Boolean(a.componentSetKey && a.componentSetKey === b.componentSetKey);
    return a.componentKey === b.componentKey;
  };
  const ownerPaths = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
  const ownerFor = (path, nodes) => {
    const owners = ownerPaths[nodes === actual ? 0 : 1];
    if (owners.has(path)) return owners.get(path);
    let p = parentPath2(path);
    while (p && nodes.get(p)?.type !== "INSTANCE") p = parentPath2(p);
    owners.set(path, p);
    return p;
  };
  const actualPort = (path) => {
    const node = actual.get(path), c = record(node.component), property = record(c.propertyReferenceBindings).mainComponent;
    if (property === void 0) return void 0;
    const ownerPath = ownerFor(path, actual), ownerNode = actual.get(ownerPath), owner = record(ownerNode?.component);
    if (typeof property !== "string" || !knownIdentity(node) || typeof c.identity?.mainComponentId !== "string" || record(owner.propertyTypes)[property] !== "INSTANCE_SWAP" || record(owner.properties)[property] !== c.identity.mainComponentId || unknown14(node, "component.propertyReferenceBindings.mainComponent") || unknown14(ownerNode, "component.properties." + property) || unknown14(ownerNode, "component.propertyTypes." + property)) return null;
    return { ownerPath, property };
  };
  const referencePort = (path) => {
    const c = reference.nodeProperties[path], property = c?.propertyReferenceBindings?.mainComponent;
    if (property === void 0) return void 0;
    const ownerPath = ownerFor(path, expected), owner = reference.nodeProperties[ownerPath];
    if (!property || !c.identity?.mainComponentId || owner?.propertyTypes[property] !== "INSTANCE_SWAP" || owner.properties[property] !== c.identity.mainComponentId) return null;
    return { ownerPath, property };
  };
  const readSourcePort = (path, referenceSide) => {
    if (snapshot.source?.instanceSourceIdentityVersion !== 1) return void 0;
    const type = (referenceSide ? expected : actual).get(path)?.type;
    if (type !== "INSTANCE" && (snapshot.source?.occurrenceAddressVersion !== 1 || reference.occurrenceAddressVersion !== 1)) return void 0;
    const node = actual.get(path), c = referenceSide ? reference.nodeProperties[path] : record(node?.component);
    const source = c?.sourceIdentity;
    if (source === void 0) return void 0;
    const ownerPath = ownerFor(path, referenceSide ? expected : actual);
    const ownerNode = actual.get(ownerPath);
    const owner = referenceSide ? reference.nodeProperties[ownerPath]?.identity : ownerNode && aIdentity(ownerNode);
    if (!source || source.version !== 1 || typeof source.sourceNodeId !== "string" || !source.sourceNodeId || typeof source.ownerComponentKey !== "string" || typeof source.ownerMainComponentId !== "string" || typeof owner?.componentKey !== "string" || !owner.componentKey || typeof owner.mainComponentId !== "string" || !owner.mainComponentId || source.ownerComponentKey !== owner.componentKey || source.ownerMainComponentId !== owner.mainComponentId || !referenceSide && (!node || type === "INSTANCE" && !knownIdentity(node) || !ownerNode || !knownIdentity(ownerNode) || ["version", "sourceNodeId", "ownerComponentKey", "ownerMainComponentId"].some((field) => unknown14(node, "component.sourceIdentity." + field)) || unknown14(ownerNode, "component.identity.mainComponentId"))) return null;
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
  const sameSourceOwner = (a, b) => a.ownerMainComponentId === b.ownerMainComponentId || snapshot.source?.instanceMainComponentAliasesVersion === 1 && a.ownerComponentKey === b.ownerComponentKey && a.ownerComponentSetKey === b.ownerComponentSetKey;
  const verifiedSlot = (actualPath, referencePath) => {
    const node = actual.get(actualPath), ref = reference.nodeProperties[referencePath];
    const property = record(record(node?.component).propertyReferenceBindings).slotContentId;
    if (!node || node.type !== "SLOT" || typeof property !== "string" || !property || ref?.propertyReferenceBindings?.slotContentId !== property || unknown14(node, "component.propertyReferenceBindings.slotContentId")) return false;
    const actualOwnerPath = ownerFor(actualPath, actual);
    const expectedOwnerPath = ownerFor(referencePath, expected);
    const actualOwner = actual.get(actualOwnerPath);
    const expectedOwner = reference.nodeProperties[expectedOwnerPath];
    if (!actualOwner || referencePaths[actualOwnerPath] !== expectedOwnerPath || record(record(actualOwner.component).propertyTypes)[property] !== "SLOT" || expectedOwner?.propertyTypes[property] !== "SLOT" || unknown14(actualOwner, `component.propertyTypes.${property}`)) return false;
    const actualConsumers = [...actual].filter(([p, n]) => n.type === "SLOT" && ownerFor(p, actual) === actualOwnerPath && record(record(n.component).propertyReferenceBindings).slotContentId === property);
    const expectedConsumers = reference.nodes.filter((n) => n.type === "SLOT" && ownerFor(n.path, expected) === expectedOwnerPath && reference.nodeProperties[n.path]?.propertyReferenceBindings?.slotContentId === property);
    return actualConsumers.length === 1 && expectedConsumers.length === 1;
  };
  const visibilityPort = (path, referenceSide) => {
    if (snapshot.source?.propertyReferenceIdentityVersion !== 1) return void 0;
    const node = actual.get(path), c = referenceSide ? reference.nodeProperties[path] : record(node?.component);
    const property = c?.propertyReferenceBindings?.visible;
    if (property === void 0) return void 0;
    const ownerPath = ownerFor(path, referenceSide ? expected : actual);
    const owner = referenceSide ? reference.nodeProperties[ownerPath] : record(actual.get(ownerPath)?.component);
    if (typeof property !== "string" || owner?.propertyTypes?.[property] !== "BOOLEAN" || typeof owner.properties?.[property] !== "boolean" || !referenceSide && (!node || !knownIdentity(node) || unknown14(node, "component.propertyReferenceBindings.visible") || unknown14(actual.get(ownerPath), `component.propertyTypes.${property}`) || unknown14(actual.get(ownerPath), `component.properties.${property}`))) return null;
    return { ownerPath, property };
  };
  referencePaths[""] = "";
  const root2 = actual.get(""), rootIdentity = root2 && aIdentity(root2);
  if (!root2 || !knownIdentity(root2) || rootIdentity?.componentKey !== reference.componentKey || (rootIdentity.componentSetKey || "") !== reference.componentSetKey) {
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
          return other?.ownerPath === source.ownerPath && other.sourceNodeId === source.sourceNodeId;
        });
        const matches2 = reference.nodes.filter((n) => {
          if (n.type !== node.type) return false;
          const other = sourcePort(n.path, true);
          return other?.ownerPath === owner && other.sourceNodeId === source.sourceNodeId && sameSourceOwner(source, other);
        });
        if (owner === void 0 || consumers.length !== 1 || matches2.length !== 1 || parentPath2(matches2[0].path) !== expectedParent) return false;
        sourceCandidate = matches2[0];
      }
      if (node.type === "INSTANCE") {
        const typed = refChildren.filter((n) => n.type === "INSTANCE");
        if (port) {
          const owner = referencePaths[port.ownerPath];
          const consumers = [...actual].filter(([p, n]) => {
            if (n.type !== "INSTANCE") return false;
            const other = actualPort(p);
            return other?.ownerPath === port.ownerPath && other.property === port.property;
          });
          const refConsumers = reference.nodes.filter((n) => {
            if (n.type !== "INSTANCE") return false;
            const other = referencePort(n.path);
            return other?.ownerPath === owner && other.property === port.property;
          });
          if (owner === void 0 || consumers.length !== 1 || refConsumers.length !== 1 || parentPath2(refConsumers[0].path) !== expectedParent) return false;
          candidates = refConsumers;
        } else if (visiblePort) {
          const owner = referencePaths[visiblePort.ownerPath];
          const consumers = [...actual].filter(([p, n]) => n.type === "INSTANCE" && (() => {
            const other = visibilityPort(p, false);
            return other?.ownerPath === visiblePort.ownerPath && other.property === visiblePort.property;
          })());
          const matches2 = typed.filter((n) => {
            const other = visibilityPort(n.path, true);
            return other?.ownerPath === owner && other.property === visiblePort.property;
          });
          if (owner !== void 0 && consumers.length === 1 && matches2.length === 1) {
            candidates = matches2;
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
      if (source && candidates[0].path !== sourceCandidate?.path) return false;
      if (reference.occurrenceAddressVersion === 1 && /^@(source|local):/.test(leaf(candidates[0].path)) && !sourceCandidate && !port && !uniqueVisibilityPort) return false;
      const refPath = candidates[0].path;
      claimed.add(refPath);
      referencePaths[path] = refPath;
      if (node.type === "SLOT" && verifiedSlot(path, refPath)) continue;
      if (node.type === "INSTANCE") {
        const identity = aIdentity(node), other = rIdentity(refPath), refPort = referencePort(refPath);
        if (refPort === null || sourcePort(refPath, true) === null || Boolean(port) !== Boolean(refPort)) return false;
        const keysKnown = knownIdentity(node) && Boolean(other?.componentKey);
        const sameSet = Boolean(identity.componentSetKey && identity.componentSetKey === other?.componentSetKey);
        const sameIdentity = keysKnown && identity.componentKey === other.componentKey && (identity.componentSetKey || "") === (other?.componentSetKey || "");
        if (!sameIdentity) {
          const variant = nestedVariants && keysKnown && !port && sameSet;
          boundaries.push({
            nodeId: String(node.id),
            actualPath: path,
            referencePath: refPath,
            reason: !keysKnown ? "instance-identity-unavailable" : port ? "instance-swap" : variant ? "component-variant-changed" : "component-identity-changed",
            ...identity.componentKey ? { actualComponentKey: identity.componentKey } : {},
            ...other?.componentKey ? { referenceComponentKey: other.componentKey } : {},
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
  if (!complete && snapshot.source?.occurrenceAddressVersion === 1 && reference.occurrenceAddressVersion === 1) {
    const claimed = new Set(Object.values(referencePaths));
    const nodes = [...actual].filter(([p]) => p).sort(([a], [b]) => a.split(" / ").length - b.split(" / ").length);
    for (const [path, node] of nodes) {
      if (referencePaths[path] !== void 0 || actualPort(path) !== void 0 || visibilityPort(path, false) === null) continue;
      const source = sourcePort(path, false), parent3 = referencePaths[parentPath2(path)];
      if (!source || parent3 === void 0) continue;
      const owner = referencePaths[source.ownerPath], ownerIdentity = aIdentity(actual.get(source.ownerPath)), expectedOwner = owner !== void 0 ? rIdentity(owner) : void 0;
      if (owner === void 0 || !expectedOwner || ownerIdentity.componentKey !== expectedOwner.componentKey || snapshot.source?.instanceMainComponentAliasesVersion === 1 && (ownerIdentity.componentSetKey || "") !== (expectedOwner.componentSetKey || "") || ownerIdentity.mainComponentId !== expectedOwner.mainComponentId && snapshot.source?.instanceMainComponentAliasesVersion !== 1) continue;
      const consumers = nodes.filter(([p]) => {
        const s = sourcePort(p, false);
        return s?.ownerPath === source.ownerPath && s.sourceNodeId === source.sourceNodeId;
      });
      const candidates = reference.nodes.filter((n) => n.type === node.type && parentPath2(n.path) === parent3 && (() => {
        const s = sourcePort(n.path, true);
        return s?.ownerPath === owner && s.sourceNodeId === source.sourceNodeId && sameSourceOwner(source, s);
      })());
      if (consumers.length !== 1 || candidates.length !== 1 || claimed.has(candidates[0].path) || referencePort(candidates[0].path) !== void 0 || visibilityPort(candidates[0].path, true) === null) continue;
      const refPath = candidates[0].path, a = aIdentity(node), b = rIdentity(refPath);
      if (node.type === "INSTANCE") {
        if (!knownIdentity(node) || !b?.componentKey) continue;
        const same2 = a.componentKey === b.componentKey && (a.componentSetKey || "") === (b.componentSetKey || "");
        if (!same2) {
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
var correspondingPath = (comparison, actualPath) => comparison?.referencePaths ? comparison.referencePaths[actualPath] : actualPath;
function compareInstanceBoundaries(snapshot, reference, nestedVariants = ["apollo.instance-content-references.v2", "apollo.instance-content-references.v3", "apollo.instance-content-references.v4"].includes(snapshot.instanceContentReferences?.schemaVersion || "")) {
  if (!reference.nodeProperties || typeof reference.nodeProperties !== "object" || Array.isArray(reference.nodeProperties)) {
    return { complete: false, boundaries: [], referencePaths: {} };
  }
  if (snapshot.source?.instanceIdentityVersion === 1) return compareInstanceCorrespondence(snapshot, reference, nestedVariants);
  const paths = snapshotPaths(snapshot), shape = snapshotShape(snapshot);
  const boundaries = [];
  const invalid = () => ({ complete: false, boundaries });
  if (!paths || !shape || !reference.complete) return invalid();
  if (!snapshot.source?.componentKey || reference.componentKey !== snapshot.source.componentKey || reference.componentSetKey !== (snapshot.source.componentSetKey || "")) return invalid();
  const actualByPath = new Map(snapshot.nodes.map((n) => [paths.get(String(n.id)), n]));
  const refByPath = new Map(reference.nodes.map((n) => [n.path, n]));
  if (refByPath.size !== reference.nodes.length) return invalid();
  const ownerFor = (path, nodes) => {
    let parent3 = parentPath(path);
    while (parent3) {
      if (nodes.get(parent3)?.type === "INSTANCE") return parent3;
      parent3 = parentPath(parent3);
    }
    return "";
  };
  const actualPort = (path) => {
    const node = actualByPath.get(path), component = record2(node?.component);
    const property = record2(component.propertyReferenceBindings).mainComponent;
    const ownerPath = ownerFor(path, actualByPath), owner = record2(actualByPath.get(ownerPath)?.component);
    if (typeof property !== "string" || record2(owner.propertyTypes)[property] !== "INSTANCE_SWAP" || typeof record2(component.identity).mainComponentId !== "string" || record2(owner.properties)[property] !== record2(component.identity).mainComponentId) return void 0;
    return { ownerPath, property };
  };
  const referencePort = (path) => {
    const data = reference.nodeProperties[path], property = data?.propertyReferenceBindings?.mainComponent;
    const ownerPath = ownerFor(path, refByPath), owner = reference.nodeProperties[ownerPath];
    if (!property || owner?.propertyTypes[property] !== "INSTANCE_SWAP" || !data?.identity?.mainComponentId || owner.properties[property] !== data.identity.mainComponentId) return void 0;
    return { ownerPath, property };
  };
  const instances = [...actualByPath].filter(([path, n]) => path && n.type === "INSTANCE").sort(([a], [b]) => a.split(" / ").length - b.split(" / ").length);
  for (const [path, node] of instances) {
    if (boundaries.some((b) => withinBoundary(path, b.actualPath))) continue;
    const identity = record2(record2(node.component).identity), port = actualPort(path);
    let refPath = refByPath.get(path)?.type === "INSTANCE" ? path : void 0;
    if (port) {
      const consumers = instances.filter(([p]) => {
        const other = actualPort(p);
        return other?.ownerPath === port.ownerPath && other.property === port.property;
      });
      const candidates = reference.nodes.filter((n) => {
        if (n.type !== "INSTANCE") return false;
        const other = referencePort(n.path);
        return other?.ownerPath === port.ownerPath && other.property === port.property;
      });
      if (consumers.length !== 1 || candidates.length !== 1 || parentPath(candidates[0].path) !== parentPath(path)) return invalid();
      refPath = candidates[0].path;
    }
    if (refPath === void 0) return invalid();
    const expected = reference.nodeProperties[refPath]?.identity;
    const keysKnown = typeof identity.componentKey === "string" && Boolean(identity.componentKey) && Boolean(expected?.componentKey);
    if (keysKnown && identity.componentKey === expected.componentKey && path === refPath) continue;
    const sameSet = nestedVariants && keysKnown && !port && path === refPath && typeof identity.componentSetKey === "string" && Boolean(identity.componentSetKey) && identity.componentSetKey === expected?.componentSetKey;
    boundaries.push({
      nodeId: String(node.id),
      actualPath: path,
      referencePath: refPath,
      reason: !keysKnown ? "instance-identity-unavailable" : port ? "instance-swap" : sameSet ? "component-variant-changed" : "component-identity-changed",
      ...sameSet ? { componentSetKey: identity.componentSetKey } : {},
      ...identity.componentKey ? { actualComponentKey: identity.componentKey } : {},
      ...expected?.componentKey ? { referenceComponentKey: expected.componentKey } : {},
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
function isolateInstanceBoundaries(snapshot, boundaries) {
  const paths = snapshotPaths(snapshot);
  if (!paths) return;
  snapshot.instanceBoundaries = boundaries;
  for (const node of snapshot.nodes) {
    const path = paths.get(String(node.id));
    const boundary = boundaries.find((b) => withinBoundary(path, b.actualPath));
    if (!boundary) continue;
    node.baseline = { effective: {} };
    node.baselineProvenance = { status: "unresolved", reason: boundary.reason, boundaryNodeId: boundary.nodeId };
    if (node.semantic && typeof node.semantic === "object") delete node.semantic.role;
  }
}

// ../Apollo/packages/component-contract-core/src/variant-facts.ts
var record3 = (x) => x && typeof x === "object" && !Array.isArray(x) ? x : {};
var relativeTargetPath = (path) => path.split(" / ").slice(1).join(" / ");
var propertyAvailabilityKey = (name) => `p_${stableHash(name).slice(0, 16)}`;
var normalizedType = (type, path) => path === "" ? "ROOT" : type;
var ordered = (nodes) => nodes.slice().sort((a, b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
function extractVariantEvidence(candidates, includeTextBindings = false) {
  const structures = {};
  const variants = [];
  const libraryText = [];
  const textBindings = [];
  const occurrences = [];
  let occurrenceAddresses = false;
  for (const candidate of candidates) {
    const f = record3(candidate.figma);
    if (!Array.isArray(f.structureSignature) || !Array.isArray(f.variants?.variantKeys)) continue;
    const base = f.structureSignature;
    for (const variant of f.variants.variantKeys) {
      const patches = variant.key === f.defaultVariantKey ? [] : f.variantStructures?.[variant.key];
      if (!Array.isArray(patches)) continue;
      const tree = new Map(base.map((node) => [String(node.nodeId), { ...node }]));
      let valid = tree.size === base.length;
      for (const patch of patches) {
        const id = String(patch.id);
        if (patch.op === "remove") {
          if (!tree.delete(id)) valid = false;
        } else if (patch.op === "update" && tree.has(id)) tree.set(id, { ...tree.get(id), ...patch.value });
        else if (patch.op === "add" && !tree.has(id) && patch.value) tree.set(id, { ...patch.value, nodeId: patch.id });
        else valid = false;
      }
      const paths = catalogOccurrencePaths(tree);
      const pathFor = (id) => paths?.get(id);
      const nodes = [...tree].map(([id, node]) => ({ path: pathFor(id), type: node.type }));
      if (!valid || nodes.some((n) => n.path === void 0 || !n.type) || nodes.filter((n) => n.path === "").length !== 1 || new Set(nodes.map((n) => n.path)).size !== nodes.length || !variant.key || !candidate.componentKey) continue;
      const shape = ordered(nodes.map((n) => ({ path: n.path, type: normalizedType(n.type, n.path) })));
      const structureId = stableHash(shape);
      structures[structureId] = shape;
      variants.push({ componentKey: variant.key, componentSetKey: String(candidate.componentKey), structureId, properties: variant.properties || {} });
      occurrences.push({
        componentKey: variant.key,
        componentSetKey: String(candidate.componentKey),
        namesByPath: Object.fromEntries([...tree].map(([id, n]) => [pathFor(id), String(n.name)]))
      });
      occurrenceAddresses ||= shape.some((n) => n.path.split(" / ").some((p) => p.startsWith("@")));
      if (includeTextBindings) textBindings.push({
        componentKey: variant.key,
        componentSetKey: String(candidate.componentKey),
        styleKeysByPath: Object.fromEntries([...tree].filter(([, n]) => n.type === "TEXT" && typeof n.styles?.text?.styleKey === "string").map(([id, n]) => [pathFor(id), n.styles.text.styleKey]))
      });
      const characters = Object.fromEntries([...tree].filter(([, n]) => n.type === "TEXT" && typeof n.text?.characters === "string").map(([id, n]) => [pathFor(id), n.text.characters]));
      if (Object.keys(characters).length) libraryText.push({
        componentKey: variant.key,
        componentSetKey: String(candidate.componentKey),
        properties: variant.properties || {},
        structure: shape,
        characters
      });
    }
  }
  if (!variants.length) return void 0;
  return {
    schemaVersion: "apollo.variant-anatomy.v1",
    sourceHash: stableHash(candidates),
    structures,
    variants,
    ...occurrenceAddresses ? { occurrenceAddressVersion: 1, occurrences } : {},
    ...libraryText.length ? { libraryText } : {},
    ...includeTextBindings ? { textBindings } : {}
  };
}
function captureVariantReference(snapshot, componentKey, componentSetKey, definedProperties) {
  const shape = snapshotShape(snapshot);
  const paths = snapshotPaths(snapshot);
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
  const component = record3(root2?.component);
  const referencesKnown = snapshot.nodes.every((n) => Array.isArray(record3(n.component).propertyReferences));
  const byId = new Map(snapshot.nodes.map((n) => [String(n.id), n]));
  const consumers = /* @__PURE__ */ new Map();
  for (const node of snapshot.nodes) {
    let parent3 = byId.get(String(node.parentId));
    const visited = /* @__PURE__ */ new Set();
    while (parent3 && !visited.has(String(parent3.id))) {
      visited.add(String(parent3.id));
      if (parent3.type === "INSTANCE") {
        const names = consumers.get(String(parent3.id)) || /* @__PURE__ */ new Set();
        (record3(node.component).propertyReferences || []).forEach((name) => names.add(name));
        consumers.set(String(parent3.id), names);
        break;
      }
      parent3 = byId.get(String(parent3.parentId));
    }
  }
  const nodeProperties2 = {};
  for (const node of snapshot.nodes) {
    const component2 = record3(node.component);
    const path = paths?.get(String(node.id)) ?? (node === root2 ? "" : relativeTargetPath(String(record3(node.semantic).path || "")));
    nodeProperties2[path] = {
      properties: component2.properties || {},
      propertyTypes: component2.propertyTypes || {},
      propertyReferences: [...consumers.get(String(node.id)) || []],
      ...snapshot.source?.occurrenceAddressVersion === 1 ? { diagnosticName: String(node.name) } : {},
      ...component2.identity?.componentKey ? { identity: component2.identity } : {},
      ...component2.propertyReferenceBindings ? { propertyReferenceBindings: component2.propertyReferenceBindings } : {},
      ...node === root2 && definedProperties ? { definedProperties } : {}
    };
    if (snapshot.source?.instanceSourceIdentityVersion === 1 && component2.sourceIdentity) nodeProperties2[path].sourceIdentity = component2.sourceIdentity;
  }
  return {
    componentKey,
    componentSetKey,
    complete: Boolean(shape && referencesKnown),
    nodes: shape || [],
    ...snapshot.source?.occurrenceAddressVersion === 1 ? { occurrenceAddressVersion: 1 } : {},
    properties: component.properties || {},
    propertyTypes: component.propertyTypes || {},
    propertyReferences: [...consumers.get(String(root2?.id)) || []],
    nodeProperties: nodeProperties2,
    ...definedProperties ? { definedProperties } : {}
  };
}
function variantAvailability(snapshot, contract) {
  const unknown14 = (reason) => ({ status: "unknown", reason, targets: {} });
  const evidence = contract.facts.variantEvidence, ref = snapshot.variantReference;
  if (!evidence || !ref?.complete || !ref.nodeProperties || typeof ref.nodeProperties !== "object" || Array.isArray(ref.nodeProperties) || !snapshotShape(snapshot)) return unknown14("incomplete-variant-evidence");
  if (ref.componentKey !== snapshot.source?.componentKey || ref.componentSetKey !== (snapshot.source?.componentSetKey ?? "")) return unknown14("reference-identity-mismatch");
  const variants = evidence.variants.filter((v) => v.componentKey === ref.componentKey && (v.componentSetKey === ref.componentSetKey || ref.componentSetKey === "" && v.componentSetKey === v.componentKey));
  if (variants.length !== 1) return unknown14("variant-key-unresolved");
  const variant = variants[0], shape = evidence.structures[variant.structureId];
  const externalSlots = contract.runtimePolicy?.declaredTargetConfigurationVersion === 2 ? publicSwapSlots(ref, { targets: contract.facts.targets, policies: contract.customizationPolicy, representations: contract.facts.representations }) : [];
  const occurrenceMode = evidence.occurrenceAddressVersion === 1;
  if (occurrenceMode && contract.runtimePolicy?.occurrenceAddressVersion !== 1) return unknown14("occurrence-policy-version-unavailable");
  if (occurrenceMode && ref.occurrenceAddressVersion !== 1) return unknown14("occurrence-reference-version-unavailable");
  if (occurrenceMode) {
    const catalogs = evidence.occurrences?.filter((o) => o.componentKey === variant.componentKey && o.componentSetKey === variant.componentSetKey) || [];
    const expected = shape && catalogs.length === 1 ? diagnosticStructure(projectPublicSwapStructure(shape, externalSlots, true), projectPublicSwapNames(catalogs[0].namesByPath, externalSlots, true)) : void 0;
    const observed = diagnosticStructure(projectPublicSwapStructure(ref.nodes, externalSlots), projectPublicSwapNames(Object.fromEntries(Object.entries(ref.nodeProperties).map(([p, n]) => [p, n.diagnosticName])), externalSlots));
    if (expected === void 0 || observed === void 0 || stableHash(expected) !== stableHash(observed)) return unknown14("reference-catalog-structure-drift");
  } else if (!shape || (externalSlots.length ? stableHash(projectPublicSwapStructure(ref.nodes, externalSlots)) !== stableHash(projectPublicSwapStructure(shape, externalSlots, true)) : stableHash(ordered(ref.nodes)) !== stableHash(shape))) return unknown14("reference-catalog-structure-drift");
  const scoped = ["variant-facts-v4", "dependency-facts-v5"].includes(contract.package.snapshotProfile || "");
  const comparison = scoped ? compareInstanceBoundaries(snapshot, ref) : void 0;
  if (occurrenceMode && comparison?.referencePaths?.[""] !== "") return unknown14("root-correspondence-unavailable");
  if (scoped ? !comparison?.complete && !occurrenceMode : stableHash(snapshotShape(snapshot)) !== stableHash(shape)) return unknown14("instance-structure-needs-remap");
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
  const standaloneRaw = ref.componentSetKey === "" && variant.componentSetKey === variant.componentKey && Object.keys(variant.properties).length === 1 && typeof variant.properties.raw === "string" && !Object.prototype.hasOwnProperty.call(ref.propertyTypes, "raw") && !Object.prototype.hasOwnProperty.call(record3(record3(root2?.component).propertyTypes), "raw");
  if (Object.entries(variant.properties).some(([key2, value]) => !(standaloneRaw && key2 === "raw") && (record3(record3(root2?.component).properties)[key2] !== value || ref.properties[key2] !== value))) return unknown14("variant-properties-mismatch");
  const reps = contract.facts.representations.filter((r) => r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
  if (reps.length !== 1) return unknown14("representation-unresolved");
  const targets = {};
  const siblings = evidence.variants.filter((v) => v.componentSetKey === variant.componentSetKey);
  for (const target of contract.facts.targets) {
    const bindings = target.variantHints?.filter((h) => h.representationId === reps[0].id && h.componentKey === ref.componentKey) || [];
    const defaultHint = target.representationHints?.find((h) => h.representationId === reps[0].id)?.pathHint || target.pathHint;
    const hint = bindings.length === 1 ? bindings[0].pathHint : bindings.length > 1 ? void 0 : defaultHint;
    const path = hint ? relativeTargetPath(hint) : void 0;
    const witnessed = occurrenceMode ? path !== void 0 && (path === "" || bindings.length === 1) && ref.nodes.some((n) => n.path === path) && Boolean(comparison?.referencePaths && Object.values(comparison.referencePaths).includes(path)) : path !== void 0 && siblings.some((v) => evidence.structures[v.structureId]?.some((n) => n.path === path));
    const isolated = path !== void 0 && comparison?.boundaries.some((b) => withinBoundary(path, b.referencePath) || withinBoundary(path, b.actualPath));
    targets[target.semanticRole] = !witnessed || isolated || target.resolution === "ambiguous" || target.resolution === "unknown" ? { state: "unknown" } : { state: (occurrenceMode ? ref.nodes : shape).some((n) => n.path === path) ? "present" : "absent", path };
  }
  const aliases = contract.runtimePolicy?.rootTargetAliasesVersion === 1 ? declaredRootAliasRoles(contract.facts.targets) : /* @__PURE__ */ new Set();
  for (const target of Object.values(targets)) {
    const collisions = Object.entries(targets).filter(([, t]) => t.path === target.path);
    if (target.path !== void 0 && collisions.length > 1 && !(target.path === "" && collisions.every(([role]) => aliases.has(role)))) target.state = "unknown";
  }
  return {
    status: comparison?.boundaries.length || occurrenceMode && !comparison?.complete ? "partial" : "verified",
    reason: occurrenceMode && !comparison?.complete ? "occurrence-correspondence-incomplete" : comparison?.boundaries.length ? "verified-outside-instance-boundaries" : "catalog-and-live-reference-agree",
    targets,
    ...scoped ? { boundaries: comparison.boundaries } : {}
  };
}
function materializeVariantFacts(snapshot, contract) {
  snapshot.nodes.forEach((node) => {
    delete node.rootTargetAliasesV1;
  });
  const availability = variantAvailability(snapshot, contract);
  const scoped = ["variant-facts-v4", "dependency-facts-v5"].includes(contract.package.snapshotProfile || "");
  if (scoped) {
    delete snapshot.instanceBoundaries;
    isolateInstanceBoundaries(snapshot, availability.boundaries || []);
  }
  const ref = snapshot.variantReference;
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
  if (contract.runtimePolicy.rootTargetAliasesVersion === 1 && availability.status !== "unknown" && root2 && ref) {
    const identity = record3(record3(root2.component).identity), expected = ref.nodeProperties[""]?.identity;
    const missingIdentity = (root2.unknownFacts || []).some((p) => p === "component" || p === "component.identity" || p.startsWith("component.identity."));
    if (expected && !missingIdentity && typeof identity.mainComponentId === "string" && identity.mainComponentId.length > 0 && identity.componentKey === expected.componentKey && identity.mainComponentId === expected.mainComponentId && (identity.componentSetKey || "") === (expected.componentSetKey || "")) {
      const roles = [...declaredRootAliasRoles(contract.facts.targets)].filter((role) => availability.targets[role]?.state === "present" && availability.targets[role].path === "");
      for (const node of snapshot.nodes) node.rootTargetAliasesV1 = Object.fromEntries(roles.map((role) => [role, node === root2]));
    }
  }
  const rootPath = record3(root2?.semantic).path;
  const byPath2 = /* @__PURE__ */ new Map();
  const structuralPaths = scoped ? snapshotPaths(snapshot) : void 0;
  const correspondence = snapshot.source?.instanceIdentityVersion === 1 && ref ? compareInstanceBoundaries(snapshot, ref) : void 0;
  for (const node of snapshot.nodes) {
    const path = structuralPaths?.get(String(node.id)) ?? (node === root2 ? "" : relativeTargetPath(String(record3(node.semantic).path || "")));
    if (node !== root2 && !record3(node.semantic).path?.startsWith(`${rootPath} / `)) continue;
    const referencePath = correspondingPath(correspondence, path);
    if (referencePath !== void 0) byPath2.set(referencePath, [...byPath2.get(referencePath) || [], node]);
  }
  const targetFacts = {};
  const properties = {};
  const propertyAvailable = (name, data) => {
    const resolved = resolveComponentProperty(name, data);
    if (!("name" in resolved)) return void 0;
    name = resolved.name;
    const type = data.propertyTypes[name];
    if (type === "VARIANT") return true;
    if (["BOOLEAN", "TEXT", "INSTANCE_SWAP"].includes(String(type))) return data.propertyReferences.includes(name);
    if (!Object.prototype.hasOwnProperty.call(data.properties, name) && data.definedProperties?.includes(name)) return false;
    return void 0;
  };
  for (const [role, target] of Object.entries(availability.targets)) {
    if (target.state === "unknown" || target.path === void 0) continue;
    const actual = byPath2.get(target.path) || [];
    if (actual.length === 1) {
      record3(actual[0].semantic).role = role;
      targetFacts[role] = { present: true, referenceState: target.state };
    } else if (actual.length === 0 && target.state === "absent") targetFacts[role] = { present: false, referenceState: "absent" };
  }
  if (availability.status !== "unknown" && ref) {
    const reps = contract.facts.representations.filter((r) => r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
    for (const property of contract.facts.semanticApi) {
      const surfaceBindings = property.bindings.filter((b) => b.representationId === reps[0]?.id && b.path === "representation.surface" && b.transform === "identity");
      if (reps.length === 1 && surfaceBindings.length === 1 && record3(record3(root2?.semanticBindingEvidence)[property.id]).reason === "resolved") {
        properties[property.id] = true;
      }
      const bindings = property.bindings.filter((b) => b.representationId === reps[0]?.id && b.path.startsWith("component.properties."));
      if (bindings.length !== 1) continue;
      const name = bindings[0].path.slice("component.properties.".length);
      const supported = propertyAvailable(name, ref);
      if (supported !== void 0) properties[property.id] = supported;
    }
  }
  for (const node of snapshot.nodes) {
    const componentProperties = {};
    const path = structuralPaths?.get(String(node.id)) ?? (node === root2 ? "" : relativeTargetPath(String(record3(node.semantic).path || "")));
    const isolated = availability.boundaries?.some((b) => withinBoundary(path, b.actualPath));
    const referencePath = correspondingPath(correspondence, path);
    const reference = availability.status !== "unknown" && !isolated && referencePath !== void 0 ? ref?.nodeProperties?.[referencePath] : void 0;
    if (reference) {
      const names = /* @__PURE__ */ new Set([...Object.keys(reference.properties), ...contract.capabilities.facts.filter((f) => f.startsWith("component.properties.")).map((f) => f.slice("component.properties.".length))]);
      for (const name of names) {
        const supported = propertyAvailable(name, reference);
        if (supported !== void 0) componentProperties[propertyAvailabilityKey(name)] = supported;
      }
    }
    node.variantAvailability = { ...availability, targets: targetFacts, properties, componentProperties, isRoot: node === root2 };
    const unknown14 = new Set((node.unknownFacts || []).filter((p) => !p.startsWith("variantAvailability.")));
    for (const target of contract.facts.targets) {
      if (targetFacts[target.semanticRole]?.present === void 0) unknown14.add(`variantAvailability.targets.${target.semanticRole}.present`);
    }
    for (const property of contract.facts.semanticApi) {
      if (properties[property.id] === void 0) unknown14.add(`variantAvailability.properties.${property.id}`);
    }
    for (const fact2 of contract.capabilities.facts.filter((f) => f.startsWith("variantAvailability.componentProperties."))) {
      if (componentProperties[fact2.slice("variantAvailability.componentProperties.".length)] === void 0) unknown14.add(fact2);
    }
    node.unknownFacts = [...unknown14];
  }
}
function materializeVerifiedVariantTargets(snapshot, contract) {
  if (contract.runtimePolicy.semanticTargetVisibilityVersion !== 1 || !["variant-facts-v4", "dependency-facts-v5"].includes(contract.package.snapshotProfile || "") || snapshot.instanceContentReferences?.schemaVersion !== "apollo.instance-content-references.v4") return;
  const ref = snapshot.variantReference, paths = snapshotPaths(snapshot);
  if (!ref || !paths) return;
  const comparison = compareInstanceBoundaries(snapshot, ref);
  if (!comparison.complete || !comparison.boundaries.some((b) => b.reason === "component-variant-changed")) return;
  const availability = variantAvailability(snapshot, contract);
  if (availability.status !== "partial") return;
  const reps = contract.facts.representations.filter((r) => r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
  if (reps.length !== 1) return;
  const candidates = [];
  for (const target of contract.facts.targets) {
    if (target.resolution !== "resolved") continue;
    const hints = target.representationHints?.filter((h) => h.representationId === reps[0].id) || [];
    if (hints.length > 1) continue;
    const variantHints = contract.runtimePolicy.assetIdentityLockVersion === 1 ? target.variantHints?.filter((h) => h.representationId === reps[0].id && h.componentKey === ref.componentKey) || [] : [];
    if (variantHints.length > 1) continue;
    const hint = variantHints[0]?.pathHint || hints[0]?.pathHint || target.pathHint;
    if (!hint) continue;
    const path = relativeTargetPath(hint);
    const boundaries = comparison.boundaries.filter((b) => b.referencePath === path && b.reason === "component-variant-changed");
    if (boundaries.length !== 1) continue;
    const boundary = boundaries[0];
    const results = snapshot.instanceContentResults?.filter((r) => r.boundaryNodeId === boundary.nodeId) || [];
    if (results.length !== 1 || !results[0].lineageProven || !(results[0].status === "matched" || contract.runtimePolicy.assetIdentityLockVersion === 1 && results[0].status === "partial") || !results[0].matchedNodeIds.includes(boundary.nodeId)) continue;
    const nodes = snapshot.nodes.filter((n) => n.id === boundary.nodeId && paths.get(String(n.id)) === boundary.actualPath);
    if (nodes.length !== 1 || nodes[0].type !== "INSTANCE") continue;
    const node = nodes[0], provenance = record3(node.baselineProvenance);
    if (provenance.status !== "matched" || provenance.kind !== "independent-host-variant" || provenance.boundaryNodeId !== boundary.nodeId || provenance.componentKey !== boundary.actualComponentKey) continue;
    candidates.push({ role: target.semanticRole, node });
  }
  for (const { role, node } of candidates) {
    if (contract.facts.targets.filter((t) => t.semanticRole === role).length !== 1 || candidates.filter((c) => c.node.id === node.id).length !== 1 || snapshot.nodes.some((n) => n !== node && record3(n.semantic).role === role)) continue;
    record3(node.semantic).role = role;
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "semantic.role");
    for (const entry of snapshot.nodes) {
      const facts2 = record3(entry.variantAvailability);
      facts2.targets = { ...record3(facts2.targets), [role]: { present: true, referenceState: "present", evidence: "independent-host-variant-root" } };
      entry.variantAvailability = facts2;
      entry.unknownFacts = (entry.unknownFacts || []).filter((p) => p !== `variantAvailability.targets.${role}.present`);
    }
  }
}

// ../Apollo/packages/component-contract-core/src/representation-evidence.ts
var hash = /^[a-f0-9]{64}$/;
var record4 = (v) => Boolean(v) && typeof v === "object" && !Array.isArray(v);
var closed = (v, keys) => record4(v) && Object.keys(v).every((k) => keys.includes(k)) && keys.every((k) => Object.prototype.hasOwnProperty.call(v, k));
var text = (v) => typeof v === "string" && Boolean(v.trim());
var strings = (v) => Array.isArray(v) && v.every(text) && new Set(v).size === v.length;
var safeEvidencePath = (v) => text(v) && !v.startsWith("/") && !v.includes("\\") && !v.split("/").some((p) => !p || p === "." || p === "..") && !/[:\x00-\x1f]/.test(v);
var refs = (v) => Array.isArray(v) && v.length <= 64 && v.every((r) => closed(r, ["path", "sha256"]) && safeEvidencePath(r.path) && hash.test(r.sha256)) && new Set(v.map((r) => r.path)).size === v.length;
function manualRepresentationShape(m) {
  return { representations: m.representations, semanticApi: m.semanticApi, targets: m.targets, dependencies: m.componentDependencies || [], profiles: m.generation.profiles, slots: m.rules.filter((r) => r.status !== "deprecated" && r.permission !== "forbidden").flatMap((r) => r.controlPaths) };
}
function contractRepresentationShape(c) {
  return { representations: c.facts.representations, semanticApi: c.facts.semanticApi, targets: c.facts.targets, dependencies: c.componentDependencies || [], profiles: c.facts.generation.profiles, slots: c.customizationPolicy.filter((r) => r.status !== "deprecated" && r.permission !== "forbidden").flatMap((r) => r.controlPaths) };
}
function representationEvidenceErrors(s) {
  const errors = [];
  const add = (path, message) => errors.push(path + ": " + message);
  for (const [i, r] of s.representations.entries()) if (r.codeEvidence !== void 0) {
    const p = "representations/" + i + "/codeEvidence", e = r.codeEvidence;
    if (r.kind !== "code" || !closed(e, ["version", "sourcePin", "availability", "parity", "acceptance", "publication"]) || e.version !== 1) {
      add(p, "unsupported evidence version/shape or representation kind");
      continue;
    }
    if (!record4(e.sourcePin) || !record4(e.availability) || !record4(e.parity) || !record4(e.acceptance) || !record4(e.publication)) {
      add(p, "invalid evidence sections");
      continue;
    }
    const pin = e.sourcePin;
    if (!closed(pin, ["packageName", "packageVersion", "commit", "registryDigest", "mappingId"]) || !text(pin.packageName) || !text(pin.packageVersion) || !/^[a-f0-9]{40}$/.test(pin.commit) || !hash.test(pin.registryDigest) || !text(pin.mappingId)) add(p, "exact code source pin required");
    if (pin.packageName !== r.locator.packageName || pin.packageVersion !== r.locator.packageVersion || pin.commit !== r.locator.sourceCommit || pin.registryDigest !== r.locator.registryDigest || pin.mappingId !== r.locator.mappingId) add(p, "source pin differs from representation locator");
    if (!closed(e.availability, ["status", "evidenceRefs"]) || !["confirmed-source-api", "unresolved"].includes(e.availability.status) || !refs(e.availability.evidenceRefs) || e.availability.status === "confirmed-source-api" && !e.availability.evidenceRefs.length) add(p, "availability requires exact evidence refs");
    if (!closed(e.parity, ["status", "profileIds", "unresolvedGapIds"]) || !["not-confirmed", "accepted-for-profile"].includes(e.parity.status) || !strings(e.parity.profileIds) || !strings(e.parity.unresolvedGapIds)) add(p, "invalid parity claim");
    else if (e.parity.status === "accepted-for-profile" && (!e.parity.profileIds.length || e.parity.unresolvedGapIds.length || e.parity.profileIds.some((id) => s.profiles.filter((p2) => p2.id === id && p2.representationId === r.id && p2.platform === r.platform).length !== 1))) add(p, "accepted parity requires declared profiles and no unresolved gaps");
    if (!closed(e.acceptance, ["status", "receiptRefs"]) || !["not-run", "accepted"].includes(e.acceptance.status) || !refs(e.acceptance.receiptRefs) || e.acceptance.status === "accepted" && (!e.acceptance.receiptRefs.length || e.parity.status !== "accepted-for-profile")) add(p, "acceptance requires profile parity and receipt refs");
    if (!closed(e.publication, ["status"]) || !["not-confirmed", "published"].includes(e.publication.status) || e.publication.status === "published" && e.acceptance.status !== "accepted") add(p, "publication requires accepted evidence");
  }
  const addresses = /* @__PURE__ */ new Set();
  for (const [i, api] of s.semanticApi.entries()) for (const [j, b] of api.bindings.entries()) {
    const p = "semanticApi/" + i + "/bindings/" + j, rep = s.representations.find((r) => r.id === b.representationId);
    if ([b.codeTransform, b.ownedOccurrence, b.nativeSlotBinding].every((v) => v === void 0)) continue;
    const address = [b.representationId, b.ownedOccurrence ? b.targetId : b.nativeSlotBinding ? "native-slot" : "root", b.path].join("|");
    if (addresses.has(address)) add(p, "duplicate typed code address");
    addresses.add(address);
    if (rep?.kind !== "code" || rep.codeEvidence?.version !== 1 || [b.codeTransform, b.ownedOccurrence, b.nativeSlotBinding].filter((v) => v !== void 0).length !== 1 || b.transform !== void 0) add(p, "exactly one typed code binding is required; free transform is not allowed");
    if (b.codeTransform !== void 0) {
      const t = b.codeTransform;
      if (!record4(t)) {
        add(p, "invalid code transform");
        continue;
      }
      if (t.version !== 1 || (t.id === "identity" ? !closed(t, ["version", "id"]) : t.id !== "enum-map" || !closed(t, ["version", "id", "entries"]) || !Array.isArray(t.entries) || !t.entries.length || !api.domain?.length || t.entries.length !== api.domain.length || t.entries.some((e) => !closed(e, ["from", "to"]) || !api.domain?.some((v) => stableHash(v) === stableHash(e.from)) || !["string", "number", "boolean"].includes(typeof e.to) || typeof e.to === "number" && !Number.isFinite(e.to)) || new Set(t.entries?.map((e) => stableHash(e.from))).size !== t.entries?.length)) add(p, "unknown transform or incomplete enum map");
      if (!["boolean", "string", "number", "enum"].includes(api.valueType) || !/^props\.[A-Za-z][A-Za-z0-9]*$/.test(b.path) || ["props.key", "props.ref", "props.children", "props.elements"].includes(b.path) || b.targetId !== void 0) add(p, "scalar transform requires an explicit public scalar prop");
    }
    if (b.ownedOccurrence !== void 0) {
      const o = b.ownedOccurrence;
      if (!closed(o, ["version", "dependencyId", "dependencyBindingId", "sourceRepresentationId", "collectionResolver", "sourceProperty", "transformId"]) || o.version !== 1) {
        add(p, "unknown owned-occurrence binding");
        continue;
      }
      const resolver = o.collectionResolver, source = o.sourceProperty;
      if (!record4(resolver) || !record4(source)) {
        add(p, "invalid owned capture resolver");
        continue;
      }
      if (!closed(resolver, ["version", "source", "ownerTargetId", "visibility", "ordering"]) || resolver.version !== 1 || resolver.source !== "trusted-native-capture" || resolver.visibility !== "captured-effective" || resolver.ordering !== "captured-source-order") add(p, "closed trusted collection resolver required");
      if (!closed(source, ["property", "propertyType"]) || !text(source.property)) add(p, "typed source property required");
      const target = s.targets.filter((t) => t.id === b.targetId), owner = s.targets.filter((t) => t.id === resolver.ownerTargetId), figma = s.representations.find((r) => r.id === o.sourceRepresentationId);
      const dependencies = s.dependencies.filter((d) => d.id === o.dependencyId), direct = dependencies[0]?.bindings.filter((d) => d.id === o.dependencyBindingId);
      if (target.length !== 1 || target[0].resolution !== "resolved" || owner.length !== 1 || owner[0].resolution !== "resolved" || figma?.kind !== "figma" || figma.platform !== rep?.platform || dependencies.length !== 1 || direct?.length !== 1 || direct[0].kind !== "direct-child" || direct[0].targetRole !== target[0].semanticRole || direct[0].ownerTargetRole !== owner[0].semanticRole || !direct[0].representationIds.includes(o.sourceRepresentationId) || !target[0].variantHints?.some((h) => h.representationId === figma.id && h.pathHint.includes("@source:"))) add(p, "owned target requires exact declared direct dependency and source addresses");
      const forms = {
        "owned-button-label.v1": ["props.elements[].children", "TEXT", "content", "string"],
        "owned-button-disabled.v1": ["props.elements[].disabled", "VARIANT", "state", "enum"],
        "owned-button-primary-first.v1": ["props.primaryFirst", "VARIANT", "appearance", "enum"]
      };
      const f = forms[o.transformId];
      if (!f || b.path !== f[0] || source.propertyType !== f[1] || api.kind !== f[2] || api.valueType !== f[3]) add(p, "unsupported owned field transformation");
      if (o.transformId === "owned-button-disabled.v1" && stableHash(api.domain) !== stableHash(["False", "True"])) add(p, "disabled conversion requires exact False/True domain");
      if (o.transformId === "owned-button-primary-first.v1" && stableHash(api.domain) !== stableHash(["Primary", "Secondary"])) add(p, "view conversion requires exact Primary/Secondary domain");
    }
    if (b.nativeSlotBinding !== void 0) {
      const n = b.nativeSlotBinding;
      if (!closed(n, ["version", "figmaRepresentationId", "targetId", "propertyIdentity", "propertyType", "codeRepresentationId", "codePath", "contentPolicy", "proof"]) || n.version !== 1 || n.propertyType !== "SLOT" || n.codePath !== "props.children" || n.contentPolicy !== "preserve-ordered-content" || n.proof !== "trusted-native-capture") {
        add(p, "unknown native SLOT association");
        continue;
      }
      const figma = s.representations.find((r) => r.id === n.figmaRepresentationId), targets = s.targets.filter((t) => t.id === n.targetId);
      if (b.path !== n.codePath || b.representationId !== n.codeRepresentationId || b.targetId !== void 0 && b.targetId !== n.targetId || api.kind !== "slot" || api.valueType !== "content" || figma?.kind !== "figma" || figma.platform !== rep?.platform || targets.length !== 1 || targets[0].resolution !== "resolved" || !text(n.propertyIdentity) || !api.bindings.some((f) => f.representationId === figma.id && f.path === "component.properties." + n.propertyIdentity) || !s.slots.some((c) => c.kind === "slot-api" && c.target === n.targetId && c.property === n.propertyIdentity && c.contentOwnership === "external")) add(p, "SLOT association requires an existing exact Figma port/target and ordered children API");
    }
  }
  return errors;
}
function representationFeatureFlags(s) {
  const scopedDependencies = s.dependencies.some((d) => d.bindings?.some((b) => b.kind === "fixed-nested-scoped"));
  const bindings = scopedDependencies || s.semanticApi.some((p) => p.bindings.some((b) => b.codeTransform !== void 0 || b.ownedOccurrence !== void 0 || b.nativeSlotBinding !== void 0));
  return { evidence: s.representations.some((r) => r.codeEvidence !== void 0), bindings, scopedDependencies, bindingVersion: scopedDependencies ? 2 : bindings ? 1 : void 0 };
}
function representationScopeHash(manual, facts2) {
  const copy = JSON.parse(JSON.stringify(manual));
  for (const r of copy.representations) delete r.codeEvidence;
  delete copy.metadata.revision;
  delete copy.metadata.updatedAt;
  delete copy.source.importedAt;
  return stableHash({ manual: copy, facts: facts2 });
}
function applyCodeTransform(value, t) {
  if (t.version !== 1) throw new Error("CODE_TRANSFORM_UNSUPPORTED");
  if (t.id === "identity" && ["string", "number", "boolean"].includes(typeof value)) return value;
  if (t.id === "enum-map") {
    const matches2 = t.entries.filter((e) => stableHash(e.from) === stableHash(value));
    if (matches2.length === 1) return matches2[0].to;
  }
  throw new Error("CODE_TRANSFORM_VALUE_UNSUPPORTED");
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
function record5(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function semanticRole(node) {
  const semantic = record5(node.semantic);
  return typeof semantic.role === "string" ? semantic.role : "";
}
function intrinsicBounds(value) {
  const bounds = record5(value), result = {};
  for (const key2 of ["width", "height"]) {
    const size = bounds[key2];
    if (typeof size === "number" && Number.isFinite(size) && size >= 0) result[key2] = size;
  }
  return result;
}
function effectiveFacts(node, includeDimensions = false) {
  const result = {};
  EFFECTIVE_FACT_KEYS.forEach((key2) => {
    if (Object.prototype.hasOwnProperty.call(node, key2)) result[key2] = node[key2];
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
  const result = cloneSnapshot(actual);
  if (strictInstanceBoundaries) {
    const actualPaths = snapshotPaths(actual), referencePaths = snapshotPaths(reference);
    const ref = captureVariantReference(reference, reference.source?.componentKey || "", reference.source?.componentSetKey || "");
    const comparison = compareInstanceBoundaries(actual, ref);
    const byPath2 = new Map(reference.nodes.map((node) => [referencePaths?.get(String(node.id)), node]));
    const unmatchedNodeIds2 = [];
    let matchedNodes2 = 0;
    result.nodes = result.nodes.map((node) => {
      const path = actualPaths?.get(String(node.id));
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
    const node = record5(candidate);
    const role = semanticRole(node);
    if (role && !referenceByRole.has(role)) referenceByRole.set(role, node);
  });
  let matchedNodes = 0;
  const unmatchedNodeIds = [];
  result.nodes = result.nodes.map((candidate, index) => {
    const node = record5(candidate);
    const role = semanticRole(node);
    const referenceNode = referenceByRole.get(role) || (index === 0 ? record5(reference.nodes[0]) : void 0);
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
function allowedComponentPropertyNames(contract) {
  const names = /* @__PURE__ */ new Set();
  contract.customizationPolicy.forEach((policy) => {
    if (policy.permission === "forbidden") return;
    const prefixes = ["component.properties.", "component-property."];
    const prefix = prefixes.find((candidate) => policy.capability.startsWith(candidate));
    if (prefix) names.add(policy.capability.slice(prefix.length));
    policy.controlPaths.forEach((path) => {
      if ((path.kind === "host-property" || path.kind === "nested-property") && path.property) {
        names.add(path.property);
      }
    });
  });
  return Array.from(names).sort((left, right) => left.localeCompare(right));
}
function matchesComponentIdentity(mainComponentKey, componentSetKey, acceptedKeys) {
  const accepted = new Set(acceptedKeys.filter(Boolean));
  return accepted.has(mainComponentKey) || Boolean(componentSetKey && accepted.has(componentSetKey));
}

// ../Apollo/packages/component-contract-core/src/host-context-variable-modes.ts
var record6 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var object = (v) => Boolean(v && typeof v === "object" && !Array.isArray(v));
var unknown = (n, fact2) => (n.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + ".") || p.startsWith(fact2 + "."));
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
    for (const [key2, value] of Object.entries(v)) {
      if (key2 === "tokenId" && value !== null) add(value);
      else if (key2 === "tokenIds") {
        if (Array.isArray(value)) value.forEach(add);
        else complete = false;
      } else if (key2 === "id" && record6(v).type === "VARIABLE_ALIAS") add(value);
      else visit(value);
    }
    if (record6(v).type === "VARIABLE_ALIAS" && !Object.prototype.hasOwnProperty.call(v, "id")) complete = false;
  };
  values.forEach(visit);
  return { ids: Array.from(ids).sort(), complete };
}
async function captureHostVariableUsage(node, resolve) {
  const usage = { version: 1, complete: true, bindings: {} };
  try {
    const values = ["boundVariables", "fills", "strokes", "effects", "layoutGrids"].map((key2) => node[key2]);
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
      const collection = await resolve(id, record6(node.resolvedVariableModes));
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
  const usage = record6(node.hostVariableUsageV1), variable = record6(node.variable);
  if (usage.version !== 1 || usage.complete !== true || !object(usage.bindings) || !object(variable.bindings) || !object(variable.modes) || !object(variable.modeCatalog) || unknown(node, "hostVariableUsageV1") || unknown(node, "variable.bindings")) return;
  const tokens = tokenIds([variable.bindings, node.appearance, node.textFillEvidenceV1]);
  if (!tokens.complete || tokens.ids.some((id) => !Object.prototype.hasOwnProperty.call(usage.bindings, id))) return;
  const checked = /* @__PURE__ */ new Set(), visiting = /* @__PURE__ */ new Set();
  const validChain = (id, depth) => {
    if (visiting.has(id) || depth > 16) return false;
    if (checked.has(id)) return true;
    const refs2 = record6(usage.bindings[id]).referencedVariableIds;
    if (!Array.isArray(refs2)) return false;
    visiting.add(id);
    if (refs2.some((alias) => typeof alias !== "string" || !Object.prototype.hasOwnProperty.call(usage.bindings, alias) || !validChain(alias, depth + 1))) return false;
    visiting.delete(id);
    checked.add(id);
    return true;
  };
  if (Object.keys(usage.bindings).length > 128 || Object.keys(usage.bindings).some((id) => !validChain(id, 0))) return;
  const modes = {}, catalog = {};
  const ids = /* @__PURE__ */ new Map();
  for (const binding of Object.values(usage.bindings)) {
    const collection = record6(binding), key2 = collection.collectionKey, id = collection.collectionId;
    if (typeof key2 !== "string" || !/^[a-f0-9]{40}$/i.test(key2) || typeof id !== "string" || !id || ids.has(key2) && ids.get(key2) !== id) return;
    if (!Array.isArray(collection.referencedVariableIds) || collection.referencedVariableIds.some((alias) => typeof alias !== "string" || !Object.prototype.hasOwnProperty.call(usage.bindings, alias))) return;
    ids.set(key2, id);
    const mode = variable.modes[key2], entry = record6(variable.modeCatalog[key2]);
    if (unknown(node, `variable.modes.${key2}`) || unknown(node, `variable.modeCatalog.${key2}`) || typeof mode !== "string" || record6(node.resolvedModes)[id] !== mode || entry.collectionId !== id || !Array.isArray(entry.modes) || entry.modes.filter((m) => m?.modeId === mode).length !== 1) return;
    modes[key2] = mode;
    catalog[key2] = entry;
  }
  const facts2 = JSON.parse(JSON.stringify(effectiveFacts(node)));
  facts2.variable = Object.assign({}, variable, { modes, modeCatalog: catalog });
  facts2.hostVariableUsageV1 = usage;
  return facts2;
}

// ../Apollo/packages/component-contract-core/src/nested-instance-content-reference.ts
var INSTANCE_CONTENT_REFERENCE_LIMIT = 8;
var record7 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var clone = (v) => JSON.parse(JSON.stringify(v));
var referenceFor = (s) => captureVariantReference(s, s.source?.componentKey || "", s.source?.componentSetKey || "");
var nodesByPath = (s) => {
  const paths = snapshotPaths(s);
  return paths && new Map(s.nodes.map((n) => [paths.get(String(n.id)), n]));
};
function planNestedInstanceContentReferences(snapshot, reference, parent3) {
  const comparison = compareInstanceBoundaries(snapshot, referenceFor(reference), true);
  return comparison.complete ? comparison.boundaries.filter((b) => b.actualPath !== parent3.actualPath && withinBoundary(b.actualPath, parent3.actualPath)) : [];
}
function materializeNestedInstanceContentReferences(snapshot) {
  const evidence = snapshot.instanceContentReferences;
  const actual = nodesByPath(snapshot), original = snapshot.variantReference;
  const results = [];
  snapshot.instanceContentResults = results;
  const comparison = original && compareInstanceBoundaries(snapshot, original, true);
  const roots = comparison?.complete ? comparison.boundaries : [];
  snapshot.instanceBoundaries = [...roots];
  const base = evidence.base;
  const baseRef = base && captureVariantReference(base, base.source?.componentKey || "", base.source?.componentSetKey || "", original?.definedProperties);
  const baseValid = actual && original?.complete && baseRef?.complete && base.source?.rootNodeId && base.source.rootNodeId !== snapshot.source?.rootNodeId && stableHash(baseRef) === stableHash(original) && base.context.platform === snapshot.context.platform && stableHash(base.context.modes) === stableHash(snapshot.context.modes);
  let visited = 0;
  const visit = (boundary, context, parentId) => {
    const result = { boundaryNodeId: boundary.nodeId, status: "unresolved", reason: "reference-not-captured", matchedNodeIds: [] };
    results.push(result);
    if (actual) {
      for (const [path, node] of actual) if (withinBoundary(path, boundary.actualPath)) {
        node.baseline = { effective: {} };
        node.baselineProvenance = { status: "unresolved", reason: boundary.reason, boundaryNodeId: boundary.nodeId };
        if (node.semantic) delete record7(node.semantic).role;
      }
    }
    const fail2 = (reason) => {
      result.reason = reason;
      return result;
    };
    if (++visited > INSTANCE_CONTENT_REFERENCE_LIMIT) return fail2("reference-capture-limit");
    if (!baseValid) return fail2("original-host-evidence-invalid");
    if (evidence.hostContextVariableModesVersion !== void 0 && evidence.hostContextVariableModesVersion !== 1) return fail2("host-context-mode-version-unsupported");
    const variant = boundary.reason === "component-variant-changed" && Boolean(boundary.componentSetKey);
    if (!boundary.actualComponentKey || !variant && (boundary.reason !== "instance-swap" || !boundary.property || boundary.ownerPath === void 0)) return fail2("explicit-swap-port-required");
    const attempts = evidence.attempts.filter((a) => a.boundaryNodeId === boundary.nodeId);
    if (attempts.length !== 1) return fail2(attempts.length ? "ambiguous-reference" : "reference-not-captured");
    const attempt = attempts[0], reference = attempt.reference;
    if (attempt.parentBoundaryNodeId !== parentId) return fail2("reference-parent-mismatch");
    if (attempt.failure || !reference) return fail2(attempt.failure || "reference-not-captured");
    if (variant && attempt.strategy !== "pristine-host-variant-properties") return fail2("variant-capture-strategy-unproven");
    const expected = nodesByPath(reference), contextNodes = nodesByPath(context);
    const refId = reference.source?.rootNodeId;
    if (!expected || !contextNodes || !refId || refId === snapshot.source?.rootNodeId || refId === base.source?.rootNodeId || refId === context.source?.rootNodeId || reference.context.platform !== snapshot.context.platform || stableHash(reference.context.modes) !== stableHash(snapshot.context.modes)) return fail2("replacement-reference-incomplete");
    const change = compareInstanceBoundaries(reference, referenceFor(context), true), refBoundary = change.boundaries[0];
    if (!change.complete || change.boundaries.length !== 1 || refBoundary.reason !== boundary.reason || refBoundary.referencePath !== boundary.referencePath || refBoundary.ownerPath !== boundary.ownerPath || refBoundary.property !== boundary.property || refBoundary.actualComponentKey !== boundary.actualComponentKey || refBoundary.componentSetKey !== boundary.componentSetKey) return fail2("replacement-identity-or-port-mismatch");
    for (const [path, node] of contextNodes) {
      if (withinBoundary(path, boundary.referencePath)) continue;
      const other = expected.get(path);
      if (!other) return fail2("host-context-changed");
      const before = evidence.hostContextVariableModesVersion === 1 ? hostContextFacts(node) : clone(effectiveFacts(node));
      const after = evidence.hostContextVariableModesVersion === 1 ? hostContextFacts(other) : clone(effectiveFacts(other));
      if (!before || !after) return fail2("host-context-variable-evidence-incomplete");
      if (!variant && path === boundary.ownerPath && boundary.property) {
        delete record7(record7(before.component).properties)[boundary.property];
        delete record7(record7(after.component).properties)[boundary.property];
      }
      if (stableHash(before) !== stableHash(after)) return fail2("host-context-changed");
    }
    const remainder = compareInstanceBoundaries(snapshot, referenceFor(reference), true);
    if (!remainder.complete) return fail2("replacement-structure-needs-remap");
    const children = remainder.boundaries.filter((b) => withinBoundary(b.actualPath, boundary.actualPath));
    if (children.some((b) => b.actualPath === boundary.actualPath)) return fail2("replacement-nested-identity-unresolved");
    const pairs = [];
    for (const [path, node] of actual) {
      if (!withinBoundary(path, boundary.actualPath) || children.some((b) => withinBoundary(path, b.actualPath))) continue;
      const relative2 = path.slice(boundary.actualPath.length);
      const referencePath = remainder.referencePaths ? correspondingPath(remainder, path) : refBoundary.actualPath + relative2;
      const other = referencePath !== void 0 ? expected.get(referencePath) : void 0;
      if (!other || other.type !== node.type) return fail2("replacement-structure-needs-remap");
      if (node.type === "INSTANCE") {
        const a = record7(record7(node.component).identity), b = record7(record7(other.component).identity);
        if (!a.componentKey || a.componentKey !== b.componentKey || (a.componentSetKey || "") !== (b.componentSetKey || "")) return fail2("replacement-nested-identity-unresolved");
      }
      pairs.push([path, node, other]);
    }
    if (variant) {
      const props = (n) => {
        const c = record7(n?.component);
        return Object.fromEntries(Object.entries(record7(c.propertyTypes)).filter(([, t]) => t === "VARIANT").map(([p]) => [p, record7(c.properties)[p]]));
      };
      const expectedProperties = props(expected.get(refBoundary.actualPath));
      if (!Object.keys(expectedProperties).length || stableHash(props(actual.get(boundary.actualPath))) !== stableHash(expectedProperties)) return fail2("variant-properties-mismatch");
    }
    result.lineageProven = true;
    for (const [path, node, other] of pairs) {
      node.baseline = { effective: clone(effectiveFacts(
        other,
        snapshot.source?.geometryCaptureVersion === 1 && reference.source?.geometryCaptureVersion === 1
      )) };
      if (variant && path === boundary.actualPath) {
        const originalComponent = record7(contextNodes.get(boundary.referencePath)?.component), current = record7(node.component);
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
function subtree(nodes, root2) {
  return new Map([...nodes].filter(([p]) => withinBoundary(p, root2)).map(([p, n]) => [p === root2 ? "" : p.slice(root2.length + 3), n]));
}
function materializeInstanceContentReferences(snapshot) {
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
    base.source?.componentKey || "",
    base.source?.componentSetKey || "",
    original?.definedProperties
  );
  const nestedVariants = ["apollo.instance-content-references.v2", "apollo.instance-content-references.v3"].includes(evidence.schemaVersion);
  const baseValid = (evidence.schemaVersion === "apollo.instance-content-references.v1" || nestedVariants) && actualNodes && baseNodes && original?.complete && baseReference?.complete && base.source?.rootNodeId && base.source.rootNodeId !== snapshot.source?.rootNodeId && stableHash(baseReference) === stableHash(original) && stableHash(base.context.modes) === stableHash(snapshot.context.modes) && base.context.platform === snapshot.context.platform;
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
    const independent = reference.source?.rootNodeId && reference.source.rootNodeId !== snapshot.source?.rootNodeId && reference.source.rootNodeId !== base.source?.rootNodeId;
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
      if (node.type !== "INSTANCE") return true;
      const a = record8(record8(node.component).identity), b = record8(record8(expected.get(path)?.component).identity);
      return Boolean(a.componentKey && b.componentKey && a.componentKey === b.componentKey && (a.componentSetKey || "") === (b.componentSetKey || ""));
    });
    if (!identityKnown) {
      result.reason = "replacement-nested-identity-unresolved";
      continue;
    }
    if (variant) {
      const variantProperties = (node) => {
        const component = record8(node?.component);
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
        snapshot.source?.geometryCaptureVersion === 1 && reference.source?.geometryCaptureVersion === 1
      )) };
      if (variant && path === "") {
        const originalComponent = record8(baseNodes.get(boundary.referencePath)?.component);
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
var record9 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var COMPONENT_DEPENDENCY_CAPTURE_LIMIT = 8;
var DIRECT_CHILD_DEPENDENCY_CAPTURE_LIMIT = 16;
var COMPONENT_DEPENDENCY_DEPTH_LIMIT = 4;
var hash2 = (v) => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
var pathValid = (v) => typeof v === "string" && !v.split(" / ").some((p) => p === ".." || p === "." || p.includes("*") || !p && v !== "");
function validateComponentDependencies(manual) {
  const issues = [], ids = /* @__PURE__ */ new Set();
  const fail2 = (index, message) => issues.push({ level: "error", code: "COMPONENT_DEPENDENCY", path: `/componentDependencies/${index}`, message });
  if (manual.componentDependencies === void 0) return issues;
  if (!Array.isArray(manual.componentDependencies)) return [{ level: "error", code: "COMPONENT_DEPENDENCY", path: "/componentDependencies", message: "Expected dependency pins and fixed nested bindings." }];
  for (const [i, d] of manual.componentDependencies.entries()) {
    if (!d || !/^[a-z][a-z0-9-]*$/.test(d.id) || ids.has(d.id)) {
      fail2(i, "Dependency id must be unique and path-safe.");
      continue;
    }
    ids.add(d.id);
    if (!/^[a-z][a-z0-9.-]*$/.test(d.componentId || "") || d.componentId === manual.component.componentId || !Number.isInteger(d.revision) || d.revision < 1 || !hash2(d.manualSourceHash) || !hash2(d.compiledHash)) fail2(i, "Pin another component by componentId, revision and both SHA-256 hashes.");
    if (!Array.isArray(d.bindings) || !d.bindings.length) {
      fail2(i, "Declare at least one fixed nested binding.");
      continue;
    }
    const bindings = /* @__PURE__ */ new Set(), subjects = /* @__PURE__ */ new Set();
    for (const b of d.bindings) {
      if (!b || !/^[a-z][a-z0-9-]*$/.test(b.id) || bindings.has(b.id)) {
        fail2(i, "Binding id must be unique and path-safe.");
        continue;
      }
      bindings.add(b.id);
      const subject = JSON.stringify([b.targetRole, b.relativePath, ...(b.kind === "direct-child" || b.kind === "fixed-nested-scoped") && Array.isArray(b.representationIds) ? b.representationIds.slice().sort() : []]);
      if (subjects.has(subject)) fail2(i, "Duplicate nested subject.");
      subjects.add(subject);
      if (manual.targets.filter((t) => t.semanticRole === b.targetRole && t.resolution === "resolved").length !== 1) fail2(i, `Unresolved target: ${b.targetRole}.`);
      if (b.kind === "direct-child") {
        if (d.bindings.some((other) => other !== b && other.kind === "direct-child" && other.targetRole === b.targetRole && Array.isArray(other.representationIds) && Array.isArray(b.representationIds) && other.representationIds.some((id) => b.representationIds.includes(id)))) fail2(i, "Direct member bindings may not overlap in the same representation.");
        if (b.relativePath !== "" || b.ownerTargetRole === b.targetRole || manual.targets.filter((t) => t.semanticRole === b.ownerTargetRole && t.resolution === "resolved").length !== 1) fail2(i, "Direct child requires distinct resolved member/owner targets and an empty relativePath.");
        if (!Array.isArray(b.ownerComponentKeys) || !b.ownerComponentKeys.length || b.ownerComponentKeys.some((k) => typeof k !== "string" || !k)) fail2(i, "Direct owner component keys are required.");
        if (!Array.isArray(b.representationIds) || !b.representationIds.length || new Set(b.representationIds).size !== b.representationIds.length || b.representationIds.some((id) => !manual.representations.some((r) => r.kind === "figma" && r.id === id && r.status !== "deprecated"))) fail2(i, "Direct binding requires explicit unique Figma representations.");
        if (["childPath", "activeVariant", "ownerComponentSetKeys"].some((k) => Object.prototype.hasOwnProperty.call(b, k))) fail2(i, "Direct binding cannot contain legacy fixed-nested fields.");
        continue;
      }
      if (b.kind !== void 0 && b.kind !== "fixed-nested" && b.kind !== "fixed-nested-scoped") {
        fail2(i, "Unknown dependency binding kind.");
        continue;
      }
      if (b.kind === "fixed-nested-scoped") {
        if (!Array.isArray(b.representationIds) || !b.representationIds.length || new Set(b.representationIds).size !== b.representationIds.length || b.representationIds.some((id) => !manual.representations.some((r) => r.kind === "figma" && r.id === id && r.status !== "deprecated"))) fail2(i, "Scoped fixed binding requires explicit unique active Figma representations.");
      } else if (Object.prototype.hasOwnProperty.call(b, "representationIds")) fail2(i, "Representation scope requires fixed-nested-scoped.");
      if (d.bindings.some((other) => other !== b && other.kind !== "direct-child" && other.targetRole === b.targetRole && other.relativePath === b.relativePath && (b.kind === "fixed-nested-scoped" || other.kind === "fixed-nested-scoped") && (b.kind !== "fixed-nested-scoped" || other.kind !== "fixed-nested-scoped" || Array.isArray(b.representationIds) && Array.isArray(other.representationIds) && b.representationIds.some((id) => other.representationIds.includes(id))))) fail2(i, "Fixed nested bindings may not overlap in the same representation.");
      if (!pathValid(b.relativePath) || !pathValid(b.childPath) || !b.childPath) fail2(i, "Use exact relative owner/child paths.");
      if (!Array.isArray(b.ownerComponentSetKeys) || !b.ownerComponentSetKeys.length || b.ownerComponentSetKeys.some((k) => !k)) fail2(i, "Owner component set keys are required.");
      if (!b.activeVariant?.property || !Array.isArray(b.activeVariant.values) || !b.activeVariant.values.length || b.activeVariant.values.some((v) => typeof v !== "string" || !v)) fail2(i, "Declare the typed owner VARIANT activation.");
    }
  }
  return issues;
}
function dependencyPinIssue(pin, contract) {
  if (!contract) return "dependency-contract-missing";
  if (contract.documentType !== "component-contract" || contract.schemaVersion !== "apollo.component-contract.v2.1-experimental") return "dependency-schema-unsupported";
  if (contract.package?.componentId !== pin.componentId) return "dependency-component-mismatch";
  if (!Array.isArray(contract.rules) || !Array.isArray(contract.facts?.representations) || !Array.isArray(contract.nonExecutableRules) || !Array.isArray(contract.customizationPolicy)) return "dependency-contract-malformed";
  const revisions = [...new Set(contract.rules.map((r) => r.revision))];
  const revision = contract.package.manualRevision ?? (revisions.length === 1 ? revisions[0] : void 0);
  if (revision !== pin.revision || contract.package.manualSourceHash !== pin.manualSourceHash || stableHash(contract) !== pin.compiledHash) return "dependency-pin-mismatch";
  if (contract.runtimePolicy?.engine !== "apollo-predicate-engine" || contract.runtimePolicy?.unknownPolicy !== "fail-closed") return "dependency-runtime-unsupported";
  for (const field of ["occurrenceAddressVersion", "directChildDependenciesVersion", "memberCollectionsVersion", "dependencySubjectConditionsVersion", "rootTargetAliasesVersion", "assetIdentityLockVersion", "instanceMainComponentAliasesVersion", "representationEvidenceVersion"])
    if (contract.runtimePolicy[field] !== void 0 && contract.runtimePolicy[field] !== 1) return "dependency-runtime-unsupported";
  if (contract.runtimePolicy.crossRepresentationBindingsVersion !== void 0 && ![1, 2].includes(contract.runtimePolicy.crossRepresentationBindingsVersion)) return "dependency-runtime-unsupported";
  const shape = contractRepresentationShape(contract), flags = representationFeatureFlags(shape);
  if (representationEvidenceErrors(shape).length || flags.evidence !== (contract.runtimePolicy.representationEvidenceVersion === 1) || contract.runtimePolicy.crossRepresentationBindingsVersion !== flags.bindingVersion || flags.scopedDependencies && validateComponentDependencies({ component: contract.facts.component, targets: contract.facts.targets, representations: contract.facts.representations, componentDependencies: contract.componentDependencies }).length) return "dependency-representation-unsupported";
  return void 0;
}
function linkComponentDependencies(manual, inputs) {
  const visit = (d, ancestors, depth) => {
    if (ancestors.includes(d.componentId)) return "dependency-cycle";
    if (depth > COMPONENT_DEPENDENCY_DEPTH_LIMIT) return "dependency-depth-limit";
    const issue = dependencyPinIssue(d, d.contract);
    if (issue) return issue;
    for (const child of d.contract.componentDependencies || []) {
      const nested = visit(child, [...ancestors, d.componentId], depth + 1);
      if (nested) return nested;
    }
    return void 0;
  };
  const pins = Array.isArray(manual.componentDependencies) ? manual.componentDependencies : [];
  return pins.filter((d) => d && Array.isArray(d.bindings)).map((pin) => {
    const candidates = inputs.filter((c) => c?.package?.componentId === pin.componentId);
    const contract = candidates.length === 1 ? candidates[0] : void 0;
    const d = { ...pin, ...contract ? { contract } : {} };
    const issue = candidates.length > 1 ? "dependency-version-conflict" : visit(d, [manual.component.componentId], 1);
    return { ...d, ...issue ? { issue } : {} };
  });
}
function componentDependencyKeys(contract) {
  const keys = /* @__PURE__ */ new Set();
  const visit = (c, depth) => {
    if (depth > COMPONENT_DEPENDENCY_DEPTH_LIMIT) return;
    for (const d of c.componentDependencies || []) if (!d.issue && d.contract && !dependencyPinIssue(d, d.contract)) {
      d.contract.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated").forEach((r) => [r.locator.componentKey, r.locator.componentSetKey].forEach((k) => {
        if (typeof k === "string" && k) keys.add(k);
      }));
      visit(d.contract, depth + 1);
    }
  };
  visit(contract, 0);
  return [...keys].sort();
}
function resolveFixedNestedBinding(snapshot, d, b, strictCompositionEvidence = false, hostContract) {
  if (b.kind === "direct-child") return resolveDirectChildBinding(snapshot, d, b, hostContract);
  const unknown14 = (reason) => ({ status: "unknown", reason });
  const root2 = snapshot.nodes.filter((n) => snapshot.selection.includes(String(n.id)));
  const paths = snapshotPaths(snapshot), ref = snapshot.variantReference;
  const comparison = ref && compareInstanceBoundaries(snapshot, ref);
  if (root2.length !== 1 || !paths || snapshot.source?.truncated || !ref?.complete || !comparison?.complete) return unknown14("dependency-topology-unavailable");
  if (b.kind === "fixed-nested-scoped") {
    if (hostContract?.runtimePolicy.crossRepresentationBindingsVersion !== 2) return unknown14("scoped-dependency-version-unavailable");
    if (!Array.isArray(b.representationIds) || !b.representationIds.length || new Set(b.representationIds).size !== b.representationIds.length || b.representationIds.some((id) => !hostContract.facts.representations.some((r) => r.id === id && r.kind === "figma" && r.status !== "deprecated"))) return unknown14("dependency-binding-scope-unavailable");
    const identity2 = record9(record9(root2[0].component).identity), original2 = ref.nodeProperties[""]?.identity;
    if (root2[0].type !== "INSTANCE" || !original2 || !identity2.componentKey || !identity2.mainComponentId || identity2.componentKey !== original2.componentKey || identity2.componentSetKey !== original2.componentSetKey || identity2.mainComponentId !== original2.mainComponentId || ref.componentKey !== identity2.componentKey || (ref.componentSetKey || "") !== (identity2.componentSetKey || "") || snapshot.source?.componentKey !== identity2.componentKey || (snapshot.source?.componentSetKey || "") !== (identity2.componentSetKey || "") || (root2[0].unknownFacts || []).some((p) => p === "component" || p === "component.identity" || p.startsWith("component.identity.")))
      return unknown14("dependency-host-identity-unproven");
    const reps = hostContract.facts.representations.filter((r) => matchesCaptureRepresentation(r, identity2.componentKey, identity2.componentSetKey || ""));
    if (reps.length !== 1 || !["universal", snapshot.context.platform].includes(reps[0].platform) || snapshot.context.unknownFacts?.some((p) => ["platform", "context.platform", "environment.platform"].includes(p))) return unknown14("dependency-representation-unresolved");
    if (!b.representationIds.includes(reps[0].id)) return { status: "inactive", reason: "binding-outside-representation" };
  }
  const availability = record9(record9(root2[0].variantAvailability).targets)[b.targetRole];
  if (availability?.present === false) return { status: "inactive", reason: "target-absent-in-variant" };
  const targets = snapshot.nodes.filter((n) => record9(n.semantic).role === b.targetRole);
  if (availability?.present !== true || targets.length !== 1) return unknown14("dependency-target-unresolved");
  if (record9(targets[0].visibility).effective === false) return { status: "inactive", reason: "target-hidden" };
  if (record9(targets[0].visibility).effective !== true) return unknown14("dependency-visibility-unavailable");
  const ownerPath = [correspondingPath(comparison, paths.get(String(targets[0].id))), b.relativePath].filter(Boolean).join(" / ");
  const owners = snapshot.nodes.filter((n) => correspondingPath(comparison, paths.get(String(n.id))) === ownerPath && n.type === "INSTANCE");
  if (owners.length !== 1) return unknown14("dependency-owner-unresolved");
  const owner = owners[0], component = record9(owner.component), identity = record9(component.identity);
  if (strictCompositionEvidence && (owner.unknownFacts || []).some((p) => ["component.identity", "component.properties." + b.activeVariant.property, "component.propertyTypes." + b.activeVariant.property].some((input) => input === p || input.startsWith(p + ".") || input === "component.identity" && p.startsWith(input + ".")))) return unknown14("dependency-owner-evidence-unknown");
  if (!b.ownerComponentSetKeys.includes(identity.componentSetKey)) return unknown14("dependency-owner-identity-mismatch");
  let selectedReference = ref;
  const boundary = comparison.boundaries.find((x) => withinBoundary(paths.get(String(owner.id)), x.actualPath));
  if (boundary) {
    const result = snapshot.instanceContentResults?.find((r) => r.boundaryNodeId === boundary.nodeId && r.lineageProven);
    const attempts = snapshot.instanceContentReferences?.attempts.filter((a) => a.boundaryNodeId === boundary.nodeId) || [];
    if (boundary.nodeId !== owner.id || boundary.reason !== "component-variant-changed" || !result || attempts.length !== 1 || attempts[0].failure || !attempts[0].reference) return unknown14("dependency-owner-lineage-unproven");
    const s = attempts[0].reference;
    selectedReference = captureVariantReference(s, s.source?.componentKey || "", s.source?.componentSetKey || "");
  }
  const originalOwner = selectedReference.nodeProperties[ownerPath];
  const prop = b.activeVariant.property, value = component.properties?.[prop];
  if (!originalOwner || originalOwner.identity?.componentKey !== identity.componentKey || originalOwner.identity?.componentSetKey !== identity.componentSetKey || component.propertyTypes?.[prop] !== "VARIANT" || originalOwner.propertyTypes[prop] !== "VARIANT" || originalOwner.properties[prop] !== value || (owner.unknownFacts || []).some((p) => `component.properties.${prop}` === p || `component.properties.${prop}`.startsWith(p + "."))) return unknown14("dependency-owner-variant-unproven");
  if (!b.activeVariant.values.includes(value)) return { status: "inactive", reason: "owner-variant-inactive" };
  const childPath = [ownerPath, b.childPath].filter(Boolean).join(" / "), original = selectedReference.nodeProperties[childPath];
  const childContract = d.contract;
  const childKeys = childContract?.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated").flatMap((r) => [r.locator.componentKey, r.locator.componentSetKey]).filter((key2) => typeof key2 === "string" && Boolean(key2)) || [];
  if (!original?.identity || !childKeys.includes(original.identity.componentSetKey || original.identity.componentKey)) return { ...unknown14("dependency-child-lineage-unproven"), ownerActive: true };
  const selectedComparison = snapshot.source?.instanceIdentityVersion === 1 ? compareInstanceBoundaries(snapshot, selectedReference, true) : void 0;
  if (selectedComparison && !selectedComparison.complete) return { ...unknown14("dependency-child-lineage-unproven"), ownerActive: true };
  const children = snapshot.nodes.filter((n) => correspondingPath(selectedComparison, paths.get(String(n.id))) === childPath);
  if (children.length !== 1 || children[0].type !== "INSTANCE") return { ...unknown14("dependency-child-missing-or-ambiguous"), ownerActive: true };
  const node = children[0], childIdentity = record9(record9(node.component).identity);
  return { status: "active", reason: "fixed-child-proven", node, nodeId: String(node.id), identityValid: childKeys.includes(childIdentity.componentSetKey || childIdentity.componentKey), ownerActive: true };
}
function resolveDirectChildBinding(snapshot, d, b, hostContract) {
  const unavailable = (reason) => ({ status: "unknown", reason });
  if (hostContract?.runtimePolicy.directChildDependenciesVersion !== 1) return unavailable("direct-dependency-version-unavailable");
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id))), ref = snapshot.variantReference, paths = snapshotPaths(snapshot);
  if (!root2 || !ref?.complete || !paths || snapshot.source?.occurrenceAddressVersion !== 1 || ref.occurrenceAddressVersion !== 1 || !["verified", "partial"].includes(record9(root2.variantAvailability).status)) return unavailable("dependency-topology-unavailable");
  const reps = hostContract.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated" && r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
  if (reps.length !== 1) return unavailable("dependency-representation-unresolved");
  if (!b.representationIds.includes(reps[0].id)) return { status: "inactive", reason: "binding-outside-representation" };
  const targets = hostContract.facts.targets.filter((t) => t.semanticRole === b.targetRole && t.resolution === "resolved");
  const owners = hostContract.facts.targets.filter((t) => t.semanticRole === b.ownerTargetRole && t.resolution === "resolved");
  if (targets.length !== 1 || owners.length !== 1) return unavailable("dependency-target-unresolved");
  const memberPath = selectedTargetPathHint(targets[0], reps[0].id, ref.componentKey, true)?.split(" / ").slice(1).join(" / ");
  const ownerPath = selectedTargetPathHint(owners[0], reps[0].id, ref.componentKey, true)?.split(" / ").slice(1).join(" / ");
  if (memberPath === void 0 || !memberPath || ownerPath === void 0 || memberPath.split(" / ").slice(0, -1).join(" / ") !== ownerPath)
    return unavailable("dependency-direct-binding-unresolved");
  const comparison = compareInstanceBoundaries(snapshot, ref, true);
  const actualOwners = snapshot.nodes.filter((n) => n.type === "INSTANCE" && correspondingPath(comparison, paths.get(String(n.id))) === ownerPath);
  const members = snapshot.nodes.filter((n) => n.type === "INSTANCE" && correspondingPath(comparison, paths.get(String(n.id))) === memberPath);
  if (actualOwners.length !== 1 || members.length !== 1 || members[0].parentId !== actualOwners[0].id) return unavailable("dependency-direct-lineage-unproven");
  const owner = actualOwners[0], node = members[0], identity = record9(record9(node.component).identity), ownerIdentity = record9(record9(owner.component).identity);
  if ((owner.unknownFacts || []).some((p) => p === "component" || p === "component.identity" || p.startsWith("component.identity."))) return unavailable("dependency-owner-evidence-unknown");
  const original = ref.nodeProperties[memberPath], expectedOwner = ref.nodeProperties[ownerPath]?.identity;
  const source = record9(record9(node.component).sourceIdentity), expectedSource = original?.sourceIdentity;
  if (!expectedOwner || expectedOwner.componentKey !== ownerIdentity.componentKey || expectedOwner.mainComponentId !== ownerIdentity.mainComponentId || !b.ownerComponentKeys.some((k) => k === ownerIdentity.componentKey || k === ownerIdentity.componentSetKey) || !expectedSource || source.version !== 1 || source.sourceNodeId !== expectedSource.sourceNodeId || source.ownerComponentKey !== ownerIdentity.componentKey || source.ownerMainComponentId !== ownerIdentity.mainComponentId || (node.unknownFacts || []).some((p) => p === "component" || p === "component.sourceIdentity" || p.startsWith("component.sourceIdentity.")))
    return unavailable("dependency-direct-lineage-unproven");
  const selected = d.contract?.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated" && matchesCaptureRepresentation(r, identity.componentKey || "", identity.componentSetKey || "")) || [];
  const sameFamily = Boolean(identity.componentKey && original.identity?.componentKey && (identity.componentSetKey ? identity.componentSetKey === original.identity.componentSetKey : !original.identity.componentSetKey && identity.componentKey === original.identity.componentKey));
  const identityKnown = !(node.unknownFacts || []).some((p) => p === "component" || p === "component.identity" || p.startsWith("component.identity."));
  if (!sameFamily || !identityKnown || selected.length !== 1 || !["universal", snapshot.context.platform].includes(selected[0].platform))
    return { status: "active", reason: "dependency-child-identity-mismatch", node, nodeId: String(node.id), identityValid: false, ownerActive: true };
  const visibility = record9(node.visibility).effective;
  if ((node.unknownFacts || []).some((p) => ["visible", "visibility", "visibility.effective"].includes(p)) || typeof visibility !== "boolean") return unavailable("dependency-visibility-unavailable");
  if (visibility === false) return { status: "inactive", reason: "target-hidden", node, nodeId: String(node.id), identityValid: true };
  return { status: "active", reason: "direct-child-proven", node, nodeId: String(node.id), identityValid: true, ownerActive: true };
}
function dependencyActualFacts(node) {
  const facts2 = effectiveFacts(node, true), variable = record9(facts2.variable);
  if (variable.modeCatalog !== void 0) {
    const catalog = record9(variable.modeCatalog), relevant = {};
    for (const key2 of Object.keys(record9(variable.modes))) {
      if (!Object.prototype.hasOwnProperty.call(catalog, key2)) return;
      relevant[key2] = catalog[key2];
    }
    facts2.variable = { ...variable };
    if (Object.keys(relevant).length) record9(facts2.variable).modeCatalog = relevant;
    else delete record9(facts2.variable).modeCatalog;
  } else if (Object.keys(record9(variable.modes)).length) return;
  return facts2;
}
function dependencyOwnerBaseline(snapshot, nodeMap, childRoot, contract) {
  if (!contract.capabilities.facts.some((f) => f === "baseline.effective" || f.startsWith("baseline.effective."))) return {};
  if (snapshot.instanceContentReferences === void 0 && snapshot.instanceContentResults === void 0) return {};
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
  if (snapshot.source?.occurrenceAddressVersion !== 1 || root2?.type !== "INSTANCE") return {};
  const evidence = snapshot.instanceContentReferences, base = evidence?.base, original = snapshot.variantReference;
  const identity = record9(record9(root2.component).identity), baseRef = base && captureVariantReference(base, base.source?.componentKey || "", base.source?.componentSetKey || "", original?.definedProperties);
  if (!base || !original?.complete || !baseRef?.complete || !base.source?.rootNodeId || base.source.rootNodeId === snapshot.source.rootNodeId || stableHash(baseRef) !== stableHash(original) || base.context.platform !== snapshot.context.platform || stableHash(base.context.modes) !== stableHash(snapshot.context.modes) || [snapshot.context, base.context].some((c) => c.unknownFacts?.some((f) => ["platform", "context.platform", "modes", "context.modes"].includes(f))) || (root2.unknownFacts || []).some((f) => f === "component" || f === "component.identity" || f.startsWith("component.identity.")) || identity.componentKey !== original.componentKey || (identity.componentSetKey || "") !== original.componentSetKey || snapshot.source.componentKey !== original.componentKey || (snapshot.source.componentSetKey || "") !== original.componentSetKey)
    return { reason: "dependency-owner-baseline-unavailable" };
  const fresh = materializeEffectiveBaseline(snapshot, base, true).snapshot;
  materializeInstanceContentReferences(fresh);
  const inverse = new Map(Object.entries(nodeMap).map(([local, host]) => [host, local])), baseline = {};
  for (const [local, host] of Object.entries(nodeMap)) {
    const node = fresh.nodes.find((n) => n.id === host), proof = record9(node?.baselineProvenance), effective = record9(record9(node?.baseline).effective);
    if (proof.status !== "matched" || !Object.keys(effective).length) continue;
    const attempts = typeof proof.boundaryNodeId === "string" ? evidence.attempts.filter((a) => a.boundaryNodeId === proof.boundaryNodeId) : [];
    const reference = proof.kind === "independent-host-variant" || proof.kind === "independent-host-swap" ? attempts.length === 1 ? attempts[0].reference : void 0 : base;
    const paths = reference && snapshotPaths(reference), expected = reference?.nodes.filter((n) => paths?.get(String(n.id)) === proof.referencePath) || [];
    if (expected.length !== 1) return { reason: "dependency-owner-baseline-unavailable" };
    const unknownFacts = (expected[0].unknownFacts || []).filter((f) => Object.prototype.hasOwnProperty.call(effective, f.split(".")[0])).map((f) => "baseline.effective." + f);
    const provenance = Object.assign({}, proof);
    if (typeof provenance.boundaryNodeId === "string") {
      const localBoundary = inverse.get(provenance.boundaryNodeId);
      if (localBoundary) provenance.boundaryNodeId = localBoundary;
      else delete provenance.boundaryNodeId;
    }
    baseline[local] = { effective: JSON.parse(JSON.stringify(effective)), provenance, unknownFacts };
  }
  return baseline[childRoot] ? { baseline } : { reason: "dependency-owner-baseline-unavailable" };
}
function projectDependencyEvidencePlatform(snapshot, capturedPlatform, platform) {
  const pending = [snapshot], seen = /* @__PURE__ */ new Set();
  while (pending.length) {
    const current = pending.pop();
    if (seen.has(current)) continue;
    if (!current?.context || current.context.platform !== capturedPlatform || current.context.unknownFacts?.some((f) => f === "platform" || f === "context.platform")) return false;
    seen.add(current);
    current.context = Object.assign({}, current.context, { platform });
    const evidence = current.instanceContentReferences;
    if (evidence) {
      pending.push(evidence.base);
      for (const attempt of evidence.attempts) if (attempt.reference) pending.push(attempt.reference);
    }
  }
  return true;
}
function validatedDependencyCapture(snapshot, nodeId, childContract) {
  const captures = snapshot.componentDependencyCaptures?.filter((c) => c.nodeId === nodeId) || [];
  if (captures.length !== 1 || !captures[0].snapshot || !captures[0].nodeMap || captures[0].failure) return { reason: captures[0]?.failure || "dependency-reference-not-captured" };
  const capture = captures[0], child = JSON.parse(JSON.stringify(capture.snapshot)), nodeMap = capture.nodeMap;
  if (child.source?.truncated || !child.variantReference?.complete || child.selection.length !== 1 || nodeMap[child.selection[0]] !== nodeId || !snapshot.nodes.find((n) => n.id === nodeId)?.resolvedModes || stableHash(child.context.modes) !== stableHash(snapshot.nodes.find((n) => n.id === nodeId).resolvedModes)) return { reason: "dependency-capture-incomplete" };
  const paths = snapshotPaths(snapshot), prefix = paths?.get(nodeId);
  if (prefix === void 0) return { reason: "dependency-capture-topology-mismatch" };
  const expected = snapshot.nodes.filter((n) => withinBoundary(paths.get(String(n.id)) || "", prefix));
  const mapped = Object.values(nodeMap);
  if (expected.length !== child.nodes.length || mapped.length !== child.nodes.length || new Set(mapped).size !== mapped.length || expected.some((n) => !mapped.includes(String(n.id)))) return { reason: "dependency-capture-topology-mismatch" };
  for (const n of child.nodes) {
    const host = snapshot.nodes.find((h) => h.id === nodeMap[String(n.id)]);
    const actual = dependencyActualFacts(n), expected2 = host && dependencyActualFacts(host);
    if (!actual || !expected2) return { reason: "dependency-capture-actual-mismatch" };
    if (expected2 && String(n.id) === child.selection[0] && snapshot.source?.occurrenceAddressVersion === 1 && child.source?.occurrenceAddressVersion === 1) {
      actual.component = { ...record9(actual.component) };
      expected2.component = { ...record9(expected2.component) };
      delete record9(actual.component).sourceIdentity;
      delete record9(expected2.component).sourceIdentity;
    }
    if (!host || n.type !== host.type || stableHash(actual) !== stableHash(expected2) || String(n.id) !== child.selection[0] && nodeMap[String(n.parentId)] !== host.parentId) return { reason: "dependency-capture-actual-mismatch" };
  }
  const root2 = child.nodes.find((n) => child.selection.includes(String(n.id)));
  const identity = record9(record9(root2.component).identity);
  if (!identity.componentKey || identity.componentKey !== child.source?.componentKey || (identity.componentSetKey || "") !== (child.source?.componentSetKey || "")) return { reason: "dependency-capture-identity-mismatch" };
  const key2 = identity.componentSetKey || identity.componentKey;
  const reps = childContract.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated" && [r.locator.componentKey, r.locator.componentSetKey].filter(Boolean).includes(key2));
  if (reps.length !== 1) return { reason: "dependency-representation-unresolved" };
  const capturedPlatform = child.context.platform, platform = reps[0].platform;
  const contextual = child.source?.occurrenceAddressVersion === 1;
  if (contextual && (typeof capturedPlatform !== "string" || !capturedPlatform.trim() || child.context.unknownFacts?.some((f) => f === "platform" || f === "context.platform"))) return { reason: "dependency-reference-context-mismatch" };
  const inverse = new Map(Object.entries(nodeMap).map(([local, host]) => [host, local]));
  child.componentDependencyCaptures = (snapshot.componentDependencyCaptures || []).filter((c) => c.nodeId !== nodeId && inverse.has(c.nodeId)).map((c) => ({
    ...c,
    nodeId: inverse.get(c.nodeId),
    nodeMap: c.nodeMap ? Object.fromEntries(Object.entries(c.nodeMap).map(([local, host]) => [local, inverse.get(host)])) : void 0,
    snapshot: c.snapshot ? JSON.parse(JSON.stringify(c.snapshot)) : void 0
  }));
  const parentChannelKnown = !snapshot.context.unknownFacts?.some((f) => f === "platform" || f === "context.platform");
  const sameCapturedChannel = capturedPlatform === snapshot.context.platform || snapshot.context.platform === "universal" && parentChannelKnown;
  if (contextual && capturedPlatform !== platform && (platform !== "universal" || !sameCapturedChannel || !projectDependencyEvidencePlatform(child, capturedPlatform, platform))) return { reason: "dependency-reference-context-mismatch" };
  child.context = Object.assign({}, snapshot.context, { platform, modes: child.context.modes });
  const owner = contextual ? dependencyOwnerBaseline(snapshot, nodeMap, child.selection[0], childContract) : {};
  if (owner.reason) return { reason: owner.reason };
  return { snapshot: child, nodeMap, ownerBaseline: owner.baseline };
}

// ../Apollo/packages/component-contract-core/src/member-collections.ts
var record10 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var parent2 = (path) => path.split(" / ").slice(0, -1).join(" / ");
var propertyTypes = ["VARIANT", "BOOLEAN", "TEXT", "INSTANCE_SWAP"];
var unknown2 = (node, fact2) => (node.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + ".") || p.startsWith(fact2 + "."));
var valueType = (type, value) => type === "BOOLEAN" ? typeof value === "boolean" : typeof value === "string";
function memberCollectionErrors(c, manual) {
  const errors = [];
  if (!c || c.version !== 1) return ["Member collection version 1 is required."];
  if (Object.keys(c).some((k) => !["version", "ownerTargetRole", "memberTargetRoles", "representationIds", "visibleOnly", "filter", "whenHost", "whenMember", "assertion"].includes(k))) errors.push("Unsupported member collection field.");
  const resolved = (role) => manual.targets.filter((t) => t.semanticRole === role && t.resolution === "resolved").length === 1;
  if (!resolved(c.ownerTargetRole)) errors.push("Choose one resolved collection owner.");
  if (!Array.isArray(c.memberTargetRoles) || !c.memberTargetRoles.length || new Set(c.memberTargetRoles).size !== c.memberTargetRoles.length || c.memberTargetRoles.some((role) => role === c.ownerTargetRole || !resolved(role))) errors.push("Choose distinct resolved member roles, separate from the owner.");
  if (!Array.isArray(c.representationIds) || !c.representationIds.length || new Set(c.representationIds).size !== c.representationIds.length || c.representationIds.some((id) => !manual.representations.some((r) => r.id === id && r.kind === "figma" && r.status !== "deprecated"))) errors.push("Choose explicit active Figma representations.");
  if (typeof c.visibleOnly !== "boolean") errors.push("Declare whether the collection includes only visible members.");
  const property = (p, values) => {
    if (!p || typeof p.property !== "string" || !p.property.trim() || !propertyTypes.includes(p.propertyType)) errors.push("A typed Figma property is required.");
    if (values !== void 0 && (!Array.isArray(values) || !values.length || values.some((v) => !valueType(p?.propertyType || "", v)))) errors.push("Property values must match the declared Figma type. VARIANT values are strings.");
  };
  for (const f of [c.filter, c.whenHost, c.whenMember]) if (f !== void 0) {
    property(f, Array.isArray(f?.values) ? f.values : []);
    if (Object.keys(f || {}).some((k) => !["property", "propertyType", "values"].includes(k))) errors.push("Unsupported typed filter field.");
  }
  const a = c.assertion;
  if (!a || !["membership", "count", "position", "propertyDomain", "propertyMapping", "hostRequirement"].includes(a.kind)) return [...errors, "Unsupported collection assertion."];
  const allowed = { membership: ["kind"], count: ["kind", "min", "max"], position: ["kind", "position"], propertyDomain: ["kind", "property", "propertyType", "values"], propertyMapping: ["kind", "property", "propertyType", "hostProperty", "hostPropertyType", "transform"], hostRequirement: ["kind", "property", "propertyType", "values"] };
  if (Object.keys(a).some((k) => !allowed[a.kind].includes(k))) errors.push("Unsupported collection assertion field.");
  if (a.kind === "membership" && (c.visibleOnly || c.filter || c.whenHost || c.whenMember)) errors.push("Closed membership always includes hidden children and cannot have a property gate.");
  if (a.kind === "count" && (a.min === void 0 && a.max === void 0 || [a.min, a.max].some((v) => v !== void 0 && (!Number.isInteger(v) || v < 0)) || a.min !== void 0 && a.max !== void 0 && a.min > a.max)) errors.push("Count needs ordered non-negative integer bounds.");
  if (a.kind === "position" && (!["first", "last"].includes(a.position) || !c.filter)) errors.push("First/last position requires an explicit member filter.");
  if (a.kind === "propertyDomain" || a.kind === "hostRequirement") property(a, Array.isArray(a.values) ? a.values : []);
  if (a.kind === "hostRequirement" && !c.filter && !c.whenMember) errors.push("Choose members that require the host property.");
  if (a.kind === "propertyMapping") {
    property(a);
    property({ property: a.hostProperty, propertyType: a.hostPropertyType });
    if (a.transform !== void 0 && !["identity", "string-to-boolean"].includes(a.transform)) errors.push("Unsupported explicit property transform.");
    if (a.transform === "string-to-boolean" ? a.propertyType !== "VARIANT" || a.hostPropertyType !== "BOOLEAN" : a.propertyType !== a.hostPropertyType) errors.push("Mapping types must agree, or declare VARIANT to BOOLEAN string-to-boolean.");
  }
  return errors;
}
function completeGraph(snapshot) {
  if (snapshot.selection.length !== 1 || snapshot.source?.truncated !== false || snapshot.source?.captureTopology?.complete === false) return;
  const nodes = new Map(snapshot.nodes.map((n) => [String(n.id), n]));
  if (nodes.size !== snapshot.nodes.length || nodes.get(snapshot.selection[0])?.parentId !== null) return;
  const seen = /* @__PURE__ */ new Set();
  const visit = (id) => {
    const n = nodes.get(id);
    if (!n || seen.has(id) || !Array.isArray(n.childIds) || new Set(n.childIds).size !== n.childIds.length) return false;
    seen.add(id);
    return n.childIds.every((child) => nodes.get(child)?.parentId === id && visit(child));
  };
  return visit(snapshot.selection[0]) && seen.size === nodes.size ? nodes : void 0;
}
function referenceMatchesCatalog(snapshot, contract) {
  const ref = snapshot.variantReference, e = contract.facts.variantEvidence;
  if (!ref?.complete || ref.occurrenceAddressVersion !== 1 || !e || ref.componentKey !== snapshot.source?.componentKey || ref.componentSetKey !== (snapshot.source?.componentSetKey || "")) return false;
  const variants = e.variants.filter((v2) => v2.componentKey === ref.componentKey && (v2.componentSetKey === ref.componentSetKey || !ref.componentSetKey && v2.componentSetKey === v2.componentKey));
  if (variants.length !== 1) return false;
  const v = variants[0], shape = e.structures[v.structureId];
  const names = e.occurrences?.filter((o) => o.componentKey === v.componentKey && o.componentSetKey === v.componentSetKey);
  const expected = shape && (e.occurrenceAddressVersion === 1 ? names?.length === 1 && diagnosticStructure(shape, names[0].namesByPath) : diagnosticStructure(shape, Object.fromEntries(shape.map((n) => [n.path, n.path.split(" / ").slice(-1)[0]]))));
  const observed = diagnosticStructure(ref.nodes, Object.fromEntries(Object.entries(ref.nodeProperties).map(([p, n]) => [p, n.diagnosticName])));
  if (!expected || !observed || stableHash(expected) !== stableHash(observed)) return false;
  const root2 = snapshot.nodes.find((n) => n.id === snapshot.selection[0]);
  return Object.entries(v.properties).every(([p, value]) => p === "raw" && !ref.componentSetKey && !ref.propertyTypes[p] || ref.properties[p] === value && record10(record10(root2?.component).properties)[p] === value);
}
function resolveCollection(snapshot, contract, c, representationId) {
  const result = { missing: [] }, ref = snapshot.variantReference, graph = completeGraph(snapshot);
  if (!graph || snapshot.source?.occurrenceAddressVersion !== 1 || snapshot.source.instanceSourceIdentityVersion !== 1 || !referenceMatchesCatalog(snapshot, contract)) {
    result.missing.push("collection-topology-or-reference-unavailable");
    return result;
  }
  const pathFor = (role) => {
    const targets = contract.facts.targets.filter((t) => t.semanticRole === role && t.resolution === "resolved");
    return targets.length === 1 ? selectedTargetPathHint(targets[0], representationId, ref.componentKey, true)?.split(" / ").slice(1).join(" / ") : void 0;
  };
  const ownerPath = pathFor(c.ownerTargetRole), memberPaths = c.memberTargetRoles.map(pathFor);
  if (ownerPath === void 0 || memberPaths.some((p) => !p || parent2(p) !== ownerPath) || new Set(memberPaths).size !== memberPaths.length) {
    result.missing.push("collection-bindings-unresolved");
    return result;
  }
  const root2 = graph.get(snapshot.selection[0]), rootIdentity = record10(record10(root2.component).identity), expectedRoot = ref.nodeProperties[""]?.identity;
  if (!expectedRoot || unknown2(root2, "component.identity") || rootIdentity.componentKey !== expectedRoot.componentKey || rootIdentity.mainComponentId !== expectedRoot.mainComponentId || (rootIdentity.componentSetKey || "") !== (expectedRoot.componentSetKey || "")) {
    result.missing.push("collection-owner-identity-unproven");
    return result;
  }
  const actualFor = (path, seen = /* @__PURE__ */ new Set()) => {
    if (path === "") return root2;
    if (seen.has(path)) return;
    seen.add(path);
    const expected = ref.nodeProperties[path], expectedParent = actualFor(parent2(path), seen);
    const source = expected?.sourceIdentity;
    if (!expectedParent || !source) return;
    const identity = record10(record10(expectedParent.component).identity);
    const candidates = [...graph.values()].filter((n) => n.parentId === expectedParent.id && (() => {
      const s = record10(record10(n.component).sourceIdentity);
      return !unknown2(n, "component.sourceIdentity") && s.version === 1 && s.sourceNodeId === source.sourceNodeId && s.ownerComponentKey === identity.componentKey && s.ownerMainComponentId === identity.mainComponentId;
    })());
    return candidates.length === 1 ? candidates[0] : void 0;
  };
  const owner = actualFor(ownerPath), expectedOwner = ref.nodeProperties[ownerPath]?.identity;
  const ownerIdentity = record10(record10(owner?.component).identity);
  if (!owner || owner.type !== "INSTANCE" || !expectedOwner || unknown2(owner, "component.identity") || ownerIdentity.componentKey !== expectedOwner.componentKey || ownerIdentity.mainComponentId !== expectedOwner.mainComponentId) {
    result.missing.push("collection-owner-identity-unproven");
    return result;
  }
  result.owner = owner;
  const originalChildren = ref.nodes.filter((n) => n.path && parent2(n.path) === ownerPath);
  if (originalChildren.length !== memberPaths.length || originalChildren.some((n) => n.type !== "INSTANCE" || !memberPaths.includes(n.path))) {
    result.missing.push("collection-members-do-not-cover-reference");
    return result;
  }
  const children = owner.childIds.map((id) => graph.get(id));
  result.actualCount = children.length;
  const issues = [], members = [];
  if (children.length > originalChildren.length) issues.push({ reason: "added-children", ownerNodeId: owner.id, expected: originalChildren.length, actual: children.length });
  if (children.length < originalChildren.length) issues.push({ reason: "missing-children", ownerNodeId: owner.id, expected: originalChildren.length, actual: children.length });
  const expectedBySource = /* @__PURE__ */ new Map();
  for (let i = 0; i < memberPaths.length; i++) {
    const p = memberPaths[i], s = ref.nodeProperties[p]?.sourceIdentity;
    if (!s || s.version !== 1 || s.ownerComponentKey !== ownerIdentity.componentKey || s.ownerMainComponentId !== ownerIdentity.mainComponentId || expectedBySource.has(s.sourceNodeId)) {
      result.missing.push("collection-reference-lineage-unavailable");
      return result;
    }
    expectedBySource.set(s.sourceNodeId, { path: p, role: c.memberTargetRoles[i] });
  }
  const claimed = /* @__PURE__ */ new Set();
  for (const node of children) {
    if (node.type !== "INSTANCE") {
      issues.push({ reason: "foreign-child-type", nodeId: node.id, type: node.type });
      continue;
    }
    const s = record10(record10(node.component).sourceIdentity), identity = record10(record10(node.component).identity);
    if (unknown2(node, "component.sourceIdentity") || s.version !== 1 || typeof s.sourceNodeId !== "string" || s.ownerComponentKey !== ownerIdentity.componentKey || s.ownerMainComponentId !== ownerIdentity.mainComponentId) {
      result.missing.push("collection-member-lineage-unavailable:" + node.id);
      continue;
    }
    const original = expectedBySource.get(s.sourceNodeId);
    if (!original) {
      issues.push({ reason: "foreign-occurrence", nodeId: node.id, sourceNodeId: s.sourceNodeId });
      continue;
    }
    if (claimed.has(s.sourceNodeId)) {
      issues.push({ reason: "duplicate-occurrence", nodeId: node.id, memberRole: original.role, sourceNodeId: s.sourceNodeId });
      continue;
    }
    claimed.add(s.sourceNodeId);
    const expected = ref.nodeProperties[original.path]?.identity;
    if (unknown2(node, "component.identity") || !identity.componentKey || !expected?.componentKey) {
      result.missing.push("collection-member-identity-unavailable:" + node.id);
      continue;
    }
    if (expected.componentSetKey ? identity.componentSetKey !== expected.componentSetKey : identity.componentSetKey || identity.componentKey !== expected.componentKey) {
      issues.push({ reason: "member-family-replaced", nodeId: node.id, memberRole: original.role, expected: expected.componentSetKey || expected.componentKey, actual: identity.componentSetKey || identity.componentKey });
      continue;
    }
    members.push({ role: original.role, node, sourceNodeId: s.sourceNodeId });
  }
  result.members = members;
  result.issues = issues;
  return result;
}
function typedCollectionValue(node, p) {
  const component = record10(node.component), fact2 = "component.properties." + p.property;
  if (unknown2(node, fact2) || unknown2(node, "component.propertyTypes." + p.property) || component.propertyTypes?.[p.property] !== p.propertyType) return void 0;
  const value = component.properties?.[p.property];
  return valueType(p.propertyType, value) ? value : void 0;
}
var collectionPropertyMatches = (node, filter) => {
  const value = typedCollectionValue(node, filter);
  return value === void 0 ? void 0 : filter.values.some((v) => stableHash(v) === stableHash(value));
};
var typedValue = typedCollectionValue;
var matches = collectionPropertyMatches;
function memberCollectionSummary(fact2) {
  const labels = { "added-children": "\u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0434\u043E\u0447\u0435\u0440\u043D\u0438\u0435 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B", "missing-children": "\u0443\u0434\u0430\u043B\u0435\u043D\u044B \u0438\u0441\u0445\u043E\u0434\u043D\u044B\u0435 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B", "foreign-child-type": "\u043F\u043E\u0441\u0442\u043E\u0440\u043E\u043D\u043D\u0438\u0439 \u0442\u0438\u043F \u0434\u043E\u0447\u0435\u0440\u043D\u0435\u0433\u043E \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430", "foreign-occurrence": "\u043F\u043E\u0441\u0442\u043E\u0440\u043E\u043D\u043D\u044F\u044F occurrence", "duplicate-occurrence": "\u0434\u0443\u0431\u043B\u0438\u043A\u0430\u0442 \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0439 occurrence", "member-family-replaced": "\u0441\u0435\u043C\u0435\u0439\u0441\u0442\u0432\u043E member \u043F\u043E\u0434\u043C\u0435\u043D\u0435\u043D\u043E" };
  const reasons = (fact2.violations || []).map((v) => {
    const role = v.memberRole || v.nodeId || "Owner";
    if (v.reason === "count-outside-domain") return `\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E ${v.actual}; \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E ${v.min ?? 0}\u2013${v.max ?? "\u221E"}`;
    if (v.reason === "member-position") return `${role}: \u043F\u043E\u0437\u0438\u0446\u0438\u044F ${v.actualIndex + 1}, \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F ${v.position === "first" ? "\u043F\u0435\u0440\u0432\u0430\u044F" : "\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F"}`;
    if (v.reason === "member-property-domain") return `${role}: ${v.property}=${JSON.stringify(v.actual)}, \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E ${v.expected.map((x) => JSON.stringify(x)).join(", ")}`;
    if (v.reason === "member-host-mapping") return `${role}: ${v.property}=${JSON.stringify(v.actual)}, \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F ${v.hostProperty} \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0430=${JSON.stringify(v.expected)}`;
    if (v.reason === "required-host-property") return `\u0412\u043B\u0430\u0434\u0435\u043B\u0435\u0446: ${v.property}=${JSON.stringify(v.actual)}, \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F ${v.expected.map((x) => JSON.stringify(x)).join(", ")}`;
    return `${role}: ${labels[v.reason] || v.reason}${v.actual !== void 0 ? `; \u0441\u0435\u0439\u0447\u0430\u0441 ${v.actual}, \u0438\u0441\u0445\u043E\u0434\u043D\u043E ${v.expected}` : ""}`;
  });
  if (fact2.missing?.length) reasons.push("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445: " + fact2.missing.join("; "));
  return reasons.length ? reasons.join(". ") : fact2.active === false ? "\u0423\u0441\u043B\u043E\u0432\u0438\u0435 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438 \u043D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E; \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F" : `\u0421\u043E\u0441\u0442\u0430\u0432 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D${fact2.count !== void 0 ? `; \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432 ${fact2.count}, \u043E\u0442\u043E\u0431\u0440\u0430\u043D\u043E ${fact2.selectedCount ?? fact2.count}` : fact2.actualCount !== void 0 ? `; \u0438\u0441\u0445\u043E\u0434\u043D\u044B\u0445 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u043E\u0432 ${fact2.actualCount}` : ""}`;
}
function materializeMemberCollections(snapshot, contract) {
  if (contract.runtimePolicy.memberCollectionsVersion !== 1 || !contract.facts.memberCollections?.length) return;
  const all = {}, ref = snapshot.variantReference;
  for (const entry of contract.facts.memberCollections) {
    const c = entry.collection, fact2 = { assertionKind: entry.collection.assertion.kind, missing: [], evidence: [] };
    all[entry.id] = fact2;
    const reps = ref && contract.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated" && ["universal", snapshot.context.platform].includes(r.platform) && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
    if (!reps || reps.length !== 1) {
      fact2.missing.push("collection-representation-unresolved");
      continue;
    }
    if (!c.representationIds.includes(reps[0].id)) {
      fact2.active = false;
      continue;
    }
    const resolution = resolveCollection(snapshot, contract, c, reps[0].id);
    fact2.missing.push(...resolution.missing);
    fact2.evidence = resolution.issues || [];
    if (resolution.actualCount !== void 0) fact2.actualCount = resolution.actualCount;
    if (!resolution.owner || !resolution.members || !resolution.issues) continue;
    const owner = resolution.owner;
    fact2.ownerNodeId = owner.id;
    if (c.assertion.kind === "membership") {
      fact2.active = true;
      if (resolution.issues.length || !resolution.missing.length) fact2.violations = resolution.issues;
      continue;
    }
    const independentPropertyCheck = ["propertyDomain", "propertyMapping"].includes(c.assertion.kind) && !c.filter && !c.whenHost && !c.whenMember;
    if (resolution.missing.length || resolution.issues.length) {
      fact2.missing.push("collection-membership-unproven");
      if (!independentPropertyCheck) continue;
    }
    let members = resolution.members;
    if (c.visibleOnly) {
      if (members.some((m) => unknown2(m.node, "visible") || unknown2(m.node, "visibility.effective") || typeof record10(m.node.visibility).effective !== "boolean")) {
        fact2.missing.push("collection-visibility-unavailable");
        if (!independentPropertyCheck) continue;
      }
      members = members.filter((m) => !unknown2(m.node, "visible") && !unknown2(m.node, "visibility.effective") && record10(m.node.visibility).effective === true);
    }
    fact2.memberNodeIds = members.map((m) => m.node.id);
    if (fact2.missing.length) fact2.knownCount = members.length;
    else fact2.count = members.length;
    if (c.whenHost) {
      const active = matches(owner, c.whenHost);
      fact2.hostConditionValue = typedValue(owner, c.whenHost);
      if (active === void 0) {
        fact2.missing.push("collection-host-condition-unavailable");
        continue;
      }
      if (!active) {
        fact2.active = false;
        continue;
      }
    }
    if (c.whenMember) {
      const results = members.map((m) => matches(m.node, c.whenMember));
      if (!results.includes(true)) {
        if (results.includes(void 0)) fact2.missing.push("collection-member-condition-unavailable");
        else fact2.active = false;
        continue;
      }
    }
    let selected = members;
    if (c.filter) {
      const results = members.map((m) => matches(m.node, c.filter));
      if (results.includes(void 0)) {
        fact2.missing.push("collection-filter-property-unavailable");
        continue;
      }
      selected = members.filter((_, i) => results[i]);
    }
    fact2.selectedNodeIds = selected.map((m) => m.node.id);
    if (fact2.missing.length) fact2.knownSelectedCount = selected.length;
    else fact2.selectedCount = selected.length;
    const a = c.assertion, violations = [];
    if (a.kind === "hostRequirement" && !selected.length) {
      fact2.active = false;
      continue;
    }
    fact2.active = true;
    if (a.kind === "count") {
      if (a.min !== void 0 && selected.length < a.min || a.max !== void 0 && selected.length > a.max) violations.push({ reason: "count-outside-domain", actual: selected.length, min: a.min, max: a.max });
    } else if (a.kind === "position") {
      if (unknown2(owner, "childIds") || unknown2(owner, "children.order")) {
        fact2.missing.push("collection-order-unavailable");
        continue;
      }
      const edge = members[a.position === "first" ? 0 : members.length - 1];
      fact2.edgeNodeId = edge?.node.id;
      selected.filter((m) => m !== edge).forEach((m) => violations.push({ reason: "member-position", nodeId: m.node.id, memberRole: m.role, position: a.position, actualIndex: members.indexOf(m), edgeNodeId: edge?.node.id }));
    } else if (a.kind === "propertyDomain") {
      const values = selected.map((m) => typedValue(m.node, a));
      fact2.memberValues = values;
      if (values.includes(void 0)) fact2.missing.push("collection-member-property-unavailable");
      selected.forEach((m, i) => {
        if (values[i] !== void 0 && !a.values.some((v) => stableHash(v) === stableHash(values[i]))) violations.push({ reason: "member-property-domain", nodeId: m.node.id, memberRole: m.role, property: a.property, actual: values[i], expected: a.values });
      });
    } else if (a.kind === "propertyMapping") {
      const host = typedValue(owner, { property: a.hostProperty, propertyType: a.hostPropertyType }), values = selected.map((m) => typedValue(m.node, a));
      fact2.hostValue = host;
      fact2.memberValues = values;
      if (host === void 0) {
        fact2.missing.push("collection-mapping-property-unavailable");
        continue;
      }
      if (values.includes(void 0)) fact2.missing.push("collection-mapping-property-unavailable");
      const normalized = values.map((v) => a.transform === "string-to-boolean" ? typeof v === "string" && /^(true|false)$/i.test(v) ? v.toLowerCase() === "true" : void 0 : v);
      if (normalized.some((v, i) => v === void 0 && values[i] !== void 0)) fact2.missing.push("collection-transform-value-unavailable");
      selected.forEach((m, i) => {
        if (normalized[i] !== void 0 && stableHash(normalized[i]) !== stableHash(host)) violations.push({ reason: "member-host-mapping", nodeId: m.node.id, memberRole: m.role, property: a.property, actual: values[i], hostProperty: a.hostProperty, expected: host });
      });
    } else if (a.kind === "hostRequirement") {
      const value = typedValue(owner, a);
      fact2.hostValue = value;
      if (value === void 0) {
        fact2.missing.push("collection-host-property-unavailable");
        continue;
      }
      if (!a.values.some((v) => stableHash(v) === stableHash(value))) violations.push({ reason: "required-host-property", nodeId: owner.id, memberNodeIds: fact2.selectedNodeIds, property: a.property, actual: value, expected: a.values });
    }
    if (violations.length || !fact2.missing.length) fact2.violations = violations;
  }
  for (const node of snapshot.nodes) {
    node.memberCollectionsV1 = all;
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "memberCollectionsV1" && !p.startsWith("memberCollectionsV1."));
  }
}

// ../Apollo/packages/component-contract-core/src/dependency-facts.ts
var record11 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var propertyName = (name) => name.replace(/#[^#]+$/, "");
function identityLockFacts(snapshot, binding, owner, paths, originalReference) {
  const gap = (reason) => ({ reason });
  const knownId = (value) => typeof value === "string" && value.length > 0;
  const unknown14 = (node, fact2) => (node.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + "."));
  const ownerPath = paths.get(String(owner.id));
  const comparison = compareInstanceBoundaries(snapshot, originalReference);
  const boundaries = (snapshot.instanceBoundaries || comparison.boundaries).filter((b) => withinBoundary(ownerPath, b.actualPath)).sort((a, b) => a.actualPath.split(" / ").length - b.actualPath.split(" / ").length);
  let reference = originalReference;
  for (const boundary of boundaries) {
    if (boundary.reason !== "component-variant-changed") return gap("wrapper-lineage-changed");
    const result = snapshot.instanceContentResults?.find((r) => r.boundaryNodeId === boundary.nodeId);
    const attempts = snapshot.instanceContentReferences?.attempts.filter((a) => a.boundaryNodeId === boundary.nodeId) || [];
    if (snapshot.instanceContentReferences?.schemaVersion !== "apollo.instance-content-references.v4" || !result?.lineageProven || attempts.length !== 1 || attempts[0].failure || !attempts[0].reference) return gap("wrapper-lineage-unproven");
    const host = attempts[0].reference;
    reference = captureVariantReference(host, host.source?.componentKey || "", host.source?.componentSetKey || "");
  }
  const portComparison = compareInstanceBoundaries(snapshot, reference, true);
  const referenceOwnerPath = correspondingPath(portComparison, ownerPath);
  if (!portComparison.complete || referenceOwnerPath === void 0) return gap("original-port-unproven");
  const expectedOwner = reference.nodeProperties[referenceOwnerPath], component = record11(owner.component), identity = record11(component.identity);
  if (unknown14(owner, "component.identity.componentKey") || unknown14(owner, "component.identity.componentSetKey") || !knownId(identity.componentKey) || identity.componentKey !== expectedOwner?.identity?.componentKey || (identity.componentSetKey || "") !== (expectedOwner?.identity?.componentSetKey || "")) return gap("wrapper-identity-unproven");
  const nearestActualOwner = (node) => {
    const seen = /* @__PURE__ */ new Set();
    let parentId = node.parentId;
    while (parentId && !seen.has(String(parentId))) {
      seen.add(String(parentId));
      const parent3 = snapshot.nodes.find((n) => n.id === parentId);
      if (!parent3) return void 0;
      if (parent3.type === "INSTANCE") return parent3;
      parentId = parent3.parentId;
    }
    return void 0;
  };
  const nearestReferenceOwner = (path) => {
    let parent3 = path.split(" / ").slice(0, -1).join(" / ");
    while (parent3) {
      if (reference.nodes.some((n) => n.path === parent3 && n.type === "INSTANCE")) return parent3;
      parent3 = parent3.split(" / ").slice(0, -1).join(" / ");
    }
    return "";
  };
  const actual = snapshot.nodes.filter((n) => n.type === "INSTANCE" && nearestActualOwner(n) === owner && typeof record11(record11(n.component).propertyReferenceBindings).mainComponent === "string" && binding.portNames.includes(propertyName(record11(record11(n.component).propertyReferenceBindings).mainComponent)));
  const expected = reference.nodes.filter((n) => n.type === "INSTANCE" && nearestReferenceOwner(n.path) === referenceOwnerPath && typeof reference.nodeProperties[n.path]?.propertyReferenceBindings?.mainComponent === "string" && binding.portNames.includes(propertyName(reference.nodeProperties[n.path].propertyReferenceBindings.mainComponent)));
  if (actual.length !== 1 || expected.length !== 1) return gap("swap-consumer-unresolved");
  const asset = record11(actual[0].component), assetIdentity = record11(asset.identity), expectedAsset = reference.nodeProperties[expected[0].path];
  if (!expectedAsset.identity) return gap("original-port-unproven");
  const port = record11(asset.propertyReferenceBindings).mainComponent;
  if (["component.identity.componentKey", "component.identity.mainComponentId", "component.propertyReferenceBindings.mainComponent"].some((f) => unknown14(actual[0], f)) || ["component.properties." + port, "component.propertyTypes." + port].some((f) => unknown14(owner, f)) || record11(component.propertyTypes)[port] !== "INSTANCE_SWAP" || expectedOwner.propertyTypes[port] !== "INSTANCE_SWAP" || expectedAsset.propertyReferenceBindings?.mainComponent !== port || !knownId(assetIdentity.mainComponentId) || record11(component.properties)[port] !== assetIdentity.mainComponentId || !knownId(assetIdentity.componentKey) || !knownId(expectedAsset.identity?.componentKey) || !knownId(expectedAsset.identity?.mainComponentId) || expectedOwner.properties[port] !== expectedAsset.identity.mainComponentId) return gap("original-port-unproven");
  if (assetIdentity.componentKey === expectedAsset.identity.componentKey && (unknown14(actual[0], "component.identity.componentSetKey") || (assetIdentity.componentSetKey || "") !== (expectedAsset.identity.componentSetKey || ""))) return gap("asset-identity-conflict");
  if (record11(actual[0].visibility).effective === false) return { applicable: false, reason: "icon-hidden" };
  if (record11(actual[0].visibility).effective !== true) return gap("icon-visibility-unavailable");
  return {
    applicable: true,
    changed: assetIdentity.componentKey !== expectedAsset.identity.componentKey,
    componentKey: assetIdentity.componentKey,
    referenceComponentKey: expectedAsset.identity.componentKey
  };
}
function parseAssetCatalogs(value) {
  if (!Array.isArray(value) || value.some((c) => !c || typeof c !== "object" || !["catalog", "library", "sourceHash", "generatedAt"].every((k) => typeof c[k] === "string") || !c.catalog || !c.library || !c.sourceHash || !Array.isArray(c.members) || c.members.some((m) => !m || typeof m.componentKey !== "string" || !m.componentKey || typeof m.componentSetKey !== "string" || !m.componentSetKey))) {
    throw new Error("Invalid read-only asset catalog evidence. Rebuild the package from Athena indexes.");
  }
  return value;
}
function dependencyBinding(subject, constraint) {
  const binding = {
    ...subject,
    portNames: [...constraint.dependency?.portNames || []].sort(),
    ...constraint.dependency?.field === "changed" ? { identityLock: true } : {},
    ...constraint.dependency?.subjectCondition ? { subjectCondition: constraint.dependency.subjectCondition } : {},
    ...constraint.dependency?.contractDependencyId ? { contractDependencyId: constraint.dependency.contractDependencyId } : {},
    ...constraint.dependency?.field === "variantProperty" ? { variantProperty: constraint.dependency.property } : {}
  };
  return {
    id: `d_${stableHash(binding).slice(0, 20)}`,
    ...binding,
    ...["portName", "width", "height", "variantProperty"].includes(constraint.dependency?.field || "") ? { metrics: true } : {}
  };
}
function extractAssetCatalogs(inputs) {
  return inputs.filter((d) => d.kind === "component-index" && typeof d.catalogName === "string" && typeof d.library === "string" && Array.isArray(d.components)).map((d) => ({
    catalog: String(d.catalogName),
    library: String(d.library),
    sourceHash: stableHash(d),
    generatedAt: String(d.generatedAt || ""),
    members: d.components.flatMap((c) => (Array.isArray(c.variants) ? c.variants : []).filter((v) => typeof v.key === "string" && v.key && typeof c.key === "string" && c.key).map((v) => ({ componentKey: v.key, componentSetKey: c.key }))).sort((a, b) => a.componentKey.localeCompare(b.componentKey))
  })).sort((a, b) => a.catalog.localeCompare(b.catalog));
}
function materializeDependencyFacts(snapshot, contract) {
  const bindings = contract.facts.dependencyBindings || [];
  const root2 = snapshot.nodes.filter((n) => snapshot.selection.includes(String(n.id)));
  const paths = snapshotPaths(snapshot);
  const reference = snapshot.variantReference;
  const comparison = reference ? compareInstanceBoundaries(snapshot, reference) : void 0;
  const membership = /* @__PURE__ */ new Map();
  for (const catalog of contract.facts.variantEvidence?.assetCatalogs || []) for (const m of catalog.members) {
    membership.set(m.componentKey, [...membership.get(m.componentKey) || [], { catalog: catalog.catalog, library: catalog.library, componentSetKey: m.componentSetKey }]);
  }
  const facts2 = {};
  for (const b of bindings) {
    const f = {};
    facts2[b.id] = f;
    const lockRequired = contract.rules.some((r) => record11(record11(r.assert).actual).fact === `dependencies.${b.id}.changed`);
    if ((b.identityLock || lockRequired) && (b.identityLock !== true || contract.runtimePolicy.assetIdentityLockVersion !== 1)) {
      f.reason = "asset-identity-lock-version-unavailable";
      continue;
    }
    if (b.subjectCondition) {
      if (contract.runtimePolicy.dependencySubjectConditionsVersion !== 1) {
        f.reason = "dependency-subject-condition-version-unavailable";
        continue;
      }
      const targets2 = snapshot.nodes.filter((n) => record11(n.semantic).role === b.targetRole);
      const available = record11(record11(root2[0]?.variantAvailability).targets)[b.targetRole];
      if (targets2.length !== 1 || available?.present !== true) {
        f.reason = "dependency-subject-unproven";
        continue;
      }
      const matched = collectionPropertyMatches(targets2[0], b.subjectCondition);
      f.subjectValue = typedCollectionValue(targets2[0], b.subjectCondition);
      if (matched === void 0) {
        f.reason = "dependency-subject-property-unavailable";
        continue;
      }
      f.subjectMatches = matched;
      if (!matched) {
        f.applicable = false;
        f.reason = "dependency-subject-condition-inactive";
        continue;
      }
    }
    if (b.contractDependencyId) {
      const dependency = contract.componentDependencies?.find((d) => d.id === b.contractDependencyId);
      const binding = dependency?.bindings.find((d) => d.targetRole === b.targetRole && d.relativePath === b.relativePath);
      if (!dependency || !binding || dependency.issue) {
        f.reason = dependency?.issue || "dependency-binding-missing";
        continue;
      }
      const result = resolveFixedNestedBinding(snapshot, dependency, binding, false, contract);
      f.reason = result.reason;
      if (result.status === "inactive") f.applicable = false;
      if (result.status !== "active" || !result.node) continue;
      if (!result.identityValid) {
        f.reason = "dependency-child-identity-mismatch";
        continue;
      }
      f.applicable = true;
      const node = result.node, component2 = record11(node.component), identity2 = record11(component2.identity);
      if (identity2.componentKey) f.componentKey = identity2.componentKey;
      if (identity2.componentSetKey) f.componentSetKey = identity2.componentSetKey;
      if (b.variantProperty) {
        const value = component2.properties?.[b.variantProperty];
        const unavailable = (node.unknownFacts || []).some((p) => [`component.properties.${b.variantProperty}`, `component.propertyTypes.${b.variantProperty}`].some((input) => input === p || input.startsWith(p + ".")));
        if (!unavailable && component2.propertyTypes?.[b.variantProperty] === "VARIANT" && typeof value === "string" && value.trim()) f.variantProperty = value;
        else f.reason = "dependency-variant-property-unavailable";
      }
      for (const dim of ["width", "height"]) if (typeof record11(node.bounds)[dim] === "number" && Number.isFinite(record11(node.bounds)[dim])) f[dim] = record11(node.bounds)[dim];
      continue;
    }
    if (root2.length !== 1 || !paths || snapshot.source?.truncated || !comparison?.complete) {
      f.reason = "reference-or-topology-unavailable";
      continue;
    }
    const availability = record11(record11(root2[0].variantAvailability).targets)[b.targetRole];
    if (availability?.present === false) {
      f.applicable = false;
      f.reason = "target-absent-in-variant";
      continue;
    }
    const targets = snapshot.nodes.filter((n) => record11(n.semantic).role === b.targetRole);
    if (targets.length !== 1 || availability?.present !== true) {
      f.reason = "target-unresolved";
      continue;
    }
    const target = targets[0];
    if (record11(target.visibility).effective === false) {
      f.applicable = false;
      f.reason = "target-hidden";
      continue;
    }
    if (record11(target.visibility).effective !== true) {
      f.reason = "visibility-unavailable";
      continue;
    }
    const targetPath = b.identityLock ? paths.get(String(target.id)) : correspondingPath(comparison, paths.get(String(target.id)));
    const path = [targetPath, b.relativePath].filter(Boolean).join(" / ");
    const matches2 = snapshot.nodes.filter((n) => (b.identityLock ? paths.get(String(n.id)) : correspondingPath(comparison, paths.get(String(n.id)))) === path);
    if (matches2.length !== 1 || matches2[0].type !== "INSTANCE") {
      f.reason = "nested-instance-unresolved";
      continue;
    }
    const owner = matches2[0], component = record11(owner.component), identity = record11(component.identity);
    if (b.identityLock) {
      Object.assign(f, identityLockFacts(snapshot, b, owner, paths, reference));
      continue;
    }
    if (!b.portNames.length) {
      f.applicable = true;
      if (typeof identity.componentKey === "string" && identity.componentKey && typeof identity.componentSetKey === "string" && identity.componentSetKey) {
        f.componentSetKey = identity.componentSetKey;
        f.componentKey = identity.componentKey;
      } else f.reason = "component-identity-unavailable";
      continue;
    }
    let portReference = reference;
    const wrapperBoundary = comparison.boundaries.find((boundary2) => withinBoundary(paths.get(String(owner.id)), boundary2.actualPath));
    if (wrapperBoundary) {
      const resolved = snapshot.instanceContentResults?.find((r) => r.boundaryNodeId === wrapperBoundary.nodeId && (r.status === "matched" || snapshot.instanceContentReferences?.schemaVersion === "apollo.instance-content-references.v4" && r.lineageProven));
      const attempts = snapshot.instanceContentReferences?.attempts.filter((a) => a.boundaryNodeId === wrapperBoundary.nodeId) || [];
      const host = attempts.length === 1 && !attempts[0].failure ? attempts[0].reference : void 0;
      if (wrapperBoundary.reason !== "component-variant-changed" || wrapperBoundary.nodeId !== owner.id || !resolved || !host) {
        f.reason = "wrapper-lineage-changed";
        continue;
      }
      portReference = captureVariantReference(host, host.source?.componentKey || "", host.source?.componentSetKey || "");
    }
    let properties = Object.entries(record11(component.propertyTypes)).filter(([p, t]) => t === "INSTANCE_SWAP" && b.portNames.includes(propertyName(p))).map(([p]) => p);
    const ownerFor = (node) => {
      const seen = /* @__PURE__ */ new Set();
      let current = node;
      while (current.parentId && !seen.has(String(current.parentId))) {
        seen.add(String(current.parentId));
        const parent3 = snapshot.nodes.find((n) => n.id === current.parentId);
        if (!parent3) return void 0;
        if (parent3.type === "INSTANCE") return parent3;
        current = parent3;
      }
      return void 0;
    };
    if (["apollo.instance-content-references.v3", "apollo.instance-content-references.v4"].includes(snapshot.instanceContentReferences?.schemaVersion || "")) {
      const binding = (n) => record11(record11(n.component).propertyReferenceBindings).mainComponent;
      const actualConsumers = snapshot.nodes.filter((n) => n.type === "INSTANCE" && ownerFor(n) === owner && typeof binding(n) === "string" && b.portNames.includes(propertyName(binding(n))));
      const referenceOwner = (p) => {
        let parent3 = p.split(" / ").slice(0, -1).join(" / ");
        while (parent3) {
          if (portReference.nodes.some((n) => n.path === parent3 && n.type === "INSTANCE")) return parent3;
          parent3 = parent3.split(" / ").slice(0, -1).join(" / ");
        }
        return "";
      };
      const referenceConsumers = portReference.nodes.filter((n) => n.type === "INSTANCE" && referenceOwner(n.path) === path && typeof portReference.nodeProperties[n.path]?.propertyReferenceBindings?.mainComponent === "string" && b.portNames.includes(propertyName(portReference.nodeProperties[n.path].propertyReferenceBindings.mainComponent)));
      if (!actualConsumers.length && !referenceConsumers.length) {
        f.applicable = false;
        f.reason = "no-icon-port-in-variant";
        continue;
      }
      if (actualConsumers.length !== 1 || referenceConsumers.length !== 1) {
        f.reason = "swap-consumer-unresolved";
        continue;
      }
      const property2 = binding(actualConsumers[0]);
      const original2 = portReference.nodeProperties[referenceConsumers[0].path], originalOwner = portReference.nodeProperties[path];
      if (!properties.includes(property2) || original2.propertyReferenceBindings?.mainComponent !== property2 || originalOwner?.propertyTypes[property2] !== "INSTANCE_SWAP" || !original2.identity?.mainComponentId || originalOwner.properties[property2] !== original2.identity.mainComponentId) {
        f.reason = "original-port-unproven";
        continue;
      }
      properties = [property2];
    }
    if (!properties.length) {
      const original2 = portReference.nodeProperties[path];
      const referenceHasPort = Object.entries(original2?.propertyTypes || {}).some(([p, t]) => t === "INSTANCE_SWAP" && b.portNames.includes(propertyName(p)));
      if (!original2 || referenceHasPort) f.reason = "swap-port-evidence-unavailable";
      else {
        f.applicable = false;
        f.reason = "no-icon-port-in-variant";
      }
      continue;
    }
    if (properties.length !== 1) {
      f.reason = "ambiguous-swap-port";
      continue;
    }
    const property = properties[0];
    const consumers = snapshot.nodes.filter((n) => n.type === "INSTANCE" && ownerFor(n) === owner && record11(record11(n.component).propertyReferenceBindings).mainComponent === property);
    if (consumers.length !== 1) {
      f.reason = "swap-consumer-unresolved";
      continue;
    }
    const icon = consumers[0], iconIdentity = record11(record11(icon.component).identity);
    if (!iconIdentity.mainComponentId || record11(component.properties)[property] !== iconIdentity.mainComponentId || !iconIdentity.componentKey) {
      f.reason = "swap-binding-unproven";
      continue;
    }
    if (record11(icon.visibility).effective === false) {
      f.applicable = false;
      f.reason = "icon-hidden";
      continue;
    }
    if (record11(icon.visibility).effective !== true) {
      f.reason = "icon-visibility-unavailable";
      continue;
    }
    const boundary = (snapshot.instanceBoundaries || comparison.boundaries).find((b2) => b2.nodeId === String(icon.id));
    const portComparison = snapshot.source?.instanceIdentityVersion === 1 ? compareInstanceBoundaries(snapshot, portReference, true) : void 0;
    const iconPath = correspondingPath(portComparison, paths.get(String(icon.id)));
    const original = boundary ? portReference.nodeProperties[boundary.referencePath] : iconPath !== void 0 ? portReference.nodeProperties[iconPath] : void 0;
    if (original?.propertyReferenceBindings?.mainComponent !== property || !original.identity?.componentKey) {
      f.reason = "original-port-unproven";
      continue;
    }
    f.applicable = true;
    f.changed = iconIdentity.componentKey !== original.identity.componentKey;
    f.componentKey = iconIdentity.componentKey;
    f.referenceComponentKey = original.identity.componentKey;
    if (b.variantProperty) {
      const asset = record11(icon.component), value = record11(asset.properties)[b.variantProperty];
      const unavailable = (icon.unknownFacts || []).some((p) => [`component.properties.${b.variantProperty}`, `component.propertyTypes.${b.variantProperty}`].some((f2) => f2 === p || f2.startsWith(`${p}.`)));
      if (!unavailable && record11(asset.propertyTypes)[b.variantProperty] === "VARIANT" && typeof value === "string" && value.trim()) f.variantProperty = value;
      else f.reason = "asset-variant-property-unavailable";
    }
    if (b.metrics) {
      f.portName = propertyName(property);
      for (const dimension of ["width", "height"]) {
        const value = record11(icon.bounds)[dimension];
        if (typeof value === "number" && Number.isFinite(value) && value > 0) f[dimension] = value;
      }
    }
    const entries = membership.get(iconIdentity.componentKey) || [];
    const catalogs = [...new Set(entries.map((m) => m.catalog))];
    if (catalogs.length === 1 && new Set(entries.map((m) => m.library)).size === 1 && entries.every((m) => m.componentSetKey === iconIdentity.componentSetKey)) f.catalog = catalogs[0];
    else f.reason = entries.length ? "catalog-identity-conflict" : "catalog-key-unknown";
  }
  for (const node of snapshot.nodes) {
    node.dependencies = facts2;
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "dependencies" && !p.startsWith("dependencies."));
  }
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
      const key2 = await resolveKey(id);
      if (key2) result.keysById[id] = key2;
    } catch {
    }
  }
  return result;
}
var record12 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var textStyleBindingFact = (catalog) => `textStyleBindingsV1.c_${stableHash(catalog).slice(0, 16)}`;
function extractTextStyleCatalogs(files) {
  return files.filter((f) => Array.isArray(f.data.styles)).flatMap((f) => {
    const styles = f.data.styles.filter((s) => s.type === "text");
    if (!styles.length) return [];
    if (styles.some((s) => !/^[a-f0-9]{40}$/i.test(s.key) || typeof s.name !== "string") || new Set(styles.map((s) => s.key)).size !== styles.length) throw new Error(`${f.name}: invalid text style catalog`);
    return [{
      id: f.name.split("/").pop(),
      sourceHash: stableHash(f.data),
      styles: styles.map((s) => ({ key: s.key.toLowerCase(), name: [s.group, s.name].filter(Boolean).join("/") })).sort((a, b) => a.key.localeCompare(b.key))
    }];
  });
}
function validTextStyleCatalog(c) {
  return !!c && typeof c.id === "string" && /^[a-f0-9]{64}$/.test(c.sourceHash) && Array.isArray(c.styles) && c.styles.length > 0 && c.styles.every((s) => !!s && /^[a-f0-9]{40}$/.test(s.key) && typeof s.name === "string") && new Set(c.styles.map((s) => s.key)).size === c.styles.length;
}
function materializeTextStyleBindings(snapshot, contract) {
  if (contract.runtimePolicy.textStyleBindingFactsVersion !== 1) return;
  const rawCatalogs = contract.facts.variantEvidence?.textStyleCatalogs;
  const catalogs = Array.isArray(rawCatalogs) ? rawCatalogs.filter((c) => c && typeof c.id === "string") : [];
  for (const node of snapshot.nodes) {
    const prior = node.unknownFacts || [];
    node.unknownFacts = prior.filter((p) => p !== "textStyleBindingsV1" && !p.startsWith("textStyleBindingsV1."));
    node.textStyleBindingsV1 = {};
    if (node.type !== "TEXT") continue;
    const t = record12(record12(node.appearance).typography);
    const evidence = record12(node.textStyleEvidenceV1);
    const captureUnknown = prior.some((p) => p === "appearance" || p === "appearance.typography" || p.startsWith("appearance.typography.") || p === "textStyleEvidenceV1" || p.startsWith("textStyleEvidenceV1."));
    let ids;
    if (!captureUnknown && evidence.version === 1) {
      const text3 = record12(node.text).characters, ranges2 = evidence.segments;
      if (typeof text3 === "string" && Array.isArray(ranges2)) {
        let end = 0;
        const valid = ranges2.every((s) => s && Number.isInteger(s.start) && Number.isInteger(s.end) && s.start === end && s.end > s.start && s.end <= text3.length && (end = s.end));
        if (valid && end === text3.length) ids = ranges2.length ? ranges2.map((s) => s.styleId) : [t.styleId];
      }
    } else if (!captureUnknown && node.textStyleEvidenceV1 === void 0 && typeof t.styleId === "string") ids = [t.styleId];
    for (const catalog of catalogs) {
      const fact2 = textStyleBindingFact(catalog.id), key2 = fact2.split(".")[1];
      let unknown14 = !ids || !validTextStyleCatalog(catalog) || catalogs.filter((c) => c.id === catalog.id).length !== 1;
      let detached = false, outside = false;
      const keys = [], names = [];
      if (!unknown14) for (const id of ids) {
        if (id === "") {
          detached = true;
          continue;
        }
        if (typeof id !== "string") {
          unknown14 = true;
          continue;
        }
        const match = /^S:([a-f0-9]{40})(?:,[^\s]+)?$/i.exec(id);
        const resolvedKey = match?.[1] || record12(evidence.keysById)[id];
        if (typeof resolvedKey !== "string" || !/^[a-f0-9]{40}$/i.test(resolvedKey)) {
          unknown14 = true;
          continue;
        }
        const styleKey2 = resolvedKey.toLowerCase(), style = catalog.styles.find((s) => s.key === styleKey2);
        keys.push(styleKey2);
        if (style) names.push(style.name);
        else outside = true;
      }
      if (!unknown14 || detached || outside) {
        record12(node.textStyleBindingsV1)[key2] = {
          required: !detached,
          library: !detached && !outside && !unknown14,
          state: detached ? "detached" : outside ? "outside-catalog" : "bound",
          catalog: catalog.id,
          styleKeys: [...new Set(keys)].sort(),
          styleNames: [...new Set(names)].sort()
        };
      } else node.unknownFacts.push(fact2);
    }
  }
}

// ../Apollo/packages/component-contract-core/src/importer.ts
function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function record13(value) {
  return isRecord(value) ? value : {};
}
function stringValue(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}
function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}
function collectStrings(value, keyMatcher, result = []) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectStrings(entry, keyMatcher, result));
    return result;
  }
  if (!isRecord(value)) return result;
  for (const [key2, entry] of Object.entries(value)) {
    if (keyMatcher.test(key2) && typeof entry === "string" && entry) result.push(entry);
    collectStrings(entry, keyMatcher, result);
  }
  return result;
}
function parseFiles(files) {
  const seen = /* @__PURE__ */ new Map();
  const unique = files.filter((file) => {
    const key2 = file.name.split("/").pop() || file.name;
    const previous = seen.get(key2);
    if (previous === file.text) return false;
    seen.set(key2, file.text);
    return true;
  });
  return unique.map((file) => {
    let parsed;
    try {
      parsed = JSON.parse(file.text);
    } catch (error) {
      throw new Error(`${file.name}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    }
    if (!isRecord(parsed)) throw new Error(`${file.name}: root must be a JSON object.`);
    return { name: file.name, data: parsed };
  });
}
function packageFolder(files) {
  const generated = files.find((file) => /contract\.generated\.json$/i.test(file.name));
  const path = generated?.name || files[0]?.name || "";
  const parts = path.split("/").filter(Boolean);
  const sourceIndex = parts.lastIndexOf("source");
  if (sourceIndex > 0) return parts[sourceIndex - 1];
  return parts.length > 1 ? parts[parts.length - 2] : "";
}
function contractCandidates(parsed) {
  const candidates = [];
  for (const entry of parsed) {
    for (const candidate of arrayValue(entry.data.contracts)) {
      if (isRecord(candidate)) candidates.push({ ...candidate, packageAthena: true });
    }
    const generated = record13(entry.data.generated);
    for (const candidate of arrayValue(generated.contracts)) {
      if (isRecord(candidate)) candidates.push({ ...candidate, packageAthena: true });
    }
  }
  if (candidates.length) return candidates;
  for (const entry of parsed) {
    if (entry.data.documentType !== "component-contract") continue;
    const packageInfo = record13(entry.data.package);
    const familySlug = slug(stringValue(packageInfo.family));
    const library = stringValue(packageInfo.library);
    for (const componentApiEntry of arrayValue(record13(entry.data.facts).componentApi)) {
      if (!isRecord(componentApiEntry)) continue;
      const name = stringValue(componentApiEntry.name);
      const status = stringValue(componentApiEntry.status, "active");
      candidates.push({
        ...componentApiEntry,
        normalizedName: slug(name),
        packageComponentApi: true,
        packageFamily: slug(name) === familySlug,
        role: status !== "deprecated" ? "main" : "supporting",
        source: { ...record13(componentApiEntry.source), library }
      });
    }
  }
  return candidates;
}
function compiledContainsCandidate(data, candidate) {
  if (data.documentType !== "component-contract") return false;
  if (!candidate) return true;
  const candidateId = stringValue(candidate.id);
  const candidateKey = stringValue(candidate.componentKey);
  const packageInfo = record13(data.package);
  if (candidateId && stringValue(packageInfo.id) === candidateId) return true;
  const facts2 = record13(data.facts);
  const factsComponent = record13(facts2.component);
  if (candidateKey && stringValue(factsComponent.componentKey) === candidateKey) return true;
  return arrayValue(facts2.componentApi).some((entry) => {
    const componentApi = record13(entry);
    return Boolean(
      candidateId && stringValue(componentApi.id) === candidateId || candidateKey && stringValue(componentApi.componentKey) === candidateKey
    );
  });
}
function chooseContract(candidates, folder, preferredContractId) {
  if (!candidates.length) return void 0;
  if (preferredContractId) {
    const preferred = candidates.find((candidate) => stringValue(candidate.id) === preferredContractId);
    if (preferred) return preferred;
  }
  const folderSlug = slug(folder);
  return candidates.find((candidate) => {
    const name = stringValue(candidate.normalizedName) || slug(stringValue(candidate.name));
    return name === folderSlug;
  }) || candidates.find((candidate) => candidate.packageFamily === true && candidate.role === "main") || candidates.find((candidate) => candidate.role === "main") || candidates[0];
}
function choicesForContract(candidates, selected, representedComponentKeys) {
  if (!selected) return [];
  const normalizedName = stringValue(selected.normalizedName) || slug(stringValue(selected.name));
  const familyName = normalizedName.replace(/-inverted$/i, "");
  const selectedLibrary = stringValue(record13(selected.source).library);
  const matching = candidates.filter((candidate) => {
    const candidateName = stringValue(candidate.normalizedName) || slug(stringValue(candidate.name));
    const candidateLibrary = stringValue(record13(candidate.source).library);
    const candidateKey = stringValue(candidate.componentKey);
    const belongsToRepresentations = representedComponentKeys.size > 0 && representedComponentKeys.has(candidateKey);
    const belongsToSameCompiledPackage = selected.packageComponentApi === true && candidate.packageComponentApi === true;
    const belongsToSameAthenaPackage = selected.packageAthena === true && candidate.packageAthena === true;
    const belongsToDetectedFamily = candidateName.replace(/-inverted$/i, "") === familyName;
    return candidate.role === "main" && stringValue(candidate.status, "active") !== "deprecated" && (belongsToSameCompiledPackage || belongsToSameAthenaPackage || belongsToRepresentations || belongsToDetectedFamily) && (!selectedLibrary || !candidateLibrary || candidateLibrary === selectedLibrary);
  });
  const preferredByRepresentation = /* @__PURE__ */ new Map();
  matching.forEach((candidate) => {
    const candidateName = stringValue(candidate.normalizedName) || slug(stringValue(candidate.name));
    const platform = stringValue(candidate.platform) || "universal";
    const representationId = `${candidateName}.${platform}`;
    const current = preferredByRepresentation.get(representationId);
    if (!current || stringValue(candidate.id) === representationId) {
      preferredByRepresentation.set(representationId, candidate);
    }
  });
  const choiceCandidates = preferredByRepresentation.size ? Array.from(preferredByRepresentation.values()) : [selected];
  const choices = choiceCandidates.map((candidate) => ({
    contractId: stringValue(candidate.id),
    label: stringValue(candidate.name) || stringValue(candidate.normalizedName) || "Component",
    platform: stringValue(candidate.platform) || "universal",
    componentKey: stringValue(candidate.componentKey)
  })).filter((choice) => choice.contractId);
  return Array.from(new Map(choices.map((choice) => [choice.contractId, choice])).values());
}
function componentIdentity(parsed, candidate, folder) {
  const compiled = parsed.find((entry) => compiledContainsCandidate(entry.data, candidate))?.data;
  const packageInfo = record13(compiled?.package);
  const source = record13(candidate?.source);
  const metadata = parsed.map((entry) => record13(entry.data.metadata)).find((entry) => Object.keys(entry).length);
  const family = stringValue(candidate?.name) || stringValue(candidate?.normalizedName) || stringValue(packageInfo.family) || folder || "Imported component";
  const contractId = stringValue(candidate?.id) || stringValue(packageInfo.id) || stringValue(metadata?.componentKey) || `manual.${slug(family)}`;
  const discoveredKeys = collectStrings(parsed.map((entry) => entry.data), /^componentKey$/i);
  const componentKey = stringValue(candidate?.componentKey) || discoveredKeys.find((value) => /^[a-f\d]{20,}$/i.test(value)) || "";
  const semanticId = stringValue(metadata?.componentKey) || stringValue(record13(record13(compiled?.facts).component).componentId) || contractId;
  const platform = stringValue(candidate?.platform) || "universal";
  return {
    componentId: semanticId,
    familyId: semanticId,
    contractId,
    family: family.replace(/^\[[DMT]\]\s*/, ""),
    layer: stringValue(metadata?.layer) || "core",
    library: stringValue(source.library) || stringValue(packageInfo.library) || "Unknown library",
    platform,
    platforms: platform === "universal" ? [] : [platform],
    lifecycle: stringValue(candidate?.status) === "deprecated" ? "deprecated" : stringValue(candidate?.status) === "scheduled" ? "scheduled" : "active",
    componentKey
  };
}
function normalizeManualSource(value) {
  if (value.schemaVersion === MANUAL_SCHEMA_VERSION) {
    return {
      ...value,
      examples: arrayValue(value.examples),
      decisions: arrayValue(value.decisions)
    };
  }
  if (value.schemaVersion !== LEGACY_MANUAL_SCHEMA_VERSION) {
    throw new Error(`Unsupported manual source schema: ${stringValue(value.schemaVersion, "unknown")}.`);
  }
  const legacy = value;
  const component = legacy.component;
  const componentId = component.componentId || component.contractId;
  return {
    ...legacy,
    schemaVersion: MANUAL_SCHEMA_VERSION,
    component: {
      ...component,
      componentId,
      familyId: component.familyId || componentId,
      layer: component.layer || "core",
      platforms: component.platforms || (component.platform === "universal" ? [] : [component.platform]),
      lifecycle: component.lifecycle || "active"
    },
    semantics: {
      purpose: "",
      useWhen: [],
      doNotUseWhen: [],
      relatedComponentIds: [],
      keywords: []
    },
    representations: component.componentKey ? [{
      id: `${componentId}.figma.${component.platform || "universal"}`,
      kind: "figma",
      platform: component.platform || "universal",
      status: "draft",
      locator: { componentKey: component.componentKey }
    }] : [],
    semanticApi: [],
    documentation: [],
    examples: [],
    decisions: [],
    generation: { profiles: [], instructions: [] },
    metadata: {
      ...legacy.metadata,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
function variantsFromContract(candidate, identity) {
  const figma = record13(candidate?.figma);
  const variants = record13(figma.variants);
  const variantKeys = arrayValue(variants.variantKeys);
  const result = variantKeys.flatMap((entry, index) => {
    if (!isRecord(entry)) return [];
    const properties = Object.fromEntries(
      Object.entries(record13(entry.properties)).map(([key2, value]) => [key2, stringValue(value)])
    );
    return [{
      id: stringValue(entry.key) || `variant-${index + 1}`,
      label: stringValue(entry.name) || Object.entries(properties).map(([key2, value]) => `${key2}=${value}`).join(", "),
      componentKey: stringValue(entry.key) || identity.componentKey,
      properties
    }];
  });
  if (result.length) return result;
  return [{
    id: identity.componentKey || "default",
    label: "Default",
    componentKey: identity.componentKey,
    properties: {}
  }];
}
function nodeProperties(node) {
  const result = {
    visible: node.visible !== false,
    name: stringValue(node.name),
    type: stringValue(node.type)
  };
  if (node.layout !== void 0) result.layout = node.layout;
  if (node.radius !== void 0) result.radius = node.radius;
  if (node.opacity !== void 0) result.opacity = node.opacity;
  if (node.fills !== void 0) result.fills = node.fills;
  if (node.strokes !== void 0) result.strokes = node.strokes;
  if (node.fillToken !== void 0) result.fillToken = node.fillToken;
  if (node.strokeToken !== void 0) result.strokeToken = node.strokeToken;
  if (node.typographyToken !== void 0) result.typographyToken = node.typographyToken;
  if (node.text !== void 0) result.text = node.text;
  if (node.variantProperties !== void 0) result.variantProperties = node.variantProperties;
  return result;
}
function structureFromContract(candidate) {
  const figma = record13(candidate?.figma);
  const raw = arrayValue(figma.structureSignature);
  const ids = raw.map((entry, index) => stringValue(record13(entry).nodeId, String(index + 1)));
  const result = raw.flatMap((entry, index) => {
    if (!isRecord(entry)) return [];
    const parentRaw = entry.parentId;
    const parentId = parentRaw === null || parentRaw === void 0 ? null : String(parentRaw);
    const name = stringValue(entry.name, `Node ${index + 1}`);
    const path = stringValue(entry.path, name);
    const depth = Math.max(0, path.split("/").length - 1);
    return [{
      id: ids[index],
      parentId,
      name,
      type: stringValue(entry.type, "NODE"),
      path,
      semanticRole: slug(name),
      visible: entry.visible !== false,
      order: index,
      depth,
      childIds: [],
      properties: nodeProperties(entry),
      unknownFacts: []
    }];
  });
  const byId = new Map(result.map((node) => [node.id, node]));
  result.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)?.childIds.push(node.id);
  });
  const paths = catalogOccurrencePaths(new Map(raw.filter(isRecord).map((node) => [String(node.nodeId), node])));
  const root2 = result.find((n) => n.parentId === null);
  if (paths && root2) for (const node of result) {
    node.path = [root2.name, paths.get(node.id)].filter(Boolean).join(" / ");
    node.depth = paths.get(node.id) ? paths.get(node.id).split(" / ").length : 0;
  }
  return result;
}
function structureFromVariantEvidence(evidence, componentKey, rootName) {
  const matches2 = evidence?.variants.filter((v) => v.componentKey === componentKey || v.componentSetKey === componentKey) || [];
  if (matches2.length !== 1) return [];
  const variant = matches2[0];
  const shape = evidence?.structures[variant.structureId];
  if (!shape?.length || stableHash(shape) !== variant.structureId || shape.filter((node) => node.path === "").length !== 1 || new Set(shape.map((node) => node.path)).size !== shape.length) return [];
  const byPath2 = /* @__PURE__ */ new Map();
  for (const [index, node] of shape.entries()) {
    const parentPath2 = node.path.includes(" / ") ? node.path.slice(0, node.path.lastIndexOf(" / ")) : "";
    if (node.path && !shape.some((part) => part.path === parentPath2)) return [];
    const names = evidence?.occurrences?.find((o) => o.componentKey === variant.componentKey && o.componentSetKey === variant.componentSetKey)?.namesByPath;
    const name = node.path ? names?.[node.path] || node.path.split(" / ").pop() || node.path : rootName;
    const entry = {
      id: `compiled:${variant.structureId}:${index}`,
      parentId: null,
      name,
      type: node.type,
      path: evidence?.occurrenceAddressVersion === 1 ? [rootName, node.path].filter(Boolean).join(" / ") : node.path || rootName,
      semanticRole: slug(name),
      visible: true,
      order: index,
      depth: node.path ? node.path.split(" / ").length : 0,
      childIds: [],
      properties: { name, type: node.type },
      unknownFacts: ["compact-structure-only"]
    };
    byPath2.set(node.path, entry);
  }
  for (const [path, node] of byPath2) {
    if (!path) continue;
    const parentPath2 = path.includes(" / ") ? path.slice(0, path.lastIndexOf(" / ")) : "";
    const parent3 = byPath2.get(parentPath2);
    if (!parent3) return [];
    node.parentId = parent3.id;
    parent3.childIds.push(node.id);
  }
  return [...byPath2.values()];
}
function targetsFromAnatomy(anatomy, family) {
  const used = /* @__PURE__ */ new Map();
  return anatomy.map((node) => {
    const base = node.semanticRole || slug(node.name);
    const count = (used.get(base) || 0) + 1;
    used.set(base, count);
    const semanticRole2 = count === 1 ? base : `${base}-${count}`;
    return {
      id: `target.${semanticRole2}`,
      semanticRole: semanticRole2,
      label: node.name,
      componentFamily: node.type === "INSTANCE" ? node.name : family,
      lineage: node.path.split("/").slice(0, -1).map((part) => slug(part.trim())),
      structuralFingerprint: stableHash({ type: node.type, path: node.path, order: node.order }).slice(0, 16),
      nameHint: node.name,
      pathHint: node.path,
      nodeIdHint: node.id,
      resolution: node.path.split(" / ").some((p) => p.startsWith("@catalog:")) ? "unknown" : "resolved"
    };
  });
}
function tokensFromCandidate(candidate) {
  const tokens = record13(record13(candidate?.figma).tokens);
  return uniqueSorted(Object.values(tokens).flatMap((value) => arrayValue(value).map((entry) => stringValue(entry))));
}
function newManual(identity, files, targets, sourceKind) {
  return {
    schemaVersion: MANUAL_SCHEMA_VERSION,
    documentType: "component-contract-manual",
    component: identity,
    semantics: {
      purpose: "",
      useWhen: [],
      doNotUseWhen: [],
      relatedComponentIds: [],
      keywords: []
    },
    representations: identity.componentKey ? [{
      id: `${identity.componentId}.figma.${identity.platform}`,
      kind: "figma",
      platform: identity.platform,
      status: "draft",
      locator: { componentKey: identity.componentKey }
    }] : [],
    semanticApi: [],
    documentation: [],
    examples: [],
    decisions: [],
    generation: { profiles: [], instructions: [] },
    source: {
      kind: sourceKind,
      importedFiles: files.map((file) => file.name).sort((left, right) => left.localeCompare(right)),
      sourceHash: stableHash(files.map((file) => ({ name: file.name, text: file.text }))),
      importedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    targets,
    controlPorts: [],
    rules: [],
    metadata: {
      ruleOwnershipVersion: 1,
      owners: {
        generated: "athena-cli",
        manual: "design-system-authors",
        runtime: "apollo-runtime"
      },
      revision: 1,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
function importWorkspace(files, preferredContractId) {
  if (!files.length) throw new Error("Choose at least one JSON file or ZIP package.");
  const allParsed = parseFiles(files);
  const dependencyEntries = allParsed.filter((p) => /(^|\/)dependencies\//.test(p.name));
  const parsed = allParsed.filter((p) => !dependencyEntries.includes(p));
  for (const entry of parsed) if (entry.data.documentType === "component-contract-manual" && entry.data.schemaVersion !== MANUAL_SCHEMA_VERSION && entry.data.schemaVersion !== LEGACY_MANUAL_SCHEMA_VERSION) {
    throw new Error(`Unsupported manual source schema: ${stringValue(entry.data.schemaVersion, "unknown")}.`);
  }
  const folder = packageFolder(files);
  const candidates = contractCandidates(parsed);
  const boundaryEntries = parsed.filter((entry) => (entry.data.schemaVersion === MANUAL_SCHEMA_VERSION || entry.data.schemaVersion === LEGACY_MANUAL_SCHEMA_VERSION) && record13(entry.data.metadata).publicRepresentationBoundaryVersion === 1);
  const representedComponentKeys = new Set(parsed.flatMap((entry) => arrayValue(entry.data.representations).filter((value) => record13(value).kind === "figma").flatMap((value) => {
    const locator = record13(record13(value).locator);
    return [stringValue(locator.componentKey), stringValue(locator.componentSetKey)].filter(Boolean);
  })));
  const boundaryKeys = new Set(boundaryEntries.flatMap((entry) => arrayValue(entry.data.representations).filter((value) => record13(value).kind === "figma" && record13(value).status !== "deprecated").flatMap((value) => {
    const locator = record13(record13(value).locator);
    return [stringValue(locator.componentKey), stringValue(locator.componentSetKey)].filter(Boolean);
  })));
  if (boundaryEntries.length && !boundaryKeys.size) {
    throw new Error("The explicit public Figma representation boundary is empty.");
  }
  const publicCandidates = boundaryEntries.length ? candidates.filter((c) => boundaryKeys.has(stringValue(c.componentKey))) : candidates;
  if (boundaryEntries.length && candidates.length && !publicCandidates.length) {
    throw new Error("No generated component matches the explicit public Figma representation boundary.");
  }
  if (preferredContractId && candidates.some((c) => stringValue(c.id) === preferredContractId) && !publicCandidates.some((c) => stringValue(c.id) === preferredContractId)) {
    throw new Error("This component is internal to the loaded contract, not a public Figma representation.");
  }
  const manualEntries = parsed.filter((entry) => entry.data.schemaVersion === MANUAL_SCHEMA_VERSION || entry.data.schemaVersion === LEGACY_MANUAL_SCHEMA_VERSION);
  const authoredCandidate = manualEntries.length === 1 ? publicCandidates.find((candidate2) => {
    const manualComponent = record13(manualEntries[0].data.component);
    const key2 = stringValue(manualComponent.componentKey);
    return stringValue(candidate2.id) === stringValue(manualComponent.contractId) || Boolean(key2 && stringValue(candidate2.componentKey) === key2);
  }) : void 0;
  const defaultCandidate = authoredCandidate || chooseContract(publicCandidates, folder);
  const componentChoices = choicesForContract(publicCandidates, defaultCandidate, representedComponentKeys);
  const candidate = chooseContract(publicCandidates, folder, preferredContractId || stringValue(authoredCandidate?.id));
  const identity = componentIdentity(parsed, candidate, folder);
  const manualEntry = candidate ? manualEntries.find((entry) => {
    const component = record13(entry.data.component);
    return stringValue(component.contractId) === identity.contractId || Boolean(identity.componentKey && stringValue(component.componentKey) === identity.componentKey);
  }) || (manualEntries.length === 1 && arrayValue(manualEntries[0].data.representations).some((entry) => {
    const representation = record13(entry);
    const locator = record13(representation.locator);
    return representation.kind === "figma" && Boolean(identity.componentKey && stringValue(locator.componentKey) === identity.componentKey);
  }) ? manualEntries[0] : void 0) : manualEntries[0];
  const athenaAnatomy = structureFromContract(candidate);
  const generatedTargets = targetsFromAnatomy(athenaAnatomy, identity.family);
  const compiledEntries = parsed.filter((entry) => entry.data.documentType === "component-contract");
  const compiledEntry = compiledEntries.find((entry) => manualEntry && record13(entry.data.package).componentId === record13(manualEntry.data.component).componentId || compiledContainsCandidate(entry.data, candidate));
  const warnings = [];
  let manual;
  if (manualEntry) {
    manual = normalizeManualSource(manualEntry.data);
    if (manualEntry.data.schemaVersion === LEGACY_MANUAL_SCHEMA_VERSION) {
      warnings.push("Manual source v1 migrated in memory to v2; export the package to persist the new schema.");
    }
  } else {
    const sourceKind = compiledEntry ? "component-contract-v2" : "athena-package";
    manual = newManual(identity, files, [], sourceKind);
    if (compiledEntry) {
      warnings.push("Compiled v2 imported as read-only evidence; compact manual rules cannot be reconstructed losslessly.");
    }
  }
  if (!identity.componentKey && !manual.component.componentKey) {
    warnings.push("No Figma componentKey found. Anatomy remains available, but live preview cannot be rendered.");
  }
  if (componentChoices.length > 1) {
    warnings.push(`Package contains ${componentChoices.length} Figma representations; selected ${candidate?.name || identity.family}.`);
  }
  const variantEvidence = (candidates.some((c) => c.packageAthena) ? extractVariantEvidence(candidates, manual.rules.some((r) => r.constraints.some((c) => c.type === "bindingConsistency"))) : void 0) || compiledEntry?.data.facts?.variantEvidence || extractVariantEvidence(candidates, manual.rules.some((r) => r.constraints.some((c) => c.type === "bindingConsistency")));
  const assetCatalogs = extractAssetCatalogs(parsed.map((p) => p.data));
  const compactAssets = parsed.filter((p) => p.data.schemaVersion === "apollo.asset-catalogs.v1").flatMap((p) => arrayValue(p.data.catalogs));
  if (variantEvidence) {
    const textStyles = extractTextStyleCatalogs(parsed);
    const savedStyles = compiledEntry?.data.facts?.variantEvidence?.textStyleCatalogs;
    if (textStyles.length || savedStyles?.length) variantEvidence.textStyleCatalogs = textStyles.length ? textStyles : savedStyles;
    const assets = assetCatalogs.length ? assetCatalogs : compactAssets.length ? compactAssets : compiledEntry?.data.facts?.variantEvidence?.assetCatalogs;
    if (assets?.length) variantEvidence.assetCatalogs = parseAssetCatalogs(assets);
  }
  const selectedKey = manual.component.componentKey || identity.componentKey;
  const compiledVariants = variantEvidence?.variants.filter((v) => v.componentKey === selectedKey || v.componentSetKey === selectedKey) || [];
  const initialVariantKey = compiledVariants[0]?.componentKey || selectedKey;
  const compactAnatomy = athenaAnatomy.length ? [] : structureFromVariantEvidence(variantEvidence, initialVariantKey, manual.component.family);
  const anatomy = athenaAnatomy.length ? athenaAnatomy : compactAnatomy;
  if (!anatomy.length) warnings.push("No structure signature found. Live Figma preview can repopulate the anatomy tree.");
  else if (compactAnatomy.length) warnings.push("Anatomy restored from compact compiled facts. Import Athena JSONs with this ZIP to recover full layer properties.");
  const hasAthenaVariants = arrayValue(record13(record13(candidate?.figma).variants).variantKeys).length > 0;
  return {
    manual,
    variantEvidence,
    dependencyContracts: dependencyEntries.filter((p) => p.data.documentType === "component-contract").map((p) => p.data).concat(dependencyEntries.length ? [] : (compiledEntry?.data.componentDependencies || []).flatMap((d) => d.contract ? [d.contract] : [])),
    activeContractId: candidate ? identity.contractId : manual.component.contractId,
    componentChoices,
    variants: hasAthenaVariants ? variantsFromContract(candidate, manual.component) : compiledVariants.length ? compiledVariants.map((v) => ({ id: v.componentKey, label: Object.entries(v.properties).map(([key2, value]) => `${key2}=${value}`).join(", ") || "Default", componentKey: v.componentKey, properties: v.properties })) : variantsFromContract(candidate, manual.component),
    hasVariantEvidence: hasAthenaVariants || compiledVariants.length > 0,
    anatomy,
    tokens: tokensFromCandidate(candidate),
    warnings,
    compiledInput: compiledEntry?.data,
    sourceFiles: files.map((file) => ({ name: file.name, text: file.text }))
  };
}
function createWorkspaceFromPreview(identity, anatomy) {
  const placeholder = [{ name: "figma-selection.json", text: JSON.stringify({ identity }) }];
  return {
    manual: newManual(identity, placeholder, [], "figma-selection"),
    activeContractId: identity.contractId,
    variants: [{ id: identity.componentKey || "selection", label: "Current", componentKey: identity.componentKey, properties: {} }],
    hasVariantEvidence: true,
    anatomy,
    tokens: [],
    warnings: []
  };
}

// ../Apollo/packages/component-contract-core/src/text-content-facts.ts
var record14 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
function assertNativeRuleFactPolicies(contract) {
  contract = sharedUsageContract(contract);
  const facts2 = new Set(contract.capabilities.facts);
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (typeof value.fact === "string") facts2.add(value.fact);
    for (const child of Object.values(value)) visit(child);
  };
  visit(contract.rules);
  for (const [prefix, version] of [
    ["textContentV1.", contract.runtimePolicy.textContentFactsVersion],
    ["nativeTargetPropertiesV1.", contract.runtimePolicy.nativeTargetPropertyFactsVersion]
  ]) {
    if (version !== void 0 && version !== 1 || [...facts2].some((f) => f.startsWith(prefix)) && version !== 1 || version === 1 && contract.package.sourceExportVersion !== (contract.runtimePolicy.declaredTargetConfigurationVersion === 2 ? "component-contract-editor@0.2.103" : contract.runtimePolicy.declaredTargetConfigurationVersion === 1 ? "component-contract-editor@0.2.99" : contract.runtimePolicy.declaredTargetIdentityVersion === 3 ? "component-contract-editor@0.2.95" : "component-contract-editor@0.2.94"))
      throw new Error("NATIVE_RULE_FACT_POLICY_UNSUPPORTED");
  }
}
function materializeTextContent(snapshot, contract) {
  if (contract.runtimePolicy.textContentFactsVersion !== 1) return;
  for (const node of snapshot.nodes) {
    delete node.textContentV1;
    const prior = node.unknownFacts || [];
    node.unknownFacts = prior.filter((p) => p !== "textContentV1" && !p.startsWith("textContentV1."));
    if (node.type !== "TEXT") continue;
    const text3 = record14(node.text), facts2 = {};
    const known2 = (fact2) => !prior.some((p) => p === fact2 || fact2.startsWith(p + "."));
    if (known2("text.characters") && typeof text3.characters === "string") facts2.characterCount = Array.from(text3.characters).length;
    const lh = record14(text3.lineHeight);
    const pixels = lh.unit === "PIXELS" ? lh.value : lh.unit === "PERCENT" && typeof text3.fontSize === "number" ? text3.fontSize * lh.value / 100 : void 0;
    const height = record14(node.bounds).height, count = height / pixels;
    if (["text.lineHeight", "text.fontSize", "bounds.height", "text.textAutoResize", "text.textTruncation", "text.paragraphSpacing", "text.maxHeight"].every(known2) && ["HEIGHT", "WIDTH_AND_HEIGHT"].includes(text3.textAutoResize) && text3.textTruncation === "DISABLED" && text3.paragraphSpacing === 0 && text3.maxHeight === null && typeof pixels === "number" && Number.isFinite(pixels) && pixels > 0 && typeof height === "number" && Number.isFinite(height) && height >= 0 && Math.abs(count - Math.round(count)) < 0.01) facts2.lineCount = Math.round(count);
    node.textContentV1 = facts2;
    for (const key2 of ["characterCount", "lineCount"]) if (facts2[key2] === void 0) node.unknownFacts.push(`textContentV1.${key2}`);
  }
}

// ../Apollo/packages/component-contract-core/src/dependency-usage.ts
var DEPENDENCY_USAGE_PREFIX = "editorDependencyUsageV1.";
var PRODUCER = "component-contract-editor@0.2.104";
var record15 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var clone3 = (v) => JSON.parse(JSON.stringify(v));
var unknown3 = (n, field) => (n.unknownFacts || []).some((p) => p === field || field.startsWith(p + "."));
var allowedMetrics = ["nonTextChanged", "characterCount", "lineCount"];
var facts = (manual) => manual.rules.flatMap((r) => r.constraints.flatMap((c) => c.fact?.startsWith(DEPENDENCY_USAGE_PREFIX) ? [c.fact] : []));
function dependencyUsageErrors(manual, contract) {
  const extension = manual.editorDependencyUsages, requested = facts(manual), issues = [];
  if (!extension && !requested.length) return issues;
  const fail2 = (message) => issues.push({ level: "error", code: "EDITOR_DEPENDENCY_USAGE", path: "/editorDependencyUsages", message });
  if (manual.metadata.declaredTargetIdentityVersion !== 3) fail2("Parent usage requires native declared target identity version 3.");
  if (!extension || extension.version !== 1 || Object.keys(extension).some((k) => !["version", "bindings"].includes(k)) || !Array.isArray(extension.bindings) || !extension.bindings.length) {
    fail2("Explicit dependency usage version 1 and bindings are required.");
    return issues;
  }
  const ids = /* @__PURE__ */ new Set();
  for (const u of extension.bindings) {
    if (!u || Object.keys(u).some((k) => !["id", "dependencyId", "bindingId", "childTargetId", "textProperty"].includes(k)) || !/^[a-z][a-z0-9-]*$/.test(u.id) || ids.has(u.id) || !u.textProperty || !u.childTargetId) {
      fail2("Usage needs unique safe ID and exact child target/text property.");
      continue;
    }
    ids.add(u.id);
    const dependency = manual.componentDependencies?.filter((d) => d.id === u.dependencyId), bindings = dependency?.[0]?.bindings.filter((b) => b.id === u.bindingId);
    if (dependency?.length !== 1 || bindings?.length !== 1 || bindings[0].kind === "direct-child") fail2("Usage must name one declared fixed-nested dependency binding.");
    if (contract) {
      const child = contract.componentDependencies?.find((d) => d.id === u.dependencyId)?.contract;
      const targets = child?.facts.targets.filter((t) => t.id === u.childTargetId && t.resolution === "resolved");
      const controls = child?.customizationPolicy.filter((p) => ["allowed", "constrained"].includes(p.permission)).flatMap((p) => p.controlPaths).filter((p) => p.kind === "host-property" && p.property === u.textProperty);
      if (targets?.length !== 1 || !targets[0].identityBindingsV1?.length || targets[0].identityBindingsV1.some((b) => b.nodeType !== "TEXT") || !controls?.length)
        fail2("Child must declare a native TEXT target and its allowed exact root TEXT control.");
    }
  }
  for (const r of manual.rules) for (const c of r.constraints.filter((c2) => c2.fact?.startsWith(DEPENDENCY_USAGE_PREFIX))) {
    const parts = c.fact.slice(DEPENDENCY_USAGE_PREFIX.length).split(".");
    const root2 = manual.targets.find((t) => t.id === r.targetId);
    if (parts.length !== 2 || !ids.has(parts[0]) || !allowedMetrics.includes(parts[1]) || root2?.semanticRole !== "root" || (r.targetScope || "self") !== "self" || (parts[1] === "nonTextChanged" ? c.type !== "propertyDomain" || c.values?.length !== 1 || c.values[0] !== false : c.type !== "layoutConstraint" || c.min !== 0 || !Number.isInteger(c.max) || c.max < 0)) fail2("Use root/self with a declared usage metric and typed boolean/range constraint.");
  }
  return issues;
}
function decorateDependencyUsages(manual, result) {
  const extension = manual.editorDependencyUsages;
  const issues = dependencyUsageErrors(manual, result.contract);
  if (!extension && !issues.length) return result;
  if (issues.length) return { ...result, issues: [...result.issues, ...issues], contract: { ...result.contract, status: "draft" } };
  const contract = result.contract;
  contract.editorDependencyUsages = { ...clone3(extension), baseProducer: contract.package.sourceExportVersion };
  contract.package.sourceExportVersion = PRODUCER;
  contract.runtimePolicy.textContentFactsVersion = 1;
  contract.capabilities.facts = [.../* @__PURE__ */ new Set([...contract.capabilities.facts, "textContentV1.characterCount"])].sort();
  return result;
}
function sharedUsageContract(contract) {
  const c = contract, extension = c.editorDependencyUsages;
  const usesFacts = contract.capabilities.facts.some((f) => f.startsWith(DEPENDENCY_USAGE_PREFIX));
  if (!extension && !usesFacts) return contract;
  const base = contract.runtimePolicy.declaredTargetConfigurationVersion === 2 ? "component-contract-editor@0.2.103" : contract.runtimePolicy.declaredTargetConfigurationVersion === 1 ? "component-contract-editor@0.2.99" : contract.runtimePolicy.declaredTargetIdentityVersion === 3 ? "component-contract-editor@0.2.95" : "component-contract-editor@0.2.94";
  if (!extension || extension.version !== 1 || extension.baseProducer !== base || contract.package.sourceExportVersion !== PRODUCER || !Array.isArray(extension.bindings) || !extension.bindings.length) throw new Error("EDITOR_DEPENDENCY_USAGE_UNSUPPORTED");
  const ids = new Set(extension.bindings.map((u) => u.id));
  if (ids.size !== extension.bindings.length || contract.capabilities.facts.filter((f) => f.startsWith(DEPENDENCY_USAGE_PREFIX)).some((f) => {
    const p = f.slice(DEPENDENCY_USAGE_PREFIX.length).split(".");
    return p.length !== 2 || !ids.has(p[0]) || !allowedMetrics.includes(p[1]);
  })) throw new Error("EDITOR_DEPENDENCY_USAGE_UNSUPPORTED");
  const declaration = { version: extension.version, bindings: extension.bindings };
  const source = {
    metadata: { declaredTargetIdentityVersion: contract.runtimePolicy.declaredTargetIdentityVersion },
    targets: contract.facts.targets,
    rules: [],
    componentDependencies: contract.componentDependencies,
    editorDependencyUsages: declaration
  };
  if (dependencyUsageErrors(source, contract).length) throw new Error("EDITOR_DEPENDENCY_USAGE_UNSUPPORTED");
  return { ...contract, package: { ...contract.package, sourceExportVersion: base } };
}
function canonicalConfiguration(node, textProperty, aliases) {
  const component = record15(node.component), values = { ...record15(component.properties) }, types2 = record15(component.propertyTypes);
  if (textProperty) delete values[textProperty];
  for (const [p, value] of Object.entries(values)) {
    if (unknown3(node, "component.properties." + p) || unknown3(node, "component.propertyTypes." + p) || !types2[p]) return;
    if (types2[p] === "INSTANCE_SWAP" && typeof value === "string" && aliases.has(value)) values[p] = { componentKey: aliases.get(value) };
  }
  return { types: types2, values };
}
function configurationChanged(actual, expected, textProperty, aliases) {
  const a = canonicalConfiguration(actual, textProperty, aliases), b = canonicalConfiguration(expected, textProperty, aliases);
  if (!a || !b) return;
  if (stableHash(a.types) !== stableHash(b.types)) return true;
  const av = record15(a.values), bv = record15(b.values), types2 = record15(a.types);
  if (stableHash(Object.keys(av).sort()) !== stableHash(Object.keys(bv).sort())) return true;
  let unresolved = false;
  for (const p of Object.keys(av)) if (stableHash(av[p]) !== stableHash(bv[p])) {
    if (types2[p] === "INSTANCE_SWAP" && (typeof av[p] === "string" || typeof bv[p] === "string")) unresolved = true;
    else return true;
  }
  return unresolved ? void 0 : false;
}
function nonTextChanged(snapshot, childNode, binding, textProperty, labelNodeId) {
  const paths = snapshotPaths(snapshot), prefix = paths?.get(String(childNode.id));
  if (!paths || !prefix || snapshot.instanceContentReferences?.schemaVersion !== "apollo.instance-content-references.v4") return { reason: "usage-owner-reference-unavailable" };
  const nodes = new Map(snapshot.nodes.map((n) => [String(n.id), n]));
  let owner = childNode;
  for (const _ of binding.childPath.split(" / ")) owner = nodes.get(String(owner?.parentId));
  if (!owner || !binding.ownerComponentSetKeys.includes(record15(record15(owner.component).identity).componentSetKey)) return { reason: "usage-owner-unproven" };
  const attempts = snapshot.instanceContentReferences.attempts.filter((a) => a.boundaryNodeId === owner.id);
  const result = snapshot.instanceContentResults?.filter((r) => r.boundaryNodeId === owner.id);
  const reference = attempts.length ? attempts.length === 1 && !attempts[0].failure && attempts[0].strategy === "pristine-host-variant-properties" && result?.length === 1 && result[0].lineageProven ? attempts[0].reference : void 0 : snapshot.instanceContentReferences.base;
  if (!reference || reference.source?.rootNodeId === snapshot.source?.rootNodeId) return { reason: "usage-owner-reference-unavailable" };
  const ref = captureVariantReference(reference, reference.source?.componentKey || "", reference.source?.componentSetKey || "");
  const comparison = compareInstanceBoundaries(snapshot, ref, true), refPaths = snapshotPaths(reference), refPrefix = correspondingPath(comparison, prefix);
  if (!comparison.complete || !refPaths || !refPrefix) return { reason: "usage-owner-correspondence-unavailable" };
  const expected = reference.nodes.filter((n) => refPaths.get(String(n.id)) === refPrefix);
  if (expected.length !== 1 || expected[0].type !== "INSTANCE") return { reason: "usage-owner-child-unproven" };
  const aliases = /* @__PURE__ */ new Map();
  let conflictingAlias = false;
  const alias = (id, key2) => {
    if (aliases.has(id) && aliases.get(id) !== key2) conflictingAlias = true;
    else aliases.set(id, key2);
  };
  for (const s of [snapshot, reference]) {
    for (const n of s.nodes) {
      const i = record15(record15(n.component).identity);
      if (i.mainComponentId && i.componentKey) alias(i.mainComponentId, i.componentKey);
    }
    for (const o of s.source?.instanceSourceIdentityCapture?.owners || []) if (o.status === "captured") alias(o.mainComponentId, o.componentKey);
  }
  if (conflictingAlias) return { reason: "usage-swap-alias-conflict" };
  const rootChanged = configurationChanged(childNode, expected[0], textProperty, aliases);
  if (rootChanged === void 0) return { reason: "usage-configuration-unknown" };
  if (rootChanged) return { value: true, reason: "usage-public-configuration-changed" };
  const boundaries = comparison.boundaries.filter((b) => withinBoundary(b.actualPath, prefix));
  if (boundaries.some((b) => b.reason === "instance-identity-unavailable")) return { reason: "usage-descendant-identity-unknown" };
  if (boundaries.length) return { value: true, reason: "usage-descendant-configuration-changed" };
  const actual = snapshot.nodes.filter((n) => withinBoundary(paths.get(String(n.id)), prefix));
  const pristine = reference.nodes.filter((n) => withinBoundary(refPaths.get(String(n.id)), refPrefix));
  if (actual.length !== pristine.length) return { reason: "usage-subtree-incomplete" };
  for (const n of actual) {
    const p = correspondingPath(comparison, paths.get(String(n.id))), other = pristine.filter((e) => refPaths.get(String(e.id)) === p);
    if (other.length !== 1 || other[0].type !== n.type) return { reason: "usage-subtree-correspondence-unavailable" };
    const changed = configurationChanged(n, other[0], n === childNode ? textProperty : void 0, aliases);
    if (changed === void 0) return { reason: "usage-configuration-unknown" };
    if (changed) return { value: true, reason: "usage-descendant-configuration-changed" };
    const project = (node, isLabel) => {
      if (["layout", "appearance", "visible", "variable", "component.properties", "component.propertyTypes", "text.fontName", "text.fontSize", "text.lineHeight", "text.letterSpacing"].some((k) => unknown3(node, k))) return;
      const text3 = { ...record15(node.text) }, variable = { ...record15(node.variable) }, component = record15(node.component), identity = record15(component.identity);
      if (isLabel) delete text3.characters;
      delete variable.modeCatalog;
      return {
        layout: node.layout,
        appearance: node.appearance,
        visible: node.visible,
        variable,
        text: text3,
        identity: { componentKey: identity.componentKey, componentSetKey: identity.componentSetKey },
        propertyReferenceBindings: component.propertyReferenceBindings
      };
    };
    const a = project(n, n.id === labelNodeId), b = project(other[0], n.id === labelNodeId);
    if (!a || !b) return { reason: "usage-non-text-facts-unknown" };
    if (stableHash(a) !== stableHash(b)) return { value: true, reason: "usage-internal-properties-changed" };
  }
  return { value: false, reason: "independent-owner-configuration-preserved" };
}
function materializeDependencyUsages(snapshot, contract, prepare) {
  const extension = contract.editorDependencyUsages;
  if (!extension) return;
  for (const node of snapshot.nodes) {
    delete node.editorDependencyUsageV1;
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "editorDependencyUsageV1" && !p.startsWith(DEPENDENCY_USAGE_PREFIX));
  }
  const root2 = snapshot.nodes.filter((n) => snapshot.selection.includes(String(n.id)));
  if (root2.length !== 1) return;
  const projection = {};
  root2[0].editorDependencyUsageV1 = projection;
  const missing = new Set(root2[0].unknownFacts || []);
  for (const u of extension.bindings) for (const metric of allowedMetrics) missing.add(`${DEPENDENCY_USAGE_PREFIX}${u.id}.${metric}`);
  for (const u of extension.bindings) {
    const fact2 = { reason: "usage-dependency-unavailable" };
    projection[u.id] = fact2;
    const ds = contract.componentDependencies?.filter((d2) => d2.id === u.dependencyId);
    const d = ds?.length === 1 ? ds[0] : void 0, bs = d?.bindings.filter((b2) => b2.id === u.bindingId);
    const b = bs?.length === 1 ? bs[0] : void 0;
    if (!d || !b || b.kind === "direct-child" || d.issue || dependencyPinIssue(d, d.contract)) continue;
    const resolved = resolveFixedNestedBinding(snapshot, d, b, false, contract);
    fact2.reason = resolved.reason;
    if (resolved.status === "inactive") {
      fact2.active = false;
      continue;
    }
    if (resolved.status !== "active" || !resolved.nodeId || !resolved.node || !resolved.identityValid) continue;
    const capture = validatedDependencyCapture(snapshot, resolved.nodeId, d.contract);
    if (!capture.snapshot || !capture.nodeMap) {
      fact2.reason = capture.reason;
      continue;
    }
    const child = prepare(capture.snapshot, d.contract, void 0, capture.ownerBaseline);
    materializeTextContent(child, { ...d.contract, runtimePolicy: { ...d.contract.runtimePolicy, textContentFactsVersion: 1 } });
    const ledger = record15(child).declaredTargetIdentitiesV1;
    const targets = ledger?.targets?.filter((t) => t.targetId === u.childTargetId && t.status === "resolved" && t.nodeType === "TEXT");
    const text3 = targets?.length === 1 ? child.nodes.find((n) => n.id === targets[0].nodeId) : void 0;
    if (!text3 || !capture.nodeMap[String(text3.id)]) {
      fact2.reason = "usage-child-text-target-unproven";
      continue;
    }
    const parentLabel = capture.nodeMap[String(text3.id)];
    const port = resolveComponentProperty(u.textProperty, record15(resolved.node.component), ["TEXT"]);
    if (!("name" in port) || record15(record15(text3.component).propertyReferenceBindings).characters !== port.name) {
      fact2.reason = "usage-child-text-port-unproven";
      continue;
    }
    fact2.active = true;
    fact2.nodeId = resolved.nodeId;
    fact2.labelNodeId = parentLabel;
    for (const metric of ["characterCount", "lineCount"]) if (typeof record15(text3.textContentV1)[metric] === "number") fact2[metric] = record15(text3.textContentV1)[metric];
    const configuration = nonTextChanged(snapshot, resolved.node, b, port.name, parentLabel);
    fact2.reason = configuration.reason;
    if (configuration.value !== void 0) fact2.nonTextChanged = configuration.value;
  }
  for (const u of extension.bindings) for (const metric of allowedMetrics) if (projection[u.id][metric] !== void 0) missing.delete(`${DEPENDENCY_USAGE_PREFIX}${u.id}.${metric}`);
  root2[0].unknownFacts = [...missing];
}

// ../Apollo/packages/component-contract-core/src/declared-target-identity.ts
var DECLARED_TARGET_IDENTITY_VERSION = 3;
var DECLARED_TARGET_IDENTITY_SCHEMA = "apollo.declared-target-identities.v1";
var record16 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var text2 = (v) => typeof v === "string" && v.length > 0 && v === v.trim();
var closed2 = (v, required, optional = []) => {
  const r = record16(v);
  return v === r && required.every((k) => Object.prototype.hasOwnProperty.call(r, k)) && Object.keys(r).every((k) => required.includes(k) || optional.includes(k));
};
var unknown4 = (n, fact2) => (n.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + "."));
var types = /* @__PURE__ */ new Set(["INSTANCE", "COMPONENT", "FRAME", "GROUP", "TEXT", "RECTANGLE", "ELLIPSE", "VECTOR", "BOOLEAN_OPERATION", "LINE", "POLYGON", "STAR", "SLOT", "SECTION"]);
function portableDeclaredTargetReferenceHash(reference) {
  const portable = JSON.parse(JSON.stringify(reference));
  for (const value of Object.values(record16(portable.nodeProperties))) {
    const properties = record16(value);
    if (properties.identity) delete properties.identity.mainComponentId;
    if (properties.sourceIdentity) delete properties.sourceIdentity.ownerMainComponentId;
  }
  return stableHash(portable);
}
function configurationDeclaredTargetReferenceHash(reference) {
  const portable = JSON.parse(JSON.stringify(reference));
  for (const value of Object.values(record16(portable.nodeProperties))) {
    const properties = record16(value);
    if (properties.identity) delete properties.identity.mainComponentId;
    if (properties.sourceIdentity) delete properties.sourceIdentity.ownerMainComponentId;
  }
  const root2 = record16(record16(portable.nodeProperties)[""]);
  const configurationProperties = [];
  for (const name of Array.isArray(root2.definedProperties) ? root2.definedProperties : []) {
    const type = record16(root2.propertyTypes)[name], value = record16(root2.properties)[name];
    if (record16(portable.propertyTypes)[name] !== type || record16(portable.properties)[name] !== value || !(type === "TEXT" && typeof value === "string" || type === "BOOLEAN" && typeof value === "boolean")) continue;
    delete root2.properties[name];
    delete portable.properties[name];
    configurationProperties.push({ name, type });
  }
  return stableHash({ schemaVersion: "apollo.declared-target-configuration-reference.v1", configurationProperties, reference: portable });
}
function publicSwapDeclaredTargetReferenceHash(reference, shape) {
  return stableHash({
    schemaVersion: "apollo.declared-target-configuration-reference.v2",
    referenceHash: configurationDeclaredTargetReferenceHash(projectPublicSwapReference(reference, shape))
  });
}
function contractConfigurationHash(reference, contract) {
  if (contract.runtimePolicy.declaredTargetConfigurationVersion === 2) return publicSwapDeclaredTargetReferenceHash(reference, { targets: contract.facts.targets, policies: contract.customizationPolicy, representations: contract.facts.representations });
  if (contract.runtimePolicy.declaredTargetConfigurationVersion === 1) return configurationDeclaredTargetReferenceHash(reference);
}
function configuredReferencePath(reference, binding, contract) {
  if (contract.runtimePolicy.declaredTargetConfigurationVersion === 2) {
    const slots = publicSwapSlots(reference, { targets: contract.facts.targets, policies: contract.customizationPolicy, representations: contract.facts.representations });
    const slot = slots.find((s) => s.bindingPath === binding.referencePath);
    if (slot) return slot.referencePath;
  }
  return binding.referencePath;
}
function declaredTargetIdentityErrors(shape) {
  const bindings = shape.targets.flatMap((t) => t.identityBindingsV1 === void 0 ? [] : [t.identityBindingsV1]);
  if (shape.version === void 0 && shape.configurationVersion === void 0 && !bindings.length) return [];
  const errors = [];
  if (shape.configurationVersion !== void 0 && (shape.configurationVersion !== 1 && shape.configurationVersion !== 2 || shape.version !== 3)) errors.push("declared target configuration requires version 1 or 2 and identity policy v3");
  if (typeof shape.version !== "number" || ![1, 2, 3].includes(shape.version)) errors.push("declared target bindings require explicit supported policy version 1, 2 or 3");
  if (!bindings.length) errors.push("declared target policy requires explicit bindings");
  const ids = /* @__PURE__ */ new Set(), roles = /* @__PURE__ */ new Set();
  for (const target of shape.targets) {
    if (!text2(target.id) || !text2(target.semanticRole) || ids.has(target.id) || roles.has(target.semanticRole)) errors.push("declared target IDs and roles must be unique");
    ids.add(target.id);
    roles.add(target.semanticRole);
    if (target.identityBindingsV1 === void 0) continue;
    if (!Array.isArray(target.identityBindingsV1) || !target.identityBindingsV1.length) {
      errors.push("target bindings must be a nonempty array");
      continue;
    }
    const keys = /* @__PURE__ */ new Set();
    for (const b of target.identityBindingsV1) {
      if (!closed2(b, ["representationId", "componentKey", "componentSetKey", "referenceHash", "referencePath", "nodeType"], [1, 2].includes(Number(shape.configurationVersion)) ? ["nativeSource", "portableReferenceHash", "configurationReferenceHash"] : shape.version === 2 || shape.version === 3 ? ["nativeSource", "portableReferenceHash"] : ["nativeSource"]) || !text2(b.representationId) || !text2(b.componentKey) || typeof b.componentSetKey !== "string" || !/^[a-f0-9]{64}$/.test(b.referenceHash) || b.portableReferenceHash !== void 0 && !/^[a-f0-9]{64}$/.test(b.portableReferenceHash) || typeof b.referencePath !== "string" || b.referencePath !== b.referencePath.trim() || !types.has(b.nodeType) || b.referencePath.split(" / ").some((p) => /^@(local|catalog):/.test(p)) || !shape.representations.some((r) => r.kind === "figma" && r.id === b.representationId && r.status !== "deprecated")) {
        errors.push("malformed typed declared target binding");
        continue;
      }
      if ([1, 2].includes(Number(shape.configurationVersion)) && (!/^[a-f0-9]{64}$/.test(b.configurationReferenceHash || "") || !b.portableReferenceHash)) errors.push("configuration binding requires exact portable and configuration SHA256 pins");
      const key2 = JSON.stringify([b.representationId, b.componentKey, b.componentSetKey]);
      if (keys.has(key2)) errors.push("duplicate selected-variant target binding");
      keys.add(key2);
      if (b.referencePath === "") {
        if (!isDeclaredRootTarget(target) || !["INSTANCE", "COMPONENT"].includes(b.nodeType) || b.nativeSource !== void 0) errors.push("root binding requires an explicit root target and native root type");
      } else if (!closed2(b.nativeSource, ["sourceNodeId", "ownerComponentKey", "ownerMainComponentId"]) || !Object.values(b.nativeSource).every(text2)) errors.push("descendant binding requires exact native source identity");
    }
  }
  return errors;
}
function assertDeclaredTargetContract(contract) {
  contract = sharedUsageContract(contract);
  const errors = declaredTargetIdentityErrors({
    version: contract.runtimePolicy.declaredTargetIdentityVersion,
    configurationVersion: contract.runtimePolicy.declaredTargetConfigurationVersion,
    targets: contract.facts.targets,
    representations: contract.facts.representations
  });
  if (contract.runtimePolicy.declaredTargetIdentityVersion !== void 0 && !contract.facts.variantEvidence) errors.push("independent variant anatomy is required");
  if ([1, 2, 3].includes(contract.runtimePolicy.declaredTargetIdentityVersion || 0)) {
    for (const target of contract.facts.targets) if (!contract.capabilities.facts.includes(`declaredTargetMembershipV1.${declaredTargetMembershipKey(target.id)}`)) errors.push("declared membership capability missing");
    const exporter = contract.runtimePolicy.nativeInstanceReplacementsVersion === 1 ? "component-contract-editor@0.2.108" : contract.runtimePolicy.declaredTargetConfigurationVersion === 2 ? "component-contract-editor@0.2.103" : contract.runtimePolicy.declaredTargetConfigurationVersion === 1 ? "component-contract-editor@0.2.99" : contract.runtimePolicy.declaredTargetIdentityVersion === 3 ? "component-contract-editor@0.2.95" : contract.runtimePolicy.textContentFactsVersion === 1 || contract.runtimePolicy.nativeTargetPropertyFactsVersion === 1 ? "component-contract-editor@0.2.94" : contract.runtimePolicy.declaredTargetIdentityVersion === 2 ? "component-contract-editor@0.2.93" : "component-contract-editor@0.2.92";
    if (contract.package.sourceExportVersion !== exporter) errors.push("declared target exporter compatibility stamp missing");
    if (contract.rules.some((rule) => {
      const inspect = (value) => Array.isArray(value) ? value.some(inspect) : value && typeof value === "object" ? value.actual?.fact === "semantic.role" && value.expected?.literal !== void 0 || Object.values(value).some(inspect) : false;
      return inspect(rule);
    })) errors.push("unbound diagnostic role selector in declared target IR");
  }
  if (contract.runtimePolicy.declaredTargetIdentityVersion === void 0 && contract.capabilities.facts.some((f) => f.startsWith("declaredTargetMembershipV1."))) errors.push("membership capability requires its policy");
  if (errors.length) throw Object.assign(new Error("DECLARED_TARGET_IDENTITY_UNSUPPORTED: " + errors.join("; ")), { code: "DECLARED_TARGET_IDENTITY_UNSUPPORTED" });
}
function rootedTopology(snapshot) {
  if (snapshot.selection.length !== 1 || snapshot.source?.truncated !== false || snapshot.source.captureTopology?.complete !== true) return;
  const byId = /* @__PURE__ */ new Map();
  for (const n of snapshot.nodes) {
    if (!text2(n.id) || byId.has(String(n.id)) || typeof n.type !== "string" || !types.has(n.type) || unknown4(n, "type") || !Array.isArray(n.childIds) || new Set(n.childIds).size !== n.childIds.length) return;
    byId.set(String(n.id), n);
  }
  const root2 = byId.get(snapshot.selection[0]);
  if (!root2 || root2.parentId !== null) return;
  for (const n of byId.values()) {
    if (unknown4(n, "parentId") || unknown4(n, "childIds")) return;
    if (n !== root2 && (!byId.has(String(n.parentId)) || !byId.get(String(n.parentId)).childIds.includes(n.id))) return;
    if (n.childIds.some((id) => !byId.has(id) || byId.get(id).parentId !== n.id)) return;
    const visited = /* @__PURE__ */ new Set();
    let current = n;
    while (current !== root2) {
      if (!current || visited.has(String(current.id))) return;
      visited.add(String(current.id));
      current = byId.get(String(current.parentId));
    }
  }
  return { root: root2, byId };
}
function effectiveVisibility(node, topology) {
  let n = node, hidden = false, uncertain2 = false;
  while (n) {
    if (unknown4(n, "visible") || typeof n.visible !== "boolean") uncertain2 = true;
    else if (n.visible === false) hidden = true;
    if (n === topology.root) return hidden ? false : uncertain2 ? void 0 : true;
    n = topology.byId.get(String(n.parentId));
  }
  return;
}
function sourceMatches(node, path, binding, snapshot, topology, portable) {
  const source = record16(record16(node.component).sourceIdentity), expected = binding.nativeSource;
  const reference = snapshot.variantReference;
  if (!expected || source.version !== 1 || snapshot.source?.instanceSourceIdentityVersion !== 1 || snapshot.source.occurrenceAddressVersion !== 1 || reference.occurrenceAddressVersion !== 1 || Object.entries(expected).some(([key2, value]) => (!portable || key2 !== "ownerMainComponentId") && source[key2] !== value || unknown4(node, `component.sourceIdentity.${key2}`)) || unknown4(node, "component.sourceIdentity.version")) return false;
  const independentlyCaptured = reference.nodeProperties[path]?.sourceIdentity;
  if (!independentlyCaptured || independentlyCaptured.version !== 1 || Object.entries(expected).some(([key2, value]) => (!portable || key2 !== "ownerMainComponentId") && independentlyCaptured[key2] !== value)) return false;
  let owner = topology.byId.get(String(node.parentId));
  while (owner && owner !== topology.root && owner.type !== "INSTANCE" && owner.type !== "COMPONENT") {
    if (owner.type === "SLOT") return false;
    owner = topology.byId.get(String(owner.parentId));
  }
  const identity = record16(record16(owner?.component).identity);
  if (!owner || unknown4(owner, "component.identity") || unknown4(owner, "component.identity.componentKey") || unknown4(owner, "component.identity.mainComponentId") || identity.componentKey !== expected.ownerComponentKey || !text2(identity.mainComponentId) || identity.mainComponentId !== source.ownerMainComponentId || !portable && identity.mainComponentId !== expected.ownerMainComponentId) return false;
  let parent3 = path.split(" / ").slice(0, -1).join(" / ");
  while (parent3 && reference.nodes.find((n) => n.path === parent3)?.type !== "INSTANCE") parent3 = parent3.split(" / ").slice(0, -1).join(" / ");
  const refOwner = reference.nodeProperties[parent3]?.identity;
  if (refOwner?.componentKey !== expected.ownerComponentKey || refOwner.mainComponentId !== independentlyCaptured.ownerMainComponentId || refOwner.mainComponentId !== identity.mainComponentId || !portable && refOwner.mainComponentId !== expected.ownerMainComponentId) return false;
  if (owner === topology.root) return parent3 === "";
  const ownerSource = reference.nodeProperties[parent3]?.sourceIdentity;
  if (!ownerSource || ownerSource.version !== 1 || !text2(ownerSource.sourceNodeId) || !text2(ownerSource.ownerComponentKey) || !text2(ownerSource.ownerMainComponentId)) return false;
  return sourceMatches(owner, parent3, { ...binding, nativeSource: {
    sourceNodeId: ownerSource.sourceNodeId,
    ownerComponentKey: ownerSource.ownerComponentKey,
    ownerMainComponentId: ownerSource.ownerMainComponentId
  } }, snapshot, topology, portable);
}
function materializeNativeTargetProperties(snapshot, contract) {
  if (contract.runtimePolicy.nativeTargetPropertyFactsVersion !== 1) return;
  for (const node of snapshot.nodes) delete node.nativeTargetPropertiesV1;
  const topology = rootedTopology(snapshot), ref = snapshot.variantReference, paths = snapshotPaths(snapshot);
  if (!topology || !paths || !ref?.complete) return;
  const root2 = topology.root, identity = record16(record16(root2.component).identity);
  const reps = contract.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated" && r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
  if (reps.length !== 1 || unknown4(root2, "component.identity") || identity.componentKey !== ref.componentKey || identity.componentSetKey !== ref.componentSetKey || identity.mainComponentId !== ref.nodeProperties?.[""]?.identity?.mainComponentId || snapshot.source?.componentKey !== ref.componentKey || snapshot.source?.componentSetKey !== ref.componentSetKey) return;
  const comparison = compareInstanceBoundaries(snapshot, ref), facts2 = {}, proven = /* @__PURE__ */ new Map();
  if (!comparison.complete) return;
  for (const target of contract.facts.targets) {
    if (target.resolution !== "resolved") continue;
    const bindings = target.identityBindingsV1?.filter((b2) => b2.representationId === reps[0].id && b2.componentKey === ref.componentKey && b2.componentSetKey === ref.componentSetKey) || [];
    if (bindings.length !== 1) continue;
    const b = bindings[0], portable = [2, 3].includes(contract.runtimePolicy.declaredTargetIdentityVersion || 0) && b.portableReferenceHash !== void 0;
    const configurationHash = contractConfigurationHash(ref, contract), referencePath = configuredReferencePath(ref, b, contract);
    if (configurationHash ? b.configurationReferenceHash !== configurationHash : portable ? b.portableReferenceHash !== portableDeclaredTargetReferenceHash(ref) : b.referenceHash !== stableHash(ref)) continue;
    const candidates = snapshot.nodes.filter((n) => referencePath === "" ? n === root2 : sourceMatches(n, referencePath, b, snapshot, topology, portable));
    if (candidates.length !== 1 || candidates[0].type !== b.nodeType) continue;
    const node = candidates[0], path = paths.get(String(node.id));
    if (path === void 0 || comparison.referencePaths?.[path] !== referencePath) continue;
    const key2 = declaredTargetMembershipKey(target.id), component = record16(node.component), props = {};
    const original = ref.nodeProperties[referencePath];
    for (const [name, value] of Object.entries(record16(component.properties))) {
      const type = record16(component.propertyTypes)[name];
      if (original?.propertyTypes[name] === type && !unknown4(node, `component.properties.${name}`) && !unknown4(node, `component.propertyTypes.${name}`) && (type === "VARIANT" && typeof value === "string" || type === "BOOLEAN" && typeof value === "boolean")) props[name] = value;
    }
    facts2[key2] = { properties: props };
    if (!unknown4(node, "component.identity.componentSetKey")) facts2[key2].componentSetKey = record16(component.identity).componentSetKey;
    proven.set(key2, path);
  }
  for (const fact2 of contract.capabilities.facts.filter((f) => f.startsWith("nativeTargetPropertiesV1.swapCountExcept_"))) {
    const key2 = fact2.slice("nativeTargetPropertiesV1.swapCountExcept_".length), except = proven.get(key2);
    if (except === void 0) continue;
    let count = 0, complete = true;
    const seen = /* @__PURE__ */ new Set();
    const visit = (reference) => {
      const cmp = compareInstanceBoundaries(snapshot, reference);
      if (!cmp.complete) {
        complete = false;
        return;
      }
      for (const boundary of cmp.boundaries) {
        if (withinBoundary(boundary.actualPath, except) || seen.has(boundary.nodeId)) continue;
        seen.add(boundary.nodeId);
        if (boundary.reason === "component-variant-changed") {
          const result = snapshot.instanceContentResults?.find((r) => r.boundaryNodeId === boundary.nodeId);
          const attempts = snapshot.instanceContentReferences?.attempts.filter((a) => a.boundaryNodeId === boundary.nodeId) || [];
          if (!result?.lineageProven || attempts.length !== 1 || attempts[0].failure || !attempts[0].reference) {
            complete = false;
            continue;
          }
          const host = attempts[0].reference;
          visit(captureVariantReference(host, host.source?.componentKey || "", host.source?.componentSetKey || ""));
        } else if (boundary.reason === "instance-identity-unavailable") complete = false;
        else count++;
      }
    };
    visit(ref);
    if (complete || count > 0) facts2["swapCountExcept_" + key2] = count;
  }
  root2.nativeTargetPropertiesV1 = facts2;
}
function materializeDeclaredTargetIdentities(snapshot, contract) {
  if (![1, 2, 3].includes(contract.runtimePolicy.declaredTargetIdentityVersion || 0)) return;
  const topology = rootedTopology(snapshot), ref = snapshot.variantReference;
  const ledger = { schemaVersion: DECLARED_TARGET_IDENTITY_SCHEMA, manualSourceHash: contract.package.manualSourceHash, targets: [] };
  const reps = ref ? contract.facts.representations.filter((r) => r.status !== "deprecated" && r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey)) : [];
  const identity = record16(record16(topology?.root.component).identity);
  const identityKnown = !!(topology && ref?.complete && !unknown4(topology.root, "component.identity") && snapshot.source?.componentKey === ref.componentKey && (snapshot.source.componentSetKey || "") === ref.componentSetKey && identity.componentKey === ref.componentKey && (identity.componentSetKey || "") === ref.componentSetKey && identity.mainComponentId === ref.nodeProperties?.[""]?.identity?.mainComponentId && reps.length === 1);
  const paths = topology && snapshotPaths(snapshot), comparison = identityKnown ? compareInstanceBoundaries(snapshot, ref) : void 0;
  const availability = identityKnown ? variantAvailability(snapshot, contract) : void 0;
  const refHash = ref ? stableHash(ref) : void 0;
  ledger.referenceHash = refHash;
  const portableHash = ref && [2, 3].includes(contract.runtimePolicy.declaredTargetIdentityVersion || 0) ? portableDeclaredTargetReferenceHash(ref) : void 0;
  if (portableHash) ledger.portableReferenceHash = portableHash;
  const configurationHash = ref ? contractConfigurationHash(ref, contract) : void 0;
  if (configurationHash) ledger.configurationReferenceHash = configurationHash;
  let independent;
  const configuredEvidence = () => {
    if (!independent && snapshot.instanceContentReferences?.schemaVersion === "apollo.instance-content-references.v4") {
      independent = JSON.parse(JSON.stringify(snapshot));
      delete independent.instanceContentResults;
      materializeInstanceContentReferences(independent);
    }
    return independent;
  };
  for (const target of contract.facts.targets) {
    const fact2 = { targetId: target.id, semanticRole: target.semanticRole, status: "unknown", reason: "source-or-reference-incomplete" };
    ledger.targets.push(fact2);
    if (!identityKnown || !paths) continue;
    if (target.resolution !== "resolved") {
      fact2.reason = "authoring-target-unresolved";
      continue;
    }
    const bindings = target.identityBindingsV1?.filter((b2) => b2.representationId === reps[0].id && b2.componentKey === ref.componentKey && b2.componentSetKey === ref.componentSetKey) || [];
    if (bindings.length !== 1) {
      fact2.status = bindings.length > 1 ? "ambiguous" : "unknown";
      fact2.reason = "selected-binding-unavailable";
      continue;
    }
    const b = bindings[0], referencePath = configuredReferencePath(ref, bindings[0], contract);
    const portable = [2, 3].includes(contract.runtimePolicy.declaredTargetIdentityVersion || 0) && b.portableReferenceHash !== void 0;
    if (configurationHash ? b.configurationReferenceHash !== configurationHash : portable ? b.portableReferenceHash !== portableHash : b.referenceHash !== refHash) {
      fact2.reason = "reference-pin-stale";
      continue;
    }
    const referenceNodes = ref.nodes.filter((n) => n.path === referencePath && n.type === (referencePath === "" ? "ROOT" : b.nodeType));
    if (referenceNodes.length !== 1 || contract.runtimePolicy.declaredTargetIdentityVersion !== 3 && comparison?.boundaries.some((boundary) => withinBoundary(referencePath, boundary.referencePath))) {
      fact2.reason = "independent-correspondence-unavailable";
      continue;
    }
    let candidates = snapshot.nodes.filter((n) => referencePath === "" ? n === topology.root && n.type === b.nodeType : sourceMatches(n, referencePath, b, snapshot, topology, portable));
    let alternative = false;
    if (!candidates.length && contract.runtimePolicy.declaredTargetIdentityVersion === 3 && comparison?.complete && availability?.status !== "unknown") {
      const proof = configuredEvidence();
      if (proof) candidates = declaredVariantAlternatives(proof, contract, target, b, referencePath, comparison, portable);
      alternative = candidates.length > 0;
    }
    if (candidates.length !== 1) {
      fact2.status = candidates.length > 1 ? "ambiguous" : "unknown";
      fact2.reason = "native-cardinality-unresolved";
      continue;
    }
    if (!comparison?.complete || availability?.status === "unknown") {
      fact2.reason = "independent-correspondence-unavailable";
      continue;
    }
    const node = candidates[0], actualPath = paths.get(String(node.id));
    const boundaries = comparison.boundaries.filter((boundary) => withinBoundary(referencePath, boundary.referencePath) || actualPath !== void 0 && withinBoundary(actualPath, boundary.actualPath));
    const configured = contract.runtimePolicy.declaredTargetIdentityVersion === 3 && boundaries.length === 1 && verifiedConfiguredTarget(configuredEvidence(), node, referencePath, actualPath, boundaries[0], contract);
    if (boundaries.length && !configured && !alternative) {
      fact2.reason = "independent-correspondence-unavailable";
      continue;
    }
    if (node.type !== b.nodeType || actualPath === void 0 || !alternative && comparison.referencePaths?.[actualPath] !== referencePath) {
      fact2.reason = "typed-correspondence-unavailable";
      continue;
    }
    if (configured && boundaries[0].reason === "instance-swap") materializeConfiguredSwapProperties(node, configuredEvidence(), contract);
    Object.assign(fact2, { status: "resolved", reason: alternative ? "exact-independent-declared-variant-alternative" : "exact-independent-native-identity", nodeId: String(node.id), nodeType: node.type, present: true, referencePath });
    const visible2 = effectiveVisibility(node, topology);
    if (visible2 !== void 0) fact2.effectiveVisible = visible2;
  }
  for (const fact2 of ledger.targets) if (fact2.nodeId) {
    const claims = ledger.targets.filter((t) => t.nodeId === fact2.nodeId);
    const rootAliases = claims.every((t) => isDeclaredRootTarget(contract.facts.targets.find((x) => x.id === t.targetId))) && contract.runtimePolicy.rootTargetAliasesVersion === 1 && fact2.nodeId === topology?.root.id;
    if (claims.length > 1 && !rootAliases) {
      fact2.status = "ambiguous";
      fact2.reason = "declared-target-collision";
      delete fact2.present;
      delete fact2.effectiveVisible;
    }
  }
  snapshot.declaredTargetIdentitiesV1 = ledger;
  for (const node of snapshot.nodes) {
    const capturedRole = record16(node.semantic).role;
    node.targetDiagnosticsV1 = { capturedRole: Object.prototype.hasOwnProperty.call(record16(node.targetDiagnosticsV1), "capturedRole") ? record16(node.targetDiagnosticsV1).capturedRole : capturedRole };
    node.semantic = Object.assign({}, record16(node.semantic), { role: "" });
    const membership = {}, relations = {}, targets = {}, availabilityFacts = {};
    const missing = new Set((node.unknownFacts || []).filter((p) => !p.startsWith("declaredTargetMembershipV1.") && !p.startsWith("semanticTargets.") && !p.startsWith("variantAvailability.targets.") && p !== "visibility.effective" && p !== "semantic.role"));
    for (const fact2 of ledger.targets) {
      const key2 = declaredTargetMembershipKey(fact2.targetId);
      if (fact2.status === "resolved") {
        membership[key2] = fact2.nodeId === node.id;
        targets[fact2.semanticRole] = { resolved: true, present: true };
        availabilityFacts[fact2.semanticRole] = { present: true };
        relations[fact2.semanticRole] = fact2.nodeId;
        if (fact2.effectiveVisible !== void 0) targets[fact2.semanticRole].visibilityKnown = true;
        else missing.add(`semanticTargets.${fact2.semanticRole}.visibilityKnown`);
        if (fact2.nodeId === node.id && !record16(node.semantic).role) record16(node.semantic).role = fact2.semanticRole;
      } else {
        missing.add(`declaredTargetMembershipV1.${key2}`);
        missing.add(`semanticTargets.${fact2.semanticRole}`);
        missing.add(`variantAvailability.targets.${fact2.semanticRole}.present`);
      }
    }
    const visible2 = topology ? effectiveVisibility(node, topology) : void 0;
    node.visibility = visible2 === void 0 ? {} : { effective: visible2 };
    if (visible2 === void 0) missing.add("visibility.effective");
    node.declaredTargetMembershipV1 = membership;
    node.relations = relations;
    node.semanticTargets = targets;
    node.variantAvailability = Object.assign({}, record16(node.variantAvailability), { targets: availabilityFacts });
    node.unknownFacts = [...missing];
  }
}
function materializeConfiguredSwapProperties(node, proof, contract) {
  const proven = proof.nodes.find((n) => n.id === node.id), provenance = record16(proven?.baselineProvenance);
  const attempts = proof.instanceContentReferences?.attempts.filter((a) => a.boundaryNodeId === node.id) || [], reference = attempts.length === 1 ? attempts[0].reference : void 0;
  const paths = reference && snapshotPaths(reference), refNodes = reference?.nodes.filter((n) => paths?.get(String(n.id)) === provenance.referencePath) || [];
  if (refNodes.length !== 1) return;
  const refNode = refNodes[0], expected = record16(refNode.component), actual = record16(node.component);
  const available = record16(record16(node.variantAvailability).componentProperties);
  for (const fact2 of contract.capabilities.facts.filter((f) => f.startsWith("component.properties."))) {
    const name = fact2.slice("component.properties.".length), a = resolveComponentProperty(name, actual), b = resolveComponentProperty(name, expected);
    if (!("name" in a) || !("name" in b) || a.name !== b.name || record16(actual.propertyTypes)[a.name] !== "VARIANT" || record16(expected.propertyTypes)[b.name] !== "VARIANT" || typeof record16(actual.properties)[a.name] !== "string" || record16(actual.properties)[a.name] !== record16(expected.properties)[b.name] || unknown4(refNode, "component.properties." + b.name) || unknown4(refNode, "component.propertyTypes." + b.name) || unknown4(node, "component.properties." + a.name) || unknown4(node, "component.propertyTypes." + a.name)) continue;
    const key2 = propertyAvailabilityKey(name);
    available[key2] = true;
    node.unknownFacts = (node.unknownFacts || []).filter((f) => f !== "variantAvailability.componentProperties." + key2);
  }
  node.variantAvailability = Object.assign({}, record16(node.variantAvailability), { componentProperties: available });
}
function declaredVariantAlternatives(snapshot, contract, target, binding, referencePath, comparison, portable) {
  const boundaries = comparison.boundaries.filter((b) => b.reason === "component-variant-changed" && referencePath !== b.referencePath && withinBoundary(referencePath, b.referencePath));
  if (boundaries.length !== 1) return [];
  const boundary = boundaries[0], results = snapshot.instanceContentResults?.filter((r) => r.boundaryNodeId === boundary.nodeId) || [];
  const attempts = snapshot.instanceContentReferences?.attempts.filter((a) => a.boundaryNodeId === boundary.nodeId) || [];
  if (results.length !== 1 || !results[0].lineageProven || !["matched", "partial"].includes(results[0].status) || attempts.length !== 1 || attempts[0].failure || attempts[0].strategy !== "pristine-host-variant-properties" || !attempts[0].reference) return [];
  const reference = attempts[0].reference, ref = captureVariantReference(reference, reference.source?.componentKey || "", reference.source?.componentSetKey || ""), change = compareInstanceBoundaries(reference, snapshot.variantReference, true), selected = change.boundaries.filter((b) => b.referencePath === boundary.referencePath && b.actualComponentKey === boundary.actualComponentKey && b.componentSetKey === boundary.componentSetKey);
  const topology = rootedTopology(snapshot), paths = snapshotPaths(snapshot);
  if (!topology || !paths || !ref.complete || !change.complete || selected.length !== 1) return [];
  const virtual = Object.assign({}, snapshot, { variantReference: ref }), matches2 = /* @__PURE__ */ new Map();
  const alternatives = target.identityBindingsV1?.filter((a) => a.representationId === binding.representationId && a.componentSetKey === binding.componentSetKey && a.nodeType === binding.nodeType && a.nativeSource?.ownerComponentKey === boundary.actualComponentKey && contract.facts.variantEvidence?.variants.some((v) => v.componentKey === a.componentKey && v.componentSetKey === a.componentSetKey)) || [];
  for (const alternative of alternatives) for (const candidate of ref.nodes) {
    if (candidate.type !== alternative.nodeType || !withinBoundary(candidate.path, selected[0].actualPath)) continue;
    const source = ref.nodeProperties[candidate.path]?.sourceIdentity, expected = alternative.nativeSource;
    if (!source || source.version !== 1 || Object.entries(expected).some(([k, v]) => (!portable || k !== "ownerMainComponentId") && source[k] !== v)) continue;
    for (const node of snapshot.nodes) {
      const actualPath = paths.get(String(node.id)), proof = record16(node.baselineProvenance);
      if (node.type !== alternative.nodeType || actualPath === void 0 || !withinBoundary(actualPath, boundary.actualPath) || !results[0].matchedNodeIds.includes(String(node.id)) || proof.status !== "matched" || proof.kind !== "independent-host-variant" || proof.boundaryNodeId !== boundary.nodeId || proof.componentKey !== boundary.actualComponentKey || proof.referencePath !== candidate.path) continue;
      let owner = topology.byId.get(String(node.parentId));
      while (owner && owner !== topology.root && !["INSTANCE", "COMPONENT", "SLOT"].includes(owner.type)) owner = topology.byId.get(String(owner.parentId));
      if (owner?.id !== boundary.nodeId || !sourceMatches(node, candidate.path, alternative, virtual, topology, portable)) continue;
      matches2.set(String(node.id), node);
    }
  }
  return [...matches2.values()];
}
function verifiedConfiguredTarget(snapshot, node, referencePath, actualPath, boundary, contract) {
  if (!snapshot) return false;
  node = snapshot.nodes.find((n) => n.id === node.id);
  const swap = boundary.reason === "instance-swap" && contract.runtimePolicy.declaredTargetConfigurationVersion === 2 && publicSwapSlots(snapshot.variantReference, { targets: contract.facts.targets, policies: contract.customizationPolicy, representations: contract.facts.representations }).some((slot) => slot.referencePath === referencePath && slot.property === boundary.property && boundary.ownerPath === "" && record16(node.component).propertyReferenceBindings?.mainComponent === slot.property && record16(record16(snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)))?.component).propertyTypes)[slot.property] === "INSTANCE_SWAP" && record16(record16(snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)))?.component).properties)[slot.property] === record16(record16(node.component).identity).mainComponentId);
  if (snapshot.instanceContentReferences?.schemaVersion !== "apollo.instance-content-references.v4" || !swap && boundary.reason !== "component-variant-changed" || boundary.nodeId !== node.id || boundary.referencePath !== referencePath || boundary.actualPath !== actualPath || node.type !== "INSTANCE") return false;
  const results = snapshot.instanceContentResults?.filter((r) => r.boundaryNodeId === node.id) || [];
  const identity = record16(record16(node.component).identity), provenance = record16(node.baselineProvenance);
  return results.length === 1 && results[0].lineageProven === true && results[0].matchedNodeIds.includes(String(node.id)) && ["matched", "partial"].includes(results[0].status) && provenance.status === "matched" && provenance.kind === (swap ? "independent-host-swap" : "independent-host-variant") && provenance.boundaryNodeId === node.id && provenance.componentKey === boundary.actualComponentKey && (swap || provenance.componentSetKey === boundary.componentSetKey) && !unknown4(node, "component.identity") && !unknown4(node, "component.identity.componentKey") && !unknown4(node, "component.identity.componentSetKey") && identity.componentKey === boundary.actualComponentKey && (swap || identity.componentSetKey === boundary.componentSetKey);
}
function bindDeclaredTargetRuleSelectors(contract) {
  const byRole = new Map(contract.facts.targets.map((t) => [t.semanticRole, t]));
  const membership = (role) => ({ predicate: "equals", actual: { fact: `declaredTargetMembershipV1.${declaredTargetMembershipKey(byRole.get(role).id)}` }, expected: { literal: true }, missingPolicy: "unknown" });
  function visit(value) {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== "object") return value;
    const fact2 = value.actual?.fact;
    if (fact2 === "semantic.role" && value.expected?.literal !== void 0) {
      const roles = value.predicate === "one-of" ? value.expected.literal : value.predicate === "equals" ? [value.expected.literal] : [];
      if (Array.isArray(roles) && roles.length && roles.every((role) => byRole.has(role))) return roles.length === 1 ? membership(roles[0]) : { predicate: "any", args: roles.map(membership) };
    }
    if (typeof fact2 === "string" && fact2.startsWith("rootTargetAliasesV1.") && value.predicate === "equals" && value.expected?.literal === true && byRole.has(fact2.slice("rootTargetAliasesV1.".length))) return membership(fact2.slice("rootTargetAliasesV1.".length));
    return Object.fromEntries(Object.entries(value).map(([key2, v]) => [key2, visit(v)]));
  }
  contract.rules = contract.rules.map((rule) => visit(rule));
  const facts2 = contract.facts.targets.map((t) => `declaredTargetMembershipV1.${declaredTargetMembershipKey(t.id)}`);
  contract.capabilities.facts = [...new Set(contract.capabilities.facts.concat(facts2))].sort();
}

// ../Apollo/packages/component-contract-core/src/configured-native-property.ts
var CONFIGURED_NATIVE_PROPERTY_POLICY = "configured-native@1";
var PREFIX = "configuredNativePropertiesV1.";
var record17 = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
var owns = (value, key2) => Object.prototype.hasOwnProperty.call(value, key2);
var nameFor = (fact2) => typeof fact2 === "string" && /^component\.properties\.[^.]+$/.test(fact2) ? fact2.slice("component.properties.".length) : void 0;
var uncertain = (node, fact2) => {
  const paths = node.unknownFacts === void 0 ? [] : node.unknownFacts;
  return !Array.isArray(paths) || paths.some((p) => typeof p !== "string" || p === fact2 || fact2.startsWith(p + ".") || p.startsWith(fact2 + "."));
};
function configuredPropertyPolicyError(manual, rule) {
  if (rule.propertyConformance === void 0) return;
  if (rule.propertyConformance !== CONFIGURED_NATIVE_PROPERTY_POLICY) return "Unsupported configured property policy.";
  const targets = manual.targets.filter((t) => t.id === rule.targetId);
  if (targets.length !== 1 || targets[0].resolution !== "resolved" || !isDeclaredRootTarget(targets[0]) || (rule.targetScope || "self") !== "self" || rule.capability !== "component.configuration" || rule.capabilitySet || rule.permission !== "constrained" || rule.boundaryPolicy || rule.targetApplicability || rule.propertyApplicability)
    return "Configured native v1 requires a constrained root/self component.configuration domain rule without visual policies.";
  if (rule.applicability.conditionSubject === "component-root" || rule.applicability.activeDependency || rule.applicability.validationMode || Object.keys(rule.applicability.context || {}).length || Object.keys(rule.applicability.contextDomains || {}).length)
    return "Configured native v1 supports target native variant conditions, not scenario/dependency/validation-mode conditions.";
  if (!rule.constraints.length || rule.constraints.some((c) => c.type !== "propertyDomain" || !nameFor(c.fact) || !Array.isArray(c.values) || !c.values.length || c.values.some((v) => !["boolean", "string"].includes(typeof v)) || new Set(c.values.map((v) => typeof v)).size !== 1 || c.values.some((v) => typeof v === "string" && !v.trim()) || Object.keys(c).some((k) => !["type", "fact", "values"].includes(k))))
    return "Configured native v1 accepts exact native BOOLEAN/VARIANT propertyDomain facts with one typed value domain.";
}
function configuredNativeFact(fact2, nativeType) {
  const name = nameFor(fact2);
  if (!name) throw new Error("CONFIGURED_NATIVE_PROPERTY_FACT_UNSUPPORTED");
  return PREFIX + (nativeType === "BOOLEAN" ? "booleanValues." : "variantValues.") + propertyAvailabilityKey(name);
}
function configuredNativeExpression(value, nativeType = "VARIANT") {
  if (Array.isArray(value)) return value.map((entry) => configuredNativeExpression(entry, nativeType));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key2, entry]) => [
    key2,
    key2 === "fact" && nameFor(entry) ? configuredNativeFact(entry, nativeType) : configuredNativeExpression(entry, nativeType)
  ]));
}
function materializeConfiguredNativeProperties(source, prepared, contract) {
  for (const node of prepared.nodes) {
    delete node.configuredNativePropertiesV1;
    if (contract.runtimePolicy.configuredNativePropertyConformanceVersion === 1 && Array.isArray(node.unknownFacts))
      node.unknownFacts = node.unknownFacts.filter((p) => typeof p !== "string" || !p.startsWith("configuredNativePropertiesV1"));
  }
  if (contract.runtimePolicy.configuredNativePropertyConformanceVersion !== 1) return;
  if (source.selection.length !== 1 || new Set(source.nodes.map((n) => n.id)).size !== source.nodes.length) return;
  const roots = source.nodes.filter((n) => n.id === source.selection[0]);
  if (roots.length !== 1) return;
  const root2 = roots[0], output = prepared.nodes.find((n) => n.id === root2.id), ref = source.variantReference;
  const identity = record17(record17(root2.component).identity), expected = ref?.nodeProperties?.[""]?.identity;
  if (!output || root2.type !== "INSTANCE" || root2.visible !== true || source.source?.truncated !== false || source.source.instanceIdentityVersion !== 1 || source.source.captureTopology?.complete !== true || !ref?.complete || !expected || typeof identity.mainComponentId !== "string" || !identity.mainComponentId || expected.componentKey !== ref.componentKey || (expected.componentSetKey || "") !== ref.componentSetKey || identity.componentKey !== expected.componentKey || identity.mainComponentId !== expected.mainComponentId || (identity.componentSetKey || "") !== (expected.componentSetKey || "") || uncertain(root2, "component.identity") || uncertain(root2, "visible")) return;
  const availability = variantAvailability(source, contract);
  if (availability.status === "unknown") return;
  const targetIds = contract.customizationPolicy.filter((p) => p.propertyConformance === CONFIGURED_NATIVE_PROPERTY_POLICY).map((p) => p.targetId);
  if (!targetIds.length || targetIds.some((id) => {
    const targets = contract.facts.targets.filter((t) => t.id === id), target = targets[0];
    const proof = target && availability.targets[target.semanticRole];
    return targets.length !== 1 || target.resolution !== "resolved" || !isDeclaredRootTarget(target) || proof?.state !== "present" || proof.path !== "";
  })) return;
  const booleanValues = {}, variantValues = {};
  const component = record17(root2.component), reference = ref.nodeProperties[""];
  const referenceProperties = record17(reference.properties), referenceTypes = record17(reference.propertyTypes);
  for (const [name, value] of Object.entries(record17(component.properties))) {
    const fact2 = "component.properties." + name, type = record17(component.propertyTypes)[name];
    if (!nameFor(fact2) || uncertain(root2, fact2) || uncertain(root2, "component.propertyTypes." + name) || !owns(referenceProperties, name) || referenceTypes[name] !== type) continue;
    const expectedValue = referenceProperties[name];
    if (type === "BOOLEAN" && typeof value === "boolean" && typeof expectedValue === "boolean")
      booleanValues[propertyAvailabilityKey(name)] = value;
    if (type === "VARIANT" && typeof value === "string" && value.trim() && typeof expectedValue === "string" && expectedValue.trim())
      variantValues[propertyAvailabilityKey(name)] = value;
  }
  output.configuredNativePropertiesV1 = { booleanValues, variantValues };
}
function assertConfiguredPropertyContract(contract) {
  const version = contract.runtimePolicy.configuredNativePropertyConformanceVersion;
  const markers = contract.rules.map((r) => r.presentation?.propertyConformance).filter((v) => v !== void 0);
  if (version !== void 0 && version !== 1 || markers.some((m) => m !== CONFIGURED_NATIVE_PROPERTY_POLICY) || markers.length && version !== 1) throw new Error("CONFIGURED_NATIVE_PROPERTY_RUNTIME_UNSUPPORTED");
}
function configuredCaptureUnknowns(result, contract) {
  if (contract.runtimePolicy.configuredNativePropertyConformanceVersion !== 1) return;
  const rules = new Set(contract.rules.filter((r) => r.presentation?.propertyConformance === CONFIGURED_NATIVE_PROPERTY_POLICY).map((r) => r.ruleId));
  for (const evaluation of result.evaluations) {
    if (rules.has(evaluation.ruleId) && evaluation.trace?.reason === "selector matched no visible nodes") {
      evaluation.classification = "human-review";
      evaluation.applicability = "unknown";
      evaluation.trace = { ...evaluation.trace, reason: "configured native root visibility/capture is unresolved", truth: "unknown" };
    }
  }
  const missing = [...rules].filter((id) => !result.evaluations.some((e) => e.ruleId === id));
  if (missing.length) result.configuredNativePropertyDiagnostics = missing.map((ruleId) => ({ ruleId, truth: "unknown", reason: "configured native root capture is absent" }));
  const byClassification = {};
  for (const e of result.evaluations) byClassification[e.classification] = (byClassification[e.classification] || 0) + 1;
  result.coverage = { ...result.coverage, byClassification };
}

// ../Apollo/packages/component-contract-core/src/rule-ownership.ts
var RULE_OWNERSHIP_KINDS = ["component", "product-policy", "pattern", "editorial-policy"];
function validRuleOwnership(value, componentId) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value;
  return Object.keys(v).every((key2) => key2 === "kind" || key2 === "ownerId") && RULE_OWNERSHIP_KINDS.includes(v.kind) && typeof v.ownerId === "string" && !!v.ownerId.trim() && v.ownerId === v.ownerId.trim() && (v.kind !== "component" || v.ownerId === componentId);
}
function ruleOwnershipGroup(rule, componentId) {
  if (!validRuleOwnership(rule?.ownership, componentId)) return "unclassified";
  return rule.ownership.kind === "component" ? "component" : "usage";
}
function buildOwnershipReadiness(compiled, manual, gaps) {
  const active = manual.rules.filter((rule) => rule.status !== "deprecated");
  const globalErrors = compiled.issues.filter((i) => i.level === "error" && !i.path.startsWith("/rules/")).length;
  const group = (key2) => {
    const rules = active.filter((rule) => ruleOwnershipGroup(rule, manual.component.componentId) === key2);
    const ruleIds = rules.map((rule) => rule.id).sort();
    const unimplementedRuleIds = ruleIds.filter((id) => gaps.has(id));
    const unreviewedRuleIds = rules.filter((rule) => rule.status !== "reviewed").map((rule) => rule.id).sort();
    const unresolvedTargetIds = manual.targets.filter((target) => target.resolution !== "resolved" && rules.some((rule) => rule.targetId === target.id)).map((target) => target.id).sort();
    const validationErrors = compiled.issues.filter((issue) => issue.level === "error" && rules.some((rule) => issue.path.startsWith(`/rules/${manual.rules.indexOf(rule)}/`))).length;
    return {
      status: !rules.length ? "not-included" : key2 === "unclassified" || globalErrors || validationErrors || unimplementedRuleIds.length || unreviewedRuleIds.length || unresolvedTargetIds.length ? "draft" : "ready",
      rules: rules.length,
      ruleIds,
      unimplementedRuleIds,
      unreviewedRuleIds,
      unresolvedTargetIds,
      validationErrors
    };
  };
  return {
    version: 1,
    scope: "included-source-rules-only",
    component: group("component"),
    usage: group("usage"),
    unclassified: group("unclassified"),
    globalErrors
  };
}
function buildOwnershipCoverage(evaluations, compiled, manual) {
  const sources = new Map(manual.rules.map((rule) => [rule.id, rule]));
  const atomic = new Map(compiled.contract.rules.map((rule) => [rule.ruleId, String(rule.source?.anchor || "")]));
  const groups = { component: [], usage: [], unclassified: [], dependencies: [], infrastructure: [] };
  for (const evaluation of evaluations) {
    const ruleId = String(evaluation.ruleId);
    const source = sources.get(atomic.get(ruleId) || ruleId);
    const group = evaluation.dependency ? "dependencies" : source ? ruleOwnershipGroup(source, manual.component.componentId) : evaluation.origin === "editor-coverage" ? "infrastructure" : "unclassified";
    groups[group].push(evaluation);
  }
  const summarize = (key2) => {
    const entries = groups[key2];
    const notExecuted = entries.filter((e) => e.classification === "not-executed").length;
    const inconclusive = entries.filter((e) => ["human-review", "not-evaluable", "unknown"].includes(String(e.classification))).length;
    const violations = entries.filter((e) => e.classification === "violation").length;
    const notApplicable = entries.filter((e) => e.classification === "not-applicable").length;
    const complete = !!entries.length && !notExecuted && !inconclusive && key2 !== "unclassified";
    return {
      status: !entries.length ? "not-evaluated" : !complete ? "incomplete" : notApplicable === entries.length ? "not-applicable" : violations ? "violations" : "checked",
      complete,
      evaluations: entries.length,
      notExecuted,
      inconclusive,
      violations,
      notApplicable
    };
  };
  return {
    version: 1,
    scope: "included-source-rules-only",
    component: summarize("component"),
    usage: summarize("usage"),
    unclassified: summarize("unclassified"),
    dependencies: summarize("dependencies"),
    infrastructure: summarize("infrastructure")
  };
}

// ../Apollo/packages/component-contract-core/src/configuration-domain.ts
var configurationRoles = (c) => [...new Set(c.profiles.flatMap((p) => p.requirements.map((r) => r.targetRole)))];
var eq = (fact2, value) => ({ predicate: "equals", actual: { fact: fact2 }, expected: { literal: value }, missingPolicy: "unknown" });
var visible = (role, value) => eq(`ruleScopeV1.targets.${role}.visible`, value);
var configurationActive = (c) => ({ predicate: "any", args: c.activeRoles.map((role) => visible(role, true)) });
function configurationTargetQuery(roles, fact2, visibleOnly = false) {
  return { query: {
    from: "selection-root",
    traverse: "self-and-descendants",
    where: [
      { predicate: "fact-present", actual: { fact: "semantic.role" } },
      { predicate: "one-of", actual: { fact: "semantic.role" }, expected: { literal: roles }, missingPolicy: "unknown" },
      ...visibleOnly ? [eq("visibility.effective", true)] : []
    ],
    project: { fact: fact2 }
  } };
}
var configurationExclusion = (roles) => ({
  predicate: "none-of",
  actual: { fact: "id" },
  expected: configurationTargetQuery(roles, "id"),
  missingPolicy: "unknown"
});
function configurationAssertion(c, expectedInput = false) {
  const query = (role, fact2) => configurationTargetQuery([role], fact2, true);
  return { predicate: "any", args: c.profiles.map((profile) => ({ predicate: "all", args: [
    ...expectedInput ? [eq(`expectedInput.${c.specificationInput}`, profile.id)] : [],
    ...configurationRoles(c).map((role) => ({ predicate: "any", args: [visible(role, false), {
      predicate: "all",
      args: [visible(role, true), ...profile.requirements.filter((r) => r.targetRole === role).map((r) => ({
        predicate: "sequence-equals",
        actual: query(role, r.fact),
        expected: r.baseline ? query(role, `baseline.effective.${r.fact}`) : { literal: [r.value] },
        missingPolicy: "unknown"
      }))]
    }] }))
  ] })) };
}
function configurationErrors(manual, ruleIndex, constraint) {
  const rule = manual.rules[ruleIndex], c = constraint.configuration, errors = [];
  const fail2 = (message) => errors.push(message);
  if (constraint.type === "configurationDomain") {
    if (!c || !Array.isArray(c.activeRoles) || !c.activeRoles.length || !Array.isArray(c.profiles) || !c.profiles.length) return ["Declare active roles and configuration profiles."];
    if (Object.keys(c).some((k) => !["activeRoles", "profiles", "specificationInput"].includes(k))) fail2("Unknown configuration field.");
    if (Object.keys(constraint).some((k) => !["type", "configuration"].includes(k))) fail2("Configuration uses only its typed profiles, not other constraint fields.");
    if (manual.targets.find((t) => t.id === rule.targetId)?.semanticRole !== "root" || (rule.targetScope || "self") !== "self" || rule.capabilitySet || rule.permission !== "constrained" || rule.execution?.route !== "predicate") fail2("Configuration requires root/self, constrained permission and predicate execution.");
    if (rule.applicability.validationMode || rule.applicability.activeDependency || Object.keys(rule.applicability.context || {}).length || rule.applicability.variants !== "all" || rule.applicability.modes !== "all" || rule.applicability.products?.length || rule.applicability.channels?.length) fail2("Configuration domain is intrinsic; activation is declared by activeRoles, not external context.");
    if (c.profiles.some((p) => !p || typeof p !== "object" || !Array.isArray(p.requirements) || !p.requirements.length || p.requirements.some((r) => !r || typeof r !== "object"))) return [...errors, "Every profile needs typed requirements."];
    const ids = c.profiles.map((p) => p.id);
    if (ids.some((id) => typeof id !== "string" || !id.trim()) || new Set(ids).size !== ids.length) fail2("Profile IDs must be unique nonempty strings.");
    const roles = configurationRoles(c);
    if (roles.some((role) => !/^[a-zA-Z0-9_-]+$/.test(role) || manual.targets.filter((t) => t.semanticRole === role && t.resolution === "resolved").length !== 1)) fail2("All roles must be unique resolved semantic targets.");
    if (new Set(c.activeRoles).size !== c.activeRoles.length || c.activeRoles.some((role) => !roles.includes(role))) fail2("Active roles must be a unique subset of the configuration targets.");
    const fields2 = (p) => p.requirements.map((r) => `${r.targetRole}:${r.fact}`).sort();
    for (const profile of c.profiles) {
      if (Object.keys(profile).some((k) => !["id", "requirements"].includes(k))) fail2("Unknown profile field.");
      if (new Set(fields2(profile)).size !== profile.requirements.length || JSON.stringify(fields2(profile)) !== JSON.stringify(fields2(c.profiles[0]))) fail2("Profiles must constrain the same unique target/fact pairs.");
      for (const r of profile.requirements) {
        if (Object.keys(r).some((k) => !["targetRole", "fact", "value", "baseline"].includes(k))) fail2("Unknown configuration requirement field.");
        if (!/^(layout|text)\.[a-zA-Z][a-zA-Z0-9.]*$/.test(r.fact) || /(?:__proto__|constructor|prototype)/.test(r.fact)) fail2("Configuration facts must be explicit observed layout/text fields.");
        if (r.baseline === true ? r.value !== void 0 : r.baseline !== void 0 || r.value === void 0) fail2("Choose a literal value or baseline, not both.");
      }
    }
    if (c.specificationInput !== void 0) {
      if (typeof c.specificationInput !== "string" || !c.specificationInput.trim()) fail2("Specification input must be a nonempty semantic API ID.");
      const p = manual.semanticApi.find((p2) => p2.id === c.specificationInput);
      if (!p || p.validationInput?.version !== 2 || p.valueType !== "enum" || JSON.stringify([...p.domain || []].sort()) !== JSON.stringify([...ids].sort())) fail2("Specification input requires a declared enum v2 matching profile IDs.");
    }
  } else if (c) fail2("configuration is supported only by configurationDomain.");
  if (constraint.exceptConfiguration) {
    const e = constraint.exceptConfiguration, owner = manual.rules.find((r) => r.id === e.ruleId);
    const configs = owner?.constraints.filter((c2) => c2.type === "configurationDomain" && c2.configuration) || [];
    if (constraint.type !== "propertyForbidden" || !constraint.fact || !owner || owner.status === "deprecated" || configs.length !== 1 || !Array.isArray(e.targetRoles) || !e.targetRoles.length || new Set(e.targetRoles).size !== e.targetRoles.length || JSON.stringify(owner?.applicability.platforms) !== JSON.stringify(rule.applicability.platforms)) fail2("Baseline exclusion requires one active configuration rule with matching platform scope and explicit target roles/fact.");
    else {
      if (configurationErrors(manual, manual.rules.indexOf(owner), configs[0]).length) return [...errors, "Baseline exclusion references an invalid configuration."];
      for (const p of configs[0].configuration.profiles) for (const role of e.targetRoles)
        if (!p.requirements.some((r) => r.targetRole === role && r.fact === constraint.fact && r.baseline !== true)) fail2("Every exempt target/fact must be constrained by literals in every profile.");
    }
  }
  return errors;
}

// ../Apollo/packages/component-contract-core/src/rule-scope-policy.ts
function allowsVisibleTargetPolicy(rule) {
  const baselineOnly = rule.permission !== "allowed" && (rule.constraints.length ? rule.constraints.every((c) => c.type === "propertyForbidden") : rule.permission === "forbidden");
  const facts2 = baselineFactsForRule(rule);
  const style = baselineOnly && facts2.length > 0 && facts2.every((f) => [
    "appearance.fill",
    "appearance.stroke",
    "appearance.strokeWeight",
    "appearance.opacity",
    "appearance.radius",
    "appearance.effects",
    "appearance.typography"
  ].includes(f));
  const deferredLayout = rule.execution?.route === "context-only" && rule.permission === "constrained" && !rule.capabilitySet && /^(layout|text)\./.test(rule.capability) && rule.constraints.length > 0 && rule.constraints.every((c) => c.type === "layoutConstraint" && /^(layout|text|derived)\.[a-zA-Z][a-zA-Z0-9.]*$/.test(c.fact || ""));
  return style || deferredLayout;
}

// ../Apollo/packages/component-contract-core/src/validation-inputs.ts
function validationInputs(source) {
  return [
    ...(source?.semanticApi || []).filter((p) => p.validationInput),
    ...(Array.isArray(source?.validationContext) ? source.validationContext : []).filter((p) => p && typeof p === "object").map((p) => ({
      id: p.id,
      valueType: p.valueType,
      domain: p.domain,
      kind: "layout",
      bindings: [],
      validationInput: { version: p.valueType === "enum" ? 2 : 1, label: `\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442: ${p.label}`, description: p.description }
    }))
  ];
}

// ../Apollo/packages/component-contract-core/src/configuration-mapping.ts
var eq2 = (fact2, value) => ({ predicate: "equals", actual: { fact: fact2 }, expected: { literal: value }, missingPolicy: "unknown" });
var mappingActive = (m) => ({ predicate: "any", args: m.activeRoles.map((role) => eq2(`ruleScopeV1.targets.${role}.visible`, true)) });
var mappingCondition = (c) => ({ predicate: "all", args: Object.entries(c.when).map(([id, value]) => eq2(`expectedInput.${id}`, value)) });
function mappingAssertion(c) {
  return { predicate: "all", args: [...new Set(c.requirements.map((r) => r.targetRole))].map((role) => ({ predicate: "any", args: [
    eq2(`ruleScopeV1.targets.${role}.visible`, false),
    { predicate: "all", args: [eq2(`ruleScopeV1.targets.${role}.visible`, true), ...c.requirements.filter((r) => r.targetRole === role).map((r) => ({
      predicate: "any",
      args: (r.values || [r.value]).map((value) => ({
        predicate: "sequence-equals",
        actual: configurationTargetQuery([role], r.fact, true),
        expected: { literal: [value] },
        missingPolicy: "unknown"
      }))
    }))] }
  ] })) };
}
function mappingErrors(manual, index, constraint) {
  if (constraint.type !== "configurationMapping") return constraint.mapping ? ["mapping requires configurationMapping."] : [];
  const rule = manual.rules[index], m = constraint.mapping, errors = [];
  if (!m || !Array.isArray(m.activeRoles) || !m.activeRoles.length || !Array.isArray(m.cases) || !m.cases.length) return ["Declare activeRoles and conditional cases."];
  if (Object.keys(constraint).some((k) => !["type", "mapping"].includes(k)) || Object.keys(m).some((k) => !["activeRoles", "cases"].includes(k))) errors.push("Unknown mapping field.");
  if (manual.targets.find((t) => t.id === rule.targetId)?.semanticRole !== "root" || (rule.targetScope || "self") !== "self" || rule.permission !== "constrained" || rule.execution?.route !== "predicate" || rule.capabilitySet || rule.applicability.validationMode !== "specification" || rule.boundaryPolicy || rule.targetApplicability || rule.applicability.activeDependency || Object.keys(rule.applicability.context || {}).length || rule.applicability.variants !== "all" || rule.applicability.modes !== "all") errors.push("Mapping requires root/self and explicit specification mode; activation belongs to cases and activeRoles.");
  const validRole = (role) => /^[a-zA-Z0-9_-]+$/.test(role) && manual.targets.filter((t) => t.semanticRole === role && t.resolution === "resolved").length === 1;
  if (new Set(m.activeRoles).size !== m.activeRoles.length || m.activeRoles.some((r) => !validRole(r))) errors.push("Active roles must be unique resolved targets.");
  const inputs = validationInputs(manual), ids = /* @__PURE__ */ new Set();
  for (const c of m.cases) {
    if (!c || typeof c !== "object" || !c.when || typeof c.when !== "object" || Array.isArray(c.when) || !Array.isArray(c.requirements) || !c.requirements.length) {
      errors.push("Every case needs conditions and requirements.");
      continue;
    }
    if (typeof c.id !== "string" || !/^[a-zA-Z0-9_-]+$/.test(c.id) || ids.has(c.id) || Object.keys(c).some((k) => !["id", "when", "requirements"].includes(k))) errors.push("Unique case ID and typed fields required.");
    ids.add(c.id);
    if (!Object.keys(c.when).length) errors.push("Every mapping case needs an independent input condition.");
    for (const [id, value] of Object.entries(c.when)) {
      const input = inputs.find((p) => p.id === id);
      if (!input || !(input.valueType === "boolean" && typeof value === "boolean" || input.valueType === "enum" && input.domain?.includes(value))) errors.push(`Invalid declared input: ${id}.`);
    }
    const pairs = /* @__PURE__ */ new Set();
    for (const r of c.requirements) {
      if (!r || typeof r !== "object") {
        errors.push("Invalid mapping requirement.");
        continue;
      }
      const pair = `${r.targetRole}:${r.fact}`;
      if (!validRole(r.targetRole) || pairs.has(pair)) errors.push("Requirements need unique resolved target/fact pairs.");
      pairs.add(pair);
      if (Object.keys(r).some((k) => !["targetRole", "fact", "value", "values"].includes(k)) || !/^(layout|text|parent\.layout)\.[a-zA-Z][a-zA-Z0-9.]*$/.test(r.fact) || /(?:__proto__|constructor|prototype)/.test(r.fact)) errors.push("Mapping requires explicit observed layout/text facts.");
      if (r.value === void 0 ? !Array.isArray(r.values) || !r.values.length : r.values !== void 0) errors.push("Choose one value or a nonempty value domain.");
    }
    if (m.activeRoles.some((role) => !c.requirements.some((r) => r?.targetRole === role))) errors.push("Each active role must be constrained in every case.");
  }
  return errors;
}

// ../Apollo/packages/component-contract-core/src/native-instance-replacements.ts
var record18 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var unknown5 = (n, fact2) => (n.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + ".") || p.startsWith(fact2 + "."));
var key = (v) => typeof v === "string" && /^[a-f0-9]{40}$/.test(v);
var replacementId = (ruleId, role) => "r_" + stableHash({ ruleId, role }).slice(0, 16);
function replacementContextMapped(manual, fact2, value) {
  return typeof value === "boolean" && manual.rules.some((r, i) => r.status !== "deprecated" && r.constraints.some((c) => c.type === "instanceReplacementDomain" && c.replacement && replacementErrors(manual, i, c).length === 0 && fact2 === `nativeInstanceReplacementsV1.${replacementId(r.id, c.replacement.targetRole)}.sameFamily`));
}
function replacementErrors(manual, ruleIndex, c) {
  if (c.type !== "instanceReplacementDomain") return c.replacement ? ["replacement requires instanceReplacementDomain."] : [];
  const r = manual.rules[ruleIndex], d = c.replacement, errors = [];
  if (!d || Object.keys(c).some((k) => !["type", "replacement"].includes(k)) || Object.keys(d).some((k) => !["targetRole", "alternatives"].includes(k))) return ["Declare one target role and typed alternatives."];
  const t = manual.targets.filter((t2) => t2.semanticRole === d.targetRole);
  if (r.permission !== "constrained" || r.capability !== "component.swap" || r.capabilitySet || (r.targetScope || "self") !== "self" || manual.targets.find((t2) => t2.id === r.targetId)?.semanticRole !== "root" || r.execution?.route !== "predicate" || manual.metadata.declaredTargetConfigurationVersion !== 1 || t.length !== 1 || t[0].resolution !== "resolved" || !t[0].identityBindingsV1?.length || t[0].identityBindingsV1.some((b) => b.nodeType !== "INSTANCE" || !b.referencePath || !b.nativeSource)) errors.push("Replacement requires constrained root/self component.swap, configuration v1 and a bound native INSTANCE role.");
  if (!Array.isArray(d.alternatives) || !d.alternatives.length) return [...errors, "Declare component-set alternatives."];
  const sets = /* @__PURE__ */ new Set();
  for (const a of d.alternatives) {
    if (!a || !key(a.componentSetKey) || sets.has(a.componentSetKey) || Object.keys(a).some((k) => !["componentSetKey", "properties"].includes(k))) {
      errors.push("Alternative component set keys must be unique canonical keys.");
      continue;
    }
    sets.add(a.componentSetKey);
    if (a.properties !== void 0 && (!a.properties || typeof a.properties !== "object" || Array.isArray(a.properties) || ![Object.prototype, null].includes(Object.getPrototypeOf(a.properties)))) {
      errors.push("Alternative properties must be a plain record.");
      continue;
    }
    for (const [name, values] of Object.entries(a.properties || {})) if (!name.trim() || name !== name.trim() || /[.#]/.test(name) || ["__proto__", "constructor", "prototype"].includes(name) || !Array.isArray(values) || !values.length || values.some((v) => typeof v !== "string" || !v.trim()) || new Set(values).size !== values.length) errors.push("Use exact native VARIANT names and unique string domains.");
  }
  if (manual.rules.filter((other) => other.status !== "deprecated").reduce((count, other) => count + other.constraints.filter((c2) => c2.type === "instanceReplacementDomain" && c2.replacement?.targetRole === d.targetRole).length, 0) > 1) errors.push("One active replacement domain per native role.");
  return errors;
}
function assertNativeInstanceReplacementPolicy(contract) {
  if (contract.runtimePolicy.nativeInstanceReplacementsVersion === void 0) {
    if (contract.capabilities.facts.some((f) => f.startsWith("nativeInstanceReplacementsV1."))) throw new Error("NATIVE_INSTANCE_REPLACEMENT_POLICY_MISSING");
    return;
  }
  if (contract.runtimePolicy.nativeInstanceReplacementsVersion !== 1 || contract.runtimePolicy.declaredTargetConfigurationVersion !== 1) throw new Error("NATIVE_INSTANCE_REPLACEMENT_UNSUPPORTED");
  const bindings = contract.runtimePolicy.nativeInstanceReplacements || [];
  if (!bindings.length || new Set(bindings.map((b) => b.id)).size !== bindings.length || bindings.some((b) => b.id !== replacementId(b.sourceRuleId, b.targetRole) || !Array.isArray(b.propertyNames) || new Set(b.propertyNames).size !== b.propertyNames.length || b.propertyNames.some((n) => !n || /[.#]/.test(n) || ["__proto__", "constructor", "prototype"].includes(n)) || !contract.customizationPolicy.some((p) => p.id === b.sourceRuleId && p.permission === "constrained" && p.capability === "component.swap" && p.status !== "deprecated"))) throw new Error("NATIVE_INSTANCE_REPLACEMENT_BINDINGS");
}
function replacementVariantActivity(contract, root2, ref, ruleId) {
  const policies = contract.customizationPolicy.filter((p) => p.id === ruleId && p.status !== "deprecated");
  if (policies.length !== 1) return "unknown";
  const scope = policies[0].applicability?.variants;
  if (scope === "all") return "active";
  if (!scope || typeof scope !== "object" || Array.isArray(scope)) return "unknown";
  const variants = contract.facts.variantEvidence?.variants.filter((v) => v.componentKey === ref.componentKey && v.componentSetKey === ref.componentSetKey) || [];
  if (variants.length !== 1 || !["verified", "partial"].includes(String(record18(root2.variantAvailability).status))) return "unknown";
  const component = record18(root2.component), source = ref.nodeProperties[""];
  let active = true;
  for (const [property, values] of Object.entries(scope)) {
    const value = variants[0].properties[property];
    if (property.includes(".") || !Array.isArray(values) || !values.length || values.some((v) => typeof v !== "string" || !v.trim()) || typeof value !== "string" || unknown5(root2, `component.properties.${property}`) || unknown5(root2, `component.propertyTypes.${property}`) || component.propertyTypes?.[property] !== "VARIANT" || source?.propertyTypes?.[property] !== "VARIANT" || ref.propertyTypes[property] !== "VARIANT" || component.properties?.[property] !== value || source.properties?.[property] !== value || ref.properties[property] !== value) return "unknown";
    if (!values.includes(value)) active = false;
  }
  return active ? "active" : "inactive";
}
function materializeInstanceReplacements(snapshot, contract) {
  assertNativeInstanceReplacementPolicy(contract);
  if (contract.runtimePolicy.nativeInstanceReplacementsVersion === void 0) return;
  const bindings = contract.runtimePolicy.nativeInstanceReplacements || [];
  for (const n of snapshot.nodes) delete n.nativeInstanceReplacementsV1;
  const roots = snapshot.nodes.filter((n) => snapshot.selection.includes(String(n.id))), root2 = roots.length === 1 ? roots[0] : void 0;
  if (!root2) return;
  const facts2 = {};
  root2.nativeInstanceReplacementsV1 = facts2;
  const rt = contract.facts.targets.find((t) => t.semanticRole === "root"), ref = snapshot.variantReference;
  if (!rt || record18(root2.declaredTargetMembershipV1)[declaredTargetMembershipKey(rt.id)] !== true || !ref?.complete || snapshot.source?.captureTopology?.complete !== true || snapshot.source.instanceSourceIdentityVersion !== 1 || snapshot.source.occurrenceAddressVersion !== 1) return;
  const identity = record18(record18(root2.component).identity), owner = ref.nodeProperties[""]?.identity;
  if (!owner || owner.componentKey !== identity.componentKey || owner.mainComponentId !== identity.mainComponentId || unknown5(root2, "component.identity")) return;
  const captures = snapshot.source.instanceSourceIdentityCapture?.owners || [];
  const captured = (i) => captures.filter((c) => c.mainComponentId === i.mainComponentId && c.componentKey === i.componentKey && c.status === "captured").length === 1;
  if (!captured(identity)) return;
  for (const d of bindings) {
    const target = contract.facts.targets.find((t) => t.semanticRole === d.targetRole), matches2 = target?.identityBindingsV1?.filter((b2) => b2.componentKey === ref.componentKey && b2.componentSetKey === ref.componentSetKey) || [];
    const f = {};
    facts2[d.id] = f;
    const activity = replacementVariantActivity(contract, root2, ref, d.sourceRuleId);
    if (activity === "inactive") {
      f.inactive = true;
      continue;
    }
    if (activity === "unknown") continue;
    if (record18(record18(root2.variantAvailability).targets)[d.targetRole]?.present === false) {
      Object.assign(f, { present: false, ownershipKnown: true });
      continue;
    }
    if (matches2.length !== 1) continue;
    const b = matches2[0], source = b.nativeSource, expected = ref.nodeProperties[b.referencePath];
    if (!source || b.nodeType !== "INSTANCE" || b.configurationReferenceHash !== configurationDeclaredTargetReferenceHash(ref) || source.ownerComponentKey !== identity.componentKey || ref.nodes.filter((n) => n.path === b.referencePath && n.type === "INSTANCE").length !== 1 || expected?.sourceIdentity?.sourceNodeId !== source.sourceNodeId || expected.sourceIdentity.ownerComponentKey !== identity.componentKey || expected.sourceIdentity.ownerMainComponentId !== identity.mainComponentId || !key(expected.identity?.componentSetKey)) continue;
    const nodes = snapshot.nodes.filter((n) => n.type === "INSTANCE" && !unknown5(n, "component.sourceIdentity") && record18(record18(n.component).sourceIdentity).version === 1 && record18(record18(n.component).sourceIdentity).sourceNodeId === source.sourceNodeId && record18(record18(n.component).sourceIdentity).ownerComponentKey === identity.componentKey && record18(record18(n.component).sourceIdentity).ownerMainComponentId === identity.mainComponentId);
    if (nodes.length !== 1) continue;
    const node = nodes[0], component = record18(node.component), actual = record18(component.identity);
    if (unknown5(node, "component.identity") || !key(actual.componentKey) || !key(actual.componentSetKey) || !actual.mainComponentId || !captured(actual)) continue;
    Object.assign(f, { present: true, nodeId: node.id, ownershipKnown: true, componentSetKey: actual.componentSetKey, sameFamily: actual.componentSetKey === expected.identity.componentSetKey, properties: {} });
    for (const name of d.propertyNames) if (!unknown5(node, `component.properties.${name}`) && !unknown5(node, `component.propertyTypes.${name}`) && component.propertyTypes?.[name] === "VARIANT" && typeof component.properties?.[name] === "string" && component.properties[name].trim()) f.properties[name] = component.properties[name];
  }
}

// ../Apollo/packages/component-contract-core/src/validator.ts
var KNOWN_CONSTRAINTS = /* @__PURE__ */ new Set([
  "propertyDomain",
  "propertyExclusion",
  "presence",
  "propertyForbidden",
  "quantity",
  "memberCollection",
  "positionOrder",
  "relationship",
  "tokenBinding",
  "styleBinding",
  "bindingConsistency",
  "layoutConstraint",
  "dependencyDomain",
  "transitionInvariant",
  "configurationDomain",
  "configurationMapping",
  "instanceReplacementDomain"
]);
function validateManualSource(manual) {
  const issues = validateComponentDependencies(manual);
  for (const message of representationEvidenceErrors(manualRepresentationShape(manual))) issues.push({ level: "error", code: "REPRESENTATION_CODE_BINDING", path: "/representations", message });
  const error = (code, path, message) => {
    issues.push({ level: "error", code, path, message });
  };
  const warning = (code, path, message) => {
    issues.push({ level: "warning", code, path, message });
  };
  if (manual.schemaVersion !== "apollo.component-contract.manual.v2-experimental") {
    error("SCHEMA_VERSION", "/schemaVersion", "Unsupported manual source schema version.");
  }
  if (manual.metadata.ruleOwnershipVersion !== void 0 && manual.metadata.ruleOwnershipVersion !== 1) {
    error("RULE_OWNERSHIP_VERSION", "/metadata/ruleOwnershipVersion", "Unsupported rule ownership model.");
  }
  if (manual.metadata.publicRepresentationBoundaryVersion !== void 0 && manual.metadata.publicRepresentationBoundaryVersion !== 1) {
    error("PUBLIC_REPRESENTATION_BOUNDARY_VERSION", "/metadata/publicRepresentationBoundaryVersion", "Unsupported public representation boundary.");
  }
  if (manual.metadata.publicRepresentationBoundaryVersion === 1 && !manual.representations.some((r) => r.kind === "figma" && r.status !== "deprecated" && (r.locator.componentKey || r.locator.componentSetKey))) {
    error("PUBLIC_REPRESENTATION_BOUNDARY_EMPTY", "/representations", "An explicit public boundary requires at least one active Figma key.");
  }
  if (!manual.component.componentId.trim()) error("COMPONENT_SEMANTIC_ID", "/component/componentId", "Stable componentId is required.");
  if (!manual.component.familyId.trim()) error("COMPONENT_FAMILY_ID", "/component/familyId", "Stable familyId is required.");
  if (!manual.component.contractId.trim()) error("COMPONENT_ID", "/component/contractId", "Contract id is required.");
  if (!manual.component.family.trim()) error("COMPONENT_FAMILY", "/component/family", "Component family is required.");
  if (!manual.component.componentKey.trim()) {
    warning("COMPONENT_KEY", "/component/componentKey", "Live Figma preview is unavailable without componentKey.");
  }
  if (!manual.semantics.purpose.trim()) warning("SEMANTICS_PURPOSE", "/semantics/purpose", "Component purpose is empty.");
  const representationIds = /* @__PURE__ */ new Set();
  manual.representations.forEach((representation, index) => {
    const path = `/representations/${index}`;
    if (!representation.id.trim()) error("REPRESENTATION_ID", `${path}/id`, "Representation id is required.");
    if (representationIds.has(representation.id)) error("REPRESENTATION_DUPLICATE", `${path}/id`, `Duplicate representation id: ${representation.id}.`);
    representationIds.add(representation.id);
    if (!representation.platform.trim()) error("REPRESENTATION_PLATFORM", `${path}/platform`, "Representation platform is required.");
    if (!Object.keys(representation.locator).length) warning("REPRESENTATION_LOCATOR", `${path}/locator`, "Representation locator is empty.");
  });
  const propertyIds = /* @__PURE__ */ new Set();
  manual.semanticApi.forEach((property, index) => {
    const path = `/semanticApi/${index}`;
    if (!property.id.trim()) error("SEMANTIC_PROPERTY_ID", `${path}/id`, "Semantic property id is required.");
    if (propertyIds.has(property.id)) error("SEMANTIC_PROPERTY_DUPLICATE", `${path}/id`, `Duplicate semantic property id: ${property.id}.`);
    propertyIds.add(property.id);
    if (property.validationInput && (!(property.validationInput.version === 1 && property.valueType === "boolean" || property.validationInput.version === 2 && property.valueType === "enum" && Array.isArray(property.domain) && property.domain.length > 0 && property.domain.every((v) => typeof v === "string" && v.trim()) && new Set(property.domain).size === property.domain.length) || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(property.id) || typeof property.validationInput.label !== "string" || !property.validationInput.label.trim() || typeof property.validationInput.description !== "string" || !property.validationInput.description.trim())) {
      error("VALIDATION_INPUT_INVALID", `${path}/validationInput`, "Independent input requires boolean v1 or a finite string enum v2, a simple stable ID, label and description.");
    }
    property.bindings.forEach((binding, bindingIndex) => {
      if (!representationIds.has(binding.representationId)) {
        error("SEMANTIC_PROPERTY_REPRESENTATION", `${path}/bindings/${bindingIndex}/representationId`, `Unknown representation: ${binding.representationId}.`);
      }
      if (!binding.path.trim()) error("SEMANTIC_PROPERTY_PATH", `${path}/bindings/${bindingIndex}/path`, "Binding path is required.");
      if (!binding.ownedOccurrence && !binding.nativeSlotBinding && binding.targetId !== void 0 || binding.path === "visibility.effective") {
        const target = manual.targets.filter((t) => t.id === binding.targetId);
        const visibility = binding.path === "visibility.effective" && property.kind === "visibility" && property.valueType === "boolean";
        const componentProperty = binding.path.startsWith("component.properties.") && ["variant", "content", "state"].includes(property.kind) && ["enum", "string", "boolean", "content"].includes(property.valueType);
        if (!visibility && !componentProperty || ![void 0, "identity"].includes(binding.transform) || target.length !== 1 || manual.targets.filter((t) => t.semanticRole === target[0]?.semanticRole).length !== 1 || manual.representations.find((r) => r.id === binding.representationId)?.kind !== "figma") {
          error("SEMANTIC_TARGET_BINDING", `${path}/bindings/${bindingIndex}`, "Target binding requires one declared target, Figma representation and identity transform: effective visibility or a typed component property.");
        }
        if (property.bindings.filter((b) => b.representationId === binding.representationId).length !== 1) {
          error("SEMANTIC_TARGET_BINDING_AMBIGUOUS", `${path}/bindings/${bindingIndex}`, "A target-derived fact cannot share a representation with another binding.");
        }
      }
      if (binding.path === "representation.surface" && binding.transform === "identity") {
        const rep = manual.representations.find((r) => r.id === binding.representationId);
        if (rep?.kind !== "figma" || !rep.surface || !["enum", "string"].includes(property.valueType) || property.domain && !property.domain.includes(rep.surface)) {
          error("SEMANTIC_REPRESENTATION_SURFACE", `${path}/bindings/${bindingIndex}`, "Surface identity binding requires an explicit Figma representation surface in the semantic domain.");
        }
      }
    });
  });
  if (manual.validationContext !== void 0) {
    const contexts = manual.validationContext;
    if (!Array.isArray(contexts)) error("VALIDATION_CONTEXT_INVALID", "/validationContext", "Scenario context must be an array.");
    else {
      const ids = new Set(propertyIds);
      contexts.forEach((p, i) => {
        if (!p || typeof p !== "object" || typeof p.id !== "string" || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(p.id) || ids.has(p.id) || typeof p.label !== "string" || !p.label.trim() || typeof p.description !== "string" || !p.description.trim() || Object.keys(p).some((k) => !["id", "valueType", "domain", "label", "description"].includes(k)) || !(p.valueType === "boolean" && p.domain === void 0 || p.valueType === "enum" && Array.isArray(p.domain) && p.domain.length > 0 && p.domain.every((v) => typeof v === "string" && v.trim()) && new Set(p.domain).size === p.domain.length)) {
          error("VALIDATION_CONTEXT_INVALID", `/validationContext/${i}`, "Context needs a unique ID (not an API property), label, description and boolean or finite enum type. No bindings/defaults.");
        }
        if (p?.id) ids.add(p.id);
      });
    }
  }
  const documentIds = /* @__PURE__ */ new Set();
  manual.documentation.forEach((document, index) => {
    const path = `/documentation/${index}`;
    if (!document.id.trim()) error("DOCUMENT_ID", `${path}/id`, "Documentation id is required.");
    if (documentIds.has(document.id)) error("DOCUMENT_DUPLICATE", `${path}/id`, `Duplicate document id: ${document.id}.`);
    documentIds.add(document.id);
    if (!document.path.trim()) error("DOCUMENT_PATH", `${path}/path`, "Documentation path is required.");
  });
  const exampleIds = /* @__PURE__ */ new Set();
  manual.examples.forEach((example, index) => {
    const path = `/examples/${index}`;
    if (!example.id.trim()) error("EXAMPLE_ID", `${path}/id`, "Example id is required.");
    if (exampleIds.has(example.id)) error("EXAMPLE_DUPLICATE", `${path}/id`, `Duplicate example id: ${example.id}.`);
    exampleIds.add(example.id);
    example.ruleIds?.forEach((ruleId, ruleIndex) => {
      if (!manual.rules.some((rule) => rule.id === ruleId)) {
        warning("EXAMPLE_RULE", `${path}/ruleIds/${ruleIndex}`, `Example references unknown rule: ${ruleId}.`);
      }
    });
  });
  const decisionIds = /* @__PURE__ */ new Set();
  const retiredRuleIds = /* @__PURE__ */ new Set();
  manual.decisions.forEach((decision, index) => {
    const path = `/decisions/${index}`;
    if (!decision.id.trim()) error("DECISION_ID", `${path}/id`, "Decision id is required.");
    if (decisionIds.has(decision.id)) error("DECISION_DUPLICATE", `${path}/id`, `Duplicate decision id: ${decision.id}.`);
    decisionIds.add(decision.id);
    if (!decision.summary.trim()) error("DECISION_SUMMARY", `${path}/summary`, "Decision summary is required.");
    for (const id of decision.retiredRuleIds || []) {
      if (!id || decision.status !== "accepted" || !decision.rationale.trim() || retiredRuleIds.has(id) || manual.rules.some((r) => r.id === id)) {
        error("DECISION_RETIREMENT", `${path}/retiredRuleIds`, "Retirement requires an accepted reason and a unique, non-active RuleID.");
      }
      retiredRuleIds.add(id);
    }
  });
  const profileIds = /* @__PURE__ */ new Set();
  manual.generation.profiles.forEach((profile, index) => {
    const path = `/generation/profiles/${index}`;
    if (!profile.id.trim()) error("GENERATION_PROFILE_ID", `${path}/id`, "Generation profile id is required.");
    if (profileIds.has(profile.id)) error("GENERATION_PROFILE_DUPLICATE", `${path}/id`, `Duplicate generation profile id: ${profile.id}.`);
    profileIds.add(profile.id);
    if (!representationIds.has(profile.representationId)) {
      error("GENERATION_REPRESENTATION", `${path}/representationId`, `Unknown representation: ${profile.representationId}.`);
    }
    for (const id of Object.keys(profile.properties)) {
      if (manual.semanticApi.find((p) => p.id === id)?.bindings.some((b) => b.representationId === profile.representationId && b.targetId)) {
        error("GENERATION_READ_ONLY_FACT", `${path}/properties/${id}`, "Target-derived visibility is read-only; use the configured component property for generation.");
      }
    }
  });
  for (const message of declaredTargetIdentityErrors({ version: manual.metadata.declaredTargetIdentityVersion, configurationVersion: manual.metadata.declaredTargetConfigurationVersion, targets: manual.targets, representations: manual.representations })) {
    error("DECLARED_TARGET_IDENTITY", "/targets", message);
  }
  const targetIds = /* @__PURE__ */ new Set();
  const roles = /* @__PURE__ */ new Set();
  manual.targets.forEach((target, index) => {
    const path = `/targets/${index}`;
    if (target.variantContinuity) {
      const c = target.variantContinuity, anchors = manual.targets.filter((t) => t.id === c.anchorTargetId);
      if (c.kind !== "same-family-text" || anchors.length !== 1 || c.anchorTargetId === target.id || anchors[0].variantContinuity) {
        error("TARGET_VARIANT_CONTINUITY", `${path}/variantContinuity`, "Text continuity requires one distinct non-delegated anchor target.");
      } else for (const rep of manual.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated")) {
        const hint = (t) => t.representationHints?.find((h) => h.representationId === rep.id)?.pathHint || t.pathHint;
        const child = hint(target), parent3 = hint(anchors[0]);
        if (!child || !parent3 || !child.startsWith(parent3 + " / ")) error("TARGET_VARIANT_CONTINUITY", `${path}/variantContinuity`, `Text must be inside its anchor in ${rep.id}.`);
      }
    }
    if (!target.id.trim()) error("TARGET_ID", `${path}/id`, "Target id is required.");
    if (targetIds.has(target.id)) error("TARGET_DUPLICATE", `${path}/id`, `Duplicate target id: ${target.id}.`);
    targetIds.add(target.id);
    if (!target.semanticRole.trim()) error("TARGET_ROLE", `${path}/semanticRole`, "Semantic role is required.");
    if (roles.has(target.semanticRole)) {
      warning("TARGET_ROLE_DUPLICATE", `${path}/semanticRole`, `Semantic role is not unique: ${target.semanticRole}.`);
    }
    roles.add(target.semanticRole);
    if (target.resolution && target.resolution !== "resolved") {
      warning("TARGET_UNRESOLVED", path, `Target resolution is ${target.resolution}.`);
    }
    target.representationHints?.forEach((hint, hintIndex) => {
      if (!representationIds.has(hint.representationId)) {
        error("TARGET_REPRESENTATION", `${path}/representationHints/${hintIndex}/representationId`, `Unknown representation: ${hint.representationId}.`);
      }
    });
    target.variantHints?.forEach((hint, hintIndex) => {
      const hintPath = `${path}/variantHints/${hintIndex}`;
      const rep = manual.representations.find((r) => r.id === hint.representationId);
      if (!rep || rep.kind !== "figma") error("TARGET_VARIANT_REPRESENTATION", hintPath, "Variant hint requires a known Figma representation.");
      if (typeof hint.componentKey !== "string" || !hint.componentKey.trim() || typeof hint.pathHint !== "string" || !hint.pathHint.trim() || hint.pathHint.split(" / ").some((p) => p.startsWith("@catalog:") || p.startsWith("@local:")))
        error("TARGET_VARIANT_HINT", hintPath, "Variant hint requires a library variant key and a reviewed reference address; local/catalog IDs are not source identity.");
      if (target.variantHints.filter((h) => h.representationId === hint.representationId && h.componentKey === hint.componentKey).length !== 1)
        error("TARGET_VARIANT_HINT_DUPLICATE", hintPath, "One target may have only one address per representation and library variant.");
    });
  });
  const portIds = /* @__PURE__ */ new Set();
  manual.controlPorts.forEach((port, index) => {
    const path = `/controlPorts/${index}`;
    if (!port.id.trim()) error("PORT_ID", `${path}/id`, "Control port id is required.");
    if (portIds.has(port.id)) error("PORT_DUPLICATE", `${path}/id`, `Duplicate control port: ${port.id}.`);
    portIds.add(port.id);
    if (!targetIds.has(port.targetId)) error("PORT_TARGET", `${path}/targetId`, `Unknown target: ${port.targetId}.`);
  });
  const ruleIds = /* @__PURE__ */ new Set();
  manual.rules.forEach((rule, index) => {
    const path = `/rules/${index}`;
    if (rule.ownership !== void 0 && !validRuleOwnership(rule.ownership, manual.component.componentId)) {
      error("RULE_OWNERSHIP", `${path}/ownership`, "Choose normative responsibility and a nonempty owner ID. A component rule must belong to this componentId.");
    } else if (manual.metadata.ruleOwnershipVersion === 1 && rule.status !== "deprecated" && !rule.ownership) {
      warning("RULE_OWNERSHIP_REQUIRED", `${path}/ownership`, "Normative ownership is not classified. It cannot be inferred from the rule ID or Product.");
    }
    if (!rule.id.trim()) error("RULE_ID", `${path}/id`, "Rule id is required.");
    if (ruleIds.has(rule.id)) error("RULE_DUPLICATE", `${path}/id`, `Duplicate rule id: ${rule.id}.`);
    ruleIds.add(rule.id);
    if (!targetIds.has(rule.targetId)) error("RULE_TARGET", `${path}/targetId`, `Unknown target: ${rule.targetId}.`);
    if (rule.targetScope && !["self", "self-and-descendants", "descendants"].includes(rule.targetScope)) {
      error("RULE_TARGET_SCOPE", `${path}/targetScope`, `Unknown target scope: ${rule.targetScope}.`);
    }
    if (rule.targetScope === "descendants" && rule.constraints.some((c) => !["propertyDomain", "propertyExclusion", "propertyForbidden", "tokenBinding", "styleBinding"].includes(c.type))) {
      error("RULE_DESCENDANT_CONSTRAINT", `${path}/constraints`, "Descendants-only scope currently supports property domains and effective-baseline comparisons, not root-level structural or dependency assertions.");
    }
    const baselineOnly = rule.permission !== "allowed" && (rule.constraints.length ? rule.constraints.every((constraint) => constraint.type === "propertyForbidden") : rule.permission === "forbidden");
    const openSlot = manual.rules.some((policy) => policy.status !== "deprecated" && ["allowed", "constrained"].includes(policy.permission) && policy.controlPaths.some((control) => control.kind === "slot-api" && control.target === policy.targetId && control.property?.trim() && control.contentOwnership === "external"));
    if (rule.boundaryPolicy !== void 0 && (rule.boundaryPolicy !== "component-owned@1" || !["self-and-descendants", "descendants"].includes(rule.targetScope || "self") || !baselineOnly || !manual.componentDependencies?.length && !openSlot && !manual.rules.some((r) => r.status !== "deprecated" && r.constraints.some((c) => c.type === "instanceReplacementDomain")))) {
      error("RULE_BOUNDARY_POLICY", `${path}/boundaryPolicy`, "Component-owned policy requires recursive baseline comparisons and explicit component dependencies or an explicitly open slot.");
    }
    if (rule.targetApplicability !== void 0 && (rule.targetApplicability !== "visible-target@1" || !allowsVisibleTargetPolicy(rule))) {
      error("RULE_TARGET_APPLICABILITY", `${path}/targetApplicability`, "Visible-target policy applies only to style baseline comparisons or deferred layout mappings, never presence or visibility requirements.");
    }
    if (!rule.capability.trim() && !rule.capabilitySet) error("RULE_CAPABILITY", `${path}/capability`, "Capability or capability set is required.");
    if (rule.capabilitySelection && !rule.capabilitySet) {
      error("RULE_CAPABILITY_SELECTION_SET", `${path}/capabilitySelection`, "Capability selection requires a capability set.");
    }
    if (rule.capabilitySet) {
      const registered = capabilitiesForSet(rule.capabilitySet);
      if (!registered.length) {
        error("RULE_CAPABILITY_SET", `${path}/capabilitySet`, `Unknown capability set: ${rule.capabilitySet}.`);
      }
      if (rule.capabilitySelection) {
        if (!rule.capabilitySelection.length) {
          error("RULE_CAPABILITY_SELECTION_EMPTY", `${path}/capabilitySelection`, "Select at least one capability from the set.");
        }
        const duplicates = rule.capabilitySelection.filter((value, valueIndex, values) => values.indexOf(value) !== valueIndex);
        if (duplicates.length) {
          error("RULE_CAPABILITY_SELECTION_DUPLICATE", `${path}/capabilitySelection`, "Capability selection contains duplicates.");
        }
        const unknown14 = rule.capabilitySelection.filter((value) => !registered.includes(value));
        if (unknown14.length) {
          error("RULE_CAPABILITY_SELECTION_UNKNOWN", `${path}/capabilitySelection`, `Capabilities are not part of ${rule.capabilitySet}: ${unknown14.join(", ")}.`);
        }
      }
    }
    if (rule.permission === "constrained" && !rule.constraints.length) {
      error("RULE_CONSTRAINT", `${path}/constraints`, "Constrained permission requires at least one constraint.");
    }
    if (rule.status === "reviewed" && !rule.rationale.trim()) {
      error("RULE_RATIONALE", `${path}/rationale`, "Reviewed rule requires rationale.");
    }
    if (!rule.owner.trim()) warning("RULE_OWNER", `${path}/owner`, "Rule owner is not assigned.");
    const route = rule.execution?.route || "auto";
    const predicateRoute = rule.status !== "deprecated" && (route === "predicate" || route === "auto" && rule.permission !== "allowed");
    const configuredError = configuredPropertyPolicyError(manual, rule);
    if (configuredError) error("RULE_PROPERTY_CONFORMANCE", `${path}/propertyConformance`, configuredError);
    if (rule.propertyApplicability !== void 0) {
      const gates = rule.propertyApplicability;
      const facts2 = baselineFactsForRule(rule);
      if (!gates || typeof gates !== "object" || Array.isArray(gates)) {
        error("RULE_PROPERTY_APPLICABILITY", `${path}/propertyApplicability`, "Property applicability must be an exact-property policy map.");
      } else for (const [fact2, policy] of Object.entries(gates)) {
        if (!Object.prototype.hasOwnProperty.call(PROPERTY_APPLICABILITY, fact2) || policy !== PROPERTY_APPLICABILITY[fact2] || !facts2.includes(fact2) || rule.permission === "allowed") {
          error("RULE_PROPERTY_APPLICABILITY", `${path}/propertyApplicability/${fact2}`, `Unsupported policy or no baseline comparison for ${fact2}.`);
        }
      }
    }
    const applicabilityKeys = /* @__PURE__ */ new Set(["variants", "modes", "platforms", "products", "channels", "context", "contextDomains", "scopeStatus", "conditionSubject", "activeDependency", "validationMode"]);
    const contextDomains = rule.applicability.contextDomains;
    if (contextDomains !== void 0 && (!contextDomains || typeof contextDomains !== "object" || Array.isArray(contextDomains))) {
      error("RULE_CONTEXT_DOMAIN", `${path}/applicability/contextDomains`, "Context domains must be an object.");
    }
    for (const [fact2, values] of Object.entries(contextDomains && typeof contextDomains === "object" && !Array.isArray(contextDomains) ? contextDomains : {})) {
      if (!manual.semanticApi.some((p) => fact2 === `semanticApi.${p.id}`) || !Array.isArray(values) || !values.length || values.some((v) => !["string", "number", "boolean"].includes(typeof v))) {
        error("RULE_CONTEXT_DOMAIN", `${path}/applicability/contextDomains`, "Context domains require a declared semantic API fact and nonempty scalar values.");
      }
    }
    if (rule.applicability.conditionSubject !== void 0 && !["target", "component-root"].includes(rule.applicability.conditionSubject)) {
      error("RULE_CONDITION_SUBJECT", `${path}/applicability/conditionSubject`, "Choose target or component-root for variant/context conditions.");
    }
    Object.keys(rule.applicability).forEach((key2) => {
      if (!applicabilityKeys.has(key2)) error("RULE_APPLICABILITY_FIELD", `${path}/applicability/${key2}`, `Unsupported applicability field: ${key2}.`);
    });
    for (const key2 of ["platforms", "products", "channels"]) {
      const values = rule.applicability[key2];
      if (values !== void 0 && (!Array.isArray(values) || values.some((value) => typeof value !== "string" || !value.trim()))) {
        error("RULE_SCOPE_VALUES", `${path}/applicability/${key2}`, "Scope must be an array of non-empty strings; [] means all.");
      }
    }
    if (rule.applicability.variants !== "all") {
      Object.entries(rule.applicability.variants).forEach(([property, values]) => {
        if (!property.trim() || !Array.isArray(values) || !values.length || values.some((value) => typeof value !== "string" || !value.trim())) {
          error("RULE_VARIANTS", `${path}/applicability/variants`, "Variant scope requires a property and at least one non-empty value.");
        }
      });
    }
    if (predicateRoute && rule.applicability.context && Object.keys(rule.applicability.context).some((key2) => !manual.semanticApi.some((property) => key2 === `semanticApi.${property.id}` || key2 === `expectedInput.${property.id}` && property.validationInput?.version === 1 && property.valueType === "boolean" && typeof rule.applicability.context[key2] === "boolean" && rule.targetScope !== "descendants" && rule.targetScope !== "self-and-descendants" && manual.targets.find((t) => t.id === rule.targetId)?.semanticRole === "root") && !replacementContextMapped(manual, key2, rule.applicability.context[key2]) && !manual.validationContext?.some((property) => key2 === `expectedInput.${property.id}` && (property.valueType === "boolean" && typeof rule.applicability.context[key2] === "boolean" || property.valueType === "enum" && property.domain?.includes(rule.applicability.context[key2])) && (!rule.targetScope || rule.targetScope === "self") && manual.targets.find((t) => t.id === rule.targetId)?.semanticRole === "root"))) {
      error("RULE_CONTEXT_UNMAPPED", `${path}/applicability/context`, "Context conditions have no explicit runtime fact binding. Keep this rule context-only until mapped; do not run it unconditionally.");
    }
    if (rule.applicability.validationMode !== void 0 && rule.applicability.validationMode !== "specification") {
      error("RULE_VALIDATION_MODE", `${path}/applicability/validationMode`, "Choose specification scope or omit it for intrinsic checks in both modes.");
    }
    if (predicateRoute && rule.applicability.scopeStatus === "needs-confirmation") {
      error("RULE_SCOPE_UNCONFIRMED", `${path}/applicability/scopeStatus`, "Confirm the rule scope before enabling a predicate check.");
    }
    if (rule.applicability.activeDependency !== void 0 && (!manual.componentDependencies?.some((d) => d.id === rule.applicability.activeDependency) || manual.targets.find((t) => t.id === rule.targetId)?.semanticRole !== "root" || (rule.targetScope || "self") !== "self")) {
      error("RULE_ACTIVE_DEPENDENCY", `${path}/applicability/activeDependency`, "Choose a declared dependency and a root/self rule.");
    }
    if (route === "delegated" && !rule.execution?.externalRuleIds?.length) {
      error("RULE_DELEGATION", `${path}/execution/externalRuleIds`, "Delegated rule requires externalRuleIds.");
    }
    if (route === "context-only" && !rule.execution?.missingFacts?.length) {
      error("RULE_CONTEXT_FACTS", `${path}/execution/missingFacts`, "Context-only rule requires missingFacts.");
    }
    if (Array.isArray(rule.applicability.modes)) {
      warning("RULE_MODES_LEGACY", `${path}/applicability/modes`, "Legacy mode list does not identify its variable collection. Re-select modes in the Editor.");
    } else if (rule.applicability.modes !== "all") {
      Object.entries(rule.applicability.modes).forEach(([collectionId, modeIds]) => {
        if (!collectionId.trim() || !modeIds.length) {
          error("RULE_MODES", `${path}/applicability/modes`, "Mode scope requires a collection id and at least one mode id.");
        }
      });
    }
    rule.controlPaths.forEach((controlPath, controlIndex) => {
      if (controlPath.ownerTargetId !== void 0) {
        const owners = manual.targets.filter((t) => t.id === controlPath.ownerTargetId);
        const slot = manual.targets.find((t) => t.id === controlPath.target);
        if (controlPath.kind !== "slot-api" || !controlPath.property?.trim() || controlPath.target !== rule.targetId || owners.length !== 1 || !slot || owners[0].id === slot.id || owners[0].resolution !== "resolved" || manual.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated").some((r) => {
          const ownerPath = owners[0].representationHints?.find((h) => h.representationId === r.id)?.pathHint || owners[0].pathHint;
          const slotPath = slot.representationHints?.find((h) => h.representationId === r.id)?.pathHint || slot.pathHint;
          return !ownerPath || !slotPath || !slotPath.startsWith(ownerPath + " / ") || slotPath.slice(ownerPath.length + 3).includes(" / ");
        })) error("CONTROL_SLOT_OWNER", `${path}/controlPaths/${controlIndex}`, "Slot owner must be a distinct resolved local target directly containing the slot in each representation.");
      }
      if (controlPath.contentOwnership !== void 0 && (controlPath.contentOwnership !== "external" || controlPath.kind !== "slot-api" || !controlPath.property?.trim() || controlPath.target !== rule.targetId || !["allowed", "constrained"].includes(rule.permission))) {
        error("CONTROL_SLOT_BOUNDARY", `${path}/controlPaths/${controlIndex}`, "External content requires an explicit slot-api target and native property anchor.");
      }
      if (controlPath.kind === "inherited-port" && (!controlPath.port || !portIds.has(controlPath.port))) {
        error("CONTROL_PORT", `${path}/controlPaths/${controlIndex}/port`, "Inherited control path must reference a local control port.");
      }
    });
    rule.constraints.forEach((constraint, constraintIndex) => {
      const constraintPath = `${path}/constraints/${constraintIndex}`;
      if (constraint.operator === "at-most-line-height" && (constraint.type !== "layoutConstraint" || constraint.fact !== "bounds.height" || !constraint.targetRole || !/^[\w-]+$/.test(constraint.targetRole) || manual.targets.filter((t) => t.semanticRole === constraint.targetRole && t.resolution === "resolved").length !== 1 || constraint.min !== void 0 || constraint.max !== void 0 || constraint.value !== void 0)) {
        error("CONSTRAINT_LINE_HEIGHT", constraintPath, "Use bounds.height and one resolved reference TEXT role, without fixed min/max/value.");
      }
      configurationErrors(manual, manual.rules.indexOf(rule), constraint).forEach((message) => error("CONSTRAINT_CONFIGURATION", constraintPath, message));
      mappingErrors(manual, manual.rules.indexOf(rule), constraint).forEach((message) => error("CONSTRAINT_MAPPING", constraintPath, message));
      for (const message of replacementErrors(manual, manual.rules.indexOf(rule), constraint)) error("CONSTRAINT_INSTANCE_REPLACEMENT", constraintPath, message);
      if (!KNOWN_CONSTRAINTS.has(constraint.type)) {
        error("CONSTRAINT_TYPE", `${constraintPath}/type`, `Unknown constraint type: ${constraint.type}.`);
      }
      if (constraint.type === "memberCollection") {
        if (rule.targetScope && rule.targetScope !== "self" || !isDeclaredRootTarget(manual.targets.find((t) => t.id === rule.targetId)) || rule.permission !== "constrained" || rule.capabilitySet) error("MEMBER_COLLECTION_SCOPE", constraintPath, "Member collections require a constrained self rule on a declared root target.");
        for (const message of memberCollectionErrors(constraint.collection, manual)) error("MEMBER_COLLECTION", constraintPath, message);
        if (Object.keys(constraint).some((k) => !["type", "collection"].includes(k))) error("MEMBER_COLLECTION_FIELDS", constraintPath, "Collection constraints cannot mix legacy quantity/property fields.");
      } else if (constraint.collection !== void 0) error("MEMBER_COLLECTION_TYPE", constraintPath, "Collection data requires memberCollection type.");
      if (constraint.type === "bindingConsistency") {
        if (!["fill-token", "text-style"].includes(constraint.bindingKind || "") || !["shared", "selected-variant"].includes(constraint.bindingReference || "") || constraint.bindingReference === "selected-variant" && constraint.bindingKind !== "text-style" || constraint.fact || rule.capabilitySet || rule.permission !== "constrained" || (rule.targetScope || "self") !== "self" || manual.targets.find((t) => t.id === rule.targetId)?.semanticRole !== "root" || constraint.visibleOnly !== true || !constraint.targetRoles?.length || new Set(constraint.targetRoles).size !== constraint.targetRoles.length || constraint.targetRoles.some((role) => manual.targets.filter((t) => t.semanticRole === role).length !== 1)) {
          error("CONSTRAINT_BINDING_CONSISTENCY", constraintPath, "Choose root/self, constrained permission, explicit unique TEXT roles, visibleOnly, binding kind and reference. Selected-variant supports Text Style only.");
        }
      }
      if (constraint.type === "styleBinding" && (typeof constraint.styleCatalog !== "string" || !constraint.styleCatalog.trim() || constraint.styleCatalog !== constraint.styleCatalog.trim() || /[/\\]/.test(constraint.styleCatalog) || constraint.fact || rule.capability !== "text.style" || rule.permission !== "constrained")) {
        error("CONSTRAINT_STYLE_BINDING", constraintPath, "Text Style binding requires text.style, constrained permission and an explicit catalog filename; no fact override.");
      }
      if (constraint.type === "transitionInvariant") {
        const t = constraint.transition, invalid = (message) => error("CONSTRAINT_TRANSITION", constraintPath, message);
        if (!t || t.evidenceProfile !== "same-instance-context@1") invalid("Declare same-instance-context@1 paired evidence.");
        if (!t || !manual.componentDependencies?.some((d) => d.id === t.dependencyId)) invalid("Transition state must reference a declared fixed dependency.");
        if (!t || typeof t.from !== "boolean" || typeof t.to !== "boolean" || t.from === t.to) invalid("Declare two different boolean dependency states.");
        if (!t || !Array.isArray(t.invariantFacts) || !t.invariantFacts.length || new Set(t.invariantFacts).size !== t.invariantFacts.length || t.invariantFacts.some((f) => !manual.semanticApi.some((p) => f === `semanticApi.${p.id}`))) invalid("Invariants must be unique explicit semantic API facts.");
        if (!t || typeof t.tolerance !== "number" || !Number.isFinite(t.tolerance) || t.tolerance < 0) invalid("Declare a finite nonnegative absolute tolerance.");
        if (!["bounds.width", "bounds.height"].includes(constraint.fact || "") || (rule.targetScope || "self") !== "self" || manual.targets.find((t2) => t2.id === rule.targetId)?.semanticRole !== "root" || rule.capabilitySet) invalid("Paired dimensions currently support only root/self width or height.");
        if (rule.applicability.activeDependency || Object.keys(rule.applicability.context || {}).length) invalid("Use the explicit transition state, not a second activation condition.");
      }
      if (constraint.type === "dependencyDomain") {
        const d = constraint.dependency;
        const invalid = (message) => error("CONSTRAINT_DEPENDENCY", `${constraintPath}/dependency`, message);
        if (!d || !Array.isArray(d.subjects) || !d.subjects.length) {
          invalid("Declare at least one dependency subject.");
          return;
        }
        if (!isDeclaredRootTarget(manual.targets.find((t) => t.id === rule.targetId)) || (rule.targetScope || "self") !== "self" || rule.capabilitySet) invalid("Dependency rules are rooted at the host; choose nested subjects in the constraint, not a capability group or descendant scope.");
        if (constraint.fact) invalid("Dependency field is explicit; do not also override fact.");
        if (!["componentSetKey", "catalog", "portName", "width", "height", "variantProperty", "changed"].includes(d.field)) invalid("Choose a supported dependency field.");
        if (d.field === "variantProperty" ? typeof d.property !== "string" || !d.property.trim() || d.property !== d.property.trim() : d.property !== void 0) invalid("Only variantProperty requires an exact nonempty VARIANT property name.");
        if (d.activePorts !== void 0 && (d.field !== "variantProperty" || !Array.isArray(d.activePorts) || !d.activePorts.length || d.activePorts.some((p) => !d.portNames?.includes(p)) || new Set(d.activePorts).size !== d.activePorts.length)) invalid("Variant property filters require unique active ports from the declared consumer domain.");
        if (!["require-domain", "allow-unchanged"].includes(d.baselinePolicy)) invalid("Choose an explicit baseline policy.");
        if (d.field === "changed" && (d.contractDependencyId || d.baselinePolicy !== "require-domain" || d.cases !== void 0 || d.sourceFact !== void 0 || d.catalogs !== void 0 || d.activePorts !== void 0 || d.tolerance !== void 0 || constraint.values?.length !== 1 || constraint.values[0] !== false)) {
          invalid("An icon identity lock requires the unchanged value false, an explicit swap port and independent baseline; mappings, fixed child bindings and exemptions are unsupported.");
        }
        if (d.subjectCondition && (typeof d.subjectCondition.property !== "string" || !d.subjectCondition.property.trim() || Object.keys(d.subjectCondition).some((k) => !["property", "propertyType", "values"].includes(k)) || !["VARIANT", "BOOLEAN", "TEXT", "INSTANCE_SWAP"].includes(d.subjectCondition.propertyType) || !Array.isArray(d.subjectCondition.values) || !d.subjectCondition.values.length || d.subjectCondition.values.some((v) => d.subjectCondition.propertyType === "BOOLEAN" ? typeof v !== "boolean" : typeof v !== "string"))) invalid("Subject condition requires an exact typed property and matching values. VARIANT is a string.");
        if (new Set(d.subjects.map((s) => JSON.stringify(s))).size !== d.subjects.length) invalid("Duplicate subjects.");
        for (const s of d.subjects) {
          if (manual.targets.filter((t) => t.semanticRole === s.targetRole && t.resolution === "resolved").length !== 1) invalid(`Unresolved semantic target: ${s.targetRole}.`);
          if (typeof s.relativePath !== "string" || s.relativePath.split(" / ").some((p) => p === ".." || p === "." || !p && s.relativePath !== "")) invalid("Use an exact relative instance path, without wildcards.");
        }
        if (d.contractDependencyId) {
          const declared = manual.componentDependencies?.find((p) => p.id === d.contractDependencyId);
          if (!declared || d.subjects.some((s) => declared.bindings.filter((b) => b.targetRole === s.targetRole && b.relativePath === s.relativePath).length !== 1)) invalid("Fixed nested subject must match one declared component dependency binding.");
          if (d.portNames?.length || d.catalogs || d.activePorts || d.baselinePolicy !== "require-domain" || ["catalog", "portName"].includes(d.field)) invalid("Fixed nested components do not use icon ports, catalog filters or unchanged exemptions.");
        }
        if (d.field !== "componentSetKey" && !d.contractDependencyId && (!d.portNames?.length || d.portNames.some((p) => typeof p !== "string" || !p.trim() || p.includes("#")) || new Set(d.portNames).size !== d.portNames.length)) invalid("Asset policy requires unique exact port names without Figma suffixes.");
        if (d.field === "componentSetKey" && (d.portNames?.length || d.baselinePolicy === "allow-unchanged")) invalid("Component set checks cannot skip unchanged wrappers or select icon ports.");
        const assetMetric = ["portName", "width", "height", "variantProperty"].includes(d.field);
        const numeric = ["width", "height"].includes(d.field);
        if (assetMetric && d.baselinePolicy !== "require-domain") invalid("Adapter and asset dimensions apply to unchanged assets too.");
        if (d.catalogs !== void 0 && (!assetMetric || !Array.isArray(d.catalogs) || !d.catalogs.length || d.catalogs.some((c) => typeof c !== "string" || !c.trim()) || new Set(d.catalogs).size !== d.catalogs.length)) invalid("Catalog filter needs unique nonempty catalog names on an asset metric.");
        if (d.tolerance !== void 0 && (!numeric || typeof d.tolerance !== "number" || !Number.isFinite(d.tolerance) || d.tolerance < 0)) invalid("Only asset dimensions support a finite nonnegative px tolerance.");
        const outputs = d.cases?.flatMap((c) => Array.isArray(c.values) ? c.values : []) || constraint.values || [];
        if (outputs.some((v) => d.field === "changed" ? typeof v !== "boolean" : numeric ? typeof v !== "number" || !Number.isFinite(v) || v <= 0 : typeof v !== "string" || !v.trim())) invalid("Use the declared dependency value type: boolean identity lock, positive dimensions or nonempty keys/catalogs/ports.");
        if (d.cases) {
          if (!d.sourceFact || !manual.semanticApi.some((p) => d.sourceFact === `semanticApi.${p.id}`)) invalid("Mapping needs an explicitly bound host semanticApi fact.");
          if (constraint.values?.length || !d.cases.length) invalid("Use a nonempty mapping or a fixed domain, not both.");
          for (const [caseIndex, c] of d.cases.entries()) {
            if (!Array.isArray(c.when) || !c.when.length || !Array.isArray(c.values) || !c.values.length) {
              invalid("Each mapping case needs input and output values.");
              continue;
            }
            if (c.context !== void 0 && (!c.context || typeof c.context !== "object" || Array.isArray(c.context) || !Object.keys(c.context).length)) {
              invalid("Case context must be a nonempty explicit semanticApi condition map.");
              continue;
            }
            for (const [fact2, value] of Object.entries(c.context || {})) {
              const p = manual.semanticApi.find((p2) => fact2 === `semanticApi.${p2.id}`);
              if (!p || fact2 === d.sourceFact || !(p.valueType === "boolean" && typeof value === "boolean" || p.valueType === "enum" && p.domain?.includes(value))) invalid("Case context needs declared boolean/enum semanticApi facts and valid values.");
            }
            if (new Set(c.when.map((v) => JSON.stringify(v))).size !== c.when.length) invalid("Mapping cases must not repeat input values.");
            for (const prior of d.cases.slice(0, caseIndex)) {
              const commonInput = Array.isArray(prior.when) && prior.when.some((v) => c.when.some((w) => JSON.stringify(w) === JSON.stringify(v)));
              const disjointContext = Object.entries(c.context || {}).some(([fact2, value]) => prior.context && fact2 in prior.context && JSON.stringify(prior.context[fact2]) !== JSON.stringify(value));
              if (commonInput && !disjointContext) invalid("Mapping cases must not overlap.");
            }
          }
        } else if (d.sourceFact || !constraint.values?.length) invalid("A fixed dependency domain requires allowed values.");
      }
      if (["propertyDomain", "propertyExclusion"].includes(constraint.type) && !constraint.values?.length) {
        error("CONSTRAINT_VALUES", `${constraintPath}/values`, "Property domain requires allowed values.");
      }
      if (constraint.baselineSource !== void 0 && (constraint.baselineSource !== "library-text" || constraint.type !== "propertyForbidden" || (constraint.fact || rule.capability) !== "text.characters")) {
        error("CONSTRAINT_BASELINE_SOURCE", `${constraintPath}/baselineSource`, "Library text reference supports only propertyForbidden text.characters.");
      }
      if (constraint.textNormalization !== void 0 && (constraint.textNormalization !== "trim" || constraint.baselineSource !== "library-text")) {
        error("CONSTRAINT_TEXT_NORMALIZATION", `${constraintPath}/textNormalization`, "Trim requires an explicit library-text reference.");
      }
      if (constraint.type === "quantity" && constraint.min === void 0 && constraint.max === void 0) {
        error("CONSTRAINT_RANGE", constraintPath, "Quantity requires min or max.");
      }
      if (constraint.contractDependencyId !== void 0) {
        if (constraint.type !== "quantity" || !manual.componentDependencies?.some((d) => d.id === constraint.contractDependencyId) || constraint.targetRole || constraint.targetRoles || constraint.fact || constraint.visibleOnly !== void 0 || (rule.targetScope || "self") !== "self" || manual.targets.find((t) => t.id === rule.targetId)?.semanticRole !== "root") {
          error("CONSTRAINT_DEPENDENCY_QUANTITY", constraintPath, "Dependency quantity counts visible proven children of one declared dependency; use root/self and no role/fact/visibility overrides.");
        }
        if ([constraint.min, constraint.max].some((v) => v !== void 0 && (!Number.isInteger(v) || v < 0)) || constraint.min !== void 0 && constraint.max !== void 0 && constraint.min > constraint.max) {
          error("CONSTRAINT_DEPENDENCY_RANGE", constraintPath, "Dependency counts require nonnegative integer bounds in ascending order.");
        }
      }
      if (constraint.targetRoles !== void 0) {
        if (!["quantity", "bindingConsistency", "propertyForbidden"].includes(constraint.type) || constraint.targetRole || !Array.isArray(constraint.targetRoles) || !constraint.targetRoles.length || new Set(constraint.targetRoles).size !== constraint.targetRoles.length || constraint.targetRoles.some((role) => !/^[a-zA-Z0-9_-]+$/.test(role) || manual.targets.filter((target) => target.semanticRole === role).length !== 1)) {
          error("CONSTRAINT_TARGET_ROLES", `${constraintPath}/targetRoles`, "Use a unique list of declared semantic roles; do not also set targetRole.");
        }
        if (constraint.visibleOnly !== true) error("CONSTRAINT_VISIBLE_ONLY", `${constraintPath}/visibleOnly`, "Explicit targetRoles requires visibleOnly=true.");
        if (constraint.type === "propertyForbidden" && ((rule.targetScope || "self") !== "self" || rule.boundaryPolicy || rule.targetApplicability || constraint.exceptConfiguration || constraint.baselineSource || rule.propertyApplicability || manual.targets.find((t) => t.id === rule.targetId)?.semanticRole !== "root")) {
          error("CONSTRAINT_TARGET_ROLES_SCOPE", constraintPath, "Explicit baseline targets require root/self and no recursive scope, boundary, visibility or configuration overrides.");
        }
      }
      if (constraint.visibleOnly !== void 0 && (typeof constraint.visibleOnly !== "boolean" || !["quantity", "bindingConsistency", "propertyForbidden"].includes(constraint.type) || !constraint.targetRoles?.length)) {
        error("CONSTRAINT_VISIBLE_ONLY", `${constraintPath}/visibleOnly`, "visibleOnly requires explicit targetRoles on quantity, bindingConsistency or propertyForbidden.");
      }
      if (constraint.type === "positionOrder" && !constraint.order?.length) {
        error("CONSTRAINT_ORDER", `${constraintPath}/order`, "Position/order requires semantic roles.");
      }
      if (constraint.orderScope !== void 0 && (constraint.type !== "positionOrder" || !["visible", "structural"].includes(constraint.orderScope))) {
        error("CONSTRAINT_ORDER_SCOPE", `${constraintPath}/orderScope`, "Order scope requires positionOrder and visible or structural.");
      }
      if (constraint.type === "relationship" && (!constraint.relation || !constraint.targetRole)) {
        error("CONSTRAINT_RELATION", constraintPath, "Relationship requires relation and target role.");
      }
      if (constraint.type === "tokenBinding" && !constraint.tokenIds?.length && !constraint.bindingRequired) {
        error("CONSTRAINT_TOKEN", constraintPath, "Token binding requires token ids or bindingRequired.");
      }
    });
  });
  return issues.sort((left, right) => left.level.localeCompare(right.level) || left.path.localeCompare(right.path) || left.code.localeCompare(right.code));
}

// ../Apollo/packages/component-contract-core/src/context-catalog.ts
var PRODUCT_SCOPE_CATALOG = [
  { value: "ab", label: "\u0410\u043B\u044C\u0444\u0430-\u0411\u0438\u0437\u043D\u0435\u0441", description: "Product manifest: products/ab" },
  { value: "abm", label: "\u0410\u043B\u044C\u0444\u0430-\u0411\u0438\u0437\u043D\u0435\u0441 \u041C\u043E\u0431\u0430\u0439\u043B", description: "Product id: abm" },
  { value: "am", label: "\u0410\u043B\u044C\u0444\u0430-\u041C\u043E\u0431\u0430\u0439\u043B", description: "Product id: am" },
  { value: "ao", label: "\u0410\u043B\u044C\u0444\u0430-\u041E\u043D\u043B\u0430\u0439\u043D", description: "Product id: ao" },
  { value: "site", label: "\u0421\u0430\u0439\u0442", description: "Product id: site" }
];

// ../Apollo/packages/component-contract-core/src/text-binding-identity.ts
var record19 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var unknown6 = (n, fact2) => (n.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + ".") || p.startsWith(fact2 + "."));
var styleKey = (id) => typeof id === "string" ? (/^S:([a-f0-9]{40})(?:,[^\s]+)?$/i.exec(id)?.[1] || (/^[a-f0-9]{40}$/i.test(id) ? id : void 0))?.toLowerCase() : void 0;
var variableKey = (id) => typeof id === "string" ? (/^VariableID:([a-f0-9]{40})(?:\/[^\s]+)?$/i.exec(id)?.[1] || (/^[a-f0-9]{40}$/i.test(id) ? id : void 0))?.toLowerCase() : void 0;
var bindingConsistencyKey = (c) => `b_${stableHash({ kind: c.bindingKind, reference: c.bindingReference, roles: c.targetRoles }).slice(0, 16)}`;
function hasTextBindingReference(manual, evidence, c) {
  return Boolean(evidence?.variants.length && evidence.variants.every((v) => {
    const reps = manual.representations.filter((r) => matchesCaptureRepresentation(r, v.componentKey, v.componentSetKey));
    const rows = evidence.textBindings?.filter((b) => b.componentKey === v.componentKey && b.componentSetKey === v.componentSetKey) || [];
    if (reps.length !== 1 || rows.length !== 1) return false;
    const keys = (c.targetRoles || []).map((role) => {
      const targets = manual.targets.filter((t2) => t2.semanticRole === role), t = targets[0];
      if (targets.length !== 1) return;
      const hints = t.representationHints?.filter((h) => h.representationId === reps[0].id) || [];
      if (hints.length > 1) return;
      const path = hints[0]?.pathHint || t.pathHint;
      return path && styleKey(rows[0].styleKeysByPath?.[path.split(" / ").slice(1).join(" / ")]);
    });
    return keys.length > 0 && keys.every(Boolean) && new Set(keys).size === 1;
  }));
}
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
      const key2 = await resolveKey(id);
      if (key2) evidence.keysById[id] = key2;
    } catch {
    }
  }));
  return evidence;
}
function ranges(node, evidence) {
  if (evidence.version !== 1 || unknown6(node, "text.characters") || typeof node.text?.characters !== "string" || !Array.isArray(evidence.segments)) return;
  let end = 0;
  const valid = evidence.segments.every((s) => s && Number.isInteger(s.start) && Number.isInteger(s.end) && s.start === end && s.end > s.start && s.end <= node.text.characters.length && (end = s.end));
  return valid && end === node.text.characters.length ? evidence.segments : void 0;
}
function materializeTextBindingIdentities(snapshot, contract) {
  if (contract.runtimePolicy.textBindingIdentityFactsVersion !== 1) return;
  for (const node of snapshot.nodes) {
    delete node.textBindingIdentityV1;
    delete node.selectedTextBindingV1;
    node.unknownFacts = (node.unknownFacts || []).filter((p) => !["textBindingIdentityV1", "selectedTextBindingV1"].some((base) => p === base || p.startsWith(base + ".")));
    if (node.type !== "TEXT") continue;
    const facts2 = {};
    const missing = (kind) => node.unknownFacts.push(`textBindingIdentityV1.${kind}`);
    const fill = record19(node.textFillEvidenceV1), style = record19(node.textStyleEvidenceV1);
    const fillRanges = ranges(node, fill), styleRanges = ranges(node, style);
    const paints = node.textFillEvidenceV1 === void 0 ? [record19(node.appearance).fill] : fillRanges ? fillRanges.length ? fillRanges.map((s) => s.paints) : [fill.emptyPaints] : void 0;
    let unavailable = !paints || unknown6(node, "appearance.fill") || unknown6(node, "textFillEvidenceV1");
    if (fillRanges && !unknown6(node, "textFillEvidenceV1")) unavailable = false;
    let invalid = false;
    const keys = [];
    if (paints) for (const list of paints) {
      if (!Array.isArray(list)) {
        unavailable = true;
        continue;
      }
      let active = 0;
      for (const raw of list) {
        const p = record19(raw);
        if (p.visible === false || p.opacity === 0) continue;
        active++;
        if (p.visible !== true || typeof p.opacity !== "number" || !Number.isFinite(p.opacity)) {
          unavailable = true;
          continue;
        }
        const ids2 = p.type === "SOLID" ? [p.tokenId] : /^GRADIENT_/.test(p.type) && Array.isArray(p.gradientStops) && p.gradientStops.length ? p.gradientStops.filter((s) => s.color?.a !== 0).map((s) => s.tokenId) : [];
        if (!ids2.length) {
          invalid = true;
          continue;
        }
        for (const id of ids2) {
          if (id === void 0 || id === null || id === "") {
            invalid = true;
            continue;
          }
          const key2 = variableKey(id) || variableKey(record19(fill.keysById)[id]);
          if (key2) keys.push(key2);
          else unavailable = true;
        }
      }
      if (!active) invalid = true;
    }
    const unique = [...new Set(keys)].sort();
    if (unique.length > 1) invalid = true;
    if (!unavailable || invalid) facts2.fill = { valid: !invalid && !unavailable && unique.length === 1, keys: unique };
    else missing("fill");
    const ids = node.textStyleEvidenceV1 === void 0 ? [record19(record19(node.appearance).typography).styleId] : styleRanges ? styleRanges.length ? styleRanges.map((s) => s.styleId) : [record19(record19(node.appearance).typography).styleId] : void 0;
    let styleUnknown = !ids || unknown6(node, "textStyleEvidenceV1");
    if (node.textStyleEvidenceV1 === void 0 && unknown6(node, "appearance.typography")) styleUnknown = true;
    let detached = false;
    const styles = [];
    if (ids) for (const id of ids) {
      if (id === "") {
        detached = true;
        continue;
      }
      const key2 = styleKey(id) || styleKey(record19(style.keysById)[id]);
      if (key2) styles.push(key2);
      else styleUnknown = true;
    }
    const uniqueStyles = [...new Set(styles)].sort();
    if (uniqueStyles.length > 1) detached = true;
    if (!styleUnknown || detached) facts2.style = { valid: !detached && !styleUnknown && uniqueStyles.length === 1, keys: uniqueStyles };
    else missing("style");
    node.textBindingIdentityV1 = facts2;
  }
  const roots = snapshot.nodes.filter((n) => snapshot.selection.includes(String(n.id)));
  if (roots.length !== 1) return;
  const root2 = roots[0], expected = {};
  root2.selectedTextBindingV1 = expected;
  const reps = contract.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated" && matchesCaptureRepresentation(r, snapshot.source?.componentKey || "", snapshot.source?.componentSetKey || ""));
  const variants = (contract.facts.variantEvidence?.textBindings || []).filter((v) => v.componentKey === snapshot.source?.componentKey && v.componentSetKey === (snapshot.source?.componentSetKey || snapshot.source?.componentKey));
  for (const c of contract.facts.textBindingComparisons || []) {
    if (c.type !== "bindingConsistency" || c.bindingReference !== "selected-variant") continue;
    const path = `selectedTextBindingV1.${bindingConsistencyKey(c)}`;
    const keys = [];
    let valid = reps.length === 1 && variants.length === 1 && ["verified", "partial"].includes(String(record19(root2.variantAvailability).status));
    for (const role of c.targetRoles || []) {
      const targets = contract.facts.targets.filter((t) => t.semanticRole === role), target = targets[0];
      const hints = target?.representationHints?.filter((h) => h.representationId === reps[0]?.id) || [];
      const targetPath = hints.length === 1 ? hints[0].pathHint : target?.pathHint;
      const key2 = targetPath && styleKey(variants[0]?.styleKeysByPath?.[targetPath.split(" / ").slice(1).join(" / ")]);
      if (targets.length !== 1 || hints.length > 1 || !key2) valid = false;
      else keys.push(key2);
    }
    if (valid && keys.length && new Set(keys).size === 1) expected[bindingConsistencyKey(c)] = [keys[0]];
    else root2.unknownFacts.push(path);
  }
}

// ../Apollo/packages/component-contract-core/src/compiler.ts
function roleFilter(role, rootAliases = /* @__PURE__ */ new Set()) {
  return {
    predicate: "equals",
    actual: { fact: rootAliases.has(role) ? `rootTargetAliasesV1.${role}` : "semantic.role" },
    expected: { literal: rootAliases.has(role) ? true : role }
  };
}
function rolesFilter(roles, rootAliases) {
  if (!roles.some((role) => rootAliases.has(role))) return {
    predicate: "one-of",
    actual: { fact: "semantic.role" },
    expected: { literal: roles }
  };
  return { predicate: "any", args: roles.map((role) => roleFilter(role, rootAliases)) };
}
function targetSelector(target, targetScope, baselineApplicabilityFact, rootAliases = /* @__PURE__ */ new Set()) {
  const ownTarget = roleFilter(target.semanticRole, rootAliases);
  const targetFilter = targetScope === "self-and-descendants" ? [{
    predicate: "any",
    args: [
      ownTarget,
      {
        predicate: "ancestor",
        actual: { fact: "id" },
        expected: { fact: `relations.${target.semanticRole}` }
      }
    ]
  }] : targetScope === "descendants" ? [{ predicate: "ancestor", actual: { fact: "id" }, expected: { fact: `relations.${target.semanticRole}` } }] : [ownTarget];
  const where = baselineApplicabilityFact ? [
    ...targetFilter,
    {
      predicate: "fact-present",
      actual: { fact: baselineApplicabilityFact }
    }
  ] : targetFilter;
  return {
    from: "selection-root",
    traverse: "self-and-descendants",
    where
  };
}
function targetQuery(role, project, rootAliases = /* @__PURE__ */ new Set()) {
  const query = {
    from: "selection-root",
    traverse: "self-and-descendants",
    where: [roleFilter(role, rootAliases)]
  };
  if (project) query.project = { fact: project };
  return { query };
}
function availabilityEquals(fact2, value) {
  return { predicate: "equals", actual: { fact: fact2 }, expected: { literal: value }, missingPolicy: "unknown" };
}
function applyVariantTargetAvailability(select, conditions, target) {
  const present = `variantAvailability.targets.${target.semanticRole}.present`;
  conditions.push(availabilityEquals(present, true));
  select.where = [{ predicate: "any", args: [
    { predicate: "all", args: select.where },
    { predicate: "all", args: [availabilityEquals("variantAvailability.isRoot", true), availabilityEquals(present, false)] }
  ] }];
}
function propertyAvailabilityCondition(fact2) {
  if (fact2.startsWith("semanticApi.")) return availabilityEquals(`variantAvailability.properties.${fact2.slice("semanticApi.".length)}`, true);
  if (fact2.startsWith("component.properties.")) return availabilityEquals(`variantAvailability.componentProperties.${propertyAvailabilityKey(fact2.slice("component.properties.".length))}`, true);
  return void 0;
}
function applyExplicitRuleScope(select, conditions, source, target) {
  if (source.boundaryPolicy === "component-owned@1") conditions.push(availabilityEquals("ruleScopeV1.local", true));
  if (source.targetApplicability === "visible-target@1") {
    const fact2 = `ruleScopeV1.targets.${target.semanticRole}.visible`;
    conditions.push(availabilityEquals(fact2, true));
    select.where = [{ predicate: "any", args: [
      { predicate: "all", args: select.where || [] },
      { predicate: "all", args: [availabilityEquals("ruleScopeV1.isRoot", true), availabilityEquals(fact2, false)] }
    ] }];
  }
}
function availabilityFactFor(constraint, capability) {
  return constraint.type === "relationship" ? "" : constraint.fact || factForCapability(capability);
}
function constraintsFor(rule) {
  return rule.permission === "forbidden" && !rule.constraints.length ? [{ type: "propertyForbidden" }] : rule.constraints;
}
function capabilitiesFor(rule) {
  const registered = rule.capabilitySet ? capabilitiesForSet(rule.capabilitySet) : [rule.capability];
  return rule.capabilitySet && rule.capabilitySelection ? registered.filter((capability) => rule.capabilitySelection.includes(capability)) : registered;
}
function conditionFor(rule) {
  const conditions = [];
  if (rule.applicability.validationMode === "specification") conditions.push({
    predicate: "equals",
    actual: { fact: "validationScopeV1.mode" },
    expected: { literal: "specification" },
    missingPolicy: "unknown"
  });
  if (rule.applicability.activeDependency) conditions.push(availabilityEquals(`dependencyCompositionV1.${rule.applicability.activeDependency}.active`, true));
  const prefix = rule.applicability.conditionSubject === "component-root" ? "host." : "";
  for (const [fact2, value] of Object.entries(rule.applicability.context || {})) {
    conditions.push({ predicate: "equals", actual: { fact: `${prefix}${fact2}` }, expected: { literal: value } });
  }
  for (const [fact2, values] of Object.entries(rule.applicability.contextDomains || {})) {
    conditions.push({ predicate: "one-of", actual: { fact: `${prefix}${fact2}` }, expected: { literal: values }, missingPolicy: "unknown" });
  }
  if (rule.applicability.variants !== "all") {
    for (const [property, values] of Object.entries(rule.applicability.variants)) {
      conditions.push({
        predicate: "one-of",
        actual: { fact: `${prefix}component.properties.${property}` },
        expected: { literal: values },
        missingPolicy: "unknown"
      });
    }
  }
  if (rule.applicability.modes !== "all") {
    if (Array.isArray(rule.applicability.modes)) {
      if (rule.applicability.modes.length) {
        conditions.push({
          predicate: "one-of",
          actual: { fact: "page.context.modes.active" },
          expected: { literal: rule.applicability.modes },
          missingPolicy: "unknown"
        });
      }
    } else {
      for (const [collectionId, modeIds] of Object.entries(rule.applicability.modes)) {
        if (!modeIds.length) continue;
        conditions.push({
          predicate: "one-of",
          actual: { fact: `page.context.modes.${collectionId}` },
          expected: { literal: modeIds },
          missingPolicy: "unknown"
        });
      }
    }
  }
  if (!conditions.length) return void 0;
  const expression = conditions.length === 1 ? conditions[0] : { predicate: "all", args: conditions };
  return rule.propertyConformance === CONFIGURED_NATIVE_PROPERTY_POLICY ? configuredNativeExpression(expression) : expression;
}
function scopeFor(rule) {
  return {
    platform: rule.applicability.platforms.length ? rule.applicability.platforms : void 0,
    product: rule.applicability.products?.length ? rule.applicability.products : void 0,
    channel: rule.applicability.channels?.length ? rule.applicability.channels : void 0
  };
}
function applyValidationModeFallback(select, source) {
  if (source.applicability.validationMode !== "specification" || select.traverse === "self") return;
  select.where = [{ predicate: "any", args: [
    { predicate: "all", args: select.where || [] },
    { predicate: "all", args: [
      availabilityEquals("validationScopeV1.isRoot", true),
      { predicate: "equals", actual: { fact: "validationScopeV1.mode" }, expected: { literal: "component-audit" } }
    ] }
  ] }];
}
function compileApplicabilityProbe(manual, source, variantAvailability2 = false, rootTargetAliases = false) {
  const rootAliases = rootTargetAliases ? declaredRootAliasRoles(manual.targets) : /* @__PURE__ */ new Set();
  const unsupported = [];
  const list = (value, path) => {
    if (value === void 0) return [];
    if (Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim())) return value;
    unsupported.push(path);
    return [];
  };
  const applicability2 = {
    variants: "all",
    modes: "all",
    platforms: list(source.applicability.platforms, "platforms"),
    products: list(source.applicability.products, "products"),
    channels: list(source.applicability.channels, "channels"),
    context: {}
  };
  if (applicability2.products?.some((product) => !PRODUCT_SCOPE_CATALOG.some((choice) => choice.value === product))) {
    unsupported.push(`products:unmapped:${applicability2.products.join(",")}`);
    applicability2.products = [];
  }
  for (const key2 of Object.keys(source.applicability)) {
    if (!["variants", "modes", "platforms", "products", "channels", "context", "contextDomains", "scopeStatus", "conditionSubject", "activeDependency", "validationMode"].includes(key2)) unsupported.push(key2);
  }
  if (source.applicability.validationMode === "specification") applicability2.validationMode = "specification";
  else if (source.applicability.validationMode !== void 0) unsupported.push("validationMode");
  if (source.applicability.activeDependency !== void 0) {
    if (manual.componentDependencies?.some((d) => d.id === source.applicability.activeDependency)) applicability2.activeDependency = source.applicability.activeDependency;
    else unsupported.push("activeDependency");
  }
  if (source.applicability.conditionSubject === "component-root" || source.applicability.conditionSubject === "target") {
    applicability2.conditionSubject = source.applicability.conditionSubject;
  } else if (source.applicability.conditionSubject !== void 0) unsupported.push("conditionSubject");
  const domains = (value, path) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      unsupported.push(path);
      return {};
    }
    const result = {};
    for (const [key2, input] of Object.entries(value)) {
      const values = list(input, `${path}.${key2}`);
      if (key2.trim() && values.length) result[key2] = values;
      else unsupported.push(`${path}.${key2}`);
    }
    return result;
  };
  if (source.applicability.variants !== "all") applicability2.variants = domains(source.applicability.variants, "variants");
  if (source.applicability.modes !== "all") applicability2.modes = Array.isArray(source.applicability.modes) ? list(source.applicability.modes, "modes") : domains(source.applicability.modes, "modes");
  const context = source.applicability.context;
  if (context !== void 0 && (!context || typeof context !== "object" || Array.isArray(context))) unsupported.push("context");
  for (const [fact2, value] of Object.entries(context && typeof context === "object" && !Array.isArray(context) ? context : {})) {
    if (manual.semanticApi.some((property) => fact2 === `semanticApi.${property.id}` || fact2 === `expectedInput.${property.id}` && property.validationInput?.version === 1)) applicability2.context[fact2] = value;
    else unsupported.push(`context.${fact2}`);
  }
  if (source.applicability.scopeStatus === "needs-confirmation") unsupported.push("scopeStatus:needs-confirmation");
  if (source.applicability.contextDomains) {
    applicability2.contextDomains = {};
    for (const [fact2, values] of Object.entries(source.applicability.contextDomains)) {
      if (manual.semanticApi.some((p) => fact2 === `semanticApi.${p.id}`) && Array.isArray(values) && values.length && values.every((v) => ["string", "number", "boolean"].includes(typeof v))) applicability2.contextDomains[fact2] = values;
      else unsupported.push(`contextDomains.${fact2}`);
    }
  }
  const target = manual.targets.find((entry) => entry.id === source.targetId);
  const invalidTargetScope = source.targetScope && !["self", "self-and-descendants", "descendants"].includes(source.targetScope);
  const targetUncertain = !target || target.resolution !== "resolved" || Boolean(invalidTargetScope);
  if (targetUncertain) unsupported.push("target");
  if (invalidTargetScope) unsupported.push("targetScope");
  const safe = { ...source, applicability: applicability2 };
  let select = target ? targetSelector(target, invalidTargetScope ? "self" : source.targetScope || "self", void 0, rootAliases) : { from: "selection-root", traverse: "self" };
  let when = targetUncertain ? void 0 : conditionFor(safe);
  if (targetUncertain && applicability2.validationMode === "specification") when = conditionFor({ ...safe, applicability: { variants: "all", modes: "all", platforms: [], validationMode: "specification" } });
  if (source.propertyApplicability) unsupported.push("propertyApplicability:per-assertion");
  if (source.propertyConformance !== void 0) unsupported.push("propertyConformance:per-assertion");
  if (variantAvailability2 && target && !targetUncertain) {
    const assertions = capabilitiesFor(source).flatMap((capability) => constraintsFor(source).map((constraint) => ({
      ...assertionFor(constraint, target, capability, rootAliases),
      fact: availabilityFactFor(constraint, capability)
    })));
    if (assertions.some((assertion) => assertion.selectRoot)) {
      select = { from: "selection-root", traverse: "self" };
    } else if (assertions.length && assertions.every((assertion) => assertion.expression)) {
      const conditions = when ? [when] : [];
      applyVariantTargetAvailability(select, conditions, target);
      const propertyConditions = assertions.map((assertion) => propertyAvailabilityCondition(assertion.fact));
      if (propertyConditions.every(Boolean)) conditions.push(propertyConditions.length === 1 ? propertyConditions[0] : { predicate: "any", args: propertyConditions });
      when = { predicate: "all", args: conditions };
    }
  }
  if (source.targetApplicability && (source.targetApplicability !== "visible-target@1" || !allowsVisibleTargetPolicy(source))) {
    unsupported.push("targetApplicability");
  } else if (target && !targetUncertain && source.targetApplicability === "visible-target@1") {
    const conditions = when ? [when] : [];
    applyExplicitRuleScope(select, conditions, safe, target);
    when = { predicate: "all", args: conditions };
  }
  applyValidationModeFallback(select, safe);
  const rule = {
    schemaVersion: "apollo.rule-ir.v1",
    ruleId: `editor:applicability:${source.id}`,
    revision: manual.metadata.revision,
    source: { path: "contract.manual.json", anchor: source.id },
    authority: { status: "active", provenance: "editor-coverage-probe" },
    effect: "require",
    scope: scopeFor(safe),
    select,
    when,
    assert: { predicate: "equals", actual: { literal: true }, expected: { literal: true } },
    severity: "info",
    unknownPolicy: "human-review"
  };
  const rootWhen = !unsupported.length && !targetUncertain && applicability2.conditionSubject === "component-root" ? conditionFor({ ...safe, applicability: {
    variants: applicability2.variants,
    context: applicability2.context,
    contextDomains: applicability2.contextDomains,
    modes: "all",
    platforms: [],
    conditionSubject: "target"
  } }) : void 0;
  const rootConditionRule = rootWhen ? {
    ...rule,
    ruleId: `${rule.ruleId}:component-root-condition`,
    select: { from: "selection-root", traverse: "self" },
    when: rootWhen
  } : void 0;
  return { rule, unsupported: uniqueSorted(unsupported), rootConditionRule };
}
function assertionFor(constraint, target, capability, rootAliases = /* @__PURE__ */ new Set()) {
  const fact2 = constraint.fact || factForCapability(capability);
  if (constraint.type === "bindingConsistency") {
    const field = constraint.bindingKind === "fill-token" ? "fill" : "style";
    const query = (suffix) => ({ query: { from: "selection-root", traverse: "self-and-descendants", where: [
      rolesFilter(constraint.targetRoles || [], rootAliases),
      { predicate: "equals", actual: { fact: "visibility.effective" }, expected: { literal: true } }
    ], ...suffix ? { project: { fact: `textBindingIdentityV1.${field}.${suffix}` } } : {} } });
    return { selectRoot: true, expression: { predicate: "all", args: [
      { predicate: "count-between", actual: query(), lower: { literal: 1 }, upper: { literal: 9999 }, bounds: "inclusive", missingPolicy: "unknown" },
      { predicate: "all-equal", actual: query("valid"), expected: { literal: true }, missingPolicy: "unknown" },
      {
        predicate: "all-equal",
        actual: query("keys"),
        missingPolicy: "unknown",
        ...constraint.bindingReference === "selected-variant" ? { expected: { fact: `selectedTextBindingV1.${bindingConsistencyKey(constraint)}` } } : {}
      }
    ] } };
  }
  if (constraint.type === "styleBinding") return {
    selectRoot: false,
    expression: {
      predicate: "binding-satisfies",
      actual: { fact: textStyleBindingFact(constraint.styleCatalog || "") },
      expected: { literal: { required: true, library: true } },
      missingPolicy: "unknown"
    }
  };
  if (constraint.type === "propertyDomain" || constraint.type === "propertyExclusion") {
    return {
      selectRoot: false,
      expression: constraint.type === "propertyExclusion" ? {
        predicate: "not",
        args: [{ predicate: "one-of", actual: { fact: fact2 }, expected: { literal: constraint.values || [] }, missingPolicy: "unknown" }]
      } : {
        predicate: "one-of",
        actual: { fact: fact2 },
        expected: { literal: constraint.values || [] },
        ...fact2.startsWith("variable.modes.") || fact2.startsWith("nativeTargetPropertiesV1.") ? { missingPolicy: "unknown" } : {}
      }
    };
  }
  if (constraint.type === "presence") {
    const expected = constraint.expected !== false;
    return {
      selectRoot: true,
      expression: {
        predicate: "count-between",
        actual: targetQuery(target.semanticRole, void 0, rootAliases),
        lower: { literal: expected ? 1 : 0 },
        upper: { literal: expected ? 9999 : 0 },
        bounds: "inclusive"
      }
    };
  }
  if (constraint.type === "propertyForbidden") {
    const baselineFact = constraint.baselineSource === "library-text" ? constraint.textNormalization === "trim" ? "libraryTextV1.trimmedCharacters" : "libraryTextV1.characters" : `baseline.effective.${fact2}`;
    return {
      selectRoot: false,
      // These assertions still apply when capture cannot supply a reference.
      // Let the interpreter report unknown instead of an empty selector.
      baselineApplicabilityFact: constraint.baselineSource === "library-text" ? "text.characters" : /^(bounds\.(width|height)|appearance\.(effectDetailsV1|blendMode)|layout\.(gridStyleId|clipsContent))$/.test(fact2) ? void 0 : /^appearance\.(fill|stroke)$/.test(fact2) ? `paintEvidenceV1.${fact2.split(".")[1]}` : baselineFact,
      expression: {
        predicate: "matches-effective-baseline",
        actual: { fact: constraint.textNormalization === "trim" ? "libraryTextV1.actualTrimmedCharacters" : fact2 },
        expected: { fact: baselineFact },
        ...constraint.baselineSource === "library-text" || /^(bounds\.(width|height)|appearance\.(fill|stroke|effectDetailsV1|blendMode)|layout\.(gridStyleId|clipsContent))$/.test(fact2) ? { missingPolicy: "unknown" } : {}
      }
    };
  }
  if (constraint.type === "quantity") {
    if (constraint.contractDependencyId) return { selectRoot: true, expression: {
      predicate: "count-between",
      actual: { fact: `dependencyCompositionV1.${constraint.contractDependencyId}.visibleInstances` },
      lower: { literal: constraint.min ?? 0 },
      upper: { literal: constraint.max ?? 9999 },
      bounds: "inclusive",
      missingPolicy: "unknown"
    } };
    const roles = constraint.targetRoles;
    const query = roles ? {
      from: "selection-root",
      traverse: "self-and-descendants",
      where: [
        rolesFilter(roles, rootAliases),
        ...constraint.visibleOnly ? [{ predicate: "equals", actual: { fact: "visibility.effective" }, expected: { literal: true } }] : []
      ]
    } : void 0;
    return {
      selectRoot: true,
      expression: {
        predicate: "count-between",
        actual: query ? { query } : targetQuery(constraint.targetRole || target.semanticRole, void 0, rootAliases),
        lower: { literal: constraint.min ?? 0 },
        upper: { literal: constraint.max ?? 9999 },
        bounds: "inclusive"
      }
    };
  }
  if (constraint.type === "positionOrder") {
    return {
      selectRoot: true,
      expression: {
        predicate: "sequence-equals",
        actual: constraint.orderScope === "structural" ? { fact: "structuralOrderV1.directChildRoles" } : {
          query: {
            from: "selection-root",
            traverse: "direct-children",
            project: { fact: "semantic.role" }
          }
        },
        expected: { literal: constraint.order || [] }
      }
    };
  }
  if (constraint.type === "relationship") {
    return {
      selectRoot: false,
      expression: {
        predicate: constraint.relation,
        actual: { fact: "id" },
        expected: { fact: `relations.${constraint.targetRole}` }
      }
    };
  }
  if (constraint.type === "tokenBinding") {
    const expected = {};
    if (constraint.bindingRequired !== void 0) expected.required = constraint.bindingRequired;
    if (constraint.tokenIds?.length) expected.tokenIds = constraint.tokenIds;
    return {
      selectRoot: false,
      expression: {
        predicate: "binding-satisfies",
        actual: { fact: constraint.fact || `variable.bindings.${fact2.replace(/\./g, "_")}` },
        expected: { literal: expected }
      }
    };
  }
  if (constraint.type === "layoutConstraint") {
    if (constraint.operator === "at-most-line-height") return { selectRoot: false, expression: {
      predicate: "compare",
      operator: "lte",
      actual: { fact: fact2 },
      expected: { fact: `lineHeightReferenceV1.${constraint.targetRole}` },
      missingPolicy: "unknown"
    } };
    if (constraint.operator === "between" || constraint.min !== void 0 || constraint.max !== void 0) {
      return {
        selectRoot: false,
        expression: {
          predicate: "between",
          actual: { fact: fact2 },
          lower: { literal: constraint.min ?? Number.MIN_SAFE_INTEGER },
          upper: { literal: constraint.max ?? Number.MAX_SAFE_INTEGER },
          bounds: "inclusive"
        }
      };
    }
    return {
      selectRoot: false,
      expression: {
        predicate: "equals",
        actual: { fact: fact2 },
        expected: { literal: constraint.value }
      }
    };
  }
  return { selectRoot: false, reason: `Constraint ${constraint.type} is not compilable.` };
}
function sourceCapabilities(rule) {
  const selectors = ["selection-root", String(rule.select.traverse || "self")];
  const serialized = JSON.stringify(rule);
  const facts2 = Array.from(serialized.matchAll(/"fact":"([^"]+)"/g)).map((match) => match[1]);
  const operators = Array.from(serialized.matchAll(/"predicate":"([^"]+)"/g)).map((match) => match[1]);
  return {
    selectors: uniqueSorted(selectors),
    facts: uniqueSorted(facts2),
    operators: uniqueSorted(operators),
    remediations: rule.remediation ? [String(rule.remediation.kind || "")].filter(Boolean) : []
  };
}
function compileManualSource(manual, variantEvidence, dependencyContracts = []) {
  const identityErrors = declaredTargetIdentityErrors({ version: manual.metadata.declaredTargetIdentityVersion, configurationVersion: manual.metadata.declaredTargetConfigurationVersion, targets: manual.targets, representations: manual.representations });
  if (manual.metadata.declaredTargetIdentityVersion !== void 0 && !variantEvidence) identityErrors.push("independent variant anatomy is required");
  if (identityErrors.length) throw Object.assign(new Error("DECLARED_TARGET_IDENTITY_UNSUPPORTED: " + identityErrors.join("; ")), { code: "DECLARED_TARGET_IDENTITY_UNSUPPORTED" });
  if (variantEvidence) {
    const keys = new Set(manual.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated").flatMap((r) => [r.locator.componentKey, r.locator.componentSetKey]).filter(Boolean));
    const variants = variantEvidence.variants.filter((v) => keys.has(v.componentSetKey) || keys.has(v.componentKey));
    const structures = Object.fromEntries([...new Set(variants.map((v) => v.structureId))].filter((id) => variantEvidence.structures[id]).map((id) => [id, variantEvidence.structures[id]]));
    variantEvidence = { ...variantEvidence, variants, structures };
    if (!manual.rules.some((r) => r.constraints.some((c) => c.type === "bindingConsistency"))) delete variantEvidence.textBindings;
    else if (variantEvidence.textBindings) variantEvidence.textBindings = variantEvidence.textBindings.filter((v) => keys.has(v.componentSetKey) || keys.has(v.componentKey));
    if (!manual.rules.some((r) => r.constraints.some((c) => c.baselineSource === "library-text"))) delete variantEvidence.libraryText;
    const styleCatalogs = new Set(manual.rules.flatMap((r) => r.constraints.filter((c) => c.type === "styleBinding").map((c) => c.styleCatalog)));
    if (!styleCatalogs.size) delete variantEvidence.textStyleCatalogs;
    else if (variantEvidence.textStyleCatalogs) variantEvidence.textStyleCatalogs = variantEvidence.textStyleCatalogs.filter((c) => styleCatalogs.has(c.id));
  }
  const issues = validateManualSource(manual);
  manual.rules.forEach((r, i) => r.constraints.forEach((c, j) => {
    if (c.type === "bindingConsistency" && c.bindingReference === "selected-variant" && !hasTextBindingReference(manual, variantEvidence, c)) {
      issues.push({
        level: "error",
        code: "TEXT_BINDING_REFERENCE_MISSING",
        path: `/rules/${i}/constraints/${j}`,
        message: "\u041D\u0435\u0442 \u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u043E\u0439 \u043C\u0430\u0442\u0440\u0438\u0446\u044B Text Style \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u043D\u044B\u0445 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0445 \u0446\u0435\u043B\u0435\u0439. \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 Athena facts."
      });
    }
  }));
  manual.rules.forEach((r, i) => r.constraints.forEach((c, j) => {
    if (c.type !== "styleBinding") return;
    const catalogs = variantEvidence?.textStyleCatalogs?.filter((s) => s.id === c.styleCatalog) || [];
    if (catalogs.length !== 1 || !validTextStyleCatalog(catalogs[0])) issues.push({
      level: "error",
      code: "TEXT_STYLE_CATALOG_MISSING",
      path: `/rules/${i}/constraints/${j}`,
      message: `\u041D\u0435\u0442 \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E\u0433\u043E \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430 Text Style: ${c.styleCatalog}. \u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0437\u0430\u043A\u0440\u0435\u043F\u043B\u0451\u043D\u043D\u044B\u0435 Athena facts.`
    });
  }));
  manual.representations.forEach((representation, index) => {
    const setKey = representation.locator.componentSetKey;
    if (representation.kind === "figma" && representation.status !== "deprecated" && setKey && variantEvidence?.variants.some((v) => v.componentKey === setKey && v.componentSetKey === setKey)) {
      issues.push({
        level: "error",
        code: "STANDALONE_COMPONENT_AS_SET",
        path: `/representations/${index}/locator/componentSetKey`,
        message: "Athena \u043E\u043F\u0438\u0441\u044B\u0432\u0430\u0435\u0442 \u043E\u0434\u0438\u043D\u043E\u0447\u043D\u044B\u0439 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u0441 \u044D\u0442\u0438\u043C \u043A\u043B\u044E\u0447\u043E\u043C, \u0430 \u043D\u0435 Component Set. \u0423\u0434\u0430\u043B\u0438\u0442\u0435 \u043E\u0448\u0438\u0431\u043E\u0447\u043D\u044B\u0439 componentSetKey; componentKey \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F."
      });
    }
  });
  const rootAliases = variantEvidence?.occurrenceAddressVersion === 1 ? declaredRootAliasRoles(manual.targets) : /* @__PURE__ */ new Set();
  const assetIdentityLockSource = manual.rules.some((r) => r.constraints.some((c) => c.dependency?.field === "changed"));
  const semanticTargetVisibility = manual.semanticApi.some((p) => p.bindings.some((b) => b.targetId && !b.ownedOccurrence && !b.nativeSlotBinding)) || manual.rules.some((r) => r.status !== "deprecated" && r.permission === "constrained" && ["auto", "predicate"].includes(r.execution?.route || "auto") && r.constraints.some((c) => c.dependency?.field === "changed"));
  const configurations = manual.rules.some((r) => r.constraints.some((c) => c.type === "configurationDomain"));
  const componentDependencies = linkComponentDependencies(manual, dependencyContracts);
  componentDependencies.forEach((d, index) => {
    if (d.issue) issues.push({ level: "error", code: "COMPONENT_DEPENDENCY_LINK", path: `/componentDependencies/${index}`, message: d.issue });
  });
  const manualSourceHash = stableHash(manual);
  const targets = new Map(manual.targets.map((target) => [target.id, target]));
  const rules = [];
  const dependencyBindings = /* @__PURE__ */ new Map();
  const transitions = [];
  const memberCollections = [];
  const nonExecutableRules = [];
  const byConstraintType = {};
  const byExecutionRoute = {};
  for (const [ruleIndex, sourceRule] of manual.rules.entries()) {
    if (sourceRule.status === "deprecated") continue;
    const target = targets.get(sourceRule.targetId);
    if (!target) continue;
    const requestedRoute = sourceRule.execution?.route || "auto";
    const executionRoute = requestedRoute === "auto" ? sourceRule.permission === "allowed" ? "policy-only" : "predicate" : requestedRoute;
    byExecutionRoute[executionRoute] = (byExecutionRoute[executionRoute] || 0) + 1;
    const ruleErrors = issues.filter((issue) => issue.level === "error" && issue.path.startsWith(`/rules/${ruleIndex}/`));
    if (ruleErrors.length) {
      nonExecutableRules.push({
        id: sourceRule.id,
        sourceRuleId: sourceRule.id,
        reason: ruleErrors.map((issue) => `${issue.code}: ${issue.message}`).join(" ")
      });
      continue;
    }
    if (executionRoute === "policy-only" || executionRoute === "delegated") continue;
    if (executionRoute === "context-only") {
      nonExecutableRules.push({
        id: sourceRule.id,
        sourceRuleId: sourceRule.id,
        reason: `Missing runtime facts: ${(sourceRule.execution?.missingFacts || []).join(", ")}.`
      });
      continue;
    }
    const registeredCapabilities = sourceRule.capabilitySet ? capabilitiesForSet(sourceRule.capabilitySet) : [sourceRule.capability];
    const capabilities = capabilitiesFor(sourceRule);
    if (sourceRule.capabilitySet && !registeredCapabilities.length) {
      nonExecutableRules.push({
        id: sourceRule.id,
        sourceRuleId: sourceRule.id,
        reason: `Unknown capability set: ${sourceRule.capabilitySet}.`
      });
      continue;
    }
    if (sourceRule.capabilitySet && !capabilities.length) {
      nonExecutableRules.push({
        id: sourceRule.id,
        sourceRuleId: sourceRule.id,
        reason: `Capability set has no selected capabilities: ${sourceRule.capabilitySet}.`
      });
      continue;
    }
    const constraints = constraintsFor(sourceRule);
    if (!constraints.length) {
      nonExecutableRules.push({
        id: sourceRule.id,
        sourceRuleId: sourceRule.id,
        reason: "Rule has no normative constraint to compile."
      });
      continue;
    }
    capabilities.forEach((capability, capabilityIndex) => {
      constraints.forEach((constraint, constraintIndex) => {
        byConstraintType[constraint.type] = (byConstraintType[constraint.type] || 0) + 1;
        if (constraint.type === "memberCollection" && constraint.collection) {
          const id = "c_" + stableHash({ sourceRuleId: sourceRule.id, constraintIndex }).slice(0, 16), prefix = `memberCollectionsV1.${id}`;
          memberCollections.push({ id, sourceRuleId: sourceRule.id, collection: constraint.collection });
          rules.push({
            schemaVersion: "apollo.rule-ir.v1",
            ruleId: `${sourceRule.id}.${capabilityIndex + 1}.${constraintIndex + 1}`,
            revision: manual.metadata.revision,
            source: { path: "contract.manual.json", checksum: manualSourceHash, anchor: sourceRule.id },
            authority: { status: sourceRule.status === "reviewed" ? "active" : sourceRule.status, provenance: sourceRule.owner },
            effect: "require",
            scope: scopeFor(sourceRule),
            select: { from: "selection-root", traverse: "self" },
            when: { predicate: "all", args: [...conditionFor(sourceRule) ? [conditionFor(sourceRule)] : [], availabilityEquals(`${prefix}.active`, true)] },
            assert: { predicate: "count-between", actual: { fact: `${prefix}.violations` }, lower: { literal: 0 }, upper: { literal: 0 }, bounds: "inclusive", missingPolicy: "unknown" },
            severity: sourceRule.severity,
            unknownPolicy: "human-review",
            presentation: { title: sourceRule.message || sourceRule.rationale, group: capability, collectionId: id },
            manual: { permission: sourceRule.permission, controlPaths: sourceRule.controlPaths }
          });
          return;
        }
        if (constraint.type === "propertyForbidden" && constraint.targetRoles?.length) {
          for (const role of constraint.targetRoles) {
            const destination = manual.targets.find((t) => t.semanticRole === role);
            const assertion2 = assertionFor(constraint, destination, capability, rootAliases);
            const conditions2 = [
              availabilityEquals(`semanticTargets.${role}.resolved`, true),
              availabilityEquals(`ruleScopeV1.targets.${role}.visible`, true)
            ];
            const context = conditionFor(sourceRule);
            if (context) conditions2.unshift(context);
            const select2 = { from: "selection-root", traverse: "self-and-descendants", where: [{ predicate: "any", args: [
              roleFilter(role, rootAliases),
              { predicate: "all", args: [roleFilter("root", rootAliases), {
                predicate: "count-between",
                actual: targetQuery(role, void 0, rootAliases),
                lower: { literal: 0 },
                upper: { literal: 0 },
                bounds: "inclusive"
              }] }
            ] }] };
            rules.push({
              schemaVersion: "apollo.rule-ir.v1",
              ruleId: `${sourceRule.id}.${capabilityIndex + 1}.${constraintIndex + 1}.${role}`,
              revision: manual.metadata.revision,
              source: { path: "contract.manual.json", checksum: manualSourceHash, anchor: sourceRule.id },
              authority: { status: sourceRule.status === "reviewed" ? "active" : sourceRule.status, provenance: sourceRule.owner },
              effect: "require",
              scope: scopeFor(sourceRule),
              select: select2,
              when: { predicate: "all", args: conditions2 },
              assert: { ...assertion2.expression, missingPolicy: "unknown" },
              severity: sourceRule.severity,
              unknownPolicy: "human-review",
              presentation: { title: sourceRule.message || sourceRule.rationale, group: constraint.fact || capability },
              manual: { permission: sourceRule.permission, controlPaths: sourceRule.controlPaths, targetRole: role }
            });
          }
          return;
        }
        if (constraint.type === "configurationMapping" && constraint.mapping) {
          for (const entry of constraint.mapping.cases) rules.push({
            schemaVersion: "apollo.rule-ir.v1",
            ruleId: `${sourceRule.id}.${capabilityIndex + 1}.${constraintIndex + 1}.${entry.id}`,
            revision: manual.metadata.revision,
            source: { path: "contract.manual.json", checksum: manualSourceHash, anchor: sourceRule.id },
            authority: { status: sourceRule.status === "reviewed" ? "active" : sourceRule.status, provenance: sourceRule.owner },
            effect: "require",
            scope: scopeFor(sourceRule),
            select: { from: "selection-root", traverse: "self" },
            when: { predicate: "all", args: [conditionFor(sourceRule), mappingActive(constraint.mapping), mappingCondition(entry)] },
            assert: mappingAssertion(entry),
            severity: sourceRule.severity,
            unknownPolicy: "human-review",
            presentation: { title: sourceRule.message || sourceRule.rationale, group: capability, mappingCase: entry.id },
            manual: { permission: sourceRule.permission, controlPaths: sourceRule.controlPaths }
          });
          return;
        }
        if (constraint.type === "instanceReplacementDomain" && constraint.replacement) {
          const d = constraint.replacement, prefix = `nativeInstanceReplacementsV1.${replacementId(sourceRule.id, d.targetRole)}`;
          const one = (fact2, values) => ({ predicate: "one-of", actual: { fact: fact2 }, expected: { literal: values }, missingPolicy: "unknown" });
          rules.push({
            schemaVersion: "apollo.rule-ir.v1",
            ruleId: `${sourceRule.id}.${capabilityIndex + 1}.${constraintIndex + 1}`,
            revision: manual.metadata.revision,
            source: { path: "contract.manual.json", checksum: manualSourceHash, anchor: sourceRule.id },
            authority: { status: sourceRule.status === "reviewed" ? "active" : sourceRule.status, provenance: sourceRule.owner },
            effect: "require",
            scope: scopeFor(sourceRule),
            select: { from: "selection-root", traverse: "self" },
            when: { predicate: "all", args: [availabilityEquals(`${prefix}.present`, true), ...conditionFor(sourceRule) ? [conditionFor(sourceRule)] : []] },
            assert: { predicate: "any", args: d.alternatives.map((a) => ({ predicate: "all", args: [one(`${prefix}.componentSetKey`, [a.componentSetKey]), ...Object.entries(a.properties || {}).map(([name, values]) => one(`${prefix}.properties.${name}`, values))] })) },
            severity: sourceRule.severity,
            unknownPolicy: "human-review",
            presentation: { title: sourceRule.message || sourceRule.rationale, group: capability },
            manual: { permission: sourceRule.permission, controlPaths: sourceRule.controlPaths }
          });
          return;
        }
        if (constraint.type === "configurationDomain" && constraint.configuration) {
          const c = constraint.configuration;
          for (const specification of c.specificationInput ? [false, true] : [false]) rules.push({
            schemaVersion: "apollo.rule-ir.v1",
            ruleId: `${sourceRule.id}.${capabilityIndex + 1}.${constraintIndex + 1}${specification ? ".specification" : ""}`,
            revision: manual.metadata.revision,
            source: { path: "contract.manual.json", checksum: manualSourceHash, anchor: sourceRule.id },
            authority: { status: sourceRule.status === "reviewed" ? "active" : sourceRule.status, provenance: sourceRule.owner },
            effect: "require",
            scope: scopeFor(sourceRule),
            select: { from: "selection-root", traverse: "self" },
            when: { predicate: "all", args: [configurationActive(c), ...specification ? [{ predicate: "equals", actual: { fact: "validationScopeV1.mode" }, expected: { literal: "specification" }, missingPolicy: "unknown" }] : []] },
            assert: configurationAssertion(c, specification),
            severity: sourceRule.severity,
            unknownPolicy: "human-review",
            presentation: { title: `${sourceRule.message || sourceRule.rationale}${specification ? " \xB7 \u043F\u043E \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438" : ""}`, group: capability },
            manual: { permission: sourceRule.permission, controlPaths: sourceRule.controlPaths }
          });
          return;
        }
        if (constraint.type === "transitionInvariant" && constraint.transition) {
          const id = "t_" + stableHash({ sourceRuleId: sourceRule.id, constraintIndex }).slice(0, 16), prefix = `transitionsV1.${id}`;
          transitions.push({ id, sourceRuleId: sourceRule.id, fact: constraint.fact, transition: constraint.transition });
          rules.push({
            schemaVersion: "apollo.rule-ir.v1",
            ruleId: `${sourceRule.id}.${capabilityIndex + 1}.${constraintIndex + 1}`,
            revision: manual.metadata.revision,
            source: { path: "contract.manual.json", checksum: manualSourceHash, anchor: sourceRule.id },
            authority: { status: sourceRule.status === "reviewed" ? "active" : sourceRule.status, provenance: sourceRule.owner },
            effect: "require",
            scope: scopeFor(sourceRule),
            select: { from: "selection-root", traverse: "self" },
            when: { predicate: "all", args: [...conditionFor(sourceRule) ? [conditionFor(sourceRule)] : [], availabilityEquals(`${prefix}.applicable`, true)] },
            assert: { predicate: "approximately-equals", actual: { fact: `${prefix}.after` }, expected: { fact: `${prefix}.before` }, tolerance: constraint.transition.tolerance, missingPolicy: "unknown" },
            severity: sourceRule.severity,
            unknownPolicy: "human-review",
            presentation: { title: sourceRule.message || sourceRule.rationale, group: capability, transitionId: id },
            manual: { permission: sourceRule.permission, controlPaths: sourceRule.controlPaths }
          });
          return;
        }
        if (constraint.type === "dependencyDomain" && constraint.dependency) {
          const dependency = constraint.dependency;
          dependency.subjects.forEach((subject, subjectIndex) => {
            const binding = dependencyBinding(subject, constraint);
            dependencyBindings.set(binding.id, { ...dependencyBindings.get(binding.id), ...binding });
            const prefix = `dependencies.${binding.id}`;
            const domain = (values) => dependency.tolerance !== void 0 ? { predicate: "any", args: values.map((value) => ({
              predicate: "between",
              actual: { fact: `${prefix}.${dependency.field}` },
              lower: { literal: Number(value) - dependency.tolerance },
              upper: { literal: Number(value) + dependency.tolerance },
              bounds: "inclusive",
              missingPolicy: "unknown"
            })) } : { predicate: "one-of", actual: { fact: `${prefix}.${dependency.field}` }, expected: { literal: values }, missingPolicy: "unknown" };
            const assert = dependency.cases ? { predicate: "any", args: dependency.cases.map((c) => ({ predicate: "all", args: [
              c.context ? { predicate: "all", args: [
                { predicate: "one-of", actual: { fact: dependency.sourceFact }, expected: { literal: c.when }, missingPolicy: "unknown" },
                ...Object.entries(c.context).map(([fact2, value]) => ({ predicate: "equals", actual: { fact: fact2 }, expected: { literal: value }, missingPolicy: "unknown" }))
              ] } : { predicate: "one-of", actual: { fact: dependency.sourceFact }, expected: { literal: c.when }, missingPolicy: "unknown" },
              domain(c.values)
            ] })) } : domain(constraint.values || []);
            const conditions2 = [availabilityEquals(`${prefix}.applicable`, true)];
            if (dependency.subjectCondition) conditions2.push(availabilityEquals(`${prefix}.subjectMatches`, true));
            if (dependency.catalogs) conditions2.push({ predicate: "one-of", actual: { fact: `${prefix}.catalog` }, expected: { literal: dependency.catalogs }, missingPolicy: "unknown" });
            if (dependency.activePorts) conditions2.push({ predicate: "one-of", actual: { fact: `${prefix}.portName` }, expected: { literal: dependency.activePorts }, missingPolicy: "unknown" });
            if (conditionFor(sourceRule)) conditions2.push(conditionFor(sourceRule));
            if (dependency.baselinePolicy === "allow-unchanged") conditions2.push(availabilityEquals(`${prefix}.changed`, true));
            rules.push({
              schemaVersion: "apollo.rule-ir.v1",
              ruleId: `${sourceRule.id}.${capabilityIndex + 1}.${constraintIndex + 1}.${subjectIndex + 1}`,
              revision: manual.metadata.revision,
              source: { path: "contract.manual.json", checksum: manualSourceHash, anchor: sourceRule.id },
              authority: { status: sourceRule.status === "reviewed" ? "active" : sourceRule.status, provenance: sourceRule.owner },
              effect: "require",
              scope: scopeFor(sourceRule),
              select: { from: "selection-root", traverse: "self" },
              when: { predicate: "all", args: conditions2 },
              assert,
              severity: sourceRule.severity,
              unknownPolicy: "human-review",
              presentation: {
                title: sourceRule.message || sourceRule.rationale,
                group: `${capability} \xB7 ${subject.targetRole}`,
                ...["portName", "width", "height", "variantProperty"].includes(dependency.field) ? { dependency: { bindingId: binding.id, field: dependency.field, targetRole: subject.targetRole, ...dependency.property ? { property: dependency.property } : {}, ...dependency.contractDependencyId ? { contractDependencyId: dependency.contractDependencyId } : {} } } : {}
              },
              manual: { permission: sourceRule.permission, controlPaths: sourceRule.controlPaths }
            });
          });
          return;
        }
        const assertion = assertionFor(constraint, target, capability, rootAliases);
        if (!assertion.expression) {
          nonExecutableRules.push({
            id: `${sourceRule.id}.${constraintIndex + 1}`,
            sourceRuleId: sourceRule.id,
            reason: assertion.reason || "Unsupported constraint."
          });
          return;
        }
        const ruleId = [sourceRule.id, capabilityIndex + 1, constraintIndex + 1].join(".");
        const conditions = conditionFor(sourceRule) ? [conditionFor(sourceRule)] : [];
        if (constraint.type === "bindingConsistency") conditions.push(
          { predicate: "equals", actual: { fact: "visibility.effective" }, expected: { literal: true } },
          { predicate: "equals", actual: { fact: "variantAvailability.targets.root.present" }, expected: { literal: true } }
        );
        if (constraint.exceptConfiguration) {
          const roles = constraint.exceptConfiguration.targetRoles;
          conditions.push(...roles.map((role) => availabilityEquals(`semanticTargets.${role}.resolved`, true)));
          conditions.push(configurationExclusion(roles));
        }
        const activity = constraint.type === "propertyForbidden" ? propertyApplicabilityCondition(sourceRule, constraint.fact || factForCapability(capability)) : void 0;
        if (activity) conditions.push(activity);
        const eq3 = (fact2, value) => ({ predicate: "equals", actual: { fact: fact2 }, expected: { literal: value } });
        if (constraint.targetRoles?.length) {
          conditions.push(...constraint.targetRoles.map((role) => eq3(`semanticTargets.${role}.resolved`, true)));
          if (constraint.visibleOnly) conditions.push(...constraint.targetRoles.map((role) => eq3(`semanticTargets.${role}.visibilityKnown`, true)));
        }
        if (variantEvidence && assertion.selectRoot && !constraint.targetRoles?.length && !constraint.contractDependencyId && ["presence", "quantity"].includes(constraint.type)) {
          conditions.push(eq3(`semanticTargets.${constraint.targetRole || target.semanticRole}.resolved`, true));
        }
        const configured = sourceRule.propertyConformance === CONFIGURED_NATIVE_PROPERTY_POLICY;
        const select = configured ? { from: "selection-root", traverse: "self" } : assertion.selectRoot ? { from: "selection-root", traverse: "self" } : targetSelector(target, sourceRule.targetScope || "self", activity ? void 0 : assertion.baselineApplicabilityFact, rootAliases);
        if (constraint.type === "styleBinding") {
          select.where.push({ predicate: "equals", actual: { fact: "type" }, expected: { literal: "TEXT" } });
          conditions.push(eq3("visibility.effective", true));
        }
        if (constraint.type === "layoutConstraint" && constraint.fact === "text.textAlignHorizontal") {
          select.where.push({ predicate: "equals", actual: { fact: "type" }, expected: { literal: "TEXT" } });
          conditions.push(eq3("visibility.effective", true));
        }
        if (variantEvidence && !assertion.selectRoot && !configured) {
          applyVariantTargetAvailability(select, conditions, target);
          const fact2 = availabilityFactFor(constraint, capability);
          const propertyCondition = propertyAvailabilityCondition(fact2);
          if (propertyCondition) conditions.push(propertyCondition);
        }
        applyExplicitRuleScope(select, conditions, sourceRule, target);
        applyValidationModeFallback(select, sourceRule);
        const rootCondition = sourceRule.applicability.conditionSubject === "component-root" ? conditionFor(sourceRule) : void 0;
        const rootTarget = manual.targets.find(isDeclaredRootTarget);
        if (manual.metadata.declaredTargetIdentityVersion === 3 && !assertion.selectRoot && !configured && rootCondition && rootTarget) {
          select.where = [{ predicate: "any", args: [
            { predicate: "all", args: select.where },
            { predicate: "all", args: [availabilityEquals(`declaredTargetMembershipV1.${declaredTargetMembershipKey(rootTarget.id)}`, true), { predicate: "not", args: [rootCondition] }] }
          ] }];
        }
        const rule = {
          schemaVersion: "apollo.rule-ir.v1",
          ruleId,
          revision: manual.metadata.revision,
          source: {
            path: "contract.manual.json",
            checksum: manualSourceHash,
            anchor: sourceRule.id
          },
          authority: {
            status: sourceRule.status === "reviewed" ? "active" : sourceRule.status,
            provenance: sourceRule.owner || "design-system-authors"
          },
          effect: "require",
          scope: scopeFor(sourceRule),
          select,
          when: activity || constraint.exceptConfiguration || constraint.targetRoles?.length || variantEvidence || sourceRule.boundaryPolicy || sourceRule.targetApplicability ? conditions.length ? { predicate: "all", args: conditions } : void 0 : conditionFor(sourceRule),
          assert: configured ? configuredNativeExpression({ ...assertion.expression, missingPolicy: "unknown" }, typeof constraint.values?.[0] === "boolean" ? "BOOLEAN" : "VARIANT") : activity ? { ...assertion.expression, missingPolicy: "unknown" } : assertion.expression,
          severity: sourceRule.severity,
          unknownPolicy: "human-review",
          remediation: sourceRule.remediationIntent ? { kind: sourceRule.remediationIntent, safety: "compiler-review-required" } : null,
          presentation: {
            title: sourceRule.message || sourceRule.rationale || sourceRule.id,
            group: capability,
            ...constraint.type === "styleBinding" ? { textStyleBinding: true } : {},
            remediation: sourceRule.remediationMessage,
            ...activity ? { propertyApplicability: sourceRule.propertyApplicability?.[constraint.fact || factForCapability(capability)] } : {},
            ...configured ? { propertyConformance: CONFIGURED_NATIVE_PROPERTY_POLICY } : {},
            ...sourceRule.boundaryPolicy ? { boundaryPolicy: sourceRule.boundaryPolicy } : {},
            ...sourceRule.targetApplicability ? { targetApplicability: sourceRule.targetApplicability } : {}
          },
          manual: {
            permission: sourceRule.permission,
            targetScope: sourceRule.targetScope || "self",
            controlPaths: sourceRule.controlPaths
          }
        };
        rules.push(rule);
      });
    });
  }
  rules.sort((left, right) => left.ruleId.localeCompare(right.ruleId));
  for (const rule of rules) {
    const source = manual.rules.find((entry) => entry.id === rule.source?.anchor);
    if (source?.ownership) rule.manual = { ...rule.manual, ownership: source.ownership };
  }
  nonExecutableRules.sort((left, right) => left.id.localeCompare(right.id));
  const capabilityParts = rules.map(sourceCapabilities);
  const dependencyCompositionIds = uniqueSorted(manual.rules.filter((r) => r.status !== "deprecated").flatMap((r) => [
    ...r.applicability.activeDependency ? [r.applicability.activeDependency] : [],
    ...r.constraints.flatMap((c) => c.contractDependencyId ? [c.contractDependencyId] : []),
    ...r.constraints.flatMap((c) => c.transition ? [c.transition.dependencyId] : [])
  ]));
  const contract = {
    schemaVersion: COMPILED_SCHEMA_VERSION,
    documentType: "component-contract",
    package: {
      id: manual.component.contractId,
      componentId: manual.component.componentId,
      family: manual.component.family,
      library: manual.component.library,
      sourcePath: "contract.manual.json",
      sourceGeneratedAt: manual.metadata.updatedAt || manual.metadata.createdAt || manual.source.importedAt,
      // Last compiler-output revision; presentation-only Editor patches keep
      // compiled bytes and pinned dependency hashes stable.
      sourceExportVersion: rootAliases.size ? "component-contract-editor@0.2.80" : manual.rules.some((r) => r.constraints.some((c) => c.type === "positionOrder" && c.orderScope === "structural")) ? "component-contract-editor@0.2.60" : manual.rules.some((r) => r.constraints.some((c) => c.type === "bindingConsistency")) ? "component-contract-editor@0.2.59" : manual.rules.some((r) => r.constraints.some((c) => c.fact === "appearance.effectDetailsV1" || c.dependency?.cases?.some((c2) => c2.context))) ? "component-contract-editor@0.2.52" : manual.validationContext || manual.rules.some((r) => r.constraints.some((c) => c.mapping)) ? "component-contract-editor@0.2.51" : configurations ? "component-contract-editor@0.2.49" : manual.rules.some((r) => r.applicability.validationMode) ? "component-contract-editor@0.2.47" : manual.semanticApi.some((p) => p.validationInput) ? "component-contract-editor@0.2.46" : manual.metadata.ruleOwnershipVersion === 1 ? "component-contract-editor@0.2.45" : manual.rules.some((r) => r.targetScope === "descendants") ? "component-contract-editor@0.2.42" : transitions.length ? "component-contract-editor@0.2.41" : semanticTargetVisibility ? "component-contract-editor@0.2.40" : dependencyCompositionIds.length ? "component-contract-editor@0.2.39" : "component-contract-editor@0.2.37",
      ...componentDependencies.length ? { manualRevision: manual.metadata.revision } : {},
      snapshotProfile: dependencyBindings.size ? "dependency-facts-v5" : variantEvidence ? "variant-facts-v4" : "component-facts-v2",
      ...variantEvidence ? { generatedFactsHash: stableHash(variantEvidence) } : {},
      manualSourceHash
    },
    status: issues.some((issue) => issue.level === "error") || nonExecutableRules.length > 0 || manual.rules.some((rule) => rule.status !== "reviewed" && rule.status !== "deprecated") ? "draft" : "ready",
    ...componentDependencies.length ? { componentDependencies } : {},
    facts: {
      ...memberCollections.length ? { memberCollections } : {},
      ...manual.rules.some((r) => r.constraints.some((c) => c.type === "bindingConsistency")) ? {
        textBindingComparisons: manual.rules.filter((r) => r.status !== "deprecated").flatMap((r) => r.constraints.filter((c) => c.type === "bindingConsistency"))
      } : {},
      ...transitions.length ? { transitions } : {},
      ...dependencyCompositionIds.length ? { dependencyCompositionIds } : {},
      ...dependencyBindings.size ? { dependencyBindings: [...dependencyBindings.values()].sort((a, b) => a.id.localeCompare(b.id)) } : {},
      ...variantEvidence ? { variantEvidence } : {},
      component: manual.component,
      semantics: manual.semantics,
      representations: manual.representations,
      semanticApi: manual.semanticApi,
      ...manual.validationContext ? { validationContext: manual.validationContext } : {},
      documentation: manual.documentation,
      examples: manual.examples,
      decisions: manual.decisions,
      generation: manual.generation,
      targets: manual.targets,
      controlPorts: manual.controlPorts
    },
    customizationPolicy: manual.rules.map((rule) => ({
      id: rule.id,
      targetId: rule.targetId,
      ...rule.targetScope ? { targetScope: rule.targetScope } : {},
      ...rule.boundaryPolicy ? { boundaryPolicy: rule.boundaryPolicy } : {},
      ...rule.targetApplicability ? { targetApplicability: rule.targetApplicability } : {},
      capability: rule.capability,
      ...rule.capabilitySet ? { capabilitySet: rule.capabilitySet } : {},
      ...rule.capabilitySelection ? { capabilitySelection: rule.capabilitySelection } : {},
      ...rule.propertyApplicability ? { propertyApplicability: rule.propertyApplicability } : {},
      ...rule.propertyConformance ? { propertyConformance: rule.propertyConformance } : {},
      permission: rule.permission,
      controlPaths: rule.controlPaths,
      applicability: rule.applicability,
      severity: rule.severity,
      status: rule.status,
      owner: rule.owner,
      ...rule.sourceRefs?.length ? { sourceRefs: rule.sourceRefs } : {},
      ...rule.ownership ? { ownership: rule.ownership } : {},
      execution: rule.execution || { route: "auto" }
    })).sort((left, right) => left.id.localeCompare(right.id)),
    rules,
    nonExecutableRules,
    capabilities: {
      selectors: uniqueSorted(capabilityParts.flatMap((part) => part.selectors)),
      facts: uniqueSorted(capabilityParts.flatMap((part) => part.facts)),
      operators: uniqueSorted(capabilityParts.flatMap((part) => part.operators)),
      remediations: uniqueSorted(capabilityParts.flatMap((part) => part.remediations))
    },
    coverage: {
      ...manual.metadata.ruleOwnershipVersion === 1 ? { byOwnership: {
        component: manual.rules.filter((r) => r.status !== "deprecated" && ruleOwnershipGroup(r, manual.component.componentId) === "component").length,
        usage: manual.rules.filter((r) => r.status !== "deprecated" && ruleOwnershipGroup(r, manual.component.componentId) === "usage").length,
        unclassified: manual.rules.filter((r) => r.status !== "deprecated" && ruleOwnershipGroup(r, manual.component.componentId) === "unclassified").length
      } } : {},
      sourceRules: manual.rules.length,
      policyRules: manual.rules.length,
      policyOnlyRules: manual.rules.filter((rule) => rule.permission === "allowed").length,
      compiledRules: rules.length,
      nonExecutableRules: nonExecutableRules.length,
      byConstraintType: Object.fromEntries(
        Object.entries(byConstraintType).sort(([left], [right]) => left.localeCompare(right))
      ),
      byExecutionRoute: Object.fromEntries(
        Object.entries(byExecutionRoute).sort(([left], [right]) => left.localeCompare(right))
      )
    },
    runtimePolicy: {
      ...manual.rules.some((r) => r.propertyConformance === CONFIGURED_NATIVE_PROPERTY_POLICY) ? { configuredNativePropertyConformanceVersion: 1 } : {},
      ...rootAliases.size ? { rootTargetAliasesVersion: 1 } : {},
      ...manual.rules.some((r) => r.constraints.some((c) => c.dependency?.subjectCondition)) ? { dependencySubjectConditionsVersion: 1 } : {},
      ...[...dependencyBindings.values()].some((b) => b.identityLock) ? { assetIdentityLockVersion: 1, instanceMainComponentAliasesVersion: 1 } : {},
      ...memberCollections.length ? { memberCollectionsVersion: 1, occurrenceAddressVersion: 1 } : {},
      ...manual.componentDependencies?.some((d) => d.bindings.some((b) => b.kind === "direct-child")) ? { directChildDependenciesVersion: 1, occurrenceAddressVersion: 1 } : {},
      ...variantEvidence?.occurrenceAddressVersion === 1 || manual.targets.some((t) => t.variantHints?.length) ? { occurrenceAddressVersion: 1 } : {},
      ...manual.targets.some((t) => t.variantContinuity) ? { variantTextTargetsVersion: 1 } : {},
      ...manual.metadata.dependencyCompletionVersion === 1 ? { dependencyCompletionVersion: 1 } : {},
      ...manual.rules.some((r) => r.constraints.some((c) => c.type === "positionOrder" && c.orderScope === "structural")) ? { structuralOrderFactsVersion: 1 } : {},
      engine: "apollo-predicate-engine",
      unknownPolicy: "fail-closed",
      ...manual.rules.some((r) => r.constraints.some((c) => c.type === "styleBinding")) ? { textStyleBindingFactsVersion: 1 } : {},
      ...manual.rules.some((r) => r.constraints.some((c) => c.type === "bindingConsistency")) ? { textBindingIdentityFactsVersion: 1 } : {},
      compiledIsSourceOfTruth: false,
      ...configurations || manual.rules.some((r) => r.applicability.validationMode === "specification") ? { validationModeVersion: 1 } : {},
      ...manual.validationContext || manual.semanticApi.some((p) => p.validationInput?.version === 2) ? { validationIntentVersion: 2 } : manual.semanticApi.some((p) => p.validationInput?.version === 1) ? { validationIntentVersion: 1 } : {},
      ...manual.metadata.ruleOwnershipVersion === 1 ? { ruleOwnershipVersion: 1 } : {},
      ...manual.rules.some((r) => r.status !== "deprecated" && r.constraints.some((c) => c.type === "instanceReplacementDomain")) ? { nativeInstanceReplacementsVersion: 1, nativeInstanceReplacements: manual.rules.filter((r) => r.status !== "deprecated").flatMap((r) => r.constraints.filter((c) => c.type === "instanceReplacementDomain" && c.replacement).map((c) => ({ id: replacementId(r.id, c.replacement.targetRole), sourceRuleId: r.id, targetRole: c.replacement.targetRole, propertyNames: [...new Set(c.replacement.alternatives.flatMap((a) => Object.keys(a.properties || {})))] }))) } : {},
      gradientPaintFactsVersion: 1,
      ...manual.rules.some((r) => r.constraints.some((c) => c.type === "tokenBinding" && /^paintBindingsV1\.(fill|stroke)$/.test(c.fact || ""))) ? { paintBindingFactsVersion: 1 } : {},
      ...manual.rules.some((r) => r.controlPaths.some((p) => p.kind === "slot-api" && p.property)) ? { slotTargetFactsVersion: 1 } : {},
      ...manual.rules.some((r) => r.status !== "deprecated" && r.controlPaths.some((p) => {
        if (p.kind !== "slot-api" || !p.property || p.contentOwnership !== "external") return false;
        if (r.capability === "composition.content") return true;
        const target = manual.targets.find((t) => t.id === p.target);
        const paths = [target?.pathHint, ...(target?.representationHints || []).map((h) => h.pathHint)].filter((path) => !!path).map((path) => path.split(" / ").slice(1).join(" / "));
        return Object.values(variantEvidence?.structures || {}).some((nodes) => nodes.some((node) => node.type === "SLOT" && paths.includes(node.path)));
      })) ? { nativeSlotTargetsVersion: 1 } : {},
      ...configurations || semanticTargetVisibility || manual.rules.some((rule) => rule.boundaryPolicy || rule.targetApplicability || rule.constraints.some((c) => c.mapping || c.type === "propertyForbidden" && c.targetRoles?.length)) ? { ruleScopeFactsVersion: 1 } : {},
      ...semanticTargetVisibility ? { semanticTargetVisibilityVersion: 1 } : {},
      ...transitions.length ? { transitionFactsVersion: 1 } : {}
    }
  };
  if (manual.targets.some((t) => t.variantContinuity)) contract.package.sourceExportVersion = "component-contract-editor@0.2.61";
  if (manual.rules.some((r) => r.controlPaths.some((p) => p.ownerTargetId))) contract.package.sourceExportVersion = "component-contract-editor@0.2.62";
  if (manual.rules.some((r) => r.constraints.some((c) => c.operator === "at-most-line-height"))) contract.package.sourceExportVersion = "component-contract-editor@0.2.63";
  if (manual.rules.some((r) => r.constraints.some((c) => c.type === "propertyForbidden" && c.targetRoles?.length))) contract.package.sourceExportVersion = "component-contract-editor@0.2.64";
  if (contract.runtimePolicy.nativeSlotTargetsVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.70";
  if (contract.runtimePolicy.occurrenceAddressVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.75";
  if (contract.runtimePolicy.directChildDependenciesVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.76";
  if (contract.runtimePolicy.memberCollectionsVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.77";
  if (contract.runtimePolicy.dependencySubjectConditionsVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.77";
  if (contract.runtimePolicy.rootTargetAliasesVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.80";
  if (assetIdentityLockSource) contract.package.sourceExportVersion = "component-contract-editor@0.2.88";
  if (contract.runtimePolicy.instanceMainComponentAliasesVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.90";
  const representationFlags = representationFeatureFlags(manualRepresentationShape(manual));
  if (representationFlags.evidence) contract.runtimePolicy.representationEvidenceVersion = 1;
  if (representationFlags.bindingVersion) contract.runtimePolicy.crossRepresentationBindingsVersion = representationFlags.bindingVersion;
  if (representationFlags.evidence || representationFlags.bindings) contract.package.sourceExportVersion = "component-contract-editor@0.2.91";
  if ([1, 2, 3].includes(manual.metadata.declaredTargetIdentityVersion || 0)) {
    contract.runtimePolicy.declaredTargetIdentityVersion = manual.metadata.declaredTargetIdentityVersion;
    contract.package.sourceExportVersion = manual.metadata.declaredTargetIdentityVersion === 2 ? "component-contract-editor@0.2.93" : "component-contract-editor@0.2.92";
    bindDeclaredTargetRuleSelectors(contract);
  }
  if (contract.capabilities.facts.some((f) => f.startsWith("textContentV1."))) contract.runtimePolicy.textContentFactsVersion = 1;
  if (contract.capabilities.facts.some((f) => f.startsWith("nativeTargetPropertiesV1."))) contract.runtimePolicy.nativeTargetPropertyFactsVersion = 1;
  if (contract.runtimePolicy.textContentFactsVersion === 1 || contract.runtimePolicy.nativeTargetPropertyFactsVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.94";
  if (contract.runtimePolicy.declaredTargetIdentityVersion === 3) contract.package.sourceExportVersion = "component-contract-editor@0.2.95";
  if (manual.metadata.declaredTargetConfigurationVersion === 1 || manual.metadata.declaredTargetConfigurationVersion === 2) {
    contract.runtimePolicy.declaredTargetConfigurationVersion = manual.metadata.declaredTargetConfigurationVersion;
    contract.package.sourceExportVersion = manual.metadata.declaredTargetConfigurationVersion === 2 ? "component-contract-editor@0.2.103" : "component-contract-editor@0.2.99";
  }
  if (contract.runtimePolicy.nativeInstanceReplacementsVersion === 1) contract.package.sourceExportVersion = "component-contract-editor@0.2.108";
  return decorateDependencyUsages(manual, { contract, issues });
}

// ../Apollo/packages/component-contract-core/src/runtime.ts
var import_predicate = __toESM(require_predicate());

// ../Apollo/packages/component-contract-core/src/semantic-facts.ts
function supportedSemanticBinding(binding) {
  if (binding.targetId !== void 0) return false;
  if (binding.path === "representation.surface") return binding.transform === "identity";
  return binding.path.startsWith("component.properties.") && ["identity", "number-to-string", "boolean-string", "pascal-case"].includes(binding.transform || "identity");
}
function decode(value, property, transform = "identity") {
  if (transform === "number-to-string") {
    if (!["number", "enum"].includes(property.valueType) || typeof value !== "string" || !/^-?\d+(\.\d+)?$/.test(value)) return void 0;
    const number = Number(value);
    return Number.isFinite(number) ? number : void 0;
  }
  if (transform === "boolean-string") {
    if (property.valueType !== "boolean") return void 0;
    return value === "True" || value === "true" ? true : value === "False" || value === "false" ? false : void 0;
  }
  if (transform === "pascal-case") {
    const matches2 = (property.domain || []).filter((entry) => typeof entry === "string" && entry.charAt(0).toUpperCase() + entry.slice(1) === value);
    return matches2.length === 1 ? matches2[0] : void 0;
  }
  if (property.valueType === "boolean") return typeof value === "boolean" ? value : void 0;
  if (property.valueType === "number") return typeof value === "number" && Number.isFinite(value) ? value : void 0;
  if (["enum", "string", "content"].includes(property.valueType)) return typeof value === "string" || typeof value === "number" ? value : void 0;
  return void 0;
}
function materializeSemanticFacts(snapshot, contract) {
  if (!contract.facts.semanticApi.length) return;
  const keys = [snapshot.source?.componentKey, snapshot.source?.componentSetKey].filter(Boolean);
  const representations = contract.facts.representations.filter((rep) => rep.kind === "figma" && rep.platform === snapshot.context.platform && rep.status !== "deprecated" && keys.some((key2) => key2 === rep.locator.componentKey || key2 === rep.locator.componentSetKey));
  for (const node of snapshot.nodes.filter((entry) => snapshot.selection.includes(String(entry.id)))) {
    const values = /* @__PURE__ */ Object.create(null);
    const evidence = /* @__PURE__ */ Object.create(null);
    const unknown14 = new Set(Array.isArray(node.unknownFacts) ? node.unknownFacts : []);
    const component = node.component;
    for (const property of contract.facts.semanticApi) {
      const fact2 = `semanticApi.${property.id}`;
      let reason = "representation-unresolved";
      if (representations.length === 1) {
        const bindings = property.bindings.filter((binding) => binding.representationId === representations[0].id);
        reason = bindings.length === 1 ? "unsupported-binding" : "binding-missing-or-ambiguous";
        if (bindings.length === 1 && supportedSemanticBinding(bindings[0])) {
          const binding = bindings[0];
          const surface = binding.path === "representation.surface";
          const allowedTypes = ["boolean-string", "number-to-string", "pascal-case"].includes(binding.transform || "") ? ["VARIANT"] : property.valueType === "boolean" ? ["BOOLEAN"] : ["TEXT", "VARIANT", "INSTANCE_SWAP"];
          const reference = snapshot.variantReference;
          const propertyData = { ...component, definedProperties: [
            ...component?.definedProperties || [],
            ...reference?.definedProperties || [],
            ...Object.keys(reference?.properties || {}),
            ...Object.keys(reference?.propertyTypes || {})
          ] };
          const resolved = !surface ? resolveComponentProperty(binding.path.slice("component.properties.".length), propertyData, allowedTypes) : void 0;
          const name = resolved && "name" in resolved ? resolved.name : void 0;
          const identity = component?.identity;
          const identityProven = Boolean(snapshot.source?.componentSetKey && identity?.componentSetKey === snapshot.source.componentSetKey && snapshot.source?.componentKey && identity?.componentKey === snapshot.source.componentKey && [representations[0].locator.componentKey, representations[0].locator.componentSetKey].includes(snapshot.source.componentSetKey));
          const raw = surface ? identityProven ? representations[0].surface : void 0 : name !== void 0 ? component?.properties?.[name] : void 0;
          const inputs = surface ? ["component.identity.componentKey", "component.identity.componentSetKey", binding.path] : [binding.path, ...name !== void 0 ? [`component.properties.${name}`, `component.propertyTypes.${name}`] : []];
          const sourceUnknown = Array.from(unknown14).some((path) => inputs.some((input) => input === path || input.startsWith(`${path}.`)));
          const value = sourceUnknown ? void 0 : decode(raw, property, binding.transform);
          const valid = value !== void 0 && (!surface || !property.domain || property.domain.includes(value));
          reason = valid ? "resolved" : "source-missing-unknown-or-incompatible";
          if (valid) {
            values[property.id] = value;
            unknown14.delete(fact2);
          }
          evidence[property.id] = {
            reason,
            representationId: representations[0].id,
            path: binding.path,
            transform: binding.transform || "identity",
            ...resolved && "name" in resolved && resolved.match === "alias" ? { resolvedPath: `component.properties.${resolved.name}`, match: "unique-property-alias" } : {},
            ...resolved && "reason" in resolved && resolved.reason === "property-ambiguous" ? { propertyResolution: resolved.reason } : {}
          };
        }
      }
      if (!Object.prototype.hasOwnProperty.call(evidence, property.id)) evidence[property.id] = { reason };
      if (!Object.prototype.hasOwnProperty.call(values, property.id)) unknown14.add(fact2);
    }
    node.semanticApi = values;
    node.semanticBindingEvidence = evidence;
    node.unknownFacts = Array.from(unknown14);
  }
}

// ../Apollo/packages/component-contract-core/src/validation-intent.ts
var subjectOf = (snapshot) => ({
  rootNodeId: snapshot.source?.rootNodeId || "",
  pageId: snapshot.source?.pageId || "",
  componentKey: snapshot.source?.componentKey || "",
  componentSetKey: snapshot.source?.componentSetKey || ""
});
function createValidationIntent(snapshot, contract, values) {
  return {
    schemaVersion: "apollo.validation-intent.v1",
    origin: "explicit-scenario-input",
    manualSourceHash: contract.package.manualSourceHash,
    subject: subjectOf(snapshot),
    values: { ...values }
  };
}
function materializeValidationIntent(snapshot, contract) {
  if (![1, 2].includes(contract.runtimePolicy.validationIntentVersion || 0)) return;
  const properties = validationInputs(contract.facts).filter((p) => p.validationInput?.version === 1 || contract.runtimePolicy.validationIntentVersion === 2 && p.validationInput?.version === 2);
  const roots = snapshot.nodes.filter((n) => snapshot.selection.includes(String(n.id)));
  const root2 = roots.length === 1 ? roots[0] : void 0;
  const subject = subjectOf(snapshot), input = snapshot.validationIntent;
  const identity = root2?.component?.identity;
  const reps = contract.facts.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated" && r.platform === snapshot.context.platform && [r.locator.componentKey, r.locator.componentSetKey].includes(subject.componentSetKey));
  const validIdentity = Boolean(root2 && Object.values(subject).every(Boolean) && reps.length === 1 && !snapshot.source?.truncated && !(Array.isArray(root2.unknownFacts) ? root2.unknownFacts : []).some((f) => ["component", "component.identity", "component.identity.componentKey", "component.identity.componentSetKey"].includes(f)) && identity?.componentKey === subject.componentKey && identity?.componentSetKey === subject.componentSetKey);
  const reason = !input ? "expected-input-missing" : input.schemaVersion !== "apollo.validation-intent.v1" || input.origin !== "explicit-scenario-input" ? "expected-input-origin-invalid" : input.manualSourceHash !== contract.package.manualSourceHash ? "expected-input-contract-changed" : !validIdentity || !input.subject || Object.entries(subject).some(([key2, value]) => input.subject[key2] !== value) ? "expected-input-subject-mismatch" : "resolved";
  for (const node of snapshot.nodes) {
    delete node.expectedInput;
    delete node.expectedInputEvidence;
    if (node !== root2) continue;
    const values = {}, evidence = {};
    const unknown14 = new Set(Array.isArray(node.unknownFacts) ? node.unknownFacts : []);
    for (const property of properties) {
      const fact2 = `expectedInput.${property.id}`, value = input?.values?.[property.id];
      const valid = reason === "resolved" && (property.valueType === "boolean" && typeof value === "boolean" || property.validationInput?.version === 2 && property.valueType === "enum" && typeof value === "string") && (!property.domain || property.domain.includes(value));
      if (valid) {
        values[property.id] = value;
        unknown14.delete(fact2);
      } else unknown14.add(fact2);
      evidence[property.id] = {
        reason: valid ? "resolved" : reason === "resolved" ? "expected-input-missing-or-invalid" : reason,
        origin: input?.origin || null,
        manualSourceHash: input?.manualSourceHash || null
      };
    }
    node.expectedInput = values;
    node.expectedInputEvidence = evidence;
    node.unknownFacts = [...unknown14];
  }
}

// ../Apollo/packages/component-contract-core/src/validation-mode.ts
function validationMode(snapshot) {
  if (!snapshot) return "unknown";
  const request = snapshot.validationRequest;
  if (request === void 0) return "component-audit";
  return request?.version === 1 && ["component-audit", "specification"].includes(request.mode) ? request.mode : "unknown";
}
function materializeValidationMode(snapshot, contract) {
  if (contract.runtimePolicy.validationModeVersion !== 1) return;
  const mode = validationMode(snapshot);
  for (const node of snapshot.nodes) {
    node.validationScopeV1 = mode === "unknown" ? {} : { mode, isRoot: snapshot.selection.includes(String(node.id)) };
    const unknown14 = new Set(Array.isArray(node.unknownFacts) ? node.unknownFacts : []);
    for (const fact2 of [...unknown14]) if (fact2 === "validationScopeV1" || fact2.startsWith("validationScopeV1.")) unknown14.delete(fact2);
    if (mode === "unknown") unknown14.add("validationScopeV1");
    node.unknownFacts = [...unknown14];
  }
}

// ../Apollo/packages/component-contract-core/src/component-facts.ts
function unknown7(node, path) {
  return (node.unknownFacts || []).some((entry) => path === entry || path.startsWith(`${entry}.`));
}
function materializeComponentFacts(snapshot, contract) {
  const roots = snapshot.nodes.filter((node) => snapshot.selection.includes(String(node.id)));
  const root2 = roots.length === 1 ? roots[0] : void 0;
  if ([1, 2, 3].includes(contract.runtimePolicy.declaredTargetIdentityVersion || 0)) {
    const host2 = root2 ? { component: root2.component || {}, semanticApi: root2.semanticApi || {}, ...contract.runtimePolicy.nativeInstanceReplacementsVersion === 1 ? { nativeInstanceReplacementsV1: root2.nativeInstanceReplacementsV1 || {} } : {} } : {};
    const hostUnknown2 = root2 ? (root2.unknownFacts || []).filter((path) => /^(component|semanticApi)(\.|$)/.test(path)).map((path) => `host.${path}`) : ["host"];
    for (const node of snapshot.nodes) {
      node.host = JSON.parse(JSON.stringify(host2));
      node.unknownFacts = [...new Set((node.unknownFacts || []).filter((path) => path !== "host" && !path.startsWith("host.")).concat(hostUnknown2))];
    }
    return;
  }
  const index = new Map(snapshot.nodes.map((node) => [String(node.id), node]));
  const visibility = (node) => {
    const visited = /* @__PURE__ */ new Set();
    let current = node;
    let uncertain2 = false;
    let hidden = false;
    while (current) {
      const id = String(current.id);
      if (visited.has(id)) return void 0;
      visited.add(id);
      if (unknown7(current, "visible") || typeof current.visible !== "boolean") uncertain2 = true;
      else if (current.visible === false) hidden = true;
      if (current === root2) return hidden ? false : uncertain2 ? void 0 : true;
      current = index.get(String(current.parentId));
    }
    return void 0;
  };
  const host = root2 ? { component: root2.component || {}, semanticApi: root2.semanticApi || {} } : {};
  const hostUnknown = root2 ? (root2.unknownFacts || []).filter((path) => /^(component|semanticApi)(\.|$)/.test(path)).map((path) => `host.${path}`) : ["host"];
  const targets = {};
  const targetsUnknown = [];
  if (["variant-facts-v4", "dependency-facts-v5"].includes(contract.package.snapshotProfile || "")) {
    const roles = /* @__PURE__ */ new Map();
    for (const node of snapshot.nodes) {
      const role = node.semantic?.role;
      if (role) roles.set(role, [...roles.get(role) || [], String(node.id)]);
    }
    const relations = Object.fromEntries([...roles].filter(([, ids]) => ids.length === 1).map(([role, ids]) => [role, ids[0]]));
    if (root2 && contract.runtimePolicy.rootTargetAliasesVersion === 1) {
      for (const [role, proven] of Object.entries(root2.rootTargetAliasesV1 || {})) if (proven === true) relations[role] = String(root2.id);
    }
    snapshot.nodes.forEach((node) => {
      node.relations = { ...relations };
    });
  }
  for (const target of contract.facts.targets) {
    const candidates = snapshot.nodes.filter((node) => matchesTargetRole(node, target.semanticRole, contract));
    const verified = root2?.variantAvailability?.targets?.[target.semanticRole];
    if (verified?.present === false && candidates.length === 0) {
      targets[target.semanticRole] = { resolved: true, visibilityKnown: true, present: false };
    } else if (root2 && !snapshot.source?.truncated && (target.resolution === "resolved" || verified?.present === true) && candidates.length === 1 && !unknown7(candidates[0], "semantic.role")) {
      targets[target.semanticRole] = { resolved: true, ...verified ? { present: true } : {} };
      if (visibility(candidates[0]) !== void 0) targets[target.semanticRole].visibilityKnown = true;
      else targetsUnknown.push(`semanticTargets.${target.semanticRole}.visibilityKnown`);
    } else targetsUnknown.push(`semanticTargets.${target.semanticRole}`);
  }
  for (const node of snapshot.nodes) {
    const paths = new Set((node.unknownFacts || []).filter((path) => path !== "host" && !path.startsWith("host.") && path !== "visibility.effective" && !path.startsWith("semanticTargets.")));
    const effective = visibility(node);
    node.visibility = effective === void 0 ? {} : { effective };
    if (effective === void 0) paths.add("visibility.effective");
    node.host = JSON.parse(JSON.stringify(host));
    node.semanticTargets = targets;
    hostUnknown.forEach((path) => paths.add(path));
    targetsUnknown.forEach((path) => paths.add(path));
    node.unknownFacts = [...paths];
  }
}

// ../Apollo/packages/component-contract-core/src/target-resolution.ts
var TARGET_RESOLUTION_SCHEMA = "apollo.target-resolution.v1";
var record20 = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
function resolveSnapshotTargets(snapshot, contract) {
  const paths = snapshotPaths(snapshot);
  const byId = new Map(snapshot.nodes.map((node) => [String(node.id), node]));
  const keys = [snapshot.source?.componentKey, snapshot.source?.componentSetKey].filter(Boolean);
  const representations = contract.facts.representations.filter((rep) => rep.kind === "figma" && rep.status !== "deprecated" && rep.platform === snapshot.context.platform && keys.some((key2) => key2 === rep.locator.componentKey || key2 === rep.locator.componentSetKey));
  const targets = contract.facts.targets.map((target) => {
    const result = {
      targetId: target.id,
      semanticRole: target.semanticRole,
      resolution: "unknown",
      reason: "topology-incomplete-or-ambiguous"
    };
    if (!paths) return result;
    if (representations.length !== 1) return { ...result, reason: "representation-unresolved" };
    if (target.resolution !== "resolved") return { ...result, reason: "authoring-target-unresolved" };
    const hints = target.representationHints?.filter((h) => h.representationId === representations[0].id) || [];
    if (hints.length > 1) return { ...result, resolution: "ambiguous", reason: "representation-hints-ambiguous" };
    const hint = hints[0];
    if (!hint && ![representations[0].locator.componentKey, representations[0].locator.componentSetKey].includes(contract.facts.component.componentKey)) {
      return { ...result, reason: "representation-hint-missing" };
    }
    const pathHint = hint?.pathHint || target.pathHint;
    if (!pathHint) return { ...result, reason: "path-hint-missing" };
    const path = pathHint.split(" / ").slice(1).join(" / ");
    const candidates = snapshot.nodes.filter((node2) => paths.get(String(node2.id)) === path);
    if (candidates.length !== 1) return { ...result, reason: "path-needs-remap" };
    const node = candidates[0];
    const fingerprint = hint?.structuralFingerprint || target.structuralFingerprint;
    if (path !== "" && !fingerprint) return { ...result, reason: "structural-anchor-missing" };
    if (fingerprint) {
      const types2 = path === "" ? ["INSTANCE", "COMPONENT", "COMPONENT_SET"] : [String(node.type)];
      if (!types2.some((type) => stableHash({ type, path: pathHint, order: node.order }).slice(0, 16) === fingerprint)) {
        return { ...result, reason: "structural-anchor-changed" };
      }
    }
    const declaredLineage = hint?.pathHint ? void 0 : target.lineage;
    const hintLineage = pathHint.split("/").slice(0, -1).map((part) => slug(part.trim()));
    if (declaredLineage && stableHash(declaredLineage) !== stableHash(hintLineage)) return { ...result, reason: "lineage-hint-conflict" };
    let current = node;
    const actualSegments = [];
    while (current && current.parentId !== null) {
      if (current.type === "INSTANCE") return { ...result, reason: "nested-lineage-unproven" };
      actualSegments.unshift(String(current.name));
      current = byId.get(String(current.parentId));
    }
    if (stableHash(actualSegments) !== stableHash(pathHint.split(" / ").slice(1))) return { ...result, reason: "lineage-hint-conflict" };
    return { ...result, resolution: "resolved", reason: "exact-structural-anchor", nodeId: String(node.id) };
  });
  for (const target of targets) {
    if (targets.filter((other) => other.semanticRole === target.semanticRole).length > 1 || target.nodeId && targets.filter((other) => other.nodeId === target.nodeId).length > 1) {
      target.resolution = "ambiguous";
      target.reason = "target-collision";
    }
  }
  return { schemaVersion: TARGET_RESOLUTION_SCHEMA, manualSourceHash: contract.package.manualSourceHash, targets };
}
function materializeTargetResolution(snapshot, contract) {
  const evidence = resolveSnapshotTargets(snapshot, contract);
  snapshot.targetResolution = evidence;
  const bindings = new Map(evidence.targets.filter((t) => t.resolution === "resolved").map((t) => [t.nodeId, t.semanticRole]));
  const relations = Object.fromEntries([...bindings].map(([id, role]) => [role, id]));
  for (const node of snapshot.nodes) {
    const role = bindings.get(String(node.id));
    node.semantic = { ...record20(node.semantic), role: role || "" };
    node.relations = { ...relations };
    node.unknownFacts = (node.unknownFacts || []).filter((path) => path !== "semantic.role");
  }
}
function targetResolutionReason(reason) {
  const labels = {
    "topology-incomplete-or-ambiguous": "\u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0441\u043D\u0438\u043C\u043A\u0430 \u043D\u0435\u043F\u043E\u043B\u043D\u0430 \u0438\u043B\u0438 \u043D\u0435\u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u0430",
    "representation-unresolved": "\u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 Figma-\u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u0438 \u0435\u0433\u043E \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",
    "authoring-target-unresolved": "\u0446\u0435\u043B\u044C \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430 \u0432 manual source",
    "representation-hints-ambiguous": "\u0434\u043B\u044F \u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0437\u0430\u0434\u0430\u043D\u044B \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u0443\u044E\u0449\u0438\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438",
    "representation-hint-missing": "\u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u043D\u0435\u0442 \u044F\u0432\u043D\u043E\u0439 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438 \u0446\u0435\u043B\u0438",
    "path-hint-missing": "\u043D\u0435\u0442 \u044F\u0432\u043D\u043E\u0433\u043E \u043F\u0443\u0442\u0438 \u043A \u0446\u0435\u043B\u0438",
    "path-needs-remap": "\u0438\u0441\u0445\u043E\u0434\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D; \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u044F \u0438\u043C\u0435\u043D\u0438 \u0438\u043B\u0438 node ID \u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E",
    "structural-anchor-missing": "\u043D\u0435\u0442 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u043D\u043E\u0433\u043E \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u0446\u0435\u043B\u0438",
    "structural-anchor-changed": "\u0442\u0438\u043F \u0438\u043B\u0438 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0446\u0435\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0438\u0441\u044C \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0438 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430",
    "lineage-hint-conflict": "lineage \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u043D\u043E\u043C\u0443 \u043F\u0443\u0442\u0438",
    "nested-lineage-unproven": "\u0434\u043B\u044F \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0443\u0436\u043D\u044B Athena variant facts \u0438 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u044B\u0439 \u044D\u0442\u0430\u043B\u043E\u043D",
    "target-collision": "\u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0446\u0435\u043B\u0435\u0439 \u043F\u0440\u0435\u0442\u0435\u043D\u0434\u0443\u044E\u0442 \u043D\u0430 \u043E\u0434\u0438\u043D \u0441\u043B\u043E\u0439 \u0438\u043B\u0438 semantic role",
    "exact-structural-anchor": "\u0442\u043E\u0447\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u0438 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u043D\u0430\u044F \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u044B"
  };
  return labels[reason] || reason;
}

// ../Apollo/packages/component-contract-core/src/gradient-paint-facts.ts
var TYPES = /* @__PURE__ */ new Set(["GRADIENT_LINEAR", "GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"]);
var record21 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var finite = (v) => typeof v === "number" && Number.isFinite(v);
var unit = (v) => finite(v) && v >= 0 && v <= 1;
var transformValid = (v) => Array.isArray(v) && v.length === 2 && v.every((row) => Array.isArray(row) && row.length === 3 && row.every(finite));
var colorValid = (v) => ["r", "g", "b", "a"].every((key2) => unit(record21(v)[key2]));
function captureGradientPaintDetails(value) {
  const paint = record21(value), facts2 = {};
  if (!TYPES.has(String(paint.type))) return facts2;
  if (transformValid(paint.gradientTransform)) facts2.gradientTransform = paint.gradientTransform.map((row) => row.slice());
  if (Array.isArray(paint.gradientStops)) facts2.gradientStops = paint.gradientStops.map((raw) => {
    const stop = record21(raw), result = {};
    if (unit(stop.position)) result.position = stop.position;
    if (colorValid(stop.color)) result.color = Object.fromEntries(["r", "g", "b", "a"].map((key2) => [key2, record21(stop.color)[key2]]));
    if (stop.boundVariables === void 0 || stop.boundVariables && typeof stop.boundVariables === "object" && !Array.isArray(stop.boundVariables) && !Object.prototype.hasOwnProperty.call(stop.boundVariables, "color")) result.tokenId = null;
    else {
      const alias = record21(record21(stop.boundVariables).color);
      if (alias.type === "VARIABLE_ALIAS" && typeof alias.id === "string" && alias.id.trim()) result.tokenId = alias.id;
    }
    return result;
  });
  if (typeof paint.blendMode === "string") facts2.blendMode = paint.blendMode;
  return facts2;
}
function gradientPaintIssues(value) {
  if (!Array.isArray(value)) return [];
  const issues = [];
  value.forEach((raw, index) => {
    const paint = record21(raw);
    if (!TYPES.has(String(paint.type))) return;
    const prefix = `[${index}]`;
    if (!transformValid(paint.gradientTransform)) issues.push(`${prefix}.gradientTransform`);
    if (!Array.isArray(paint.gradientStops) || !paint.gradientStops.length) issues.push(`${prefix}.gradientStops`);
    else paint.gradientStops.forEach((rawStop, stopIndex) => {
      const stop = record21(rawStop), path = `${prefix}.gradientStops[${stopIndex}]`;
      if (!unit(stop.position)) issues.push(`${path}.position`);
      if (!colorValid(stop.color)) issues.push(`${path}.color`);
      if (!(stop.tokenId === null || typeof stop.tokenId === "string" && Boolean(stop.tokenId.trim()))) issues.push(`${path}.tokenId`);
    });
  });
  return issues;
}
function materializeGradientPaintEvidence(snapshot) {
  for (const node of snapshot.nodes) {
    const unknown14 = new Set(node.unknownFacts || []);
    const issues = [];
    const present = {};
    for (const [prefix, source] of [["", node], ["baseline.effective.", record21(record21(node.baseline).effective)]]) {
      const appearance = record21(source.appearance);
      for (const kind of ["fill", "stroke"]) {
        if (Object.prototype.hasOwnProperty.call(appearance, kind)) present[kind] = true;
        const missing = Object.prototype.hasOwnProperty.call(appearance, kind) && !Array.isArray(appearance[kind]) ? [""] : gradientPaintIssues(appearance[kind]);
        if (!missing.length) continue;
        const fact2 = `${prefix}appearance.${kind}`;
        unknown14.add(fact2);
        issues.push({ fact: fact2, missing: missing.map((path) => `${fact2}${path}`) });
      }
    }
    node.paintEvidenceV1 = present;
    node.unknownFacts = [...unknown14].sort();
    if (issues.length) {
      node.gradientPaintIssues = issues;
    } else delete node.gradientPaintIssues;
  }
}

// ../Apollo/packages/component-contract-core/src/rule-scope-facts.ts
var record22 = (value) => value && typeof value === "object" ? value : {};
var unknown8 = (node, fact2) => (node.unknownFacts || []).some((path) => fact2 === path || fact2.startsWith(path + "."));
function materializeRuleScopeFacts(snapshot, contract) {
  const roots = snapshot.nodes.filter((node) => snapshot.selection.includes(String(node.id)));
  const root2 = roots.length === 1 ? roots[0] : void 0;
  const paths = snapshotPaths(snapshot);
  const childPaths = [];
  let ownershipUnknown = !paths;
  if (contract.customizationPolicy.some((rule) => rule.boundaryPolicy === "component-owned@1")) {
    if (contract.runtimePolicy.nativeSlotTargetsVersion === 1) {
      const nativeTargets = new Set(contract.customizationPolicy.filter((rule) => rule.status !== "deprecated" && ["allowed", "constrained"].includes(rule.permission)).flatMap((rule) => rule.controlPaths.filter((control) => control.kind === "slot-api" && control.contentOwnership === "external").map((control) => control.target)));
      for (const targetId of nativeTargets) {
        const target = contract.facts.targets.find((entry) => entry.id === targetId);
        const nodes = snapshot.nodes.filter((node) => record22(node.semantic).role === target?.semanticRole);
        if (nodes.length === 1 && nodes[0].type === "INSTANCE") continue;
        if (nodes.length !== 1 || nodes[0].type !== "SLOT" || record22(nodes[0].slotBoundaryV1).contentOwnership !== "external") {
          ownershipUnknown = true;
          continue;
        }
        const path = paths?.get(String(nodes[0].id));
        if (!path) {
          ownershipUnknown = true;
          continue;
        }
        for (const node of snapshot.nodes) {
          const descendant = paths?.get(String(node.id));
          if (descendant?.startsWith(path + " / ")) childPaths.push(descendant);
        }
      }
    }
    if (contract.runtimePolicy.nativeInstanceReplacementsVersion === 1) for (const binding of contract.runtimePolicy.nativeInstanceReplacements || []) {
      const f = record22(record22(root2?.nativeInstanceReplacementsV1)[binding.id]);
      if (f.inactive === true) continue;
      if (f.ownershipKnown !== true) {
        ownershipUnknown = true;
        continue;
      }
      if (f.sameFamily === false) {
        const path = paths?.get(String(f.nodeId));
        if (path) childPaths.push(path);
        else ownershipUnknown = true;
      }
    }
    for (const dependency of contract.componentDependencies || []) {
      if (dependency.issue || dependencyPinIssue(dependency, dependency.contract)) {
        ownershipUnknown = true;
        continue;
      }
      for (const binding of dependency.bindings) {
        const resolved = resolveFixedNestedBinding(snapshot, dependency, binding, false, contract);
        if (resolved.status === "inactive") continue;
        if (resolved.status !== "active" || !resolved.nodeId || !resolved.identityValid || !validatedDependencyCapture(snapshot, resolved.nodeId, dependency.contract).snapshot) {
          ownershipUnknown = true;
          continue;
        }
        const path = paths?.get(resolved.nodeId);
        if (path) childPaths.push(path);
        else ownershipUnknown = true;
      }
    }
  }
  const targets = {};
  for (const target of contract.facts.targets) {
    const candidates = snapshot.nodes.filter((node) => matchesTargetRole(node, target.semanticRole, contract) && !unknown8(node, "semantic.role"));
    const available = record22(record22(root2?.variantAvailability).targets)[target.semanticRole];
    const verified = record22(root2?.semanticTargets)[target.semanticRole];
    const fact2 = {};
    if (paths && verified?.resolved === true && target.resolution === "resolved" && contract.facts.targets.filter((other) => other.semanticRole === target.semanticRole).length === 1) {
      if (available?.present === false && candidates.length === 0) fact2.visible = false;
      else if (candidates.length === 1 && !unknown8(candidates[0], "visibility.effective") && typeof record22(candidates[0].visibility).effective === "boolean") fact2.visible = record22(candidates[0].visibility).effective;
    }
    targets[target.semanticRole] = fact2;
  }
  for (const node of snapshot.nodes) {
    const path = paths?.get(String(node.id));
    const local = path !== void 0 && childPaths.some((child) => withinBoundary(path, child)) ? false : ownershipUnknown ? void 0 : true;
    node.ruleScopeV1 = { isRoot: node === root2, ...local !== void 0 ? { local } : {}, targets };
    const missing = (node.unknownFacts || []).filter((path2) => path2 !== "ruleScopeV1" && !path2.startsWith("ruleScopeV1."));
    if (local === void 0) missing.push("ruleScopeV1.local");
    for (const [role, fact2] of Object.entries(targets)) if (fact2.visible === void 0) missing.push(`ruleScopeV1.targets.${role}.visible`);
    node.unknownFacts = missing;
  }
}

// ../Apollo/packages/component-contract-core/src/dependency-composition.ts
function materializeDependencyComposition(snapshot, contract) {
  const ids = contract.facts.dependencyCompositionIds || [];
  if (!ids.length) return;
  const facts2 = {};
  for (const id of ids) {
    const dependency = contract.componentDependencies?.find((d) => d.id === id);
    const fact2 = { evidence: [] };
    facts2[id] = fact2;
    if (!dependency || dependency.issue || !dependency.bindings.length) {
      fact2.evidence.push({ reason: dependency?.issue || "dependency-unavailable" });
      continue;
    }
    const results = dependency.bindings.map((binding) => ({ binding, result: resolveFixedNestedBinding(snapshot, dependency, binding, true, contract) }));
    if (results.some(({ result }) => result.ownerActive)) fact2.active = true;
    else if (results.every(({ result }) => result.status === "inactive")) fact2.active = false;
    const visible2 = [];
    let complete = true;
    for (const { binding, result } of results) {
      const node = result.node;
      const unknown14 = node?.unknownFacts || [];
      const identityUnknown = unknown14.some((p) => p === "component" || p === "component.identity" || p.startsWith("component.identity."));
      const visibilityUnknown = unknown14.some((p) => p === "visible" || p === "visibility" || p === "visibility.effective");
      const visibility = visibilityUnknown ? void 0 : node?.visibility?.effective;
      const identity = node?.component?.identity;
      const standalone = dependency.contract?.facts.representations.some((r) => r.kind === "figma" && r.status !== "deprecated" && !r.locator.componentSetKey && Boolean(identity?.componentKey) && r.locator.componentKey === identity.componentKey);
      fact2.evidence.push({
        bindingId: binding.id,
        status: result.status,
        reason: result.reason,
        ...result.nodeId ? { nodeId: result.nodeId } : {},
        ...result.identityValid !== void 0 && !identityUnknown ? { identityValid: result.identityValid } : {},
        ...typeof visibility === "boolean" ? { visible: visibility } : {}
      });
      if (result.status === "inactive") continue;
      if (result.status !== "active" || identityUnknown || !node?.component?.identity?.componentKey || !identity?.componentSetKey && !standalone || typeof visibility !== "boolean") {
        complete = false;
        continue;
      }
      if (result.identityValid && visibility) visible2.push(result.nodeId);
    }
    if (complete && new Set(visible2).size === visible2.length) fact2.visibleInstances = visible2;
  }
  for (const node of snapshot.nodes) {
    node.dependencyCompositionV1 = facts2;
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "dependencyCompositionV1" && !p.startsWith("dependencyCompositionV1."));
  }
}

// ../Apollo/packages/component-contract-core/src/semantic-target-facts.ts
var record23 = (v) => v && typeof v === "object" ? v : {};
var unknown9 = (n, fact2) => (n.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + "."));
function materializeTargetSemanticFacts(snapshot, contract) {
  if (contract.runtimePolicy.semanticTargetVisibilityVersion !== 1) return;
  const roots = snapshot.nodes.filter((n) => snapshot.selection.includes(String(n.id)));
  const root2 = roots.length === 1 ? roots[0] : void 0;
  if (!root2) return;
  const paths = snapshotPaths(snapshot);
  const identity = record23(record23(root2.component).identity);
  const sourceKey = snapshot.source?.componentKey ?? "";
  const sourceSetKey = snapshot.source?.componentSetKey ?? "";
  const reps = contract.facts.representations.filter((r) => r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, sourceKey, sourceSetKey));
  const identityKnown = sourceKey && identity.componentKey === sourceKey && (identity.componentSetKey ?? "") === sourceSetKey && !unknown9(root2, "component.identity.componentKey") && !unknown9(root2, "component.identity.componentSetKey");
  for (const property of contract.facts.semanticApi.filter((p) => p.bindings.some((b) => b.targetId && !b.ownedOccurrence && !b.nativeSlotBinding))) {
    const bindings = property.bindings.filter((b) => b.representationId === reps[0]?.id);
    const binding = bindings.length === 1 ? bindings[0] : void 0;
    const target = contract.facts.targets.filter((t) => t.id === binding?.targetId);
    const role = target[0]?.semanticRole;
    const candidates = snapshot.nodes.filter((n) => matchesTargetRole(n, role, contract) && !unknown9(n, "semantic.role"));
    const available = record23(record23(root2.variantAvailability).targets)[role];
    const resolved = snapshot.targetResolution?.targets.filter((t) => t.targetId === binding?.targetId);
    const anchor = available?.present === true || resolved?.length === 1 && resolved[0].resolution === "resolved" && candidates.length === 1 && resolved[0].nodeId === String(candidates[0].id);
    const absent = available?.present === false && candidates.length === 0;
    const targetKnown = Boolean(paths && identityKnown && reps.length === 1 && bindings.length === 1 && binding && (binding.path === "visibility.effective" || binding.path.startsWith("component.properties.")) && [void 0, "identity"].includes(binding.transform) && target.length === 1 && target[0].resolution === "resolved" && contract.facts.targets.filter((t) => t.semanticRole === role).length === 1 && (absent || anchor && candidates.length === 1));
    const fact2 = `semanticApi.${property.id}`;
    const sourceFact = `ruleScopeV1.targets.${role}.visible`;
    const isVisibility = binding?.path === "visibility.effective";
    const visible2 = targetKnown && !unknown9(root2, sourceFact) ? record23(record23(root2.ruleScopeV1).targets)[role]?.visible : void 0;
    let value = isVisibility ? visible2 : void 0;
    if (targetKnown && !isVisibility && !absent && candidates.length === 1) {
      const node = candidates[0], data = record23(node.component);
      const resolved2 = resolveComponentProperty(
        binding.path.slice("component.properties.".length),
        data,
        property.valueType === "boolean" ? ["BOOLEAN"] : property.kind === "variant" ? ["VARIANT"] : ["TEXT", "VARIANT"]
      );
      if ("name" in resolved2 && !unknown9(node, `component.properties.${resolved2.name}`) && !unknown9(node, `component.propertyTypes.${resolved2.name}`)) {
        const raw = record23(data.properties)[resolved2.name];
        if ((property.valueType === "boolean" ? typeof raw === "boolean" : typeof raw === "string") && (!property.domain || property.domain.includes(raw))) value = raw;
      }
    }
    const known2 = value !== void 0;
    const values = record23(root2.semanticApi);
    delete values[property.id];
    if (known2) values[property.id] = value;
    root2.semanticApi = values;
    root2.semanticBindingEvidence = { ...record23(root2.semanticBindingEvidence), [property.id]: {
      reason: known2 ? "resolved" : targetKnown ? isVisibility ? "target-visibility-unknown" : "target-property-unknown" : "target-unresolved",
      representationId: reps.length === 1 ? reps[0].id : void 0,
      targetId: binding?.targetId,
      path: binding?.path,
      readOnly: true,
      ...known2 ? isVisibility ? { effectiveVisible: visible2, confirmedAbsent: absent } : { value } : {}
    } };
    for (const node of snapshot.nodes) {
      const missing = new Set((node.unknownFacts || []).filter((p) => p !== `variantAvailability.properties.${property.id}` && p !== `host.${fact2}` && (node !== root2 || p !== fact2)));
      const availability = record23(node.variantAvailability), properties = { ...record23(availability.properties) };
      delete properties[property.id];
      if (targetKnown) properties[property.id] = true;
      else missing.add(`variantAvailability.properties.${property.id}`);
      node.variantAvailability = { ...availability, properties };
      if (!known2) {
        missing.add(`host.${fact2}`);
        if (node === root2) missing.add(fact2);
      }
      node.host = { ...record23(node.host), semanticApi: JSON.parse(JSON.stringify(values)) };
      node.unknownFacts = [...missing];
    }
  }
}

// ../Apollo/packages/component-contract-core/src/transition-facts.ts
function fact(node, path) {
  if ((node.unknownFacts || []).some((p) => p === path || path.startsWith(p + "."))) return void 0;
  return path.split(".").reduce((v, k) => v?.[k], node);
}
var root = (s) => s.selection.length === 1 ? s.nodes.find((n) => n.id === s.selection[0]) : void 0;
var same = (a, b) => a !== void 0 && b !== void 0 && stableHash(a) === stableHash(b);
function materializeTransitionFacts(snapshot, contract, prepareBefore) {
  if (contract.runtimePolicy.transitionFactsVersion !== 1) return;
  const after = root(snapshot), sourceBefore = snapshot.transitionBefore;
  const before = sourceBefore && !sourceBefore.transitionBefore && sourceBefore.nodes.length <= 500 ? prepareBefore(sourceBefore) : void 0;
  const prior = before && root(before), results = {};
  for (const binding of contract.facts.transitions || []) {
    const t = binding.transition, result = { reason: "before-not-captured" };
    results[binding.id] = result;
    const currentState = after && fact(after, `dependencyCompositionV1.${t.dependencyId}.active`);
    if (typeof currentState === "boolean" && currentState !== t.to) {
      Object.assign(result, { applicable: false, reason: "after-state-not-applicable" });
      continue;
    }
    if (typeof currentState !== "boolean") {
      result.reason = "after-state-unknown";
      continue;
    }
    result.applicable = true;
    if (!before || !prior || !after) continue;
    const a = snapshot.transitionCapture, b = before.transitionCapture;
    let reason = "";
    if (!a || !b || a.schemaVersion !== "apollo.transition-capture.v1" || b.schemaVersion !== a.schemaVersion || !a.complete || !b.complete) reason = a?.reason || b?.reason || "capture-context-incomplete";
    else if (!a.sessionId || a.sessionId !== b.sessionId || !Number.isInteger(a.sequence) || !Number.isInteger(b.sequence) || a.sequence <= b.sequence) reason = "capture-order-or-session-mismatch";
    else if (a.manualSourceHash !== contract.package.manualSourceHash || b.manualSourceHash !== a.manualSourceHash) reason = "manual-source-changed";
    else if (!snapshotPaths(snapshot) || !snapshotPaths(before)) reason = "topology-incomplete";
    else if (!snapshot.source?.rootNodeId || !same(snapshot.source.rootNodeId, before.source?.rootNodeId) || !same(snapshot.source.pageId, before.source?.pageId) || !same(snapshot.source.componentSetKey, before.source?.componentSetKey) || !same(snapshot.source.componentKey, before.source?.componentKey) || !same(snapshot.source.representationId, before.source?.representationId)) reason = "instance-or-variant-changed";
    else if (!same(snapshot.context, before.context) || snapshot.context.unknownFacts.length) reason = "scenario-context-changed";
    else if (!a.externalContext || !Object.keys(a.externalContext).length || !same(a.externalContext, b.externalContext)) reason = "external-context-changed";
    else if (fact(prior, `dependencyCompositionV1.${t.dependencyId}.active`) !== t.from) reason = "before-state-not-proven";
    else if (t.invariantFacts.some((path) => !same(fact(prior, path), fact(after, path)))) reason = "invariant-changed-or-unknown";
    else if ([before, snapshot].some((s) => {
      const n = root(s);
      return !same(fact(n, "component.identity.componentKey"), s.source?.componentKey) || !same(fact(n, "component.identity.componentSetKey"), s.source?.componentSetKey);
    })) reason = "root-identity-unproven";
    const old = fact(prior, binding.fact), now = fact(after, binding.fact);
    if (!reason && [old, now].some((v) => typeof v !== "number" || !Number.isFinite(v) || v <= 0)) reason = "dimension-unknown";
    if (reason) {
      result.reason = reason;
      continue;
    }
    Object.assign(result, { reason: "paired", before: old, after: now });
  }
  for (const n of snapshot.nodes) {
    n.transitionsV1 = results;
    n.unknownFacts = (n.unknownFacts || []).filter((p) => p !== "transitionsV1" && !p.startsWith("transitionsV1."));
  }
}
function transitionReason(reason) {
  const labels = {
    "before-not-captured": "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u043F\u043E\u043C\u043D\u0438\u0442\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430 \u0443 \u044D\u0442\u043E\u0433\u043E \u0436\u0435 instance.",
    "after-state-unknown": "\u041D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438 \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430.",
    "capture-context-incomplete": "\u041D\u0435\u0442 \u043F\u043E\u043B\u043D\u043E\u0433\u043E \u0441\u043D\u0438\u043C\u043A\u0430 \u0432\u043D\u0435\u0448\u043D\u0438\u0445 \u0443\u0441\u043B\u043E\u0432\u0438\u0439 \u043F\u0430\u0440\u044B.",
    "capture-order-or-session-mismatch": "\u0421\u043D\u0438\u043C\u043A\u0438 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u044B \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0432 \u043E\u0434\u043D\u043E\u0439 \u0441\u0435\u0441\u0441\u0438\u0438 \u043F\u043B\u0430\u0433\u0438\u043D\u0430.",
    "manual-source-changed": "\u041F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0441\u043D\u0438\u043C\u043A\u0430 \u0438\u0437\u043C\u0435\u043D\u0451\u043D \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442. \u0417\u0430\u043F\u043E\u043C\u043D\u0438\u0442\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u0437\u0430\u043D\u043E\u0432\u043E.",
    "topology-incomplete": "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u043E\u0434\u043D\u043E\u0433\u043E \u0438\u0437 \u0441\u043D\u0438\u043C\u043A\u043E\u0432 \u043D\u0435\u043F\u043E\u043B\u043D\u0430 \u0438\u043B\u0438 \u043D\u0435\u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u0430.",
    "instance-or-variant-changed": "\u0412\u044B\u0431\u0440\u0430\u043D \u0434\u0440\u0443\u0433\u043E\u0439 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440 \u0438\u043B\u0438 \u0432\u0430\u0440\u0438\u0430\u043D\u0442 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430.",
    "scenario-context-changed": "\u0418\u0437\u043C\u0435\u043D\u0438\u043B\u0438\u0441\u044C Product, platform \u0438\u043B\u0438 modes.",
    "external-context-changed": "\u0418\u0437\u043C\u0435\u043D\u0438\u043B\u0438\u0441\u044C \u0432\u043D\u0435\u0448\u043D\u0438\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F layout \u0438\u043B\u0438 \u043F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432 \u0438\u0435\u0440\u0430\u0440\u0445\u0438\u0438.",
    "before-state-not-proven": "\u041D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438.",
    "invariant-changed-or-unknown": "\u0418\u0437\u043C\u0435\u043D\u0438\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 \u043D\u0435\u0438\u0437\u043C\u0435\u043D\u044F\u0435\u043C\u044B\u0445 \u0441\u0432\u043E\u0439\u0441\u0442\u0432 \u043B\u0438\u0431\u043E \u0435\u0433\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E.",
    "root-identity-unproven": "\u041A\u043B\u044E\u0447\u0438 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u044B.",
    "dimension-unknown": "\u0420\u0430\u0437\u043C\u0435\u0440 \u043E\u0434\u043D\u043E\u0433\u043E \u0438\u0437 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D.",
    "changed-during-capture": "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u0438\u043B\u0438 \u0435\u0433\u043E \u043E\u043A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0438\u0441\u044C \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0441\u043D\u0438\u043C\u043A\u0430."
  };
  return labels[reason] || reason;
}

// ../Apollo/packages/component-contract-core/src/paint-binding-facts.ts
var record24 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var token = (v) => typeof v === "string" && Boolean(v.trim());
function materializePaintBindings(snapshot) {
  for (const node of snapshot.nodes) {
    const prior = node.unknownFacts || [];
    const unknown14 = prior.filter((p) => p !== "paintBindingsV1" && !p.startsWith("paintBindingsV1."));
    const facts2 = {};
    if (record24(node.visibility).effective === false && !prior.some((p) => p === "visibility" || p === "visibility.effective")) {
      node.paintBindingsV1 = { fill: { required: true, tokenIds: [] }, stroke: { required: true, tokenIds: [] } };
      node.unknownFacts = unknown14;
      continue;
    }
    for (const kind of ["fill", "stroke"]) {
      const path = `appearance.${kind}`, paints = record24(node.appearance)[kind];
      let unavailable = !Array.isArray(paints) || prior.some((p) => p === path || path.startsWith(p + "."));
      const ids = [];
      let bound = true;
      if (Array.isArray(paints)) for (const raw of paints) {
        const paint = record24(raw);
        if (paint.visible === false || paint.opacity === 0) continue;
        if (paint.visible !== true || typeof paint.opacity !== "number" || !Number.isFinite(paint.opacity)) {
          unavailable = true;
          continue;
        }
        if (paint.type === "SOLID") {
          if (token(paint.tokenId)) ids.push(paint.tokenId);
          else if (paint.tokenId == null) bound = false;
          else unavailable = true;
        } else if (["GRADIENT_LINEAR", "GRADIENT_RADIAL", "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"].includes(paint.type)) {
          if (!Array.isArray(paint.gradientStops) || !paint.gradientStops.length) {
            unavailable = true;
            continue;
          }
          for (const rawStop of paint.gradientStops) {
            const stop = record24(rawStop);
            if (record24(stop.color).a === 0) continue;
            if (token(stop.tokenId)) ids.push(stop.tokenId);
            else if (stop.tokenId === null) bound = false;
            else unavailable = true;
          }
        } else if (typeof paint.type === "string") bound = false;
        else unavailable = true;
      }
      if (!bound || !unavailable) facts2[kind] = { required: bound, tokenIds: [...new Set(ids)].sort() };
      else unknown14.push(`paintBindingsV1.${kind}`);
    }
    node.paintBindingsV1 = facts2;
    node.unknownFacts = unknown14;
  }
}

// ../Apollo/packages/component-contract-core/src/native-slot-targets.ts
var record25 = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
var unknown10 = (node, fact2) => (node.unknownFacts || []).some((path) => path === fact2 || fact2.startsWith(path + ".") || path.startsWith(fact2 + "."));
function materializeNativeSlotTargets(snapshot, contract, comparison, paths) {
  if (contract.runtimePolicy.nativeSlotTargetsVersion !== 1 || snapshot.source?.truncated || !comparison.complete || !snapshot.variantReference?.complete) return;
  const ref = snapshot.variantReference;
  const roots = snapshot.nodes.filter((node) => snapshot.selection.includes(String(node.id)));
  const reps = contract.facts.representations.filter((rep) => rep.status !== "deprecated" && rep.platform === snapshot.context.platform && matchesCaptureRepresentation(rep, ref.componentKey, ref.componentSetKey));
  if (roots.length !== 1 || reps.length !== 1) return;
  const pathFor = (target) => {
    return selectedTargetPathHint(target, reps[0].id, ref.componentKey, contract.facts.variantEvidence?.occurrenceAddressVersion === 1)?.split(" / ").slice(1).join(" / ");
  };
  for (const target of contract.facts.targets) {
    const controls = contract.customizationPolicy.filter((rule) => rule.targetId === target.id && rule.status !== "deprecated" && ["allowed", "constrained"].includes(rule.permission)).flatMap((rule) => rule.controlPaths.filter((control) => control.kind === "slot-api" && control.target === target.id && control.property));
    const anchors = [...new Set(controls.map((control) => control.property))];
    const ownerIds = [...new Set(controls.map((control) => control.ownerTargetId || ""))];
    const slotPath = pathFor(target);
    if (target.resolution !== "resolved" || anchors.length !== 1 || ownerIds.length !== 1 || !slotPath || contract.facts.targets.filter((other) => other.semanticRole === target.semanticRole).length !== 1) continue;
    const property = anchors[0];
    const owners = ownerIds[0] ? contract.facts.targets.filter((other) => other.id === ownerIds[0] && other.resolution === "resolved") : [];
    if (ownerIds[0] && owners.length !== 1) continue;
    const ownerPath = owners.length ? pathFor(owners[0]) : "";
    if (ownerPath === void 0 || slotPath.split(" / ").slice(0, -1).join(" / ") !== ownerPath) continue;
    const actualOwners = ownerIds[0] ? snapshot.nodes.filter((node2) => node2.type === "INSTANCE" && record25(node2.semantic).role === owners[0].semanticRole && comparison.referencePaths?.[paths.get(String(node2.id))] === ownerPath) : roots;
    if (actualOwners.length !== 1) continue;
    const owner = actualOwners[0], expectedOwner = ref.nodeProperties[ownerPath];
    const identity = record25(record25(owner.component).identity), expectedIdentity = expectedOwner?.identity;
    if (!expectedIdentity?.componentKey || identity.componentKey !== expectedIdentity.componentKey || (identity.componentSetKey || "") !== (expectedIdentity.componentSetKey || "") || unknown10(owner, "component.identity") || unknown10(owner, `component.propertyTypes.${property}`) || record25(record25(owner.component).propertyTypes)[property] !== "SLOT" || expectedOwner.propertyTypes[property] !== "SLOT") continue;
    const nativeActual = snapshot.nodes.filter((node2) => node2.type === "SLOT" && node2.parentId === owner.id && record25(record25(node2.component).propertyReferenceBindings).slotContentId === property);
    const nativeRef = ref.nodes.filter((node2) => node2.type === "SLOT" && node2.path.split(" / ").slice(0, -1).join(" / ") === ownerPath && ref.nodeProperties[node2.path]?.propertyReferenceBindings?.slotContentId === property);
    if (nativeActual.length !== 1 || nativeRef.length !== 1 || nativeRef[0].path !== slotPath) continue;
    const node = nativeActual[0], actualPath = paths.get(String(node.id));
    if (!actualPath || comparison.referencePaths?.[actualPath] !== slotPath || unknown10(node, "component.propertyReferenceBindings") || unknown10(node, "type") || unknown10(node, "parentId") || snapshot.nodes.some((other) => other !== node && record25(other.semantic).role === target.semanticRole)) continue;
    node.semantic = { ...record25(node.semantic), role: target.semanticRole };
    node.unknownFacts = (node.unknownFacts || []).filter((path) => path !== "semantic.role");
    for (const entry of snapshot.nodes) {
      const availability = record25(entry.variantAvailability);
      availability.targets = { ...record25(availability.targets), [target.semanticRole]: {
        present: true,
        referenceState: "present",
        evidence: "native-slot-content-reference"
      } };
      entry.variantAvailability = availability;
      entry.unknownFacts = (entry.unknownFacts || []).filter((path) => path !== `variantAvailability.targets.${target.semanticRole}.present`);
    }
    if (controls.some((control) => control.contentOwnership === "external")) {
      node.slotBoundaryV1 = {
        contentOwnership: "external",
        targetId: target.id,
        property,
        evidence: "native-slot-content-reference",
        ...ownerIds[0] ? { ownerTargetId: ownerIds[0] } : {}
      };
    }
  }
}

// ../Apollo/packages/component-contract-core/src/slot-target-facts.ts
var record26 = (v) => v && typeof v === "object" ? v : {};
function materializeSlotTargets(snapshot, contract) {
  if (contract.runtimePolicy.slotTargetFactsVersion !== 1) return;
  for (const node of snapshot.nodes) delete node.slotBoundaryV1;
  const nestedTargets = new Set(contract.customizationPolicy.flatMap((r) => r.controlPaths.filter((p) => p.kind === "slot-api" && p.ownerTargetId).map((p) => p.target)));
  for (const target of contract.facts.targets.filter((t) => nestedTargets.has(t.id))) for (const node of snapshot.nodes) {
    if (record26(node.semantic).role === target.semanticRole) delete record26(node.semantic).role;
    delete record26(record26(node.variantAvailability).targets)[target.semanticRole];
    const key2 = `variantAvailability.targets.${target.semanticRole}.present`;
    node.unknownFacts = [.../* @__PURE__ */ new Set([...node.unknownFacts || [], key2])];
  }
  if (snapshot.source?.propertyReferenceIdentityVersion !== 1) return;
  const ref = snapshot.variantReference, paths = snapshotPaths(snapshot);
  if (!ref || !paths) return;
  const comparison = compareInstanceBoundaries(snapshot, ref);
  if (!comparison.complete) return;
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
  if (!root2 || !["verified", "partial"].includes(String(record26(root2.variantAvailability).status))) return;
  materializeNativeSlotTargets(snapshot, contract, comparison, paths);
  for (const target of contract.facts.targets) {
    const rules = contract.customizationPolicy.filter((r) => r.targetId === target.id && r.status !== "deprecated" && ["allowed", "constrained"].includes(r.permission));
    const properties = [...new Set(rules.flatMap((r) => r.controlPaths.filter((p) => p.kind === "slot-api" && p.target === target.id && p.property).map((p) => p.property)))];
    if (target.resolution !== "resolved" || properties.length !== 1) continue;
    const representations = contract.facts.representations.filter((r) => r.status !== "deprecated" && r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
    const property = properties[0], referencePath = (contract.runtimePolicy.occurrenceAddressVersion === 1 ? representations.length === 1 ? selectedTargetPathHint(target, representations[0].id, ref.componentKey, contract.facts.variantEvidence?.occurrenceAddressVersion === 1) : void 0 : target.pathHint)?.split(" / ").slice(1).join(" / ");
    const declarations = rules.flatMap((r) => r.controlPaths.filter((p) => p.kind === "slot-api" && p.target === target.id && p.property === property));
    if (declarations.some((p) => p.ownerTargetId !== void 0)) {
      const ownerIds = [...new Set(declarations.map((p) => p.ownerTargetId))];
      if (ownerIds.length !== 1 || !ownerIds[0]) continue;
      const owners = contract.facts.targets.filter((t) => t.id === ownerIds[0] && t.resolution === "resolved");
      const reps = contract.facts.representations.filter((r) => r.status !== "deprecated" && r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
      if (owners.length !== 1 || reps.length !== 1 || owners[0].id === target.id) continue;
      const pathFor = (t) => {
        return selectedTargetPathHint(t, reps[0].id, ref.componentKey, contract.facts.variantEvidence?.occurrenceAddressVersion === 1)?.split(" / ").slice(1).join(" / ");
      };
      const ownerPath = pathFor(owners[0]), slotPath = pathFor(target);
      if (ownerPath === void 0 || !slotPath || slotPath.split(" / ").slice(0, -1).join(" / ") !== ownerPath) continue;
      const nodes = snapshot.nodes.filter((n) => n.type === "INSTANCE" && record26(n.semantic).role === owners[0].semanticRole && comparison.referencePaths?.[paths.get(String(n.id))] === ownerPath);
      if (nodes.length !== 1) continue;
      const owner = nodes[0], expectedOwner = ref.nodeProperties[ownerPath], ownerComponent = record26(owner.component);
      const identity = record26(ownerComponent.identity), expectedIdentity = expectedOwner?.identity;
      const unknown14 = (n, p) => (n.unknownFacts || []).some((v) => v === p || p.startsWith(v + ".") || v.startsWith(p + "."));
      if (!expectedIdentity?.componentKey || identity.componentKey !== expectedIdentity.componentKey || (identity.componentSetKey || "") !== (expectedIdentity.componentSetKey || "") || unknown14(owner, "component.identity") || unknown14(owner, `component.propertyTypes.${property}`) || ownerComponent.propertyTypes?.[property] !== "BOOLEAN" || expectedOwner.propertyTypes[property] !== "BOOLEAN" || comparison.boundaries.some((b) => ownerPath === b.referencePath || ownerPath.startsWith(b.referencePath + " / "))) continue;
      const nativeRef = ref.nodes.filter((n) => n.type === "INSTANCE" && n.path.split(" / ").slice(0, -1).join(" / ") === ownerPath && ref.nodeProperties[n.path]?.propertyReferenceBindings?.visible === property);
      const nativeActual = snapshot.nodes.filter((n) => n.type === "INSTANCE" && n.parentId === owner.id && record26(record26(n.component).propertyReferenceBindings).visible === property);
      if (nativeRef.length !== 1 || nativeRef[0].path !== slotPath || nativeActual.length !== 1) continue;
      const node2 = nativeActual[0];
      if (unknown14(node2, "component.propertyReferenceBindings") || unknown14(node2, "parentId") || unknown14(node2, "type") || comparison.referencePaths?.[paths.get(String(node2.id))] !== slotPath || contract.facts.targets.filter((t) => t.semanticRole === target.semanticRole).length !== 1 || snapshot.nodes.some((n) => n !== node2 && record26(n.semantic).role === target.semanticRole)) continue;
      node2.semantic = { ...record26(node2.semantic), role: target.semanticRole };
      if (declarations.some((p) => p.contentOwnership === "external")) node2.slotBoundaryV1 = {
        contentOwnership: "external",
        targetId: target.id,
        property,
        evidence: "native-slot-reference",
        ownerTargetId: owners[0].id
      };
      node2.unknownFacts = (node2.unknownFacts || []).filter((p) => p !== "semantic.role");
      for (const entry of snapshot.nodes) {
        const availability = record26(entry.variantAvailability);
        availability.targets = { ...record26(availability.targets), [target.semanticRole]: { present: true, referenceState: "present", evidence: "native-nested-slot-reference" } };
        entry.variantAvailability = availability;
        entry.unknownFacts = (entry.unknownFacts || []).filter((p) => p !== `variantAvailability.targets.${target.semanticRole}.present`);
      }
      continue;
    }
    if (!referencePath || ref.nodeProperties[referencePath]?.propertyReferenceBindings?.visible !== property || ref.nodeProperties[""]?.propertyTypes[property] !== "BOOLEAN") continue;
    if (snapshot.nodes.filter((n) => n.type === "INSTANCE" && n.parentId === root2.id && record26(record26(n.component).propertyReferenceBindings).visible === property).length !== 1 || ref.nodes.filter((n) => n.type === "INSTANCE" && !n.path.includes(" / ") && ref.nodeProperties[n.path]?.propertyReferenceBindings?.visible === property).length !== 1) continue;
    const candidates = snapshot.nodes.filter((n) => n.type === "INSTANCE" && n.parentId === root2.id && record26(record26(n.component).propertyReferenceBindings).visible === property && comparison.referencePaths?.[paths.get(String(n.id))] === referencePath);
    if (candidates.length !== 1 || snapshot.nodes.some((n) => n !== candidates[0] && record26(n.semantic).role === target.semanticRole)) continue;
    const node = candidates[0];
    node.semantic = { ...record26(node.semantic), role: target.semanticRole };
    if (rules.some((r) => r.controlPaths.some((p) => p.kind === "slot-api" && p.target === target.id && p.property === property && p.contentOwnership === "external"))) {
      node.slotBoundaryV1 = { contentOwnership: "external", targetId: target.id, property, evidence: "native-slot-reference" };
    }
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "semantic.role");
    for (const entry of snapshot.nodes) {
      const availability = record26(entry.variantAvailability);
      availability.targets = { ...record26(availability.targets), [target.semanticRole]: { present: true, referenceState: "present", evidence: "native-slot-reference" } };
      entry.variantAvailability = availability;
      entry.unknownFacts = (entry.unknownFacts || []).filter((p) => p !== `variantAvailability.targets.${target.semanticRole}.present`);
    }
  }
}

// ../Apollo/packages/component-contract-core/src/library-text-facts.ts
var record27 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var unknown11 = (node, fact2) => (node.unknownFacts || []).some((p) => p === fact2 || fact2.startsWith(p + "."));
var ordered2 = (shape) => shape.slice().sort((a, b) => a.path.localeCompare(b.path) || a.type.localeCompare(b.type));
function materializeLibraryText(snapshot, contract) {
  if (!contract.capabilities.facts.some((f) => f.startsWith("libraryTextV1."))) return;
  const paths = snapshotPaths(snapshot), byId = new Map(snapshot.nodes.map((n) => [String(n.id), n]));
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
  const verified = root2 && ["verified", "partial"].includes(String(record27(root2.variantAvailability).status));
  for (const node of snapshot.nodes) {
    delete node.libraryTextV1;
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "libraryTextV1" && !p.startsWith("libraryTextV1."));
    if (node.type !== "TEXT") continue;
    node.unknownFacts.push("libraryTextV1.characters", "libraryTextV1.trimmedCharacters", "libraryTextV1.actualTrimmedCharacters");
    if (!paths || !verified || record27(node.baselineProvenance).status !== "matched") continue;
    let owner = byId.get(String(node.parentId));
    const visited = /* @__PURE__ */ new Set();
    while (owner && owner.type !== "INSTANCE" && !visited.has(String(owner.id))) {
      visited.add(String(owner.id));
      owner = byId.get(String(owner.parentId));
    }
    if (!owner || owner.type !== "INSTANCE" || record27(owner.baselineProvenance).status !== "matched" || unknown11(owner, "component.identity") || unknown11(owner, "component.identity.componentKey") || unknown11(owner, "component.identity.componentSetKey")) continue;
    const component = record27(owner.component), identity = record27(component.identity);
    const candidates = (contract.facts.variantEvidence?.libraryText || []).filter((v) => v.componentKey === identity.componentKey && (v.componentSetKey === identity.componentSetKey || !identity.componentSetKey && v.componentSetKey === v.componentKey));
    if (candidates.length !== 1) continue;
    const expected = candidates[0];
    if (Object.entries(expected.properties).some(([name, value]) => component.propertyTypes?.[name] !== "VARIANT" || component.properties?.[name] !== value || unknown11(owner, `component.properties.${name}`) || unknown11(owner, `component.propertyTypes.${name}`))) continue;
    const base = paths.get(String(owner.id));
    const relative2 = (p) => p === base ? "" : p.slice(base.length + (base ? 3 : 0));
    const descendants = snapshot.nodes.filter((n) => {
      const p = paths.get(String(n.id));
      return p === base || !base || p.startsWith(base + " / ");
    });
    const shape = descendants.map((n) => ({ path: relative2(paths.get(String(n.id))), type: n === owner ? "ROOT" : String(n.type) }));
    if (stableHash(ordered2(shape)) !== stableHash(ordered2(expected.structure))) continue;
    const path = relative2(paths.get(String(node.id))), text3 = expected.characters[path];
    if (typeof text3 !== "string") continue;
    const actual = record27(node.text).characters;
    node.libraryTextV1 = {
      characters: text3,
      trimmedCharacters: text3.trim(),
      componentKey: expected.componentKey,
      sourceHash: contract.facts.variantEvidence.sourceHash,
      ...typeof actual === "string" && !unknown11(node, "text.characters") ? { actualTrimmedCharacters: actual.trim() } : {}
    };
    node.unknownFacts = node.unknownFacts.filter((p) => p !== "libraryTextV1.characters" && p !== "libraryTextV1.trimmedCharacters" && !(p === "libraryTextV1.actualTrimmedCharacters" && typeof actual === "string" && !unknown11(node, "text.characters")));
  }
}

// ../Apollo/packages/component-contract-core/src/structural-order.ts
function materializeStructuralOrder(snapshot, contract) {
  if (contract.runtimePolicy.structuralOrderFactsVersion !== 1) return;
  const nodes = snapshot.nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const byParent = /* @__PURE__ */ new Map();
  for (const node of nodes) if (node.parentId) byParent.set(node.parentId, [...byParent.get(node.parentId) || [], node]);
  const unknown14 = (node, path) => (node.unknownFacts || []).some((p) => p === path || path.startsWith(p + "."));
  const duplicateIds = byId.size !== nodes.length;
  for (const node of nodes) {
    delete node.structuralOrderV1;
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "structuralOrderV1.directChildRoles");
    const ids = node.childIds;
    const children = Array.isArray(ids) ? ids.map((id) => byId.get(id)) : [];
    const valid = !duplicateIds && snapshot.source?.truncated !== true && Array.isArray(ids) && !unknown14(node, "childIds") && new Set(ids).size === ids.length && children.every((child) => child && child.parentId === node.id && !unknown14(child, "parentId") && !unknown14(child, "semantic.role") && typeof child.semantic?.role === "string" && child.semantic.role.length > 0) && (byParent.get(node.id) || []).every((child) => ids.includes(child.id));
    if (valid) node.structuralOrderV1 = { directChildRoles: children.map((child) => child.semantic.role) };
    else node.unknownFacts.push("structuralOrderV1.directChildRoles");
  }
}

// ../Apollo/packages/component-contract-core/src/variant-text-targets.ts
var record28 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var unknown12 = (n, path) => (n.unknownFacts || []).some((p) => p === path || path.startsWith(p + "."));
function materializeVariantTextTargets(snapshot, contract) {
  if (contract.runtimePolicy.variantTextTargetsVersion !== 1) return;
  for (const target of contract.facts.targets.filter((t) => t.variantContinuity)) for (const node of snapshot.nodes) {
    if (record28(node.semantic).role === target.semanticRole && record28(record28(node.variantAvailability).targets)[target.semanticRole]?.present !== true) {
      delete record28(node.semantic).role;
    }
  }
  if (snapshot.instanceContentReferences?.schemaVersion !== "apollo.instance-content-references.v4") return;
  const ref = snapshot.variantReference, paths = snapshotPaths(snapshot);
  if (!ref || !paths || variantAvailability(snapshot, contract).status !== "partial") return;
  const reps = contract.facts.representations.filter((r) => r.status !== "deprecated" && r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey));
  if (reps.length !== 1) return;
  const targetPath = (t) => {
    const p = selectedTargetPathHint(t, reps[0].id, ref.componentKey, contract.facts.variantEvidence?.occurrenceAddressVersion === 1);
    return p ? relativeTargetPath(p) : void 0;
  };
  const candidates = [];
  for (const target of contract.facts.targets) {
    const c = target.variantContinuity;
    if (!c || c.kind !== "same-family-text" || target.resolution !== "resolved") continue;
    const anchors = contract.facts.targets.filter((t) => t.id === c.anchorTargetId && t.resolution === "resolved" && !t.variantContinuity);
    if (anchors.length !== 1) continue;
    const path = targetPath(target), anchorPath = targetPath(anchors[0]);
    if (!path || !anchorPath || !path.startsWith(anchorPath + " / ")) continue;
    if (ref.nodes.filter((n) => n.path === path && n.type === "TEXT").length !== 1) continue;
    const anchorsInSnapshot = snapshot.nodes.filter((n) => record28(n.semantic).role === anchors[0].semanticRole && n.type === "INSTANCE");
    if (anchorsInSnapshot.length !== 1) continue;
    const anchor = anchorsInSnapshot[0], ap = record28(anchor.baselineProvenance);
    if (ap.status !== "matched" || ap.kind !== "independent-host-variant" || ap.boundaryNodeId !== anchor.id || ap.referencePath !== anchorPath || !ap.componentSetKey || unknown12(anchor, "component.identity")) continue;
    const identity = record28(record28(anchor.component).identity);
    if (identity.componentKey !== ap.componentKey || identity.componentSetKey !== ap.componentSetKey) continue;
    const result = snapshot.instanceContentResults?.filter((r) => r.boundaryNodeId === anchor.id) || [];
    if (result.length !== 1 || result[0].status !== "matched" || !result[0].lineageProven) continue;
    const attempts = snapshot.instanceContentReferences.attempts.filter((a) => a.boundaryNodeId === anchor.id);
    if (attempts.length !== 1 || attempts[0].strategy !== "pristine-host-variant-properties" || !attempts[0].reference) continue;
    const reference = attempts[0].reference, referencePaths = snapshotPaths(reference);
    const refs2 = reference.nodes.filter((n) => referencePaths?.get(String(n.id)) === path && n.type === "TEXT");
    if (refs2.length !== 1) continue;
    const nodes = snapshot.nodes.filter((n) => {
      const p = record28(n.baselineProvenance);
      return n.type === "TEXT" && p.status === "matched" && p.kind === "independent-host-variant" && p.boundaryNodeId === anchor.id && p.componentKey === ap.componentKey && p.referencePath === path && result[0].matchedNodeIds.includes(String(n.id));
    });
    if (nodes.length !== 1) continue;
    const node = nodes[0], byId = new Map(snapshot.nodes.map((n) => [String(n.id), n]));
    let parent3 = byId.get(String(node.parentId));
    while (parent3 && parent3.type !== "INSTANCE") parent3 = byId.get(String(parent3.parentId));
    if (parent3 !== anchor || unknown12(node, "type") || unknown12(node, "parentId")) continue;
    candidates.push({ role: target.semanticRole, node });
  }
  for (const { role, node } of candidates) {
    if (contract.facts.targets.filter((t) => t.semanticRole === role).length !== 1 || candidates.filter((c) => c.node.id === node.id).length !== 1 || snapshot.nodes.some((n) => n !== node && record28(n.semantic).role === role)) continue;
    node.semantic = { ...record28(node.semantic), role };
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "semantic.role");
    for (const entry of snapshot.nodes) {
      const facts2 = record28(entry.variantAvailability);
      facts2.targets = { ...record28(facts2.targets), [role]: { present: true, referenceState: "present", evidence: "explicit-independent-host-variant-text" } };
      entry.variantAvailability = facts2;
      entry.unknownFacts = (entry.unknownFacts || []).filter((p) => p !== `variantAvailability.targets.${role}.present`);
    }
  }
}

// ../Apollo/packages/component-contract-core/src/line-height-reference.ts
var record29 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var known = (n, p) => !(n.unknownFacts || []).some((x) => x === p || p.startsWith(x + ".") || x.startsWith(p + "."));
function materializeLineHeightReferences(snapshot, contract) {
  const roles = [...new Set(contract.capabilities.facts.filter((f) => f.startsWith("lineHeightReferenceV1.")).map((f) => f.slice("lineHeightReferenceV1.".length)))];
  if (!roles.length) return;
  const roots = snapshot.nodes.filter((n) => snapshot.selection.includes(String(n.id))), values = {};
  for (const role of roles) {
    if (roots.length !== 1 || !["verified", "partial"].includes(record29(roots[0].variantAvailability).status)) continue;
    const targets = contract.facts.targets.filter((t) => t.semanticRole === role && t.resolution === "resolved");
    const nodes = snapshot.nodes.filter((n2) => n2.type === "TEXT" && record29(n2.semantic).role === role);
    if (targets.length !== 1 || nodes.length !== 1) continue;
    const n = nodes[0], proof = record29(n.baselineProvenance), text3 = record29(record29(record29(n.baseline).effective).text), lh = record29(text3.lineHeight);
    if (proof.status !== "matched" || !known(n, "baseline.effective.text.lineHeight") || !known(n, "baselineProvenance")) continue;
    const pixels = lh.unit === "PIXELS" ? lh.value : lh.unit === "PERCENT" && known(n, "baseline.effective.text.fontSize") && typeof text3.fontSize === "number" && Number.isFinite(text3.fontSize) && text3.fontSize > 0 ? text3.fontSize * lh.value / 100 : void 0;
    if (typeof pixels === "number" && Number.isFinite(pixels) && pixels > 0) values[role] = pixels;
  }
  for (const node of snapshot.nodes) {
    node.lineHeightReferenceV1 = { ...values };
    node.unknownFacts = (node.unknownFacts || []).filter((p) => p !== "lineHeightReferenceV1" && !p.startsWith("lineHeightReferenceV1."));
    for (const role of roles) if (values[role] === void 0) node.unknownFacts.push(`lineHeightReferenceV1.${role}`);
  }
}

// ../Apollo/packages/component-contract-core/src/native-slot-capture.ts
var record30 = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
var unknown13 = (node, fact2) => (node?.unknownFacts || []).some((f) => f === fact2 || f.startsWith(fact2 + ".") || fact2.startsWith(f + "."));
function nativeSlotCapturePlan(contract) {
  if (contract.runtimePolicy.nativeSlotTargetsVersion !== 1 || contract.componentDependencies?.length || contract.facts.transitions?.length || contract.nonExecutableRules.length || contract.capabilities.operators.some((op) => !["all", "any", "equals", "one-of", "not", "matches-effective-baseline", "fact-present", "binding-satisfies"].includes(op)) || contract.capabilities.facts.some((f) => /^(relations|children|structuralOrder|host|semanticTargets|semanticApi|transitions|dependency)/.test(f))) return;
  const policies = contract.customizationPolicy.filter((p) => p.status !== "deprecated");
  if (policies.some((p) => (p.targetScope || "self") !== "self" || p.execution?.route === "context-only" || p.execution?.route === "delegated")) return;
  const boundaries = [];
  for (const p of policies) {
    if (p.status !== "reviewed" || p.permission !== "allowed" || p.capability !== "composition.content" || p.applicability.variants !== "all" || p.applicability.modes !== "all" || p.applicability.products?.length || p.applicability.channels?.length || Object.keys(p.applicability.context || {}).length || Object.keys(p.applicability.contextDomains || {}).length) continue;
    const target = contract.facts.targets.find((t) => t.id === p.targetId && t.resolution === "resolved");
    if (!target) continue;
    const controls = p.controlPaths.filter((c) => c.kind === "slot-api" && c.target === target.id && c.contentOwnership === "external" && c.property && !c.ownerTargetId);
    if (controls.length !== 1 || policies.filter((other) => other.targetId === target.id).some((other) => other !== p && other.capability === "composition.content")) continue;
    for (const rep of contract.facts.representations.filter((r) => r.status !== "deprecated")) {
      const hints = target.representationHints?.filter((h) => h.representationId === rep.id) || [];
      if (hints.length > 1) continue;
      const path = (hints[0]?.pathHint || target.pathHint)?.split(" / ").slice(1).join(" / ");
      if (!path || path.includes(" / ")) continue;
      if (policies.some((other) => {
        const t = contract.facts.targets.find((t2) => t2.id === other.targetId);
        const h = t?.representationHints?.find((h2) => h2.representationId === rep.id);
        const otherPath = (h?.pathHint || t?.pathHint)?.split(" / ").slice(1).join(" / ");
        return otherPath?.startsWith(path + " / ");
      })) continue;
      boundaries.push({ targetId: target.id, property: controls[0].property, path, representationId: rep.id });
    }
  }
  return boundaries.length ? { version: 1, manualSourceHash: contract.package.manualSourceHash, boundaries } : void 0;
}
function confirmedNativeSlotCaptureBoundaries(plan, reference, representationId, componentKey, componentSetKey) {
  if (plan?.version !== 1 || !reference.complete || reference.componentKey !== componentKey || reference.componentSetKey !== componentSetKey) return [];
  return plan.boundaries.filter((b) => b.representationId === representationId && reference.nodeProperties[""]?.propertyTypes[b.property] === "SLOT" && reference.nodes.filter((n) => n.type === "SLOT" && !n.path.includes(" / ") && reference.nodeProperties[n.path]?.propertyReferenceBindings?.slotContentId === b.property).length === 1 && reference.nodes.some((n) => n.path === b.path && n.type === "SLOT" && reference.nodeProperties[n.path]?.propertyReferenceBindings?.slotContentId === b.property));
}
function validateNativeSlotCaptureScope(snapshot, contract) {
  const scope = snapshot.source?.nativeSlotCaptureScope;
  if (!scope) return;
  const plan = nativeSlotCapturePlan(contract), ref = snapshot.variantReference, paths = snapshotPaths(snapshot);
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
  const identity = record30(record30(root2?.component).identity);
  const reps = ref ? contract.facts.representations.filter((r) => r.status !== "deprecated" && r.platform === snapshot.context.platform && matchesCaptureRepresentation(r, ref.componentKey, ref.componentSetKey)) : [];
  let valid = scope.version === 1 && plan?.manualSourceHash === scope.manualSourceHash && !!paths && reps.length === 1 && !!ref && identity.componentKey === ref.componentKey && (identity.componentSetKey || "") === ref.componentSetKey && !unknown13(root2, "component.identity");
  const confirmed = ref && reps.length === 1 ? confirmedNativeSlotCaptureBoundaries(plan, ref, reps[0].id, identity.componentKey, identity.componentSetKey || "") : [];
  const seen = /* @__PURE__ */ new Set();
  for (const omission of scope.omissions) {
    const node = snapshot.nodes.find((n) => n.id === omission.nodeId), component = record30(node?.component);
    const same2 = confirmed.filter((b) => b.targetId === omission.targetId && b.property === omission.property && b.path === paths?.get(omission.nodeId));
    const consumers = snapshot.nodes.filter((n) => n.type === "SLOT" && n.parentId === root2?.id && record30(record30(n.component).propertyReferenceBindings).slotContentId === omission.property);
    if (seen.has(omission.nodeId) || same2.length !== 1 || omission.path !== paths?.get(omission.nodeId) || node?.type !== "SLOT" || node.parentId !== root2?.id || component.propertyReferenceBindings?.slotContentId !== omission.property || record30(record30(root2?.component).propertyTypes)[omission.property] !== "SLOT" || unknown13(root2, `component.propertyTypes.${omission.property}`) || consumers.length !== 1 || !Array.isArray(node.childIds) || node.childIds.length !== 0 || (node.unknownFacts || []).some((f) => f.startsWith("component.propertyReferenceBindings") || f === "type" || f === "parentId")) valid = false;
    seen.add(omission.nodeId);
  }
  if (!scope.omissions.length) valid = false;
  if (!valid && snapshot.source) {
    snapshot.source.truncated = true;
    snapshot.source.captureTopology = { version: 1, complete: false, limitReached: false, issues: [{ kind: "unconfirmed-scope", path: "" }] };
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
function restoreInstanceMainAliasBaseline(snapshot) {
  const base = snapshot.instanceContentReferences?.base, original = snapshot.variantReference;
  if (snapshot.source?.instanceMainComponentAliasesVersion !== 1 || !base || !original?.complete || !base.source?.rootNodeId || base.source.rootNodeId === snapshot.source.rootNodeId || base.context.platform !== snapshot.context.platform || stableHash(base.context.modes) !== stableHash(snapshot.context.modes)) return;
  const reference = captureVariantReference(base, base.source.componentKey || "", base.source.componentSetKey || "", original.definedProperties);
  if (!reference.complete || stableHash(reference) !== stableHash(original)) return;
  snapshot.nodes = materializeEffectiveBaseline(snapshot, base, true).snapshot.nodes;
}

// ../Apollo/packages/component-contract-core/src/runtime.ts
function prepareValidationSnapshot(source, contract, inheritedMainAliases, ownerBaseline) {
  assertDeclaredTargetContract(contract);
  assertNativeRuleFactPolicies(contract);
  assertConfiguredPropertyContract(contract);
  const shape = contractRepresentationShape(contract), flags = representationFeatureFlags(shape);
  if (flags.evidence || flags.bindings || contract.runtimePolicy.representationEvidenceVersion !== void 0 || contract.runtimePolicy.crossRepresentationBindingsVersion !== void 0) {
    if (contract.runtimePolicy.representationEvidenceVersion !== void 0 && contract.runtimePolicy.representationEvidenceVersion !== 1 || contract.runtimePolicy.crossRepresentationBindingsVersion !== flags.bindingVersion || representationEvidenceErrors(shape).length || flags.evidence !== (contract.runtimePolicy.representationEvidenceVersion === 1)) throw new Error("REPRESENTATION_RUNTIME_UNSUPPORTED");
    if (flags.scopedDependencies && validateComponentDependencies({ component: contract.facts.component, targets: contract.facts.targets, representations: contract.facts.representations, componentDependencies: contract.componentDependencies }).length) throw new Error("COMPONENT_DEPENDENCY_RUNTIME_UNSUPPORTED");
  }
  const snapshot = JSON.parse(JSON.stringify(source));
  delete snapshot.snapshotHash;
  const mainAliases = contract.runtimePolicy.instanceMainComponentAliasesVersion === 1 || inheritedMainAliases === 1;
  configureInstanceMainAliases(snapshot, mainAliases);
  if (mainAliases) restoreInstanceMainAliasBaseline(snapshot);
  if (ownerBaseline) for (const node of snapshot.nodes) {
    const baseline = ownerBaseline[String(node.id)];
    if (baseline) {
      node.unknownFacts = (node.unknownFacts || []).filter((f) => f !== "baseline.effective" && !f.startsWith("baseline.effective."));
      node.baseline = { effective: JSON.parse(JSON.stringify(baseline.effective)) };
      node.baselineProvenance = JSON.parse(JSON.stringify(baseline.provenance));
    }
  }
  validateNativeSlotCaptureScope(snapshot, contract);
  materializeValidationMode(snapshot, contract);
  materializeSemanticFacts(snapshot, contract);
  materializeValidationIntent(snapshot, contract);
  if (!contract.facts.variantEvidence && (snapshot.targetResolution?.schemaVersion === TARGET_RESOLUTION_SCHEMA || contract.runtimePolicy.ruleScopeFactsVersion === 1)) materializeTargetResolution(snapshot, contract);
  if (["variant-facts-v3", "variant-facts-v4", "dependency-facts-v5"].includes(contract.package.snapshotProfile || "")) materializeVariantFacts(snapshot, contract);
  if (["variant-facts-v4", "dependency-facts-v5"].includes(contract.package.snapshotProfile || "")) materializeInstanceContentReferences(snapshot);
  if (ownerBaseline) for (const node of snapshot.nodes) {
    const baseline = ownerBaseline[String(node.id)];
    if (baseline?.unknownFacts?.length && stableHash(node.baselineProvenance) === stableHash(baseline.provenance))
      node.unknownFacts = [.../* @__PURE__ */ new Set([...node.unknownFacts || [], ...baseline.unknownFacts])];
  }
  materializeVerifiedVariantTargets(snapshot, contract);
  materializeVariantTextTargets(snapshot, contract);
  materializeLineHeightReferences(snapshot, contract);
  materializeSlotTargets(snapshot, contract);
  materializeDeclaredTargetIdentities(snapshot, contract);
  materializeInstanceReplacements(snapshot, contract);
  materializeNativeTargetProperties(snapshot, contract);
  materializeTextContent(snapshot, contract);
  if (["component-facts-v2", "variant-facts-v3", "variant-facts-v4", "dependency-facts-v5"].includes(contract.package.snapshotProfile || "")) materializeComponentFacts(snapshot, contract);
  if (contract.package.snapshotProfile === "dependency-facts-v5") materializeDependencyFacts(snapshot, contract);
  if (contract.runtimePolicy.gradientPaintFactsVersion === 1) materializeGradientPaintEvidence(snapshot);
  if (contract.runtimePolicy.paintBindingFactsVersion === 1) materializePaintBindings(snapshot);
  materializeTextStyleBindings(snapshot, contract);
  materializeTextBindingIdentities(snapshot, contract);
  if (contract.runtimePolicy.ruleScopeFactsVersion === 1) materializeRuleScopeFacts(snapshot, contract);
  materializeTargetSemanticFacts(snapshot, contract);
  materializeStructuralOrder(snapshot, contract);
  materializeLibraryText(snapshot, contract);
  materializeDependencyComposition(snapshot, contract);
  materializeMemberCollections(snapshot, contract);
  materializeTransitionFacts(snapshot, contract, (before) => prepareValidationSnapshot(before, {
    ...contract,
    runtimePolicy: { ...contract.runtimePolicy, transitionFactsVersion: void 0 }
  }));
  if (contract.runtimePolicy.configuredNativePropertyConformanceVersion === 1) materializeConfiguredNativeProperties(source, snapshot, contract);
  materializeDependencyUsages(snapshot, contract, prepareValidationSnapshot);
  return snapshot;
}
function validationSnapshotHash(snapshot, contract) {
  return (0, import_predicate.snapshotHash)(prepareValidationSnapshot(snapshot, contract));
}
function prepareAuthoringPreviewContract(contract) {
  return {
    ...contract,
    rules: contract.rules.map((rule) => {
      const authority = rule.authority;
      if (authority?.status !== "draft") return rule;
      return {
        ...rule,
        authority: { ...authority, status: "active" }
      };
    })
  };
}
function evaluateCompiledContract(snapshot, contract, ancestry = [], inheritedMainAliases, ownerBaseline) {
  const mainAliases = contract.runtimePolicy.instanceMainComponentAliasesVersion === 1 || inheritedMainAliases === 1 ? 1 : void 0;
  const prepared = prepareValidationSnapshot(snapshot, contract, mainAliases, ownerBaseline);
  const result = (0, import_predicate.evaluateRules)({
    snapshot: prepared,
    rules: contract.rules,
    ruleRelease: contract.package.manualSourceHash
  });
  configuredCaptureUnknowns(result, contract);
  if (contract.runtimePolicy.memberCollectionsVersion === 1) {
    const rulesById = /* @__PURE__ */ new Map();
    const nodesById = /* @__PURE__ */ new Map();
    for (const rule of contract.rules) if (!rulesById.has(rule.ruleId)) rulesById.set(rule.ruleId, rule);
    for (const node of prepared.nodes) if (!nodesById.has(node.id)) nodesById.set(node.id, node);
    const root2 = nodesById.get(prepared.selection[0]);
    for (const evaluation of result.evaluations) {
      const rule = rulesById.get(evaluation.ruleId), id = rule?.presentation?.collectionId;
      const fact2 = id && root2?.memberCollectionsV1?.[id];
      if (!fact2) continue;
      evaluation.collection = { id, ...fact2, summary: memberCollectionSummary(fact2) };
      if (evaluation.classification === "violation") {
        evaluation.focusNodeId = fact2.violations?.find((v) => v.nodeId)?.nodeId || fact2.ownerNodeId || evaluation.focusNodeId;
        evaluation.focusNodeName = nodesById.get(evaluation.focusNodeId)?.name || evaluation.focusNodeName;
      }
    }
  }
  if (!contract.componentDependencies?.length) return result;
  const runs = [];
  const evaluations = result.evaluations.slice();
  const ancestors = [...ancestry, contract.package.componentId];
  const claimedChildren = /* @__PURE__ */ new Set();
  for (const d of contract.componentDependencies) {
    if (!d.bindings.length) continue;
    const issue = d.issue || dependencyPinIssue(d, d.contract) || (ancestors.includes(d.componentId) ? "dependency-cycle" : ancestors.length > COMPONENT_DEPENDENCY_DEPTH_LIMIT ? "dependency-depth-limit" : void 0);
    for (const b of d.bindings) {
      const run = { dependencyId: d.id, bindingId: b.id, componentId: d.componentId, revision: d.revision, compiledHash: d.compiledHash };
      runs.push(run);
      if (issue) {
        Object.assign(run, { status: "not-executed", reason: issue });
        continue;
      }
      const resolved = resolveFixedNestedBinding(prepared, d, b, false, contract);
      if (resolved.status === "inactive") {
        Object.assign(run, { status: "not-applicable", reason: resolved.reason });
        continue;
      }
      Object.assign(run, { nodeId: resolved.nodeId });
      if (resolved.status !== "active" || !resolved.nodeId || !resolved.identityValid) {
        Object.assign(run, { status: "not-executed", reason: resolved.identityValid === false ? "dependency-child-identity-mismatch" : resolved.reason });
        continue;
      }
      if (contract.runtimePolicy.directChildDependenciesVersion === 1) {
        if (claimedChildren.has(resolved.nodeId)) {
          Object.assign(run, { status: "not-executed", reason: "dependency-child-claimed-twice" });
          continue;
        }
        claimedChildren.add(resolved.nodeId);
      }
      const capture = validatedDependencyCapture(prepared, resolved.nodeId, d.contract);
      if (!capture.snapshot || !capture.nodeMap) {
        Object.assign(run, { status: "not-executed", reason: capture.reason });
        continue;
      }
      const output = evaluateCompiledContract(capture.snapshot, d.contract, ancestors, mainAliases, capture.ownerBaseline);
      const childEvaluations = output.evaluations;
      const unsupported = d.contract.nonExecutableRules.length || d.contract.customizationPolicy.some((p) => p.status !== "deprecated" && ["delegated", "context-only"].includes(p.execution.route));
      const incomplete = unsupported || childEvaluations.some((e) => ["not-executed", "human-review", "not-evaluable", "unknown"].includes(String(e.classification)) || String(e.trace?.reason) === "rule authority is not active" || String(e.trace?.reason) === "selector matched no visible nodes" && (contract.runtimePolicy.dependencyCompletionVersion !== 1 || e.classification !== "not-applicable")) || (output.dependencyRuns || []).some((r) => r.status === "not-executed" || r.status === "incomplete");
      Object.assign(run, {
        status: incomplete ? "incomplete" : "executed",
        snapshotHash: output.snapshotHash,
        evaluations: childEvaluations.length,
        ...incomplete ? { reason: "dependency-check-incomplete" } : {}
      });
      for (const e of childEvaluations) evaluations.push({
        ...e,
        evaluationId: stableHash({ dependencyId: d.id, bindingId: b.id, nodeId: resolved.nodeId, evaluationId: e.evaluationId }),
        subjectNodeId: capture.nodeMap[String(e.subjectNodeId)] || resolved.nodeId,
        focusNodeId: capture.nodeMap[String(e.focusNodeId)] || resolved.nodeId,
        dependency: {
          componentId: d.componentId,
          dependencyId: d.id,
          bindingId: b.id,
          ruleId: e.ruleId,
          revision: d.revision,
          compiledHash: d.compiledHash,
          ...e.dependency ? { nested: e.dependency } : {}
        }
      });
    }
  }
  const byClassification = {};
  evaluations.forEach((e) => {
    const k = String(e.classification);
    byClassification[k] = (byClassification[k] || 0) + 1;
  });
  return { ...result, evaluations, dependencyRuns: runs, coverage: {
    total: evaluations.length,
    byClassification,
    unclassified: evaluations.filter((e) => !e.classification).length,
    duplicateEvaluationIds: evaluations.length - new Set(evaluations.map((e) => e.evaluationId)).size
  } };
}

// ../Apollo/packages/component-contract-core/src/evaluation-view.ts
var CLASSIFICATION_LABELS = {
  compliant: "\u041F\u0440\u043E\u0439\u0434\u0435\u043D\u043E",
  violation: "\u041D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0435",
  "human-review": "\u041D\u0443\u0436\u043D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430",
  "not-evaluable": "\u041D\u0435\u043B\u044C\u0437\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C",
  "not-applicable": "\u041D\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F",
  "not-executed": "\u041D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E",
  allowed: "\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u043E"
};
var REASON_LABELS = {
  "actual value differs from effective baseline": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u043E\u0442 \u044D\u0442\u0430\u043B\u043E\u043D\u0430 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430",
  "actual value matches effective baseline": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0435\u0442 \u0441 \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u043C \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430",
  "comparison value is absent": "\u0424\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0438\u043B\u0438 \u044D\u0442\u0430\u043B\u043E\u043D\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442",
  "rule authority is not active": "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u0435\u0449\u0451 \u043D\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u043E",
  "rule scope does not apply": "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u043D\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 \u044D\u0442\u043E\u043C \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0438",
  "rule product scope does not apply": "\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 Product \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u043B\u0430\u0441\u044C",
  "rule channel scope does not apply": "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 Channel \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u043B\u0430\u0441\u044C",
  "rule product scope is unknown": "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445: Product \u043D\u0435 \u0437\u0430\u0434\u0430\u043D \u0438\u043B\u0438 \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D; \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u043E\u0441\u0442\u044C \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430",
  "rule platform scope is unknown": "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445: \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u0430 \u0438\u043B\u0438 \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430",
  "rule channel scope is unknown": "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445: Channel \u043D\u0435 \u0437\u0430\u0434\u0430\u043D \u0438\u043B\u0438 \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D",
  "rule page type scope is unknown": "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445: \u0442\u0438\u043F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u043D\u0435 \u0437\u0430\u0434\u0430\u043D \u0438\u043B\u0438 \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D",
  "rule platform scope does not apply": "\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u043B\u0430\u0441\u044C",
  "rule page type scope does not apply": "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0442\u0438\u043F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u043B\u0430\u0441\u044C",
  "selector evidence is unknown": "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u0432\u044B\u0431\u043E\u0440\u0430 \u0441\u043B\u043E\u044F",
  "selector matched no visible nodes": "\u041F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u0439 \u0432\u0438\u0434\u0438\u043C\u044B\u0439 \u0441\u043B\u043E\u0439 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D",
  "value is outside the allowed set": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0439 \u043D\u0430\u0431\u043E\u0440",
  "value belongs to the allowed set": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0439 \u043D\u0430\u0431\u043E\u0440"
};
function record31(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function unavailableTrace(trace) {
  const children = Array.isArray(trace.children) ? trace.children : [];
  if (children.length) return children.some((child) => unavailableTrace(record31(child)));
  return trace.truth === "false" && trace.actual === false && Array.isArray(trace.factPaths) && trace.factPaths.some((path) => String(path).startsWith("variantAvailability."));
}
function activityTrace(trace, truth) {
  if (trace.predicate === "any" && trace.truth === truth && Array.isArray(trace.factPaths) && trace.factPaths.length === 2 && trace.factPaths.every((p) => String(p).includes("propertyActivityV1."))) return true;
  return Array.isArray(trace.children) && trace.children.some((t) => activityTrace(record31(t), truth));
}
function falseScopeCondition(trace, path, actual = false, expected = true) {
  if (trace.truth !== "false") return false;
  if (trace.predicate === "equals") {
    return trace.actual === actual && trace.expected === expected && Array.isArray(trace.factPaths) && trace.factPaths.includes(path);
  }
  return (trace.predicate === "all" || trace.predicate === "any") && Array.isArray(trace.children) && trace.children.some((child) => falseScopeCondition(record31(child), path, actual, expected));
}
function dependencyDisplayTrace(trace) {
  const children = Array.isArray(trace.children) ? trace.children.map(record31) : [];
  const branches = children.filter((child) => child.predicate === "all" && Array.isArray(child.children) && record31(child.children[0]).truth === "true");
  let selected = trace;
  if (trace.predicate === "any" && branches.length === 1) selected = record31(branches[0].children[1]);
  if (selected.predicate === "any" && Array.isArray(selected.children) && selected.children.length === 1) selected = record31(selected.children[0]);
  return selected;
}
function buildEvaluationDetails(result, contract, anatomy) {
  const rules = new Map(contract.rules.map((rule) => [rule.ruleId, rule]));
  const dependencyRules = /* @__PURE__ */ new Map();
  const collect = (current, depth = 0) => {
    if (depth > 4) return;
    for (const d of current.componentDependencies || []) if (d.contract) {
      dependencyRules.set(d.compiledHash, d.contract.rules);
      collect(d.contract, depth + 1);
    }
  };
  collect(contract);
  const nodes = new Map(anatomy.map((node) => [node.id, node]));
  const evaluations = Array.isArray(result.evaluations) ? result.evaluations : [];
  return evaluations.map((candidate, index) => {
    const evaluation = record31(candidate);
    const ruleId = String(evaluation.ruleId || "");
    const nodeId = String((evaluation.collection ? evaluation.focusNodeId : evaluation.subjectNodeId) || "");
    const provenance = record31(evaluation.dependency);
    const rule = provenance.compiledHash ? dependencyRules.get(String(provenance.compiledHash))?.find((r) => r.ruleId === ruleId) : rules.get(ruleId);
    const presentation = record31(rule?.presentation);
    const dependency = record31(presentation.dependency);
    const originalTrace = record31(evaluation.trace);
    const specificationNotRequested = contract.runtimePolicy?.validationModeVersion === 1 && evaluation.classification === "not-applicable" && falseScopeCondition(originalTrace, "validationScopeV1.mode", "component-audit", "specification");
    const findExpectedCondition = (value) => {
      if (value.predicate === "equals" && (value.truth === "unknown" || evaluation.classification === "not-applicable" && value.truth === "false") && Array.isArray(value.factPaths) && value.factPaths.some((p) => String(p).startsWith("expectedInput."))) return value;
      for (const child of Array.isArray(value.children) ? value.children : []) {
        const found = findExpectedCondition(record31(child));
        if (found) return found;
      }
    };
    const expectedCondition = !specificationNotRequested && [1, 2].includes(contract.runtimePolicy?.validationIntentVersion || 0) && ["human-review", "not-applicable"].includes(String(evaluation.classification)) ? findExpectedCondition(originalTrace) : void 0;
    const trace = expectedCondition || (dependency.field && ["violation", "compliant", "human-review"].includes(String(evaluation.classification)) ? dependencyDisplayTrace(originalTrace) : originalTrace);
    const factPaths = Array.isArray(trace.factPaths) ? trace.factPaths.filter((value) => typeof value === "string") : [];
    const factPath = factPaths.find((path) => !path.startsWith("baseline.effective.")) || factPaths[0] || "";
    const node = nodes.get(nodeId);
    const reason = typeof trace.reason === "string" ? trace.reason : "";
    const classification = String(evaluation.classification || "unknown");
    const scopeMismatch = /^rule (?:product|platform|channel|page type) scope does not apply$/.test(reason);
    const scopeUnknown = /^rule (?:product|platform|channel|page type) scope is unknown$/.test(reason);
    const conditionalMismatch = classification === "not-applicable" && trace.truth === "false" && !scopeMismatch;
    const activityPolicy = presentation.propertyApplicability;
    const inactive = activityPolicy && conditionalMismatch && activityTrace(trace, "false");
    const unknownActivity = activityPolicy && ["human-review", "not-evaluable"].includes(classification) && activityTrace(trace, "unknown");
    const unavailable = conditionalMismatch && unavailableTrace(trace);
    const childOwned = presentation.boundaryPolicy === "component-owned@1" && conditionalMismatch && falseScopeCondition(trace, "ruleScopeV1.local");
    const hiddenTarget = presentation.targetApplicability === "visible-target@1" && conditionalMismatch && factPaths.some((path) => /^ruleScopeV1\.targets\..+\.visible$/.test(path) && falseScopeCondition(trace, path));
    const missingDimension = ["human-review", "not-evaluable"].includes(classification) && ["baseline.effective.bounds.width", "baseline.effective.bounds.height"].some((path) => factPaths.includes(path)) && ["absent", "unknown"].includes(String(record31(trace.expected).state));
    const missingDimensionPath = factPaths.find((path) => /^baseline\.effective\.bounds\.(width|height)$/.test(path));
    const pairedDimension = Boolean(presentation.transitionId) && trace.predicate === "approximately-equals" && ["compliant", "violation"].includes(classification);
    const unknownExpectedInput = expectedCondition?.truth === "unknown";
    const inputName = validationInputs(contract.facts).find((p) => `expectedInput.${p.id}` === factPath)?.validationInput?.label || factPath;
    const showComparison = !specificationNotRequested && !unknownExpectedInput && !unavailable && !childOwned && !hiddenTarget && (scopeMismatch || conditionalMismatch || trace.actual !== void 0 || trace.expected !== void 0);
    return {
      id: String(evaluation.evaluationId || `${ruleId}:${nodeId}:${index}`),
      classification,
      classificationLabel: CLASSIFICATION_LABELS[classification] || classification,
      severity: String(evaluation.severity || rule?.severity || "info"),
      ruleId,
      ruleTitle: typeof presentation.title === "string" && presentation.title ? presentation.title : String(evaluation.ruleTitle || ruleId),
      capability: pairedDimension ? "\u0420\u0430\u0437\u043C\u0435\u0440 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F, px" : dependency.field ? `${String(dependency.targetRole)} \xB7 ${{ width: dependency.contractDependencyId ? "\u0428\u0438\u0440\u0438\u043D\u0430 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430, px" : "\u0428\u0438\u0440\u0438\u043D\u0430 \u0438\u043A\u043E\u043D\u043A\u0438, px", height: dependency.contractDependencyId ? "\u0412\u044B\u0441\u043E\u0442\u0430 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430, px" : "\u0412\u044B\u0441\u043E\u0442\u0430 \u0438\u043A\u043E\u043D\u043A\u0438, px", portName: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043F\u043E\u0440\u0442", variantProperty: `${dependency.contractDependencyId ? "\u0412\u0430\u0440\u0438\u0430\u043D\u0442 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430" : "\u0412\u0430\u0440\u0438\u0430\u043D\u0442 \u0438\u043A\u043E\u043D\u043A\u0438"} \xB7 ${String(dependency.property || "")}` }[String(dependency.field)] || dependency.field}` : typeof presentation.group === "string" ? presentation.group : String(evaluation.capability || factPath),
      nodeId,
      nodeName: node?.name || String(evaluation.subjectNodeName || nodeId),
      nodePath: node?.path || String(evaluation.subjectNodeName || nodeId),
      factPath,
      reason,
      reasonLabel: record31(evaluation.collection).summary ? String(record31(evaluation.collection).summary) : specificationNotRequested ? "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u043E \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438 \u043D\u0435 \u0437\u0430\u043F\u0440\u043E\u0448\u0435\u043D\u0430. \u042D\u0442\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u043E \u0441\u043E\u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0441 \u0432\u043D\u0435\u0448\u043D\u0438\u043C\u0438 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u044F\u043C\u0438 \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u0430\u0443\u0434\u0438\u0442 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430; \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E." : unknownExpectedInput ? `\u041D\u0435 \u0437\u0430\u0434\u0430\u043D\u043E \u0438\u043B\u0438 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0435 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \xAB${inputName}\xBB. \u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0435\u0433\u043E \u0432 \xAB\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u044B\u0445 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u0430\u0445\xBB \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443; \u0442\u0435\u043A\u0443\u0449\u0435\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0441\u043B\u043E\u044F \u043D\u0435 \u0437\u0430\u043C\u0435\u043D\u044F\u0435\u0442 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0435.` : expectedCondition ? `\u0423\u043A\u0430\u0437\u0430\u043D\u043D\u043E\u0435 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \xAB${inputName}\xBB \u043D\u0435 \u0430\u043A\u0442\u0438\u0432\u0438\u0440\u0443\u0435\u0442 \u044D\u0442\u043E \u0443\u0441\u043B\u043E\u0432\u043D\u043E\u0435 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u0435; \u044D\u0442\u043E \u043D\u0435 \u043D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u0435.` : Array.isArray(evaluation.evidenceIssues) && evaluation.evidenceIssues.length ? `\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445 ${evaluation.evidenceIssues.some((path) => /gradient(Stops|Transform)/.test(String(path))) ? "\u0433\u0440\u0430\u0434\u0438\u0435\u043D\u0442\u0430" : "\u0437\u0430\u043B\u0438\u0432\u043A\u0438 \u0438\u043B\u0438 \u043E\u0431\u0432\u043E\u0434\u043A\u0438"}: ${evaluation.evidenceIssues.join(", ")}. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u0437\u0430\u0445\u0432\u0430\u0442 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430 \u0438 \u044D\u0442\u0430\u043B\u043E\u043D\u0430; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435\u043F\u043E\u043B\u043D\u0430\u044F.` : pairedDimension ? `${classification === "violation" ? "\u0420\u0430\u0437\u043C\u0435\u0440 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0441\u044F" : "\u0420\u0430\u0437\u043C\u0435\u0440 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D"} \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0433\u043E \u0441\u043D\u0438\u043C\u043A\u0430 \u0442\u043E\u0433\u043E \u0436\u0435 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430. \u0414\u043E\u043F\u0443\u0441\u043A: ${record31(trace.expected).tolerance} px.` : missingDimension ? `\u041D\u0435\u0442 \u0440\u0430\u0437\u043C\u0435\u0440\u0430 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0433\u043E \u044D\u0442\u0430\u043B\u043E\u043D\u0430: ${missingDimensionPath}. \u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E.` : childOwned ? "\u041E\u0431\u043B\u0430\u0441\u0442\u044C \u043F\u0440\u0438\u043D\u0430\u0434\u043B\u0435\u0436\u0438\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u043E\u043C\u0443 \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u043E\u043C\u0443 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0443; \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u044E\u0442\u0441\u044F \u0435\u0433\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u0430\u043C\u0438" : hiddenTarget ? "\u0426\u0435\u043B\u044C \u0434\u043E\u043A\u0430\u0437\u0430\u043D\u043D\u043E \u0441\u043A\u0440\u044B\u0442\u0430 \u0438\u043B\u0438 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0435; \u0441\u0442\u0438\u043B\u0435\u0432\u043E\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u043E \u043D\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0443\u0441\u043B\u043E\u0432\u0438\u044E \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430" : inactive ? activityPolicy === "stroke-present-either@1" ? "\u041E\u0431\u0432\u043E\u0434\u043A\u0430 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0438 \u0432 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0435, \u0438 \u0432 \u044D\u0442\u0430\u043B\u043E\u043D\u0435; \u0442\u043E\u043B\u0449\u0438\u043D\u0430 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0443\u0441\u043B\u043E\u0432\u0438\u044E \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430" : activityPolicy === "auto-layout-padding-either@1" ? "Auto layout \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0438 \u0432 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0435, \u0438 \u0432 \u044D\u0442\u0430\u043B\u043E\u043D\u0435; padding \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0443\u0441\u043B\u043E\u0432\u0438\u044E \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430" : activityPolicy === "flow-alignment-either@1" ? "\u0413\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0438\u043B\u0438 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 auto layout \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0438 \u0432 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0435, \u0438 \u0432 \u044D\u0442\u0430\u043B\u043E\u043D\u0435; \u0432\u044B\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u043D\u0438\u0435 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0443\u0441\u043B\u043E\u0432\u0438\u044E \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430" : "\u0412 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0435 \u0438 \u044D\u0442\u0430\u043B\u043E\u043D\u0435 \u043D\u0435\u0442 \u0434\u0432\u0443\u0445 \u0443\u0447\u0430\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0445 \u0432 auto layout \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432; gap \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0443\u0441\u043B\u043E\u0432\u0438\u044E \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430" : unknownActivity ? "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445 \u043E \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u043E\u0441\u0442\u0438 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u0432 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0435 \u0438\u043B\u0438 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u043C \u044D\u0442\u0430\u043B\u043E\u043D\u0435; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435\u043F\u043E\u043B\u043D\u0430\u044F" : evaluation.origin === "editor-hidden-target-scope" ? "\u0421\u043B\u043E\u0439 \u043D\u0430\u0439\u0434\u0435\u043D \u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D, \u043D\u043E \u0441\u043A\u0440\u044B\u0442. \u042D\u0442\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F." : unavailable ? "\u042D\u043B\u0435\u043C\u0435\u043D\u0442 \u0438\u043B\u0438 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0435; \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u043E\u043C \u0438 reference \u0438\u0437 Figma" : conditionalMismatch ? "\u0423\u0441\u043B\u043E\u0432\u0438\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u043D\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E; \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u043B\u043E\u0441\u044C" : dependency.field && trace.predicate === "between" && trace.truth === "false" ? "\u0420\u0430\u0437\u043C\u0435\u0440 \u0438\u043A\u043E\u043D\u043A\u0438 \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D \u0438\u0437 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430" : presentation.textStyleBinding && trace.predicate === "binding-satisfies" ? classification === "violation" ? record31(trace.actual).state === "detached" ? "\u041E\u0442\u0432\u044F\u0437\u0430\u043D \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0439 \u0441\u0442\u0438\u043B\u044C" : "\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0439 \u0441\u0442\u0438\u043B\u044C \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u0440\u0430\u0437\u0440\u0435\u0448\u0451\u043D\u043D\u044B\u0439 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u0447\u043D\u044B\u0439 \u043A\u0430\u0442\u0430\u043B\u043E\u0433" : classification === "compliant" ? "\u0411\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u0447\u043D\u044B\u0439 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0439 \u0441\u0442\u0438\u043B\u044C \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D" : "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445 \u043E \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0435 Text Style; \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0435\u043F\u043E\u043B\u043D\u0430\u044F" : REASON_LABELS[reason] || reason || "Predicate Engine \u0432\u0435\u0440\u043D\u0443\u043B \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0431\u0435\u0437 \u043F\u043E\u044F\u0441\u043D\u0435\u043D\u0438\u044F",
      actual: trace.actual,
      expected: pairedDimension ? record31(trace.expected).value : trace.expected,
      actualLabel: pairedDimension ? "\u041F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430" : scopeMismatch || scopeUnknown ? "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438" : conditionalMismatch ? "\u0421\u0446\u0435\u043D\u0430\u0440\u0438\u0439 \u0441\u0435\u0439\u0447\u0430\u0441" : "\u0421\u0435\u0439\u0447\u0430\u0441",
      expectedLabel: pairedDimension ? "\u0414\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u2014 \u043A\u0430\u043A \u0434\u043E \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430" : scopeMismatch || scopeUnknown ? "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u043B\u044F" : conditionalMismatch ? "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u043F\u0440\u0438" : "\u0414\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C",
      comparisonSymbol: classification === "not-applicable" ? "\u2260" : "\u2192",
      showComparison: evaluation.origin !== "editor-hidden-target-scope" && showComparison,
      scopeMismatch
    };
  });
}

// ../Apollo/packages/component-contract-core/src/evaluation-groups.ts
var severityRank = { info: 0, warning: 1, error: 2 };
function groupEvaluationDetails(details) {
  const groups = [];
  const byDifference = /* @__PURE__ */ new Map();
  for (const detail of details) {
    const canGroup = detail.classification === "violation" && Boolean(detail.nodeId && detail.factPath) && detail.reason === "actual value differs from effective baseline" && detail.showComparison && !detail.scopeMismatch && detail.actual !== void 0 && detail.expected !== void 0 && Object.prototype.hasOwnProperty.call(severityRank, detail.severity);
    const key2 = canGroup ? stableStringify({
      nodeId: detail.nodeId,
      nodePath: detail.nodePath,
      factPath: detail.factPath,
      actual: detail.actual,
      expected: detail.expected,
      reason: detail.reason,
      actualLabel: detail.actualLabel,
      expectedLabel: detail.expectedLabel,
      comparisonSymbol: detail.comparisonSymbol
    }) : "";
    const existing = key2 ? byDifference.get(key2) : void 0;
    if (existing) {
      existing.evaluations.push(detail);
      if (severityRank[detail.severity] > severityRank[existing.severity]) existing.severity = detail.severity;
    } else {
      const group = { ...detail, evaluations: [detail] };
      groups.push(group);
      if (key2) byDifference.set(key2, group);
    }
  }
  return groups;
}

// ../Apollo/packages/component-contract-core/src/quick-policy.ts
var PROTECTED_INTERNAL_CAPABILITY_SETS = ["auto-layout@1", "visual-style@1"];
function cloneManual(source) {
  return JSON.parse(JSON.stringify(source));
}
function applicability(source) {
  return {
    variants: "all",
    modes: "all",
    platforms: source.component.platform === "universal" ? [] : [source.component.platform]
  };
}
function uniqueRuleId(source, base) {
  const ids = new Set(source.rules.map((rule) => rule.id));
  if (!ids.has(base)) return base;
  let suffix = 2;
  while (ids.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
function sameRule(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function finish(source, next, createdRuleIds, updatedRuleIds, conflictingRuleIds = []) {
  const changed = createdRuleIds.length > 0 || updatedRuleIds.length > 0;
  if (changed) {
    next.rules.sort((left, right) => left.id.localeCompare(right.id));
    next.metadata.revision = source.metadata.revision + 1;
  }
  return { manual: next, changed, createdRuleIds, updatedRuleIds, conflictingRuleIds };
}
function applyProtectInternalsPolicy(source, target) {
  const next = cloneManual(source);
  const createdRuleIds = [];
  const updatedRuleIds = [];
  PROTECTED_INTERNAL_CAPABILITY_SETS.forEach((capabilitySet) => {
    const existingIndex = next.rules.findIndex((rule) => rule.targetId === target.id && rule.capabilitySet === capabilitySet);
    const rationale = capabilitySet === "auto-layout@1" ? "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u0433\u0435\u043E\u043C\u0435\u0442\u0440\u0438\u044F \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0435 \u0438\u0437\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E." : "\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0435 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0435 \u0438\u0437\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E.";
    const baseId = `component:${source.component.contractId}.${target.semanticRole}.${slug(capabilitySet)}`;
    if (existingIndex < 0) {
      const id = uniqueRuleId(next, baseId);
      next.rules.push({
        id,
        targetId: target.id,
        targetScope: "self-and-descendants",
        capability: "",
        capabilitySet,
        permission: "forbidden",
        controlPaths: [],
        constraints: [],
        applicability: applicability(source),
        severity: "error",
        rationale,
        remediationIntent: "restore-effective-baseline",
        status: "draft",
        owner: source.metadata.owners.manual,
        ...source.metadata.ruleOwnershipVersion === 1 ? { ownership: { kind: "component", ownerId: source.component.componentId } } : {}
      });
      createdRuleIds.push(id);
      return;
    }
    const existing = next.rules[existingIndex];
    const normalized = {
      ...existing,
      targetScope: "self-and-descendants",
      capability: "",
      capabilitySet,
      capabilitySelection: void 0,
      permission: "forbidden",
      controlPaths: [],
      constraints: [],
      applicability: applicability(source),
      severity: "error",
      rationale: existing.rationale || rationale,
      remediationIntent: existing.remediationIntent || "restore-effective-baseline",
      status: sameRule(existing, {
        ...existing,
        targetScope: "self-and-descendants",
        capability: "",
        capabilitySet,
        capabilitySelection: void 0,
        permission: "forbidden",
        controlPaths: [],
        constraints: [],
        applicability: applicability(source),
        severity: "error",
        rationale: existing.rationale || rationale,
        remediationIntent: existing.remediationIntent || "restore-effective-baseline"
      }) ? existing.status : "draft"
    };
    if (!sameRule(existing, normalized)) {
      next.rules[existingIndex] = normalized;
      updatedRuleIds.push(existing.id);
    }
  });
  return finish(source, next, createdRuleIds, updatedRuleIds);
}
function componentPropertyName(capability) {
  const prefixes = ["component.properties.", "component-property."];
  const prefix = prefixes.find((value) => capability.startsWith(value));
  return prefix ? capability.slice(prefix.length) || null : null;
}
function allowPublicComponentProperties(source, target, properties) {
  const next = cloneManual(source);
  const createdRuleIds = [];
  const conflictingRuleIds = [];
  const normalizedProperties = Array.from(new Set(properties.map((value) => value.trim()).filter(Boolean))).sort();
  normalizedProperties.forEach((property) => {
    const existing = next.rules.find((rule) => rule.targetId === target.id && componentPropertyName(rule.capability) === property);
    if (existing) {
      if (existing.permission !== "allowed") conflictingRuleIds.push(existing.id);
      return;
    }
    const capability = `component.properties.${property}`;
    const baseId = `component:${source.component.contractId}.${target.semanticRole}.${slug(capability)}`;
    const id = uniqueRuleId(next, baseId);
    next.rules.push({
      id,
      targetId: target.id,
      targetScope: "self",
      capability,
      permission: "allowed",
      controlPaths: [{ kind: "host-property", property, required: true, exclusive: true }],
      constraints: [],
      applicability: applicability(source),
      severity: "info",
      rationale: `\u041F\u0443\u0431\u043B\u0438\u0447\u043D\u043E\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E \xAB${property}\xBB \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0440\u0430\u0437\u0440\u0435\u0448\u0451\u043D\u043D\u044B\u043C \u0441\u043F\u043E\u0441\u043E\u0431\u043E\u043C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430.`,
      status: "draft",
      owner: source.metadata.owners.manual,
      ...source.metadata.ruleOwnershipVersion === 1 ? { ownership: { kind: "component", ownerId: source.component.componentId } } : {}
    });
    createdRuleIds.push(id);
  });
  return finish(source, next, createdRuleIds, [], conflictingRuleIds);
}
function sameManualComponentFamily(left, right) {
  const baseFamily = (source) => slug(source.component.family).replace(/-inverted$/i, "");
  return left.component.componentId === right.component.componentId && left.component.library === right.component.library && baseFamily(left) === baseFamily(right);
}
function samePreviewComponent(left, right) {
  const sameFamilyAndPlatform = left.component.family === right.component.family && left.component.platform === right.component.platform;
  if (!sameFamilyAndPlatform) return false;
  return left.component.contractId === right.component.contractId || left.component.library === right.component.library;
}

// ../Apollo/packages/component-contract-core/src/zip.ts
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function crc32(data) {
  let crc = 4294967295;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc >>> 1 ^ 3988292384 & -(crc & 1);
    }
  }
  return (crc ^ 4294967295) >>> 0;
}
function u16(value) {
  return new Uint8Array([value & 255, value >>> 8 & 255]);
}
function u32(value) {
  return new Uint8Array([
    value & 255,
    value >>> 8 & 255,
    value >>> 16 & 255,
    value >>> 24 & 255
  ]);
}
function concat(parts) {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}
function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const sorted = entries.slice().sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of sorted) {
    const name = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const local = concat([
      u32(67324752),
      u16(20),
      u16(2048),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(entry.data.length),
      u32(entry.data.length),
      u16(name.length),
      u16(0),
      name,
      entry.data
    ]);
    localParts.push(local);
    centralParts.push(concat([
      u32(33639248),
      u16(20),
      u16(20),
      u16(2048),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(entry.data.length),
      u32(entry.data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name
    ]));
    offset += local.length;
  }
  const central = concat(centralParts);
  const end = concat([
    u32(101010256),
    u16(0),
    u16(0),
    u16(sorted.length),
    u16(sorted.length),
    u32(central.length),
    u32(offset),
    u16(0)
  ]);
  return concat([...localParts, central, end]);
}
function findEnd(view) {
  const minimum = Math.max(0, view.byteLength - 65535 - 22);
  for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) === 101010256) return offset;
  }
  throw new Error("ZIP end-of-central-directory record was not found.");
}
async function inflateRaw(data) {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This runtime cannot read deflated ZIP entries. Use uncompressed ZIP or JSON files.");
  }
  const input = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const stream = new Blob([input]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function readZip(input) {
  const buffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  const view = new DataView(buffer);
  const endOffset = findEnd(view);
  const count = view.getUint16(endOffset + 10, true);
  let centralOffset = view.getUint32(endOffset + 16, true);
  const result = [];
  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(centralOffset, true) !== 33639248) throw new Error("Invalid ZIP central directory.");
    const method = view.getUint16(centralOffset + 10, true);
    const compressedSize = view.getUint32(centralOffset + 20, true);
    const nameLength = view.getUint16(centralOffset + 28, true);
    const extraLength = view.getUint16(centralOffset + 30, true);
    const commentLength = view.getUint16(centralOffset + 32, true);
    const localOffset = view.getUint32(centralOffset + 42, true);
    const nameBytes = new Uint8Array(buffer, centralOffset + 46, nameLength);
    const name = decoder.decode(nameBytes);
    if (view.getUint32(localOffset, true) !== 67324752) throw new Error(`Invalid ZIP entry: ${name}.`);
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = new Uint8Array(buffer, dataOffset, compressedSize);
    let data;
    if (method === 0) data = new Uint8Array(compressed);
    else if (method === 8) data = await inflateRaw(compressed);
    else throw new Error(`ZIP compression method ${method} is not supported for ${name}.`);
    if (!name.endsWith("/")) result.push({ name, data });
    centralOffset += 46 + nameLength + extraLength + commentLength;
  }
  return result;
}
function textZipEntry(name, value) {
  return { name, data: encoder.encode(`${JSON.stringify(value, null, 2)}
`) };
}
function zipEntryText(entry) {
  return decoder.decode(entry.data);
}

// ../Apollo/packages/component-contract-core/src/exporter.ts
function verifyProjectionStamp(contract, projection) {
  if (projection?.documentType !== "component-contract" || projection.schemaVersion !== contract.schemaVersion || projection.package?.manualSourceHash !== contract.package.manualSourceHash || projection.package?.componentId !== contract.package.componentId || !/^component-contract-editor@0\.2\.\d+$/.test(projection.package?.sourceExportVersion || "")) {
    throw new Error("EXPORT_PROJECTION_SOURCE_MISMATCH: historical projection must match the exact manual and component.");
  }
  const candidate = JSON.parse(JSON.stringify(contract));
  candidate.package.sourceExportVersion = projection.package.sourceExportVersion;
  if (stableHash(candidate) !== stableHash(projection)) throw new Error("EXPORT_PROJECTION_MISMATCH: manual, facts and dependencies do not reproduce the historical projection.");
  return candidate;
}
function buildExportBundle(manual, variantEvidence, dependencyContracts, options = {}) {
  const result = compileManualSource(manual, variantEvidence, dependencyContracts);
  const valid = !result.issues.some((issue) => issue.level === "error");
  if (options.projection && !valid) throw new Error("EXPORT_PROJECTION_SOURCE_INVALID: compiler errors prevent stamp preservation.");
  return {
    manual,
    compiled: options.projection ? verifyProjectionStamp(result.contract, options.projection) : result.contract,
    sourceFactsHash: variantEvidence ? stableHash(variantEvidence) : void 0,
    validation: { schemaVersion: "apollo.component-contract-validation.v1", valid, issues: result.issues },
    coverage: result.contract.coverage
  };
}
function buildAuthoringZip(bundle, importedFiles = []) {
  const reserved = /* @__PURE__ */ new Set(["contract.manual.json", "component-contract.v2.json", "coverage.json", "validation-report.json"]);
  const evidence = /* @__PURE__ */ new Map();
  for (const file of importedFiles) {
    const name = file.name, basename = name.split("/").pop() || "";
    if (!name.endsWith(".json") || reserved.has(basename)) continue;
    if (!name || name.startsWith("/") || name.includes("\\") || name.split("/").some((p) => !p || p === "." || p === "..")) throw new Error("EXPORT_EVIDENCE_PATH_INVALID");
    const value = JSON.parse(file.text);
    if (value.documentType === "component-contract-manual" || value.documentType === "component-contract") continue;
    const key2 = slug(bundle.manual.component.family) + "/source/" + basename;
    const existing = evidence.get(key2);
    if (existing !== void 0 && existing !== file.text) throw new Error("EXPORT_EVIDENCE_CONFLICT: " + name);
    evidence.set(key2, file.text);
  }
  const files = [
    { name: "contract.manual.json", text: JSON.stringify(bundle.manual) },
    { name: "compiled/component-contract.v2.json", text: JSON.stringify(bundle.compiled) }
  ];
  for (const [name, text3] of evidence) files.push({ name, text: text3 });
  for (const dependency of bundle.compiled.componentDependencies || []) if (dependency.contract && !dependency.issue)
    files.push({ name: "dependencies/" + encodeURIComponent(dependency.componentId) + "/component-contract.v2.json", text: JSON.stringify(dependency.contract) });
  if (bundle.sourceFactsHash) {
    const reopened = importWorkspace(files, bundle.manual.component.contractId);
    if (!reopened.variantEvidence || stableHash(reopened.variantEvidence) !== bundle.sourceFactsHash) throw new Error("EXPORT_FACTS_MISMATCH: input inventory does not reproduce full authoring evidence.");
  }
  return createZip([
    ...files.map((file) => ({ name: file.name, data: new TextEncoder().encode(file.text) })),
    textZipEntry("coverage.json", bundle.coverage),
    textZipEntry("validation-report.json", bundle.validation)
  ]);
}

// ../Apollo/packages/component-contract-core/src/session.ts
var EDITOR_SESSION_SCHEMA_VERSION = "apollo.component-contract-editor.session.v1";
function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}
function createEditorSession(workspace, ui, savedAt = (/* @__PURE__ */ new Date()).toISOString()) {
  const { compiledInput: _compiledInput, ...persistedWorkspace } = workspace;
  return jsonClone({
    schemaVersion: EDITOR_SESSION_SCHEMA_VERSION,
    savedAt,
    workspace: persistedWorkspace,
    ui
  });
}
function parseEditorSession(value) {
  if (!value || typeof value !== "object") return null;
  const candidate = value;
  if (candidate.schemaVersion !== EDITOR_SESSION_SCHEMA_VERSION) return null;
  if (!candidate.workspace || !candidate.ui) return null;
  const manual = candidate.workspace.manual;
  if (!manual || manual.documentType !== "component-contract-manual" || !manual.component?.contractId) return null;
  if (!["authoring", "validation"].includes(candidate.ui.workspaceMode)) return null;
  return jsonClone(candidate);
}

// ../Apollo/packages/component-contract-core/src/rule-editing.ts
function validateRuleEdit(manual, rule, editingId) {
  const rules = manual.rules.slice();
  const existing = editingId ? rules.findIndex((entry) => entry.id === editingId) : -1;
  const index = existing < 0 ? rules.length : existing;
  rules[index] = rule;
  if (rule.status !== "reviewed") return [];
  const issues = validateManualSource({ ...manual, rules }).filter((issue) => issue.level === "error" && (issue.path.startsWith(`/rules/${index}/`) || issue.code === "RULE_DUPLICATE" && rules.some((entry, i) => i !== index && entry.id === rule.id)));
  if (manual.metadata.ruleOwnershipVersion === 1 && !rule.ownership) issues.push({
    level: "error",
    code: "RULE_OWNERSHIP_REQUIRED",
    path: `/rules/${index}/ownership`,
    message: "Reviewed edit requires explicit normative ownership."
  });
  return issues;
}
function validationIssueLabel(issue) {
  const labels = {
    RULE_RATIONALE: "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u043E\u0431\u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u0435 (Rationale) \u0434\u043B\u044F reviewed-\u043F\u0440\u0430\u0432\u0438\u043B\u0430.",
    RULE_OWNERSHIP_REQUIRED: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435, \u043A\u043E\u043C\u0443 \u043F\u0440\u0438\u043D\u0430\u0434\u043B\u0435\u0436\u0438\u0442 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u0435: \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0443, \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0443, \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u0443 \u0438\u043B\u0438 \u0440\u0435\u0434\u0430\u043A\u0446\u0438\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u0435.",
    RULE_OWNERSHIP: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0430 \u0438 \u0435\u0433\u043E ID. \u0414\u043B\u044F \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 ID \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0442\u044C \u0441 componentId \u043F\u0430\u043A\u0435\u0442\u0430.",
    RULE_PROPERTY_APPLICABILITY: "\u0423\u0441\u043B\u043E\u0432\u0438\u0435 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u043E\u0441\u0442\u0438 \u0434\u043E\u043B\u0436\u043D\u043E \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044E strokeWeight \u0438\u043B\u0438 itemSpacing \u0441 baseline \u0432 \u044D\u0442\u043E\u043C \u043F\u0440\u0430\u0432\u0438\u043B\u0435.",
    RULE_BOUNDARY_POLICY: "\u0413\u0440\u0430\u043D\u0438\u0446\u0430 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u043A \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E\u043C\u0443 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044E \u0441 baseline \u043F\u0440\u0438 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u043D\u044B\u0445 component dependencies.",
    RULE_TARGET_APPLICABILITY: "\u0423\u0441\u043B\u043E\u0432\u0438\u0435 \u0432\u0438\u0434\u0438\u043C\u043E\u0441\u0442\u0438 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u043A \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u044E \u0441\u0442\u0438\u043B\u0435\u0439 \u0441 baseline, \u043D\u0435 \u043A presence/visibility \u0438 \u0434\u0440\u0443\u0433\u0438\u043C \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F\u043C.",
    RULE_SCOPE_UNCONFIRMED: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u043F\u0440\u0430\u0432\u0438\u043B\u0430 (Scope status).",
    RULE_VALIDATION_MODE: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u0412 \u043E\u0431\u043E\u0438\u0445 \u0440\u0435\u0436\u0438\u043C\u0430\u0445\xBB \u0438\u043B\u0438 \xAB\u0422\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438\xBB.",
    RULE_CONTEXT_UNMAPPED: "\u041A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 \u0435\u0449\u0451 \u043D\u0435 \u0441\u0432\u044F\u0437\u0430\u043D \u0441 runtime-\u0434\u0430\u043D\u043D\u044B\u043C\u0438. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 Context only \u0434\u043E \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0432\u044F\u0437\u0438.",
    RULE_DELEGATION: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 External Rule IDs \u0434\u043B\u044F \u0434\u0435\u043B\u0435\u0433\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u0430.",
    RULE_CONTEXT_FACTS: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043D\u0435\u0434\u043E\u0441\u0442\u0430\u044E\u0449\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0432 Missing facts.",
    RULE_DUPLICATE: "Rule ID \u0443\u0436\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0434\u0440\u0443\u0433\u0438\u043C \u043F\u0440\u0430\u0432\u0438\u043B\u043E\u043C.",
    RULE_CAPABILITY: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E \u0438\u043B\u0438 \u0433\u0440\u0443\u043F\u043F\u0443 \u0441\u0432\u043E\u0439\u0441\u0442\u0432.",
    CONSTRAINT_VALUES: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u043D\u043E \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435.",
    CONSTRAINT_RANGE: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0438\u043B\u0438 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C.",
    CONSTRAINT_ORDER: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043F\u043E\u0440\u044F\u0434\u043E\u043A \u0441\u0435\u043C\u0430\u043D\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0440\u043E\u043B\u0435\u0439.",
    CONSTRAINT_ORDER_SCOPE: "\u0414\u043B\u044F \u043F\u043E\u0440\u044F\u0434\u043A\u0430 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0438\u0434\u0438\u043C\u044B\u0435 \u0447\u0430\u0441\u0442\u0438 \u0438\u043B\u0438 \u0432\u0441\u0435 \u0447\u0430\u0441\u0442\u0438, \u0432\u043A\u043B\u044E\u0447\u0430\u044F \u0441\u043A\u0440\u044B\u0442\u044B\u0435.",
    CONSTRAINT_RELATION: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0441\u0432\u044F\u0437\u044C \u0438 \u0446\u0435\u043B\u0435\u0432\u0443\u044E \u0440\u043E\u043B\u044C.",
    CONSTRAINT_TOKEN: "\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u0438\u043B\u0438 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438.",
    CONSTRAINT_BINDING_CONSISTENCY: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 root, \xAB\u0421 \u0443\u0441\u043B\u043E\u0432\u0438\u044F\u043C\u0438\xBB, \u0442\u0438\u043F \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438 \u0438 \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0435 \u0440\u043E\u043B\u0438 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0445 \u0447\u0430\u0441\u0442\u0435\u0439. \u0414\u043B\u044F \u044D\u0442\u0430\u043B\u043E\u043D\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0442\u043E\u043B\u044C\u043A\u043E Text Style."
  };
  return labels[issue.code] || issue.message;
}
function mergeEditedApplicability(previous, edited) {
  return { ...previous, ...edited };
}
function forbiddenConstraintsForEdit(previous, next, fallback) {
  const selection = (v) => JSON.stringify(v ? [...v].sort() : null);
  if (previous?.permission === "forbidden" && previous.capability === next.capability && previous.capabilitySet === next.capabilitySet && selection(previous.capabilitySelection) === selection(next.capabilitySelection)) {
    return JSON.parse(JSON.stringify(previous.constraints));
  }
  return fallback;
}

// ../Apollo/packages/component-contract-core/src/validation-coverage.ts
var import_predicate2 = __toESM(require_predicate());
function provenHiddenRuleTarget(manual, rule, snapshot) {
  if (rule.targetScope && rule.targetScope !== "self" || snapshot.source?.truncated || snapshot.source?.captureTopology?.complete !== true || snapshot.source.captureTopology.limitReached || snapshot.source.captureTopology.issues?.length || snapshot.selection.length !== 1) return void 0;
  const target = manual.targets.find((entry) => entry.id === rule.targetId && entry.resolution === "resolved");
  const identities = snapshot.declaredTargetIdentitiesV1;
  const identity = identities?.targets.find((entry) => entry.targetId === target?.id);
  if (!target || identity?.status !== "resolved" || identity.present !== true || identity.effectiveVisible !== false || identity.semanticRole !== target.semanticRole || snapshot.selection.includes(identity.nodeId || "")) return void 0;
  const node = snapshot.nodes.find((entry) => entry.id === identity.nodeId);
  if (!node) return void 0;
  if (rule.capability === "visibility" || rule.constraints.some((constraint) => constraint.fact === "visible")) {
    const actual = (0, import_predicate2.resolveValue)({ fact: "visible" }, node, snapshot);
    const baseline = (0, import_predicate2.resolveValue)({ fact: "baseline.effective.visible" }, node, snapshot);
    if (actual.state !== "known" || baseline.state !== "known" || actual.value !== baseline.value) return void 0;
  }
  return node;
}
function diagnoseRuleApplicability(manual, rule, snapshot, variantAvailability2 = false, rootTargetAliases = false) {
  const probe = compileApplicabilityProbe(manual, rule, variantAvailability2, rootTargetAliases);
  if (!snapshot) return { status: "unknown", unsupportedConditions: ["snapshot", ...probe.unsupported], evaluations: [] };
  const result = (0, import_predicate2.evaluateRules)({ snapshot, rules: [probe.rule], ruleRelease: "editor-coverage" });
  const evaluations = result.evaluations;
  const subjects = (0, import_predicate2.selectSubjects)(probe.rule, snapshot);
  const scopeMismatch = evaluations.some((entry) => /^rule (?:product|platform|channel|page type) scope does not apply$/.test(String(entry.trace.reason)));
  const allConditionsFalse = evaluations.length > 0 && !subjects.unknown && evaluations.every((entry) => entry.applicability === "not-applicable" && entry.trace.truth === "false");
  if (!scopeMismatch && !allConditionsFalse && !subjects.unknown && !subjects.nodes.length && probe.rootConditionRule && snapshot.selection.length === 1 && !snapshot.source?.truncated) {
    const rootSubjects = (0, import_predicate2.selectSubjects)(probe.rootConditionRule, snapshot);
    const rootResult = (0, import_predicate2.evaluateRules)({ snapshot, rules: [probe.rootConditionRule], ruleRelease: "editor-coverage" });
    const rootEvaluations = rootResult.evaluations;
    if (!rootSubjects.unknown && rootSubjects.nodes.length === 1 && rootEvaluations.length === 1 && rootEvaluations[0].applicability === "not-applicable" && rootEvaluations[0].trace.truth === "false") {
      return { status: "not-applicable", unsupportedConditions: probe.unsupported, evaluations: rootEvaluations };
    }
  }
  const status = scopeMismatch || allConditionsFalse ? "not-applicable" : !probe.unsupported.length && !subjects.unknown && evaluations.length > 0 && evaluations.every((entry) => entry.applicability === "applicable") ? "applicable" : "unknown";
  return { status, unsupportedConditions: probe.unsupported, evaluations };
}
function inspectRuleFacts(manual, rule, snapshot, rootTargetAliases = false) {
  const paths = Array.from(new Set(rule.execution?.missingFacts || []));
  if (!paths.length) return [];
  const probe = compileApplicabilityProbe(manual, rule, false, rootTargetAliases);
  const selected = snapshot ? (0, import_predicate2.selectSubjects)(probe.rule, snapshot) : { nodes: [], unknown: true };
  return paths.map((path) => {
    const rootFact = path.startsWith("semanticApi.");
    const nodes = rootFact ? snapshot?.nodes.filter((node) => snapshot.selection.includes(String(node.id))) || [] : selected.nodes;
    const subjects = nodes.map((node) => ({
      nodeId: String(node.id),
      state: (0, import_predicate2.resolveValue)({ fact: path }, node, snapshot).state
    }));
    const uncertain2 = !snapshot || !subjects.length || (rootFact ? subjects.length !== 1 : selected.unknown || probe.unsupported.includes("target"));
    const state = uncertain2 || subjects.some((entry) => entry.state === "unknown") ? "unknown" : subjects.every((entry) => entry.state === "known") ? "available" : "unavailable";
    return { path, state, scope: rootFact ? "component-root" : "rule-target", subjects };
  });
}
function buildContractReadiness(compiled, manual) {
  const active = manual.rules.filter((rule) => rule.status !== "deprecated");
  const excluded = new Set(compiled.contract.nonExecutableRules.map((entry) => entry.sourceRuleId));
  const delegated = active.filter((rule) => rule.execution?.route === "delegated").map((rule) => rule.id);
  const contextOnly = active.filter((rule) => rule.execution?.route === "context-only").map((rule) => rule.id);
  const ruleIds = /* @__PURE__ */ new Set([...excluded, ...delegated, ...contextOnly]);
  for (const [index, rule] of manual.rules.entries()) {
    if (rule.status === "deprecated") continue;
    if (manual.metadata.ruleOwnershipVersion === 1 && !validRuleOwnership(rule.ownership, manual.component.componentId)) ruleIds.add(rule.id);
    if (!manual.targets.some((target) => target.id === rule.targetId) || compiled.issues.some((issue) => issue.level === "error" && issue.path.startsWith(`/rules/${index}/`))) ruleIds.add(rule.id);
  }
  const unreviewedRuleIds = active.filter((rule) => rule.status !== "reviewed").map((rule) => rule.id).sort();
  const unresolvedTargetIds = manual.targets.filter((target) => target.resolution !== "resolved" && active.some((rule) => rule.targetId === target.id)).map((target) => target.id).sort();
  const errors = compiled.issues.filter((issue) => issue.level === "error");
  return {
    status: compiled.contract.status === "ready" && !ruleIds.size && !unreviewedRuleIds.length && !unresolvedTargetIds.length && !errors.length ? "ready" : "draft",
    ...manual.metadata.ruleOwnershipVersion === 1 ? { ownership: buildOwnershipReadiness(compiled, manual, ruleIds) } : {},
    activeRules: active.length,
    deprecatedRules: manual.rules.length - active.length,
    unimplementedRules: ruleIds.size,
    unimplementedRuleIds: Array.from(ruleIds).sort(),
    contextOnlyRules: contextOnly.length,
    delegatedRules: delegated.length,
    compilerExcludedRules: Array.from(excluded).filter((id) => !contextOnly.includes(id)).length,
    unreviewedRuleIds,
    unresolvedTargetIds,
    validationErrors: errors.length
  };
}

// ../Apollo/packages/component-contract-core/src/dependency-capture-diagnostics.ts
var stages = {
  "resolve-instance": "\u043F\u043E\u0438\u0441\u043A \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430",
  "read-main-component": "\u0447\u0442\u0435\u043D\u0438\u0435 main component",
  "create-reference-instance": "\u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u044D\u0442\u0430\u043B\u043E\u043D\u0430",
  "append-reference-instance": "\u043F\u0435\u0440\u0435\u043D\u043E\u0441 \u044D\u0442\u0430\u043B\u043E\u043D\u0430 \u043D\u0430 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u0443\u044E \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443",
  "read-variable-modes": "\u0447\u0442\u0435\u043D\u0438\u0435 variable modes",
  "apply-variable-modes": "\u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u0435 variable modes",
  "capture-actual": "\u0437\u0430\u0445\u0432\u0430\u0442 \u0444\u0430\u043A\u0442\u043E\u0432 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430",
  "capture-reference": "\u0437\u0430\u0445\u0432\u0430\u0442 \u0444\u0430\u043A\u0442\u043E\u0432 \u044D\u0442\u0430\u043B\u043E\u043D\u0430",
  "materialize-baseline": "\u0441\u043E\u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0441 \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u043C",
  "capture-variant-reference": "\u0437\u0430\u0445\u0432\u0430\u0442 API \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430",
  "capture-nested-reference": "\u0437\u0430\u0445\u0432\u0430\u0442 \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0445 \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u0432",
  "map-node-ids": "\u0441\u043E\u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0443\u0437\u043B\u043E\u0432"
};
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
function dependencyCaptureFailureLabel(details) {
  if (!details || typeof details !== "object") return "";
  const value = details;
  if (value.version !== 1 || typeof value.stage !== "string" || !Object.prototype.hasOwnProperty.call(stages, value.stage) || typeof value.errorName !== "string" || typeof value.message !== "string") return "";
  const name = boundedText(value.errorName, 80), message = boundedText(value.message, 360);
  if (!name || !message) return "";
  return ` \u042D\u0442\u0430\u043F: ${stages[value.stage]}. ${name}: ${message}`;
}

// ../Apollo/packages/component-contract-core/src/validation-report.ts
function buildEditorValidationReport(result, compiled, manual, snapshot, options) {
  const evaluations = Array.isArray(result.evaluations) ? result.evaluations.slice() : [];
  const engineEvaluations = evaluations.length;
  const checkedSnapshot = snapshot ? prepareValidationSnapshot(snapshot, compiled.contract) : void 0;
  if (compiled.contract.runtimePolicy.gradientPaintFactsVersion === 1 && checkedSnapshot) {
    evaluations.forEach((evaluation, index) => {
      if (!["human-review", "not-evaluable"].includes(String(evaluation.classification))) return;
      const rule = compiled.contract.rules.find((rule2) => rule2.ruleId === evaluation.ruleId);
      const assertion = rule?.assert;
      const field = assertion?.actual?.fact;
      if (field !== "appearance.fill" && field !== "appearance.stroke") return;
      const issues = checkedSnapshot.nodes.filter((node) => !evaluation.subjectNodeId || node.id === evaluation.subjectNodeId).flatMap((node) => node.gradientPaintIssues || []).filter((issue) => issue.fact === field || issue.fact === `baseline.effective.${field}`).flatMap((issue) => issue.missing);
      if (issues.length) evaluations[index] = { ...evaluation, evidenceIssues: [...new Set(issues)] };
    });
  }
  const contractReadiness = buildContractReadiness(compiled, manual);
  const pending = /* @__PURE__ */ new Map();
  const add = (id, reason) => {
    if (!pending.has(id)) pending.set(id, /* @__PURE__ */ new Set());
    pending.get(id).add(reason);
  };
  const dependencyRuns = result.dependencyRuns || [];
  if (compiled.contract.runtimePolicy.memberCollectionsVersion === 1) for (const e of evaluations) {
    const evidence = e.collection;
    if (!evidence?.missing?.length) continue;
    const rule = compiled.contract.rules.find((r) => r.ruleId === e.ruleId);
    add(String(rule?.source?.anchor || e.ruleId), `\u041A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u044F \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u0430 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E: ${evidence.missing.join("; ")}.`);
  }
  const mode = compiled.contract.runtimePolicy.validationModeVersion === 1 ? validationMode(checkedSnapshot) : void 0;
  if (mode === "unknown") add("validation-mode", "\u0420\u0435\u0436\u0438\u043C \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u043C\u043E\u043C \u0444\u043E\u0440\u043C\u0430\u0442\u0435. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443 \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 \u0430\u0443\u0434\u0438\u0442\u0430 \u0438\u043B\u0438 \u0441\u043F\u0435\u0446\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438.");
  if (checkedSnapshot && compiled.contract.runtimePolicy.transitionFactsVersion === 1) {
    const root2 = checkedSnapshot.nodes.find((n) => checkedSnapshot.selection.includes(String(n.id)));
    for (const t of compiled.contract.facts.transitions || []) {
      const evidence = root2?.transitionsV1?.[t.id];
      if (evidence?.applicable === false || evidence?.reason === "paired") continue;
      add(t.sourceRuleId, transitionReason(evidence?.reason || "before-not-captured"));
      for (let i = evaluations.length - 1; i >= 0; i--) {
        const atomic = compiled.contract.rules.find((r) => r.ruleId === evaluations[i].ruleId);
        if (atomic?.presentation?.transitionId === t.id && ["human-review", "not-evaluable"].includes(String(evaluations[i].classification))) evaluations.splice(i, 1);
      }
    }
  }
  dependencyRuns.filter((run) => run.status === "not-executed" || run.status === "incomplete").forEach((run) => {
    const captures = checkedSnapshot?.componentDependencyCaptures?.filter((capture) => capture.nodeId === run.nodeId) || [];
    const diagnostic = run.reason === "dependency-reference-capture-failed" && captures.length === 1 && captures[0].failure === run.reason ? dependencyCaptureFailureLabel(captures[0].failureDetails) : "";
    add(`component-dependency:${run.dependencyId}:${run.bindingId}`, `\u0412\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 ${run.componentId} r${run.revision} \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E: ${run.reason}.${diagnostic}`);
  });
  compiled.contract.nonExecutableRules.forEach((entry) => {
    const index = manual.rules.findIndex((rule) => rule.id === entry.sourceRuleId);
    const errors = compiled.issues.filter((issue) => issue.level === "error" && issue.path.startsWith(`/rules/${index}/`));
    if (errors.length) add(entry.sourceRuleId, errors.map(validationIssueLabel).join(" "));
    else if (manual.rules[index]?.execution?.route !== "context-only") add(entry.sourceRuleId, entry.reason);
  });
  manual.rules.forEach((rule) => {
    if (rule.status === "deprecated") return;
    if (manual.metadata.ruleOwnershipVersion === 1 && !validRuleOwnership(rule.ownership, manual.component.componentId)) {
      add(rule.id, "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D \u0438\u043B\u0438 \u043D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u0435\u043D \u043D\u043E\u0440\u043C\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0432\u043B\u0430\u0434\u0435\u043B\u0435\u0446 \u043F\u0440\u0430\u0432\u0438\u043B\u0430; \u043F\u0440\u0438\u043D\u0430\u0434\u043B\u0435\u0436\u043D\u043E\u0441\u0442\u044C \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0443 \u0438\u043B\u0438 \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u044E \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430.");
    }
    const target = manual.targets.find((entry) => entry.id === rule.targetId);
    if (!target) add(rule.id, "\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430 \u0446\u0435\u043B\u044C \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0432 manual source.");
    const binding = checkedSnapshot?.targetResolution?.targets.find((entry) => entry.targetId === rule.targetId);
    if (binding && binding.resolution !== "resolved") add(rule.id, `\u0426\u0435\u043B\u044C \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0441\u043E\u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F: ${targetResolutionReason(binding.reason)}. \u0420\u0443\u0447\u043D\u0430\u044F \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043D\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0430.`);
    if (rule.execution?.route === "delegated") add(rule.id, `\u0412\u043D\u0435\u0448\u043D\u0438\u0435 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u043D\u044F\u043B\u0438\u0441\u044C \u0432 \u044D\u0442\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435: ${(rule.execution.externalRuleIds || []).join(", ")}.`);
    if (rule.execution?.route === "context-only") add(rule.id, "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u043F\u043E\u043A\u0430 \u043D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u043A \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 (context-only).");
    if (checkedSnapshot && compiled.contract.runtimePolicy.nativeSlotTargetsVersion === 1 && ["allowed", "constrained"].includes(rule.permission)) {
      for (const control of rule.controlPaths.filter((path) => path.kind === "slot-api" && path.contentOwnership === "external")) {
        const ownerTarget = control.ownerTargetId ? manual.targets.find((entry) => entry.id === control.ownerTargetId) : void 0;
        const node = checkedSnapshot.nodes.find((entry) => entry.semantic?.role === target?.semanticRole);
        const boundary = node?.slotBoundaryV1;
        if (node?.type === "SLOT" && boundary?.evidence === "native-slot-content-reference" && boundary?.targetId === target?.id && boundary?.property === control.property && boundary?.contentOwnership === "external") continue;
        const ownerPath = ownerTarget?.pathHint?.split(" / ").slice(1).join(" / ") || "";
        const expectedType = checkedSnapshot.variantReference?.nodeProperties[ownerPath]?.propertyTypes[control.property || ""];
        if (expectedType === "BOOLEAN") continue;
        add(rule.id, "\u0413\u0440\u0430\u043D\u0438\u0446\u0430 \u0432\u043D\u0435\u0448\u043D\u0435\u0433\u043E native SLOT \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430: \u043D\u0443\u0436\u043D\u044B \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 SLOT-\u044F\u043A\u043E\u0440\u044C, \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0432\u043B\u0430\u0434\u0435\u043B\u0435\u0446 \u0438 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u044B\u0439 \u044D\u0442\u0430\u043B\u043E\u043D. \u0421\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u043D\u0435 \u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0438\u0437 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u043F\u043E \u0438\u043C\u0435\u043D\u0438.");
      }
    }
  });
  compiled.contract.rules.forEach((rule) => {
    const sourceId = String(rule.source?.anchor || rule.ruleId);
    const matches2 = (result.evaluations || []).filter((entry) => entry.ruleId === rule.ruleId);
    if (!matches2.length) add(sourceId, "Predicate Engine \u043D\u0435 \u0432\u0435\u0440\u043D\u0443\u043B \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0434\u043B\u044F \u0438\u0441\u043F\u043E\u043B\u043D\u044F\u0435\u043C\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438.");
    matches2.forEach((entry) => {
      const reason = String(entry.trace?.reason || "");
      const source = manual.rules.find((entry2) => entry2.id === sourceId);
      const hidden = options?.hiddenTargetCoverageVersion === 1 && checkedSnapshot && source && reason === "selector matched no visible nodes" ? provenHiddenRuleTarget(manual, source, checkedSnapshot) : void 0;
      if (hidden) {
        const index = evaluations.indexOf(entry);
        if (index >= 0) evaluations[index] = Object.assign({}, entry, {
          origin: "editor-hidden-target-scope",
          subjectNodeId: hidden.id,
          subjectNodeName: hidden.name,
          focusNodeId: hidden.id,
          focusNodeName: hidden.name,
          trace: {
            predicate: "equals",
            truth: "false",
            reason: "exact declared target is present but effectively hidden",
            actual: false,
            expected: true,
            factPaths: ["visibility.effective"]
          }
        });
        return;
      }
      if (reason === "selector matched no visible nodes" || reason === "rule authority is not active") {
        add(sourceId, reason === "rule authority is not active" ? "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u043D\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u043E." : "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u0441\u043B\u043E\u0439 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D; \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E.");
      }
    });
  });
  if (checkedSnapshot?.targetResolution) {
    for (let index = evaluations.length - 1; index >= 0; index--) {
      const entry = evaluations[index];
      if (entry.trace?.reason !== "selector matched no visible nodes") continue;
      const atomic = compiled.contract.rules.find((rule) => rule.ruleId === entry.ruleId);
      const sourceId = String(atomic?.source?.anchor || "");
      const source = manual.rules.find((rule) => rule.id === sourceId);
      const binding = checkedSnapshot.targetResolution.targets.find((target) => target.targetId === source?.targetId);
      if (binding && binding.resolution !== "resolved") evaluations.splice(index, 1);
    }
  }
  const globalErrors = compiled.issues.filter((issue) => issue.level === "error" && !issue.path.startsWith("/rules/"));
  if (snapshot?.source?.captureTopology?.issues.length) add(
    "snapshot-capture",
    `\u0417\u0430\u0445\u0432\u0430\u0442 \u0434\u0435\u0440\u0435\u0432\u0430 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D: ${snapshot.source.captureTopology.issues.map((i) => `${i.kind}${i.nodeId ? ` (${i.nodeId})` : ""}`).join("; ")}. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443; \u043D\u0435\u0434\u043E\u0441\u0442\u043E\u0432\u0435\u0440\u043D\u0430\u044F \u0442\u043E\u043F\u043E\u043B\u043E\u0433\u0438\u044F \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0439.`
  );
  else if (snapshot?.source?.truncated) add("snapshot-capture", `\u0421\u043D\u0438\u043C\u043E\u043A \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D ${snapshot.source.nodeLimit} \u0443\u0437\u043B\u0430\u043C\u0438; \u0447\u0430\u0441\u0442\u044C \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u0430.`);
  const boundaries = checkedSnapshot?.instanceBoundaries || [];
  boundaries.forEach((boundary) => {
    const slot = checkedSnapshot?.nodes.find((n) => String(n.id) === boundary.nodeId)?.slotBoundaryV1;
    if (compiled.contract.runtimePolicy.slotTargetFactsVersion === 1 && slot?.contentOwnership === "external") return;
    const content = checkedSnapshot?.instanceContentResults?.find((entry) => entry.boundaryNodeId === boundary.nodeId);
    if (content?.status === "matched") return;
    if (content?.status === "partial" && content.lineageProven && boundaries.some((b) => b.nodeId !== boundary.nodeId && withinBoundary(b.actualPath, boundary.actualPath))) return;
    const location = `\u0412\u043B\u043E\u0436\u0435\u043D\u043D\u0430\u044F \u043E\u0431\u043B\u0430\u0441\u0442\u044C \xAB${boundary.actualPath}\xBB \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u0430: ${boundary.reason === "instance-swap" ? `\u0437\u0430\u043C\u0435\u043D\u0430 \u0447\u0435\u0440\u0435\u0437 ${boundary.property}` : boundary.reason === "component-variant-changed" ? "\u0432\u044B\u0431\u0440\u0430\u043D \u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442 \u0442\u043E\u0433\u043E \u0436\u0435 \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430" : boundary.reason === "component-identity-changed" ? "\u0438\u0437\u043C\u0435\u043D\u0451\u043D \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0439 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442" : "\u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0430\u043D\u043D\u044B\u0445 \u043E\u0431 \u0438\u0434\u0435\u043D\u0442\u0438\u0447\u043D\u043E\u0441\u0442\u0438 \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430"}.`;
    if (!checkedSnapshot?.instanceContentReferences) {
      add(`instance-boundary:${boundary.nodeId}`, `${location} Baseline \u043F\u0440\u0435\u0436\u043D\u0435\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F. \u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u0437\u0430\u043C\u0435\u043D\u044B \u0438 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430/reference.`);
      return;
    }
    const labels = {
      "reference-not-captured": "\u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u044B\u0439 \u044D\u0442\u0430\u043B\u043E\u043D \u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D",
      "reference-parent-mismatch": "\u0446\u0435\u043F\u043E\u0447\u043A\u0430 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u044B\u0445 \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u0432 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0439 \u043E\u0431\u043B\u0430\u0441\u0442\u0438",
      "nested-content-reference-unresolved": "\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0430 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D, \u043D\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u043E\u0439 \u0437\u0430\u043C\u0435\u043D\u044B \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E \u043D\u0435 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E",
      "original-host-evidence-invalid": "\u0438\u0441\u0445\u043E\u0434\u043D\u044B\u0439 \u044D\u0442\u0430\u043B\u043E\u043D host \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D",
      "explicit-swap-port-required": "\u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D \u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u044B\u0439 INSTANCE_SWAP port",
      "ambiguous-reference": "\u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u0432 \u043E\u0434\u043D\u043E\u0439 \u0437\u0430\u043C\u0435\u043D\u044B",
      "replacement-reference-incomplete": "\u044D\u0442\u0430\u043B\u043E\u043D \u043D\u0435\u043F\u043E\u043B\u043E\u043D \u0438\u043B\u0438 \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 modes/\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0443",
      "replacement-identity-or-port-mismatch": "identity \u0438\u043B\u0438 port \u044D\u0442\u0430\u043B\u043E\u043D\u0430 \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0442 \u0441 \u0437\u0430\u043C\u0435\u043D\u043E\u0439",
      "host-context-changed": "\u043F\u0440\u0438 \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0438 \u044D\u0442\u0430\u043B\u043E\u043D\u0430 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u043E\u0441\u044C \u043E\u043A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0437\u0430\u043C\u0435\u043D\u044F\u0435\u043C\u043E\u0433\u043E \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0433\u043E",
      "replacement-structure-needs-remap": "\u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u043D\u043E\u0432\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0435 \u0441\u043E\u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0430 \u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u043E",
      "replacement-nested-identity-unresolved": "\u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u044B \u043A\u043B\u044E\u0447\u0438 \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0445 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043E\u0432 \u043D\u043E\u0432\u043E\u0439 \u0438\u043A\u043E\u043D\u043A\u0438",
      "variant-properties-mismatch": "variant properties \u043D\u0435 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0442 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u043C\u0443 \u044D\u0442\u0430\u043B\u043E\u043D\u0443 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430",
      "variant-properties-unavailable": "\u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u044B VARIANT-\u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E main component",
      "variant-switch-identity-mismatch": "\u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 VARIANT-\u0441\u0432\u043E\u0439\u0441\u0442\u0432 \u043D\u0435 \u043F\u0440\u0438\u0432\u0435\u043B\u043E \u043A \u043E\u0436\u0438\u0434\u0430\u0435\u043C\u043E\u043C\u0443 component key",
      "variant-capture-strategy-unproven": "\u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u0441 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435\u043C \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u0447\u043D\u043E\u0433\u043E host-\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442\u0430",
      "variable-modes-unavailable": "\u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043E\u0441\u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0441\u0442\u0438 variable modes",
      "reference-capture-limit": "\u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442 \u043B\u0438\u043C\u0438\u0442 8 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u044B\u0445 \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u0432 \u0437\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443",
      "replacement-component-unavailable": "\u043D\u043E\u0432\u044B\u0439 main component \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0438\u043B\u0438 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0441\u044F",
      "reference-capture-failed": "Figma \u043D\u0435 \u043F\u043E\u0437\u0432\u043E\u043B\u0438\u043B\u0430 \u043F\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u044B\u0439 \u044D\u0442\u0430\u043B\u043E\u043D"
    };
    add(`instance-boundary:${boundary.nodeId}`, `${location} \u041F\u0440\u0438\u0447\u0438\u043D\u0430: ${labels[content?.reason || ""] || "\u043D\u0435\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u043E\u0433\u043E \u044D\u0442\u0430\u043B\u043E\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0433\u043E"}. Baseline \u043F\u0440\u0435\u0436\u043D\u0435\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F. \u0414\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u0437\u0430\u043C\u0435\u043D\u044B \u043E\u0446\u0435\u043D\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u043C\u0438 \u043F\u0440\u0430\u0432\u0438\u043B\u0430\u043C\u0438; \u044D\u0442\u043E\u0442 \u043F\u0443\u043D\u043A\u0442 \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043A \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0433\u043E.`);
  });
  globalErrors.forEach((issue) => add("contract-validation", `${issue.path}: ${validationIssueLabel(issue)}`));
  let excludedRules = 0;
  let notExecuted = 0;
  let unknownApplicabilityRules = 0;
  pending.forEach((reasons, sourceId) => {
    const packageGapReasons = Array.from(reasons);
    const rule = manual.rules.find((entry) => entry.id === sourceId);
    const applicability2 = rule ? diagnoseRuleApplicability(
      manual,
      rule,
      checkedSnapshot,
      ["variant-facts-v3", "variant-facts-v4", "dependency-facts-v5"].includes(compiled.contract.package.snapshotProfile || ""),
      compiled.contract.runtimePolicy.rootTargetAliasesVersion === 1
    ) : void 0;
    const excluded = applicability2?.status === "not-applicable";
    if (excluded) excludedRules++;
    else {
      notExecuted++;
      if (applicability2?.status === "unknown") {
        unknownApplicabilityRules++;
        reasons.add("\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u043C\u043E\u0441\u0442\u044C \u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430; \u043F\u0440\u0430\u0432\u0438\u043B\u043E \u043D\u0435 \u0438\u0441\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0438\u0437 \u043F\u043E\u043B\u043D\u043E\u0442\u044B \u043F\u0440\u043E\u0433\u043E\u043D\u0430.");
        if (applicability2.unsupportedConditions.length) reasons.add(`\u0422\u0440\u0435\u0431\u0443\u044E\u0442 \u0441\u043E\u043F\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F: ${applicability2.unsupportedConditions.join(", ")}.`);
      }
    }
    const facts2 = rule ? inspectRuleFacts(manual, rule, checkedSnapshot, compiled.contract.runtimePolicy.rootTargetAliasesVersion === 1) : [];
    if (facts2.length && !excluded) {
      const available = facts2.filter((fact2) => fact2.state === "available").map((fact2) => fact2.path);
      const missing = facts2.filter((fact2) => fact2.state !== "available").map((fact2) => fact2.path);
      if (missing.length) reasons.add(`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E runtime-\u0434\u0430\u043D\u043D\u044B\u0445: ${missing.join(", ")}.`);
      if (available.length) reasons.add(`\u0423\u0436\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B: ${available.join(", ")}.`);
      if (!missing.length) reasons.add("\u0412\u0441\u0435 \u0437\u0430\u044F\u0432\u043B\u0435\u043D\u043D\u044B\u0435 \u0444\u0430\u043A\u0442\u044B \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B, \u043D\u043E \u044D\u0442\u043E \u043D\u0435 \u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442, \u0447\u0442\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u043E \u0438\u0441\u043F\u043E\u043B\u043D\u0435\u043D\u043E.");
    }
    const evidence = applicability2?.evaluations.find((entry) => entry.applicability === "not-applicable" && entry.trace.truth === "false");
    const boundary = boundaries.find((b) => sourceId === `instance-boundary:${b.nodeId}`);
    evaluations.push({
      evaluationId: `editor:${excluded ? "not-applicable" : "not-executed"}:${sourceId}`,
      ruleId: sourceId,
      classification: excluded ? "not-applicable" : "not-executed",
      severity: rule?.severity || "error",
      origin: "editor-coverage",
      applicability: applicability2?.status || "unknown",
      ruleTitle: rule?.message || rule?.rationale || sourceId,
      capability: rule?.capability || rule?.capabilitySet || "",
      subjectNodeName: manual.targets.find((target) => target.id === rule?.targetId)?.label || manual.component.family,
      ...boundary ? { subjectNodeId: boundary.nodeId, subjectNodeName: boundary.actualPath, focusNodeId: boundary.nodeId, ruleTitle: "\u041D\u0435\u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u0432\u043B\u043E\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430" } : {},
      trace: excluded && evidence ? evidence.trace : { reason: Array.from(reasons).join(" ") },
      applicabilityEvidence: applicability2,
      factAvailability: facts2,
      packageGapReasons
    });
  });
  const inconclusive = evaluations.filter((entry) => ["human-review", "not-evaluable", "unknown"].includes(String(entry.classification))).length;
  const ownershipCoverage = manual.metadata.ruleOwnershipVersion === 1 ? buildOwnershipCoverage(evaluations, compiled, manual) : void 0;
  const complete = notExecuted === 0 && inconclusive === 0 && evaluations.length > 0 && !ownershipCoverage?.unclassified.evaluations;
  const scenarioCoverage = {
    complete,
    notExecuted,
    inconclusive,
    engineEvaluations,
    excludedRules,
    unknownApplicabilityRules,
    ...options?.hiddenTargetCoverageVersion === 1 ? { hiddenTargetCoverageVersion: 1 } : {},
    ...mode ? { validationMode: mode, specificationStatus: mode === "component-audit" ? "not-requested" : mode === "unknown" ? "unknown" : "requested" } : {}
  };
  return {
    ...result,
    evaluations,
    contractReadiness,
    scenarioCoverage,
    ...ownershipCoverage ? { ownershipCoverage } : {},
    // Compatibility alias: this now describes the current scenario, not package readiness.
    editorCoverage: scenarioCoverage
  };
}

// ../Apollo/packages/component-contract-core/src/diagnostic-values.ts
function paintDiagnosticSummary(value) {
  if (!Array.isArray(value) || !value.length || !value.every((item) => item && typeof item === "object" && typeof item.type === "string")) return null;
  return value.map((paint, index) => {
    if (String(paint.type).startsWith("GRADIENT_")) {
      return [
        `${value.length > 1 ? `${index + 1}. ` : ""}${paint.type}`,
        ...Array.isArray(paint.gradientStops) ? paint.gradientStops.map((stop, i) => `Stop ${i + 1} @ ${stop.position}: RGBA (0\u20131) ${JSON.stringify(stop.color)} \xB7 Token ID: ${stop.tokenId === null ? "\u043D\u0435\u0442 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438" : stop.tokenId || "\u043D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445"}`) : ["Stops: \u043D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445"],
        `Transform: ${paint.gradientTransform ? JSON.stringify(paint.gradientTransform) : "\u043D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445"}`,
        ...paint.blendMode === void 0 ? [] : [`Blend: ${paint.blendMode}`],
        ...paint.opacity === void 0 ? [] : [`Opacity: ${paint.opacity}`],
        ...paint.visible === false ? ["\u0421\u043A\u0440\u044B\u0442\u0430"] : []
      ].join("\n");
    }
    const color = paint.color;
    const hex = color && ["r", "g", "b"].every((key2) => typeof color[key2] === "number") ? `#${["r", "g", "b"].map((key2) => Math.round(color[key2]).toString(16).padStart(2, "0")).join("").toUpperCase()}` : "";
    return [
      `${value.length > 1 ? `${index + 1}. ` : ""}${paint.type}${hex ? ` \xB7 ${hex}` : ""}`,
      `Token ID: ${typeof paint.tokenId === "string" && paint.tokenId ? paint.tokenId : "\u043D\u0435\u0442 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438 \u0432 \u0441\u043D\u0438\u043C\u043A\u0435"}`,
      ...paint.opacity === void 0 ? [] : [`Opacity: ${paint.opacity}`],
      ...paint.visible === false ? ["\u0421\u043A\u0440\u044B\u0442\u0430"] : []
    ].join("\n");
  }).join("\n\n");
}

// ../Apollo/packages/component-contract-core/src/capture-facts.ts
function captureSupplementalFacts(node, mixed) {
  const text3 = {};
  const parent3 = {};
  const unknownFacts = [];
  const read = (source, key2, output, fact2) => {
    let value;
    try {
      value = source[key2];
    } catch {
      value = void 0;
    }
    if (value === mixed || value === void 0 || typeof value === "number" && !Number.isFinite(value)) unknownFacts.push(fact2);
    else if (value === null || ["string", "boolean", "number"].includes(typeof value)) output[key2] = value;
    else unknownFacts.push(fact2);
  };
  if (node.type === "TEXT") {
    for (const key2 of ["textAutoResize", "textAlignHorizontal", "textAlignVertical", "textTruncation", "maxLines", "paragraphSpacing", "maxHeight"]) read(node, key2, text3, `text.${key2}`);
  }
  const sourceParent = node.parent;
  if (sourceParent && !["PAGE", "DOCUMENT"].includes(String(sourceParent.type))) {
    const layout = {};
    read(sourceParent, "layoutMode", layout, "parent.layout.mode");
    if ("layoutMode" in layout) {
      layout.mode = layout.layoutMode;
      delete layout.layoutMode;
    }
    parent3.layout = layout;
    read(sourceParent, "clipsContent", parent3, "parent.clipsContent");
  } else if (sourceParent && ["PAGE", "DOCUMENT"].includes(String(sourceParent.type))) {
    parent3.layout = { mode: "NONE" };
  } else unknownFacts.push("parent");
  return { text: text3, parent: parent3, unknownFacts };
}

// ../Apollo/packages/component-contract-core/src/capture-topology.ts
function captureSceneTopology(root2, limit = 500, omitChildren) {
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
    if (omitChildren?.(entry, index, entries)) return index;
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
  visit(root2, null, /* @__PURE__ */ new Set());
  return { entries, issues, limitReached, complete: !limitReached && !issues.length };
}

// ../Apollo/packages/component-contract-core/src/instance-source-identity.ts
function captureInstanceSourceIdentities(entries, mains, pristineSources = /* @__PURE__ */ new Map(), includeOwnedLayers = false) {
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
        const pristine = pristineSources.get(main.id), root2 = pristine?.topology.entries[0];
        if (!pristine?.topology.complete || !root2 || root2.type !== "INSTANCE" || root2.parentIndex !== null || pristine.mainComponentId !== main.id || pristine.componentKey !== main.key || root2.figmaNodeId === owner.figmaNodeId) continue;
        if (!sources.has(main)) {
          const sourcePrefix = (root2.figmaNodeId.startsWith("I") ? root2.figmaNodeId : "I" + root2.figmaNodeId) + ";";
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
          const key2 = JSON.stringify([n.figmaNodeId, n.type, n.parentIndex]);
          if (!index.has(key2)) index.set(key2, i);
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
        const index = sourceIndexes.get(source).get(JSON.stringify([id, inherited.type, sourceParentIndex])) ?? -1;
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
  for (const [key2, candidates] of byKey) {
    const collection = candidates[0];
    if (candidates.length !== 1) {
      unknownFacts.push(`variable.modes.${key2}`);
      continue;
    }
    if (typeof collection.name !== "string" || !Array.isArray(collection.modes) || collection.modes.some((mode) => !mode || typeof mode.modeId !== "string" || typeof mode.name !== "string")) {
      unknownFacts.push(`variable.modes.${key2}`);
      continue;
    }
    modeCatalog[key2] = {
      collectionId: collection.id,
      collectionName: collection.name,
      defaultModeId: collection.defaultModeId,
      modes: collection.modes.map((mode) => ({ modeId: mode.modeId, name: mode.name }))
    };
    const modeId = resolved[collection.id];
    if (typeof modeId === "string" && collection.modes.filter((mode) => mode.modeId === modeId).length === 1) {
      modes[key2] = modeId;
    } else {
      unknownFacts.push(`variable.modes.${key2}`);
    }
  }
  return { modes, modeCatalog, unknownFacts };
}

// ../Apollo/packages/component-contract-core/src/effect-facts.ts
function captureEffectDetails(effects, styleId) {
  if (!Array.isArray(effects) || typeof styleId !== "string") return void 0;
  if (effects.some((e) => !e || typeof e !== "object" || typeof e.type !== "string")) return void 0;
  if (effects.some((e) => ["BACKGROUND_BLUR", "LAYER_BLUR"].includes(e.type) && (typeof e.radius !== "number" || !Number.isFinite(e.radius) || e.radius < 0))) return void 0;
  const key2 = /^S:([a-f0-9]{40})(?:,|$)/i.exec(styleId)?.[1];
  return {
    version: 1,
    styleRef: key2 ? `key:${key2.toLowerCase()}` : styleId ? `local:${styleId}` : null,
    effects: effects.map((e) => JSON.parse(JSON.stringify(e)))
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
    let branch = subject, parent3 = subject.parent;
    while (parent3 && parent3.type !== "PAGE") {
      if (ancestors.length >= 32) throw Error("ancestor-limit");
      const siblings = (parent3.children || []).filter((n) => n !== branch);
      if (siblings.length > 200) throw Error("sibling-limit");
      const layout = fields(parent3, layoutKeys);
      if (parent3.relativeTransform) layout.linearTransform = parent3.relativeTransform.map((row) => row.slice(0, 2));
      if (parent3.type !== "GROUP") {
        if (parent3.layoutSizingHorizontal !== "HUG") {
          if (!Number.isFinite(parent3.width)) throw Error("parent-width-unknown");
          layout.width = parent3.width;
        }
        if (parent3.layoutSizingVertical !== "HUG") {
          if (!Number.isFinite(parent3.height)) throw Error("parent-height-unknown");
          layout.height = parent3.height;
        }
      }
      if (parent3.layoutMode === "GRID") throw Error("unsupported-grid-context");
      ancestors.push({
        id: parent3.id,
        type: parent3.type,
        layout,
        childIds: (parent3.children || []).map((n) => n.id),
        siblings: siblings.map((n) => ({ id: n.id, ...fields(n, ["width", "height", "visible", ...layoutKeys]) }))
      });
      branch = parent3;
      parent3 = parent3.parent;
    }
    if (!parent3 || parent3.type !== "PAGE") throw Error("page-unknown");
    const context = {
      profile: "same-instance-context@1",
      pageId: parent3.id,
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

// ../Apollo/packages/component-contract-core/src/target-remap.ts
var clone4 = (value) => JSON.parse(JSON.stringify(value));
var record32 = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
var relative = (path) => path === void 0 ? void 0 : path.split(" / ").slice(1).join(" / ");
var includesPath = (ancestor, path) => ancestor === "" || ancestor === path || path.startsWith(`${ancestor} / `);
var declaredPath = (target, representationId, componentKey) => target.variantHints?.find((h) => h.representationId === representationId && h.componentKey === componentKey)?.pathHint || target.representationHints?.find((h) => h.representationId === representationId)?.pathHint || target.pathHint;
function references(value, keys, role) {
  if (typeof value === "string") return keys.has(value) || ["relations", "semanticTargets", "variantAvailability.targets"].some((prefix) => value === `${prefix}.${role}` || value.startsWith(`${prefix}.${role}.`));
  if (Array.isArray(value)) return value.some((entry) => references(entry, keys, role));
  return Boolean(value && typeof value === "object" && Object.values(value).some((entry) => references(entry, keys, role)));
}
function affectedRules(manual, target, representationId, nextPath, componentKey) {
  const before = relative(declaredPath(target, representationId, componentKey));
  const after = relative(nextPath);
  const keys = new Set([
    target.id,
    target.semanticRole,
    declaredPath(target, representationId, componentKey) || "",
    ...manual.controlPorts.filter((port) => port.targetId === target.id).map((port) => port.id)
  ].filter(Boolean));
  return manual.rules.flatMap((rule) => {
    if (rule.status === "deprecated") return [];
    const reasons = [];
    if (rule.targetId === target.id) reasons.push("\u0446\u0435\u043B\u044C \u043F\u0440\u0430\u0432\u0438\u043B\u0430");
    if (references(rule.constraints, keys, target.semanticRole)) reasons.push("\u0441\u0432\u044F\u0437\u044C \u0438\u043B\u0438 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u044C");
    if (references(rule.controlPaths, keys, target.semanticRole)) reasons.push("\u0443\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0438\u0439 \u043F\u0443\u0442\u044C / port");
    if (references(rule.applicability.context, keys, target.semanticRole)) reasons.push("\u0443\u0441\u043B\u043E\u0432\u0438\u0435");
    if (rule.targetScope === "self-and-descendants" || rule.targetScope === "descendants") {
      const owner = manual.targets.find((t) => t.id === rule.targetId);
      const path = owner && relative(declaredPath(owner, representationId, componentKey));
      if (path !== void 0 && (before !== void 0 && includesPath(path, before) || includesPath(path, after))) reasons.push("\u043E\u0445\u0432\u0430\u0442 \u043F\u043E\u0442\u043E\u043C\u043A\u043E\u0432");
    }
    return reasons.length ? [{ id: rule.id, title: rule.message || rule.rationale || rule.id, status: rule.status, reasons }] : [];
  });
}
function hasFact(node, path) {
  if ((node.unknownFacts || []).some((p) => path === p || path.startsWith(`${p}.`))) return false;
  if (path.startsWith("component.properties.")) return Object.prototype.hasOwnProperty.call(record32(record32(node.component).properties), path.slice("component.properties.".length));
  let current = node;
  for (const part of path.split(".")) {
    if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, part)) return false;
    current = current[part];
  }
  return current !== void 0;
}
function requiredFacts(rule) {
  const registered = rule.capabilitySet ? [...capabilitiesForSet(rule.capabilitySet)] : [rule.capability];
  const capabilities = rule.capabilitySet && rule.capabilitySelection ? registered.filter((c) => rule.capabilitySelection.includes(c)) : registered;
  const constraints = rule.constraints.length ? rule.constraints : rule.permission === "forbidden" ? [{ type: "propertyForbidden" }] : [];
  return [...new Set(capabilities.flatMap((capability) => !constraints.length ? [factForCapability(capability)] : constraints.flatMap((constraint) => {
    const fact2 = constraint.fact || factForCapability(capability);
    return constraint.type === "propertyForbidden" ? [fact2, `baseline.effective.${fact2}`] : ["propertyDomain", "layoutConstraint"].includes(constraint.type) ? [fact2] : constraint.type === "tokenBinding" ? ["variable.bindings"] : [];
  })))];
}
function planTargetRemap(input) {
  const { manual, snapshot, variantEvidence, targetId, nodeId } = input;
  const plan = {
    planHash: "",
    manualSourceHash: stableHash(manual),
    snapshotHash: stableHash(snapshot),
    evidenceHash: stableHash(variantEvidence || null),
    targetId,
    nodeId,
    affectedRules: [],
    affectedExamples: [],
    capabilities: [],
    blockers: [],
    warnings: [],
    changed: false,
    canApply: false
  };
  const finish2 = () => {
    plan.blockers = [...new Set(plan.blockers)];
    plan.warnings = [...new Set(plan.warnings)];
    plan.canApply = plan.changed && !plan.blockers.length;
    plan.planHash = stableHash({ ...plan, planHash: void 0 });
    return plan;
  };
  const targets = manual.targets.filter((t) => t.id === targetId);
  if (targets.length !== 1) {
    plan.blockers.push("\u0418\u0441\u0445\u043E\u0434\u043D\u0430\u044F \u0446\u0435\u043B\u044C \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0438\u043B\u0438 \u0435\u0451 ID \u043D\u0435 \u0443\u043D\u0438\u043A\u0430\u043B\u0435\u043D.");
    return finish2();
  }
  const target = targets[0];
  plan.before = clone4(target);
  if (manual.targets.filter((t) => t.semanticRole === target.semanticRole).length !== 1) plan.blockers.push("Semantic role \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0439 \u0446\u0435\u043B\u0438 \u043D\u0435 \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u0430.");
  const paths = snapshotPaths(snapshot);
  if (!paths) {
    plan.blockers.push("\u041D\u0443\u0436\u0435\u043D \u043F\u043E\u043B\u043D\u044B\u0439 \u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u044B\u0439 \u0441\u043D\u0438\u043C\u043E\u043A \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u0431\u0435\u0437 \u0443\u0441\u0435\u0447\u0435\u043D\u0438\u044F \u0438 \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u043E\u0432 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u044B.");
    return finish2();
  }
  const node = snapshot.nodes.find((n) => n.id === nodeId);
  if (!node) {
    plan.blockers.push("\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043E\u0431\u044A\u0435\u043A\u0442 \u0438\u0437 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0441\u043D\u0438\u043C\u043A\u0430.");
    return finish2();
  }
  const keys = [snapshot.source?.componentKey, snapshot.source?.componentSetKey].filter(Boolean);
  const reps = manual.representations.filter((rep2) => rep2.kind === "figma" && rep2.status !== "deprecated" && rep2.platform === snapshot.context.platform && keys.some((key2) => key2 === rep2.locator.componentKey || key2 === rep2.locator.componentSetKey));
  if (reps.length !== 1) {
    plan.blockers.push("\u0421\u043D\u0438\u043C\u043E\u043A \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442 \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 Figma-\u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u044D\u0442\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430.");
    return finish2();
  }
  const rep = reps[0];
  plan.representationId = rep.id;
  const occurrenceMode = variantEvidence?.occurrenceAddressVersion === 1;
  const componentKey = snapshot.source?.componentKey;
  const hints = occurrenceMode ? target.variantHints?.filter((h) => h.representationId === rep.id && h.componentKey === componentKey) || [] : target.representationHints?.filter((h) => h.representationId === rep.id) || [];
  if (hints.length > 1) {
    plan.blockers.push("\u0414\u043B\u044F \u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0443\u0436\u0435 \u0437\u0430\u0434\u0430\u043D\u044B \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442\u0443\u044E\u0449\u0438\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438; \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442.");
    return finish2();
  }
  if (!occurrenceMode && target.resolution !== "resolved" && manual.representations.filter((r) => r.kind === "figma" && r.status !== "deprecated").length > 1) {
    plan.blockers.push("\u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u043E \u043D\u0435\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u0443\u044E \u0446\u0435\u043B\u044C \u0441 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u043C\u0438 Figma-\u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0438\u044F\u043C\u0438 \u043D\u0435\u043B\u044C\u0437\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u043E\u0434\u043D\u0438\u043C \u0441\u043D\u0438\u043C\u043A\u043E\u043C. \u041D\u0443\u0436\u043D\u0430 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u0430\u044F \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 scope \u043F\u0440\u0438\u0432\u044F\u0437\u043E\u043A.");
  }
  const oldPath = declaredPath(target, rep.id, componentKey);
  plan.previousPath = oldPath;
  const actualPath = paths.get(nodeId);
  const comparison = occurrenceMode && snapshot.variantReference ? compareInstanceBoundaries(snapshot, snapshot.variantReference) : void 0;
  const path = occurrenceMode ? correspondingPath(comparison, actualPath) : actualPath;
  if (path === void 0 || occurrenceMode && (!componentKey || snapshot.variantReference?.occurrenceAddressVersion !== 1)) {
    plan.blockers.push("\u0423 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u0430 \u043D\u0435\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u043E\u0433\u043E source address \u0432 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u043C \u044D\u0442\u0430\u043B\u043E\u043D\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430.");
    return finish2();
  }
  if ((target.semanticRole === "root" || oldPath !== void 0 && relative(oldPath) === "") !== (path === "")) plan.blockers.push("\u041A\u043E\u0440\u043D\u0435\u0432\u0443\u044E \u0446\u0435\u043B\u044C \u043D\u0435\u043B\u044C\u0437\u044F \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u0442\u044C \u043D\u0430 \u043F\u043E\u0442\u043E\u043C\u043A\u0430, \u0430 \u0446\u0435\u043B\u044C \u043F\u043E\u0442\u043E\u043C\u043A\u0430 \u2014 \u043D\u0430 \u043A\u043E\u0440\u0435\u043D\u044C.");
  const root2 = snapshot.nodes.find((n) => snapshot.selection.includes(String(n.id)));
  const prefix = oldPath?.split(" / ")[0] || manual.component.family;
  const nextPath = [prefix, path].filter(Boolean).join(" / ");
  plan.nextPath = nextPath;
  const lineage = [];
  let current = node;
  while (current) {
    const identity = record32(record32(current.component).identity);
    lineage.unshift({
      name: String(current.name),
      type: String(current.type),
      ...identity.componentKey ? { componentKey: String(identity.componentKey) } : {},
      ...identity.componentSetKey ? { componentSetKey: String(identity.componentSetKey) } : {}
    });
    current = current.parentId === null ? void 0 : snapshot.nodes.find((n) => n.id === current.parentId);
  }
  plan.candidate = { name: String(node.name), type: String(node.type), lineage };
  if (snapshot.source?.occurrenceAddressVersion !== 1 && lineage.slice(1).some((n) => n.name.includes(" / "))) plan.blockers.push("\u0418\u043C\u044F \u0441\u043B\u043E\u044F \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u0440\u0430\u0437\u0434\u0435\u043B\u0438\u0442\u0435\u043B\u044C \u043F\u0443\u0442\u0438 \xAB / \xBB; \u0442\u0430\u043A\u0430\u044F \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043D\u0435\u043E\u0434\u043D\u043E\u0437\u043D\u0430\u0447\u043D\u0430.");
  for (const other of manual.targets.filter((t) => t.id !== targetId)) {
    if (relative(declaredPath(other, rep.id, componentKey)) === path) plan.blockers.push(`\u041E\u0431\u044A\u0435\u043A\u0442 \u0443\u0436\u0435 \u0437\u0430\u043A\u0440\u0435\u043F\u043B\u0451\u043D \u0437\u0430 ${other.id}; \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043E\u0431\u044A\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0446\u0435\u043B\u0435\u0439 \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D\u043E.`);
  }
  const fingerprint = stableHash({ type: node.type, path: nextPath, order: node.order }).slice(0, 16);
  plan.changed = oldPath !== nextPath || (occurrenceMode ? hints.length !== 1 : (record32(hints[0]).structuralFingerprint || target.structuralFingerprint) !== fingerprint) || target.resolution !== "resolved";
  if (!plan.changed) plan.blockers.push("\u042D\u0442\u0430 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u0443\u0436\u0435 \u0430\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u0430. \u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 node ID \u0441\u0430\u043C\u043E \u043F\u043E \u0441\u0435\u0431\u0435 \u043D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u043F\u0435\u0440\u0435\u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438.");
  plan.after = occurrenceMode ? { ...clone4(target), resolution: "resolved", variantHints: [
    ...(target.variantHints || []).filter((h) => h.representationId !== rep.id || h.componentKey !== componentKey).map(clone4),
    { representationId: rep.id, componentKey, pathHint: nextPath }
  ] } : { ...clone4(target), resolution: "resolved", representationHints: [
    ...(target.representationHints || []).filter((h) => h.representationId !== rep.id).map(clone4),
    { representationId: rep.id, nameHint: String(node.name), pathHint: nextPath, structuralFingerprint: fingerprint }
  ] };
  plan.affectedRules = affectedRules(manual, target, rep.id, nextPath, componentKey);
  const affected = new Set(plan.affectedRules.map((rule) => rule.id));
  plan.affectedExamples = manual.examples.filter((example) => example.status !== "deprecated" && (example.ruleIds?.some((id) => affected.has(id)) || references([example.input, example.expected], /* @__PURE__ */ new Set([target.id, target.semanticRole]), target.semanticRole))).map((e) => e.id);
  const proposed = { ...manual, targets: manual.targets.map((t) => t.id === targetId ? plan.after : t) };
  const compiled = compileManualSource(proposed, variantEvidence).contract;
  if (variantEvidence) {
    const availability = variantAvailability(snapshot, compiled);
    if (availability.targets[target.semanticRole]?.state !== "present") plan.blockers.push(`\u041D\u043E\u0432\u0430\u044F \u0446\u0435\u043B\u044C \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430 Athena \u0438 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u044B\u043C \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u043C (${availability.reason}). \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0438\u0441\u0445\u043E\u0434\u043D\u044B\u0435 \u0444\u0430\u043A\u0442\u044B; \u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043F\u0435\u0440\u0435\u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0443 \u0434\u043B\u044F \u043E\u0431\u0445\u043E\u0434\u0430 drift \u0438\u043B\u0438 instance swap.`);
  } else {
    const resolution = resolveSnapshotTargets(snapshot, compiled).targets.find((t) => t.targetId === targetId);
    if (resolution?.resolution !== "resolved") plan.blockers.push(`\u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043D\u0435 \u0434\u043E\u043A\u0430\u0437\u0430\u043D\u0430: ${targetResolutionReason(resolution?.reason || "topology-incomplete-or-ambiguous")}.`);
  }
  const prepared = prepareValidationSnapshot(snapshot, compiled);
  const candidate = prepared.nodes.find((n) => n.id === nodeId);
  for (const rule of manual.rules.filter((rule2) => affected.has(rule2.id))) {
    if (rule.targetId === targetId) {
      const deferred = ["delegated", "context-only", "policy-only"].includes(rule.execution?.route || "");
      if (deferred) plan.warnings.push(`${rule.id}: \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u043E\u0442\u043B\u043E\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u0430 (${rule.execution.route}) \u043D\u0435 \u0434\u043E\u043A\u0430\u0437\u0430\u043D\u0430 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438; \u043C\u0430\u0440\u0448\u0440\u0443\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F, \u043D\u0443\u0436\u0435\u043D review \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0430.`);
      for (const fact2 of deferred ? [] : requiredFacts(rule)) {
        const available = hasFact(candidate, fact2);
        plan.capabilities.push({ ruleId: rule.id, path: fact2, available });
        if (!available) plan.blockers.push(`${rule.id}: \u0443 \u043D\u043E\u0432\u043E\u0433\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u0430 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E ${fact2}.`);
      }
      for (const control of deferred ? [] : rule.controlPaths) {
        if (control.kind === "host-property" && control.property && !hasFact(root2, `component.properties.${control.property}`)) plan.blockers.push(`${rule.id}: \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0435\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E host \xAB${control.property}\xBB \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E.`);
        if (control.kind === "nested-property") plan.warnings.push(`${rule.id}: \u0441\u0432\u044F\u0437\u044C \u0441 nested property \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C; \u043E\u043D\u0430 \u043D\u0435 \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438.`);
      }
    }
    for (const constraint of rule.constraints) {
      for (const subject of constraint.dependency?.subjects || []) {
        const boundPaths = [...paths.values()].map((p) => occurrenceMode ? correspondingPath(comparison, p) : p);
        if (subject.targetRole === target.semanticRole && !boundPaths.includes([path, subject.relativePath].filter(Boolean).join(" / "))) {
          plan.blockers.push(`${rule.id}: \u043D\u043E\u0432\u044B\u0439 \u043E\u0431\u044A\u0435\u043A\u0442 \u043D\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 declared dependency path \xAB${subject.relativePath}\xBB.`);
        }
      }
    }
  }
  if (plan.affectedRules.some((rule) => ["self-and-descendants", "descendants"].includes(manual.rules.find((r) => r.id === rule.id)?.targetScope || "self"))) plan.warnings.push("\u041E\u0445\u0432\u0430\u0442 \u043F\u0440\u0430\u0432\u0438\u043B \u0441 \u043F\u043E\u0442\u043E\u043C\u043A\u0430\u043C\u0438 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u0441\u044F; \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0432\u0435\u0441\u044C \u043D\u043E\u0432\u044B\u0439 subtree. \u0414\u0440\u0443\u0433\u0438\u0435 semantic targets \u043D\u0435 \u043F\u0435\u0440\u0435\u043C\u0435\u0449\u0430\u044E\u0442\u0441\u044F \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u044D\u0442\u043E\u0439 \u0446\u0435\u043B\u044C\u044E.");
  plan.warnings.push("\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u0430 \u0441\u043E\u0432\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C \u0441 \u0442\u0435\u043A\u0443\u0449\u0438\u043C \u0441\u043D\u0438\u043C\u043A\u043E\u043C. \u0412\u0441\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B \u0438 modes \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0433\u043E review; Product, conditions, severity, constraints \u0438 control paths \u043D\u0435 \u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F.");
  return finish2();
}
function applyTargetRemap(input, expectedPlanHash, confirmed, updatedAt = (/* @__PURE__ */ new Date()).toISOString()) {
  if (!confirmed) throw new Error("\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0438 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u044B\u0439 review \u0437\u0430\u0442\u0440\u043E\u043D\u0443\u0442\u044B\u0445 \u043F\u0440\u0430\u0432\u0438\u043B.");
  const plan = planTargetRemap(input);
  if (plan.planHash !== expectedPlanHash) throw new Error("\u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442, \u0441\u043D\u0438\u043C\u043E\u043A \u0438\u043B\u0438 Athena facts \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0438\u0441\u044C. \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043D\u043E\u0432\u043E\u0435 \u0441\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u043F\u0435\u0440\u0435\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435\u043C.");
  if (!plan.canApply || !plan.after) throw new Error(plan.blockers.join(" ") || "\u041F\u0435\u0440\u0435\u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430.");
  if (!Number.isFinite(Date.parse(updatedAt))) throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0430\u044F \u0434\u0430\u0442\u0430 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F.");
  const next = clone4(input.manual);
  next.targets = next.targets.map((target) => target.id === input.targetId ? clone4(plan.after) : target);
  const affected = new Set(plan.affectedRules.map((rule) => rule.id));
  next.rules = next.rules.map((rule) => affected.has(rule.id) ? { ...rule, status: "draft" } : rule);
  next.examples = next.examples.map((example) => plan.affectedExamples.includes(example.id) ? { ...example, status: "draft" } : example);
  next.metadata.revision += 1;
  next.metadata.updatedAt = updatedAt;
  return next;
}

// ../Apollo/packages/component-contract-core/src/variant-target-edit.ts
function editVariantTextTargets(manual, entries) {
  const next = JSON.parse(JSON.stringify(manual));
  if (!Array.isArray(entries) || entries.some((e) => !e || typeof e.targetId !== "string" || typeof e.anchorTargetId !== "string") || new Set(entries.map((e) => e.targetId)).size !== entries.length || entries.some((e) => next.targets.filter((t) => t.id === e.targetId).length !== 1)) throw new Error("\u0422\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0435 \u0441\u0432\u044F\u0437\u0438: \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 targetId \u0438 anchorTargetId.");
  const changed = [];
  for (const target of next.targets) {
    const before = stableHash(target.variantContinuity || null), entry = entries.find((e) => e.targetId === target.id);
    if (entry) target.variantContinuity = { kind: "same-family-text", anchorTargetId: entry.anchorTargetId };
    else delete target.variantContinuity;
    if (before !== stableHash(target.variantContinuity || null)) changed.push(target.semanticRole);
  }
  const errors = validateManualSource(next).filter((i) => i.code === "TARGET_VARIANT_CONTINUITY");
  if (errors.length) throw new Error(errors.map((e) => e.message).join("\n"));
  for (const rule of next.rules) if (rule.status !== "deprecated" && (next.targets.some((t) => t.id === rule.targetId && changed.includes(t.semanticRole)) || rule.constraints.some((c) => c.targetRoles?.some((r) => changed.includes(r)) || c.targetRole && changed.includes(c.targetRole)))) rule.status = "draft";
  return next;
}

// ../Apollo/packages/component-contract-core/src/owned-code-collection.ts
var rec = (v) => v && typeof v === "object" ? v : {};
function fail(reason) {
  throw new Error("OWNED_CODE_COLLECTION_UNPROVEN: " + reason);
}
function projectOwnedCodeCollection(contract, input, representationId) {
  const shape = contractRepresentationShape(contract), flags = representationFeatureFlags(shape);
  if (!flags.bindings || contract.runtimePolicy.crossRepresentationBindingsVersion !== flags.bindingVersion || representationEvidenceErrors(shape).length) fail("schema");
  const declarations = contract.facts.semanticApi.flatMap((api) => api.bindings.filter((b) => b.representationId === representationId && b.ownedOccurrence).map((binding) => ({ api, binding })));
  if (!declarations.length) fail("missing declarations");
  const snapshot = prepareValidationSnapshot(input, contract), items = /* @__PURE__ */ new Map();
  let ownerId;
  for (const { binding } of declarations) {
    const o = binding.ownedOccurrence, dependency = contract.componentDependencies?.find((d) => d.id === o.dependencyId), direct = dependency?.bindings.find((b) => b.id === o.dependencyBindingId);
    if (!dependency || dependencyPinIssue(dependency, dependency.contract) || direct?.kind !== "direct-child") fail("exact dependency");
    const r = resolveDirectChildBinding(snapshot, dependency, direct, contract);
    if (!r.identityValid || !r.node || r.status !== "active" && !(r.status === "inactive" && r.reason === "target-hidden")) fail(r.reason);
    const node = rec(r.node), id = String(node.id);
    if (ownerId !== void 0 && node.parentId !== ownerId) fail("multiple owners");
    ownerId = String(node.parentId);
    const item = items.get(id) || { node, bindings: [] };
    item.bindings.push(binding);
    items.set(id, item);
  }
  const owner = snapshot.nodes.find((n) => n.id === ownerId), children = rec(owner).childIds;
  if (!Array.isArray(children) || new Set(children).size !== children.length || Array.from(items.keys()).some((id) => !children.includes(id))) fail("native order");
  if (snapshot.nodes.some((n) => n.parentId === ownerId && n.type === "INSTANCE" && !items.has(String(n.id)))) fail("unmapped native child");
  const visible2 = children.filter((id) => items.has(id) && rec(items.get(id).node.visibility).effective === true);
  const elements = [];
  let primaryFirst;
  for (const [index, id] of visible2.entries()) {
    const { node, bindings } = items.get(id);
    const element = { targetId: bindings[0].targetId, instanceId: id, sourceNodeId: rec(rec(node.component).sourceIdentity).sourceNodeId, children: "" };
    let labelCount = 0;
    for (const binding of bindings) {
      const o = binding.ownedOccurrence, source = o.sourceProperty, c = rec(node.component), resolved = resolveComponentProperty(source.property, c, [source.propertyType]);
      if (!("name" in resolved) || (node.unknownFacts || []).some((p) => p === "component" || p === "component.properties" || p === "component.propertyTypes" || p === "component.properties." + resolved.name || p === "component.propertyTypes." + resolved.name)) fail("typed property capture");
      const value = rec(c.properties)[resolved.name];
      if (o.transformId === "owned-button-label.v1") {
        if (typeof value !== "string") fail("label");
        element.children = value;
        labelCount++;
      }
      if (o.transformId === "owned-button-disabled.v1") {
        if (!["False", "True"].includes(value)) fail("disabled");
        element.disabled = value === "True";
      }
      if (o.transformId === "owned-button-primary-first.v1") {
        if (!["Primary", "Secondary"].includes(value) || index > 0 && value !== "Secondary") fail("view profile");
        if (index === 0) primaryFirst = value === "Primary";
      }
    }
    if (labelCount !== 1) fail("one label binding per visible occurrence");
    elements.push(element);
  }
  return { elements, primaryFirst, evidenceHash: stableHash({ contract: stableHash(contract), snapshot, representationId }) };
}

// src/version.ts
var EDITOR_VERSION = "component-contract-editor@0.2.108";

// src/core/validation-export.ts
function buildValidationReportDownload(input) {
  const { manual, compiled, evaluatedContract, anatomy, engineResult, result } = input;
  const snapshot = prepareValidationSnapshot(input.snapshot, evaluatedContract);
  const engineSnapshotHash = validationSnapshotHash(snapshot, evaluatedContract);
  if (engineResult.snapshotHash !== engineSnapshotHash) {
    throw new Error("\u0421\u043D\u0438\u043C\u043E\u043A \u043E\u0442\u0447\u0451\u0442\u0430 \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0435\u0442 \u0441\u043E \u0441\u043D\u0438\u043C\u043A\u043E\u043C \u0434\u0432\u0438\u0436\u043A\u0430. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443.");
  }
  const manualHash = stableHash(manual);
  if (compiled.contract.package.manualSourceHash !== manualHash || evaluatedContract.package.manualSourceHash !== manualHash) {
    throw new Error("\u041D\u0435\u043B\u044C\u0437\u044F \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043E\u0442\u0447\u0451\u0442: \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \u0438 manual source \u043E\u0442\u043D\u043E\u0441\u044F\u0442\u0441\u044F \u043A \u0440\u0430\u0437\u043D\u044B\u043C \u0440\u0435\u0432\u0438\u0437\u0438\u044F\u043C. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443.");
  }
  const generatedAt = input.generatedAt || (/* @__PURE__ */ new Date()).toISOString();
  const classifications = {};
  result.evaluations.forEach((entry) => {
    const key2 = String(entry.classification || "unknown");
    classifications[key2] = (classifications[key2] || 0) + 1;
  });
  const activatedDraftRuleIds = compiled.contract.rules.filter((rule) => rule.authority?.status === "draft" && evaluatedContract.rules.find((entry) => entry.ruleId === rule.ruleId)?.authority?.status === "active").map((rule) => rule.ruleId);
  const report = {
    schemaVersion: "apollo.editor-validation-report.v1",
    documentType: "component-contract-validation-report",
    generatedAt,
    editorVersion: EDITOR_VERSION,
    component: manual.component,
    run: {
      trigger: input.trigger,
      capture: input.capture,
      snapshotCapturedAt: snapshot.generatedAt,
      context: snapshot.context,
      manualRevision: manual.metadata.revision,
      manualSourceHash: manualHash,
      snapshotHash: stableHash(snapshot),
      engineSnapshotHash,
      snapshotEncoding: "json-canonical-v1",
      evaluatedContractHash: stableHash(evaluatedContract)
    },
    summary: {
      ...result.editorCoverage,
      coverageModel: "contract-and-scenario-v1",
      contractReadiness: result.contractReadiness,
      scenarioCoverage: result.scenarioCoverage,
      ...result.ownershipCoverage ? { ownershipCoverage: result.ownershipCoverage } : {},
      classifications,
      sourceRules: manual.rules.length,
      compiledChecks: compiled.contract.rules.length,
      capturedNodes: snapshot.nodes.length,
      compilerCoverage: compiled.contract.coverage,
      ...snapshot.source?.nativeSlotCaptureScope ? { captureScope: { kind: "component-owned-with-external-native-slots", externalContentsChecked: false, omissions: snapshot.source.nativeSlotCaptureScope.omissions } } : {}
    },
    sources: { manual, compiledContract: compiled.contract, compilerIssues: compiled.issues },
    runtime: { evaluatedContract, activatedDraftRuleIds },
    snapshot,
    // Snapshot already carries observed properties. Keep only diagnostic target locators here.
    anatomy: anatomy.map(({ properties: _properties, ...locator }) => locator),
    results: {
      engine: engineResult,
      editor: result,
      details: buildEvaluationDetails(result, evaluatedContract, anatomy)
    },
    privacy: {
      containsLayerTextAndProperties: true,
      containsManualSource: true,
      includesPreviewImage: false,
      automaticallyUploaded: false
    }
  };
  return {
    fileName: `${slug(manual.component.family)}.validation-report.${generatedAt.replace(/[^0-9TZ-]/g, "-")}.json`,
    json: JSON.stringify(report, null, 2)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CAPABILITY_SETS,
  CAPABILITY_SET_LABELS,
  COMPILED_SCHEMA_VERSION,
  COMPONENT_DEPENDENCY_CAPTURE_LIMIT,
  COMPONENT_DEPENDENCY_DEPTH_LIMIT,
  DECLARED_TARGET_IDENTITY_SCHEMA,
  DECLARED_TARGET_IDENTITY_VERSION,
  DEPENDENCY_USAGE_PREFIX,
  DIRECT_CHILD_DEPENDENCY_CAPTURE_LIMIT,
  EDITOR_SESSION_SCHEMA_VERSION,
  INSTANCE_CONTENT_REFERENCE_LIMIT,
  LEGACY_MANUAL_SCHEMA_VERSION,
  MANUAL_SCHEMA_VERSION,
  PRODUCT_SCOPE_CATALOG,
  PROPERTY_APPLICABILITY,
  PROTECTED_INTERNAL_CAPABILITY_SETS,
  RULE_OWNERSHIP_KINDS,
  TARGET_RESOLUTION_SCHEMA,
  allowPublicComponentProperties,
  allowedComponentPropertyNames,
  applyCodeTransform,
  applyProtectInternalsPolicy,
  applyTargetRemap,
  assertDeclaredTargetContract,
  assertNativeInstanceReplacementPolicy,
  assertNativeRuleFactPolicies,
  baselineFactsForRule,
  bindDeclaredTargetRuleSelectors,
  bindingConsistencyKey,
  buildAuthoringZip,
  buildContractReadiness,
  buildEditorValidationReport,
  buildEvaluationDetails,
  buildExportBundle,
  buildOwnershipCoverage,
  buildOwnershipReadiness,
  buildValidationReportDownload,
  capabilitiesForSet,
  capabilitySetLabel,
  captureEffectDetails,
  captureGradientPaintDetails,
  captureHostVariableUsage,
  captureInstanceSourceIdentities,
  capturePropertyActivity,
  captureResolvedVariableModes,
  captureSceneTopology,
  captureSupplementalFacts,
  captureTextDecoration,
  captureTextFillEvidence,
  captureTextStyleEvidence,
  captureTransitionContext,
  captureVariantReference,
  catalogOccurrencePaths,
  collectionPropertyMatches,
  compareInstanceBoundaries,
  compileApplicabilityProbe,
  compileManualSource,
  componentDependencyKeys,
  componentPropertyName,
  configurationDeclaredTargetReferenceHash,
  configureInstanceMainAliases,
  confirmedNativeSlotCaptureBoundaries,
  contractRepresentationShape,
  correspondingPath,
  createEditorSession,
  createValidationIntent,
  createWorkspaceFromPreview,
  createZip,
  declaredRootAliasRoles,
  declaredTargetIdentityErrors,
  declaredTargetMembershipKey,
  dependencyBinding,
  dependencyCaptureFailureDetails,
  dependencyCaptureFailureLabel,
  dependencyPinIssue,
  dependencyUsageErrors,
  diagnoseRuleApplicability,
  diagnosticStructure,
  editVariantTextTargets,
  effectiveFacts,
  evaluateCompiledContract,
  extractAssetCatalogs,
  extractTextStyleCatalogs,
  extractVariantEvidence,
  factForCapability,
  forbiddenConstraintsForEdit,
  gradientPaintIssues,
  groupEvaluationDetails,
  hostContextFacts,
  importWorkspace,
  inspectRuleFacts,
  intrinsicBounds,
  isDeclaredRootTarget,
  isolateInstanceBoundaries,
  linkComponentDependencies,
  manualRepresentationShape,
  matchesCaptureRepresentation,
  matchesComponentIdentity,
  matchesDeclaredTarget,
  matchesTargetRole,
  materializeDeclaredTargetIdentities,
  materializeDependencyFacts,
  materializeEffectiveBaseline,
  materializeGradientPaintEvidence,
  materializeInstanceContentReferences,
  materializeLineHeightReferences,
  materializeMemberCollections,
  materializeNativeTargetProperties,
  materializeNestedInstanceContentReferences,
  materializeSemanticFacts,
  materializeTargetResolution,
  materializeTextBindingIdentities,
  materializeTextContent,
  materializeTextStyleBindings,
  materializeTransitionFacts,
  materializeValidationIntent,
  materializeValidationMode,
  materializeVariantFacts,
  materializeVerifiedVariantTargets,
  memberCollectionErrors,
  memberCollectionSummary,
  mergeEditedApplicability,
  nativeSlotCapturePlan,
  occurrenceSegment,
  paintDiagnosticSummary,
  parseAssetCatalogs,
  parseEditorSession,
  planInstanceContentReferences,
  planNestedInstanceContentReferences,
  planTargetRemap,
  portableDeclaredTargetReferenceHash,
  prepareAuthoringPreviewContract,
  prepareValidationSnapshot,
  projectOwnedCodeCollection,
  propertyApplicabilityCondition,
  propertyAvailabilityKey,
  provenHiddenRuleTarget,
  publicSwapDeclaredTargetReferenceHash,
  readZip,
  relativeTargetPath,
  representationEvidenceErrors,
  representationFeatureFlags,
  representationScopeHash,
  resolveCaptureRepresentation,
  resolveComponentProperty,
  resolveDirectChildBinding,
  resolveFixedNestedBinding,
  resolveSnapshotTargets,
  restoreInstanceMainAliasBaseline,
  ruleOwnershipGroup,
  safeEvidencePath,
  sameManualComponentFamily,
  samePreviewComponent,
  selectedTargetPathHint,
  sharedUsageContract,
  slug,
  snapshotPaths,
  snapshotShape,
  stableHash,
  stableStringify,
  supportedSemanticBinding,
  targetResolutionReason,
  textStyleBindingFact,
  textZipEntry,
  transitionReason,
  typedCollectionValue,
  uniqueSorted,
  validRuleOwnership,
  validTextStyleCatalog,
  validateComponentDependencies,
  validateManualSource,
  validateNativeSlotCaptureScope,
  validateRuleEdit,
  validatedDependencyCapture,
  validationInputs,
  validationIssueLabel,
  validationMode,
  validationSnapshotHash,
  variantAvailability,
  verifyProjectionStamp,
  withinBoundary,
  zipEntryText
});
