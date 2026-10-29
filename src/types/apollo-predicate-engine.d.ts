declare module "../../../../services/apollo-proxy/src/predicate-engine/index.js" {
  export type PredicateResult = {
    schemaVersion: "apollo.predicate-result.v1";
    snapshotHash: string;
    ruleRelease: string;
    evaluations: Array<Record<string, unknown>>;
    coverage: Record<string, unknown>;
  };

  export function evaluateRules(input: {
    snapshot: Record<string, unknown>;
    rules: Array<Record<string, unknown>>;
    ruleRelease?: string;
  }): PredicateResult;
}
